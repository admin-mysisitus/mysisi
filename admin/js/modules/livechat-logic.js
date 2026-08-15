/**
 * ============================================================================
 * REFACTORED ADMIN CHAT INTERFACE - NEW MODULAR ARCHITECTURE
 * ============================================================================
 */

// DOM ELEMENTS
var chatBox = document.getElementById('chatBox');
var replyInput = document.getElementById('replyInput');
var sendBtn = document.getElementById('sendBtn');
var roomsList = document.getElementById('roomsList');
var currentRoomDisplay = document.getElementById('currentRoom');

// SESSION & STATE
var activeRoom = null;
var isRoomsLoading = false;
var isSending = false;
var isLoadingMessages = false;
var previousRoomsState = JSON.parse(localStorage.getItem('previousRoomsState') || '{}');
var roomUnreadCounts = JSON.parse(localStorage.getItem('roomUnreadCounts') || '{}'); // Track unread per room
var adminUnreadCount = parseInt(localStorage.getItem('adminUnreadCount') || '0', 10);

// Notification audio
var audio = new Audio('/live-chat/assets/notification.mp3');

// NEW: Module instances (initialized per room)
var messageStore = null;
var messageRenderer = null;
var syncEngine = null;
var sendQueue = null;

// ============================================================================
// MODULE INITIALIZATION
// ============================================================================

function initializeChatModules() {
  messageRenderer = new MessageRenderer('#chatBox');
  messageStore = new MessageStore(messageRenderer);

  syncEngine = new SyncEngine(messageStore, messageRenderer, {
    sessionCache: sessionCache,
    onTyping: handleTypingIndicator
  });

  sendQueue = new SendQueue(messageStore, {
    onRender: () => syncEngine._scheduleRender()
  });

  _setupStoreSubscriptions();

  const userType = 'admin';
  const userId = 'admin-user';

  const cached = sessionCache.tryRestore(activeRoom, userId, userType);

  if (cached && cached.messages && cached.messages.length > 0) {
    cached.messages.forEach(msg => {
      messageStore.upsertMessage(msg);
    });

    const sortedMessages = messageStore.getSortedMessages();
    messageRenderer?.render(sortedMessages, { type: userType });
  }
}

function _setupStoreSubscriptions() {
  messageStore?.subscribe('messageAdded', (msg) => {
    if (msg.sender === 'user' && document.visibilityState !== 'visible') {
      showNotif();
    }
  });

  messageStore?.subscribe('messageUpdated', (data) => {
    const { old: oldMsg, new: newMsg } = data;
    if (newMsg && newMsg.status === 'error' && (!oldMsg || oldMsg.status !== 'error')) {
      if (messageRenderer) {
        messageRenderer.addSystemMessage('❌ Pesan gagal terkirim, silakan coba lagi.');
      }
    }
  });
}

function updateAdminUnreadBadge() {
  const badge = document.getElementById('adminUnreadBadge');
  if (badge) {
    if (adminUnreadCount > 0) {
      badge.textContent = adminUnreadCount > 99 ? '99+' : adminUnreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Typing Indicator handler
function handleTypingIndicator(isTyping) {
  let indicator = document.getElementById('typingIndicator');
  if (isTyping) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'typingIndicator';
      indicator.className = 'message system-message typing-indicator';
      indicator.innerHTML = `<span class="typing-text">User is typing</span> <img src="/assets/img/livechat/dots-typing.gif" class="typing-gif" alt="...">`;
      chatBox.appendChild(indicator);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } else {
    if (indicator) {
      indicator.remove();
    }
  }
}

// ============================================================================
// ROOMS MANAGEMENT
// ============================================================================

let unsubscribeRooms = null;

async function loadRooms() {
  if (unsubscribeRooms) return; // Already listening

  if (!window.firebaseHelpers) { console.error("Firebase not loaded!"); roomsList.innerHTML = "<i class=\"empty-state error\">Firebase Error</i>"; return; } const db = window.firebaseDB;
  const { ref, onValue } = window.firebaseHelpers;
  const roomsRef = ref(db, 'rooms');

  roomsList.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memuat...';
  roomsList.classList.add('rooms-loading');

  unsubscribeRooms = onValue(roomsRef, (snapshot) => {
    roomsList.innerHTML = '';
    roomsList.classList.remove('rooms-loading');

    if (!snapshot.exists()) {
      roomsList.innerHTML = '<i class="empty-state">Belum ada chat</i>';
      return;
    }

    const roomsData = snapshot.val();
    const rooms = Object.values(roomsData).sort((a, b) => b.timestamp - a.timestamp);
    let hasNewMessages = false;

    rooms.forEach(room => {
      if (!room.id || !room.lastSender) return;

      const shortMsg = truncateString(room.lastMessage || "", CONFIG.ROOM_MESSAGE_PREVIEW_LENGTH);

      // Detect new messages from users
      if (room.lastSender === 'user') {
        if (previousRoomsState[room.id] && previousRoomsState[room.id] !== room.lastMessage) {
          if (room.id !== activeRoom || document.visibilityState !== 'visible') {
            roomUnreadCounts[room.id] = (roomUnreadCounts[room.id] || 0) + 1;
            adminUnreadCount++;
            localStorage.setItem('roomUnreadCounts', JSON.stringify(roomUnreadCounts));
            localStorage.setItem('adminUnreadCount', adminUnreadCount);
            hasNewMessages = true;
          }
        }
      }
      previousRoomsState[room.id] = room.lastMessage;

      let roomDisplay = room.id.replace('room-', '');
      const atIndex = room.id.indexOf('-@');
      if (atIndex !== -1) {
        const agentPart = room.id.substring(atIndex + 1);
        const idPart = room.id.substring(5, atIndex).split('-')[0];
        roomDisplay = agentPart + ' (' + idPart.slice(-6) + ')';
      } else {
        roomDisplay = truncateString(roomDisplay, CONFIG.ROOM_ID_DISPLAY_LENGTH);
      }

      const div = document.createElement('div');
      div.className = `room-item ${room.id === activeRoom ? 'active' : ''}`;
      div.setAttribute('data-room-id', room.id);
      div.title = room.id;
      div.style.cursor = 'pointer';
      div.tabIndex = 0;

      const unreadCount = roomUnreadCounts[room.id] || 0;
      const unreadBadgeHtml = unreadCount > 0
        ? `<span class="room-unread-badge">${unreadCount > 99 ? '99+' : unreadCount}</span>`
        : '';

      div.innerHTML = `
        <div class="room-item-header">
          <div class="room-item-title-wrap">
            <span class="room-item-title">${sanitizeMessage(roomDisplay)}</span>
            ${unreadBadgeHtml}
          </div>
          <i class="fas fa-trash delete-room-btn" title="Hapus Room"></i>
        </div>
        <small class="room-preview">(${sanitizeMessage(shortMsg)})</small>
      `;

      // Attach click event for deleting room
      const deleteBtn = div.querySelector('.delete-room-btn');
      if (deleteBtn) {
        deleteBtn.onclick = async (e) => {
          e.stopPropagation(); // prevent opening the room
          if (confirm('Yakin ingin menghapus room ini beserta seluruh riwayat chatnya selamanya?')) {
            try {
              const { remove, ref } = window.firebaseHelpers;
              await remove(ref(window.firebaseDB, `rooms/${room.id}`));

              // If the deleted room is currently open, close it
              if (activeRoom === room.id) {
                const emptyState = document.getElementById('emptyStateContainer');
                const activeChat = document.getElementById('activeChatContainer');
                if (emptyState) emptyState.style.display = 'flex';
                if (activeChat) activeChat.style.display = 'none';
                activeRoom = null;
                syncEngine?.stopSync();
              }
            } catch (err) {
              console.error('Failed to delete room:', err);
              alert('Gagal menghapus room. Pastikan aturan keamanan Firebase mengizinkan Write.');
            }
          }
        };
      }

      // Attach click event for opening room
      div.onclick = (e) => {
        if (e.target.classList.contains('delete-room-btn')) return;
        selectRoom(room.id);
      };

      div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const roomId = div.getAttribute('data-room-id');
          if (roomId) selectRoom(roomId);
        }
      });

      roomsList.appendChild(div);
    });

    localStorage.setItem('previousRoomsState', JSON.stringify(previousRoomsState));

    if (hasNewMessages) {
      updateAdminUnreadBadge();
      audio.play().catch(() => { });
    }
    updateAdminUnreadBadge();
  }, (error) => {
    console.error('Failed to listen to rooms:', error);
    roomsList.innerHTML = '<i class="empty-state error">Gagal memuat room</i>';
    roomsList.classList.remove('rooms-loading');
  });
}

function selectRoom(roomId) {
  if (!isValidRoomId(roomId)) {
    return;
  }

  syncEngine?.stopSync();

  activeRoom = roomId;

  initializeChatModules();
  messageRenderer?.clear();

  const emptyState = document.getElementById('emptyStateContainer');
  const activeChat = document.getElementById('activeChatContainer');
  if (emptyState) emptyState.style.display = 'none';
  if (activeChat) activeChat.style.display = 'flex';

  currentRoomDisplay.innerText = "Room: " + truncateString(roomId, CONFIG.ROOM_NAME_DISPLAY_LENGTH);

  document.querySelectorAll('.room-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeItem = document.querySelector(`.room-item[data-room-id="${CSS.escape(roomId)}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  syncEngine?.startSync(roomId, 'admin');

  if (roomUnreadCounts[roomId]) {
    adminUnreadCount = Math.max(0, adminUnreadCount - roomUnreadCounts[roomId]);
    roomUnreadCounts[roomId] = 0;
  }
  if (Object.values(roomUnreadCounts).every(c => c === 0)) {
    adminUnreadCount = 0;
  }

  localStorage.setItem('roomUnreadCounts', JSON.stringify(roomUnreadCounts));
  localStorage.setItem('adminUnreadCount', adminUnreadCount);
  updateAdminUnreadBadge();

  const activeRoomElement = document.querySelector(`.room-item[data-room-id="${CSS.escape(roomId)}"] .room-unread-badge`);
  if (activeRoomElement) {
    activeRoomElement.remove();
  }

  if (replyInput) replyInput.focus();
}

// ============================================================================
// MESSAGE SENDING
// ============================================================================

async function sendReply(attachmentUrl = null) {
  if (!activeRoom) {
    return;
  }

  const txt = replyInput.value.trim();

  if (!validateMessage(txt) && !attachmentUrl) {
    return;
  }

  if (isSending) {
    return;
  }

  isSending = true;
  const originalBtnText = sendBtn.innerText;
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengirim...`;

  try {
    // Extract agent name from existing messages in the room
    let agentName = 'Admin';
    if (messageStore) {
      const messages = messageStore.getSortedMessages();
      const msgWithAgent = messages.find(m => m.agent && m.agent !== 'Admin');
      if (msgWithAgent) {
        agentName = msgWithAgent.agent;
      }
    }

    const optimisticMsg = sendQueue?.enqueue({
      roomId: activeRoom,
      text: txt,
      attachment: attachmentUrl,
      sender: 'admin',
      agent: agentName
    });

    if (!optimisticMsg) {
      throw new Error('Failed to enqueue message');
    }

    replyInput.value = '';
    replyInput.focus();

  } catch (error) {
    console.error('Error sending message:', error);
    messageRenderer?.addSystemMessage(`❌ Gagal mengirim. Error: ${error.message}`);
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    sendBtn.innerHTML = originalBtnText;
  }
}

function showNotif() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.style.display = 'block';
    notification.style.opacity = '1';

    audio.play().catch(() => { });

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, CONFIG.TIMINGS.DELAYS.notification_fadeout);
  }
}

// ============================================================================
// DOM EVENT HANDLERS
// ============================================================================

// File Upload Handlers
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');

if (attachBtn && fileInput) {
  attachBtn.addEventListener('click', () => {
    if (!activeRoom) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', async (e) => {
    if (!activeRoom) return;
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      messageRenderer?.addSystemMessage('❌ File terlalu besar (Maks 5MB)');
      return;
    }

    const spinnerMsg = messageRenderer?.addSystemMessage('<i class="fas fa-spinner fa-spin"></i> Mengunggah file...');
    attachBtn.disabled = true;
    replyInput.disabled = true;
    sendBtn.disabled = true;

    try {
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function (event) {
          try {
            const base64Data = event.target.result;

            const formData = new FormData();
            formData.append('action', 'upload');
            formData.append('fileData', base64Data);
            formData.append('fileName', file.name);
            formData.append('mimeType', file.type);

            const response = await fetch(CONFIG.GAS_URL, {
              method: 'POST',
              body: formData
            });

            const result = await response.json();
            if (result.status === 'success') {
              await sendReply(result.fileUrl);
              resolve();
            } else {
              reject(new Error(result.message || 'Upload failed'));
            }
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsDataURL(file);
      });
      if (spinnerMsg && spinnerMsg.parentNode) spinnerMsg.remove();
      attachBtn.disabled = false;
      replyInput.disabled = false;
      sendBtn.disabled = false;
      fileInput.value = '';
      replyInput.focus();
    } catch (error) {
      if (spinnerMsg && spinnerMsg.parentNode) spinnerMsg.remove();
      messageRenderer?.addSystemMessage('❌ Gagal mengunggah: ' + error.message);
      attachBtn.disabled = false;
      replyInput.disabled = false;
      sendBtn.disabled = false;
      fileInput.value = '';
      replyInput.focus();
    }
  });
}

let typingTimeout = null;

  let QUICK_REPLIES = [];

  // Fetch quick replies from external JSON configuration
  fetch('/assets/data/livechat/quick_replies.json')
    .then(res => res.json())
    .then(data => {
      QUICK_REPLIES = data;
    })
    .catch(err => console.error("Gagal memuat template Quick Reply:", err));

  let quickReplySelectedIndex = -1;
  let lastQuickReplyFilter = null;

  function renderQuickReplies(filterText = "") {
    const popup = document.getElementById('quickReplyPopup');
    if (!popup) return;

    if (lastQuickReplyFilter !== filterText) {
        lastQuickReplyFilter = filterText;
        const matches = QUICK_REPLIES.filter(qr => qr.trigger.toLowerCase().includes(filterText.toLowerCase()) || qr.title.toLowerCase().includes(filterText.toLowerCase()));

        if (matches.length === 0) {
          popup.classList.remove('active');
          return;
        }

        popup.innerHTML = '';
        matches.forEach((qr, index) => {
          const div = document.createElement('div');
          div.className = 'quick-reply-item' + (index === quickReplySelectedIndex ? ' selected' : '');
          div.innerHTML = `<span class="quick-reply-title">/${qr.trigger} - ${qr.title}</span><span class="quick-reply-text">${qr.text}</span>`;
          
          div.addEventListener('click', () => {
            replyInput.value = qr.text;
            popup.classList.remove('active');
            replyInput.focus();
            lastQuickReplyFilter = null;
          });
          popup.appendChild(div);
        });

        popup.classList.add('active');
    } else {
        const items = popup.querySelectorAll('.quick-reply-item');
        items.forEach((item, index) => {
            if (index === quickReplySelectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    const selectedEl = popup.querySelector('.selected');
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  var isTypingRefActive = false;

function initEventHandlers() {
  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendReply(null));
  }

  if (replyInput) {
    replyInput.addEventListener('input', () => {
      // Quick Reply Logic
      const val = replyInput.value;
      const popup = document.getElementById('quickReplyPopup');
      if (val.startsWith('/')) {
          const filterText = val.substring(1);
          if (quickReplySelectedIndex === -1) quickReplySelectedIndex = 0; // Default select first
          renderQuickReplies(filterText);
      } else {
          if (popup) popup.classList.remove('active');
          quickReplySelectedIndex = -1;
          lastQuickReplyFilter = null;
      }

      if (!activeRoom || !window.firebaseHelpers) return;
      
      // Throttled Typing Indicator Write
      if (!isTypingRefActive) {
          const { ref, set } = window.firebaseHelpers;
          const db = window.firebaseDB;
          const typingRef = ref(db, `rooms/${activeRoom}/typing/admin`);
          set(typingRef, true);
          isTypingRefActive = true;
      }

      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        const { ref, set } = window.firebaseHelpers;
        const db = window.firebaseDB;
        const typingRef = ref(db, `rooms/${activeRoom}/typing/admin`);
        set(typingRef, false);
        isTypingRefActive = false;
      }, 2000);
    });

    replyInput.addEventListener('keydown', (e) => {
      const popup = document.getElementById('quickReplyPopup');
      const isPopupActive = popup && popup.classList.contains('active');

      if (isPopupActive) {
          const items = popup.querySelectorAll('.quick-reply-item');
          if (e.key === 'ArrowDown') {
              e.preventDefault();
              quickReplySelectedIndex = (quickReplySelectedIndex + 1) % items.length;
              renderQuickReplies(replyInput.value.substring(1));
              return;
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              quickReplySelectedIndex = (quickReplySelectedIndex - 1 + items.length) % items.length;
              renderQuickReplies(replyInput.value.substring(1));
              return;
          } else if (e.key === 'Enter') {
              e.preventDefault();
              if (quickReplySelectedIndex >= 0 && quickReplySelectedIndex < items.length) {
                  items[quickReplySelectedIndex].click();
              } else if (items.length > 0) {
                  items[0].click();
              }
              return;
          } else if (e.key === 'Escape') {
              popup.classList.remove('active');
              lastQuickReplyFilter = null;
              return;
          }
      }

      if (e.key === 'Enter') {
        if (typingTimeout) clearTimeout(typingTimeout);
        if (window.firebaseHelpers) {
          const { ref, set } = window.firebaseHelpers;
          const db = window.firebaseDB;
          set(ref(db, `rooms/${activeRoom}/typing/admin`), false);
          isTypingRefActive = false;
        }
        sendReply(null);
      }
    });
  }
}

function initAdmin() {
  initEventHandlers();
  loadRooms();
}

if (window.firebaseDB) {
  initAdmin();
} else {
  window.addEventListener('firebase-ready', initAdmin);
}

// ============================================================================
// A11Y & UX: CLEAR BADGE ON TAB RETURN
// ============================================================================
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && activeRoom) {
    if (roomUnreadCounts[activeRoom]) {
      adminUnreadCount = Math.max(0, adminUnreadCount - roomUnreadCounts[activeRoom]);
      roomUnreadCounts[activeRoom] = 0;
      localStorage.setItem('roomUnreadCounts', JSON.stringify(roomUnreadCounts));
      localStorage.setItem('adminUnreadCount', adminUnreadCount);

      updateAdminUnreadBadge();
      const activeRoomElement = document.querySelector(`.room-item[data-room-id="${CSS.escape(activeRoom)}"] .room-unread-badge`);
      if (activeRoomElement) {
        activeRoomElement.remove();
      }
    }
  }
});
