
========================================
KLARIFIKASI FINAL - PAYMENT & AUTH FLOW
========================================


1. MIDTRANS PAYMENT SETUP
----------------------------------------

URUTAN YANG BENAR (WAJIB IKUTI):

1. User klik "Lanjut Bayar" di /cart/

2. SYSTEM:
   -> VALIDASI:
      - user sudah login
      - email sudah terverifikasi
      - domain masih available

3. BUAT ORDER DI DATABASE (STATUS: PENDING)
   Data wajib:
   - user_id
   - domain
   - tld
   - siklus
   - addons
   - harga (LOCKED)
   - status: pending

4. GENERATE MIDTRANS SNAP TOKEN
   -> menggunakan data order_id dari database

5. FRONTEND:
   -> tampilkan Midtrans payment widget (Snap)

CATATAN:
- JANGAN generate payment tanpa order di database
- order_id = single source of truth
- payment.js hanya trigger, bukan logic utama


========================================
2. INVOICE SAVE TIMING
----------------------------------------

YANG BENAR:

Invoice disimpan SETELAH payment SUCCESS dari Midtrans (via webhook)

ALUR:
1. Midtrans kirim webhook (notification)
2. Backend verifikasi signature (WAJIB)
3. Update order:
   - status: paid

4. GENERATE INVOICE:
   - simpan ke database
   - generate file (PDF optional)

JANGAN:
- simpan invoice saat user buka halaman
- simpan sebelum payment sukses

KENAPA:
-> menghindari fake invoice / unpaid invoice


========================================
3. REDIRECT AFTER PAYMENT SUCCESS
----------------------------------------

ALUR FINAL:

1. Payment SUCCESS (Midtrans)
2. User diarahkan ke:

   /invoice/{order_id}

Tampilan:
- detail invoice
- status: PAID
- tombol download (PDF)

3. Dari sini:
   -> user bisa ke dashboard

4. Dashboard:
   -> menampilkan:
      - riwayat order
      - invoice list

CATATAN:
- JANGAN langsung redirect ke dashboard tanpa invoice page
- invoice page = confirmation moment (penting untuk UX & trust)


========================================
4. EMAIL VERIFICATION (FLOW 2 - CART)
----------------------------------------

INI KRITIS, TIDAK BOLEH DILANGGAR:

ALUR:

1. User register di /cart/ (inline form)

2. SYSTEM:
   -> buat user (status: UNVERIFIED)
   -> kirim email verification

3. USER HARUS:
   -> klik link verifikasi email

4. SETELAH VERIFIED:
   -> user bisa login
   -> lanjut ke payment

BLOCKING RULE:
- user TIDAK BOLEH lanjut ke payment sebelum email verified

JANGAN:
- izinkan payment sebelum verifikasi
- verifikasi setelah payment

KENAPA:
-> mencegah:
   - spam order
   - fake email
   - invoice tidak bisa dikirim


========================================
RINGKASAN ARSITEKTUR (WAJIB DIPAHAMI)
========================================

ORDER FLOW:
cart → create order → midtrans → webhook → update → invoice

AUTH FLOW:
guest → register/login → verify email → payment

DATA FLOW:
order_id = pusat semua relasi:
- midtrans
- invoice
- dashboard


========================================
KESALAHAN FATAL YANG HARUS DIHINDARI
========================================

1. Generate payment TANPA order di database
2. Invoice dibuat sebelum payment sukses
3. Tidak pakai webhook (hanya rely frontend)
4. Email belum verified tapi bisa bayar
5. Tidak verify signature Midtrans
6. Tidak lock harga saat order dibuat


========================================
FINAL NOTE
========================================

Flow ini sudah production-grade:
- scalable
- aman
- minim fraud
- konsisten dengan sistem payment modern

JANGAN improvise di tengah jalan.
Semua harus mengikuti flow ini sebagai single source of truth.

========================================