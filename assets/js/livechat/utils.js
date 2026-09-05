function sanitizeMessage(text) {
  if (typeof DOMPurify === 'undefined') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

function validateMessage(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > CONFIG.MAX_MESSAGE_LENGTH) return false;
  return true;
}

function truncateString(str, maxLength = 15) {
  if (!str || str.length <= maxLength) return str || '(No message)';
  return str.substring(0, maxLength) + '...';
}

function isValidRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return false;
  return roomId.length > 5;
}

function isOnline() {
  return navigator.onLine;
}
async function openAttachmentModal(rawUrl, isPdfHint) {
  const modal = document.getElementById('attachmentModal');
  const loader = document.getElementById('attachmentLoading');
  const errorEl = document.getElementById('attachmentError');
  const imgFrame = document.getElementById('attachmentImg');
  const pdfFrame = document.getElementById('attachmentFrame');
  if (!modal) return;
  modal.classList.add('active');
  loader.style.display = 'flex';
  errorEl.style.display = 'none';
  imgFrame.style.display = 'none';
  pdfFrame.style.display = 'none';
  imgFrame.src = '';
  pdfFrame.src = '';
  try {
    const urlParams = new URLSearchParams({
      action: 'getFile',
      fileUrl: rawUrl
    });
    const res = await fetch(`${CONFIG.GAS_URL}?${urlParams.toString()}`);
    const data = await res.json();
    if (data && data.status === 'success' && data.fileData) {
      loader.style.display = 'none';
      const mime = (data.mimetype || '').toLowerCase();
      const isActualPdf = isPdfHint || mime.includes('pdf');
      if (isActualPdf) {
        pdfFrame.src = data.fileData + "#toolbar=0&navpanes=0&scrollbar=0";
        pdfFrame.style.display = 'block';
      } else {
        imgFrame.src = data.fileData;
        imgFrame.style.display = 'block';
      }
    } else {
      throw new Error(data.message || 'Data tidak ditemukan');
    }
  } catch (err) {
    console.log("Gagal memuat lampiran:", err);
    loader.style.display = 'none';
    errorEl.style.display = 'flex';
  }
}

function closeAttachmentModal() {
  const modal = document.getElementById('attachmentModal');
  if (modal) {
    modal.classList.remove('active');
    const imgFrame = document.getElementById('attachmentImg');
    const pdfFrame = document.getElementById('attachmentFrame');
    if (imgFrame) imgFrame.src = '';
    if (pdfFrame) pdfFrame.src = '';
  }
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAttachmentModal();
  }
});