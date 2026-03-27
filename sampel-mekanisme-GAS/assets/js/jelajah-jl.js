// ===========================================================
//  JELAJAH-JL.JS — FINAL OPTIMAL & STABLE
// ===========================================================
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxkQeOjYU0i4Eae-K0413Qe9QckgD3G2KT335mRI-7pVBG6l5HBKKeOkmRIvPWP8orD/exec",
  SEARCH_DEBOUNCE_MS: 200,
  PAGE_SIZE: 6
};
// -----------------------------------------------------------
// DOM
// -----------------------------------------------------------
const DOM = {
  blogGrid: document.getElementById("blogBlogGrid"),
  pagination: document.getElementById("blogPagination"),
  visitorList: document.getElementById("blogVisitorList"),
  infoModal: document.getElementById("blogInfoModal"),
  visitorModal: document.getElementById("blogVisitorModal"),
  infoForm: document.getElementById("blogInfoForm"),
  searchInput: document.getElementById("blogSearchInput"),
  catFilter: document.getElementById("blogCategoryFilter")
};
// -----------------------------------------------------------
// CACHE
// -----------------------------------------------------------
let ARTICLE_CACHE = [];
let FILTERED_CACHE = [];
let CURRENT_PAGE = 1;
let CATEGORIES_RENDERED = false;
// -----------------------------------------------------------
// TOOLS
// -----------------------------------------------------------
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `blog-toast blog-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => toast.classList.remove("show"), 2500);
  setTimeout(() => toast.remove(), 2900);
}

function openModal(m) {
  if(!m) return;
  m.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(m) {
  if(!m) return;
  m.classList.remove("show");
  const stillOpen = [DOM.infoModal, DOM.visitorModal].some(x => x?.classList.contains("show"));
  if(!stillOpen) document.body.style.overflow = "auto";
}
document.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    closeModal(DOM.infoModal);
    closeModal(DOM.visitorModal);
  }
});

function formatIndoDate(x) {
  const d = new Date(x);
  return isNaN(d) ? x : d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function scrollToGridTop() {
  const grid = DOM.blogGrid;
  if(!grid) return;
  // elemen sticky yang relevan
  const header = document.querySelector(".blog-header");
  const search = document.querySelector(".blog-search-wrapper");
  const headerH = header ? header.offsetHeight : 0;
  const searchH = search ? search.offsetHeight : 0;
  // total offset sticky
  const offset = headerH + searchH + 12;
  // posisi grid absolut dalam dokumen
  const targetY = grid.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: targetY,
    behavior: "smooth"
  });
}
// -----------------------------------------------------------
// FETCH ARTICLE (one-time)
// -----------------------------------------------------------
async function loadArticlesOnce() {
  if(ARTICLE_CACHE.length) return ARTICLE_CACHE;
  DOM.blogGrid.innerHTML = `
    <div class="blog-loading">
      <div class="loading-spinner"></div>
      <p class="muted">Memuat artikel...</p>
    </div>`;
  try {
    const res = await fetch(`${CONFIG.SCRIPT_URL}?action=getarticle`);
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error("Invalid API format");
    ARTICLE_CACHE = data.map(a => ({
      ...a,
      category: (a.category || "").trim().toLowerCase()
    }));
    return ARTICLE_CACHE;
  } catch (err) {
    console.error(err);
    DOM.blogGrid.innerHTML = `<p class="muted">Gagal memuat artikel.</p>`;
    showToast("Gagal memuat artikel", "error");
    return [];
  }
}
// -----------------------------------------------------------
// FILTER + SEARCH
// -----------------------------------------------------------
function applyFilter() {
  const active = document.querySelector(".blog-filter-btn.active");
  const category = active ? active.dataset.category : "all";
  const q = (DOM.searchInput?.value || "").trim().toLowerCase();
  FILTERED_CACHE = ARTICLE_CACHE.filter(a => {
    const matchCat = category === "all" || a.category === category;
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  CURRENT_PAGE = 1;
  renderArticles();
}

function paginate(arr, page, size) {
  const start = (page - 1) * size;
  return arr.slice(start, start + size);
}
// -----------------------------------------------------------
// RENDER ARTICLES
// -----------------------------------------------------------
function renderArticles() {
  if(!FILTERED_CACHE.length) {
    DOM.blogGrid.innerHTML = `<p class="muted">Tidak ada artikel ditemukan.</p>`;
    DOM.pagination.innerHTML = "";
    return;
  }
  const totalPage = Math.ceil(FILTERED_CACHE.length / CONFIG.PAGE_SIZE);
  const pageData = paginate(FILTERED_CACHE, CURRENT_PAGE, CONFIG.PAGE_SIZE);
  DOM.blogGrid.innerHTML = pageData.map(item => {
    const thumb = (item.thumbnail || "").replace(/'/g, "\\'");
    return `
        <article class="blog-card">
          <a href="article.html?slug=${encodeURIComponent(item.slug || "")}">

            <div class="blog-thumb" 
              style="background-image: url('${thumb}')">

              <span class="blog-badge blog-card-badge">
                ${item.category || ""}
              </span>

            </div>

            <div class="blog-meta">
              <span class="blog-date">
                <i class="fa fa-calendar-o"></i> ${formatIndoDate(item.date)}
              </span>
            </div>

            <h3 class="blog-card-title">${item.title || ""}</h3>
            <p class="blog-card-text">${item.summary || ""}</p>

          </a>
        </article>
      `;
  }).join("");
  renderPagination(totalPage);
}
// -----------------------------------------------------------
// PAGINATION — FIXED (delegated listener)
// -----------------------------------------------------------
function renderPagination(totalPage) {
  if(totalPage <= 1) {
    DOM.pagination.innerHTML = "";
    return;
  }
  let html = `
    <button class="pg-btn" data-page="${CURRENT_PAGE - 1}" ${CURRENT_PAGE === 1 ? "disabled" : ""}>«</button>
  `;
  for(let i = 1; i <= totalPage; i++) {
    html += `<button class="pg-btn ${i === CURRENT_PAGE ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `
    <button class="pg-btn" data-page="${CURRENT_PAGE + 1}" ${CURRENT_PAGE === totalPage ? "disabled" : ""}>»</button>
  `;
  DOM.pagination.innerHTML = html;
}
// delegated listener → tidak double binding
document.addEventListener("click", e => {
  if(!e.target.classList.contains("pg-btn")) return;
  const page = Number(e.target.dataset.page);
  if(isNaN(page)) return;
  CURRENT_PAGE = page;
  renderArticles();
  scrollToGridTop(); // <<< FIX PAGINATION SCROLL
});
// -----------------------------------------------------------
// CATEGORIES — FIXED sanitizing
// -----------------------------------------------------------
function renderCategoryButtons(data) {
  if(!DOM.catFilter || CATEGORIES_RENDERED) return;
  const cats = Array.from(new Set(data.map(a => a.category))).filter(Boolean);
  DOM.catFilter.innerHTML = `
    <button class="blog-filter-btn active" data-category="all">Semua Kategori</button>
    ${cats.map(c => `
      <button class="blog-filter-btn" data-category="${c}">${c.replace(/\b\w/g, x => x.toUpperCase())}</button>
    `).join("")}
  `;
  // assign event listeners cleanly
  DOM.catFilter.querySelectorAll(".blog-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.catFilter.querySelectorAll(".blog-filter-btn").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      applyFilter();
    });
  });
  CATEGORIES_RENDERED = true;
}
// -----------------------------------------------------------
// VISITORS (unchanged except cleanup)
// -----------------------------------------------------------
async function fetchVisitors() {
  if(!DOM.visitorList) return;
  DOM.visitorList.innerHTML = `
    <div class="blog-loading small">
      <div class="loading-spinner"></div>
      <p class="muted">Memuat cerita...</p>
    </div>`;
  try {
    const res = await fetch(`${CONFIG.SCRIPT_URL}?action=getvisitor`);
    const data = await res.json();
    if(!Array.isArray(data) || !data.length) {
      DOM.visitorList.innerHTML = `<p class="muted">Belum ada cerita.</p>`;
      return;
    }
    const list = data.slice(0, 5);
    DOM.visitorList.innerHTML = list.map(item => {
      const ini = item.nama?.charAt(0)?.toUpperCase() || "?";
      const short = item.pesan.length > 100 ? item.pesan.slice(0, 100) + "..." : item.pesan;
      return `
          <div class="blog-visitor-card" data-id="${item.timestamp}">
            <div class="blog-visitor-head">
              <div class="blog-visitor-avatar">${ini}</div>
              <span class="blog-visitor-name">${item.nama}</span>
              <span class="small blog-visitor-ts">${item.timestamp}</span>
            </div>
            <div class="small">Kategori: ${item.kategori}</div>
            <p>${short}</p>
          </div>
        `;
    }).join("");
    // delegated listener better, but this is fine
    DOM.visitorList.querySelectorAll(".blog-visitor-card").forEach(card => {
      card.addEventListener("click", () => {
        const ts = card.dataset.id;
        const full = data.find(v => v.timestamp === ts);
        const body = document.getElementById("visitorModalBody");
        if(body) {
          body.innerHTML = `
  <div class="visitor-info">
    <div class="vi-item"><strong>Nama:</strong> ${full.nama}</div>
    <div class="vi-item"><strong>Email:</strong> ${full.email}</div>
    <div class="vi-item"><strong>Kategori:</strong> ${full.kategori}</div>
    <div class="vi-item"><strong>Dikirim:</strong> ${full.timestamp}</div>
  </div>

  <div class="visitor-story">
    <div class="visitor-story-label"><strong>Cerita:</strong></div>
    <div class="visitor-story-text">${full.pesan}</div>
  </div>
`;
        }
        openModal(DOM.visitorModal);
      });
    });
  } catch (err) {
    console.error(err);
    DOM.visitorList.innerHTML = `<p class="muted">Gagal memuat cerita.</p>`;
  }
}
// -----------------------------------------------------------
// SUBMIT VISITOR
// -----------------------------------------------------------
async function submitVisitorForm(e) {
  e.preventDefault();
  const nama = document.getElementById("blogNama").value.trim();
  const email = document.getElementById("blogEmail").value.trim();
  const kategori = document.getElementById("blogKategori").value;
  const pesan = document.getElementById("blogPesan").value.trim();
  if(!nama || !kategori || !pesan) {
    showToast("Nama, kategori, dan pesan wajib diisi", "warning");
    return;
  }
  try {
    const form = new FormData();
    form.append("action", "savevisitor");
    form.append("nama", nama);
    form.append("email", email);
    form.append("kategori", kategori);
    form.append("pesan", pesan);
    const res = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      body: form
    });
    const txt = await res.text();
    if(txt.toLowerCase().includes("success")) {
      DOM.infoForm.reset();
      closeModal(DOM.infoModal);
      showToast("Cerita berhasil dikirim!", "success");
      fetchVisitors();
    } else {
      showToast(txt, "error");
    }
  } catch (err) {
    showToast("Gagal mengirim", "error");
  }
}
// -----------------------------------------------------------
// EVENTS
// -----------------------------------------------------------
function initEvents() {
  document.getElementById("blogOpenModal")?.addEventListener("click", () => openModal(DOM.infoModal));
  document.getElementById("blogCloseModal")?.addEventListener("click", () => closeModal(DOM.infoModal));
  document.getElementById("blogBatal")?.addEventListener("click", () => closeModal(DOM.infoModal));
  document.getElementById("blogCloseVisitorModal")?.addEventListener("click", () => closeModal(DOM.visitorModal));
  DOM.infoForm?.addEventListener("submit", submitVisitorForm);
  if(DOM.searchInput) {
    const d = debounce(applyFilter, CONFIG.SEARCH_DEBOUNCE_MS);
    DOM.searchInput.addEventListener("input", d);
  }
  [DOM.infoModal, DOM.visitorModal].forEach(m => {
    m?.addEventListener("click", e => {
      if(e.target === m) closeModal(m);
    });
  });
}

function debounce(fn, ms) {
  let t;
  return (...x) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...x), ms);
  };
}
// -----------------------------------------------------------
// MAIN
// -----------------------------------------------------------
async function initApp() {
  initEvents();
  const data = await loadArticlesOnce();
  renderCategoryButtons(data);
  FILTERED_CACHE = [...data];
  renderArticles();
  fetchVisitors();
}
document.addEventListener("DOMContentLoaded", initApp);