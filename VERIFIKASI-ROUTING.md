# Laporan Verifikasi Routing Multi-Deployment

Berdasarkan arsitektur *monorepo* kita dan konfigurasi **Build Command** pada Cloudflare Pages, berikut adalah kepastian mengenai rute (*path*) apa saja yang akan tersedia dan yang tidak akan tersedia pada setiap domain:

---

## 1. Public Site (sisitus.com)
**Build Command:** m -rf my admin
Karena perintah tersebut menghapus folder my dan dmin sebelum *publish*, maka rutenya akan menjadi sangat bersih hanya untuk pengunjung publik.

✅ **AKAN ADA (Bisa Diakses):**
- / (Beranda)
- /website/
- /domain/
- /hosting/
- /maintenance/
- /perusahaan/portofolio/
- /perusahaan/tentang/
- /perusahaan/karir/
- /perusahaan/legal/
- /blog/
- /cart/
- /invoice/
- /kontak/
- /promo/
- /assets/

❌ **TIDAK AKAN ADA (Aman / 404 Not Found):**
- /my/ (Dihapus saat *build*)
- /admin/ (Dihapus saat *build*)
- /auth/ (Karena foldernya sudah dipindah ke dalam my/)
- /dashboard/ (Karena foldernya sudah dipindah ke dalam my/)
- /layanan/ (Sudah dihapus permanen dari repositori)

---

## 2. Customer Portal (my.sisitus.com)
**Build Command:** mkdir -p dist && cp -r my/* dist/ && cp -r assets dist/assets
Sistem mengekstrak isi folder my/ ke *root* dan menambahkan ssets/. Sisa *file* marketing diabaikan.

✅ **AKAN ADA (Bisa Diakses):**
- /auth/ (Halaman Login, asalnya dari my/auth/)
- /dashboard/ (Dasbor Pelanggan, asalnya dari my/dashboard/)
- /assets/ (Shared dependensi / gambar / CSS / JS)

❌ **TIDAK AKAN ADA (Aman / 404 Not Found):**
- /my/ (Isinya sudah naik ke *root*, foldernya sendiri tidak ada)
- /admin/
- /website/, /domain/, /blog/, dll (Halaman marketing tidak ikut di-*deploy*)

---

## 3. Admin (ackstage.sisitus.com)
**Build Command:** mkdir -p dist && cp -r admin/* dist/ && cp -r assets dist/assets && cp -r my/auth dist/auth
Sistem mengekstrak isi folder dmin/ ke *root*, menambahkan ssets/, dan **menyuntikkan** halaman /auth/ ke dalamnya.

✅ **AKAN ADA (Bisa Diakses):**
- / (Dasbor Admin, asalnya dari dmin/index.html)
- /auth/ (Halaman Login untuk Admin, disuntikkan dari my/auth/)
- /assets/ (Shared dependensi)
- /js/, /styles/, /views/ (Komponen internal pembentuk UI admin)
- Semua rute internal SPA Admin: #!/users, #!/transactions, #!/settings, dll.

❌ **TIDAK AKAN ADA (Aman / 404 Not Found):**
- /admin/ (Isinya sudah naik ke *root*)
- /my/
- /dashboard/ (Dasbor pelanggan tidak ikut dibawa)
- /website/, /domain/, /blog/, dll (Halaman marketing tidak ikut di-*deploy*)

---