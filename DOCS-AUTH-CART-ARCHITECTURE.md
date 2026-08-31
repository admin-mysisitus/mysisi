# Arsitektur Autentikasi dan Keranjang (Mysisi)
Dokumentasi ini menjelaskan secara ringkas arsitektur SSO (Single Sign-On), Keranjang (Cart), dan Wishlist yang digunakan pada ekosistem Mysisi pasca-refaktorisasi besar.

## Arsitektur 3-Domain
Sistem Mysisi berjalan di atas 3 domain terpisah:
1. **Public (`sisitus.com`)**: Berfungsi sebagai etalase depan. Menggunakan *localStorage* murni untuk menyimpan data *Guest Cart* dan *Guest Wishlist*.
2. **Customer Portal (`my.sisitus.com`)**: Merupakan **Single Source of Truth (SSOT)**. Menampung data *session* autentikasi Firebase, melakukan sinkronisasi *Cart* dan *Wishlist* pengguna login ke Firebase Realtime Database (RTDB).
3. **Admin Backstage (`backstage.sisitus.com`)**: Manajemen data sistem internal yang terisolasi.

## Handoff Protocol & SSO Iframe
Karena kendala keamanan *Cross-Origin*, domain Public tidak bisa membaca token dari domain Customer secara langsung. Solusi yang digunakan adalah Iframe SSO Terpusat.

File penting:
- `my/auth/sso.html` (dimuat sebagai Iframe di `sisitus.com`)
- `assets/js/components/navigation.js` (Pihak Public yang mendengarkan event dari Iframe)

### 1. Sinkronisasi Status SSO
Setiap kali status login, *cart*, atau *wishlist* berubah di Customer Portal, `sso.html` menembakkan *message*:
```json
{
  "type": "SISITUS_SSO_STATE",
  "isLoggedIn": true,
  "cartCount": 2,
  "wishlistDomains": ["contoh.com"]
}
```
Event ini ditangkap oleh Public `navigation.js` untuk meng-update UI secara *real-time* (seperti menampilkan indikator login atau *badge* keranjang/wishlist).

### 2. Guest Handoff
Saat user *Guest* (publik) klik Checkout:
- Public mengirim event `SISITUS_GUEST_HANDOFF` beserta data keranjang lokalnya ke SSO Iframe.
- SSO Iframe menyimpannya ke `CartManager`.
- Setelah sukses dan diamini (`SISITUS_GUEST_HANDOFF_ACK`), Public membersihkan `CartManager` dan `WishlistManager` lokalnya.

### 3. Delegated Action (Wishlist)
Ketika user **sudah login**, mengeklik "Tambah ke Wishlist" di domain Public **TIDAK** akan menulis data ke *storage* lokal. Sebaliknya, Public akan mengirim event **Delegasi**:
```json
{
  "type": "SISITUS_DELEGATE_WISHLIST_TOGGLE",
  "domain": "contoh.com"
}
```
SSO Iframe yang menerima event ini akan memproses data tersebut menggunakan kredensial Firebase yang sah (Customer Portal) langsung ke RTDB tanpa melanggar batasan lintas domain.

## Single Source of Truth (DRY Principle)
Fungsi interaksi *cart* dan *wishlist* kini telah dimurnikan dengan prinsip DRY:
- Segala akses ke keranjang dan *wishlist* (baik baca maupun tulis) murni dilakukan melalui `CartManager` dan `WishlistManager` (terletak di `assets/js/modules/unified-cart.js`).
- Tidak ada lagi skrip individu seperti `sso.html` atau `cart.js` yang secara manual memanggil `localStorage.setItem('cart')` atau memanipulasi diskon secara paksa. Jika keranjang kosong, *Manager* otomatis menghapus kupon dan add-on yang bersisa.
