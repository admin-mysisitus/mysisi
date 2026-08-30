# Laporan Audit Cleanup & Persiapan Multi-Deployment (FINAL)

Dokumen ini berisi hasil audit final terhadap struktur *workspace* pasca migrasi tahap pertama. Sesuai dengan instruksi, **tidak ada pemisahan repositori GitHub**, namun skenario *multi-deployment* (Public, Portal, Admin) akan menggunakan sumber (repositori) yang sama.

---

## 🗑️ SAFE TO DELETE (Aman Dihapus)
Folder dan file berikut telah terverifikasi aman untuk dihapus karena tidak lagi digunakan atau digantikan.

1. **Seluruh folder /layanan/ beserta isinya (termasuk /layanan/index.html)** 
   - *Alasan*: Halaman sub-layanan telah dipecah ke *root* (/domain/, /hosting/, /website/, /maintenance/). Aturan _redirects telah mencakup /layanan/* / 301.
2. **Folder /auth/ (Lama)**
   - *Alasan*: Modul autentikasi telah dipindahkan ke /my/auth/.
3. **Folder /dashboard/ (Lama)**
   - *Alasan*: Modul dashboard telah dipindahkan ke /my/dashboard/.
4. **File /my/dashboard/js/modules/invoice.js**
   - *Alasan*: Telah diaudit seluruh isi folder /my/, dan **tidak ada satu pun file** (*routing* maupun *module*) yang melakukan *import* terhadap invoice.js. Skrip ini murni merupakan penampil *standalone* yang saat ini sudah berjalan melalui /assets/js/modules/invoice.js untuk *Public Site*.

---

## 🔒 KEEP (Wajib Dipertahankan)
Folder dan file berikut TIDAK BOLEH dihapus.

1. **Folder /my/** 
   - *Alasan*: Ini adalah target direktori untuk my.sisitus.com (Customer Portal).
2. **Folder /admin/** 
   - *Alasan*: Ini adalah target direktori untuk admin.sisitus.com ke depannya.
3. **File /my/dashboard/js/modules/cart.js** 
   - *Alasan*: Berbeda dengan invoice.js, modul cart.js yang berada di dalam folder *dashboard* ini masih aktif di-*import* oleh dashboard-app.js untuk me-render antarmuka keranjang versi *Single Page Application* (SPA) di dalam dashboard pelanggan.

---

## 🔗 SHARED DEPENDENCY (Modul Bersama)
Modul-modul ini sangat krusial dan dipakai melintasi batas deployment.

- File di dalam e:\web-projects\mysisi\assets\js\modules\ (misal: unified-auth.js, unified-api.js, unified-cart.js, firebase-core.js, dll).
- File CSS, gambar, dan aset statis lainnya di dalam /assets/.
- **Catatan Audit**: File-file ini dipakai bersamaan oleh *Public Site*, /my/, dan /admin/. Mereka tidak boleh dihapus atau dipindahkan dari struktur saat ini.

---

## ⚠️ NEEDS VERIFICATION (Butuh Konfirmasi Lanjutan & Strategi Deployment)

Berdasarkan audit mendalam, ada 2 isu struktural yang harus Anda verifikasi sebelum kita melakukan penghapusan (eksekusi):

### 1. Strategi Deployment /assets/
Saat ini, file di dalam /my/ memanggil aset dengan rute *absolute* seperti src="/assets/img/..." atau import from '/assets/js/...'.
- **Konsekuensi Base Directory**: Jika Anda menggunakan platform Netlify/Vercel dan menyetel **Base Directory: /my/** untuk my.sisitus.com, maka /my/ menjadi *root*. Panggilan ke /assets/ akan mencari folder /my/assets/ yang **tidak ada** sehingga *web* akan *error 404* total.
- **Rekomendasi Tindakan (Pilih Salah Satu Nanti)**:
  - *Opsi A (Build Script)*: Menambahkan *build command* (misal: cp -r ../assets ./assets) di pengaturan *deployment* agar aset tercopy secara lokal.
  - *Opsi B (Root Deploy + Rewrite)*: Tidak mengatur Base Directory, melainkan tetap *deploy* dari *root repo*, namun menggunakan aturan *rewrite* di server (misal: /* /my/:splat 200) untuk my.sisitus.com.
  - *Opsi C (Absolute URL)*: Mengganti semua pemanggilan statis di dalam /my/ menjadi URL absolut https://sisitus.com/assets/... (namun ini membutuhkan pengaturan CORS pada sisi *Public Site* untuk *module JS*).

### 2. Hardcoded URLs di dalam /my/
- **Internal Portal Paths (/auth/ & /dashboard/)**: Terdapat puluhan *link* seperti href="/auth/" di dalam file /my/. Jika strategi deployment menggunakan *Base Directory* atau *Rewrite*, *link* internal ini **sudah benar** karena akan mengarah secara internal di dalam my.sisitus.com. Tidak perlu diubah.
- **Link "Kembali ke Beranda" (href="/")**: Terdapat banyak *link* "Kembali ke Beranda" di dalam halaman autentikasi portal yang menunjuk ke href="/". Jika di-*deploy* sebagai subdomain terpisah, tautan ini malah akan mengarah ke halaman depan Portal (mungkin me-*redirect* kembali ke Login), bukan kembali ke sisitus.com. Ini **harus** di-*update* secara eksplisit menjadi https://sisitus.com/ pada saat eksekusi nanti.