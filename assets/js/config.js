import {
  EnvHelper
} from './modules/unified-utils.js';
// menu navbar — single source of truth untuk navigasi utama
export const menuData = [{
  text: "Layanan",
  href: "/layanan/",
  icon: "fas fa-concierge-bell",
  dropdown: [{
    href: "/layanan/",
    text: "Semua Layanan",
    icon: "fas fa-concierge-bell",
    isParent: true
  }, {
    href: "/layanan/website/",
    text: "Pembuatan Website",
    icon: "fas fa-laptop-code"
  }, {
    href: "/layanan/domain/",
    text: "Domain",
    icon: "fas fa-globe"
  }, {
    href: "/layanan/hosting/",
    text: "Hosting",
    icon: "fas fa-server"
  }, {
    href: "/layanan/maintenance/",
    text: "Maintenance",
    icon: "fas fa-wrench"
  }]
}, {
  href: "/portofolio/",
  text: "Portofolio",
  icon: "fas fa-images"
}, {
  text: "Blog",
  href: "/blog/",
  icon: "fas fa-newspaper",
  dropdown: [{
    href: "/blog/",
    text: "Artikel & Tips",
    icon: "fas fa-blog",
    isParent: true
  }, {
    href: "/blog/artikel/",
    text: "Artikel",
    icon: "fas fa-pen-fancy"
  }, {
    href: "/blog/tips-website/",
    text: "Tips website",
    icon: "fas fa-lightbulb"
  }]
}, {
  href: "/bantuan/",
  text: "Bantuan",
  icon: "fas fa-life-ring"
}, {
  href: "/promo/",
  text: "Promo",
  icon: "fas fa-gift",
  isPromo: true
}, {
  text: "Login",
  href: EnvHelper.getDomainUrl('my', '/auth/'),
  icon: "fas fa-sign-in-alt",
  isAuth: true
}];
// footer kolom layanan utama
export const mainServicesData = [{
  href: "/layanan/website/",
  text: "Pembuatan Website"
}, {
  href: "/layanan/domain/",
  text: "Pendaftaran Domain"
}, {
  href: "/layanan/hosting/",
  text: "Hosting"
}, {
  href: "/layanan/maintenance/",
  text: "Maintenance Website"
}, {
  href: "/promo/",
  text: "Promo & Penawaran"
}];
// footer kolom link cepat — info perusahaan & pendukung
export const footerQuickLinksData = [{
  href: "/perusahaan/",
  text: "Tentang kami"
}, {
  href: "/portofolio/",
  text: "Portofolio klien"
}, {
  href: "/perusahaan/karir/",
  text: "Karir"
}, {
  href: "/blog/",
  text: "Blog"
}, {
  href: "/bantuan/",
  text: "Bantuan"
}];
// footer baris legal — link kebijakan hukum
export const footerLegalData = [{
  href: "/perusahaan/legal/",
  text: "Syarat & Ketentuan"
}, {
  href: "/perusahaan/legal/",
  text: "Kebijakan Privasi"
}, {
  href: "/perusahaan/legal/",
  text: "Kebijakan Refund"
}];
// =========================
// DATA SOSIAL MEDIA FOOTER
// =========================
export const footerSocialData = [{
  href: "https://www.facebook.com/sisitusdotcom",
  ariaLabel: "Facebook",
  name: "Facebook",
  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#1877F2" d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
}, {
  href: "https://www.instagram.com/sisitusdotcom",
  ariaLabel: "Instagram",
  name: "Instagram",
  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#FDF497"/><stop offset="5%" stop-color="#FDF497"/><stop offset="45%" stop-color="#FD5949"/><stop offset="60%" stop-color="#D6249F"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><path fill="url(#instagram-gradient)" d="M7.8 0h8.4C20.5 0 24 3.5 24 7.8v8.4c0 4.3-3.5 7.8-7.8 7.8H7.8C3.5 24 0 20.5 0 16.2V7.8C0 3.5 3.5 0 7.8 0zm-.2 2.2C4.5 2.2 2.2 4.5 2.2 7.6v8.8c0 3.1 2.3 5.4 5.4 5.4h8.8c3.1 0 5.4-2.3 5.4-5.4V7.6c0-3.1-2.3-5.4-5.4-5.4H7.6z"/><path fill="url(#instagram-gradient)" d="M12 5.4A6.6 6.6 0 1 0 12 18.6 6.6 6.6 0 0 0 12 5.4zm0 10.9A4.3 4.3 0 1 1 12 7.7a4.3 4.3 0 0 1 0 8.6z"/><circle cx="18.3" cy="5.7" r="1.5" fill="url(#instagram-gradient)"/></svg>'
}, {
  href: "https://www.youtube.com/@sisitusdotcom",
  ariaLabel: "YouTube",
  name: "YouTube",
  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#FF0000" d="M23.5 6.19a3.02 3.02 0 0 0-2.13-2.14C19.51 3.55 12 3.55 12 3.55s-7.51 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.51 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81z"/><path fill="#FFFFFF" d="M9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>'
}, {
  href: "https://wa.me/6281215289095",
  ariaLabel: "WhatsApp",
  name: "WhatsApp",
  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#25D366" d="M12 0C5.373 0 0 5.373 0 12c0 2.117.552 4.105 1.519 5.832L.057 23.217a.6.6 0 0 0 .734.734l5.385-1.462A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/><path fill="#FFFFFF" d="M17.477 14.51c-.3-.15-1.774-.875-2.049-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.27-.468-2.42-1.493-.894-.8-1.5-1.787-1.675-2.087-.175-.3-.019-.462.131-.612.131-.131.3-.337.45-.506.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.488-.506-.675-.519-.175-.012-.375-.012-.575-.012s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.112 3.225 5.119 4.519.715.306 1.275.488 1.712.625.719.225 1.375.194 1.894.119.575-.087 1.775-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/><path fill="#25D366" d="M12 22.05c-1.93 0-3.81-.516-5.466-1.491l-.391-.232-3.196.868.868-3.196-.232-.391A10.03 10.03 0 1 1 12 22.05z" opacity="0"/></svg>'
}, {
  href: "https://www.tiktok.com/@sisitusdotcom",
  ariaLabel: "TikTok",
  name: "TikTok",
  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#25F4EE" d="M16.6 0h-3.8v15.05a3.06 3.06 0 1 1-2.27-2.96V8.2a6.85 6.85 0 1 0 6.07 6.85V7.67c1.38.99 3.07 1.57 4.94 1.57V5.45A5.03 5.03 0 0 1 16.6.5V0z" transform="translate(-0.7 0.7)"/><path fill="#FE2C55" d="M16.6 0h-3.8v15.05a3.06 3.06 0 1 1-2.27-2.96V8.2a6.85 6.85 0 1 0 6.07 6.85V7.67c1.38.99 3.07 1.57 4.94 1.57V5.45A5.03 5.03 0 0 1 16.6.5V0z" transform="translate(0.7 -0.7)"/><path fill="#FFFFFF" d="M16.6 0h-3.8v15.05a3.06 3.06 0 1 1-2.27-2.96V8.2a6.85 6.85 0 1 0 6.07 6.85V7.67c1.38.99 3.07 1.57 4.94 1.57V5.45A5.03 5.03 0 0 1 16.6.5V0z"/></svg>'
}];
// =========================
// DATA KONTAK FOOTER
// =========================
export const footerContactData = [{
  icon: "fas fa-map-marker-alt",
  text: "<a href=\"https://share.google/UJstmjkDDtpHyCMRm\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"footer-kontak-link\" aria-label=\"Buka Google Maps\">PT SINTARA DIGITAL NUSANTARA</a>"
}, {
  icon: "fas fa-phone-alt",
  text: "<a href=\"tel:+62-812-1528-9095\" class=\"footer-kontak-link\">+62 812-1528-9095</a>"
}, {
  icon: "fas fa-envelope",
  text: "<a href=\"mailto:hello@sisitus.com\" class=\"footer-kontak-link\">hello@sisitus.com</a>"
}, {
  icon: "fas fa-clock",
  text: "Senin - Sabtu: 08.00 - 20.00 WIB"
}];
// =========================
// DATA TRUST BADGES
// =========================
export const footerTrustBadgesData = [{
  src: "/assets/img/trust/logo-komdigi.svg",
  alt: "Terdaftar PSE Komdigi"
}, {
  src: "/assets/img/trust/icann.svg",
  alt: "ICANN Accredited"
}, {
  src: "/assets/img/trust/iso27001.svg",
  alt: "ISO 27001 Certified"
}, {
  src: "/assets/img/trust/anab.svg",
  alt: "ANAB Accredited"
}];