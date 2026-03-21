# Google Sheets + Apps Script Setup Guide

**Date**: March 22, 2026  
**Integration**: Checkout → Google Apps Script → Google Sheets

## Overview

Sistem checkout telah di-update untuk menggunakan Google Apps Script dan Google Sheets sebagai backend. Semua order akan disimpan langsung ke Google Sheet, dan email notifikasi akan dikirim otomatis.

---

## Step-by-Step Setup

### Step 1: Buat Google Sheet Baru

1. Buka [Google Sheets](https://sheets.google.com)
2. Klik "+ New" → "Spreadsheet"
3. Beri nama "SISITUS Orders"
4. Pada sheet pertama (Sheet1), rename menjadi "Orders"
5. Setup kolom header (baris 1):

| Column | Header | Type |
|--------|--------|------|
| A | Order ID | Text |
| B | Tanggal Order | Date |
| C | Domain | Text |
| D | Paket | Text |
| E | Harga Paket | Number |
| F | Total | Number |
| G | Nama Customer | Text |
| H | Email | Text |
| I | Phone | Text |
| J | Alamat | Text |
| K | Status | Text |
| L | Created At | Text |

**Contoh row pertama header:**
```
Order ID | Tanggal Order | Domain | Paket | Harga Paket | Total | Nama Customer | Email | Phone | Alamat | Status | Created At
```

### Step 2: Setup Google Apps Script

1. Di Google Sheet, buka **Tools** → **Script Editor**
2. Hapus code yang sudah ada (jika ada)
3. Buka file: [/api/orders-create.js](/api/orders-create.js)
4. Copy seluruh code (mulai dari `// CONFIGURATION` hingga akhir)
5. Paste ke Google Apps Script editor
6. **Penting**: Update variable `SPREADSHEET_ID` dan `ADMIN_EMAIL`:

```javascript
// Dapatkan SPREADSHEET_ID dari URL sheet:
// https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID_DISINI}/...

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Ganti dengan ID sheet Anda
const SHEET_NAME = 'Orders'; // Nama sheet (jangan ubah)
const ADMIN_EMAIL = 'admin@sisitus.com'; // Email Anda untuk notifikasi
```

7. Klik **Save** (Ctrl+S)

### Step 3: Deploy sebagai Web App

1. Di Google Apps Script editor, klik **Deploy** (tombol biru, atas kanan)
2. Pilih **New Deployment**
3. Klik icon gear → pilih **Web App**
4. Isi konfigurasi:
   - **Execute as**: Pilih akun Google Anda (sesuaikan di mana script akan berjalan)
   - **Who has access**: "Anyone" (penting untuk checkout dapat POST)
5. Klik **Deploy**
6. Copy **Deployment ID** dari URL atau dari notification yang muncul
   
   Format URL akan seperti:
   ```
   https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
   ```
   
   Contoh:
   ```
   https://script.google.com/macros/d/1ABcD_EfGhIj2KlMnOpQRstUV-WxYzAbCdEFgHiJkL/usercontent
   ```

### Step 4: Update Checkout JavaScript

1. Buka [/assets/js/pages/checkout.js](/assets/js/pages/checkout.js)
2. Cari baris ini (sekitar line 365):
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent';
   ```
3. Ganti `{DEPLOYMENT_ID}` dengan ID dari Step 3
   
   Contoh sebelum:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent';
   ```
   
   Contoh sesudah:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/1ABcD_EfGhIj2KlMnOpQRstUV-WxYzAbCdEFgHiJkL/usercontent';
   ```

4. Save file

---

## Testing

### Test 1: Manual Test di Google Apps Script

1. Buka Google Apps Script editor lagi
2. Scroll ke bawah, lihat fungsi `testOrderCreation()`
3. Klik di fungsi tersebut
4. Tekan **Ctrl+Enter** (atau klik ▶ RUN)
5. Lihat hasil di **Execution log**
6. Cek Google Sheet Anda, seharusnya sudah ada 1 row data

### Test 2: Full End-to-End Test

1. Buka website: `http://localhost/`
2. Cari domain: `example.com`
3. Klik "Amankan Sekarang"
4. Fill form:
   - Nama: "Budi Santoso"
   - Email: "budi@example.com"
   - Phone: "08812345678"
   - Alamat: "Jln. Sudirman No. 123, Jakarta"
5. Pilih paket "Grower"
6. Klik "Lanjutkan ke Pembayaran"
7. Tunggu 2-3 detik (processing)
8. Cek:
   - Email inbox Anda (seharusnya dapat 2 email: 1 ke customer, 1 ke admin)
   - Google Sheet: seharusnya ada 1 row baru dengan order data

---

## Data Flow

```
Checkout Form (checkout/index.html)
    ↓
processCheckout() di checkout.js
    ↓
POST ke GOOGLE_APPS_SCRIPT_URL dengan JSON order data
    ↓
Google Apps Script doPost() menerima data
    ↓
validateOrderData() memvalidasi
    ↓
generateOrderId() membuat Order ID unik
    ↓
saveOrderToSheet() menyimpan ke Google Sheets
    ↓
sendOrderNotification() kirim email ke customer + admin
    ↓
Return response { success: true, orderId: "ORD-..." }
    ↓
checkout.js redirect ke /payment/{orderId}
```

---

## Order Data yang Disimpan

Setiap order akan menyimpan:

```javascript
{
  Order ID:     "ORD-20260322-ABC123",
  Tanggal:      "22/3/2026, 10:30",
  Domain:       "example.com",
  Paket:        "Grower",
  Harga Paket:  1299000,
  Total:        1598000,
  Nama:         "Budi Santoso",
  Email:        "budi@example.com",
  Phone:        "08812345678",
  Alamat:       "Jln. Sudirman No. 123, Jakarta",
  Status:       "Pending",
  Created At:   "2026-03-22T10:30:00Z"
}
```

---

## Email Template

### Email ke Customer

```
Halo Budi Santoso,

Terima kasih telah melakukan pemesanan di SISITUS!

Detail Pesanan:
- Order ID: ORD-20260322-ABC123
- Domain: example.com
- Paket: Grower
- Total: Rp 1.598.000

Kami akan segera menghubungi Anda melalui WhatsApp untuk melanjutkan proses pembayaran.

Nomor WhatsApp Anda: 08812345678
Email: budi@example.com

Terima kasih,
Tim SISITUS
```

### Email ke Admin

```
Pesanan baru diterima!

Order ID: ORD-20260322-ABC123
Domain: example.com
Paket: Grower
Total: Rp 1.598.000

Customer:
- Nama: Budi Santoso
- Email: budi@example.com
- Phone: 08812345678
- Alamat: Jln. Sudirman No. 123, Jakarta

Link Google Sheet: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}
```

---

## Troubleshooting

### ❌ Error: "Gagal memproses pesanan: Failed to fetch"

**Penyebab**: GOOGLE_APPS_SCRIPT_URL tidak benar atau web app belum di-deploy

**Solusi**:
1. Pastikan URL dimulai dengan `https://script.google.com/macros/d/`
2. Deploy ulang Google Apps Script (Deploy > New Deployment)
3. Copy URL deployment yang benar ke checkout.js

### ❌ Error: "Sheet 'Orders' tidak ditemukan"

**Penyebab**: Nama sheet tidak match dengan SHEET_NAME di Google Apps Script

**Solusi**:
1. Buka Google Sheet
2. Pastikan sheet pertama terberi nama "Orders" (case-sensitive)
3. Update SHEET_NAME di Google Apps Script jika berbeda

### ❌ Data tidak muncul di Google Sheet

**Penyebab**: Script error atau permission issue

**Solusi**:
1. Buka Google Apps Script editor
2. Klik **Execution log** di bawah untuk lihat error
3. Pastikan Google Apps Script di-deploy sebagai "Anyone"
4. Test dengan `testOrderCreation()` function

### ❌ Email tidak dikirim

**Penyebab**: ADMIN_EMAIL salah atau belum update

**Solusi**:
1. Buka Google Apps Script editor
2. Update `ADMIN_EMAIL = 'your-email@gmail.com'`
3. Save dan Deploy ulang
4. Test dengan `testOrderCreation()`

### ❌ Order ID tidak unik

**Penyebab**: Jarang terjadi jika 2 order ditambah dalam 1 detik yang sama

**Solusi**: Ubah generateOrderId() untuk menambah keunikan dengan timestamp millisecond

---

## Important Security Notes

1. **SPREADSHEET_ID**: Jangan share ke orang lain (ini akses ke Google Sheet Anda)
2. **GOOGLE_APPS_SCRIPT_URL**: Aman di-share (hanya bisa POST dari domain tertentu)
3. **Email Validation**: Google Apps Script sudah validasi format email
4. **Phone Validation**: Hanya accept format 08xxxxxxxxxx (Indonesian standard)
5. **HTTPS**: Pastikan website menggunakan HTTPS (tidak HTTP)

---

## Limitations & Notes

### Limitations
- Google Apps Script memiliki quota limit: ~20,000 executions/day
- Spreadsheet akan lambat jika sudah 100,000+ rows (perlu archive)
- Email delivery bisa delay 1-2 menit

### Recommendations
1. Archive orders lama ke sheet terpisah setiap bulan
2. Setup Google Forms notification untuk tracking real-time
3. Backup Google Sheet secara berkala
4. Monitor execution yang gagal di Apps Script dashboard

---

## Next Steps

1. ✅ Setup Google Sheet dengan kolom yang benar
2. ✅ Deploy Google Apps Script sebagai Web App
3. ✅ Update GOOGLE_APPS_SCRIPT_URL di checkout.js
4. ✅ Test dengan testOrderCreation()
5. ✅ Test end-to-end dari checkout flow
6. 📋 Setup payment gateway (`/payment/{orderId}`)
7. 📋 Create admin dashboard untuk manage orders

---

## Reference Files

- **Checkout HTML**: [/checkout/index.html](/checkout/index.html)
- **Checkout JS**: [/assets/js/pages/checkout.js](/assets/js/pages/checkout.js)
- **Google Apps Script**: [/api/orders-create.js](/api/orders-create.js)
- **Testing Guide**: [CHECKOUT_TESTING_GUIDE.md](CHECKOUT_TESTING_GUIDE.md)

---

**Support**: Jika ada error, cek Google Apps Script execution log untuk detail error
