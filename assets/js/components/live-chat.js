import {
  getFirebase
} from '../modules/firebase-core.js';
window.addEventListener("load", async () => {
  const chatHTML = `
  <div class="livechat-widget" style="opacity: 0; visibility: hidden;">
    <button class="chat-button" id="chatBtn" aria-label="Buka Live Chat">
      <i class="fas fa-comments" aria-hidden="true"></i> Live Chat
      <span id="unreadBadge" class="badge" style="display: none;" aria-label="Pesan belum dibaca">0</span>
    </button>

    <div class="modal-overlay" id="modalOverlay"></div>

    <div class="chat-modal" id="chatModal">
      <div class="chat-header" id="chatHeader">
        <div class="chat-header-info">
          <div class="header-avatar-container">
            <img id="headerAvatar" src="" alt="Agent">
            <span class="online-indicator"></span>
          </div>
          <div class="header-text-container">
            <span id="headerName">Menghubungi...</span>
            <span class="header-role">Customer Support</span>
          </div>
        </div>
        <button class="chat-close-btn" id="closeChatBtn" aria-label="Tutup Obrolan" onclick="closeModal()">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="chat-messages" id="messages"></div>
      <div class="chat-input">
        <textarea id="input" rows="1" placeholder="Tulis pesan..." aria-label="Pesan Anda" style="resize: none; min-height: 38px; max-height: 100px; overflow-y: auto;"></textarea>
        <input type="file" id="fileInput" style="display: none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          aria-label="Pilih dokumen">
        <button id="attachBtn" class="attach-btn" title="Kirim File" aria-label="Kirim Lampiran Dokumen"><i
            class="fas fa-paperclip" aria-hidden="true"></i></button>
        <button id="sendBtn" aria-label="Kirim Pesan"><i class="fas fa-paper-plane" aria-hidden="true"></i></button>
      </div>
    </div>
    <!-- Attachment Modal -->
    <div id="attachmentModal" class="modal-backdrop" onclick="if(event.target === this) closeAttachmentModal()">
      <div class="modal-content" style="width: fit-content; max-width: 90vw; min-width: 300px; margin: 0 auto;">
        <button class="modal-close" onclick="closeAttachmentModal()" aria-label="Tutup Lampiran"><i class="fas fa-times" aria-hidden="true"></i></button>
        <div class="attachment-modal-header">
          <h3 id="attachmentModalTitle"><i class="fas fa-file-alt" aria-hidden="true"></i> Lampiran</h3>
        </div>
        <div class="attachment-modal-body">
          <div id="attachmentLoading" class="attachment-loading">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>Memuat dokumen dari server...</p>
          </div>
          <div id="attachmentError" class="attachment-error" style="display: none;">
            <i class="fas fa-exclamation-triangle fa-2x"></i>
            <p>Gagal memuat dokumen.</p>
          </div>
          <img id="attachmentImg" style="display: none;" alt="Lampiran Gambar" />
          <iframe id="attachmentFrame" style="display: none;" title="Lampiran Dokumen"></iframe>
        </div>
      </div>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatHTML);
  const styles = ["/assets/css/components/livechat.css"];
  styles.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });
  try {
    await getFirebase();
  } catch (error) {
    console.log('[LiveChat] Gagal memuat Firebase:', error);
    return;
  }
  const scripts = ["https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.min.js", "/assets/js/livechat/config.js", "/assets/js/livechat/sessionCache.js", "/assets/js/livechat/messageStore.js", "/assets/js/livechat/messageRenderer.js", "/assets/js/livechat/syncEngine.js", "/assets/js/livechat/sendQueue.js", "/assets/js/livechat/utils.js", "/assets/js/livechat/user.js?v=11"];
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.body.appendChild(script);
  });
});