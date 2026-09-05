class MessageStore {
  constructor(messageRenderer = null) {
    this.messagesById = new Map();
    this.messagesByClientId = new Map();
    this.messageIdOrder = [];
    this.lastSyncTime = null;
    this.isSyncing = false;
    this.messageRenderer = messageRenderer;
    this.subscribers = {
      messageAdded: [],
      messageUpdated: []
    };
  }
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
          console.log(`Error in subscriber for ${event}:`, e);
        }
      });
    }
  }
  upsertMessage(message) {
    if (!message) {
      console.log("Cannot upsert null message");
      return null;
    }
    if (!message.id && !message.clientId) {
      console.log("Button upsert: no id or clientId");
      return null;
    }
    const serverId = message.id;
    const clientId = message.clientId;
    if (serverId && this.messagesById.has(serverId)) {
      const existing = this.messagesById.get(serverId);
      const merged = this._mergeMessages(existing, message);
      this.messagesById.set(serverId, merged);
      if (clientId && this.messagesByClientId.has(clientId)) {
        this.messagesByClientId.delete(clientId);
      }
      this._emit("messageUpdated", {
        old: existing,
        new: merged
      });
      return merged;
    }
    if (clientId && this.messagesByClientId.has(clientId)) {
      const optimistic = this.messagesByClientId.get(clientId);
      if (serverId && serverId !== clientId) {
        const oldId = optimistic.id;
        this.messagesById.delete(optimistic.id);
        const upgraded = {
          ...optimistic,
          ...message,
          id: serverId
        };
        this.messagesById.set(serverId, upgraded);
        this.messagesByClientId.delete(clientId);
        const orderIndex = this.messageIdOrder.indexOf(optimistic.id);
        if (orderIndex >= 0) {
          this.messageIdOrder[orderIndex] = serverId;
        }
        if (this.messageRenderer) {
          if (this.messageRenderer.renderedIds && this.messageRenderer.renderedIds.has(oldId)) {
            this.messageRenderer.renderedIds.delete(oldId);
            this.messageRenderer.renderedIds.add(serverId);
          }
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
    const normalizedMsg = this._normalizeMessage(message);
    const msgId = normalizedMsg.id;
    if (this.messagesById.has(msgId)) {
      const existing = this.messagesById.get(msgId);
      const merged = this._mergeMessages(existing, normalizedMsg);
      this.messagesById.set(msgId, merged);
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
    this._insertInOrder(normalizedMsg);
    this._emit("messageAdded", normalizedMsg);
    return normalizedMsg;
  }
  getSortedMessages() {
    return this.messageIdOrder.map(id => this.messagesById.get(id)).filter(m => m).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  }
  handleIncoming(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }
    messages.forEach(msg => this.upsertMessage(msg));
  }
  updateMessage(messageId, updates) {
    const message = this.messagesById.get(messageId);
    if (!message) {
      return false;
    }
    const before = JSON.parse(JSON.stringify(message));
    let changed = false;
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
  getAllMessages() {
    return this.messageIdOrder.map(id => this.messagesById.get(id)).filter(m => m);
  }
  getLastSyncTime() {
    return this.lastSyncTime;
  }
  setLastSyncTime(timestamp) {
    const newTime = new Date(timestamp).toISOString();
    if (!this.lastSyncTime || newTime > this.lastSyncTime) {
      this.lastSyncTime = newTime;
      return true;
    }
    return false;
  }
  setSyncing(isSyncing) {
    this.isSyncing = isSyncing;
  }
  getIsSyncing() {
    return this.isSyncing;
  }
  _normalizeMessage(message) {
    return {
      id: message.id,
      roomId: message.roomId,
      sender: message.sender,
      message: message.message,
      attachment: message.attachment || null,
      clientId: message.clientId || null,
      createdAt: message.createdAt || new Date().toISOString(),
      status: message.status || "sent",
      agent: message.agent || "",
      time: message.time || this._formatTime(new Date(message.createdAt || Date.now()))
    };
  }
  _mergeMessages(optimistic, server) {
    return {
      ...optimistic,
      ...server,
      id: server.id || optimistic.id,
      createdAt: server.createdAt || optimistic.createdAt,
      status: server.status || optimistic.status
    };
  }
  _insertInOrder(message) {
    const msgId = message.id;
    if (this.messageIdOrder.includes(msgId)) {
      return;
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
  _formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  clear() {
    this.messagesById.clear();
    this.messagesByClientId.clear();
    this.messageIdOrder = [];
    this.lastSyncTime = null;
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageStore;
}