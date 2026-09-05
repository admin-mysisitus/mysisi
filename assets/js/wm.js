(function() {
  const footer = document.querySelector("footer[aria-label='Informasi Footer']");
  if (!footer) return;
  const footerGrid = footer.querySelector(".footer-grid");
  if (!footerGrid) return;
  const root = document.documentElement;
  root.style.setProperty('--favicon-url', 'url("https://sisitus.com/assets/favicon/favicon-32x32.png")');
  const copyrightContainer = document.createElement("div");
  copyrightContainer.className = "footer-copyright";
  const copyrightPara = document.createElement("p");
  const currentYear = new Date().getFullYear();
  copyrightPara.innerHTML = `&copy; <span>${currentYear}</span> — sisitus.com<br>
                             All Rights Reserved | Operated by: <a href="https://www.instagram.com/sisitusdotcom" class="copyright-link" aria-label="Instagram SINTARA TECH">SINTARA Tech.</a><br>
                             Powered by`;
  const wm = document.createElement("a");
  wm.href = "https://sisitus.com";
  wm.target = "_blank";
  wm.rel = "nofollow noopener";
  wm.className = "logo wm-sc";
  wm.style.marginTop = "0.5rem";
  wm.innerHTML = 'sisitus<span>.com</span>';
  copyrightPara.appendChild(document.createElement("br"));
  copyrightPara.appendChild(wm);
  copyrightContainer.appendChild(copyrightPara);
  footerGrid.after(copyrightContainer);
})();