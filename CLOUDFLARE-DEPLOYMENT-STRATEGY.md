# Strategi Deployment Cloudflare Pages

Berdasarkan analisis arsitektur, seluruh aplikasi (Public, Customer Portal, dan Admin) berjalan dalam satu kesatuan di bawah domain utama `sisitus.com`.

Semua layanan berbagi penyimpanan lokal yang sama (localStorage, IndexedDB) sehingga fitur seperti sinkronisasi keranjang dan otentikasi Firebase dapat bekerja secara *native* dan mulus tanpa memerlukan *hack* lintas-domain.

---

## Konfigurasi Deployment (sisitus.com)

- **Framework Preset**: None
- **Build Command**: Kosongkan (Biarkan *default* / *none*)
- **Build Output Directory**: / (Biarkan kosong / *default*)

**Penjelasan Output**: 
Cloudflare akan menyalin seluruh repositori dan mem-publishnya secara langsung.
- Halaman Publik tersedia di `https://sisitus.com/`
- Customer Portal tersedia di `https://sisitus.com/my/`
- Admin Portal tersedia di `https://sisitus.com/admin/`

Semua *relative paths* (`/assets/...`) akan memuat file dengan benar, dan aplikasi *Single-Page* akan berfungsi sempurna dengan aturan *redirect* standar.