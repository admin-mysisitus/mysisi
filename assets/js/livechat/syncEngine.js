class SyncEngine {
  constructor(messageStore, messageRenderer, config = {}) {
    this.messageStore = messageStore;
    this.messageRenderer = messageRenderer;
    this.sessionCache = config.sessionCache || null;
    this.roomId = null;
    this.userType = null;
    this.unsubscribeMessages = null;
    this.unsubscribeChanges = null;
    this.unsubscribeTyping = null;
    this.onTypingCallback = config.onTyping || null;
  }
  startSync(roomId, userType) {
    if (!roomId || !userType) return;
    this.stopSync();
    this.roomId = roomId;
    this.userType = userType;
    const db = window.firebaseDB;
    const {
      ref,
      onChildAdded,
      onChildChanged,
      get
    } = window.firebaseHelpers;
    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    this.unsubscribeMessages = onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val();
      if (!msg) return;
      this.messageStore.handleIncoming([msg]);
      this._scheduleRender();
      if (this.sessionCache) {
        const allMessages = this.messageStore.getSortedMessages();
        this.sessionCache.saveSession(this.roomId, new Date().toISOString(), allMessages, this.userType);
      }
    });
    this.unsubscribeChanges = onChildChanged(messagesRef, (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        this.messageStore.handleIncoming([msg]);
        this._scheduleRender();
      }
    });
    if (this.onTypingCallback) {
      const typingRef = ref(db, `rooms/${roomId}/typing/${userType === 'user' ? 'admin' : 'user'}`);
      const {
        onValue
      } = window.firebaseHelpers;
      this.unsubscribeTyping = onValue(typingRef, (snapshot) => {
        this.onTypingCallback(snapshot.val() || false);
      });
    }
  }
  stopSync() {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = null;
    }
    if (this.unsubscribeChanges) {
      this.unsubscribeChanges();
      this.unsubscribeChanges = null;
    }
    if (this.unsubscribeTyping) {
      this.unsubscribeTyping();
      this.unsubscribeTyping = null;
    }
  }
  async syncNow() {
    if (!this.roomId) return;
    const db = window.firebaseDB;
    const {
      ref,
      get
    } = window.firebaseHelpers;
    const snapshot = await get(ref(db, `rooms/${this.roomId}/messages`));
    if (snapshot.exists()) {
      const messagesObj = snapshot.val();
      const msgs = Object.values(messagesObj);
      this.messageStore.handleIncoming(msgs);
      this._scheduleRender();
    }
  }
  _scheduleRender() {
    if (!this.messageRenderer || !this.messageStore) return;
    const messages = this.messageStore.getSortedMessages();
    this.messageRenderer.renderMessages(messages, {
      type: this.userType
    });
  }
  getState() {
    return {
      roomId: this.roomId,
      userType: this.userType,
      isActive: true,
      lastSyncTime: this.messageStore.getLastSyncTime(),
      messageCount: this.messageStore.getMessageCount()
    };
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SyncEngine;
}