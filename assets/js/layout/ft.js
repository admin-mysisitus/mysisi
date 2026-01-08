// root/assets/js/layout/ft.js
import { CONFIG } from '../config.js';

const generateSocialMedia = () => {
  const container = document.querySelector('.footer-sosmed');
  if (!container) return;
  CONFIG.socialMedia.forEach(social => {
    const a = document.createElement('a');
    a.href = social.href;
    a.ariaLabel = social.ariaLabel;
    a.target = '_blank';
    a.innerHTML = `<i class="${social.icon}"></i>`;
    container.appendChild(a);
  });
};

const generateContact = () => {
  const container = document.querySelector('.footer-kontak');
  if (!container) return;
  const contacts = [
    { icon: 'fas fa-map-marker-alt', text: CONFIG.contact.address },
    { icon: 'fas fa-phone-alt', text: `<a href="${CONFIG.contact.phoneHref}" class="footer-kontak-link">${CONFIG.contact.phone}</a>` },
    { icon: 'fas fa-envelope', text: `<a href="${CONFIG.contact.emailHref}" class="footer-kontak-link">${CONFIG.contact.email}</a>` },
    { icon: 'fas fa-clock', text: CONFIG.contact.hours }
  ];
  contacts.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i><span>${item.text}</span>`;
    container.appendChild(li);
  });
};

// Perbaiki generateMap dengan atribut lengkap
const generateMap = () => {
  const container = document.querySelector('.footer-map');
  if (!container) {
    console.error('Elemen .footer-map tidak ditemukan');
    return;
  }
  container.src = CONFIG.map.src;
  container.title = CONFIG.map.title;
  container.allowFullscreen = true;
  container.loading = 'lazy';
  container.referrerPolicy = 'no-referrer-when-downgrade';
};

const generateCopyright = () => {
  const container = document.querySelector('.footer-copyright p');
  if (!container) return;
  container.innerHTML = `
    &copy; <span id="year"></span> — PPAI Darul Huda | Hak Cipta Dilindungi<br>
    Developed by: <a href="${CONFIG.copyright.developerLink}" class="copyright-link" aria-label="${CONFIG.copyright.developerLabel}">${CONFIG.copyright.developerLabel}</a><br>
    Powered by
  `;
};

document.addEventListener('DOMContentLoaded', () => {
  generateSocialMedia();
  generateContact();
  generateMap();
  generateCopyright();
});
