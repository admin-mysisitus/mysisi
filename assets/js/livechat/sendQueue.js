/**
 * ============================================================================
 * SendQueue.js - Firebase Realtime Database Message Sender
 * ============================================================================
 */

class SendQueue {
  constructor(messageStore, config = {}) {
    this.messageStore = messageStore;
    this.onRender = config.onRender || null;
  }

  enqueue(messageData) {
    if (!messageData.roomId || (!messageData.text && !messageData.attachment)) {
      return null;
    }

    const clientId = `client-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();

    const optimisticMsg = {
      id: clientId,
      roomId: messageData.roomId,
      sender: messageData.sender || "user",
      message: messageData.text || "",
      attachment: messageData.attachment || null,
      clientId: clientId,
      createdAt: now,
      status: "sending",
      agent: messageData.agent || "",
      time: this._formatTime(new Date())
    };

    this.messageStore.upsertMessage(optimisticMsg);
    if (this.onRender) this.onRender();

    // Send to Firebase
    this._sendToFirebase(optimisticMsg);

    return optimisticMsg;
  }

  async _sendToFirebase(msg) {
    try {
      const db = window.firebaseDB;
      const { ref, push, update, serverTimestamp } = window.firebaseHelpers;

      const messagesRef = ref(db, `rooms/${msg.roomId}/messages`);
      const newMessageRef = push(messagesRef);

      const finalMessage = {
        id: newMessageRef.key,
        roomId: msg.roomId,
        sender: msg.sender,
        message: msg.message,
        attachment: msg.attachment,
        clientId: msg.clientId,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
        agent: msg.agent,
        status: "sent",
        time: msg.time
      };

      // Atomic update for both the message and the room metadata
      const updates = {};
      updates[`rooms/${msg.roomId}/messages/${newMessageRef.key}`] = finalMessage;
      updates[`rooms/${msg.roomId}/lastMessage`] = msg.attachment ? "[Attachment]" : msg.message;
      updates[`rooms/${msg.roomId}/lastSender`] = msg.sender;
      updates[`rooms/${msg.roomId}/timestamp`] = serverTimestamp();
      updates[`rooms/${msg.roomId}/id`] = msg.roomId; // Ensure ID exists for listing

      await update(ref(db), updates);

      // Update local store with final status and server-generated ID
      this.messageStore.updateMessage(msg.clientId, { status: "sent", id: newMessageRef.key });
      if (this.onRender) this.onRender();

    } catch (error) {
      console.error('[SEND-FAILED] Error sending to Firebase:', error);
      this.messageStore.updateMessage(msg.clientId, { status: "error" });
      if (this.onRender) this.onRender();
    }
  }

  _formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SendQueue;
}
