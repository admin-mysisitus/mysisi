/**
 * ============================================================================
 * MessageStore.js - Single Source of Truth for Messages
 * ============================================================================
 * 
 * Manages in-memory message state with:
 * - Deduplication by ID and clientId
 * - Data deduplication
 * - Optimistic UI updates
 * - Message lifecycle tracking
 * - Event-based updates for reactive components
 * 
 * NO DOM OPERATIONS - purely state management
 */
class MessageStore {
  constructor(messageRenderer = null) {
    // Primary index: messageId → Message
    this.messagesById = new Map();
    // Secondary index: clientId → Message (optimistic messages)
    this.messagesByClientId = new Map();
    // Ordered list of message IDs (for iteration)
    this.messageIdOrder = [];
    // Sync state
    this.lastSyncTime = null;
    this.isSyncing = false;
    // Renderer reference (for updating renderedIds on ID changes)
    this.messageRenderer = messageRenderer;
    // Event subscribers
    this.subscribers = {
      messageAdded: [], // Used for notifications in admin.js
      messageUpdated: [] // Used for status updates in user.js/admin.js
    };
  }
  // ========================================
  // EVENT SYSTEM
  // ========================================
  subscribe(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(callback);
    }
  }
  unsubscribe(event, callback) {
    if (this.subscribers[event]) {
      const index = this.subscribers[event].indexOf(callback);
      if (index > -1) {
        this.subscribers[event].splice(index, 1);
      }
    }
  }
  _emit(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          void(`Error in subscriber for ${event}:`, e);
        }
      });
    }
  }
  // ========================================
  // MESSAGE MANAGEMENT - STRICT SINGLE ENTRY POINT
  // ========================================
  /**
   * CRITICAL: ONLY function that modifies message store
   * All sources (polling, send response, optimistic) must call this
   * 
   * Handles:
   * - clientId → serverId linkage (upsert semantics)
   * - Duplicate prevention
   * - Ordering maintenance
   * 
   * @param {Object} message - Message object {id, clientId, createdAt, ...}
   * @returns {Object} The message (either new or updated)
   */
  upsertMessage(message) {
    if (!message) {
      void("Cannot upsert null message");
      return null;
    }
    // Must have at least one ID
    if (!message.id && !message.clientId) {
      void("Button upsert: no id or clientId");
      return null;
    }
    const serverId = message.id;
    const clientId = message.clientId;
    // STEP 1: Check if message already exists by serverId
    if (serverId && this.messagesById.has(serverId)) {
      const existing = this.messagesById.get(serverId);
      const merged = this._mergeMessages(existing, message);
      this.messagesById.set(serverId, merged);
      // Clean up clientId mapping if resolving optimistic
      if (clientId && this.messagesByClientId.has(clientId)) {
        this.messagesByClientId.delete(clientId);
      }
      this._emit("messageUpdated", {
        old: existing,
        new: merged
      });
      return merged;
    }
    // STEP 2: Check if optimistic exists by clientId
    if (clientId && this.messagesByClientId.has(clientId)) {
      const optimistic = this.messagesByClientId.get(clientId);
      // If server provided a real ID, upgrade the message
      if (serverId && serverId !== clientId) {
        // Delete old entry with clientId
        const oldId = optimistic.id;
        this.messagesById.delete(optimistic.id);
        // Create new entry with serverId
        const upgraded = {
          ...optimistic,
          ...message,
          id: serverId
        };
        this.messagesById.set(serverId, upgraded);
        this.messagesByClientId.delete(clientId);
        // Update order
        const orderIndex = this.messageIdOrder.indexOf(optimistic.id);
        if (orderIndex >= 0) {
          this.messageIdOrder[orderIndex] = serverId;
        }
        // CRITICAL: Update renderer's tracking when message ID changes
        // Without this, renderer will try to render the same message twice (old ID + new ID)
        if (this.messageRenderer) {
          // Update renderedIds Set
          if (this.messageRenderer.renderedIds && this.messageRenderer.renderedIds.has(oldId)) {
            this.messageRenderer.renderedIds.delete(oldId);
            this.messageRenderer.renderedIds.add(serverId);
          }
          // Update elementCache Map
          if (this.messageRenderer.elementCache && this.messageRenderer.elementCache.has(oldId)) {
            const element = this.messageRenderer.elementCache.get(oldId);
            this.messageRenderer.elementCache.delete(oldId);
            this.messageRenderer.elementCache.set(serverId, element);
          }
        }
        this._emit("messageUpdated", {
          old: optimistic,
          new: upgraded
        });
        return upgraded;
      } else {
        // Just update metadata on existing optimistic
        const merged = this._mergeMessages(optimistic, message);
        this.messagesById.set(optimistic.id, merged);
        this.messagesByClientId.set(clientId, merged);
        this._emit("messageUpdated", {
          old: optimistic,
          new: merged
        });
        return merged;
      }
    }
    // STEP 3: New message (neither serverId nor clientId existed)
    const normalizedMsg = this._normalizeMessage(message);
    const msgId = normalizedMsg.id;
    // SAFETY CHECK: If message ID already exists in store, treat as update (CASE 1)
    // This prevents duplicates when polling/retry brings same message back
    if (this.messagesById.has(msgId)) {
      const existing = this.messagesById.get(msgId);
      const merged = this._mergeMessages(existing, normalizedMsg);
      this.messagesById.set(msgId, merged);
      // Clean up clientId mapping if resolving optimistic
      if (clientId && this.messagesByClientId.has(clientId)) {
        this.messagesByClientId.delete(clientId);
      }
      this._emit("messageUpdated", {
        old: existing,
        new: merged
      });
      return merged;
    }
    this.messagesById.set(msgId, normalizedMsg);
    if (clientId) {
      this.messagesByClientId.set(clientId, normalizedMsg);
    }
    // Insert in chronological order
    this._insertInOrder(normalizedMsg);
    this._emit("messageAdded", normalizedMsg);
    return normalizedMsg;
  }
  /**
   * Get all messages sorted by createdAt (SINGLE SORT FUNCTION)
   * NEVER sort elsewhere - always use this
   * @returns {Array} Messages in chronological order
   */
  getSortedMessages() {
    return this.messageIdOrder.map(id => this.messagesById.get(id)).filter(m => m).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  }
  /**
   * Unified ingress for all message sources
   * Call this from:
   * - polling (syncEngine)
   * - send response (sendQueue)
   * - optimistic message (user.js / admin.js)
   * 
   * @param {Array} messages - Message objects to upsert
   */
  handleIncoming(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }
    messages.forEach(msg => this.upsertMessage(msg));
  }
  /**
   * Update existing message
   * 
   * @param {string} messageId - Message ID
   * @param {Object} updates - Partial updates
   * @returns {boolean} Whether update was applied
   */
  updateMessage(messageId, updates) {
    const message = this.messagesById.get(messageId);
    if (!message) {
      return false;
    }
    // Apply only monotonic updates
    const before = JSON.parse(JSON.stringify(message));
    let changed = false;
    // Status updates
    if (updates.status && updates.status !== message.status) {
      message.status = updates.status;
      changed = true;
    }
    if (changed) {
      this._emit("messageUpdated", {
        old: before,
        new: message
      });
    }
    return changed;
  }
  /**
   * Get all messages in order
   */
  getAllMessages() {
    return this.messageIdOrder.map(id => this.messagesById.get(id)).filter(m => m);
  }
  // ========================================
  // SYNC STATE MANAGEMENT
  // ========================================
  /**
   * Get last sync timestamp
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }
  /**
   * Update last sync timestamp
   */
  setLastSyncTime(timestamp) {
    const newTime = new Date(timestamp).toISOString();
    // Only update if newer (monotonic)
    if (!this.lastSyncTime || newTime > this.lastSyncTime) {
      this.lastSyncTime = newTime;
      return true;
    }
    return false;
  }
  /**
   * Set syncing state
   */
  setSyncing(isSyncing) {
    this.isSyncing = isSyncing;
  }
  /**
   * Check if currently syncing
   */
  getIsSyncing() {
    return this.isSyncing;
  }
  // ========================================
  // INTERNAL HELPERS
  // ========================================
  /**
   * Normalize message to ensure all fields exist
   */
  _normalizeMessage(message) {
    return {
      id: message.id,
      roomId: message.roomId,
      sender: message.sender, // "user" or "admin"
      message: message.message,
      attachment: message.attachment || null,
      clientId: message.clientId || null,
      createdAt: message.createdAt || new Date().toISOString(),
      status: message.status || "sent",
      agent: message.agent || "",
      time: message.time || this._formatTime(new Date(message.createdAt || Date.now()))
    };
  }
  /**
   * Merge server response with optimistic message
   */
  _mergeMessages(optimistic, server) {
    return {
      ...optimistic,
      ...server,
      id: server.id || optimistic.id,
      createdAt: server.createdAt || optimistic.createdAt,
      status: server.status || optimistic.status
    };
  }
  /**
   * Insert message in chronological order
   */
  _insertInOrder(message) {
    const msgId = message.id;
    // SAFETY CHECK: Prevent duplicate IDs in messageIdOrder
    // Can happen if message comes through multiple paths during retries/polling
    if (this.messageIdOrder.includes(msgId)) {
      return; // Already in order, skip
    }
    const createdMs = new Date(message.createdAt).getTime();
    let insertIndex = this.messageIdOrder.length;
    for (let i = 0; i < this.messageIdOrder.length; i++) {
      const other = this.messagesById.get(this.messageIdOrder[i]);
      const otherMs = new Date(other.createdAt).getTime();
      if (createdMs < otherMs) {
        insertIndex = i;
        break;
      }
    }
    this.messageIdOrder.splice(insertIndex, 0, message.id);
  }
  /**
   * Format time for display
   */
  _formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  /**
   * Clear all messages (for testing or chat reset)
   */
  clear() {
    this.messagesById.clear();
    this.messagesByClientId.clear();
    this.messageIdOrder = [];
    this.lastSyncTime = null;
  }
}
// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageStore;
}