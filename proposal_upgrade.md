Saya ingin audit alur pemesanan saya, jadi ini tidak tentang domain saja, tapi bisa untuk semua layanan saya nanti. Misal untuk pemesananan Domain:


========================================
FLOW UTAMA PEMESANAN DOMAIN
========================================

ENTRY POINT:
- Homepage

----------------------------------------
STEP 1: HOMEPAGE
----------------------------------------
Elemen:
- Button: Login
- Search / Input Domain
- Button: "Amankan Sekarang"

Alur:
1. Klik "Login"
   -> Redirect ke HALAMAN LOGIN

2. Cari domain + klik "Amankan Sekarang"
   -> Redirect ke HALAMAN RINGKASAN PEMESANAN (GUEST MODE)


========================================
STEP 2: RINGKASAN PEMESANAN (BELUM LOGIN)
========================================
Deskripsi:
Halaman ini dapat diakses TANPA login.

Tujuan:
- Menampilkan detail domain
- Upsell (addon, promo, dll)
- Tidak boleh ada friction login di tahap ini

----------------------------------------
TAMPILAN:
----------------------------------------

Pemesanan Domain
Kemudahan melakukan pemesanan Domain dan layanan lainnya

Pemesanan domain: jakalelana.xyz

[DETAIL DOMAIN]
----------------------------------------
Domain              : jakalelana.xyz
Status              : Available
Siklus Domain       : 1 Tahun

[SECTION PROMO]
----------------------------------------
Promo:
Penawaran Terbatas! Ambil 1 Domain Gratis (Siklus 1 Tahun)

Pilihan Domain Gratis:
- jakalelana.my.id
- jakalelana.web.id

[ADDON DOMAIN]
----------------------------------------
1. DNS Management (1 Tahun)
   Deskripsi: Pengelolaan DNS record
   Harga   : GRATIS

2. Privacy Protection (1 Tahun)
   Harga   : Rp 6.625 / bulan

3. Email 2 GB (1 Tahun)
   Harga   : Rp 5.000 / bulan

----------------------------------------
BUTTON:
[ Tambahkan ke Troli ]

----------------------------------------
RINGKASAN (SIDEBAR / SECTION)
----------------------------------------
Domain              : .XYZ
Harga               : Rp 37.900
Siklus              : 1 Tahun

Addon:
- DNS Management    : GRATIS

Subtotal            : Rp 37.900
PPN                 : Rp 4.169
Total               : Rp 42.069


----------------------------------------
ALUR:
----------------------------------------
Klik "Tambahkan ke Troli"
   IF user BELUM login:
      -> Redirect ke HALAMAN TROLI + LOGIN REQUIRED
      -> SIMPAN semua data (WAJIB):
         - domain
         - tld
         - siklus
         - addon
         - harga

   IF user SUDAH login:
      -> Langsung masuk HALAMAN TROLI


========================================
STEP 3: HALAMAN TROLI (LOGIN REQUIRED)
========================================
Deskripsi:
Halaman ini WAJIB login.

Jika belum login:
-> tampilkan form login DI HALAMAN INI (bukan redirect lagi)

----------------------------------------
TAMPILAN:
----------------------------------------

Keranjang Belanja
Selesaikan pesanan dan setelah lunas layanan akan aktif dalam beberapa menit

[PRODUK]
----------------------------------------
Domain: jakalelana.xyz
Siklus: 1 Tahun

Registrasi domain .XYZ
Rp 37.900

[Layanan Tambahan]
----------------------------------------
DNS Management
GRATIS

----------------------------------------
[RINGKASAN]
----------------------------------------
Subtotal            : Rp 37.900
PPN 11%             : Rp 4.169
Total               : Rp 42.069

----------------------------------------
Field:
- Kode Promo (optional)

----------------------------------------
[AUTH SECTION]
----------------------------------------
Sign In

Email               : name@example.com
Password            : ********

Link:
- Forget Password
- Sign Up

Button:
[ Sign In ]


----------------------------------------
ALUR LOGIN:
----------------------------------------
1. User login di halaman ini

2. Jika berhasil:
   -> Reload halaman troli
   -> Data troli tetap ada (TIDAK BOLEH HILANG)
   -> Bayar/logic midtrans berlaku disini. tampilannya seperti ini:

Pilih metode pembayaran

Pembayaran Instan
Aktivasi cepat dengan metode pembayaran instan.
Anda bebas memilih metode pembayaran sesuai keinginan dan layanan aktif lebih cepat.


QRIS
QRIS
 Saya telah membaca, memahami, dan menyetujui Terms of Service
Tambah Pesanan
Selesaikan dan Bayar



3. Jika gagal:
   -> Tampilkan error

4. Jika klik Selesaikan dan Bayar ke halaman Invoice dan Logic Midtrans.

========================================
CATATAN KRITIS (WAJIB DIPATUHI)
========================================

1. STATE MANAGEMENT (INI PALING RAWAN GAGAL)
----------------------------------------
Data pemesanan HARUS disimpan sebelum login:
- Gunakan:
  a. localStorage (frontend)
  b. atau session backend

Jika tidak:
-> user login → data hilang → conversion drop


2. JANGAN REDIRECT BERULANG
----------------------------------------
Salah:
Homepage → Login → balik → pilih domain lagi

Benar:
Homepage → Ringkasan → Troli → Login inline


3. LOGIN HARUS INLINE DI TROLI
----------------------------------------
Jangan redirect ke halaman login lagi.
Tampilkan form login di halaman troli.


4. HARGA HARUS LOCK
----------------------------------------
Harga di ringkasan = harga di troli
Tidak boleh berubah (kecuali re-check API)


5. PROMO & ADDON HARUS TERSIMPAN
----------------------------------------
Banyak sistem gagal di sini:
- User pilih addon
- Login
- Addon hilang

Ini fatal.


6. VALIDASI DOMAIN ULANG
----------------------------------------
Saat masuk troli:
-> cek ulang domain availability
-> jika sudah diambil orang lain:
   tampilkan warning

