Konsultasi: 
saya adalah sisitus.com, saya ingin merombak struktur halaman inti saya, karena sepertinya saya terlalu narsis, seperti ada halaman perusahan misal perusahaan/index.html 
perusahaan/tentang/index.html
perusahaan/portofolio/index.html
perusahaan/legal/index.html sebenarnya itu tidak perlu untuk ditampilkan di sidebar utama, jadi sidebar khusus yang diperlukan pelanggan saja. saya cek web layanan serupa seperti domainesia, rumahweb juga tidak pernah menaruh pada sidebar atau menu utama. jadi berdasarkan konteks saya apa saja yang seharusnya ditampilkan pada menu utama? pastikan anda mengecek dulu semua menu utama saya sesungguhnya

________________________________________________

Hasil Konsultasi:

Ya. Saya sudah cek **SISITUS yang live sekarang**, bukan hanya mengandalkan struktur yang pernah kita bahas. Saya juga bandingkan dengan pola navigasi DomaiNesia. Hasilnya: **intuisi Anda benar** — struktur SISITUS sebaiknya digeser dari “memperkenalkan perusahaan” menjadi **“membantu pelanggan membeli dan mengelola layanan.”**

Di halaman utama saat ini, fokus bisnis SISITUS sebenarnya sudah cukup jelas: **website, domain, hosting, dan layanan pendukung**. ([sisitus.com][1])

## 1. Masalah utama struktur Anda sekarang

Kalau struktur Anda seperti:

```text
perusahaan/
├── tentang/
├── portofolio/
├── legal/
└── ...
```

lalu semuanya ditampilkan di sidebar/menu utama, masalahnya bukan halaman-halamannya.

Masalahnya adalah **hierarki informasi**.

Pengunjung datang ke SISITUS kemungkinan besar ingin:

1. Cari domain
2. Beli domain
3. Cari hosting
4. Buat website
5. Melihat harga/paket
6. Melihat layanan
7. Mendapat bantuan
8. Login dan mengelola layanan

Mereka **tidak datang dengan tujuan utama** untuk membuka:

> Tentang Kami → Legal → Struktur perusahaan → Portofolio

Itu informasi trust, bukan navigasi transaksi.

DomaiNesia juga memisahkan informasi perusahaan seperti **Tentang Kami, Teknologi, Media Kit, Kontak, Karier** dari navigasi layanan utamanya dan menaruhnya sebagai informasi pendukung/footer. ([DomaiNesia][2])

---

# 2. Menu utama SISITUS yang saya rekomendasikan

Saya justru akan membuat navbar utama sangat sederhana:

```text
SISITUS

Beranda
Domain
Website
Hosting
Layanan
Harga
Bantuan

                         🛒 Keranjang
                         👤 Login / Dashboard
```

Tetapi ada sedikit penyesuaian penting.

### Struktur ideal:

| Menu          | Tujuan                               |
| ------------- | ------------------------------------ |
| **Beranda**   | Landing / overview                   |
| **Domain**    | Cari, daftar, transfer, harga domain |
| **Website**   | Jasa pembuatan website + paket       |
| **Hosting**   | Produk hosting                       |
| **Layanan**   | Maintenance, custom development, dll |
| **Harga**     | Perbandingan harga/paket             |
| **Bantuan**   | FAQ, panduan, kontak/support         |
| **Keranjang** | Transaksi                            |
| **Login**     | Area pelanggan                       |

Ini jauh lebih **customer-oriented**.

---

# 3. Tetapi saya melihat satu hal yang perlu Anda ubah

Saat ini `/layanan/` SISITUS berisi:

* Pembuatan Website
* Domain & Hosting
* Maintenance

([sisitus.com][3])

Menurut saya **jangan menjadikan “Layanan” sebagai menu utama yang terlalu generik jika di dalamnya hanya mengulang produk lain.**

Karena:

```text
Layanan
├── Website
├── Domain & Hosting
└── Maintenance
```

sementara navbar juga punya:

```text
Website
Domain
Hosting
```

Ini berpotensi redundan.

Saya lebih menyukai:

```text
Domain
Website
Hosting
Maintenance
```

langsung di navbar **jika jumlah produk Anda masih sedikit**.

Jadi bahkan:

```text
Beranda | Domain | Website | Hosting | Maintenance | Harga | Bantuan
```

bisa lebih kuat daripada:

```text
Beranda | Domain | Website | Hosting | Layanan | Harga | Bantuan
```

Karena pelanggan langsung tahu apa yang Anda jual.

---

# 4. Bagaimana dengan Portofolio?

**Jangan dibuang. Jangan dijadikan menu utama.**

Portofolio adalah **social proof**, bukan primary navigation.

Struktur:

```text
perusahaan/
└── portofolio/
```

boleh tetap ada.

Tetapi aksesnya dari:

* homepage
* halaman Website
* footer
* bagian “Proyek Kami”
* CTA tertentu

Contohnya di `/website/`:

> **Lihat hasil website yang telah kami kerjakan →**

Kemudian menuju:

```text
/portofolio/
```

Dengan begitu portofolio bekerja sebagai **alat konversi**, bukan sekadar halaman perusahaan.

---

# 5. Bagaimana dengan Tentang Kami?

Sama.

Tetap ada:

```text
/perusahaan/tentang/
```

atau bahkan saya lebih menyukai:

```text
/tentang/
```

Tetapi **tidak perlu navbar utama**.

Taruh di footer:

```text
SISITUS
Solusi digital untuk bisnis dan UMKM

Produk
- Domain
- Website
- Hosting
- Maintenance

Bantuan
- FAQ
- Panduan
- Kontak
- Status Layanan

Perusahaan
- Tentang Kami
- Portofolio
- Legal

Akun
- Login
- Dashboard
```

Ini jauh lebih profesional.

---

# 6. Bagaimana dengan Legal?

**100% jangan dimasukkan menu utama.**

Legal adalah halaman yang harus tersedia, tetapi bukan halaman yang harus dinavigasikan pelanggan setiap hari.

Misalnya:

```text
/legal/
├── syarat-ketentuan/
├── kebijakan-privasi/
├── kebijakan-refund/
└── ...
```

Footer:

```text
Syarat & Ketentuan
Kebijakan Privasi
Kebijakan Refund
```

Selesai.

---

# 7. Yang justru harus sangat terlihat: Domain

Ini penting untuk SISITUS.

Homepage Anda sendiri sudah menempatkan domain sebagai salah satu entry point utama:

> “Website hebat berawal dari domain yang tepat.”

dan menyediakan pencarian domain langsung. ([sisitus.com][1])

Jadi saya justru akan menjadikan:

**DOMAIN**

sebagai salah satu menu paling penting.

Bahkan bisa memiliki dropdown:

```text
DOMAIN
├── Cari Domain
├── Harga Domain
├── Transfer Domain
└── Kelola DNS
```

Tetapi **Kelola DNS jangan menjadi menu utama global**.

Itu fitur pelanggan.

Setelah login:

```text
Dashboard
└── Domain
    ├── Domain Saya
    ├── DNS
    ├── Nameserver
    ├── Renewal
    └── ...
```

Ini sejalan dengan arah sistem Anda yang sekarang sedang dibangun: pelanggan membeli domain lalu mengelolanya dari dashboard.

---

# 8. Hal yang paling penting: pisahkan Public Site vs Customer Area

Ini menurut saya perubahan arsitektur yang paling penting.

Jangan mencampurkan:

### PUBLIC

```text
/
├── domain/
├── website/
├── hosting/
├── maintenance/
├── harga/
├── bantuan/
├── portofolio/
├── tentang/
└── kontak/
```

dengan:

### CUSTOMER

```text
/dashboard/
├── overview
├── orders
├── domains
│   ├── domain saya
│   ├── dns
│   ├── nameserver
│   └── renewal
├── hosting
├── websites
├── invoices
├── payments
├── support
└── profile
```

Navbar public **menjual dan menjelaskan**.

Sidebar dashboard **mengelola**.

Jangan dibalik.

---

# 9. Struktur SISITUS yang saya sarankan

Kalau saya merapikan proyek Anda sekarang, saya akan mengarahkannya kira-kira seperti ini:

```text
SISITUS
│
├── PUBLIC
│   │
│   ├── /
│   ├── /domain/
│   │   ├── harga/
│   │   ├── transfer/
│   │   └── ...
│   │
│   ├── /website/
│   │   ├── paket/
│   │   └── ...
│   │
│   ├── /hosting/
│   │
│   ├── /maintenance/
│   │
│   ├── /harga/
│   │
│   ├── /bantuan/
│   │   ├── faq/
│   │   ├── panduan/
│   │   └── kontak/
│   │
│   ├── /portofolio/
│   ├── /tentang/
│   │
│   └── /legal/
│       ├── syarat-ketentuan/
│       ├── privasi/
│       └── refund/
│
└── CUSTOMER
    │
    └── /dashboard/
        ├── overview/
        ├── domain/
        ├── hosting/
        ├── website/
        ├── order/
        ├── invoice/
        ├── pembayaran/
        ├── support/
        └── akun/
```

**Tidak berarti semua folder tersebut harus dibuat sekarang.** Ini adalah arah arsitekturnya.

---

# 10. Navbar final yang saya pilih untuk SISITUS

Kalau harus saya putuskan **hari ini**, saya pilih:

### Desktop

```text
[LOGO]   Domain   Website   Hosting   Maintenance   Harga   Bantuan

                                      🛒 Keranjang   Login
```

Setelah login:

```text
[LOGO]   Domain   Website   Hosting   Maintenance   Harga   Bantuan

                                      🛒   Dashboard 👤
```

Dan **tidak ada**:

```text
Tentang
Portofolio
Legal
Perusahaan
```

di navbar utama.

---

## Kesimpulan

Anda sebenarnya sedang melakukan koreksi yang tepat.

**SISITUS tidak perlu terlihat seperti perusahaan yang sibuk menceritakan dirinya sendiri.**

SISITUS harus terlihat seperti **platform tempat orang datang untuk membeli dan mengelola aset digital mereka.**

Jadi hierarkinya:

> **Produk → Transaksi → Pengelolaan → Bantuan → Trust**

bukan:

> **Perusahaan → Tentang → Portofolio → Legal → baru produk**

Dan halaman perusahaan tetap ada, tetapi **dipindahkan ke footer dan menjadi supporting content**.

Saya juga melihat ada satu pekerjaan yang sebaiknya dilakukan **sebelum Anda menyuruh agen menghapus/memindahkan folder**: inventarisasi seluruh route/page SISITUS yang benar-benar sudah ada saat ini, termasuk halaman yang tidak terlihat di navbar (checkout, cart, auth, dashboard, DNS, order, payment, dll.), lalu kita klasifikasikan menjadi **Public / Transaction / Customer / Internal / Legal**. Itu akan mencegah agen merusak route yang sebenarnya masih dipakai sistem.

[1]: https://sisitus.com/ "Jasa Pembuatan Website Termurah No. 1 di Indonesia | SISITUS"
[2]: https://www.domainesia.com/?utm_source=chatgpt.com "Penyedia Web Hosting dan Domain Terbaik di Indonesia"
[3]: https://sisitus.com/layanan/?utm_source=chatgpt.com "Layanan sisitus.com"
