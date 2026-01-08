// Aplikasikan Style Khusus untuk Teks "PPAI Darul Huda"
const applyPpaiDarulHudaFont = (root = document.body) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/PPAI Darul Huda/i.test(node.nodeValue)) {
      let el = node.parentNode;
      let skip = false;
      while (el && el !== document.body) {
        if (el.hasAttribute && el.hasAttribute('data-no-dh')) {
          skip = true;
          break;
        }
        el = el.parentNode;
      }
      if (!skip) {
        nodes.push(node);
      }
    }
  }
  for (const node of nodes) {
    if (node.parentNode.classList?.contains('ppai-darulhuda-font')) continue;
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(PPAI Darul Huda)/i).forEach(part => {
      if (/PPAI Darul Huda/i.test(part)) {
        const span = document.createElement('span');
        span.className = 'ppai-darulhuda-font';
        span.textContent = part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(frag, node);
  }
};

// Jalankan pertama kali untuk seluruh halaman
applyPpaiDarulHudaFont(document.body);

// Pasang observer untuk elemen baru yang dimuat secara dinamis
const textObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        applyPpaiDarulHudaFont(node);
      }
    }
  }
});

textObserver.observe(document.body, {
  childList: true,
  subtree: true
});
