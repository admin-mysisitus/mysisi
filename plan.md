Saya telah melakukan refaktor besar pada sistem website saya dengan menerapkan arsitektur hybrid antara Google Apps Script (GAS) dan Firebase Realtime Database (RTDB).

Tujuan refaktor ini adalah meningkatkan performa, terutama pada fitur yang membutuhkan respons cepat/realtime, sekaligus tetap mempertahankan fungsi GAS yang memang lebih cocok untuk proses backend, integrasi Google Workspace, administrasi, dan proses tertentu yang tidak membutuhkan realtime.

Saya ingin Anda melakukan **AUDIT ARSITEKTUR terlebih dahulu**, bukan langsung mengubah kode.

### TUJUAN UTAMA

Pastikan implementasi hybrid GAS + RTDB saya benar-benar mengikuti best practice dalam hal:

1. Performance

   * latency serendah mungkin
   * realtime update jika memang diperlukan
   * meminimalkan request yang tidak perlu
   * menghindari blocking request
   * menghindari round-trip yang tidak diperlukan
   * tidak melakukan fetch ke GAS jika data dapat diperoleh langsung dari RTDB
   * caching dan optimistic update jika memang relevan

2. Security

   * Firebase Security Rules yang benar
   * autentikasi dan authorization yang benar
   * jangan mempercayai data dari client
   * validasi data di server/backend
   * proteksi endpoint GAS
   * tidak membocorkan credential, API key rahasia, token, atau service account
   * prinsip least privilege
   * pastikan user hanya dapat membaca/menulis data yang memang menjadi haknya

3. Data consistency

   * tentukan dengan jelas source of truth setiap data
   * jangan ada dua database yang sama-sama menjadi sumber utama untuk data yang sama tanpa alasan kuat
   * hindari race condition
   * hindari stale data
   * hindari konflik antara GAS dan RTDB
   * hindari data yang tersinkronisasi secara ambigu
   * hindari duplikasi penyimpanan yang tidak diperlukan

4. Maintainability

   * arsitektur mudah dipahami
   * tanggung jawab GAS dan RTDB jelas
   * tidak ada logic yang tersebar tanpa alasan
   * tidak ada fungsi yang melakukan pekerjaan yang sama di dua tempat
   * flow antar sistem jelas
   * mudah dikembangkan di masa depan

---

## TUGAS 1 — INVENTARISASI SELURUH FITUR

Pertama, identifikasi SEMUA fitur yang terpengaruh oleh refaktor hybrid ini.

Jangan hanya melihat fitur yang saya sebutkan.

Telusuri codebase dan cari seluruh fitur yang berhubungan dengan:

* authentication
* login
* register
* logout
* session
* user profile
* authorization
* role/permission
* Google Sign-In
* email/password authentication
* lazy migration user lama
* Firebase Auth
* GAS authentication/fallback
* domain checking
* domain availability
* domain search
* domain pricing
* domain order
* domain registration
* payment
* payment gateway
* invoice
* payment status
* transaction status
* webhook/callback
* order status
* customer data
* dashboard
* notifications
* live chat
* chat messages
* realtime status
* support/ticket
* contact form
* portfolio
* blog
* promo
* coupon
* referral jika ada
* cart jika ada
* checkout
* subscription jika ada
* hosting jika ada
* API integration
* third-party API
* admin panel
* analytics
* activity logs
* audit logs
* settings
* configuration
* file upload
* Google Drive integration
* Spreadsheet integration
* email notification
* WhatsApp notification jika ada
* background process
* scheduled process
* cron/trigger
* cache
* localStorage/sessionStorage
* dan fitur lain yang ditemukan dalam codebase.

Jangan berasumsi fitur tidak ada hanya karena tidak disebutkan di atas. Temukan berdasarkan kode aktual.

---

## TUGAS 2 — PETAKAN ARSITEKTUR SAAT INI

Untuk setiap fitur, buat pemetaan:

| Fitur | Frontend | GAS | RTDB | Firebase Auth | API eksternal | Source of Truth | Realtime? | Kondisi Saat Ini |
| ----- | -------- | --- | ---- | ------------- | ------------- | --------------- | --------- | ---------------- |

Jelaskan flow aktualnya berdasarkan kode.

Contoh:

User Login
→ Frontend
→ Firebase Auth
→ RTDB user profile
→ fallback GAS jika diperlukan
→ lazy migration
→ kembali ke frontend

Jangan hanya menjelaskan konsep. Pastikan flow tersebut benar-benar sesuai dengan implementasi kode saat ini.

---

## TUGAS 3 — TENTUKAN GAS VS RTDB

Untuk setiap fitur, tentukan apakah seharusnya:

* Firebase RTDB
* Firebase Auth
* GAS
* kombinasi GAS + RTDB
* atau sistem lain yang memang sudah digunakan

Gunakan prinsip berikut:

### Gunakan RTDB untuk:

* data yang membutuhkan realtime
* state yang sering berubah
* live chat
* presence/status online
* notification state
* dashboard realtime
* data yang membutuhkan respons cepat
* data client-facing yang aman untuk diakses langsung
* sinkronisasi antar client

### Gunakan Firebase Auth untuk:

* authentication
* identity
* login
* registration
* session/token management
* Google Sign-In
* email/password authentication

### Gunakan GAS untuk:

* Google Sheets
* Google Drive
* Gmail
* Google Workspace
* proses administratif
* integrasi yang memang bergantung pada layanan Google
* server-side process yang tidak membutuhkan realtime
* scheduled jobs jika memang sesuai
* legacy migration/fallback jika masih diperlukan

### Jangan memindahkan sesuatu ke RTDB hanya karena RTDB lebih cepat.

Pertimbangkan security, consistency, cost, maintainability, dan kebutuhan sebenarnya.

---

## TUGAS 4 — CARI ANTI-PATTERN

Cari secara aktif semua masalah arsitektur, termasuk tetapi tidak terbatas pada:

* data yang disimpan ganda di GAS/Spreadsheet dan RTDB tanpa alasan
* source of truth yang tidak jelas
* GAS masih dipanggil padahal RTDB sudah menjadi source of truth
* RTDB digunakan untuk data yang seharusnya diproses server-side
* authentication dilakukan di dua sistem secara bersamaan tanpa desain yang jelas
* fallback authentication yang dapat menyebabkan akun ganda
* race condition
* duplicate request
* duplicate write
* stale data
* inconsistent state
* polling yang sebenarnya dapat diganti realtime listener
* listener yang tidak pernah dilepas
* listener terlalu banyak
* excessive reads
* excessive writes
* unnecessary API calls
* sequential request yang sebenarnya dapat diparalelkan
* blocking request
* waterfall request
* client terlalu dipercaya
* security rule terlalu permisif
* validasi hanya dilakukan di frontend
* API secret berada di frontend
* GAS endpoint terbuka
* authorization hanya berdasarkan parameter dari client
* data sensitif dapat dibaca user lain
* IDOR
* privilege escalation
* transaksi yang tidak atomic
* webhook tidak tervalidasi
* payment status dapat dimanipulasi client
* order status dapat dimanipulasi client
* chat dapat ditulis ke path yang tidak seharusnya
* user dapat mengakses data admin
* Firebase rules tidak sesuai dengan struktur data
* redundant API layer
* duplicate business logic
* duplicate validation
* fallback yang tidak pernah selesai
* migration yang dapat membuat data inkonsisten
* error handling yang menyebabkan state menggantung
* retry yang dapat menghasilkan transaksi ganda.

---

## TUGAS 5 — KHUSUS AUTHENTICATION

Audit secara mendalam seluruh flow authentication.

Periksa:

1. Firebase Auth
2. Email/password
3. Google Sign-In
4. user lama
5. lazy migration
6. fallback GAS
7. session
8. token
9. logout
10. user profile
11. authorization
12. role
13. error handling
14. duplicate account prevention

Saya ingin flow ideal yang jelas.

Misalnya:

NEW USER
→ Firebase Auth
→ create user profile
→ RTDB

OLD USER
→ login
→ validasi legacy credential
→ Firebase Auth account creation/linking
→ migrate profile
→ tandai migrated
→ selanjutnya Firebase Auth menjadi primary

Tetapi jangan menganggap flow tersebut benar. Validasi berdasarkan kode aktual.

Pastikan setelah migration selesai tidak ada ketergantungan legacy yang tidak diperlukan.

---

## TUGAS 6 — KHUSUS PAYMENT

Audit seluruh flow pembayaran.

Pastikan:

Frontend
→ create order
→ payment gateway
→ webhook/server verification
→ update payment status
→ RTDB
→ frontend realtime update

atau flow lain yang memang lebih aman.

Yang paling penting:

**Client tidak boleh menjadi sumber kebenaran untuk status pembayaran.**

Pastikan status pembayaran hanya dapat dipercaya setelah diverifikasi oleh backend/webhook/provider.

Periksa juga:

* duplicate payment
* duplicate order
* idempotency
* webhook verification
* retry
* race condition
* payment pending
* payment success
* payment failed
* expired payment
* refund jika ada
* invoice synchronization
* RTDB update
* GAS synchronization jika masih diperlukan.

---

## TUGAS 7 — KHUSUS DOMAIN CHECK

Audit flow pengecekan domain.

Periksa:

* apakah request domain langsung ke API eksternal
* apakah melalui GAS
* apakah ada proxy
* apakah dapat menggunakan cache
* apakah ada request duplicate
* apakah pencarian beberapa TLD dilakukan secara efisien
* apakah data pricing dan availability bercampur
* apakah API key aman
* apakah response dapat dimanipulasi client
* apakah request terlalu banyak
* apakah ada debounce
* apakah ada race condition ketika user mengetik cepat.

Tentukan arsitektur yang paling efisien dan aman.

---

## TUGAS 8 — KHUSUS LIVE CHAT

Audit seluruh sistem live chat.

Periksa:

* struktur RTDB
* message path
* conversation path
* user access
* admin access
* realtime listener
* presence
* typing indicator
* unread count
* notification
* message ordering
* pagination
* read receipt
* duplicate message
* listener cleanup
* security rules
* data retention
* excessive reads/writes.

Pastikan live chat benar-benar memanfaatkan keunggulan RTDB dan tidak melalui GAS untuk setiap pesan.

---

## TUGAS 9 — SOURCE OF TRUTH

Buat tabel khusus:

| Data | Source of Truth | Secondary/Cache | Siapa yang boleh Write | Siapa yang boleh Read | Mekanisme Sync |
| ---- | --------------- | --------------- | ---------------------- | --------------------- | -------------- |

Untuk setiap data penting.

Jika satu data memiliki dua source of truth, tandai sebagai:

**CRITICAL ARCHITECTURE ISSUE**

dan jelaskan bagaimana memperbaikinya.

---

## TUGAS 10 — SECURITY AUDIT

Audit Firebase Security Rules dan seluruh endpoint GAS.

Berikan severity:

* CRITICAL
* HIGH
* MEDIUM
* LOW
* INFO

Untuk setiap masalah berikan:

* lokasi
* masalah
* exploit/risiko
* penyebab
* rekomendasi
* prioritas perbaikan

Jangan menganggap Firebase API key sebagai secret jika konteksnya memang public configuration. Fokus pada credential dan secret yang benar-benar sensitif.

---

## TUGAS 11 — PERFORMANCE AUDIT

Petakan request flow setiap fitur utama.

Cari:

* unnecessary request
* duplicate request
* sequential request
* waterfall
* polling
* excessive listener
* excessive database read
* excessive write
* unnecessary GAS execution
* unnecessary API call
* payload terlalu besar
* data fetching terlalu banyak.

Jika memungkinkan, berikan estimasi:

CURRENT FLOW
→ X request
→ X round trip
→ X backend execution

IDEAL FLOW
→ X request
→ X round trip
→ realtime listener jika diperlukan

Jangan menjanjikan "zero latency" secara literal. Gunakan istilah yang lebih tepat seperti **near-zero perceived latency** atau **minimal latency**.

---

## TUGAS 12 — HASIL AKHIR

Setelah seluruh audit selesai, jangan langsung mengubah kode.

Berikan hasil dalam urutan:

### A. Executive Summary

Kesimpulan apakah arsitektur hybrid saat ini sudah sehat atau belum.

### B. Feature Inventory

Daftar seluruh fitur yang terdampak.

### C. Current Architecture

Flow aktual setiap fitur.

### D. Recommended Architecture

Flow yang seharusnya.

### E. GAS vs RTDB Matrix

Tentukan secara eksplisit komponen mana menggunakan GAS, RTDB, Firebase Auth, atau kombinasi.

### F. Source of Truth Matrix

Tentukan source of truth setiap data penting.

### G. Security Findings

Urutkan berdasarkan severity.

### H. Performance Findings

Urutkan berdasarkan impact.

### I. Consistency Findings

Cari seluruh potensi konflik data.

### J. Redundancy Findings

Cari logic/request/storage yang tidak perlu.

### K. Critical Issues

Daftar masalah yang harus diperbaiki sebelum sistem dianggap production-ready.

### L. Implementation Plan

Buat roadmap perbaikan berdasarkan prioritas:

PHASE 1 — Critical Security
PHASE 2 — Data Consistency
PHASE 3 — Authentication
PHASE 4 — Payment
PHASE 5 — Domain/API
PHASE 6 — Live Chat
PHASE 7 — Performance Optimization
PHASE 8 — Cleanup & Refactoring
PHASE 9 — Testing
PHASE 10 — Production Validation

Untuk setiap task berikan:

* tujuan
* file yang terdampak
* perubahan yang diperlukan
* dependency
* risiko
* cara testing
* acceptance criteria

### M. Testing Matrix

Buat test case untuk:

* new user registration
* old user login
* migrated user login
* Google login
* logout
* invalid credential
* duplicate account
* payment success
* payment failure
* payment pending
* webhook retry
* duplicate webhook
* domain available
* domain unavailable
* API failure
* live chat send
* live chat receive
* multiple devices
* offline → online
* unauthorized access
* expired session
* concurrent update
* database failure
* GAS failure
* Firebase failure.

---

## ATURAN PENTING

1. **Jangan langsung melakukan perubahan kode.**
2. Audit codebase aktual terlebih dahulu.
3. Jangan berasumsi arsitektur saat ini benar.
4. Jangan memindahkan semua hal ke RTDB hanya demi kecepatan.
5. Jangan mempertahankan GAS hanya karena legacy jika sebenarnya sudah tidak diperlukan.
6. Setiap data harus memiliki source of truth yang jelas.
7. Setiap business-critical operation harus memiliki authority yang jelas.
8. Client tidak boleh menjadi authority untuk data sensitif atau transaksi.
9. Jangan membuat sinkronisasi dua arah jika sebenarnya dapat dihindari.
10. Jangan membuat duplikasi business logic.
11. Jangan menambahkan kompleksitas tanpa alasan.
12. Prioritaskan security dan consistency sebelum optimization.
13. Jangan mengubah kode sebelum saya menyetujui implementation plan.
14. Jika menemukan sesuatu yang belum dapat dipastikan dari codebase, tandai sebagai **NEEDS VERIFICATION**, jangan menebak.
15. Jika ada beberapa pilihan arsitektur, bandingkan trade-off-nya dan pilih satu rekomendasi utama.
16. Fokus pada implementasi nyata, bukan teori umum.

### OUTPUT YANG SAYA INGINKAN

Untuk tahap pertama, **JANGAN CODING**.

Saya hanya ingin:

**AUDIT → PEMETAAN → MASALAH → REKOMENDASI → IMPLEMENTATION PLAN → TEST PLAN**

Setelah saya review dan menyetujui implementation plan, barulah kita masuk ke tahap implementasi kode.