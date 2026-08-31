# Panduan Solusi Error Otorisasi Google & Konfigurasi Firebase

Error **400: origin_mismatch** adalah hal yang sangat wajar terjadi setelah kita melakukan pemisahan domain. Sistem Google memblokir upaya login karena permintaan login datang dari domain baru (my.sisitus.com atau dmin.sisitus.com) yang belum terdaftar di dalam "daftar putih" (whitelist) keamanan mereka.

Ya, Anda **wajib** memperbarui izin di Google Cloud Console dan Firebase Console. Berikut adalah panduan langkah demi langkahnya:

---

## 1. Perbarui Authorized Domains di Firebase Console
Firebase harus tahu bahwa domain baru Anda diizinkan untuk menggunakan layanannya.

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek **SISITUS** Anda.
3. Di menu sebelah kiri, klik **Authentication**, lalu pilih tab **Settings** (Pengaturan).
4. Klik **Authorized domains** (Domain yang diotorisasi).
5. Klik **Add domain** (Tambahkan domain), lalu masukkan:
   - my.sisitus.com
6. Klik **Add domain** lagi, lalu masukkan:
   - dmin.sisitus.com
7. Simpan perubahan.

---

## 2. Perbarui OAuth 2.0 Client IDs di Google Cloud Console
Ini adalah penyebab utama dari error origin_mismatch.

1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Pastikan Anda berada di proyek Google Cloud yang terhubung dengan proyek Firebase SISITUS Anda (cek dropdown di pojok kiri atas).
3. Pada bagian **OAuth 2.0 Client IDs**, klik nama klien web yang Anda gunakan (biasanya bernama *Web client (auto created by Google Service)*).
4. Pada bagian **Authorized JavaScript origins** (Asal JavaScript yang diotorisasi), tambahkan URL berikut:
   - https://my.sisitus.com
   - https://admin.sisitus.com
5. Pada bagian **Authorized redirect URIs** (URI pengalihan yang diotorisasi), tambahkan URL *handler* dari Firebase untuk domain baru Anda:
   - https://my.sisitus.com/__/auth/handler
   - https://admin.sisitus.com/__/auth/handler
6. Klik **Save** (Simpan).

*(Catatan: Perubahan pada Google Cloud Console mungkin memerlukan waktu hingga 5-15 menit untuk diterapkan secara global).*

---

## 3. Apakah Ada Pengaturan Lanjutan untuk RTDB (Realtime Database)?

**Untuk Realtime Database (RTDB) dan Firestore, TIDAK ADA perubahan konfigurasi terkait domain.**

Kenapa? Karena Firebase RTDB dan Firestore mengamankan data Anda menggunakan **Firebase Security Rules** (Aturan Keamanan) yang berbasis pada autentikasi *User ID* ( auth.uid), bukan berdasarkan nama domain (CORS). 
Selama proses login Google (OAuth) sudah berhasil dan pengguna mendapatkan *token* dari Firebase, aplikasi dari domain mana pun (yang diizinkan di langkah 1) dapat mengakses database dengan aman.

**Pengecualian:**
- Jika Anda menggunakan **Firebase App Check** (misalnya reCAPTCHA Enterprise), Anda perlu menambahkan sisitus.com ke daftar domain yang diizinkan di pengaturan App Check.
- Jika Anda menggunakan sistem *CORS* khusus di **Cloud Functions** (jika ada), Anda harus memperbarui header Access-Control-Allow-Origin agar mencakup https://sisitus.com.

---

## Ringkasan Tindakan
1. Tambahkan sisitus.com ke **Firebase Auth > Settings > Authorized domains**.
2. Tambahkan https://sisitus.com ke **Google Cloud > Credentials > Authorized JavaScript origins**.
3. Tambahkan https://sisitus.com/__/auth/handler ke **Google Cloud > Credentials > Authorized redirect URIs**.
4. Tunggu 5-10 menit, lalu coba login kembali.