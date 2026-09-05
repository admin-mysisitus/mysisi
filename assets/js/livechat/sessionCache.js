class SessionCache {
  constructor() {
    this.CONFIG = {
      CACHE_KEY: 'livechat_session_state',
      TTL_MS: 5 * 60 * 1000,
      VERSION: 1
    };
  }
  _getCacheKey(conversationId) {
    return `${this.CONFIG.CACHE_KEY}_${conversationId}`;
  }
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
      console.log('[CACHE-SAVE-ERROR]', {
        error: error.message,
        conversationId
      });
      return false;
    }
  }
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
      if (cacheData.version !== this.CONFIG.VERSION) {
        this.clearSession(conversationId);
        return null;
      }
      const age = Date.now() - cacheData.timestamp;
      if (age > this.CONFIG.TTL_MS) {
        this.clearSession(conversationId);
        return null;
      }
      if (cacheData.conversationId !== conversationId) {
        this.clearSession(conversationId);
        return null;
      }
      if (cacheData.userId !== userId) {
        this.clearSession(conversationId);
        return null;
      }
      if (cacheData.userType && cacheData.userType !== userType) {
        this.clearSession(conversationId);
        return null;
      }
      return cacheData;
    } catch (error) {
      console.log('[CACHE-RESTORE-ERROR]', {
        error: error.message,
        conversationId
      });
      return null;
    }
  }
  clearSession(conversationId) {
    if (!conversationId) {
      return;
    }
    try {
      const cacheKey = this._getCacheKey(conversationId);
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.log('[CACHE-CLEAR-ERROR]', {
        error: error.message,
        conversationId
      });
      return false;
    }
  }
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
      console.log('[CACHE-CLEAR-ALL-ERROR]', {
        error: error.message
      });
      return false;
    }
  }
  hasDataDivergence(cachedMessages, serverMessages) {
    if (!cachedMessages || !serverMessages) {
      return false;
    }
    const cachedIds = new Set(cachedMessages.map(m => m.id));
    const serverIds = new Set(serverMessages.map(m => m.id));
    for (const id of cachedIds) {
      if (!serverIds.has(id)) {
        return true;
      }
    }
    const diff = serverIds.size - cachedIds.size;
    if (diff > 100) {
      return true;
    }
    return false;
  }
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
const sessionCache = new SessionCache();