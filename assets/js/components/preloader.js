// Logika Preloader yang Tetap Stabil
const PRELOADER_START = performance.now();
document.body.classList.add("preloading");
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const supportWrapper = document.querySelector(".support-btn-wrapper");
  if (!preloader) return;
  const MIN_PRELOADER_TIME = 1800;
  const EXIT_ANIMATION_TIME = 600;
  const elapsed = performance.now() - PRELOADER_START;
  const remaining = Math.max(0, MIN_PRELOADER_TIME - elapsed);
  setTimeout(() => {
    preloader.classList.add("hidden");
    document.body.classList.remove("preloading");
    setTimeout(() => {
      preloader.remove();
      supportWrapper?.classList.add("show");
    }, EXIT_ANIMATION_TIME);
  }, remaining);
});