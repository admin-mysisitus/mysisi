/**
 * ============================================================================
 * MessageRenderer.js - Idempotent DOM Rendering
 * ============================================================================
 * 
 * Renders message state to DOM with:
 * - Idempotent updates (safe to replay)
 * - Deduplication by message ID
 * - Minimal DOM operations
 * - Caching of message elements
 * 
 * NO STATE MANAGEMENT - read-only view of messageStore
 */
class MessageRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`Container not found: ${containerSelector}`);
      return;
    }
    // Cache message elements by ID for O(1) lookups
    this.elementCache = new Map();
    // Track rendered message IDs
    this.renderedIds = new Set();
  }
  // ========================================
  // RENDERING OPERATIONS
  // ========================================
  /**
   * Render messages from store (INITIAL LOAD ONLY)
   * CRITICAL: This does a full initial render on page load
   * Subsequent polling uses addMessages() for incremental rendering
   * @param {Array} messages - Array of message objects (sorted by createdAt)
   * @param {Object} currentUser - Current user info {id, type}
   */
  renderMessages(messages, currentUser = {
    type: "user"
  }) {
    if (!messages || messages.length === 0) {
      return;
    }
    // SAFETY: Detect and remove duplicate message IDs within the batch
    // This can happen if messageIdOrder gets corrupted somehow
    const seenIds = new Set();
    const deduplicatedMessages = [];
    for (const msg of messages) {
      if (!seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        deduplicatedMessages.push(msg);
      } else {}
    }
    // Only render messages not yet in DOM (incremental approach)
    const newMessages = deduplicatedMessages.filter(msg => !this.renderedIds.has(msg.id));
    if (newMessages.length === 0) {
      return; // Nothing new to render
    }
    // Check if we should auto-scroll (FIX #6)
    const shouldScroll = this._shouldAutoScroll();
    // Build fragment with only new messages
    const fragment = document.createDocumentFragment();
    newMessages.forEach(message => {
      const msgEl = this._createMessageElement(message, currentUser);
      if (msgEl) {
        fragment.appendChild(msgEl);
        this.elementCache.set(message.id, msgEl);
        this.renderedIds.add(message.id);
      }
    });
    // Append all new messages at once (FIX #4: Incremental, not bulk)
    if (fragment.children.length > 0) {
      this.container.appendChild(fragment);
    }
    // Conditional scroll (FIX #7: Only if needed)
    if (shouldScroll) {
      this._scrollToBottom();
    }
  }
  /**
   * Add single message (for buffered rendering)
   * Called from syncEngine during polling with batched messages
   */
  addMessage(message, currentUser = {
    type: "user"
  }) {
    if (!message || !message.id) {
      return null;
    }
    // Skip if already rendered
    if (this.renderedIds.has(message.id)) {
      // Already in DOM, just update
      const existing = this.elementCache.get(message.id);
      if (existing) {
        this._updateMessageElement(existing, message, currentUser);
      }
      return existing;
    }
    // Create and append new element
    const msgEl = this._createMessageElement(message, currentUser);
    if (!msgEl) {
      return null;
    }
    this.container.appendChild(msgEl);
    this.elementCache.set(message.id, msgEl);
    this.renderedIds.add(message.id);
    return msgEl;
  }
  /**
   * Add multiple messages (FIX #4 + #7: Incremental batch render)
   * Only renders NEW messages, auto-scroll is conditional
   */
  addMessages(messages, currentUser = {
    type: "user"
  }) {
    if (!messages || messages.length === 0) {
      return;
    }
    // Check scroll position BEFORE adding messages
    const shouldScroll = this._shouldAutoScroll();
    // Add each message with duplicate detection
    const fragment = document.createDocumentFragment();
    const processedIds = new Set();
    let addedCount = 0;
    messages.forEach(message => {
      if (!message || !message.id) return;
      // Skip duplicates within this batch (safety check)
      if (processedIds.has(message.id)) {
        return;
      }
      processedIds.add(message.id);
      // Skip already rendered
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
    // Append all at once
    if (fragment.children.length > 0) {
      this.container.appendChild(fragment);
    }
    // Conditional auto-scroll (FIX #7)
    if (shouldScroll && addedCount > 0) {
      this._scrollToBottom();
    }
  }
  /**
   * Check if auto-scroll should happen (FIX #6)
   * Only scroll if user is already near bottom
   * @returns {boolean} True if should auto-scroll
   */
  _shouldAutoScroll() {
    const scrollableHeight = this.container.scrollHeight - this.container.clientHeight;
    const currentScroll = this.container.scrollTop;
    const distanceFromBottom = scrollableHeight - currentScroll;
    // Only auto-scroll if user is within 100px of bottom
    return distanceFromBottom < 100;
  }
  /**
   * Scroll to bottom (internal helper)
   */
  _scrollToBottom() {
    try {
      this.container.scrollTop = this.container.scrollHeight;
    } catch (e) {
      // Scroll might fail if container is not visible
    }
  }
  /**
   * Add single message (incremental)
   * @param {Object} message - Message object
   * @param {Object} currentUser - Current user info
   */
  addMessage(message, currentUser = {
    type: "user"
  }) {
    if (!message || !message.id) {
      return null;
    }
    const messageId = message.id;
    // STRICT RENDER CHECK 1: Already rendered?
    if (this.renderedIds.has(messageId)) {
      const cached = this.elementCache.get(messageId);
      if (cached && this.container.contains(cached)) {
        // Element exists, just update status if needed
        this._updateMessageElement(cached, message, currentUser);
        return cached;
      }
    }
    // STRICT RENDER CHECK 2: Check if in DOM by data attribute
    const existingEl = this.container.querySelector(`[data-message-id="${this._sanitize(messageId)}"]`);
    if (existingEl) {
      this.elementCache.set(messageId, existingEl);
      this.renderedIds.add(messageId);
      return existingEl;
    }
    // Create and append new message element
    const msgEl = this._createMessageElement(message, currentUser);
    if (!msgEl) {
      return null;
    }
    // Append and cache
    this.container.appendChild(msgEl);
    this.elementCache.set(messageId, msgEl);
    this.renderedIds.add(messageId);
    this.scrollToBottom();
    return msgEl;
  }
  /**
   * Scroll to bottom of message container
   */
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
  /**
   * Add system message
   * @param {string} html - HTML content
   */
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
  /**
   * Clear all messages
   */
  clear() {
    this.container.innerHTML = '';
    this.elementCache.clear();
    this.renderedIds.clear();
  }
  // ========================================
  // INTERNAL DOM CREATION
  // ========================================
  /**
   * Create message DOM element
   */
  _createMessageElement(message, currentUser) {
    if (!message || !message.id) {
      return null;
    }
    const msg = document.createElement('div');
    msg.classList.add('message', message.sender === 'admin' ? 'agent' : 'user');
    msg.setAttribute('data-message-id', this._sanitize(message.id));
    msg.setAttribute('data-created-at', message.createdAt);
    // Content container
    const msgContent = document.createElement('div');
    msgContent.classList.add('msg-content');
    // Agent name tag (NOW OUTSIDE BUBBLE)
    let nameTag = null;
    if (message.sender === 'admin') {
      nameTag = document.createElement('div');
      nameTag.classList.add('agent-label');
      const agentDisplay = message.agent && message.agent.trim() ? message.agent : 'Admin';
      nameTag.textContent = this._sanitize(agentDisplay);
    }
    // Message text (if any)
    if (message.message && message.message.trim().length > 0) {
      const textNode = document.createElement('div');
      textNode.classList.add('msg-text');
      textNode.innerHTML = this._sanitize(message.message);
      msgContent.appendChild(textNode);
    }
    // Attachment
    if (message.attachment) {
      const attachContainer = document.createElement('div');
      attachContainer.classList.add('chat-attachment');
      const rawUrl = message.attachment;
      const isPdf = typeof rawUrl === 'string' && rawUrl.toLowerCase().includes('.pdf');
      if (isPdf) {
        // For PDF, just show the button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-view-attachment';
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Lihat PDF';
        btn.onclick = () => {
          window.openAttachmentModal(rawUrl, true);
        };
        attachContainer.appendChild(btn);
      } else {
        // For Image, show inline preview fetching base64 asynchronously
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
        // Modal trigger on click
        imgContainer.onclick = () => {
          window.openAttachmentModal(rawUrl, false);
        };
        // Extract fileId for caching
        let fileId = rawUrl;
        const match = rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match) fileId = match[1];
        // Check sessionStorage cache to avoid redundant GAS calls
        const cacheKey = 'img_cache_' + fileId;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          img.src = cached;
          img.style.display = 'block';
          spinner.style.display = 'none';
          imgContainer.style.background = 'transparent';
        } else {
          // Fetch from GAS proxy
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
              } catch (e) {} // Ignore quota errors
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
    // Wrapper for grouping name, bubble, and time
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
  /**
   * Update existing message element
   * CRITICAL: Only update status icons on messages sent by current user
   */
  _updateMessageElement(msgEl, message, currentUser) {
    if (!msgEl) {
      return false;
    }
    let changed = false;
    // Update created-at if different
    const currentCreatedAt = msgEl.getAttribute('data-created-at');
    if (currentCreatedAt !== message.createdAt) {
      msgEl.setAttribute('data-created-at', message.createdAt);
      changed = true;
    }
    // Update text if different
    const textNode = msgEl.querySelector('.msg-text');
    if (textNode && textNode.innerHTML !== this._sanitize(message.message)) {
      textNode.innerHTML = this._sanitize(message.message);
      changed = true;
    }
    return changed;
  }
  /**
   * Format current time
   */
  _getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  /**
   * Sanitize text for display
   */
  _sanitize(text) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'br', 'a'],
        ALLOWED_ATTR: ['href', 'target']
      });
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  // ========================================
  // QUERY METHODS
  // ========================================
  /**
   * Get rendered message element by ID
   */
  getMessageElement(messageId) {
    return this.elementCache.get(messageId) || null;
  }
  /**
   * Get all rendered message elements
   */
  getAllMessageElements() {
    return Array.from(this.elementCache.values());
  }
  /**
   * Get count of rendered messages
   */
  getRenderedCount() {
    return this.renderedIds.size;
  }
  /**
   * Check if message is rendered
   */
  isMessageRendered(messageId) {
    return this.renderedIds.has(messageId);
  }
}
// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageRenderer;
}