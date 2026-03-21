// Aplikasikan Style Khusus untuk Teks "sisitus.com"
const applySisitusComFont = (root = document.body) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/sisitus.com/i.test(node.nodeValue)) {
      let el = node.parentNode;
      let skip = false;
      while (el && el !== document.body) {
        if (el.hasAttribute && el.hasAttribute('data-no-sc')) {
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
    if (node.parentNode.classList?.contains('sisitus-com-font')) continue;
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(sisitus.com)/i).forEach(part => {
      if (/sisitus.com/i.test(part)) {
        const span = document.createElement('span');
        span.className = 'sisitus-com-font';
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
applySisitusComFont(document.body);

// Pasang observer untuk elemen baru yang dimuat secara dinamis
const textObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        applySisitusComFont(node);
      }
    }
  }
});

textObserver.observe(document.body, {
  childList: true,
  subtree: true
});
