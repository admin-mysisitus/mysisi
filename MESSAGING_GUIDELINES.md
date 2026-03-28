# 📝 MESSAGING GUIDELINES
**System:** SISITUS Domain & Website Builder  
**Date:** March 28, 2026  
**Version:** 1.0  
**Audience:** Developers, Product Team  

---

## 🎯 PRINCIPLES

### 1. **Professional + Elegant Tone**
- Use formal Indonesian language (Bahasa Indonesia profesional)
- Avoid slang, abbreviations, or overly casual phrasing
- Always respectful and helpful, never condescending

**Examples:**
- ✅ "Email Anda belum terverifikasi. Verifikasi email diperlukan untuk melanjutkan pembayaran."
- ❌ "Email belum verified. Verif dulu!"
- ✅ "Pembayaran Berhasil! Terima kasih atas pemesanan Anda."
- ❌ "Payment OK!!"

### 2. **Clear Purpose & Next Steps**
Every message must answer:
- **What happened?** (Current state)
- **Why?** (Reason/explanation)
- **What next?** (Next action)

**Example - Complete Message:**
```
"Email Berhasil Diverifikasi! Akun Anda sudah aktif"  [WHAT]
"Anda sekarang dapat lanjut checkout di keranjang belanja"  [WHY + NEXT]
```

### 3. **Error Messages = Helpful, Not Harsh**
- Never blame the user
- Always suggest a solution
- List specific fixes if multiple issues

**Bad:**
```
"Error: Invalid input"
```

**Good:**
```
"Format email tidak valid. Contoh: nama@example.com"
```

### 4. **Status Messages = Color + Text**
- Never use color-only badges (color-blind accessibility)
- Include both icon/color AND text label
- Consistent across all statuses

**Bad:**
```html
<span class="badge badge-success"></span>  <!-- Just a green dot -->
```

**Good:**
```html
<span class="badge badge-success">✓ Sukses</span>
```

### 5. **Loading States = Specific Action**
- Tell user what the system is doing
- Use present continuous tense (-ing form)
- Use ellipsis (...) to suggest ongoing action

**Examples:**
- ✅ "Memproses pesanan..." (Processing order...)
- ✅ "Memuat data domain..." (Loading domain data...)
- ❌ "Loading..." (Too vague)
- ❌ "Wait..." (Unprofessional)

### 6. **Success Messages = Confirm + Celebrate**
- Use checkmark (✓) or success emoji
- Include brief celebration
- Inform about next action

**Examples:**
```
"✓ Profil berhasil disimpan. Anda akan diarahkan ke dashboard..."
"✓ Domain berhasil ditambahkan ke keranjang"
"✓ Email terverifikasi! Anda siap untuk checkout"
```

### 7. **Supportive & Reassuring Tone**
- Anticipate user concerns
- Provide helpful tips
- Offer support contact when needed

**Examples:**
- ✅ "Cek folder spam jika tidak menerima email dalam beberapa menit."
- ✅ "Jika masalah berlanjut, silakan hubungi support kami."
- ❌ "Email tidak sampai. Coba lagi." (No help offered)

---

## 📋 MESSAGE CATEGORIES

### Authentication Flow
| Scenario | Message | Type |
|----------|---------|------|
| **Registration Success** | "Akun berhasil dibuat! Link verifikasi telah dikirim ke email Anda." | Success |
| **Email Verification Sent** | "Kami akan mengirim link verifikasi ke email ini" | Info |
| **Email Verified** | "Email Berhasil Diverifikasi! Akun Anda sudah aktif" | Success |
| **Email Not Verified** | "Email Anda belum terverifikasi. Verifikasi email diperlukan untuk melanjutkan pembayaran." | Warning |
| **Invalid Email Format** | "Format email tidak valid. Contoh: nama@example.com" | Error |
| **Password Too Weak** | "Password harus mengandung huruf besar, kecil, dan angka" | Error |
| **Password Too Short** | "Password minimal 8 karakter" | Error |
| **Login Failed** | "Email atau password tidak sesuai. Cek kembali data Anda." | Error |

### Order Flow
| Scenario | Message | Type |
|----------|---------|------|
| **Domain Available** | "Domain tersedia! Lanjutkan dengan memilih paket." | Success |
| **Domain Not Available** | "Domain tersebut sudah tidak tersedia." | Error |
| **Validation Error** | "Nama minimal 3 karakter" | Error |
| **Cart Empty** | "Belum ada pesanan. Buat pesanan sekarang." | Info |
| **Order Summary Loading** | "Memproses ringkasan pesanan..." | Loading |
| **Order Created** | "✓ Pesanan berhasil dibuat. Lanjutkan ke pembayaran." | Success |

### Payment Flow
| Scenario | Message | Type |
|----------|---------|------|
| **Payment Success** | "✓ Pembayaran Berhasil! Terima kasih atas pemesanan Anda. Mengarahkan ke invoice..." | Success |
| **Payment Pending** | "Pembayaran sedang diproses. Anda akan menerima konfirmasi dalam waktu singkat." | Info |
| **Payment Failed** | "Pembayaran gagal. Silakan coba lagi." | Error |
| **Payment System Error** | "Gagal memuat sistem pembayaran. Coba refresh halaman atau hubungi support." | Error |
| **Verification Required** | "Email Anda belum terverifikasi. Verifikasi email diperlukan untuk melanjutkan pembayaran." | Warning |

### Dashboard Actions
| Scenario | Message | Type |
|----------|---------|------|
| **Profile Saved** | "✓ Profil berhasil disimpan." | Success |
| **Password Changed** | "✓ Password berhasil diubah." | Success |
| **No Orders** | "Belum ada pesanan. Buat pesanan sekarang untuk memulai." | Info |
| **No Invoices** | "Belum ada invoice. Selesaikan pembayaran pesanan terlebih dahulu." | Info |
| **Loading Orders** | "Memuat pesanan..." | Loading |
| **Loading Invoices** | "Memuat invoice..." | Loading |

---

## 🔧 IMPLEMENTATION PATTERNS

### Pattern 1: Form Validation
```javascript
// Pattern: {Field} {requirement}
"Nama minimal 3 karakter"
"Email tidak valid"
"Format: 08xxxxxxxxxx, +62xxxxxxxxxx, atau 62xxxxxxxxxx"
```

### Pattern 2: Success Messages
```javascript
// Pattern: ✓ {Action} {result}. {Next step}
showSuccess("✓ Pesanan Berhasil", "Pesanan telah dibuat. Lanjutkan ke pembayaran.");
```

### Pattern 3: Error Messages
```javascript
// Pattern: {Problem}. {Solution}
showError("Gagal memuat pesanan", "Coba refresh halaman atau hubungi support.");
```

### Pattern 4: Loading States
```javascript
// Pattern: Verb + "-ing" form
showLoading("Memproses...", "Sedang memproses pesanan Anda");
```

### Pattern 5: Status Badges
```html
<!-- Pattern: Icon/Color + Label + Optional description -->
<span class="badge badge-success">✓ Sukses</span>
<span class="badge badge-warning">⏳ Tertunda</span>
<span class="badge badge-danger">✕ Gagal</span>
<span class="badge badge-info">ⓘ Proses</span>
```

---

## 🎨 TONE VOICE MATRIX

### When to Use What Tone

| Situation | Tone | Example |
|-----------|------|---------|
| **Success** | Celebratory, warm | "✓ Sukses! Pesanan telah dibuat dengan sempurna." |
| **Error** | Helpful, not blaming | "Silakan periksa kembali format email Anda." |
| **Warning** | Respectful, urgent | "Email belum diverifikasi. Ini diperlukan untuk melanjutkan." |
| **Loading** | Reassuring, clear | "Memproses pesanan Anda..." |
| **Info** | Friendly, informative | "Kami akan mengirim konfirmasi ke email Anda." |
| **Support Needed** | Empathetic, helpful | "Jika masalah berlanjut, kami siap membantu via WhatsApp." |

---

## ❌ ANTI-PATTERNS (What NOT to Do)

### ❌ Generic Error Messages
```
❌ "Error occured"
✅ "Domain tidak ditemukan di sistem"
```

### ❌ Vague Loading Messages
```
❌ "Processing..."
✅ "Memproses ringkasan pesanan Anda..."
```

### ❌ Technical Jargon
```
❌ "CORS error: null origin not allowed"
✅ "Terjadi masalah koneksi. Coba refresh halaman."
```

### ❌ Blaming User
```
❌ "Anda memasukkan data yang salah"
✅ "Format email tidak valid. Contoh: nama@example.com"
```

### ❌ All Caps (Seems like yelling)
```
❌ "ERROR: INVALID EMAIL FORMAT"
✅ "Format email tidak valid"
```

### ❌ Multiple Exclamation Marks
```
❌ "Success!!! Order created!!!"
✅ "Pesanan berhasil dibuat"
```

### ❌ Emoji Overuse
```
❌ "🎉🎊✨✓ Sukses! 🎉"
✅ "✓ Sukses"
```

---

## 🌐 LANGUAGE GUIDELINES

### Indonesian Language Standards
- Use formal Indonesian (Bahasa Indonesia baku)
- Common greetings: "Selamat datang" (Welcome), "Terima kasih" (Thank you)
- Avoid: Slang, abbreviations, mixing languages

**Examples:**
- ✅ "Email sudah diverifikasi" (Email already verified)
- ❌ "Email udah di-verify" (Informal)
- ✅ "Hubungi tim support kami" (Contact our support team)
- ❌ "Hubungi support" (Too abbreviated)

### English Elements
Use sparingly for:
- Email addresses: support@sisitus.com
- URLs/links
- Technical terms when no Indonesian equivalent exists
- Brand names: SISITUS

**Examples:**
- ✅ "Verifikasi email dikirim ke: nama@example.com"
- ✅ "Dashboard - Pesanan Saya"

---

## 📱 CONTEXT-SPECIFIC RULES

### Mobile vs Desktop
- Messages same tone on both platforms
- Consider space constraints on mobile (shorter is better)
- Use clear, concise language for small screens

**Example:**
```
Desktop: "Silakan masukkan nomor WhatsApp untuk komunikasi pesanan"
Mobile: "Nomor WhatsApp untuk komunikasi pesanan (opsional)"
```

### Email vs In-App Messaging
- Email: More formal, complete sentences
- In-App: Can be more concise, use visual cues

**Example Email:**
```
"Terima kasih telah melakukan pemesanan di SISITUS. 
Email ini adalah konfirmasi order Anda dengan ID: ORD-001.
Untuk melanjutkan, silakan lakukan pembayaran dalam 24 jam."
```

**Example In-App:**
```
"✓ Pesanan dibuat
ID: ORD-001
Bayar dalam: 23:45:32"
```

---

## ✅ CHECKLIST FOR NEW MESSAGES

Before finalizing any user-facing message, check:

- [ ] **Professional?** Does it sound professional and elegant?
- [ ] **Clear purpose?** Is it obvious what happened/what to do?
- [ ] **Helpful?** Does it help the user understand the situation?
- [ ] **Actionable?** Is the next step clear?
- [ ] **Friendly tone?** Is the tone warm but professional?
- [ ] **No jargon?** Would a non-technical user understand?
- [ ] **No blame?** Does it avoid blaming the user?
- [ ] **Correct language?** Is Indonesian correct and formal?
- [ ] **Emoji appropriate?** Are emojis used minimally and meaningfully?
- [ ] **Accessible?** Would someone using screen reader understand context?

---

## 🔄 REVIEW PROCESS

### For Pull Requests
1. Check all user-facing text against these guidelines
2. Verify tone matches context (success/error/warning)
3. Ensure clear next steps for any action
4. Test on mobile for space constraints
5. Check for technical jargon

### For Bug Fixes
- When fixing messaging bugs, reference this guide
- Update this document if new patterns emerge
- Test error messages with actual error scenarios

---

## 📚 EXAMPLES BY FLOW

### Complete Email Verification Flow
```
1. Registration form helper text:
   "Kami akan mengirim link verifikasi ke email ini"
   
2. Email sent confirmation:
   "Link verifikasi dikirim ke: user@example.com"
   
3. Verification success:
   "Email Berhasil Diverifikasi! Akun Anda sudah aktif"
   
4. Next step offered:
   "Anda sekarang dapat lanjut checkout di keranjang belanja"
   
5. Countdown visible:
   "Halaman akan otomatis diarahkan dalam 2 detik..."
   
6. Post-redirect action:
   "Selamat datang di keranjang belanja Anda"
```

### Complete Order Payment Flow
```
1. Domain selection:
   "✓ Domain tersedia! Lanjutkan pemilihan paket"
   
2. Checkout loading:
   "Memproses ringkasan pesanan..."
   
3. Order created:
   "✓ Pesanan dibuat. Lanjutkan ke pembayaran"
   
4. Payment email gate:
   "Email Anda belum terverifikasi. Verifikasi diperlukan untuk pembayaran"
   
5. Payment processing:
   "Membuka sistem pembayaran..."
   
6. Payment success:
   "✓ Pembayaran Berhasil! Terima kasih atas pemesanan. Mengarahkan ke invoice..."
```

---

## 🎓 TRAINING EXAMPLES

### Good Messaging ✅
```html
<div class="error-message">
  <h3>⚠️ Email Belum Diverifikasi</h3>
  <p>Email Anda belum diverifikasi. Verifikasi email diperlukan untuk melanjutkan pembayaran.</p>
  <p style="font-size: 14px; color: #666;">
    Email verifikasi telah dikirim ke: <strong>user@example.com</strong>
  </p>
  <a href="/auth/verify-email" class="btn">Buka Halaman Verifikasi</a>
</div>
```

### Poor Messaging ❌
```html
<div class="error-message">
  <p>Error: Email not verified</p>
</div>
```

### Explanation
- **Good:** Shows icon, clear problem, reason, verification method, and action button
- **Poor:** Too technical, no context, no solution path

---

## 📞 SUPPORT CONTACT INTEGRATION

### When to Show Support Contact
1. Critical errors that require help
2. Payment system failures
3. Account access issues
4. Domain/order disputes

### Support Contact Format
```
"Jika masalah berlanjut, silakan hubungi support kami:"
💬 WhatsApp: +62 812-1528-9095
📧 Email: support@sisitus.com
📞 Telepon: +62 812-1528-9095
```

---

## 🔄 VERSIONING & UPDATES

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 28 Mar 2026 | Initial guidelines created after messaging audit |
| | | - Professional tone standards defined |
| | | - Error/success patterns established |
| | | - Support contact integration documented |

**Next Review:** June 28, 2026 (quarterly)

---

## 📝 NOTES FOR TEAM

### Common Mistakes to Avoid
1. **Forgetting "next steps"** - Always tell users what to do next
2. **Vague error messages** - Always be specific about what went wrong
3. **Using technical terms** - Remember: users aren't developers
4. **Not anticipating concerns** - Think about what users worry about
5. **Skipping validation messages** - Help users fix errors in real-time

### Questions?
Contact: Product Team / UX Lead  
Review Process: Submit PR with messaging changes for review

---

**Last Updated:** March 28, 2026  
**Audience:** Full Development Team  
**Status:** Active - Follow these guidelines for all new development
