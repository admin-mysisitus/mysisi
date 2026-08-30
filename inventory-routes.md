Inventarisasi & Klasifikasi Route SISITUS
Berikut adalah hasil pemetaan 69 file HTML (route/halaman) yang saat ini benar-benar ada di dalam sistem Anda. Sesuai rekomendasi dari dokumen konsultasi, saya telah membaginya menjadi 5 kategori utama (Public, Transaction, Customer, Internal, Legal) agar kita punya gambaran utuh sebelum melakukan perombakan struktur folder apa pun.

1. PUBLIC (Halaman Publik & Pemasaran)
Halaman ini adalah wajah depan SISITUS yang berfungsi untuk menjual, mengedukasi, dan memberikan informasi kepada calon pelanggan.

/index.html (Beranda)
/404.html (Halaman Error)
/kontak/index.html
/promo/index.html
/layanan/ (Akan direstrukturisasi menjadi menu utama terpisah)
/layanan/index.html
/layanan/domain-hosting/index.html
/layanan/pembuatan-website/index.html
/layanan/maintenance/index.html
/perusahaan/ (Halaman pendukung/Trust)
/perusahaan/index.html
/perusahaan/tentang/index.html
/perusahaan/portofolio/index.html
/perusahaan/karir/index.html
/blog/ (SEO & Edukasi - 26 halaman)
Termasuk kategori artikel/ dan tips-website/
2. TRANSACTION (Alur Transaksi)
Halaman transaksional publik sebelum masuk ke area manajemen pelanggan secara penuh.

/cart/index.html (Keranjang Belanja Utama)
/invoice/index.html (Halaman Cetak/Lihat Tagihan Publik)
3. CUSTOMER (Area Pelanggan / Dashboard)
Ini adalah area eksklusif bagi pengguna yang sudah memiliki akun untuk mengelola layanan mereka. Sesuai rekomendasi, area ini sama sekali tidak boleh digabungkan fungsinya dengan Public Site.

/auth/ (Otentikasi Pelanggan)
/auth/index.html (Login/Register)
/auth/forgot-password.html
/auth/reset-password.html
/auth/verify-email.html
/dashboard/ (Manajemen Layanan)
/dashboard/index.html (Frame Utama Dashboard)
/dashboard/views/ (Injeksi Halaman)
dashboard.html (Overview)
domains.html
cart.html
orders.html
invoices.html
payment.html
profile.html
wishlist.html
support.html
4. INTERNAL (Admin Panel)
Halaman kontrol tertutup khusus untuk staf dan pengelola (Admin) SISITUS.

/admin/index.html (Frame Utama Admin)
/admin/views/ (Injeksi Halaman)
overview.html
users.html
packages.html
domains.html
transactions.html
dns.html
promos.html
addons.html
support.html
livechat.html
settings.html
5. LEGAL (Kebijakan Hukum)
Halaman wajib secara hukum, tetapi tidak perlu tampil di menu utama (hanya di Footer).

/perusahaan/legal/index.html (Syarat Ketentuan, Privasi, Refund)
NOTE

Kesimpulan & Langkah Selanjutnya Struktur riil (kode) Anda ternyata sudah sangat baik dalam memisahkan urusan /admin, /dashboard, dan /auth dari halaman utama. Masalah utamanya HANYALAH pada susunan menu navigasi (Navbar) HTML di area PUBLIC yang saat ini terlalu menonjolkan folder /perusahaan/ dan menumpuk semua produk di dalam /layanan/.

Jika Anda setuju, kita bisa segera memulai Fase Perombakan Navbar Publik seperti yang disarankan di dokumen konsultasi (membuat menu Domain | Website | Hosting | Maintenance langsung tampil di depan dan membuang menu Perusahaan ke Footer)