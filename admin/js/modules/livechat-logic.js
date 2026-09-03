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
var audio = new Audio('/assets/audio/notification.mp3');
var autoPilotRooms = {};
// NEW: Module instances (initialized per room)
var messageStore = null;
var messageRenderer = null;
var syncEngine = null;
var sendQueue = null;
var typingTimeout = null;
var QUICK_REPLIES = [];
// ============================================================================
// QUICK REPLIES LOGIC
// ============================================================================
var quickReplySelectedIndex = -1;
var lastQuickReplyFilter = null;
// ============================================================================
// MODULE INITIALIZATION
// ============================================================================
function initializeChatModules() {
  messageRenderer = new MessageRenderer('#chatBox');
  messageRenderer.roomId = activeRoom;
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
    messageRenderer?.renderMessages(sortedMessages, {
      type: userType
    });
  }
}

function _setupStoreSubscriptions() {
  messageStore?.subscribe('messageAdded', async (msg) => {
    if (msg.sender === 'user') {
      if (document.visibilityState !== 'visible') {
        showNotif();
      }
    }
  });
  messageStore?.subscribe('messageUpdated', (data) => {
    const {
      old: oldMsg,
      new: newMsg
    } = data;
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
      
      // Jangan maksa scroll jika admin sedang di atas
      const scrollableHeight = chatBox.scrollHeight - chatBox.clientHeight;
      const distanceFromBottom = scrollableHeight - chatBox.scrollTop;
      if (distanceFromBottom < 100) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    } // Penutup if (!indicator)
  } else {
    if (indicator) {
      indicator.remove();
    }
  }
}
// ============================================================================
// ROOMS MANAGEMENT
// ============================================================================
var unsubscribeRooms = null;
async function loadRooms() {
  if (unsubscribeRooms) return; // Already listening
  if (!window.firebaseHelpers) {
    console.error("Firebase not loaded!");
    roomsList.innerHTML = "<i class=\"empty-state error\">Firebase Error</i>";
    return;
  }
  const db = window.firebaseDB;
  const {
    ref,
    onValue
  } = window.firebaseHelpers;
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
      if (room.id) {
        autoPilotRooms[room.id] = room.autoPilot !== false; // Default to ON
      }
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
      const unreadBadgeHtml = unreadCount > 0 ? `<span class="room-unread-badge">${unreadCount > 99 ? '99+' : unreadCount}</span>` : '';
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
              const {
                remove,
                ref
              } = window.firebaseHelpers;
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
      audio.play().catch(() => {});
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
  if (replyInput) {
    const savedDraft = localStorage.getItem(`livechat_admin_draft_${roomId}`);
    replyInput.value = savedDraft || '';
    setTimeout(() => {
      replyInput.style.height = '1px';
      replyInput.style.height = Math.min(replyInput.scrollHeight, 120) + 'px';
    }, 10);
    replyInput.focus();
  }
  
  // Set Auto-Pilot toggle state for this room
  const apToggle = document.getElementById('aiAutoPilotToggle');
  if (apToggle) {
    apToggle.checked = !!autoPilotRooms[roomId];
  }
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
  const originalBtnHTML = sendBtn.innerHTML;
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengirim...`;
  try {
    // Extract agent name from existing messages in the room (LATEST first)
    let agentName = 'Admin';
    if (messageStore) {
      const messages = messageStore.getSortedMessages();
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].agent && messages[i].agent !== 'Admin') {
          agentName = messages[i].agent;
          break;
        }
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
    replyInput.style.height = '38px';
    if (activeRoom) {
      localStorage.removeItem(`livechat_admin_draft_${activeRoom}`);
    }
    replyInput.focus();
  } catch (error) {
    console.error('Error sending message:', error);
    messageRenderer?.addSystemMessage(`❌ Gagal mengirim. Error: ${error.message}`);
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    sendBtn.innerHTML = originalBtnHTML;
  }
}

function showNotif() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.style.display = 'block';
    notification.style.opacity = '1';
    audio.play().catch(() => {});
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
var fileInput = document.getElementById('fileInput');
var attachBtn = document.getElementById('attachBtn');
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
        reader.onload = async function(event) {
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

// AI Copilot Handlers
var aiSuggestBtn = document.getElementById('aiSuggestBtn');
var aiAutoPilotToggle = document.getElementById('aiAutoPilotToggle');

if (aiAutoPilotToggle) {
  aiAutoPilotToggle.addEventListener('change', (e) => {
    if (activeRoom) {
      if (window.firebaseDB && window.firebaseHelpers) {
        const { ref, update } = window.firebaseHelpers;
        const roomRef = ref(window.firebaseDB, `rooms/${activeRoom}`);
        update(roomRef, { autoPilot: e.target.checked }).catch(err => console.error('Gagal update Auto-Pilot', err));
      }
      autoPilotRooms[activeRoom] = e.target.checked;
      if (e.target.checked) {
         messageRenderer?.addSystemMessage('<i class="fas fa-robot"></i> Auto-Pilot diaktifkan untuk obrolan ini.');
      } else {
         messageRenderer?.addSystemMessage('<i class="fas fa-user"></i> Auto-Pilot dimatikan. Anda dalam kendali manual.');
      }
    }
  });
}

if (aiSuggestBtn) {
  aiSuggestBtn.addEventListener('click', async () => {
    if (!activeRoom) return;
    
    // Prevent double clicking by checking if already drafting
    if (aiSuggestBtn.disabled) return;
    
    aiSuggestBtn.disabled = true;
    aiSuggestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    replyInput.placeholder = "AI sedang berpikir...";
    
    try {
       const res = await fetch('https://livechat.sisitusdotcom.workers.dev/', {
           method: "POST",
           headers: { "Content-Type": "application/x-www-form-urlencoded" },
           body: `action=draftAIReply&roomId=${activeRoom}&force=true`
       });
       
       const resData = await res.json();
       if (!res.ok || resData.status === 'error') {
           console.error("AI Error:", resData);
           alert("Gagal memanggil AI: " + (resData.message || resData.details || "Kesalahan tidak diketahui"));
           messageRenderer?.addSystemMessage('❌ Gagal memanggil AI: ' + (resData.message || ''));
       } else if (resData.draft) {
           // Masukkan draft ke dalam kotak input text admin
           replyInput.value = resData.draft;
           // Fokuskan kursor ke input agar admin bisa langsung mengedit
           replyInput.focus();
       }
    } catch(e) {
       console.error('AI Suggest error:', e);
       messageRenderer?.addSystemMessage('❌ Gagal memanggil AI.');
    } finally {
       aiSuggestBtn.disabled = false;
       aiSuggestBtn.innerHTML = '<i class="fas fa-magic" style="font-size: 1.1rem; color: #8b5cf6;"></i>';
       replyInput.placeholder = "Ketik pesan di sini... (tekan Enter untuk mengirim)";
    }
  });
}

var typingTimeout = null;
var QUICK_REPLIES = [];
// Fetch quick replies from GAS configuration with caching
async function loadQuickReplies() {
  try {
      const cached = localStorage.getItem("livechat_quick_replies");
      if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000)) {
              QUICK_REPLIES = parsed.data;
              return;
          }
      }
      
      const res = await fetch(CONFIG.GAS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "action=getQuickReplies"
      });
      const result = await res.json();
      
      if (result.status === "success" && Array.isArray(result.data)) {
          QUICK_REPLIES = result.data;
          localStorage.setItem("livechat_quick_replies", JSON.stringify({
              timestamp: Date.now(),
              data: QUICK_REPLIES
          }));
      }
  } catch (err) {
      console.error("Gagal memuat template Quick Reply dari server:", err);
  }
}
loadQuickReplies();
var quickReplySelectedIndex = -1;
var lastQuickReplyFilter = null;

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
    selectedEl.scrollIntoView({
      block: 'nearest'
    });
  }
}
var isTypingRefActive = false;

function initEventHandlers() {
  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendReply(null));
  }

  // --- NEW: AI Settings Bindings (Using Event Delegation) ---
  document.addEventListener('click', (e) => {
    const aiSettingsBtn = e.target.closest('#aiSettingsBtn');
    const saveAiConfigBtn = e.target.closest('#saveAiConfigBtn');
    const archiveChatBtn = e.target.closest('#archiveChatBtn');

    if (aiSettingsBtn) {
      const aiConfigModal = document.getElementById('aiConfigModal');
      const aiConfigLoading = document.getElementById('aiConfigLoading');
      const aiConfigForm = document.getElementById('aiConfigForm');
      if (!aiConfigModal) {
        alert('DEBUG: aiConfigModal tidak ditemukan di DOM. Coba Refresh (Ctrl+F5).');
        return;
      }

      aiConfigModal.style.display = 'flex';
      // Tambahkan timeout kecil agar transisi CSS berjalan
      setTimeout(() => aiConfigModal.classList.add('active'), 10);
      aiConfigLoading.style.display = 'flex';
      aiConfigForm.style.display = 'none';

      fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=getAiConfig'
      })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          const cfgTargetEmail = document.getElementById('cfgTargetEmail');
          const cfgAiModel = document.getElementById('cfgAiModel');
          const cfgPrompt = document.getElementById('cfgPrompt');

          if(cfgTargetEmail) cfgTargetEmail.value = res.data.config['Target Email'] || '';
          if(cfgAiModel) cfgAiModel.value = res.data.config['AI Model'] || '';
          if(cfgPrompt) cfgPrompt.value = res.data.prompt || '';
        }
        aiConfigLoading.style.display = 'none';
        aiConfigForm.style.display = 'flex';
      })
      .catch(err => {
        console.error(err);
        aiConfigLoading.innerHTML = '<p style="color:red">Gagal memuat pengaturan.</p>';
      });
    }

    if (saveAiConfigBtn) {
      const aiConfigModal = document.getElementById('aiConfigModal');
      const payload = {
        config: {
          "Target Email": document.getElementById('cfgTargetEmail') ? document.getElementById('cfgTargetEmail').value : '',
          "AI Model": document.getElementById('cfgAiModel') ? document.getElementById('cfgAiModel').value : ''
        },
        prompt: document.getElementById('cfgPrompt') ? document.getElementById('cfgPrompt').value : ''
      };

      const origText = saveAiConfigBtn.innerHTML;
      saveAiConfigBtn.disabled = true;
      saveAiConfigBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

      fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=saveAiConfig&payload=${encodeURIComponent(JSON.stringify(payload))}`
      })
      .then(r => r.json())
      .then(res => {
        saveAiConfigBtn.disabled = false;
        saveAiConfigBtn.innerHTML = '<i class="fas fa-check"></i> Tersimpan!';
        setTimeout(() => {
          saveAiConfigBtn.innerHTML = origText;
          if (aiConfigModal) {
            aiConfigModal.classList.remove('active');
            setTimeout(() => aiConfigModal.style.display = 'none', 300);
          }
        }, 1500);
      })
      .catch(err => {
        console.error(err);
        saveAiConfigBtn.disabled = false;
        saveAiConfigBtn.innerHTML = origText;
        alert('Gagal menyimpan. Periksa koneksi internet.');
      });
    }

    if (archiveChatBtn) {
      if (!activeRoom) return;
      if (!confirm("Arsipkan dan selesaikan obrolan ini secara permanen? Data akan dipindahkan ke Sheets.")) return;
      
      const origText = archiveChatBtn.innerHTML;
      archiveChatBtn.disabled = true;
      archiveChatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengarsipkan...';

      fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=archiveChat&roomId=${activeRoom}`
      })
      .then(r => r.json())
      .then(res => {
        archiveChatBtn.disabled = false;
        archiveChatBtn.innerHTML = origText;
        if (res.status === 'success') {
          const activeChatContainer = document.getElementById('activeChatContainer');
          const emptyStateContainer = document.getElementById('emptyStateContainer');
          if (activeChatContainer) activeChatContainer.style.display = 'none';
          if (emptyStateContainer) emptyStateContainer.style.display = 'flex';
          activeRoom = null;
        } else {
          alert('Gagal mengarsipkan: ' + res.message);
        }
      })
      .catch(err => {
        console.error(err);
        archiveChatBtn.disabled = false;
        archiveChatBtn.innerHTML = origText;
        alert('Gagal mengarsipkan. Periksa koneksi internet.');
      });
    }
  });
  if (replyInput) {
    replyInput.addEventListener('input', function(e) {
      // Auto-resize textarea (set to 1px first to force shrink calculation)
      this.style.height = '1px';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';

      // Simpan draft per room
      if (activeRoom) {
        localStorage.setItem(`livechat_admin_draft_${activeRoom}`, this.value);
      }

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
        const {
          ref,
          set
        } = window.firebaseHelpers;
        const db = window.firebaseDB;
        const typingRef = ref(db, `rooms/${activeRoom}/typing/admin`);
        set(typingRef, true);
        isTypingRefActive = true;
      }
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        const {
          ref,
          set
        } = window.firebaseHelpers;
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
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // Di ponsel: Enter = Baris Baru (default textarea)
          return;
        }

        // Di Desktop:
        if (e.shiftKey) {
          // Shift+Enter = Baris Baru
          return;
        }

        // Enter saja = Kirim Pesan
        e.preventDefault();
        
        if (typingTimeout) clearTimeout(typingTimeout);
        if (window.firebaseHelpers) {
          const {
            ref,
            set
          } = window.firebaseHelpers;
          const db = window.firebaseDB;
          set(ref(db, `rooms/${activeRoom}/typing/admin`), false);
          isTypingRefActive = false;
        }
        sendReply(null);
        replyInput.style.height = 'auto'; // Reset height
      }
    });
  }
}

function initAdmin() {
  initEventHandlers();
  loadRooms();
  // Online/Offline Toggle Logic
  const toggle = document.getElementById('lcOnlineToggle');
  const label = document.getElementById('lcStatusLabel');
  if (toggle && window.firebaseHelpers && window.firebaseDB) {
    const {
      ref,
      onValue,
      set
    } = window.firebaseHelpers;
    const statusRef = ref(window.firebaseDB, 'settings/livechat/isOnline');
    // Listen to DB changes
    onValue(statusRef, (snapshot) => {
      const isOnline = snapshot.val();
      // If null (not set), default to true
      const currentState = isOnline !== false;
      toggle.checked = currentState;
      if (label) label.textContent = currentState ? 'Online' : 'Offline';
    });
    // Update DB on toggle change
    toggle.addEventListener('change', (e) => {
      set(statusRef, e.target.checked);
    });
  }
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