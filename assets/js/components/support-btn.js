// Support Button Builder & Dynamic WhatsApp Links untuk SISITUS.COM
window.addEventListener("load", () => {
  const supportWrapper = document.querySelector(".support-btn-wrapper");

  // Jika wrapper tidak ada, hentikan
  if (!supportWrapper) return;

  // Daftar nomor WA placeholder
  const waContacts = [
    {
      label: "Customer Service",
      number: "6281215289095",
      schedule: "(Senin-Jumat: 08.00-17.00 WIB)",
      class: "wa-cs-link"
    },
    {
      label: "Admin Pembuatan Website",
      number: "6281215289095",
      class: "wa-admin1-link"
    }
  ];

  // Mapping path halaman ke pesan WA
  const pathMessageMap = {
    "/": "Halo SISITUS.COM! Saya ingin mengetahui lebih banyak tentang layanan Anda.",
    "/index.html": "Halo SISITUS.COM! Saya ingin mengetahui lebih banyak tentang layanan Anda.",
    "/promo/index.html": "Halo SISITUS.COM! Saya tertarik dengan promo yang ditawarkan.",
    "/blog/index.html": "Halo SISITUS.COM! Saya ingin membaca artikel terbaru di blog Anda.",
    "/blog/artikel/index.html": "Halo SISITUS.COM! Saya ingin membaca artikel-artikel yang tersedia.",
    "/blog/artikel/detail.html": "Halo SISITUS.COM! Saya membaca artikel ini dan ingin bertanya lebih lanjut.",
    "/blog/tips-website/index.html": "Halo SISITUS.COM! Saya ingin mendapatkan tips website terbaru.",
    "/blog/tips-website/detail.html": "Halo SISITUS.COM! Saya ingin mendiskusikan tips website ini lebih lanjut.",
    "/layanan/index.html": "Halo SISITUS.COM! Saya ingin mengetahui semua layanan yang tersedia.",
    "/layanan/pembuatan-website/index.html": "Halo SISITUS.COM! Saya ingin bertanya tentang layanan pembuatan website.",
    "/layanan/domain-hosting/index.html": "Halo SISITUS.COM! Saya ingin bertanya tentang layanan domain & hosting.",
    "/layanan/maintenance/index.html": "Halo SISITUS.COM! Saya ingin bertanya tentang layanan maintenance website.",
    "/perusahaan/index.html": "Halo SISITUS.COM! Saya ingin mengetahui profil perusahaan Anda.",
    "/perusahaan/tentang/index.html": "Halo SISITUS.COM! Saya ingin mengetahui lebih banyak tentang perusahaan Anda.",
    "/perusahaan/legal/index.html": "Halo SISITUS.COM! Saya ingin informasi mengenai aspek legal perusahaan."
  };

  const currentPath = window.location.pathname;
  const defaultMessage = "Halo SISITUS.COM! Saya ingin mengetahui lebih banyak tentang layanan Anda.";
  const message = pathMessageMap[currentPath] || defaultMessage;

  // Bangun HTML support button
  supportWrapper.innerHTML = `
    <button class="support-btn" aria-expanded="false" aria-controls="support-panel" aria-label="Toggle Support Panel">
      <i class="fas fa-headset" aria-hidden="true"></i>
    </button>
    <nav id="support-panel" class="support-panel" role="region" aria-label="Support Panel" aria-hidden="true" tabindex="-1">
      <ul>
        <li class="support-list whatsapp-header" role="button" tabindex="0" aria-expanded="false" aria-controls="whatsapp-sublist" aria-haspopup="true">
          <i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp <i class="fas fa-caret-down" aria-hidden="true"></i>
        </li>
        <li>
          <ul id="whatsapp-sublist" class="support-sublist" role="list" hidden aria-hidden="true">
            ${waContacts
              .map(contact => `
              <li>
                <i class="fas fa-${contact.label.includes("Admin") ? "user-tie" : "building"}" aria-hidden="true"></i>
                <a href="https://wa.me/${contact.number}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer" class="${contact.class}" aria-label="Chat WhatsApp ${contact.label}">
                  ${contact.label}${contact.schedule ? `<br>${contact.schedule}` : ""}
                </a>
              </li>
            `).join("")}
          </ul>
        </li>
        <li role="link" class="info" tabindex="0" aria-label="Halaman Kontak SISITUS.COM">
          <i class="fas fa-info-circle" aria-hidden="true"></i> Halaman Kontak
        </li>
        <li class="email" role="none" data-no-sc>
          <i class="fas fa-envelope" aria-hidden="true"></i>
          <a href="mailto:sisitus.com@gmail.com?subject=Halo SISITUS.COM" aria-label="Kirim email ke sisitus.com@gmail.com">
            sisitus.com@gmail.com
          </a>
        </li>
      </ul>
    </nav>
  `;

  // Reuse event listener JS yang sudah ada
  const supportBtn = supportWrapper.querySelector(".support-btn");
  const whatsappHeader = supportWrapper.querySelector(".whatsapp-header");
  const whatsappSublist = supportWrapper.querySelector("#whatsapp-sublist");
  const kontakLi = supportWrapper.querySelector(".info");

  let isAnimatingBack = false;

  function closeSupportPanel() {
    if (isAnimatingBack) return;
    isAnimatingBack = true;
    supportWrapper.classList.add("rotating-back");
    setTimeout(() => {
      supportWrapper.classList.remove("active", "rotating-back");
      isAnimatingBack = false;
      supportBtn.setAttribute("aria-expanded", "false");
    }, 600);
  }

  supportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (supportWrapper.classList.contains("active")) {
      closeSupportPanel();
    } else {
      supportWrapper.classList.add("active");
      supportBtn.setAttribute("aria-expanded", "true");
      whatsappHeader.focus();
    }
  });

  supportBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      supportBtn.click();
    }
  });

  document.addEventListener("click", (event) => {
    if (!supportWrapper.contains(event.target) && supportWrapper.classList.contains("active")) {
      closeSupportPanel();
    }
  });

  whatsappHeader.addEventListener("click", () => {
    const expanded = whatsappHeader.getAttribute("aria-expanded") === "true";
    const newExpanded = !expanded;
    whatsappHeader.setAttribute("aria-expanded", String(newExpanded));
    whatsappSublist.hidden = !newExpanded;
    whatsappSublist.setAttribute("aria-hidden", String(!newExpanded));
  });

  whatsappHeader.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      whatsappHeader.click();
    }
  });

  kontakLi.addEventListener("click", () => {
    window.location.href = "/kontak/index.html";
  });

  kontakLi.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      kontakLi.click();
    }
  });
});
