// Logika Preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const supportWrapper = document.querySelector(".support-btn-wrapper");

  if (preloader) {
    const MIN_PRELOADER_TIME = 900;     // Durasi minimum tampil
    const EXIT_ANIMATION_TIME = 600;    // Sama dengan CSS transition

    const startTime = performance.now();

    function hidePreloader() {
      preloader.classList.add("hidden");

      // Tunggu animasi exit selesai
      setTimeout(() => {
        preloader.remove(); // Bersihkan DOM
        supportWrapper?.classList.add("show");
      }, EXIT_ANIMATION_TIME);
    }

    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, MIN_PRELOADER_TIME - elapsed);

    setTimeout(hidePreloader, remaining);
  }
});
