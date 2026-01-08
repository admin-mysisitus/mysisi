// Navigasi Elemen
const navMobileBtn = document.getElementById('nav-mobile-btn');
const navMobile = document.getElementById('nav-mobile');
const navMobileClose = document.getElementById('nav-mobile-close');
const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

// Buka Navigasi Mobile
if (navMobileBtn && navMobile && navMobileClose) {
  navMobileBtn.addEventListener('click', () => {
    navMobile.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Tutup Navigasi Mobile
  navMobileClose.addEventListener('click', () => {
    navMobile.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

// Kontrol Dropdown (Desktop & Mobile)
if (dropdownToggles.length > 0) {
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      // Hanya hentikan aksi default jika bukan link eksternal
      if (toggle.nextElementSibling) {
        e.preventDefault();
      }

      const dropdownMenu = toggle.nextElementSibling;
      if (!dropdownMenu) return;

      // Tutup dropdown lain
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdownMenu) menu.classList.remove('active');
      });

      // Toggle dropdown saat ini
      dropdownMenu.classList.toggle('active');
    });
  });

  // Tutup dropdown saat klik di luar
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });
}



  /* ===============================
     PRELOADER + DYNAMIC WHATSAPP LINK SCRIPT
  =============================== */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const supportWrapper = document.querySelector(".support-btn-wrapper");
  const supportBtn = document.querySelector(".support-btn");
  const whatsappHeader = document.querySelector(".whatsapp-header");
  const whatsappSublist = document.getElementById("whatsapp-sublist");
  const kontakLi = document.querySelector(".support-panel .info");

  /* ===============================
     PRELOADER LOGIC
  =============================== */
  if (preloader) {
    const MIN_PRELOADER_TIME = 900;     // durasi minimum tampil
    const EXIT_ANIMATION_TIME = 600;    // HARUS sama dengan CSS transition

    const startTime = performance.now();

    function hidePreloader() {
      preloader.classList.add("hidden");

      // tunggu animasi exit selesai
      setTimeout(() => {
        preloader.remove(); // bersihkan DOM
        supportWrapper?.classList.add("show");
      }, EXIT_ANIMATION_TIME);
    }

    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, MIN_PRELOADER_TIME - elapsed);

    setTimeout(hidePreloader, remaining);
  }

  // Mapping path halaman ppaidarulhuda.id ke pesan WA
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

// ===============================
// REPLACE TEKS "PPAI Darul Huda" DENGAN STYLE KHUSUS
// ===============================
const applyPpaiDarulHudaFont = (root = document.body) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/PPAI Darul Huda/i.test(node.nodeValue)) {
      let el = node.parentNode;
      let skip = false;
      while (el && el !== document.body) {
        if (el.hasAttribute && el.hasAttribute('data-no-dh')) {
          skip = true;
          break;
        }
        el = el.parentNode;
      }
      if (!skip) {
        nodes.push(node);
      }
    }
  }
  for (const node of nodes) {
    if (node.parentNode.classList?.contains('ppai-darulhuda-font')) continue;
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(PPAI Darul Huda)/i).forEach(part => {
      if (/PPAI Darul Huda/i.test(part)) {
        const span = document.createElement('span');
        span.className = 'ppai-darulhuda-font';
        span.textContent = part;
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    node.parentNode.replaceChild(frag, node);
  }
};

// Jalankan pertama kali untuk seluruh halaman
applyPpaiDarulHudaFont(document.body);

// Pasang observer untuk menerapkan style pada elemen baru yang dimuat secara dinamis
const textObserver = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        applyPpaiDarulHudaFont(node);
      }
    }
  }
});

textObserver.observe(document.body, {
  childList: true,
  subtree: true
});


  // Animasi elemen saat di-scroll
  const animateOnScroll = () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if(sectionTop < windowHeight * 0.8) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }
    });
  };

  // Inisialisasi animasi
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  // Panggil fungsi saat scroll dan saat halaman dimuat
  window.addEventListener('scroll', animateOnScroll);
  window.addEventListener('load', animateOnScroll);

// ===============================
// FOOTER AUTO YEAR
// ===============================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===============================
// FOOTER DATETIME
// ===============================

const STATES = ['HIJRI','PUASA','SYARI','INDO','IMSAKIYAH1','IMSAKIYAH2','IMSAKIYAH3','IMSAKIYAH4'];
const REFRESH_INTERVAL = 1000;
const STATE_INTERVALS = { 
    HIJRI:5000, PUASA:3000, SYARI:3000, INDO:3000,
    IMSAKIYAH1:3000, IMSAKIYAH2:3000, IMSAKIYAH3:3000, IMSAKIYAH4:3000 
};
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const MOMEN = {
    newYear:{name:'Tahun Baru Hijriyah',m:1,d:1,icon:'fa-calendar-plus'},
    tasua:{name:'Puasa Sunnah Tasu’a',m:1,d:9,icon:'fa-dove'},
    asyura:{name:'Puasa Sunnah Asyura',m:1,d:10,icon:'fa-dove'},
    maulid:{name:'Maulid Nabi Muhammad SAW',m:3,d:12,icon:'fa-star-and-crescent'},
    isramiraj:{name:'Isra’ Mi’raj',m:7,d:27,icon:'fa-moon'},
    ramadhan:{name:'Awal Ramadhan',m:9,d:1,icon:'fa-calendar-check'},
    nuzul:{name:'Nuzulul Qur’an',m:9,d:17,icon:'fa-book-quran'},
    idulfitri:{name:'Idul Fitri',m:10,d:1,icon:'fa-hand-sparkles'},
    arafah:{name:'Puasa Sunnah Arafah',m:12,d:9,icon:'fa-dove'},
    iduladha:{name:'Idul Adha',m:12,d:10,icon:'fa-kaaba'}
};

const SYARI_MOMEN_KEYS = ['newYear','tasua','asyura','ramadhan','nuzul','idulfitri','arafah','iduladha'];
const INDONESIA_MOMEN_KEYS = ['maulid','isramiraj'];

const HARAM_PUASA = [
    {m:10, d:1},
    {m:12, d:10},
    {m:12, range:[11,13]}
];

const PUASA_ROUTINE = [
    {type:'weekday',value:1,name:'Puasa Sunnah Senin'},
    {type:'weekday',value:4,name:'Puasa Sunnah Kamis'},
    {type:'hijriRange',min:13,max:15,exclude:[9,12],name:'Puasa Sunnah Ayyamul Bidh'},
    {type:'hijriFix',m:10,min:2,max:7,name:'Puasa Sunnah 6 Hari Syawal'}
];

const LATITUDE = -7.3940747;
const LONGITUDE = 112.7747886;
const CALCULATION_METHOD = 11;
const IMSAK_OFFSET = 0;
let prayerTimesData = null;
const IMSAKIYAH_VIEWS = [
    { title1: "Imsak", key1: "imsak", title2: "Subuh", key2: "fajr" },
    { title1: "Terbit", key1: "sunrise", title2: "Duha", key2: "dhuha" },
    { title1: "Zuhur", key1: "dhuhr", title2: "Ashar", key2: "asr" },
    { title1: "Maghrib", key1: "maghrib", title2: "Isya", key2: "isha" }
];

const hijriNumericCache = {};
const momenCache = {};
const puasaCache = {};
const haramPuasaCache = {};

const formatDateKey = d =>
`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const parseArabicNumber = s =>
/\d/.test(s)? Number(s) : Number(s.replace(/[٠-٩]/g,d=>ARABIC_DIGITS.indexOf(d)));

function hijriNumeric(date){
    if(!(date instanceof Date)||isNaN(date.getTime())) return {day:0,month:0,year:0};
    const key=formatDateKey(date);
    if(hijriNumericCache[key]) return hijriNumericCache[key];
    try{
        const fmt=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});
        const parts=fmt.formatToParts(date);
        const r={};
        parts.forEach(p=>{ if(['day','month','year'].includes(p.type)) r[p.type]=parseArabicNumber(p.value); });
        if(!r.day||!r.month) throw 0;
        return hijriNumericCache[key]=r;
    }catch{
        return {day:0,month:0,year:0};
    }
}

function hijriFull(date){
    try{
        const fmtDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        const parts = fmtDate.formatToParts(date);
        let weekday = "", day = "", month = "", year = "";
        parts.forEach(p => {
            switch(p.type) {
                case "weekday": weekday = p.value; break;
                case "day": day = p.value; break;
                case "month": month = p.value; break;
                case "year": year = p.value; break;
            }
        });
        return `<span dir="rtl">${weekday} | ${day} ${month} ${year} هـ</span>`;
    }catch{
        return '<span dir="rtl">Tanggal Hijri Tidak Tersedia</span>';
    }
}

function isHaramPuasa(date){
    const key=formatDateKey(date);
    if(haramPuasaCache[key]) return haramPuasaCache[key];

    const h=hijriNumeric(date);
    if(!h.day||!h.month){
        haramPuasaCache[key] = false;
        return false;
    }

    for(const item of HARAM_PUASA){
        if(item.d && h.month === item.m && h.day === item.d){
            haramPuasaCache[key] = true;
            return true;
        }
        if(item.range && h.month === item.m && h.day >= item.range[0] && h.day <= item.range[1]){
            haramPuasaCache[key] = true;
            return true;
        }
    }

    haramPuasaCache[key] = false;
    return false;
}

async function fetchPrayerTimes() {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${LATITUDE}&longitude=${LONGITUDE}&method=${CALCULATION_METHOD}&adjustment=${IMSAK_OFFSET}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const formatTime = (timeStr) => timeStr.split(' ')[0].slice(0, 5);
            prayerTimesData = {
                imsak: formatTime(data.data.timings.Imsak),
                fajr: formatTime(data.data.timings.Fajr),
                sunrise: formatTime(data.data.timings.Sunrise),
                dhuhr: formatTime(data.data.timings.Dhuhr),
                asr: formatTime(data.data.timings.Asr),
                maghrib: formatTime(data.data.timings.Maghrib),
                isha: formatTime(data.data.timings.Isha),
                dhuha: ""
            };
            const sunriseDate = new Date(`2000-01-01T${prayerTimesData.sunrise}:00`);
            sunriseDate.setMinutes(sunriseDate.getMinutes() + 25);
            prayerTimesData.dhuha = sunriseDate.toTimeString().slice(0, 5);
        }
    } catch (error) {
        console.error("Error mengambil data imsakiyah:", error);
        prayerTimesData = null;
    }
}

function renderImsakiyah(viewIndex) {
    if(!prayerTimesData){
        return '<span style="display:block;">Memuat jadwal shalat...</span>';
    }
    
    const view = IMSAKIYAH_VIEWS[viewIndex];
    const waktu1 = prayerTimesData[view.key1];
    const waktu2 = prayerTimesData[view.key2];

    return `
        <table class="imsak-table">
            <tr>
                <td rowspan="2" class="location-cell">
                    Sumawe<br>Kab. Malang
                </td>
                <td class="time-cell"><strong><u>${view.title1}</u></strong></td>
                <td class="time-cell"><strong><u>${view.title2}</u></strong></td>
            </tr>
            <tr>
                <td class="time-cell">${waktu1}</td>
                <td class="time-cell">${waktu2}</td>
            </tr>
        </table>
    `;
}


function nextMomen(keys){
    const now=new Date();
    const cacheKey=`${formatDateKey(now)}|${keys.join(',')}`;
    if(momenCache[cacheKey]) return momenCache[cacheKey];

    for(let i=1;i<=365;i++){
        const d=new Date(now); d.setDate(now.getDate()+i);
        const h=hijriNumeric(d);
        if(!h.day||!h.month) continue;
        for(const k of keys){
            const m=MOMEN[k];
            if(h.day===m.d && h.month===m.m){
                return momenCache[cacheKey]=`<i class="fa-solid ${m.icon}"></i>| ${i} hari lagi menuju ${m.name}`;
            }
        }
    }
    return momenCache[cacheKey]=null;
}

function puasaBesok(){
    const b=new Date(); b.setDate(b.getDate()+1);
    const key=formatDateKey(b);
    if(puasaCache[key]) return puasaCache[key];

    if(isHaramPuasa(b)){
        return puasaCache[key] = [`<i class="fa-solid fa-exclamation-circle"></i> Besok haram berpuasa (hari raya/tasyrik)`];
    }

    const h=hijriNumeric(b);
    if(!h.day||!h.month) return [];

    const r=new Set();

    PUASA_ROUTINE.forEach(p=>{
        if(p.type==='weekday' && b.getDay()===p.value){
            r.add(`<i class="fa-solid fa-dove"></i> Besok ${p.name}`);
        }
        if(p.type==='hijriRange' && !p.exclude?.includes(h.month) && h.day>=p.min && h.day<=p.max){
            r.add(`<i class="fa-solid fa-dove"></i> Besok ${p.name}`);
        }
        if(p.type==='hijriFix' && h.month===p.m && h.day>=p.min && h.day<=p.max){
            r.add(`<i class="fa-solid fa-dove"></i> Besok ${p.name}`);
        }
    });

    ['tasua','asyura','arafah'].forEach(k=>{
        const m=MOMEN[k];
        if(h.day===m.d && h.month===m.m){
            r.add(`<i class="fa-solid ${m.icon}"></i> Besok ${m.name}`);
        }
    });

    return puasaCache[key]=[...r];
}

let stateIndex=0,autoSwitch=null;

function getNextValidState(){
    for(let i=1;i<=STATES.length;i++){
        const idx=(stateIndex+i)%STATES.length;
        const s=STATES[idx];
        if(s==='HIJRI') return idx;
        if(s==='PUASA' && puasaBesok().length) return idx;
        if(s==='SYARI' && nextMomen(SYARI_MOMEN_KEYS)) return idx;
        if(s==='INDO' && nextMomen(INDONESIA_MOMEN_KEYS)) return idx;
        if(s.startsWith('IMSAKIYAH')) return idx;
    }
    return stateIndex;
}

function setupAutoSwitch(){
    clearInterval(autoSwitch);
    autoSwitch=setInterval(()=>{
        stateIndex=getNextValidState();
        render();
    },STATE_INTERVALS[STATES[stateIndex]]);
}

function render(){
    const now=new Date();
    const el=document.getElementById('hijri');
    const s=STATES[stateIndex];

    el.style.direction=s==='HIJRI'?'rtl':'ltr';
    el.style.textAlign=s==='HIJRI'?'right':'left';
  el.style.height = '60px'; // Tinggi 

    switch(s){
        case 'HIJRI':
            el.innerHTML=hijriFull(now);
            break;
        case 'PUASA':
            el.innerHTML=puasaBesok().join('<br>')||'<i class="fa-solid fa-info-circle"></i> Tidak ada puasa besok';
            break;
        case 'SYARI':
            el.innerHTML=nextMomen(SYARI_MOMEN_KEYS)||'<i class="fa-solid fa-info-circle"></i> Tidak ada momen syar’i terdekat';
            break;
        case 'INDO':
            el.innerHTML=nextMomen(INDONESIA_MOMEN_KEYS)||'<i class="fa-solid fa-info-circle"></i> Tidak ada momen nasional Islam';
            break;
        case 'IMSAKIYAH1':
            el.innerHTML=renderImsakiyah(0);
            break;
        case 'IMSAKIYAH2':
            el.innerHTML=renderImsakiyah(1);
            break;
        case 'IMSAKIYAH3':
            el.innerHTML=renderImsakiyah(2);
            break;
        case 'IMSAKIYAH4':
            el.innerHTML=renderImsakiyah(3);
            break;
    }

    setupAutoSwitch();
}

function update(){
    const n=new Date();
    document.getElementById('datetime').innerHTML=
        `<i class="fa-solid fa-calendar"></i> ${new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(n)} |
         <i class="fa-solid fa-clock"></i> ${new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(n)}`;
}

document.addEventListener('DOMContentLoaded',()=>{
    fetchPrayerTimes();
    setInterval(fetchPrayerTimes, 24 * 60 * 60 * 1000);

    update();
    setInterval(update,REFRESH_INTERVAL);
    render();
});