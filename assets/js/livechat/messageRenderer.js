class MessageRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.log(`Container not found: ${containerSelector}`);
      return;
    }
    this.elementCache = new Map();
    this.renderedIds = new Set();
    const oldBtn = this.container.parentElement.querySelector('.lc-scroll-bottom-btn');
    if (oldBtn) {
      oldBtn.remove();
    }
    if (this.container._lcScrollHandler) {
      this.container.removeEventListener('scroll', this.container._lcScrollHandler);
    }
    this.scrollBtn = document.createElement('button');
    this.scrollBtn.className = 'lc-scroll-bottom-btn';
    this.scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    this.scrollBtn.title = 'Ke pesan terbaru';
    Object.assign(this.scrollBtn.style, {
      position: 'absolute',
      bottom: '90px',
      right: '20px',
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      color: '#6b7280',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: '100',
      transition: 'all 0.2s ease',
      outline: 'none'
    });
    if (window.getComputedStyle(this.container.parentElement).position === 'static') {
      this.container.parentElement.style.position = 'relative';
    }
    this.container.parentElement.appendChild(this.scrollBtn);
    this.scrollBtn.addEventListener('click', () => {
      this.scrollToBottom(true);
    });
    this.container._lcScrollHandler = () => {
      localStorage.setItem('livechat_scroll_pos', this.container.scrollTop);
      const scrollableHeight = this.container.scrollHeight - this.container.clientHeight;
      const isScrollable = scrollableHeight > 0;
      const distanceFromBottom = scrollableHeight - this.container.scrollTop;
      if (isScrollable && distanceFromBottom > 250) {
        this.scrollBtn.style.display = 'flex';
      } else {
        this.scrollBtn.style.display = 'none';
        this.scrollBtn.style.color = '#6b7280';
        this.scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
      }
    };
    this.container.addEventListener('scroll', this.container._lcScrollHandler);
  }
  renderMessages(messages, currentUser = {
    type: "user"
  }) {
    if (!messages || messages.length === 0) {
      return;
    }
    const seenIds = new Set();
    const deduplicatedMessages = [];
    for (const msg of messages) {
      if (!seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        deduplicatedMessages.push(msg);
      } else {}
    }
    const newMessages = deduplicatedMessages.filter(msg => !this.renderedIds.has(msg.id));
    if (newMessages.length === 0) {
      return;
    }
    const shouldScroll = this._shouldAutoScroll();
    const isInitialLoad = (this.renderedIds.size === 0);
    const fragment = document.createDocumentFragment();
    newMessages.forEach(message => {
      const msgEl = this._createMessageElement(message, currentUser);
      if (msgEl) {
        fragment.appendChild(msgEl);
        this.elementCache.set(message.id, msgEl);
        this.renderedIds.add(message.id);
      }
    });
    if (fragment.children.length > 0) {
      this.container.appendChild(fragment);
      this._applyGrouping();
    }
    if (isInitialLoad) {
      const savedScrollPos = localStorage.getItem('livechat_scroll_pos');
      if (savedScrollPos !== null) {
        setTimeout(() => {
          this.container.scrollTop = parseInt(savedScrollPos, 10);
        }, 10);
      } else {
        this.scrollToBottom();
      }
    } else if (shouldScroll) {
      this.scrollToBottom();
    } else if (this.scrollBtn) {
      this.scrollBtn.style.display = 'flex';
      this.scrollBtn.style.color = '#ef4444';
      this.scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i><span style="position:absolute;top:4px;right:6px;width:8px;height:8px;background-color:#ef4444;border-radius:50%;border:2px solid #fff;"></span>';
    }
  }
  addMessage(message, currentUser = {
    type: "user"
  }) {
    if (!message || !message.id) {
      return null;
    }
    if (this.renderedIds.has(message.id)) {
      const existing = this.elementCache.get(message.id);
      if (existing) {
        this._updateMessageElement(existing, message, currentUser);
      }
      return existing;
    }
    const msgEl = this._createMessageElement(message, currentUser);
    if (!msgEl) {
      return null;
    }
    this.container.appendChild(msgEl);
    this.elementCache.set(message.id, msgEl);
    this.renderedIds.add(message.id);
    return msgEl;
  }
  addMessages(messages, currentUser = {
    type: "user"
  }) {
    if (!messages || messages.length === 0) {
      return;
    }
    const shouldScroll = this._shouldAutoScroll();
    const fragment = document.createDocumentFragment();
    const processedIds = new Set();
    let addedCount = 0;
    messages.forEach(message => {
      if (!message || !message.id) return;
      if (processedIds.has(message.id)) {
        return;
      }
      processedIds.add(message.id);
      if (this.renderedIds.has(message.id)) {
        return;
      }
      const msgEl = this._createMessageElement(message, currentUser);
      if (msgEl) {
        fragment.appendChild(msgEl);
        this.elementCache.set(message.id, msgEl);
        this.renderedIds.add(message.id);
        addedCount++;
      }
    });
    if (fragment.children.length > 0) {
      this.container.appendChild(fragment);
      this._applyGrouping();
    }
    if (addedCount > 0) {
      if (shouldScroll) {
        this.scrollToBottom();
      } else if (this.scrollBtn) {
        this.scrollBtn.style.display = 'flex';
        this.scrollBtn.style.color = '#ef4444';
        this.scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i><span style="position:absolute;top:4px;right:6px;width:8px;height:8px;background-color:#ef4444;border-radius:50%;border:2px solid #fff;"></span>';
      }
    }
  }
  _shouldAutoScroll() {
    const scrollableHeight = this.container.scrollHeight - this.container.clientHeight;
    const currentScroll = this.container.scrollTop;
    const distanceFromBottom = scrollableHeight - currentScroll;
    return distanceFromBottom < 100;
  }
  _scrollToBottom() {
    try {
      this.container.scrollTop = this.container.scrollHeight;
    } catch (e) {}
  }
  addMessage(message, currentUser = {
    type: "user"
  }) {
    if (!message || !message.id) {
      return null;
    }
    const messageId = message.id;
    if (this.renderedIds.has(messageId)) {
      const cached = this.elementCache.get(messageId);
      if (cached && this.container.contains(cached)) {
        this._updateMessageElement(cached, message, currentUser);
        return cached;
      }
    }
    const existingEl = this.container.querySelector(`[data-message-id="${this._sanitize(messageId)}"]`);
    if (existingEl) {
      this.elementCache.set(messageId, existingEl);
      this.renderedIds.add(messageId);
      return existingEl;
    }
    const msgEl = this._createMessageElement(message, currentUser);
    if (!msgEl) {
      return null;
    }
    const shouldScroll = this._shouldAutoScroll();
    this.container.appendChild(msgEl);
    this.elementCache.set(messageId, msgEl);
    this.renderedIds.add(messageId);
    this._applyGrouping();
    if (shouldScroll) {
      this.scrollToBottom();
    } else if (this.scrollBtn) {
      this.scrollBtn.style.display = 'flex';
      this.scrollBtn.style.color = '#ef4444';
      this.scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i><span style="position:absolute;top:4px;right:6px;width:8px;height:8px;background-color:#ef4444;border-radius:50%;border:2px solid #fff;"></span>';
    }
    return msgEl;
  }
  scrollToBottom(smooth = false) {
    if (!this.container) {
      return;
    }
    if (smooth) {
      this.container.scrollTo({
        top: this.container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }
  addSystemMessage(html) {
    if (!this.container) {
      return null;
    }
    const sys = document.createElement('div');
    sys.classList.add('system-message');
    sys.innerHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['i'],
      ALLOWED_ATTR: ['class']
    });
    this.container.appendChild(sys);
    this.scrollToBottom();
    return sys;
  }
  clear() {
    this.container.innerHTML = '';
    localStorage.removeItem('livechat_scroll_pos');
    this.elementCache.clear();
    this.renderedIds.clear();
  }
  _applyGrouping() {
    if (!this.container) return;
    const messages = Array.from(this.container.children).filter(el => el.classList.contains('message') && !el.classList.contains('system-message') && !el.classList.contains('typing-indicator'));
    let prevKey = null;
    messages.forEach(msg => {
      const key = msg.getAttribute('data-sender-key');
      if (key && key === prevKey) {
        msg.classList.add('consecutive');
      } else {
        msg.classList.remove('consecutive');
      }
      prevKey = key;
    });
  }
  _createMessageElement(message, currentUser) {
    if (!message || !message.id) {
      return null;
    }
    const msg = document.createElement('div');
    msg.classList.add('message', message.sender === 'admin' ? 'agent' : 'user');
    msg.setAttribute('data-message-id', this._sanitize(message.id));
    msg.setAttribute('data-created-at', message.createdAt);
    const senderKey = message.sender === 'admin' ? ('admin-' + (message.agent ? message.agent.trim() : 'Admin')) : 'user';
    msg.setAttribute('data-sender-key', this._sanitize(senderKey));
    const msgContent = document.createElement('div');
    msgContent.classList.add('msg-content');
    let nameTag = null;
    if (message.sender === 'admin') {
      nameTag = document.createElement('div');
      nameTag.classList.add('agent-label');
      const agentDisplay = message.agent && message.agent.trim() ? message.agent : 'Admin';
      nameTag.textContent = this._sanitize(agentDisplay);
    }
    if (message.message && message.message.trim().length > 0) {
      const textNode = document.createElement('div');
      textNode.classList.add('msg-text');
      const parsedText = this._parseNotedTags(message.message);
      textNode.innerHTML = this._sanitize(parsedText);
      msgContent.appendChild(textNode);
    }
    if (message.attachment) {
      const attachContainer = document.createElement('div');
      attachContainer.classList.add('chat-attachment');
      const rawUrl = message.attachment;
      const isPdf = typeof rawUrl === 'string' && rawUrl.toLowerCase().includes('.pdf');
      if (isPdf) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-view-attachment';
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Lihat PDF';
        btn.onclick = () => {
          window.openAttachmentModal(rawUrl, true);
        };
        attachContainer.appendChild(btn);
      } else {
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative';
        imgContainer.style.minHeight = '120px';
        imgContainer.style.minWidth = '120px';
        imgContainer.style.display = 'flex';
        imgContainer.style.alignItems = 'center';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.background = 'rgba(0,0,0,0.05)';
        imgContainer.style.borderRadius = '8px';
        imgContainer.style.overflow = 'hidden';
        imgContainer.style.marginBottom = '5px';
        imgContainer.style.cursor = 'pointer';
        const spinner = document.createElement('i');
        spinner.className = 'fas fa-spinner fa-spin fa-2x';
        spinner.style.color = '#a0aec0';
        const img = document.createElement('img');
        img.style.display = 'none';
        img.alt = 'Lampiran Gambar';
        img.style.width = '100%';
        img.style.height = '200px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        imgContainer.appendChild(spinner);
        imgContainer.appendChild(img);
        attachContainer.appendChild(imgContainer);
        imgContainer.onclick = () => {
          window.openAttachmentModal(rawUrl, false);
        };
        let fileId = rawUrl;
        const match = rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
        const cacheKey = 'img_cache_' + fileId;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          img.src = cached;
          img.style.display = 'block';
          spinner.style.display = 'none';
          imgContainer.style.background = 'transparent';
        } else {
          const urlParams = new URLSearchParams({
            action: 'getFile',
            fileUrl: rawUrl
          });
          fetch(`${CONFIG.GAS_URL}?${urlParams.toString()}`).then(res => res.json()).then(data => {
            if (data && data.status === 'success' && data.fileData) {
              img.src = data.fileData;
              img.style.display = 'block';
              spinner.style.display = 'none';
              imgContainer.style.background = 'transparent';
              try {
                sessionStorage.setItem(cacheKey, data.fileData);
              } catch (e) {}
            } else {
              throw new Error("Invalid response");
            }
          }).catch(err => {
            spinner.className = 'fas fa-exclamation-triangle fa-2x';
            spinner.style.color = '#ef4444';
            spinner.title = 'Gagal memuat pratinjau';
          });
        }
      }
      msgContent.appendChild(attachContainer);
    }
    const msgWrapper = document.createElement('div');
    msgWrapper.classList.add('msg-wrapper');
    if (nameTag) {
      msgWrapper.appendChild(nameTag);
    }
    msgWrapper.appendChild(msgContent);
    const timeTag = document.createElement('div');
    timeTag.classList.add('time');
    timeTag.textContent = message.time || this._getCurrentTime();
    msgWrapper.appendChild(timeTag);
    msg.appendChild(msgWrapper);
    return msg;
  }
  _updateMessageElement(msgEl, message, currentUser) {
    if (!msgEl) {
      return false;
    }
    let changed = false;
    const currentCreatedAt = msgEl.getAttribute('data-created-at');
    if (currentCreatedAt !== message.createdAt) {
      msgEl.setAttribute('data-created-at', message.createdAt);
      changed = true;
    }
    const textNode = msgEl.querySelector('.msg-text');
    if (textNode) {
      const parsedText = this._parseNotedTags(message.message);
      if (textNode.innerHTML !== this._sanitize(parsedText)) {
        textNode.innerHTML = this._sanitize(parsedText);
        changed = true;
      }
    }
    return changed;
  }
  _getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  _sanitize(text) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'br', 'a', 'ul', 'ol', 'li', 'div', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'class']
      });
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  _parseNotedTags(text) {
    if (!text || typeof text !== 'string') return text;
    let parsedText = text;
    let waHtml = '';
    if (parsedText.includes('[ACTION: WHATSAPP]')) {
      parsedText = parsedText.replace(/\[ACTION:\s*WHATSAPP\]/gi, '').trim();
      waHtml = `<div class="wa-action-container"><a href="https://wa.me/62882010067695" target="_blank" class="btn-whatsapp-payment"><i class="fab fa-whatsapp"></i> Konfirmasi Pesanan</a></div>`;
    }
    const notedRegex = /\[([^\]]+?):\s*([^\]]+?)\]/g;
    if (!notedRegex.test(parsedText)) {
      let tempHtml = parsedText.trim();
      if (waHtml) {
        tempHtml += (tempHtml ? '<br><br>' : '') + waHtml;
      }
      return tempHtml.replace(/^(<br\s*\/?>)+/gi, '').trim();
    }
    notedRegex.lastIndex = 0;
    let hasNotes = false;
    let notesHtml = '<div class="noted-kak-container"><div class="noted-kak-header"><i class="fas fa-clipboard-check"></i> Pesanan Dicatat</div>';
    parsedText = parsedText.replace(notedRegex, (match, key, value) => {
      hasNotes = true;
      notesHtml += `<div class="noted-kak-item"><i class="fas fa-check-circle"></i> <b>${key}:</b> ${value}</div>`;
      return '';
    });
    notesHtml += '</div>';
    let finalHtml = parsedText.trim();
    if (hasNotes) {
      finalHtml += (finalHtml ? '<br><br>' : '') + notesHtml;
    }
    if (waHtml) {
      finalHtml += (finalHtml ? '<br><br>' : '') + waHtml;
    }
    return finalHtml.replace(/^(<br\s*\/?>)+/gi, '').trim();
  }
  getMessageElement(messageId) {
    return this.elementCache.get(messageId) || null;
  }
  getAllMessageElements() {
    return Array.from(this.elementCache.values());
  }
  getRenderedCount() {
    return this.renderedIds.size;
  }
  isMessageRendered(messageId) {
    return this.renderedIds.has(messageId);
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageRenderer;
}