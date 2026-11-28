import APIClient from '/assets/js/modules/unified-api.js';
import InvoiceService from '/assets/js/modules/unified-invoice.js';
const CATEGORY_PRESETS = {
  sekolah: {
    categoryBadge: 'DOKUMEN PROPOSAL PENGEMBANGAN WEBSITE SEKOLAH & AKADEMIK',
    title: 'Proposal Pengembangan Website Sekolah Terpadu',
    subtitle: 'Portal Informasi Akademik, Profil Institusi & Sistem Penerimaan Murid Baru (SPMB Online)',
    defaultClient: 'SD Muhammadiyah 1 Sedati (MUSADA)',
    defaultPic: 'Kepala Sekolah & Tim Humas',
    showcase: {
      headline: 'Arsitektur Portal Sekolah Modern & Berstandar Nasional',
      desc: 'Menyajikan akses informasi akademik yang transparan, publikasi prestasi siswa, serta kemudahan pendaftaran murid baru yang terintegrasi langsung dengan panitia SPMB sekolah.',
      tags: ['Infrastruktur Cloud NVMe', 'Antarmuka Multi-Perangkat', 'Enkripsi SSL 256-Bit', 'Domain Resmi .sch.id'],
      url: 'https://sdmusada.sch.id',
      image: '/assets/img/portfolio/sdmusada.webp'
    },
    coverLetter: 'Sehubungan dengan agenda penguatan keterbukaan informasi publik dan efisiensi administrasi akademik pada instansi sekolah yang Bapak/Ibu pimpin, bersama ini PT Sintara Digital Nusantara (SISITUS) menyampaikan penawaran resmi Pekerjaan Pengembangan Website Sekolah Terpadu. Dokumen ini merinci arsitektur sistem, spesifikasi server berkecepatan tinggi, estimasi anggaran investasi, serta jadwal implementasi terukur guna mewujudkan portal pendidikan yang kredibel, aman, dan siap pakai.',
    urgencyTitle: '1. Latar Belakang & Urgensi Digital Institusi',
    urgencyLead: 'Keberadaan portal website resmi merupakan instrumen strategis untuk menjamin kepastian informasi, meningkatkan kepercayaan publik, dan memenuhi standar akreditasi pendidikan modern.',
    urgencies: [
      {
        featured: true,
        icon: 'ph-student',
        title: 'Sistem Registrasi SPMB / PPDB Online 24 Jam',
        desc: 'Memfasilitasi pendaftaran calon murid baru secara daring dengan pengisian formulir terstruktur, upload berkas persyaratan, dan pencatatan nomor registrasi otomatis.'
      },
      {
        icon: 'ph-shield-check',
        title: 'Legalitas & Otoritas Domain Resmi .sch.id',
        desc: 'Identitas hukum sah di bawah PANDI dan Komdigi yang membuktikan legalitas institusi pendidikan resmi serta mencegah potensi penipuan digital beratasnamakan sekolah.'
      },
      {
        icon: 'ph-certificate',
        title: 'Transparansi Akreditasi & Rekam Prestasi',
        desc: 'Publikasi nilai akreditasi resmi, profil tenaga pendidik bersertifikasi, dan daftar capaian prestasi akademik maupun non-akademik siswa secara komprehensif.'
      },
      {
        icon: 'ph-newspaper',
        title: 'Pusat Informasi & Pengumuman Terpadu',
        desc: 'Kanal komunikasi terpusat untuk mempublikasikan agenda belajar, kalender akademik, surat edaran resmi, dan liputan kegiatan sekolah kepada orang tua murid.'
      }
    ],
    modules: [
      {
        icon: 'ph-user-list',
        title: 'Modul Registrasi SPMB / PPDB Online',
        desc: 'Formulir digital pendaftaran siswa baru, verifikasi berkas, dan dashboard rekapitulasi data panitia.',
        items: ['Formulir responsif multi-perangkat', 'Penerbitan kartu bukti registrasi', 'Dashboard ekspor data format Excel']
      },
      {
        icon: 'ph-chalkboard-teacher',
        title: 'Profil Institusi & Direktori Pendidik',
        desc: 'Struktur kepemimpinan sekolah, visi misi, serta direktori kualifikasi tenaga pendidik dan staf tata usaha.',
        items: ['Sambutan resmi pimpinan sekolah', 'Direktori dewan guru dan bidang studi', 'Rekam jejak dan legalitas akreditasi']
      },
      {
        icon: 'ph-article',
        title: 'Warta Sekolah & Dokumentasi Prestasi',
        desc: 'Manajemen publikasi berita kegiatan, ekstrakurikuler, dan dokumentasi penghargaan siswa.',
        items: ['Panel redaksi ramah staf tata usaha', 'Katalogisasi kategori berita terstruktur', 'Integrasi distribusi ke media sosial']
      },
      {
        icon: 'ph-calendar-check',
        title: 'Kalender Akademik & Agenda Kegiatan',
        desc: 'Jadwal terpadu pelaksanaan ujian, kegiatan ekstrakurikuler, pertemuan wali murid, dan libur akademik.',
        items: ['Tampilan jadwal interaktif', 'Sorotan agenda terdekat sekolah', 'Penerbitan surat edaran digital']
      },
      {
        icon: 'ph-image',
        title: 'Galeri Sarana & Fasilitas Pendidikan',
        desc: 'Inventarisasi visual laboratorium, ruang kelas multimedia, perpustakaan, dan fasilitas pendukung.',
        items: ['Galeri visual beresolusi tinggi', 'Deskripsi fasilitas pembelajaran', 'Integrasi video profil kegiatan']
      },
      {
        icon: 'ph-chat-circle-dots',
        title: 'Saluran Layanan Informasi & Aduan',
        desc: 'Akses komunikasi langsung bagi wali murid menuju nomor layanan tata usaha dan lokasi Google Maps.',
        items: ['Tautan komunikasi resmi WhatsApp', 'Formulir aspirasi dan saran resmi', 'Peta lokasi terverifikasi Google Maps']
      }
    ],
    portfolios: [
      { name: 'SD Musada Sedati', cat: 'Sekolah Dasar', img: '/assets/img/portfolio/sdmusada.webp', desc: 'Portal sekolah terpadu dengan modul SPMB online dan berita harian.' },
      { name: 'MAN 1 Gresik', cat: 'Madrasah Aliyah', img: '/assets/img/portfolio/man1gresik.webp', desc: 'Situs resmi madrasah aliyah negeri dengan pusat pengumuman akademik.' },
      { name: 'SMA Semen Gresik', cat: 'Sekolah Menengah Atas', img: '/assets/img/portfolio/smasemengresik.webp', desc: 'Website profil modern berorientasi prestasi dan pendaftaran murid baru.' },
      { name: 'SMP 10 Nopember Sidoarjo', cat: 'Sekolah Menengah Pertama', img: '/assets/img/portfolio/smpsepuluhnopember.webp', desc: 'Desain responsif dengan direktori guru dan galeri kegiatan ekstrakurikuler.' },
      { name: 'MTsN 1 Sidoarjo', cat: 'Madrasah Tsanawiyah', img: '/assets/img/portfolio/mtsn1sidoarjo.webp', desc: 'Portal edukasi islami terpadu dan informasi penerimaan santri/siswa.' },
      { name: 'PPTQ Al-Wahyu', cat: 'Pesantren & Tahfidz', img: '/assets/img/portfolio/pptqalwahyu.webp', desc: 'Profil pondok pesantren tahfidzul quran dengan laporan kegiatan santri.' }
    ],
    pkg1Default: { name: 'Standard School', price: 599000, desc: 'Pondasi portal resmi untuk menampilkan profil institusi, direktori pendidik, dan informasi umum.', features: ['Website Profil Sekolah (Hingga 5 Halaman Utama)', 'Registrasi Domain Resmi .sch.id Selama 1 Tahun', 'Infrastruktur Cloud NVMe Berkecepatan Tinggi', 'Desain Antarmuka Multi-Perangkat (Desktop & Mobile)', 'Integrasi Saluran Komunikasi WhatsApp Humas', 'Garansi Pemeliharaan Sistem 1 Bulan Kalender'] },
    pkg2Default: { name: 'Professional School', price: 1299000, desc: 'Pilihan terlengkap dan paling optimal! Dilengkapi Modul SPMB Online dan portal publikasi berita terpadu.', features: ['Seluruh Spesifikasi Paket Standard School', 'Modul Sistem Registrasi SPMB / PPDB Online', 'Manajemen Publikasi Berita & Dokumentasi Prestasi', 'Kalender Jadwal Akademik & Agenda Kegiatan', 'Galeri Fasilitas Sarana Prasarana Sekolah', 'Sesi Pelatihan Operator Tata Usaha (Online / Zoom)', 'Garansi Pemeliharaan Sistem 3 Bulan Kalender'] },
    pkg3Default: { name: 'Enterprise School', price: 2399000, desc: 'Solusi institusi pendidikan unggulan dengan alokasi server enterprise dan dukungan prioritas penuh.', features: ['Seluruh Spesifikasi Paket Professional School', 'Alokasi Cloud NVMe Enterprise Selama 3 Tahun Penuh', 'Formulir SPMB Kustom dengan Unggah Berkas Persyaratan', 'Direktori Khusus Akun Portofolio Guru', 'Optimasi Indeks Mesin Pencari Google Prioritas', 'Garansi & Pemeliharaan Prioritas 1 Tahun Penuh'] },
    notesDefault: 'Alokasi domain resmi .sch.id berizin PANDI, server cloud performa tinggi, modul formulir SPMB, dan sesi panduan teknis bagi operator sekolah.'
  },
  perusahaan: {
    categoryBadge: 'DOKUMEN PROPOSAL PENGEMBANGAN WEBSITE PERUSAHAAN & B2B',
    title: 'Proposal Pengembangan Website Perusahaan & Corporate Profile',
    subtitle: 'Digital Corporate Identity, Portofolio Layanan & Kredibilitas Bisnis Korporat',
    defaultClient: 'PT Bintang Sinergi Mandiri',
    defaultPic: 'Manajemen Direksi & Divisi Bisnis',
    showcase: {
      headline: 'Konsep Desain Korporat Profesional & Berorientasi Kemitraan',
      desc: 'Menghadirkan profil perusahaan yang kredibel, spesifikasi unit bisnis, portofolio proyek strategis, dan formulir permohonan penawaran resmi untuk mendukung akselerasi kemitraan B2B.',
      tags: ['Infrastruktur Cloud NVMe', 'Antarmuka Multi-Perangkat', 'Enkripsi SSL 256-Bit', 'Kanal Permohonan Penawaran B2B'],
      url: '/demo/perusahaan/',
      image: '/assets/img/portfolio/bintangsinergi.webp'
    },
    coverLetter: 'Sehubungan dengan agenda penguatan kredibilitas korporasi serta perluasan saluran kemitraan bisnis pada perusahaan yang Bapak/Ibu pimpin, PT Sintara Digital Nusantara (SISITUS) dengan ini menyampaikan penawaran resmi pekerjaan Pengembangan Website Perusahaan Terpadu. Dokumen proposal ini merinci spesifikasi arsitektur antarmuka, infrastruktur server berkinerja tinggi, komparasi paket investasi (RAB), serta metodologi pengerjaan terukur guna menghasilkan aset digital yang solid dan terpercaya.',
    urgencyTitle: '1. Latar Belakang & Urgensi Digital Korporat',
    urgencyLead: 'Di tingkat korporasi dan tender pengadaan, keberadaan website resmi menjadi parameter mendasar dalam proses uji kelayakan (due diligence) dan pembuktian kredibilitas bisnis.',
    urgencies: [
      {
        featured: true,
        icon: 'ph-shield-check',
        title: 'Verifikasi Kredibilitas & Legalitas Bisnis',
        desc: 'Perusahaan berbadan hukum membutuhkan representasi digital resmi untuk memenuhi standar verifikasi calon mitra kerja, perbankan, dan proses tender pengadaan formal.'
      },
      {
        icon: 'ph-funnel',
        title: 'Kanal Permohonan Penawaran Kerjasama (RFP)',
        desc: 'Sistem formulir permohonan penawaran terstruktur mempermudah calon klien korporat mengajukan spesifikasi kebutuhan proyek secara terdata dan terorganisir.'
      },
      {
        icon: 'ph-envelope-simple-open',
        title: 'Otoritas Email Korporat Berbasis Domain Resmi',
        desc: 'Komunikasi korespondensi bisnis menggunakan domain resmi (@perusahaan.co.id / .com) menjamin kepatuhan protokol keamanan data dan memperkuat reputasi institusional.'
      },
      {
        icon: 'ph-chart-line-up',
        title: 'Katalog Portofolio & Solusi Layanan Terpadu',
        desc: 'Penyajian rekam jejak pekerjaan, sertifikasi mutu, dan cakupan layanan secara komprehensif memberikan keyakinan penuh bagi calon mitra industri.'
      }
    ],
    modules: [
      {
        icon: 'ph-buildings',
        title: 'Struktur Profil Korporat & Legalitas',
        desc: 'Pemaparan komprehensif sejarah entitas, struktur pimpinan, visi-misi, serta sertifikasi legalitas usaha.',
        items: ['Tata kelola dewan direksi dan komisaris', 'Dokumentasi izin usaha dan sertifikasi', 'Struktur organisasi dan budaya korporat']
      },
      {
        icon: 'ph-briefcase',
        title: 'Katalog Solusi Layanan & Produk Bisnis',
        desc: 'Klasifikasi divisi bisnis, spesifikasi teknis layanan, serta nilai keunggulan kompetitif perusahaan.',
        items: ['Penyusunan kategori unit bisnis terpadu', 'Spesifikasi teknis kapabilitas layanan', 'Brosur company profile format unduhan PDF']
      },
      {
        icon: 'ph-kanban',
        title: 'Portofolio Proyek & Studi Kasus Rekanan',
        desc: 'Dokumentasi proyek strategis yang telah diselesaikan beserta profil mitra klien industri.',
        items: ['Showcase galeri proyek resolusi tinggi', 'Daftar logo klien korporat dan institusi', 'Testimoni dan surat keterangan puas mitra']
      },
      {
        icon: 'ph-paper-plane-tilt',
        title: 'Formulir Permohonan Kerjasama (RFP) B2B',
        desc: 'Formulir digital untuk memfasilitasi permintaan penawaran harga dari calon mitra korporat.',
        items: ['Kustomisasi bidang input kebutuhan proyek', 'Notifikasi otomatis ke email manajemen', 'Integrasi konfirmasi via saluran WhatsApp']
      },
      {
        icon: 'ph-newspaper-clipping',
        title: 'Pusat Publikasi Warta Bisnis & CSR',
        desc: 'Manajemen rilis pers, liputan kegiatan internal korporasi, dan laporan pertanggungjawaban sosial.',
        items: ['Pusat siaran pers dan artikel industri', 'Dokumentasi inisiatif program sosial CSR', 'Kanal arsip laporan tahunan perusahaan']
      },
      {
        icon: 'ph-map-pin',
        title: 'Direktori Operasional & Kontak Kantor',
        desc: 'Informasi kontak kantor pusat, workshop, pabrik operasional, serta peta navigasi terverifikasi.',
        items: ['Alamat lengkap seluruh unit kantor', 'Nomor sambungan telepon dan email departemen', 'Peta koordinat navigasi Google Maps']
      }
    ],
    portfolios: [
      { name: 'PT Bintang Sinergi Mandiri', cat: 'Holding Korporat', img: '/assets/img/portfolio/bintangsinergi.webp', desc: 'Profil korporat holding multi-sektor dengan katalog unit bisnis dan kanal RFP penawaran.' },
      { name: 'PT Innovize Solusi Pratama', cat: 'Konsultan Teknologi', img: '/assets/img/portfolio/innovize.webp', desc: 'Website teknologi korporat dengan rekam jejak implementasi infrastruktur digital.' },
      { name: 'PT Andalan Pacific Maritim', cat: 'Logistik & Maritim', img: '/assets/img/portfolio/andalanpacific.webp', desc: 'Situs profil perusahaan pelayaran dan kargo laut dengan portofolio armada kapal.' },
      { name: 'PT Forindo Perkasa Teknik', cat: 'Konstruksi & Teknik', img: '/assets/img/portfolio/forindo.webp', desc: 'Profil kontraktor rekayasa teknik industri dengan dokumentasi proyek infrastruktur.' },
      { name: 'PT Krisan Prima Logistik', cat: 'Ekspedisi & Distribusi', img: '/assets/img/portfolio/krisan.webp', desc: 'Situs korporat jaringan rantai pasok dengan layanan tracking armada terpadu.' },
      { name: 'PT Tohitindo Energi Persada', cat: 'Energi & Manufaktur', img: '/assets/img/portfolio/tohitindo.webp', desc: 'Website manufaktur berskala nasional dengan verifikasi standar ISO internasional.' }
    ],
    pkg1Default: { name: 'Corporate Standard', price: 999000, desc: 'Pondasi representasi bisnis formal untuk memenuhi syarat legalitas dan profil institusi.', features: ['Website Profil Korporat (Hingga 6 Halaman Utama)', 'Registrasi Domain Bisnis (.co.id / .com) Selama 1 Tahun', 'Infrastruktur Cloud NVMe Server Bisnis', 'Antarmuka Responsif Multi-Perangkat', '2 Akun Email Bisnis Resmi Domain Perusahaan', 'Garansi Pemeliharaan Sistem 1 Bulan Kalender'] },
    pkg2Default: { name: 'Corporate Business', price: 1899000, desc: 'Pilihan paling direkomendasikan untuk menunjang ekspansi kemitraan B2B dan penawaran tender.', features: ['Seluruh Spesifikasi Paket Corporate Standard', 'Formulir Permohonan Penawaran Kerjasama (RFP) B2B', 'Showcase Portofolio Proyek & Direktori Klien Korporat', 'Unduhan Brosur Company Profile Format PDF', '5 Akun Email Bisnis Resmi Domain Perusahaan', 'Sesi Panduan Pengelolaan Konten Website', 'Garansi Pemeliharaan Sistem 3 Bulan Kalender'] },
    pkg3Default: { name: 'Corporate Enterprise', price: 3499000, desc: 'Solusi korporasi berskala besar dengan kapasitas multi-cabang, hosting terdedikasi, dan SLA prioritas.', features: ['Seluruh Spesifikasi Paket Corporate Business', 'Alokasi Server Cloud NVMe Enterprise 3 Tahun Penuh', 'Kapasitas Halaman Profil & Unit Bisnis Tanpa Batas', '15 Akun Email Bisnis Resmi Domain Perusahaan', 'Optimasi Indeks Pencarian Google Bisnis Terpadu', 'Garansi Pemeliharaan & Dukungan Prioritas 1 Tahun Penuh'] },
    notesDefault: 'Sudah mencakup pendaftaran domain resmi (.co.id / .com), konfigurasi email korporat berotentikasi, modul formulir penawaran B2B, dan sertifikasi keamanan SSL.'
  },
  personal: {
    categoryBadge: 'DOKUMEN PROPOSAL PENGEMBANGAN WEBSITE PERSONAL & PROFESIONAL',
    title: 'Proposal Pengembangan Website Portofolio & Personal Branding',
    subtitle: 'Otoritas Profil Profesional, Publikasi Portofolio Keahlian & Sistem Reservasi Konsultasi',
    defaultClient: 'dr. Fajar Kristiono, Sp.A',
    defaultPic: 'Praktisi & Konsultan Profesional',
    showcase: {
      headline: 'Arsitektur Portofolio Personal Berstandar Kredibilitas Tinggi',
      desc: 'Membangun personal branding yang kokoh, menyajikan rekam jejak keahlian dan publikasi, serta memfasilitasi komunikasi langsung dan penjadwalan sesi konsultasi terarah.',
      tags: ['Infrastruktur Cloud NVMe', 'Antarmuka Multi-Perangkat', 'Enkripsi SSL 256-Bit', 'Sistem Reservasi Jadwal'],
      url: 'https://drfajarkristiono.com',
      image: '/assets/img/portfolio/fajarkristiono.webp'
    },
    coverLetter: 'Dalam rangka memperkuat kredibilitas kepakaran serta mempermudah akses interaksi profesional dan penjadwalan konsultasi bagi klien maupun publik, bersama ini kami dari PT Sintara Digital Nusantara (SISITUS) menyampaikan penawaran resmi Pekerjaan Pengembangan Website Personal & Profesional. Dokumen ini menyajikan rincian teknis perancangan antarmuka, spesifikasi infrastruktur server, dan rencana investasi terencana.',
    urgencyTitle: '1. Latar Belakang & Urgensi Portofolio Personal',
    urgencyLead: 'Website mandiri adalah saluran representasi tunggal yang sepenuhnya Anda kendalikan tanpa bergantung pada algoritma atau batasan media sosial pihak ketiga.',
    urgencies: [
      {
        featured: true,
        icon: 'ph-identification-card',
        title: 'Otoritas Kepakaran & Identitas Terverifikasi',
        desc: 'Mempertegas status profesional, riwayat sertifikasi resmi, asosiasi keahlian, dan rekam jejak karir di mata klien institusi maupun publik.'
      },
      {
        icon: 'ph-calendar-plus',
        title: 'Sistem Reservasi Konsultasi & Jadwal Temu',
        desc: 'Memfasilitasi pemesanan jadwal sesi konsultasi, audiensi, maupun permohonan pembicara acara yang terhubung langsung ke kanal asisten.'
      },
      {
        icon: 'ph-article',
        title: 'Kanal Publikasi Artikel & Gagasan Ahli',
        desc: 'Wadah resmi untuk mendokumentasikan karya tulis, hasil riset, opini profesional, dan edukasi publik yang terindeks rapi di Google.'
      },
      {
        icon: 'ph-trophy',
        title: 'Arsip Rekam Jejak Karya & Liputan Media',
        desc: 'Dokumentasi proyek sukses, liputan media nasional, penghargaan industri, serta ulasan apresiasi dari rekan sejawat.'
      }
    ],
    modules: [
      {
        icon: 'ph-user-circle',
        title: 'Profil Profesional & Riwayat Karir',
        desc: 'Biografi formal, rekam jejak pendidikan, sertifikasi kompetensi, dan asosiasi profesi.',
        items: ['Ringkasan eksekutif perjalanan karir', 'Daftar sertifikasi kompetensi resmi', 'Unduhan Curriculum Vitae (CV) PDF']
      },
      {
        icon: 'ph-calendar-check',
        title: 'Sistem Reservasi Sesi Konsultasi',
        desc: 'Formulir permohonan audiensi dan pemilihan jadwal konsultasi terintegrasi WhatsApp.',
        items: ['Formulir pemilihan hari dan jam sesi', 'Pilihan topik konsultasi spesifik', 'Konfirmasi instan ke WhatsApp asisten']
      },
      {
        icon: 'ph-feather',
        title: 'Pusat Publikasi Artikel & Gagasan',
        desc: 'Media publikasi opini ilmiah, artikel edukasi, dan pandangan profesional.',
        items: ['Tampilan tata letak artikel terstruktur', 'Kategorisasi topik tulisan profesional', 'Optimasi keterbacaan pada smartphone']
      },
      {
        icon: 'ph-star',
        title: 'Ulasan Rekanan & Surat Rekomendasi',
        desc: 'Apresiasi kepuasan dari klien, pasien, maupun rekan seprofesi.',
        items: ['Kutipan testimoni mitra terverifikasi', 'Daftar logo institusi kerjasama', 'Tautan bukti referensi profesional']
      },
      {
        icon: 'ph-microphone-stage',
        title: 'Arsip Publikasi & Undangan Pembicara',
        desc: 'Dokumentasi wawancara media massa dan formulir undangan seminar / lokakarya.',
        items: ['Arsip siaran pers dan liputan media', 'Formulir undangan narasumber resmi', 'Integrasi profil jejaring profesional']
      },
      {
        icon: 'ph-share-network',
        title: 'Hub Komunikasi & Jejaring Resmi',
        desc: 'Saluran terpadu menuju seluruh kontak resmi, media sosial, dan lokasi praktik / kantor.',
        items: ['Tautan terpadu seluruh akun media sosial', 'Saluran pesan WhatsApp terverifikasi', 'Peta lokasi kantor atau ruang praktik']
      }
    ],
    portfolios: [
      { name: 'dr. Fajar Kristiono, Sp.A', cat: 'Dokter Spesialis Anak', img: '/assets/img/portfolio/fajarkristiono.webp', desc: 'Website personal dokter spesialis anak dengan artikel edukasi orang tua & info jadwal klinik.' },
      { name: 'Handoko Tantra', cat: 'Konsultan Bisnis & Penulis', img: '/assets/img/portfolio/handokotantra.webp', desc: 'Portofolio pembicara publik dan profil program mentoring bisnis.' },
      { name: 'Ali Brohimi', cat: 'Kreatif & Fotografer', img: '/assets/img/portfolio/alibrohimi.webp', desc: 'Galeri karya visual eksklusif dengan sistem booking sesi foto profesional.' },
      { name: 'LegalNet Advocate', cat: 'Advokat & Konsultan Hukum', img: '/assets/img/portfolio/legalnet.webp', desc: 'Profil advokat dengan rekam jejak perkara dan permohonan konsultasi hukum online.' },
      { name: 'Dahlia Law Group', cat: 'Managing Partner Law', img: '/assets/img/portfolio/dahlialawgroup.webp', desc: 'Website kepemimpinan partner legal profesional berskala nasional.' },
      { name: 'Dawn Insight Strategy', cat: 'Strategic Advisor', img: '/assets/img/portfolio/dawinsight.webp', desc: 'Profil penasihat korporat dengan rekam jejak restrukturisasi organisasi.' }
    ],
    pkg1Default: { name: 'Personal Standard', price: 499000, desc: 'Langkah awal yang ideal untuk memiliki representasi resmi dengan alamat domain pribadi.', features: ['Website Profil & Portofolio (Hingga 4 Halaman Utama)', 'Registrasi Domain Personal (.com / .id) Selama 1 Tahun', 'Infrastruktur Cloud NVMe Kinerja Tinggi', 'Antarmuka Responsif Multi-Perangkat', 'Integrasi Saluran Komunikasi WhatsApp', 'Garansi Pemeliharaan Sistem 1 Bulan Kalender'] },
    pkg2Default: { name: 'Professional Brand', price: 999000, desc: 'Pilihan paling direkomendasikan! Lengkap dengan modul reservasi, blog artikel & optimasi pencarian.', features: ['Seluruh Spesifikasi Paket Personal Standard', 'Modul Sistem Reservasi Jadwal Temu / Konsultasi', 'Manajemen Publikasi Artikel Edukasi & Opini', 'Galeri Sertifikat, Liputan Media & Prestasi', 'Optimasi Indeks Pencarian Nama Personal di Google', 'Garansi Pemeliharaan Sistem 3 Bulan Kalender'] },
    pkg3Default: { name: 'Executive Authority', price: 1899000, desc: 'Solusi komprehensif bagi pakar dan konsultan senior untuk membangun aset branding jangka panjang.', features: ['Seluruh Spesifikasi Paket Professional Brand', 'Alokasi Server Cloud NVMe Selama 3 Tahun Penuh', 'Email Resmi Berbasis Domain (kontak@namapribadi.com)', 'Unduhan Dokumen Portofolio Format PDF', 'Optimasi SEO Lanjutan & Kecepatan Akses Grade A', 'Garansi & Dukungan Prioritas 1 Tahun Penuh'] },
    notesDefault: 'Konfigurasi domain resmi personal, modul formulir pemesanan jadwal konsultasi, manajemen publikasi artikel, dan optimasi mesin pencari Google.'
  },
  umkm: {
    categoryBadge: 'DOKUMEN PROPOSAL PENGEMBANGAN WEBSITE KATALOG & PENJUALAN UMKM',
    title: 'Proposal Pembuatan Website Toko Online & Katalog Mandiri',
    subtitle: 'Katalog Produk Terstruktur, Pemesanan Terintegrasi WhatsApp & Gerbang Pembayaran QRIS',
    defaultClient: 'Si Bumbu Nusantara',
    defaultPic: 'Pemilik Usaha & Tim Operasional',
    showcase: {
      headline: 'Kanal Penjualan Digital Mandiri Tanpa Potongan Komisi',
      desc: 'Menghadirkan etalase produk digital 24 jam dengan ringkasan pesanan otomatis ke WhatsApp, kalkulasi estimasi ekspedisi, dan opsi pembayaran QRIS instan.',
      tags: ['Kanal Penjualan Mandiri 100%', 'Format Pesanan WhatsApp Terpadu', 'Gerbang Pembayaran QRIS', 'Kalkulasi Tarif Ekspedisi'],
      url: 'https://sibumbu.com',
      image: '/assets/img/portfolio/sibumbu.webp'
    },
    coverLetter: 'Dalam rangka memperluas jangkauan pemasaran serta membangun kanal penjualan mandiri yang bebas dari potongan komisi pihak ketiga, bersama ini PT Sintara Digital Nusantara (SISITUS) menyampaikan penawaran resmi Pembuatan Website Toko Online & Katalog Produk UMKM. Dokumen proposal ini merangkum kapabilitas sistem katalog interaktif, estimasi investasi biaya, serta tahapan pengerjaan terencana.',
    urgencyTitle: '1. Latar Belakang & Urgensi Kanal Penjualan Mandiri',
    urgencyLead: 'Ketergantungan penuh pada platform marketplace pihak ketiga berisiko membebani margin keuntungan akibat potongan biaya layanan yang terus meningkat.',
    urgencies: [
      {
        featured: true,
        icon: 'ph-currency-circle-dollar',
        title: 'Keuntungan Penuh Tanpa Potongan Komisi 0%',
        desc: 'Seluruh nilai transaksi penjualan produk menjadi hak usaha Anda sepenuhnya tanpa potongan biaya komisi per transaksi dari perantara.'
      },
      {
        icon: 'ph-whatsapp-logo',
        title: 'Pemesanan Otomatis Tersusun ke WhatsApp',
        desc: 'Pelanggan memilih produk dan alamat tujuan; sistem merangkum format rincian pesanan secara terstruktur langsung ke obrolan WhatsApp admin.'
      },
      {
        icon: 'ph-qr-code',
        title: 'Gerbang Pembayaran Digital QRIS & Transfer Bank',
        desc: 'Mendukung penerimaan pembayaran dari seluruh dompet digital dan perbankan nasional melalui pemindaian kode QRIS terverifikasi.'
      },
      {
        icon: 'ph-storefront',
        title: 'Katalog Produk Digital Siap Diakses 24 Jam',
        desc: 'Calon pembeli dapat mempelajari varian produk, ketersediaan stok, dan daftar harga resmi kapan saja tanpa harus menunggu balasan admin.'
      }
    ],
    modules: [
      {
        icon: 'ph-shopping-bag-open',
        title: 'Katalog Produk & Galeri Varian Interaktif',
        desc: 'Penyajian visual produk dengan resolusi tajam, deskripsi komposisi, dan klasifikasi kategori rapi.',
        items: ['Manajemen katalog produk tanpa batasan jumlah', 'Pemisahan kategori produk terstruktur', 'Label penanda stok tersedia atau habis']
      },
      {
        icon: 'ph-chat-teardrop-dots',
        title: 'Sistem Checkout Cepat ke WhatsApp',
        desc: 'Keranjang belanja praktis yang langsung merangkum total pesanan dan data pengiriman ke chat WhatsApp.',
        items: ['Penyusunan format pesanan rapi otomatis', 'Pencatatan alamat kirim dan nomor pemesan', 'Proses konfirmasi satu kali klik']
      },
      {
        icon: 'ph-qr-code',
        title: 'Integrasi Pembayaran QRIS & Perbankan',
        desc: 'Penyediaan kode pembayaran QRIS dan nomor rekening resmi usaha untuk verifikasi pembayaran mudah.',
        items: ['Pemindaian QRIS seluruh aplikasi m-banking', 'Petunjuk langkah transfer bank terpadu', 'Formulir konfirmasi bukti transaksi']
      },
      {
        icon: 'ph-truck',
        title: 'Kalkulasi Estimasi Tarif Ekspedisi',
        desc: 'Dukungan simulasi biaya pengiriman kurir logistik nasional ke seluruh wilayah kecamatan se-Indonesia.',
        items: ['Pilihan kurir ekspedisi populer nasional', 'Estimasi ongkos kirim otomatis', 'Pilihan opsi pengiriman ekspedisi atau ambil mandiri']
      },
      {
        icon: 'ph-tag',
        title: 'Manajemen Kupon Diskon & Program Promosi',
        desc: 'Pengaturan banner promosi tematik, kode voucher belanja hemat, dan label potongan harga kuantitas.',
        items: ['Fitur klaim kode kupon diskon pesanan', 'Banner promosi dinamis di halaman muka', 'Penanda produk unggulan (Best Seller)']
      },
      {
        icon: 'ph-thumbs-up',
        title: 'Ulasan Pelanggan & Koordinat Lokasi Usaha',
        desc: 'Dokumentasi testimoni pembeli puas serta navigasi lokasi fisik toko terintegrasi ke Google Maps.',
        items: ['Dokumentasi ulasan kepuasan pembeli', 'Integrasi petunjuk arah peta Google Maps', 'Tautan terhubung ke media sosial Instagram & TikTok']
      }
    ],
    portfolios: [
      { name: 'Si Bumbu Nusantara', cat: 'F&B & Bumbu Masak', img: '/assets/img/portfolio/sibumbu.webp', desc: 'Katalog produk bumbu masakan tradisional dengan pemesanan langsung ke WhatsApp agen.' },
      { name: 'Family Food Indonesia', cat: 'Kuliner & Frozen Food', img: '/assets/img/portfolio/familyfoodindonesia.webp', desc: 'Toko online produk makanan beku keluarga dengan fitur hitung ongkir antar kota.' },
      { name: 'Jamet Snack', cat: 'Camilan & Retail', img: '/assets/img/portfolio/jamet.webp', desc: 'Katalog camilan kekinian dengan checkout cepat dan integrasi pembayaran QRIS.' },
      { name: 'Luvion Official', cat: 'Fashion & Aksesoris', img: '/assets/img/portfolio/luvion.webp', desc: 'Toko online brand fashion lokal dengan tampilan visual modern ala butik premium.' },
      { name: 'Nasgor Rakyat', cat: 'Restoran & Kuliner', img: '/assets/img/portfolio/nasgorrakyat.webp', desc: 'Website menu kuliner nusantara dengan integrasi pesanan takeaway via chat WhatsApp.' },
      { name: 'Barama Tour', cat: 'Layanan Wisata & Travel', img: '/assets/img/portfolio/baramatour.webp', desc: 'Katalog paket perjalanan wisata dengan sistem reservasi dan konsultasi tanggal tur.' }
    ],
    pkg1Default: { name: 'Katalog Standard', price: 649000, desc: 'Katalog produk digital mandiri untuk memperkenalkan ragam produk usaha Anda kepada pasar online.', features: ['Katalog Produk Daring (Kapasitas Hingga 20 Produk)', 'Registrasi Domain (.com / .my.id) Selama 1 Tahun', 'Infrastruktur Cloud NVMe Ringan & Stabil', 'Pemesanan Langsung Menuju Chat WhatsApp', 'Antarmuka Responsif Multi-Perangkat', 'Garansi Pemeliharaan Sistem 1 Bulan Kalender'] },
    pkg2Default: { name: 'Toko Bisnis Online', price: 1399000, desc: 'Pilihan paling favorit! Katalog tanpa batasan jumlah, simulasi ongkos kirim & integrasi QRIS.', features: ['Seluruh Spesifikasi Paket Katalog Standard', 'Kapasitas Katalog Produk Tanpa Batasan Jumlah', 'Kalkulator Simulasi Estimasi Ongkir Se-Indonesia', 'Integrasi Gerbang Pembayaran QRIS & Transfer Bank', 'Fitur Manajemen Kupon Diskon Belanja', 'Panduan Pembaruan Produk via Smartphone', 'Garansi Pemeliharaan Sistem 3 Bulan Kalender'] },
    pkg3Default: { name: 'E-Commerce Enterprise', price: 2599000, desc: 'Solusi toko online terdedikasi skala bertumbuh dengan alokasi server hosting 3 tahun penuh.', features: ['Seluruh Spesifikasi Paket Toko Bisnis Online', 'Alokasi Server Cloud NVMe Selama 3 Tahun Penuh', 'Optimasi Indeks Pencarian Produk di Google', 'Banner Promo & Pop-up Pemberitahuan Penawaran', 'Akun Email Bisnis Resmi (order@namabrand.com)', 'Garansi & Dukungan Prioritas 1 Tahun Penuh'] },
    notesDefault: 'Katalog produk tanpa batas, kalkulator estimasi ongkos kirim ekspedisi nasional, modul pembayaran QRIS, dan panduan pengelolaan dari ponsel.'
  },
  klinik: {
    categoryBadge: 'DOKUMEN PROPOSAL PENGEMBANGAN WEBSITE KLINIK & FASILITAS KESEHATAN',
    title: 'Proposal Pengembangan Portal Layanan Klinik & Fasilitas Kesehatan',
    subtitle: 'Informasi Layanan Medis, Jadwal Praktik Tenaga Medis & Sistem Reservasi Antrean Pasien',
    defaultClient: 'Grows & Giggles Child Development Clinic',
    defaultPic: 'Kepala Manajemen Operasional',
    showcase: {
      headline: 'Portal Pelayanan Pasien yang Responsif, Terstandar & Terpercaya',
      desc: 'Memudahkan pasien dan keluarga mengakses jadwal dokter spesialis, registrasi antrean konsultasi, serta informasi fasilitas pelayanan medis secara transparan.',
      tags: ['Infrastruktur Cloud NVMe', 'Antarmuka Multi-Perangkat', 'Enkripsi SSL 256-Bit', 'Modul Reservasi Jadwal Praktik'],
      url: 'https://growsgiggles.com',
      image: '/assets/img/portfolio/growsgigglesclinic.webp'
    },
    coverLetter: 'Dalam rangka meningkatkan mutu pelayanan informasi publik dan tata kelola antrean registrasi pasien, bersama ini PT Sintara Digital Nusantara (SISITUS) menyampaikan penawaran resmi Pekerjaan Pengembangan Portal Fasilitas Kesehatan Terpadu. Dokumen ini merangkum perancangan sistem informasi medis terpadu, standar keamanan data pasien, serta jadwal implementasi operasional.',
    urgencyTitle: '1. Latar Belakang & Urgensi Digital Fasilitas Kesehatan',
    urgencyLead: 'Akses informasi jadwal praktik medis yang akurat dan sistem reservasi daring memangkas waktu tunggu pasien serta mengoptimalkan operasional staf registrasi klinik.',
    urgencies: [
      {
        featured: true,
        icon: 'ph-calendar-check',
        title: 'Reservasi Antrean & Pendaftaran Pasien Daring',
        desc: 'Pasien dapat memesan nomor antrean dan memilih jadwal konsultasi sebelum datang ke lokasi fisik klinik.'
      },
      {
        icon: 'ph-stethoscope',
        title: 'Transparansi Jadwal Praktik Tenaga Medis',
        desc: 'Informasi jadwal hari dan jam praktik dokter spesialis terbarui secara jelas untuk mencegah salah jadwal kunjungan pasien.'
      },
      {
        icon: 'ph-first-aid-kit',
        title: 'Katalog Layanan Tindakan Medis & Tarif Transparan',
        desc: 'Penyajian informasi cakupan tindakan medis, fasilitas laboratorium, dan tarif layanan penunjang secara akurat.'
      },
      {
        icon: 'ph-shield-check',
        title: 'Kepatuhan Standar Informasi Medis Resmi',
        desc: 'Menegaskan reputasi kredibilitas institusi medis dengan domain resmi terverifikasi dan sertifikat keamanan data.'
      }
    ],
    modules: [
      {
        icon: 'ph-address-book',
        title: 'Modul Reservasi Antrean & Jadwal Praktik',
        desc: 'Sistem formulir pemesanan kunjungan pasien terhubung ke konfirmasi otomatis via WhatsApp.',
        items: ['Pilihan poliklinik dan dokter pemeriksa', 'Pilihan tanggal dan estimasi waktu kunjungan', 'Penerbitan nomor antrean registrasi digital']
      },
      {
        icon: 'ph-user-gear',
        title: 'Direktori Dokter Spesialis & Tenaga Medis',
        desc: 'Profil kualifikasi dokter, latar belakang pendidikan spesialisasi, dan jadwal jaga mingguan.',
        items: ['Foto profil dan gelar keahlian tenaga medis', 'Tabel jam praktik harian terinci', 'Integrasi tombol pendaftaran langsung ke dokter']
      },
      {
        icon: 'ph-hospital',
        title: 'Katalog Layanan Medis & Poliklinik',
        desc: 'Rincian unit layanan kesehatan, ruang perawatan, fasilitas farmasi, dan laboratorium diagnostik.',
        items: ['Deskripsi prosedur tindakan medis terpadu', 'Dokumentasi fasilitas ruang terapi / rawat', 'Paket medical check-up dan program kesehatan']
      },
      {
        icon: 'ph-book-open-text',
        title: 'Pusat Edukasi Kesehatan & Tips Medis',
        desc: 'Media publikasi artikel kesehatan terpercaya yang disusun oleh tim dokter untuk masyarakat.',
        items: ['Pusat artikel kesehatan keluarga terverifikasi', 'Pencarian artikel berdasarkan topik kesehatan', 'Optimasi keterbacaan pada perangkat ponsel']
      },
      {
        icon: 'ph-phone-call',
        title: 'Kanal Darurat & Lokasi Fasilitas Kesehatan',
        desc: 'Tombol panggilan darurat cepat (hotline) dan navigasi Google Maps menuju fasilitas klinik.',
        items: ['Akses panggilan darurat satu kali sentuh', 'Petunjuk rute navigasi terverifikasi Google Maps', 'Informasi cakupan asuransi dan mitra rekanan']
      },
      {
        icon: 'ph-certificate',
        title: 'Legalitas Izin Operasional & Akreditasi',
        desc: 'Pemaparan nomor surat izin operasional fasilitas kesehatan dan sertifikat akreditasi resmi.',
        items: ['Pencantuman nomor izin operasional klinik', 'Akreditasi mutu fasilitas pelayanan kesehatan', 'Kepatuhan standar privasi data pengunjung']
      }
    ],
    portfolios: [
      { name: 'Grows & Giggles Clinic', cat: 'Klinik Tumbuh Kembang Anak', img: '/assets/img/portfolio/growsgigglesclinic.webp', desc: 'Portal klinik spesialis anak dengan informasi poliklinik dan modul reservasi online.' },
      { name: 'dr. Fajar Kristiono, Sp.A', cat: 'Praktik Dokter Spesialis', img: '/assets/img/portfolio/fajarkristiono.webp', desc: 'Situs resmi dokter spesialis anak dengan jadwal konsultasi dan tips kesehatan.' },
      { name: 'Ikare Home Care', cat: 'Layanan Perawatan Medis', img: '/assets/img/portfolio/ikarehome.webp', desc: 'Layanan perawat medis ke rumah dengan pemesanan jadwal kunjungan cepat.' },
      { name: 'Beauty Talk Clinic', cat: 'Klinik Estetika & Kulit', img: '/assets/img/portfolio/beautytalk.webp', desc: 'Klinik perawatan kulit dengan katalog paket treatment dan konsultasi WhatsApp.' },
      { name: 'Noel Indonesia', cat: 'Klinik & Wellness', img: '/assets/img/portfolio/noelindonesia.webp', desc: 'Pusat kebugaran medis dan terapi rehabilitasi dengan reservasi terpadu.' },
      { name: 'SD Musada Sedati', cat: 'Institusi Mitra', img: '/assets/img/portfolio/sdmusada.webp', desc: 'Portal sekolah dengan modul kesehatan dan registrasi daring terpadu.' }
    ],
    pkg1Default: { name: 'Klinik Standard', price: 999000, desc: 'Pondasi portal resmi fasilitas kesehatan untuk mempublikasikan profil layanan dan jadwal dokter.', features: ['Website Profil Klinik (Hingga 6 Halaman Utama)', 'Registrasi Domain Resmi (.id / .com) Selama 1 Tahun', 'Infrastruktur Cloud NVMe Berkecepatan Tinggi', 'Desain Antarmuka Multi-Perangkat (Desktop & Mobile)', 'Integrasi Tombol WhatsApp Layanan Pasien', 'Garansi Pemeliharaan Sistem 1 Bulan Kalender'] },
    pkg2Default: { name: 'Klinik Professional', price: 1899000, desc: 'Pilihan paling direkomendasikan! Dilengkapi Modul Reservasi Antrean Daring dan direktori jadwal dokter.', features: ['Seluruh Spesifikasi Paket Klinik Standard', 'Modul Sistem Reservasi Antrean Kunjungan Pasien', 'Direktori Jadwal Praktik Dokter & Tenaga Medis', 'Pusat Publikasi Artikel & Informasi Tips Medis', 'Katalog Layanan & Informasi Paket Pemeriksaan', 'Sesi Panduan Pengelolaan Bagi Staf Administrasi', 'Garansi Pemeliharaan Sistem 3 Bulan Kalender'] },
    pkg3Default: { name: 'Klinik Enterprise', price: 3499000, desc: 'Solusi fasilitas kesehatan komprehensif dengan hosting terdedikasi, kapasitas besar dan SLA prioritas.', features: ['Seluruh Spesifikasi Paket Klinik Professional', 'Alokasi Server Cloud NVMe Enterprise 3 Tahun Penuh', 'Kapasitas Halaman Profil & Dokter Tanpa Batas', 'Optimasi Indeks Pencarian Google Bisnis Terpadu', 'Email Resmi Berbasis Domain (kontak@namaklinik.com)', 'Garansi Pemeliharaan & Dukungan Prioritas 1 Tahun Penuh'] },
    notesDefault: 'Pendaftaran domain resmi, modul pemesanan jadwal kunjungan antrean pasien, konfigurasi direktori dokter, dan sertifikasi keamanan data SSL.'
  }
};
function formatIDR(num) {
  if (!num || isNaN(num)) return 'Rp 0';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}
function formatIndoDate(dateStr) {
  if (!dateStr) return '31 Desember 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}
async function initProposalPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const propId = urlParams.get('id');
  const reqType = (urlParams.get('type') || '').toLowerCase();
  let proposalData = null;
  if (propId) {
    try {
      const res = await APIClient.getAdminProposalById(propId);
      if (res && res.success && res.data) {
        proposalData = res.data;
      }
    } catch (e) {
      console.warn('API lookup fallback:', e);
    }
    if (!proposalData) {
      try {
        const cached = localStorage.getItem('sisitus_proposals');
        if (cached) {
          const list = JSON.parse(cached);
          const found = list.find(p => p.id === propId);
          if (found) proposalData = found;
        }
      } catch (e) {}
    }
  }
  let category = 'perusahaan';
  if (proposalData && proposalData.category) {
    category = proposalData.category.toLowerCase();
  } else if (reqType && CATEGORY_PRESETS[reqType]) {
    category = reqType;
  }
  const preset = CATEGORY_PRESETS[category] || CATEGORY_PRESETS.perusahaan;
  const merged = {
    id: (proposalData && proposalData.id) || (propId || 'PROP-' + category.toUpperCase() + '-DEMO'),
    clientName: (proposalData && proposalData.clientName) || preset.defaultClient,
    picName: (proposalData && proposalData.picName) || preset.defaultPic,
    picPhone: (proposalData && proposalData.picPhone) || '0882010067695',
    category: category,
    title: (proposalData && proposalData.title) || preset.title,
    subtitle: (proposalData && proposalData.subtitle) || preset.subtitle,
    notes: (proposalData && proposalData.notes) || preset.notesDefault,
    pkg1Name: (proposalData && proposalData.pkg1Name) || preset.pkg1Default.name,
    pkg1Price: (proposalData && proposalData.pkg1Price) || preset.pkg1Default.price,
    pkg2Name: (proposalData && proposalData.pkg2Name) || preset.pkg2Default.name,
    pkg2Price: (proposalData && proposalData.pkg2Price) || preset.pkg2Default.price,
    pkg3Name: (proposalData && proposalData.pkg3Name) || preset.pkg3Default.name,
    pkg3Price: (proposalData && proposalData.pkg3Price) || preset.pkg3Default.price,
    status: (proposalData && proposalData.status) || 'aktif',
    validUntil: (proposalData && proposalData.validUntil) || '2026-12-31',
    invoiceId: (proposalData && proposalData.invoiceId) || ''
  };
  renderProposal(merged, preset);
  setupActions(merged);
}
function renderProposal(data, preset) {
  document.title = `${data.title} - ${data.clientName} | SISITUS`;
  const elPageTitle = document.getElementById('page-title');
  if (elPageTitle) elPageTitle.textContent = `${data.title} - ${data.clientName} | SISITUS`;
  const elNavClient = document.getElementById('nav-client-name');
  if (elNavClient) elNavClient.textContent = data.clientName;
  const elCategoryBadge = document.getElementById('cover-category-badge');
  if (elCategoryBadge) elCategoryBadge.textContent = preset.categoryBadge;
  const elDocTitle = document.getElementById('doc-title');
  if (elDocTitle) elDocTitle.textContent = data.title;
  const elDocSubtitle = document.getElementById('doc-subtitle');
  if (elDocSubtitle) elDocSubtitle.textContent = data.subtitle;
  const elDocClient = document.getElementById('doc-client-name');
  if (elDocClient) elDocClient.textContent = data.clientName;
  const elDocPic = document.getElementById('doc-pic-name');
  if (elDocPic) elDocPic.textContent = data.picName || 'Pimpinan & Tim Manajemen';
  const elDocId = document.getElementById('doc-id');
  if (elDocId) elDocId.textContent = data.id;
  const elDocRegNo = document.getElementById('doc-reg-no');
  if (elDocRegNo) elDocRegNo.textContent = data.id;
  const elDocValid = document.getElementById('doc-valid-until');
  if (elDocValid) elDocValid.textContent = formatIndoDate(data.validUntil);
  const elDocValidDate = document.getElementById('doc-valid-date');
  if (elDocValidDate) elDocValidDate.textContent = formatIndoDate(data.validUntil);
  const elLetterDocNo = document.getElementById('letter-doc-no');
  if (elLetterDocNo) elLetterDocNo.textContent = `${data.id}/SP-SDN/PROP/XI/2026`;
  const elLetterClientName = document.getElementById('letter-client-name');
  if (elLetterClientName) elLetterClientName.textContent = `Direksi & Manajemen ${data.clientName}`;
  const elLetterPicName = document.getElementById('letter-pic-name');
  if (elLetterPicName) elLetterPicName.textContent = data.picName || 'Pimpinan & Divisi Terkait';
  const elCoverLetter = document.getElementById('cover-letter-text');
  if (elCoverLetter) elCoverLetter.textContent = preset.coverLetter;
  const statusBadge = document.getElementById('doc-status-badge');
  const btnGoSpk = document.getElementById('btn-go-spk');
  const btnBottomSpk = document.getElementById('btn-action-spk');
  if (data.status === 'deal') {
    if (statusBadge) {
      statusBadge.className = 'cover-status-badge status-aktif';
      statusBadge.innerHTML = '<i class="ph ph-handshake"></i> PROPOSAL DEAL / DISETUJUI';
    }
    const invUrl = data.invoiceId ? `/invoice/?id=${encodeURIComponent(data.invoiceId)}` : '/invoice/';
    if (btnGoSpk) {
      btnGoSpk.href = invUrl;
      btnGoSpk.innerHTML = '<i class="ph ph-receipt"></i> <span class="btn-text">Buka Faktur Resmi</span>';
    }
    if (btnBottomSpk) {
      btnBottomSpk.innerHTML = '<i class="ph ph-receipt"></i> <span>Buka Faktur Resmi</span>';
      btnBottomSpk.addEventListener('click', () => { window.location.href = invUrl; });
    }
  } else if (data.status === 'arsip') {
    if (statusBadge) {
      statusBadge.className = 'cover-status-badge';
      statusBadge.innerHTML = '<i class="ph ph-archive"></i> ARSIP DOKUMEN';
    }
  } else {
    if (statusBadge) {
      statusBadge.className = 'cover-status-badge status-aktif';
      statusBadge.innerHTML = '<i class="ph ph-check-circle"></i> PROPOSAL RESMI AKTIF';
    }
  }
  const elShowcaseHeadline = document.getElementById('showcase-headline');
  if (elShowcaseHeadline) elShowcaseHeadline.textContent = preset.showcase.headline;
  const elShowcaseDesc = document.getElementById('showcase-desc');
  if (elShowcaseDesc) elShowcaseDesc.textContent = preset.showcase.desc;
  const elShowcaseUrl = document.getElementById('showcase-url');
  if (elShowcaseUrl) elShowcaseUrl.textContent = data.demoUrl || preset.showcase.url;
  const elShowcaseImg = document.getElementById('showcase-image');
  if (elShowcaseImg) elShowcaseImg.src = preset.showcase.image;
  const elShowcaseDemoBtn = document.getElementById('btn-showcase-live');
  if (elShowcaseDemoBtn) elShowcaseDemoBtn.href = data.demoUrl || preset.showcase.url;
  const showcaseTags = [...preset.showcase.tags];
  const elShowcaseTags = document.getElementById('showcase-tags');
  if (elShowcaseTags) {
    elShowcaseTags.innerHTML = showcaseTags.map(t => `<span class="showcase-tag">${t}</span>`).join('');
  }
  const elUrgencyTitle = document.getElementById('urgency-title');
  if (elUrgencyTitle) elUrgencyTitle.textContent = preset.urgencyTitle;
  const elUrgencyLead = document.getElementById('urgency-lead');
  if (elUrgencyLead) elUrgencyLead.textContent = preset.urgencyLead;
  const urgencyContainer = document.getElementById('urgency-grid');
  if (urgencyContainer) {
    urgencyContainer.innerHTML = preset.urgencies.map(u => `
      <div class="urgency-card ${u.featured ? 'featured-card' : ''}">
        <div class="urgency-icon-wrap">
          <i class="ph ${u.icon}"></i>
        </div>
        <h4>${u.title}</h4>
        <p>${u.desc}</p>
      </div>
    `).join('');
  }
  const modulesContainer = document.getElementById('modules-grid');
  if (modulesContainer) {
    modulesContainer.innerHTML = preset.modules.map(m => `
      <div class="module-card">
        <div class="module-card-top">
          <i class="ph ${m.icon} module-icon"></i>
          <h4 class="module-title">${m.title}</h4>
        </div>
        <p class="module-desc">${m.desc}</p>
        <ul class="module-items-list">
          ${m.items.map(item => `<li><i class="ph ph-check-circle"></i> <span>${item}</span></li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
  const portContainer = document.getElementById('portfolio-grid');
  if (portContainer) {
    portContainer.innerHTML = preset.portfolios.map(p => `
      <div class="portfolio-card-item">
        <div class="portfolio-thumb-wrap">
          <img src="${p.img}" alt="${p.name}" class="portfolio-thumb" loading="lazy" />
          <span class="portfolio-cat-badge">${p.cat}</span>
        </div>
        <div class="portfolio-info">
          <div class="portfolio-name">${p.name}</div>
          <p class="portfolio-tagline">${p.desc}</p>
        </div>
      </div>
    `).join('');
  }
  const pkgContainer = document.getElementById('packages-grid');
  if (pkgContainer) {
    pkgContainer.innerHTML = `
      <div class="pkg-card">
        <div class="pkg-tier-name">${data.pkg1Name}</div>
        <div class="pkg-target-desc">${preset.pkg1Default.desc}</div>
        <div class="pkg-price-wrap">
          <span class="pkg-price-currency">IDR</span>
          <span class="pkg-price-amount">${formatIDR(data.pkg1Price).replace('Rp ', '')}</span>
          <span class="pkg-price-period">/ paket lengkap</span>
        </div>
        <div class="pkg-features-header">Spesifikasi & Cakupan Layanan:</div>
        <ul class="pkg-features-list">
          ${preset.pkg1Default.features.map(f => `<li><i class="ph ph-check"></i> <span>${f}</span></li>`).join('')}
        </ul>
        <button type="button" class="pkg-select-btn" data-pkg="${data.pkg1Name}">Pilih Paket Ini</button>
      </div>
      <div class="pkg-card featured-pkg">
        <div class="pkg-featured-badge">REKOMENDASI UTAMA</div>
        <div class="pkg-tier-name">${data.pkg2Name}</div>
        <div class="pkg-target-desc">${preset.pkg2Default.desc}</div>
        <div class="pkg-price-wrap">
          <span class="pkg-price-currency">IDR</span>
          <span class="pkg-price-amount">${formatIDR(data.pkg2Price).replace('Rp ', '')}</span>
          <span class="pkg-price-period">/ paket lengkap</span>
        </div>
        <div class="pkg-features-header">Spesifikasi & Cakupan Layanan:</div>
        <ul class="pkg-features-list">
          ${preset.pkg2Default.features.map(f => `<li><i class="ph ph-check"></i> <span>${f}</span></li>`).join('')}
        </ul>
        <button type="button" class="pkg-select-btn" data-pkg="${data.pkg2Name}">Pilih Paket Utama</button>
      </div>
      <div class="pkg-card">
        <div class="pkg-tier-name">${data.pkg3Name}</div>
        <div class="pkg-target-desc">${preset.pkg3Default.desc}</div>
        <div class="pkg-price-wrap">
          <span class="pkg-price-currency">IDR</span>
          <span class="pkg-price-amount">${formatIDR(data.pkg3Price).replace('Rp ', '')}</span>
          <span class="pkg-price-period">/ paket lengkap</span>
        </div>
        <div class="pkg-features-header">Spesifikasi & Cakupan Layanan:</div>
        <ul class="pkg-features-list">
          ${preset.pkg3Default.features.map(f => `<li><i class="ph ph-check"></i> <span>${f}</span></li>`).join('')}
        </ul>
        <button type="button" class="pkg-select-btn" data-pkg="${data.pkg3Name}">Pilih Paket Ini</button>
      </div>
    `;
  }
  const thPkg1 = document.getElementById('th-pkg1');
  if (thPkg1) thPkg1.textContent = data.pkg1Name;
  const thPkg2 = document.getElementById('th-pkg2');
  if (thPkg2) thPkg2.textContent = `${data.pkg2Name} (Rekomendasi)`;
  const thPkg3 = document.getElementById('th-pkg3');
  if (thPkg3) thPkg3.textContent = data.pkg3Name;
  const rabPricePkg1 = document.getElementById('rab-price-pkg1');
  if (rabPricePkg1) rabPricePkg1.textContent = formatIDR(data.pkg1Price);
  const rabPricePkg2 = document.getElementById('rab-price-pkg2');
  if (rabPricePkg2) rabPricePkg2.textContent = formatIDR(data.pkg2Price);
  const rabPricePkg3 = document.getElementById('rab-price-pkg3');
  if (rabPricePkg3) rabPricePkg3.textContent = formatIDR(data.pkg3Price);
  const elDocNotes = document.getElementById('doc-notes');
  if (elDocNotes) elDocNotes.textContent = data.notes;
  const selectPkg = document.getElementById('spk-pkg');
  if (selectPkg) {
    selectPkg.innerHTML = `
      <option value="${data.pkg2Name}" selected>${data.pkg2Name} - ${formatIDR(data.pkg2Price)} (Rekomendasi Utama)</option>
      <option value="${data.pkg1Name}">${data.pkg1Name} - ${formatIDR(data.pkg1Price)}</option>
      <option value="${data.pkg3Name}">${data.pkg3Name} - ${formatIDR(data.pkg3Price)}</option>
    `;
  }
  const elSigClientInst = document.getElementById('spk-client-institution');
  if (elSigClientInst) elSigClientInst.textContent = data.clientName;
  const elSigClientPic = document.getElementById('spk-client-signature');
  if (elSigClientPic) elSigClientPic.textContent = data.picName ? `( ${data.picName} )` : '( .................................................... )';
  const elSpkPic = document.getElementById('spk-pic');
  if (elSpkPic && !elSpkPic.value) elSpkPic.value = data.picName || '';
}
function setupActions(data) {
  document.querySelectorAll('.pkg-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pkg = e.currentTarget.dataset.pkg;
      const select = document.getElementById('spk-pkg');
      if (select) {
        select.value = pkg;
        const target = document.getElementById('section-spk');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  const btnPrint = document.getElementById('btn-print-doc');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => { window.print(); });
  }
  const btnActionPrint = document.getElementById('btn-action-print');
  if (btnActionPrint) {
    btnActionPrint.addEventListener('click', () => { window.print(); });
  }
  const btnShare = document.getElementById('btn-share-doc');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tautan proposal berhasil disalin', showConfirmButton: false, timer: 2000 });
        }).catch(() => {
          prompt('Salin tautan ini:', window.location.href);
        });
      } else {
        prompt('Salin tautan ini:', window.location.href);
      }
    });
  }
  const btnActionShare = document.getElementById('btn-action-share');
  if (btnActionShare) {
    btnActionShare.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Tautan proposal berhasil disalin', showConfirmButton: false, timer: 2000 });
        }).catch(() => {
          prompt('Salin tautan ini:', window.location.href);
        });
      } else {
        prompt('Salin tautan ini:', window.location.href);
      }
    });
  }
  const spkPicInput = document.getElementById('spk-pic');
  if (spkPicInput) {
    spkPicInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const sigEl = document.getElementById('spk-client-signature');
      if (sigEl) {
        sigEl.textContent = val ? `( ${val} )` : '( .................................................... )';
      }
    });
  }
  const btnSubmitSpk = document.getElementById('btn-submit-spk');
  if (btnSubmitSpk) {
    btnSubmitSpk.addEventListener('click', async () => {
      const pic = document.getElementById('spk-pic').value.trim();
      const role = document.getElementById('spk-role').value.trim();
      const pkg = document.getElementById('spk-pkg').value;
      const phone = document.getElementById('spk-phone').value.trim();
      const email = (document.getElementById('spk-email')?.value || '').trim();
      const notes = document.getElementById('spk-notes').value.trim();
      if (!pic) {
        Swal.fire({ icon: 'warning', title: 'Mohon Isi Nama PIC', text: 'Nama penanggung jawab diperlukan untuk kelengkapan SPK.' });
        document.getElementById('spk-pic').focus();
        return;
      }
      let selectedPrice = data.pkg2Price;
      if (pkg === data.pkg1Name) selectedPrice = data.pkg1Price;
      else if (pkg === data.pkg3Name) selectedPrice = data.pkg3Price;
      btnSubmitSpk.disabled = true;
      const origHtml = btnSubmitSpk.innerHTML;
      btnSubmitSpk.innerHTML = '<i class="ph ph-spinner ph-spin"></i> <span>Menyimpan Persetujuan...</span>';
      try {
        const spkData = {
          clientName: data.clientName,
          picName: pic,
          role: role || '-',
          phone: phone || '',
          email: email || '',
          selectedPkgName: pkg,
          selectedPkgPrice: selectedPrice,
          notes: notes || ''
        };
        const spkRes = await InvoiceService.submitProposalSPK(data.id, spkData);
        const invId = spkRes.invoiceId;
        const invoiceUrl = `/invoice/?id=${encodeURIComponent(invId)}`;
        const statusBadge = document.getElementById('doc-status-badge');
        if (statusBadge) {
          statusBadge.className = 'cover-status-badge status-aktif';
          statusBadge.innerHTML = '<i class="ph ph-handshake"></i> PROPOSAL DEAL / DISETUJUI';
        }
        const btnTop = document.getElementById('btn-go-spk');
        if (btnTop) {
          btnTop.href = invoiceUrl;
          btnTop.innerHTML = '<i class="ph ph-receipt"></i> <span class="btn-text">Buka Faktur Resmi</span>';
        }
        const message = `*KONFIRMASI PERSETUJUAN PROPOSAL / SPK SISITUS*
----------------------------------------
*Nomor Dokumen:* ${data.id}
*Faktur Resmi:* ${invId}
*Instansi / Klien:* ${data.clientName}
*Penanggung Jawab (PIC):* ${pic}
*Jabatan:* ${role || '-'}
*No. WhatsApp:* ${phone || '-'}
*Paket Kerjasama Dipilih:* ${pkg} (${formatIDR(selectedPrice)})
*DP Tagihan (50%):* ${formatIDR(Math.round(selectedPrice * 0.5))}
*Catatan Tambahan:* ${notes || 'Tidak ada'}
----------------------------------------
Kami menyatakan persetujuan terhadap penawaran di atas dan siap untuk kickoff proyek website bersama SISITUS. Mohon panduan langkah berikutnya. Terima kasih!`;
        const waUrl = `https://wa.me/62882010067695?text=${encodeURIComponent(message)}`;
        Swal.fire({
          icon: 'success',
          title: 'Persetujuan Berhasil Disimpan!',
          html: `<p>Penawaran untuk <strong>${data.clientName}</strong> telah disetujui (Status: DEAL).</p><p>Faktur resmi dengan nomor <strong>${invId}</strong> telah diterbitkan.</p>`,
          showCancelButton: true,
          confirmButtonText: '<i class="ph ph-receipt"></i> Buka Faktur Tagihan',
          cancelButtonText: '<i class="ph ph-whatsapp-logo"></i> Kirim ke WhatsApp',
          confirmButtonColor: '#2563EB',
          cancelButtonColor: '#10B981'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = invoiceUrl;
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.open(waUrl, '_blank');
          }
        });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message || 'Terjadi kesalahan sistem.' });
      } finally {
        btnSubmitSpk.disabled = false;
        btnSubmitSpk.innerHTML = origHtml;
      }
    });
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProposalPage);
} else {
  initProposalPage();
}