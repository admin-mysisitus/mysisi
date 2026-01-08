import { footerSocialData, footerContactData, footerMapData } from './config.js';

// Generate Footer Sosial Media
const generateFooterSocial = () => {
  const container = document.querySelector('.footer-sosmed');
  if (!container) return;
  footerSocialData.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.setAttribute('aria-label', item.ariaLabel);
    a.setAttribute('target', '_blank');
    a.innerHTML = `<i class="${item.iconClass}"></i>`;
    container.appendChild(a);
  });
};

// Generate Footer Kontak
const generateFooterContact = () => {
  const container = document.querySelector('.footer-kontak');
  if (!container) return;
  footerContactData.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="${item.iconClass}" aria-hidden="true"></i>`;
    const span = document.createElement('span');
    if (item.link) {
      const a = document.createElement('a');
      a.href = item.link;
      a.className = 'footer-kontak-link';
      a.textContent = item.text;
      span.appendChild(a);
    } else {
      span.textContent = item.text;
    }
    li.appendChild(span);
    container.appendChild(li);
  });
};

// Generate Footer Map
const generateFooterMap = () => {
  const container = document.querySelector('.footer-col:nth-child(4)');
  if (!container) return;
  const iframe = document.createElement('iframe');
  iframe.className = 'footer-map';
  iframe.src = footerMapData.src;
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  iframe.setAttribute('title', footerMapData.title);
  container.appendChild(iframe);
};

document.addEventListener('DOMContentLoaded', () => {
  generateFooterSocial();
  generateFooterContact();
  generateFooterMap();
});
