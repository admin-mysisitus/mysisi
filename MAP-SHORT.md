==================================================================
PEMBANGUNAN & ARSITEKTUR WEBSITE PONDOK PESANTREN PPAI DARUL HUDA
Domain: ppaidarulhuda.id
==================================================================

**PERAN & PRINSIP DASAR**
Anda bertindak sebagai arsitek sistem, UI/UX designer, dan frontend developer untuk membangun website statis-fungsional yang MEREPRESENTASIKAN ATURAN PESANTREN (prioritas atas praktik web umum). **Website bersifat statis secara deployment, tetapi seluruh logika validasi form WAJIB diimplementasikan di sisi frontend menggunakan JavaScript (state, conditional rendering, validation blocking).** Dokumen ini adalah SUMBER KEBENARAN UTAMA; penyimpangan dianggap CACAT DESAIN.

**IDENTITAS & STRUKTUR KELEMBAGAAN (FINAL)**
Nama resmi: Pondok Pesantren PPAI Darul Huda (PPAI = Pendidikan Perguruan Agama Islam).
Terdapat SATU yayasan: Yayasan Ma'had Darul Huda As-Salafy, yang menaungi TIGA entitas:
1. Madrasah Diniyah (MADIN) – non-formal.
2. Madrasah Formal: Madrasah Tsanawiyah Darul Huda (MTs, SMP) dan Madrasah Aliyah Darul Huda (MA, SMA).
**ATURAN MUTLAK**: Semua santri FORMAL WAJIB terdaftar di MADIN; tidak ada santri formal tanpa MADIN.

**KONSEP PENDAFTARAN SANTRI (SATU PINTU)**
Lokasi: `/layanan/pendaftaran-santri/`.
Prinsip: HANYA SATU halaman pendaftaran (tidak terpisah MADIN dan FORMAL).
Alur logika WAJIB:
1. Calon santri memilih: MADIN atau FORMAL (MTs/MA).
2. Jika MADIN: hanya terdaftar di MADIN.
3. Jika FORMAL: sistem otomatis mendaftarkan ke FORMAL + MADIN (tidak ada opsi untuk membatalkan MADIN; checkbox/toggle semacam itu DILARANG).
**TAMBAHAN WAJIB**: Jika FORMAL dipilih, UI harus:
* menampilkan status ‘MADIN: TERDAFTAR OTOMATIS (WAJIB)’
* field MADIN terkunci (disabled) dan tidak bisa diubah
* ada penjelasan singkat bahwa aturan ini adalah kebijakan pesantren.

**STRUKTUR MENU UTAMA (FINAL)**
1. Home – Landing, profil ringkasan, informasi terbaru, tautan cepat layanan & donasi.
2. Profile – Sejarah, visi-misi, kepengurusan.
3. Informasi (Dropdown): Berita, Agenda, Artikel.
4. Lembaga (Dropdown): Yayasan, Madrasah Diniyah (MADIN), Madrasah Formal (MTs, MA).
5. Layanan (Dropdown): Pendaftaran Santri, Administrasi, Pengaduan, Donasi.
6. IKSADA – Profil alumni, kegiatan, cara bergabung. **Form alumni TIDAK BOLEH menggunakan struktur, field, atau logika yang sama dengan pendaftaran santri.**

**TEKNOLOGI WAJIB**
HTML5 (semantik), CSS3 MURNI (dengan :root variables, tanpa framework), JavaScript MURNI (logika form & UI), Font Awesome, Google Fonts (Poppins, Noto Serif Arabic). DILARANG: framework CSS/JS, CMS, library UI eksternal selain Font Awesome.

**PRINSIP DESAIN & UI/UX**
Struktur mencerminkan hierarki yayasan → lembaga; MADIN dan FORMAL tidak setara dalam kewajiban; UI mengarahkan ke alur benar; logika diutamakan atas estetika; form "memaksa kebenaran aturan".

**PLACEHOLDER YANG DIPERBOLEHKAN**
- Gambar dummy (ditandai jelas untuk diganti foto asli).
- Data kontak (alamat, telepon/WA, email, media sosial) dengan teks placeholder yang mudah diganti.

==================================================================
STRUKTUR DIREKTORI
==================================================================

ppaidarulhuda.id/
├── index.html
│   Fungsi: Landing utama, identitas pesantren, akses cepat layanan.
│   Batasan: Tidak ada form kompleks, tidak ada proses data.
├── berita/
│   ├── index.html (Daftar berita, read-only)
│   └── detail.html (Detail berita; tidak ada fitur layanan)
├── profile/
│   └── index.html (Profil, sejarah, visi, pengasuh)
├── lembaga/
│   ├── index.html (Overview lembaga)
│   ├── formal/
│   │   └── index.html (Informasi pendidikan formal; tidak ada pendaftaran)
│   ├── madin/
│   │   └── index.html (Informasi Madrasah Diniyah)
│   └── yayasan/
│       └── index.html (Informasi legal & struktural yayasan)
├── iksada/
│   ├── index.html (Halaman utama IKSADA, penjelasan alumni)
│   ├── penelusuran.html (Penelusuran data alumni, read-only)
│   └── registrasi.html (Input/pemutakhiran data alumni; validasi wajib)
├── layanan/
│   ├── index.html (Pusat layanan publik)
│   ├── pendaftaran-santri/
│   │   └── index.html (Satu-satunya pintu pendaftaran santri)
│   ├── administrasi/
│   │   ├── index.html (Informasi layanan administrasi)
│   │   └── permohonan.html (Form permohonan; gunakan kategori layanan)
│   ├── pengaduan/
│   │   └── index.html (Masukan/keluhan; anonim opsional)
│   └── donasi/
│       └── index.html (Donasi/infak/wakaf; transparansi wajib)
├── admin/
│   └── index.html
│       Fungsi: dashboard statis (mockup) untuk perencanaan konten.
│       Batasan: tidak menyimpan data, tidak autentikasi, tidak menggantikan CMS eksternal.
└── README.md
    Fungsi: Dokumentasi keputusan arsitektur, riwayat perubahan, alasan arsitektural utama, larangan desain yang pernah dipertimbangkan lalu ditolak.

==================================================================
PRINSIP ARSITEKTUR UTAMA (WAJIB DIPATUHI)
==================================================================
1. Konten ≠ Layanan ≠ Sistem eksternal.
2. Semua form dan proses berada di folder `layanan` atau `iksada`.
3. IKSADA adalah pemilik dan pengelola data alumni.
4. Tidak ada duplikasi fungsi.
5. Sistem eksternal hanya diintegrasikan, tidak diarsipkan.
6. Jika ragu: "Ini dibaca atau digunakan?"

==================================================================
PROMPT ACUAN UNTUK DEVELOPER
==================================================================
Gunakan dokumen ini sebagai sumber kebenaran. IKSADA adalah pusat layanan/data alumni. Jangan tambah folder untuk sistem eksternal yang ada. Bedakan konten informatif, layanan interaktif, dan integrasi sistem. Setiap halaman konsisten dengan peran foldernya.
==================================================================
