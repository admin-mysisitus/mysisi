Berdasarkan hasil pemeriksaan kode yang mendalam, sistem Anda **BELUM SIAP** jika Anda langsung mengarahkan domain menjadi ackstage.sisitus.com dengan strategi *root deployment* sebelumnya.

Perubahan dari dmin.sisitus.com ke ackstage.sisitus.com adalah ide keamanan yang **sangat bagus** (sering disebut *Security through obscurity*). Namun, aplikasi admin Anda saat ini sangat terikat (*tightly coupled*) dengan *path* /admin/.

Berikut adalah 3 masalah utama yang akan terjadi jika langsung dipublikasikan sekarang:

### 1. Masalah Tautan Statis & Aset (Error 404)
Di dalam dmin/index.html dan skrip aplikasinya, aset dipanggil menggunakan *path absolute* /admin/.
Contoh: src="/admin/js/admin-app.js" dan href="/admin/styles/admin-main.css".
Jika domain menjadi ackstage.sisitus.com dan file diekstrak ke *root*, browser akan mencari ackstage.sisitus.com/admin/js/admin-app.js. Jika Anda tidak membuat folder dmin di dalam ackstage, seluruh sistem admin akan hancur (layar putih).

### 2. Logika Autentikasi Gagal Mendeteksi Admin
Di dalam file ssets/js/modules/unified-auth.js, sistem membedakan pelanggan biasa dan staf admin dengan melihat URL di browser:
if (window.location.pathname.includes('/admin/')) { ... }
Jika URL berubah menjadi https://backstage.sisitus.com/ (tanpa /admin/ di belakangnya), *script* ini akan kebingungan dan menganggap pengguna sedang berada di luar area admin, sehingga menyebabkan *loop redirect* atau gagal login.

### 3. Redirect Pasca-Login Mengarah ke Tempat Salah
Saat ini, jika seorang Admin berhasil login dari my.sisitus.com/auth/ atau *form login* utama, skrip shared-auth-form.js memiliki instruksi ini:
window.location.href = result.data.role === 'admin' ? '/admin/' : '...';
Jika Anda memisahkannya ke subdomain ackstage.sisitus.com, *redirect* /admin/ tersebut akan salah sasaran (mencoba membuka my.sisitus.com/admin/ yang mana hal itu sudah diblokir/dihapus). Redirect ini harus diubah menjadi URL absolut https://backstage.sisitus.com/.

---

### Bagaimana Solusinya?
Agar siap dan sempurna, kita harus melakukan *refactor* (perbaikan) pada kode-kode di atas. 
1. Mengubah *hardcoded* /admin/ menjadi relatif di dalam UI admin.
2. Mengubah deteksi pathname.includes('/admin/') dengan mengecek *hostname* (window.location.hostname === 'backstage.sisitus.com').
3. Mengubah *redirect login* menggunakan URL absolut.

Apakah Anda ingin saya membuatkan **Rencana Implementasi (Implementation Plan)** untuk membereskan ke-3 masalah ini secara otomatis?