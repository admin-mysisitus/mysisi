// Dynamic WhatsApp Link & Script Tombol Support
window.addEventListener("load", () => {
  const supportBtn = document.querySelector(".support-btn");
  const whatsappHeader = document.querySelector(".whatsapp-header");
  const whatsappSublist = document.getElementById("whatsapp-sublist");
  const kontakLi = document.querySelector(".support-panel .info");
  const supportWrapper = document.querySelector(".support-btn-wrapper");

  // Mapping path halaman ke pesan WA
  const pathMessageMap = {
    "/": "Assalamu'alaikum PPAI Darul Huda! Saya ingin mengetahui lebih banyak tentang pesantren Anda.",
    "/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin mengetahui lebih banyak tentang pesantren Anda.",
    "/profile/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya baru membaca profil pesantren dan ingin tahu lebih lanjut.",
    "/lembaga/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin bertanya tentang lembaga yang ada di pesantren.",
    "/lembaga/pendaftaran.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin bertanya tentang prosedur dan syarat pendaftaran.",
    "/lembaga/yayasan/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin mengetahui lebih lanjut tentang yayasan pengelola pesantren.",
    "/lembaga/madin/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin bertanya tentang program pendidikan di MADIN.",
    "/lembaga/formal/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin bertanya tentang program pendidikan formal di pesantren.",
    "/berita/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya melihat berita terbaru dan ingin mengetahui detail lebih lanjut.",
    "/berita/detail.html": "Assalamu'alaikum PPAI Darul Huda! Saya membaca artikel berita ini dan ingin bertanya terkait isinya.",
    "/iksada/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin mengetahui lebih banyak tentang program IKSADA.",
    "/iksada/tracking.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin melacak progres pendaftaran atau program IKSADA.",
    "/iksada/registrasi.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin melakukan registrasi atau bertanya tentang prosedur IKSADA.",
    "/pondigi/index.html": "Assalamu'alaikum PPAI Darul Huda! Saya ingin bertanya tentang layanan atau program Pondigi."
  };

  const currentPath = window.location.pathname;
  const message = pathMessageMap[currentPath] || "Assalamu'alaikum PPAI Darul Huda!";

  const mainWaNumber = "62882010067695";
  const regWaNumber = "62812xxxxxx";
  const iksadaWaNumber = "62858xxxxxx";

  const waKantorLink = document.querySelector(".wa-kantor-link");
  const waCp1Link = document.querySelector(".wa-cp1-link");
  const waCp2Link = document.querySelector(".wa-cp2-link");

  if (waKantorLink) {
    waKantorLink.href = `https://wa.me/${mainWaNumber}?text=${encodeURIComponent(message)}`;
  }
  if (waCp1Link) {
    waCp1Link.href = `https://wa.me/${regWaNumber}?text=${encodeURIComponent("Assalamu'alaikum Admin Pendaftaran! " + message)}`;
  }
  if (waCp2Link) {
    waCp2Link.href = `https://wa.me/${iksadaWaNumber}?text=${encodeURIComponent("Assalamu'alaikum Admin IKSADA! " + message)}`;
  }

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
    window.location.href = "/lembaga/index.html#kontak";
  });

  kontakLi.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      kontakLi.click();
    }
  });
});