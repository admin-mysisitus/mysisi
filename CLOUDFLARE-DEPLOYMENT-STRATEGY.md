# Strategi Deployment Cloudflare Pages untuk Monorepo

Berdasarkan analisa struktur *workspace* dan kebutuhan *routing* Anda, berikut adalah konfigurasi *deployment* yang paling aman dan efisien untuk **1 Repositori GitHub â†’ 3 Proyek Cloudflare Pages**. 

Strategi ini **menghindari rewrite yang bertabrakan**, **mempertahankan struktur aset**, dan memastikan bahwa semua tautan *absolute* seperti /assets/... dan /auth/... berfungsi secara *native* tanpa perlu diubah.

---

## 1. Konfigurasi Public Site (\sisitus.com\)
Karena ini adalah *website* utama, kita akan melakukan *deploy* dari *root* direktori, tetapi kita harus mencegah struktur internal /my/ dan /admin/ terpublikasi di domain publik.

- **Framework Preset**: None
- **Build Command**: 
m -rf my admin
- **Build Output Directory**: / (Biarkan kosong / default)

**Penjelasan Output**: 
Cloudflare akan menyalin repositori, lalu perintah build akan **menghapus folder my dan admin** di lingkungan build lokal Cloudflare. Sisa file (seperti /assets/, /blog/, index.html) akan di-publish. Tidak akan ada bentrok rute, dan Public Site menjadi sangat bersih.

---

## 2. Konfigurasi Customer Portal (\my.sisitus.com\)
Kita menggunakan perintah *build* khusus untuk "merakit" *root directory* semu (dist), agar /assets/ dapat dipanggil dengan rute /assets/... dan isi dari /my/ naik menjadi *root*.

- **Framework Preset**: None
- **Build Command**: mkdir -p dist && cp -r my/* dist/ && cp -r assets dist/assets
- **Build Output Directory**: dist

**Penjelasan Output**: 
Cloudflare akan membuat folder dist. Seluruh isi dari /my/ (seperti /auth/ dan /dashboard/) dipindah langsung ke dalam dist/. Kemudian, folder /assets/ **disalin berdampingan** ke dalam dist/.
Hasil akhirnya, struktur di server akan terlihat seperti ini:
- https://my.sisitus.com/auth/ (Valid)
- https://my.sisitus.com/dashboard/ (Valid)
- https://my.sisitus.com/assets/img/logo.png (Valid, *shared dependency* berfungsi 100%)

---

## 3. Konfigurasi Admin (\backstage.sisitus.com\)
Sama persis dengan strategi Customer Portal, hanya target sumbu utamanya yang diganti.

- **Framework Preset**: None
- **Build Command**: mkdir -p dist && cp -r admin/* dist/ && cp -r assets dist/assets
- **Build Output Directory**: dist

**Penjelasan Output**: 
Sistem akan mengekstrak isi folder /admin/ ke *root* dari domain ini, dan menyalin folder /assets/ untuk menemaninya. 
- https://backstage.sisitus.com/ (Otomatis memuat admin/index.html)
- https://backstage.sisitus.com/assets/... (Valid)

---

## âœ… Kesimpulan Manfaat Strategi Ini
1. **Nol Duplikasi Repo**: Tetap 100% monorepo.
2. **Nol Perubahan Kode Core**: Tidak perlu mengubah konfigurasi *CORS* atau merombak tautan pemanggilan src="/assets/..." di dalam HTML/JS. Semuanya akan bekerja secara *magic*.
3. **Isolasi Sempurna**: sisitus.com tidak bisa mengakses rute admin secara tidak sengaja, dan backstage.sisitus.com tidak terbebani oleh file-file marketing.

## ðŸ“ Catatan Lanjutan Sebelum Eksekusi Cleanup
Jika Anda menyetujui konfigurasi ini, kita dapat memvalidasi **satu-satunya hal yang tersisa yang perlu diubah secara manual di dalam kode**: 
- Tautan "Kembali ke Beranda" di dalam Customer Portal yang memiliki href="/". Tautan ini akan saya ubah secara massal (melalui script) menjadi href="https://sisitus.com/" agar mengarah kembali ke Public Site.

Berikan konfirmasi Anda, dan saya siap untuk mengeksekusi Cleanup dan perbaikan tautan tersebut!