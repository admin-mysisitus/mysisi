const CONFIG = {
  REFRESH_INTERVAL: 1000,
  SWITCH_INTERVAL: 5000,
  FEATURES: [
    { title: "Website Profesional", desc: "web UMKM, sekolah, instansi, dll.", icon: "fa-globe" },
    { title: "Desain Kustom", desc: "Sesuai Brand Identity Anda", icon: "fa-paintbrush" },
    { title: "Optimisasi SEO", desc: "Peringkat atas di Mesin Pencari", icon: "fa-search" },
    { title: "Dukungan 24/7", desc: "Tim Teknis Siap Bantu Kapanpun", icon: "fa-headset" }
  ],
  TIMEZONE: 7 // WIB
};

let currentIndex = 0;
let switchTimeout = null;

// Update tampilan tanggal & waktu
const updateDateTime = () => {
  const datetimeEl = document.getElementById('datetime');
  if (!datetimeEl) return;

  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
  }).format(now).replace(',', '');
  const timezone = CONFIG.TIMEZONE === 7 ? 'WIB' : CONFIG.TIMEZONE === 8 ? 'WITA' : 'WIT';
  const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, '.') + ` ${timezone}`;

  datetimeEl.innerHTML = `
    <i class="fa-solid fa-calendar"></i>
    <span class="datetime-date">${formattedDate}</span>
    <i class="fa-solid fa-clock"></i>
    <span class="datetime-time"><strong>${formattedTime}</strong></span>
  `;
};

// Tampilkan fitur yang sedang aktif
const renderFeature = () => {
  const infoEl = document.getElementById('info');
  if (!infoEl) return;

  const feature = CONFIG.FEATURES[currentIndex];
  infoEl.innerHTML = `
    <div class="icon-text-wrapper">
      <i class="fa-solid ${feature.icon}"></i>
      <div class="icon-text-content">
        <span class="line-1"><strong>${feature.title}</strong></span>
        <span class="line-2">${feature.desc}</span>
      </div>
    </div>
  `;

  // Atur pergantian otomatis
  clearTimeout(switchTimeout);
  switchTimeout = setTimeout(() => {
    currentIndex = (currentIndex + 1) % CONFIG.FEATURES.length;
    renderFeature();
  }, CONFIG.SWITCH_INTERVAL);
};

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateDateTime, CONFIG.REFRESH_INTERVAL);
  updateDateTime();
  renderFeature();
});
