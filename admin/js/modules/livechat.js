// Live Chat Admin Module
// Lazy loads the Live Chat dependencies to prevent blocking other admin pages.
export async function render() {
  void('Admin Live Chat Module Loaded');
  // Load Admin Chat CSS if not exists
  if (!document.getElementById('livechat-admin-css')) {
    const css = document.createElement('link');
    css.id = 'livechat-admin-css';
    css.rel = 'stylesheet';
    css.href = '/styles/livechat.css';
    document.head.appendChild(css);
  }
  // Load global modal CSS for attachment modal
  if (!document.getElementById('global-modal-css')) {
    const modalCss = document.createElement('link');
    modalCss.id = 'global-modal-css';
    modalCss.rel = 'stylesheet';
    modalCss.href = '/assets/css/components/modal.css';
    document.head.appendChild(modalCss);
  }
  // Load DOMPurify if not exists
  if (!window.DOMPurify) {
    await loadScript("https://cdn.jsdelivr.net/npm/dompurify@3.0.9/dist/purify.min.js");
  }
  // Load Firebase using core module
  if (!window.firebase) {
    const {
      getFirebase
    } = await import('/assets/js/modules/firebase-core.js');
    await getFirebase();
  }
  // Ensure config and dependencies are loaded
  if (typeof CONFIG === 'undefined') {
    await loadScript("/assets/js/livechat/config.js");
    await loadScript("/assets/js/livechat/sessionCache.js");
    await loadScript("/assets/js/livechat/messageStore.js");
    await loadScript("/assets/js/livechat/messageRenderer.js");
    await loadScript("/assets/js/livechat/syncEngine.js");
    await loadScript("/assets/js/livechat/sendQueue.js");
    await loadScript("/assets/js/livechat/utils.js");
  }
  // Load admin logic
  // We append a timestamp to force fresh execution if needed, 
  // or just load it normally. Since it attaches to DOM on execution, 
  // we must ensure it executes AFTER the DOM is inserted.
  // We use a fresh script element.
  const existingAdminScript = document.getElementById('livechat-admin-logic');
  if (existingAdminScript) {
    existingAdminScript.remove(); // Remove old one
  }
  await loadScript("/js/modules/livechat-logic.js", "livechat-admin-logic");
}

function loadScript(src, id = null) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    if (id) script.id = id;
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}