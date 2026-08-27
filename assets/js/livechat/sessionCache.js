/**
 * ============================================================================
 * SessionCache.js - Safe sessionStorage Lifecycle Management
 * ============================================================================
 * 
 * Handles session restoration with validation:
 * - Validates session data before restore
 * - Prevents cross-agent state leaks
 * - Implements TTL-based invalidation
 * - Always fetches from server after restore (server is source of truth)
 * - Integrates with unified pipeline (handleIncoming)
 * 
 * CRITICAL RULE: sessionStorage is a CACHE only, not source of truth
 */
class SessionCache {
  constructor() {
    // Configuration
    this.CONFIG = {
      CACHE_KEY: 'livechat_session_state',
      TTL_MS: 5 * 60 * 1000, // 5 minutes
      VERSION: 1
    };
  }
  /**
   * Get cache key for specific conversation
   */
  _getCacheKey(conversationId) {
    return `${this.CONFIG.CACHE_KEY}_${conversationId}`;
  }
  /**
   * Save session state to sessionStorage
   * Called after successful fetch/merge
   * 
   * @param {string} conversationId - Room/conversation ID
   * @param {string} userId - Current user ID
   * @param {Array} messages - Messages to cache
   * @param {string} userType - "user" or "admin"
   */
  saveSession(conversationId, userId, messages, userType) {
    if (!conversationId || !userId || !messages) {
      return false;
    }
    try {
      const cacheKey = this._getCacheKey(conversationId);
      const cacheData = {
        conversationId,
        userId,
        userType,
        messages: messages.map(m => ({
          id: m.id,
          clientId: m.clientId,
          sender: m.sender,
          message: m.message,
          createdAt: m.createdAt,
          status: m.status
        })),
        timestamp: Date.now(),
        version: this.CONFIG.VERSION
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      void('[CACHE-SAVE-ERROR]', {
        error: error.message,
        conversationId
      });
      return false;
    }
  }
  /**
   * Try to restore session state from sessionStorage
   * With strict validation to prevent cross-agent contamination
   * 
   * @param {string} conversationId - Current room ID
   * @param {string} userId - Current user ID
   * @param {string} userType - "user" or "admin"
   * @returns {Object|null} Validated cache data or null if invalid
   */
  tryRestore(conversationId, userId, userType) {
    if (!conversationId || !userId) {
      return null;
    }
    try {
      const cacheKey = this._getCacheKey(conversationId);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) {
        return null;
      }
      const cacheData = JSON.parse(cached);
      // VALIDATION 1: Check version
      if (cacheData.version !== this.CONFIG.VERSION) {
        this.clearSession(conversationId);
        return null;
      }
      // VALIDATION 2: Check TTL
      const age = Date.now() - cacheData.timestamp;
      if (age > this.CONFIG.TTL_MS) {
        this.clearSession(conversationId);
        return null;
      }
      // VALIDATION 3: Check conversationId match (prevent cross-conversation contamination)
      if (cacheData.conversationId !== conversationId) {
        this.clearSession(conversationId);
        return null;
      }
      // VALIDATION 4: Check userId match (prevent cross-user contamination)
      if (cacheData.userId !== userId) {
        this.clearSession(conversationId);
        return null;
      }
      // VALIDATION 5: Check userType match (prevent cross-agent contamination)
      if (cacheData.userType && cacheData.userType !== userType) {
        this.clearSession(conversationId);
        return null;
      }
      // All validations passed
      return cacheData;
    } catch (error) {
      void('[CACHE-RESTORE-ERROR]', {
        error: error.message,
        conversationId
      });
      return null;
    }
  }
  /**
   * Clear session cache for specific conversation
   * Called when:
   * - User/agent switches
   * - Conversation changes
   * - Data inconsistency detected
   * - Session expires
   */
  clearSession(conversationId) {
    if (!conversationId) {
      return;
    }
    try {
      const cacheKey = this._getCacheKey(conversationId);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      void('[CACHE-CLEAR-ERROR]', {
        error: error.message,
        conversationId
      });
      return false;
    }
  }
  /**
   * Clear all session caches
   * Called on logout or critical state change
   */
  clearAllSessions() {
    try {
      const keys = Object.keys(localStorage);
      const cachePrefix = this.CONFIG.CACHE_KEY;
      keys.forEach(key => {
        if (key.startsWith(cachePrefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      void('[CACHE-CLEAR-ALL-ERROR]', {
        error: error.message
      });
      return false;
    }
  }
  /**
   * Check if data divergence exists
   * Prevents using inconsistent cache
   * 
   * @param {Array} cachedMessages - Messages from cache
   * @param {Array} serverMessages - Messages from server
   * @returns {boolean} True if divergence detected
   */
  hasDataDivergence(cachedMessages, serverMessages) {
    if (!cachedMessages || !serverMessages) {
      return false;
    }
    // Build ID sets
    const cachedIds = new Set(cachedMessages.map(m => m.id));
    const serverIds = new Set(serverMessages.map(m => m.id));
    // Check if cache has messages not on server
    for (const id of cachedIds) {
      if (!serverIds.has(id)) {
        return true;
      }
    }
    // Check if server has messages not in cache (acceptable - fetch adds new messages)
    // but extreme differences suggest divergence
    const diff = serverIds.size - cachedIds.size;
    if (diff > 100) {
      return true;
    }
    return false;
  }
  /**
   * Get cache stats for debugging
   */
  getStats() {
    try {
      const keys = Object.keys(localStorage);
      const cachePrefix = this.CONFIG.CACHE_KEY;
      let totalSize = 0;
      let cacheCount = 0;
      keys.forEach(key => {
        if (key.startsWith(cachePrefix)) {
          const data = localStorage.getItem(key);
          totalSize += data ? data.length : 0;
          cacheCount++;
        }
      });
      return {
        cachedConversations: cacheCount,
        totalSizeBytes: totalSize,
        ttlMs: this.CONFIG.TTL_MS
      };
    } catch (error) {
      return null;
    }
  }
}
// Create singleton instance
const sessionCache = new SessionCache();