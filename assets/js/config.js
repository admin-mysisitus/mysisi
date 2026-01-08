// Data Navigasi
export const menuData = [
  { href: "/", text: "Home" },
  { href: "/profile/", text: "Profile" },
  { text: "Lembaga", href: "/lembaga/", dropdown: [{ href: "/lembaga/", text: "Kelembagaan", isParent: true }, { href: "/lembaga/yayasan/", text: "Yayasan" }, { href: "/lembaga/madin/", text: "Madrasah Diniyah" }, { href: "/lembaga/formal/", text: "Madrasah Formal" }] },
  { text: "Layanan", href: "/layanan/", dropdown: [{ href: "/layanan/", text: "Layanan Terpadu", isParent: true }, { href: "/layanan/pendaftaran-santri/", text: "Pendaftaran Santri" }, { href: "/layanan/administrasi/", text: "Administrasi" }, { href: "/layanan/pengaduan/", text: "Pengaduan" }, { href: "/layanan/donasi/", text: "Donasi" }] },
  { text: "Informasi", href: "/informasi/", dropdown: [{ href: "/informasi/", text: "Pusat Informasi", isParent: true }, { href: "/informasi/berita/", text: "Berita" }, { href: "/informasi/agenda/", text: "Agenda" }, { href: "/informasi/artikel/", text: "Artikel" }] },
  { text: "IKSADA", href: "/iksada/", dropdown: [{ href: "/iksada/", text: "Tentang IKSADA", isParent: true }, { href: "/iksada/penelusuran.html", text: "Penelusuran Alumni" }, { href: "/iksada/registrasi.html", text: "Registrasi Alumni" }] },
  { text: "Pondigi", href: "/pondigi/", isPondigi: true }
];

// Data Layanan Utama Footer
export const mainServicesData = [
  { href: "layanan/pendaftaran-santri/index.html", text: "Pendaftaran Santri" },
  { href: "layanan/administrasi/index.html", text: "Administrasi" },
  { href: "layanan/donasi/index.html", text: "Donasi" },
  { href: "iksada/registrasi.html", text: "Registrasi Alumni" },
  { href: "pondigi/wali-dashboard.html", text: "Login Wali Santri" },
  { href: "pondigi/pengurus-dashboard.html", text: "Login Pengurus" }
];

// Data Footer Sosmed
export const footerSocialData = [
  { href: "https://www.facebook.com/share/1GD6k6atzR/", ariaLabel: "Facebook", icon: "fab fa-facebook-f" },
  { href: "https://www.instagram.com/ppaidarulhuda.id?igsh=cDMza2xzYjZkZGY0", ariaLabel: "Instagram", icon: "fab fa-instagram" },
  { href: "https://youtube.com/@ppaidarulhuda1300?si=8tV5LH3s-OgVStuz", ariaLabel: "YouTube", icon: "fab fa-youtube" },
  { href: "https://wa.me/6285385072377", ariaLabel: "WhatsApp", icon: "fab fa-whatsapp" },
  { href: "https://www.tiktok.com/@ppai_darulhuda?_r=1&_t=ZS-92a4X0Sg4kk", ariaLabel: "TikTok", icon: "fab fa-tiktok" }
];

// Data Footer Kontak
export const footerContactData = [
  { icon: "fas fa-map-marker-alt", text: "Jl. Pesantren, RT.014 RW.004 Ds. Sumbermanjing Wetan, Kec. Sumbermanjing Wetan, Kab. Malang - Jawa Timur" },
  { icon: "fas fa-phone-alt", text: "<a href=\"tel:+6285233393669\" class=\"footer-kontak-link\">+62 852-3339-3669</a>" },
  { icon: "fas fa-envelope", text: "<a href=\"mailto:ppaidarulhuda@gmail.com\" class=\"footer-kontak-link\">ppaidarulhuda@gmail.com</a>" },
  { icon: "fas fa-clock", text: "Senin - Jumat: 06.00 - 18.00 WIB" }
];


