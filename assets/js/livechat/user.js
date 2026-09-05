const chatBtn = document.getElementById('chatBtn');
const chatModal = document.getElementById('chatModal');
const modalOverlay = document.getElementById('modalOverlay');
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const headerName = document.getElementById('headerName');
const headerAvatar = document.getElementById('headerAvatar');
const chatHeader = document.getElementById('chatHeader');
let inactiveTimer;
let inactivityWarningTimer;
let currentAgent = {};
let isConversationEnded = false;
let conversationId = localStorage.getItem('conversationId');
let assignedAgent = null;
let initialSpinnerRemoved = false;
let lastReadTimestamp = parseInt(localStorage.getItem('lastReadTimestamp') || '0', 10);
let userUnreadCount = 0; // We'll recalculate this
const notificationAudio = new Audio('/assets/audio/notification.mp3');
let messageStore = null;
let messageRenderer = null;
let syncEngine = null;
let sendQueue = null;
let isWaiting = false;

function initializeChatModules() {
  if (messageStore) return;
  messageRenderer = new MessageRenderer('#messages');
  messageRenderer.roomId = conversationId;
  messageStore = new MessageStore(messageRenderer);
  syncEngine = new SyncEngine(messageStore, messageRenderer, {
    sessionCache: sessionCache,
    onTyping: handleTypingIndicator
  });
  sendQueue = new SendQueue(messageStore, {
    onRender: () => syncEngine._scheduleRender() // UNIFIED RENDER PATH
  });
  _setupStoreSubscriptions();
  const userType = 'user';
  const userId = conversationId;
  const cached = sessionCache.tryRestore(conversationId, userId, userType);
  if (cached && cached.messages && cached.messages.length > 0) {
    cached.messages.forEach(msg => {
      messageStore.upsertMessage(msg);
    });
    const sortedMessages = messageStore.getSortedMessages();
    messageRenderer?.renderMessages(sortedMessages, {
      type: userType
    });
    recalculateUnread();
  }
}

function _setupStoreSubscriptions() {
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
  messageStore?.subscribe('messageAdded', (msg) => {
    if (msg.sender === 'admin' && msg.status !== 'sending') {
      const oldCount = userUnreadCount;
      recalculateUnread();
      if (userUnreadCount > oldCount) {
        notificationAudio.play().catch(() => {});
      }
    }
  });
}

function recalculateUnread() {
  if (chatModal && chatModal.style.display === 'flex' && document.visibilityState === 'visible') {
    lastReadTimestamp = Date.now();
    localStorage.setItem('lastReadTimestamp', lastReadTimestamp);
    userUnreadCount = 0;
  } else {
    if (!messageStore) return;
    const messages = messageStore.getSortedMessages();
    userUnreadCount = messages.filter(m => m.sender === 'admin' && new Date(m.createdAt).getTime() > lastReadTimestamp).length;
  }
  updateUnreadBadge();
}

function updateUnreadBadge() {
  const badge = document.getElementById('unreadBadge');
  if (badge) {
    if (userUnreadCount > 0) {
      badge.textContent = userUnreadCount > 99 ? '99+' : userUnreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function handleTypingIndicator(isTyping) {
  let indicator = document.getElementById('typingIndicator');
  if (isTyping) {
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'typingIndicator';
      indicator.className = 'message system-message typing-indicator';
      indicator.innerHTML = `<span class="typing-text">${currentAgent?.name || 'Admin'} is typing</span> <img src="/assets/img/livechat/dots-typing.gif" class="typing-gif" alt="...">`;
      messages.appendChild(indicator);
      messages.scrollTop = messages.scrollHeight;
    }
  } else {
    if (indicator) {
      indicator.remove();
    }
  }
}

function setAgent() {
  const savedIndex = localStorage.getItem('currentAgentIndex');
  let userId = null;
  try {
    const session = JSON.parse(localStorage.getItem('sisitus_user') || '{}');
    if (session && session.user && session.user.userId) {
      userId = session.user.userId;
    }
  } catch (e) {}
  if (userId) {
    conversationId = 'room-' + userId;
    localStorage.setItem('conversationId', conversationId);
  } else if (!conversationId) {
    conversationId = 'room-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
    localStorage.setItem('conversationId', conversationId);
  }
  if (savedIndex !== null && !isConversationEnded) {
    currentAgent = CONFIG.AGENTS[parseInt(savedIndex)];
  } else {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * CONFIG.AGENTS.length);
    } while (savedIndex !== null && newIndex === parseInt(savedIndex) && CONFIG.AGENTS.length > 1);
    localStorage.setItem('currentAgentIndex', newIndex);
    currentAgent = CONFIG.AGENTS[newIndex];
  }
  if (headerName) headerName.innerText = currentAgent.name;
  if (headerAvatar) {
    headerAvatar.src = currentAgent.avatar;
    headerAvatar.onerror = function() {
      this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Crect fill="%235B7C99" width="36" height="36"/%3E%3C/svg%3E';
    };
  }
}

function resetInactiveTimer() {
  clearTimeout(inactiveTimer);
  clearTimeout(inactivityWarningTimer);
  inactivityWarningTimer = setTimeout(() => {
    if (!isConversationEnded) {
      autoSendAdminMessage(`Halo, masih dengan saya ${currentAgent.name}. Apakah masih ada yang ingin ditanyakan atau dibantu sebelum sesi obrolan ini saya akhiri?`);
    }
  }, CONFIG.TIMINGS.SESSION.inactivity_warning);
  inactiveTimer = setTimeout(() => {
    endConversation();
  }, CONFIG.TIMINGS.SESSION.inactivity_timeout);
}

function endConversation() {
  autoSendAdminMessage('Karena tidak ada aktivitas, sesi percakapan ini akan saya tutup ya.');
  setTimeout(() => {
    autoSendAdminMessage('Senang berinteraksi dengan Anda! Semoga hari Anda menyenangkan dan jangan ragu untuk menghubungi kami kembali.');
  }, 1500);
  input.disabled = true;
  sendBtn.disabled = true;
  isConversationEnded = true;
  syncEngine?.stopSync();
  setTimeout(() => {
    closeModal();
  }, CONFIG.TIMINGS.DELAYS.modal_close);
}

function openModal() {
  if (!chatModal) {
    return;
  }
  chatModal.style.display = 'flex';
  modalOverlay.style.display = 'block';
  if (messages) {
    const savedScrollPos = localStorage.getItem('livechat_scroll_pos');
    if (savedScrollPos !== null) {
      messages.scrollTop = parseInt(savedScrollPos, 10);
    } else {
      messages.scrollTop = messages.scrollHeight;
    }
  }
  if (chatHeader) {
    chatHeader.classList.remove('loaded');
  }
  lastReadTimestamp = Date.now();
  localStorage.setItem('lastReadTimestamp', lastReadTimestamp);
  recalculateUnread();
  const needsNewAgent = isConversationEnded || !localStorage.getItem('currentAgentIndex');
  const isFirstTimeUser = !localStorage.getItem('conversationId');
  setAgent();
  if (isConversationEnded) {
    isConversationEnded = false;
  }
  if (!currentAgent || !currentAgent.name) {
    closeModal();
    return;
  }
  if (!conversationId) {
    closeModal();
    return;
  }
  if (!input || !sendBtn) {
    closeModal();
    return;
  }
  if (!needsNewAgent) {
    input.disabled = false;
    sendBtn.disabled = false;
  } else {
    input.disabled = true;
    sendBtn.disabled = true;
  }
  const savedDraft = localStorage.getItem('livechat_user_draft');
  input.value = savedDraft || '';
  setTimeout(() => {
    input.style.height = '';
    input.style.height = Math.min(input.scrollHeight + 2, 100) + 'px';
  }, 10);
  initializeChatModules();
  if (needsNewAgent) {
    if (isFirstTimeUser) {
      messageRenderer?.clear();
    }
    initialSpinnerRemoved = false;
    messageRenderer?.addSystemMessage('<i class="livechat-custom-spinner"></i> Menghubungi tim kami...');
    setTimeout(() => {
      syncEngine?.startSync(conversationId, 'user');
      assignedAgent = currentAgent.name;
      if (chatHeader) {
        chatHeader.classList.add('loaded');
      }
      resetInactiveTimer();
      setTimeout(() => {
        if (!initialSpinnerRemoved) {
          const systemMessages = messages.querySelectorAll('.system-message');
          if (systemMessages.length > 0) {
            const lastMsg = systemMessages[systemMessages.length - 1];
            setTimeout(() => {
              if (lastMsg.parentElement) lastMsg.remove();
              if (currentAgent && currentAgent.name) {
                let treatAsFirstTime = isFirstTimeUser;
                if (!treatAsFirstTime && messageStore) {
                  const msgs = messageStore.getSortedMessages();
                  if (msgs.length > 0) {
                    const lastMsgTime = new Date(msgs[msgs.length - 1].createdAt).getTime();
                    if (Date.now() - lastMsgTime > 6 * 60 * 60 * 1000) {
                      treatAsFirstTime = true;
                    }
                  }
                }
                if (treatAsFirstTime) {
                  autoSendAdminMessage(`Halo Sisi's! Selamat ${getGreetingTime()}. Terima kasih telah menghubungi kami.`);
                  setTimeout(() => autoSendAdminMessage(`Perkenalkan, saya ${currentAgent.name} (Customer Support). Ada yang bisa saya bantu hari ini?`), 1500);
                } else {
                  autoSendAdminMessage(`Halo kembali! Ada yang bisa saya bantu lagi?`);
                }
              }
              input.disabled = false;
              sendBtn.disabled = false;
              input.focus();
              initialSpinnerRemoved = true;
            }, CONFIG.TIMINGS.DELAYS.modal_load);
          }
        }
      }, CONFIG.TIMINGS.DELAYS.spinner_timeout);
    }, CONFIG.TIMINGS.DELAYS.modal_load);
  } else {
    assignedAgent = currentAgent.name;
    if (chatHeader) {
      chatHeader.classList.add('loaded');
    }
    syncEngine?.startSync(conversationId, 'user');
    resetInactiveTimer();
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}

function closeModal() {
  if (!chatModal) return;
  chatModal.style.display = 'none';
  modalOverlay.style.display = 'none';
  clearTimeout(inactiveTimer);
  clearTimeout(inactivityWarningTimer);
}

function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour < 10) return 'pagi';
  if (hour < 15) return 'siang';
  if (hour < 18) return 'sore';
  return 'malam';
}

function autoSendAdminMessage(text) {
  if (!sendQueue) return;
  sendQueue.enqueue({
    roomId: conversationId,
    text: text,
    attachment: null,
    agent: currentAgent.name,
    sender: 'admin'
  });
}
async function sendMessage(attachmentUrl = null) {
  const text = input.value.trim();
  if (!validateMessage(text) && !attachmentUrl) {
    return;
  }
  if (isWaiting) {
    messageRenderer?.addSystemMessage('⚠️ Tunggu sebentar, pesan sedang diproses...');
    return;
  }
  if (!conversationId) {
    messageRenderer?.addSystemMessage('❌ Session ID invalid');
    return;
  }
  input.value = '';
  input.style.height = '';
  input.disabled = true;
  sendBtn.disabled = true;
  isWaiting = true;
  resetInactiveTimer();
  try {
    const optimisticMsg = sendQueue?.enqueue({
      roomId: conversationId,
      text,
      attachment: attachmentUrl,
      sender: 'user',
      agent: currentAgent.name
    });
    if (!optimisticMsg) {
      throw new Error('Failed to enqueue message');
    }
    setTimeout(() => {
      fetch('https://livechat.sisitusdotcom.workers.dev/', {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `action=generateAIReply&roomId=${conversationId}`
      }).then(async res => {
        if (!res.ok) {
          const err = await res.text();
          console.error("Auto-Pilot API Error:", res.status, err);
        }
      }).catch(e => console.error("Auto-Pilot trigger network failed:", e));
    }, 1500);
  } catch (error) {
    console.log('Error sending message:', error);
    messageRenderer?.addSystemMessage(`❌ Gagal mengirim. Error: ${error.message}`);
  } finally {
    isWaiting = false;
    setTimeout(() => {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }, 2000);
  }
}
if (chatBtn) {
  chatBtn.addEventListener('click', () => {
    if (chatModal && (chatModal.style.display === 'flex' || chatModal.style.display === 'block')) {
      closeModal();
    } else {
      openModal();
    }
  });
}
if (modalOverlay) {
  modalOverlay.addEventListener('click', () => {
    closeModal(); // Tutup saat klik di luar kotak obrolan
  });
}
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');
if (attachBtn && fileInput) {
  attachBtn.addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      messageRenderer?.addSystemMessage('❌ File terlalu besar (Maks 5MB)');
      return;
    }
    const spinnerMsg = messageRenderer?.addSystemMessage('<i class="fas fa-spinner fa-spin"></i> Mengunggah file...');
    attachBtn.disabled = true;
    input.disabled = true;
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
              await sendMessage(result.fileUrl);
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
    } catch (error) {
      if (spinnerMsg && spinnerMsg.parentNode) spinnerMsg.remove();
      messageRenderer?.addSystemMessage('❌ Gagal mengunggah: ' + error.message);
      attachBtn.disabled = false;
      input.disabled = false;
      sendBtn.disabled = false;
      fileInput.value = '';
      input.focus();
    }
    if (spinnerMsg && spinnerMsg.parentNode) spinnerMsg.remove();
    attachBtn.disabled = false;
    input.disabled = false;
    sendBtn.disabled = false;
    fileInput.value = '';
    input.focus();
  });
}
let typingTimeout = null;
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    resetInactiveTimer();
    sendMessage(null);
  });
}
if (input) {
  input.addEventListener('input', function(e) {
    this.style.height = '';
    this.style.height = Math.min(this.scrollHeight + 2, 100) + 'px';
    localStorage.setItem('livechat_user_draft', this.value);
    resetInactiveTimer();
    if (!conversationId) return;
    const {
      ref,
      set
    } = window.firebaseHelpers;
    const db = window.firebaseDB;
    const typingRef = ref(db, `rooms/${conversationId}/typing/user`);
    set(typingRef, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      set(typingRef, false);
    }, 2000);
  });
  input.addEventListener('keydown', (e) => {
    resetInactiveTimer();
    const isMobile = window.innerWidth <= 768;
    if (e.key === 'Enter') {
      if (isMobile) {
        return;
      }
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      if (!isWaiting && input.value.trim().length > 0) {
        if (typingTimeout) clearTimeout(typingTimeout);
        const {
          ref,
          set
        } = window.firebaseHelpers;
        const db = window.firebaseDB;
        set(ref(db, `rooms/${conversationId}/typing/user`), false);
        sendMessage(null);
        input.style.height = '38px'; // Reset height
        localStorage.removeItem('livechat_user_draft'); // Hapus draft
      }
    }
  });
}
window.addEventListener('online', () => {
  syncEngine?.syncNow();
});
window.addEventListener('offline', () => {
  messageRenderer?.addSystemMessage('⚠️ Anda sedang offline.');
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && chatModal && chatModal.style.display === 'flex') {
    lastReadTimestamp = Date.now();
    localStorage.setItem('lastReadTimestamp', lastReadTimestamp);
    recalculateUnread();
  }
});

function initUser() {
  if (conversationId) {
    initializeChatModules();
    syncEngine?.startSync(conversationId, 'user');
    updateUnreadBadge(); // Display badge if there were unread messages on load
  }
  if (window.firebaseHelpers && window.firebaseDB) {
    const {
      ref,
      onValue
    } = window.firebaseHelpers;
    const statusRef = ref(window.firebaseDB, 'settings/livechat/isOnline');
    const widget = document.querySelector('.livechat-widget');
    onValue(statusRef, (snapshot) => {
      const isOnline = snapshot.val();
      if (widget) {
        if (isOnline === false) {
          widget.style.display = 'none';
          if (chatModal && chatModal.style.display === 'flex' && typeof closeModal === 'function') {
            closeModal();
          }
        } else {
          widget.style.display = '';
        }
      }
    });
  }
}
if (window.firebaseDB) {
  initUser();
} else {
  window.addEventListener('firebase-ready', initUser);
}