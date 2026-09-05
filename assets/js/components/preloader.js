const PRELOADER_START = performance.now();
document.body.classList.add("preloading");
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
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
      const widget = document.querySelector(".livechat-widget");
      if (widget) {
        widget.style.opacity = "";
        widget.style.visibility = "";
        widget.classList.add("show");
      }
    }, EXIT_ANIMATION_TIME);
  }, remaining);
});