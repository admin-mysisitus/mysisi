ppaidarulhuda.id/
│
├── assets/
│   ├── css/
│   │   ├── base/                  # Style dasar & global
│   │   │   ├── reset.css          # Reset margin, padding, box-sizing
│   │   │   ├── typography.css     # Style dasar teks, font, line-height
│   │   │   └── variables.css      # Variabel warna, tipografi, spacing
│   │   ├── components/            # Style untuk komponen reusable
│   │   │   ├── button.css         # Semua tombol (primer, sekunder, login)
│   │   │   ├── custom-font.css    # Style khusus font (ppai-darulhuda-font)
│   │   │   ├── dropdown.css       # Dropdown navigasi
│   │   │   ├── preloader.css      # Preloader halaman
│   │   │   └── support-btn.css    # Tombol support & panel
│   │   ├── layout/                # Style untuk struktur halaman
│   │   │   ├── container.css      # Style container & section
│   │   │   ├── footer.css         # Footer & elemen di dalamnya
│   │   │   ├── header.css         # Header & navigasi (desktop + mobile)
│   │   │   └── responsive.css     # Breakpoint responsif umum
│   │   ├── main.css               # File utama untuk import semua CSS
│   │   └── pages/                 # Style khusus per halaman
│   │       ├── berita.css         # Style unik halaman berita
│   │       ├── formal.css         # Style unik halaman formal
│   │       ├── home.css           # Style unik halaman utama
│   │       ├── iksada.css         # Style unik halaman iksada
│   │       ├── lembaga.css        # Style unik halaman lembaga
│   │       ├── madin.css          # Style unik halaman madin
│   │       ├── pondigi.css        # Style unik halaman pondigi (login, dashboard)
│   │       ├── profile.css        # Style unik halaman profil
│   │       └── yayasan.css        # Style unik halaman yayasan
│   │
│   ├── icons/
│   │   └── svg/
│   ├── img/
│   │   ├── alumni/
│   │   ├── banner/
│   │   ├── berita/
│   │   └── logo/
│   └── js/
│       ├── components/            # Script untuk komponen reusable
│       │   ├── custom-font.js     # Aplikasikan style font khusus
│       │   ├── navigation.js      # Navigasi desktop & mobile + dropdown
│       │   ├── preloader.js       # Logika preloader halaman
│       │   ├── section-animation.js # Animasi elemen saat scroll
│       │   └── support-btn.js     # Script tombol support & WhatsApp dinamis
│       ├── layout/                # Script untuk struktur halaman
│       │   └── footer.js          # Script footer (tahun otomatis, datetime, hijri)
│       └── main.js                # File utama untuk import semua JS
│
├── berita/
│   ├── detail.html
│   └── index.html
│
├── iksada/
│   ├── index.html
│   ├── jejak-alumni.html
│   └── registrasi.html
│
├── index.html
├── layanan/
│   ├── index.html
│   ├── alumni/
│   │   ├── index.html        (penjelasan layanan alumni)
│   │   ├── penelusuran.html  (search / tracking alumni)
│   │   └── registrasi.html   (form data alumni)
│   ├── pendaftaran-santri/
│   │   └── index.html
│   ├── surat/
│   │   ├── index.html
│   │   └── permohonan.html
│   ├── pengaduan/
│   │   └── index.html
│   └── donasi/
│       └── index.html
│
├── lembaga/
│   ├── formal/
│   │   └── index.html
│   ├── index.html
│   ├── madin/
│   │   └── index.html
│   └── yayasan/
│       └── index.html
│
├── myppai/
│   └── editor.html
│
├── pendaftaran/
│   └── index.html
├── pondigi/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── global.css
│   │   │   ├── login.css
│   │   │   ├── pengurus.css
│   │   │   └── wali.css
│   │   ├── files/
│   │   │   └── gas/
│   │   │       └── pondigi.gs
│   │   └── js/
│   │       ├── config.js
│   │       ├── dashboard-pengurus.js
│   │       ├── dashboard-wali.js
│   │       ├── login-pengurus.js
│   │       └── login-wali.js
│   ├── index.html
│   ├── login-pengurus.html
│   ├── login-wali.html
│   ├── pengurus-dashboard.html
│   └── wali-dashboard.html
│
├── profile/
│   └── index.html
└── README.md




ppaidarulhuda.id/
├── index.html
├── profile/
│   ├── index.html
│   └── pendiri.html
├── lembaga/
│   ├── index.html
│   ├── yayasan/
│   │   └── index.html
│   ├── madin/
│   │   └── index.html
│   └── formal/
│       └── index.html
├── layanan/
│   ├── index.html
│   ├── pendaftaran-santri/
│   │   └── index.html
│   ├── administrasi/
│   │   ├── index.html
│   │   └── permohonan.html
│   ├── pengaduan/
│   │   └── index.html
│   └── donasi/
│       └── index.html
├── informasi/
│   ├── index.html
│   ├── berita/
│   │   ├── index.html
│   │   └── detail.html
│   ├── agenda/
│   │   ├── index.html
│   │   └── detail.html
│   └── artikel/
│       ├── index.html
│       └── detail.html
├── iksada/
│   ├── index.html
│   ├── penelusuran.html
│   └── registrasi.html
├── pondigi/
│   ├── index.html
│   ├── login-pengurus.html
│   ├── login-wali.html
│   ├── pengurus-dashboard.html
│   ├── wali-dashboard.html


root/assets/js/
├── main.js                  # Entry point, impor semua file
├── config.js                # Data terpusat (navigasi, sosial, kontak, dll.)
├── wm.js                    # Watermark
├── components/
│   ├── navigation.js        # Logika menu navigasi (mengimpor CONFIG)
│   ├── preloader.js         # Komponen preloader
│   ├── support-btn.js       # Komponen tombol dukungan
│   ├── custom-font.js       # Pengaturan font kustom
│   └── section-animation.js # Animasi bagian halaman
└── layout/
    ├── date-time.js         # Logika untuk datetimeContainer (hijri, kalender. dllp)
    └── ft.js                # Logika footer (mengimpor CONFIG)




ppaidarulhuda.id/index.html	Website resmi Pondok Pesantren PPAI Darul Huda Malang, pesantren salaf terpadu diniyah dan formal.	PPAI Darul Huda, pesantren Malang, pesantren salaf, pondok pesantren Pletes
profile/index.html	Profil lengkap Pondok Pesantren PPAI Darul Huda beserta sejarah, visi, misi, dan karakter pesantren.	profil pesantren, sejarah PPAI Darul Huda, pesantren salaf Malang
lembaga/index.html	Daftar lembaga pendidikan di bawah naungan Pondok Pesantren PPAI Darul Huda Malang.	lembaga pesantren, pendidikan Darul Huda, yayasan pesantren
lembaga/yayasan/index.html	Profil resmi Yayasan Ma'had Darul Huda As-Salafy sebagai pengelola lembaga pendidikan pesantren.	Yayasan Darul Huda, yayasan pesantren Malang, Ma'had Darul Huda
lembaga/madin/index.html	Madrasah Diniyah Darul Huda sebagai pusat pendidikan kitab kuning dan keilmuan salaf.	madrasah diniyah, madin Darul Huda, kitab kuning pesantren
lembaga/formal/index.html	Lembaga pendidikan formal MTs dan MA Darul Huda berbasis pesantren salaf terpadu.	MTs Darul Huda, MA Darul Huda, madrasah pesantren Malang
layanan/index.html	Layanan resmi Pondok Pesantren PPAI Darul Huda meliputi SPMB, administrasi, dan donasi.	layanan pesantren, SPMB Darul Huda, layanan santri
layanan/pendaftaran-santri/index.html	Informasi Sistem Penerimaan Santri Baru Pondok Pesantren PPAI Darul Huda Malang.	SPMB pesantren, pendaftaran santri, pesantren Darul Huda
layanan/administrasi/index.html	Layanan administrasi santri dan wali Pondok Pesantren PPAI Darul Huda.	administrasi pesantren, layanan santri Darul Huda
layanan/administrasi/permohonan.html	Formulir permohonan administrasi resmi Pondok Pesantren PPAI Darul Huda.	permohonan administrasi pesantren, layanan Darul Huda
layanan/pengaduan/index.html	Layanan pengaduan dan aspirasi wali santri Pondok Pesantren PPAI Darul Huda.	pengaduan pesantren, layanan wali santri Darul Huda
layanan/donasi/index.html	Donasi dan dukungan pendidikan untuk Pondok Pesantren PPAI Darul Huda Malang.	donasi pesantren, infak pendidikan, Darul Huda Malang
informasi/index.html	Informasi resmi Pondok Pesantren PPAI Darul Huda meliputi berita, agenda, dan artikel.	informasi pesantren, berita Darul Huda, agenda pesantren
informasi/berita/index.html	Berita dan kabar terbaru seputar kegiatan Pondok Pesantren PPAI Darul Huda.	berita pesantren, kegiatan Darul Huda, info pesantren
informasi/berita/detail.html	Detail berita kegiatan dan perkembangan Pondok Pesantren PPAI Darul Huda.	berita pesantren detail, kegiatan Darul Huda
informasi/agenda/index.html	Agenda dan jadwal kegiatan Pondok Pesantren PPAI Darul Huda Malang.	agenda pesantren, jadwal Darul Huda, kegiatan santri
informasi/agenda/detail.html	Detail agenda kegiatan Pondok Pesantren PPAI Darul Huda Malang.	agenda detail pesantren, kegiatan Darul Huda
informasi/artikel/index.html	Artikel keislaman dan kepesantrenan khas Pondok Pesantren PPAI Darul Huda.	artikel pesantren, keislaman salaf, Darul Huda
informasi/artikel/detail.html	Artikel mendalam seputar pesantren, pendidikan Islam, dan nilai salafiyah.	artikel pesantren detail, pendidikan Islam salaf
iksada/index.html	IKSADA sebagai sistem ikatan keluarga santri dan alumni Pondok Pesantren PPAI Darul Huda.	IKSADA, alumni Darul Huda, keluarga santri
iksada/penelusuran.html	Penelusuran data santri dan alumni Pondok Pesantren PPAI Darul Huda.	data alumni pesantren, penelusuran santri
iksada/registrasi.html	Registrasi anggota IKSADA Pondok Pesantren PPAI Darul Huda Malang.	registrasi alumni pesantren, IKSADA Darul Huda
pondigi/index.html	PONDIGI sebagai sistem digital layanan santri dan wali Pondok Pesantren PPAI Darul Huda.	PONDIGI, sistem pesantren digital, Darul Huda
pondigi/login-pengurus.html	Halaman login pengurus sistem PONDIGI Pondok Pesantren PPAI Darul Huda.	login pengurus pesantren, PONDIGI Darul Huda
pondigi/login-wali.html	Halaman login wali santri untuk akses layanan PONDIGI Darul Huda.	login wali santri, sistem pesantren Darul Huda
pondigi/pengurus-dashboard.html	Dashboard pengurus Pondok Pesantren PPAI Darul Huda berbasis sistem PONDIGI.	dashboard pengurus pesantren, PONDIGI
pondigi/wali-dashboard.html	Dashboard wali santri untuk monitoring pendidikan di Pondok Pesantren PPAI Darul Huda.	dashboard wali santri, pesantren Darul Huda
