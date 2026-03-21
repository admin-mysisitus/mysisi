# Google Sheets Integration - Quick Reference

**Status**: ✅ Complete  
**Date**: March 22, 2026

## Changes Made

### 1. Updated checkout.js

**What Changed**: Modified `processCheckout()` function to send POST requests to Google Apps Script instead of `/api/orders/create`

**File**: [/assets/js/pages/checkout.js](/assets/js/pages/checkout.js)  
**Lines**: ~365-380

**Before**:
```javascript
const response = await fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});
```

**After**:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent';

const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify(orderData)
});
```

**Action Required**: Update `{DEPLOYMENT_ID}` with your actual Google Apps Script deployment ID

---

### 2. Updated api/orders-create.js

**What Changed**: Replaced Node.js/Express code with Google Apps Script code

**File**: [/api/orders-create.js](/api/orders-create.js)

**New Functions**:
- `doPost(e)` - Main handler for POST requests from checkout
- `doGet(e)` - Simple GET handler (testing)
- `generateOrderId()` - Creates unique Order ID (ORD-YYYYMMDD-ABC123)
- `validateEmail()` - Validates email format
- `validatePhone()` - Validates Indonesian phone (08xxxxxxxxxx)
- `validateDomain()` - Validates domain format
- `validateOrderData()` - Full order data validation
- `saveOrderToSheet()` - Appends order to Google Sheet
- `sendOrderNotification()` - Sends emails to customer + admin
- `testOrderCreation()` - Testing function

**Configuration Variables**:
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';  // UPDATE THIS
const SHEET_NAME = 'Orders';                         // Don't change
const ADMIN_EMAIL = 'admin@example.com';             // UPDATE THIS
```

---

### 3. New File: GOOGLE_SHEETS_SETUP_GUIDE.md

**File**: [GOOGLE_SHEETS_SETUP_GUIDE.md](GOOGLE_SHEETS_SETUP_GUIDE.md)

**Purpose**: Complete step-by-step setup guide for:
- Creating Google Sheet with proper columns
- Setting up Google Apps Script
- Deploying as Web App
- Configuring checkout.js with deployment URL
- Testing process
- Troubleshooting common errors

**Read this first to setup Google Sheets integration**

---

## Implementation Checklist

### Prerequisites
- [ ] Google Account (Gmail)
- [ ] Access to create Google Sheets
- [ ] Access to create Google Apps Scripts

### Setup Steps
- [ ] **Step 1**: Create Google Sheet named "SISITUS Orders"
- [ ] **Step 2**: Add column headers to "Orders" sheet
- [ ] **Step 3**: Copy Google Apps Script code to Script Editor
- [ ] **Step 4**: Update `SPREADSHEET_ID` in Google Apps Script
- [ ] **Step 5**: Update `ADMIN_EMAIL` in Google Apps Script
- [ ] **Step 6**: Deploy Google Apps Script as Web App
- [ ] **Step 7**: Copy Deployment URL
- [ ] **Step 8**: Update `GOOGLE_APPS_SCRIPT_URL` in checkout.js
- [ ] **Step 9**: Test with testOrderCreation()
- [ ] **Step 10**: End-to-end test from checkout

### Testing
- [ ] Manual API test using testOrderCreation()
- [ ] Browser test: Search domain → Click checkout → Fill form → Submit
- [ ] Verify data appears in Google Sheet
- [ ] Verify emails received (customer + admin)
- [ ] Test with multiple domains and packages
- [ ] Verify Order ID format (ORD-YYYYMMDD-ABC123)

---

## Configuration Quick Copy

After you get your values, copy-paste this into Google Apps Script:

```javascript
// ============ UPDATE THESE ============
const SPREADSHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'Orders';
const ADMIN_EMAIL = 'your.email@gmail.com';
// =====================================
```

After you deploy, copy-paste this into checkout.js:

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/PASTE_YOUR_DEPLOYMENT_ID_HERE/usercontent';
```

---

## Data Flow (Simplified)

```
Checkout Form
    ↓
Click "Lanjutkan ke Pembayaran"
    ↓
POST to Google Apps Script URL
    ↓
Google Apps Script validates data
    ↓
Saves to Google Sheet
    ↓
Sends 2 emails (customer + admin)
    ↓
Returns { success: true, orderId: "ORD-..." }
    ↓
Redirect to /payment/{orderId}
```

---

## Expected Email Format

**To Customer**:
```
Subject: Pesanan Anda Diterima - example.com

Detail Pesanan:
- Order ID: ORD-20260322-ABC123
- Domain: example.com
- Paket: Grower
- Total: Rp 1.598.000

Kami akan segera menghubungi Anda melalui WhatsApp...
```

**To Admin**:
```
Subject: [NEW ORDER] ORD-20260322-ABC123 - example.com

Order ID: ORD-20260322-ABC123
Domain: example.com
Paket: Grower
Total: Rp 1.598.000

Customer: Budi Santoso
...
```

---

## Expected Google Sheet Format

| Order ID | Tanggal Order | Domain | Paket | Harga Paket | Total | Nama | Email | Phone | Alamat | Status | Created At |
|----------|---|---|---|---|---|---|---|---|---|---|---|
| ORD-20260322-ABC123 | 3/22/2026 10:30 | example.com | Grower | 1299000 | 1598000 | Budi Santoso | budi@example.com | 08812345678 | Jln... | Pending | 2026-03-22T10:30:00Z |

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Gagal memproses pesanan" | Check if GOOGLE_APPS_SCRIPT_URL is correct |
| Data not in Sheet | Check SPREADSHEET_ID in Google Apps Script |
| Emails not received | Check ADMIN_EMAIL, verify Gmail account can send |
| "Sheet Orders tidak ditemukan" | Rename sheet to "Orders" (case-sensitive) |
| Validation errors in console | Check order data format in checkout.js |

---

## Files Modified

✅ `/assets/js/pages/checkout.js`  
✅ `/api/orders-create.js`  
✅ `/checkout/index.html` (no changes needed)  
✅ `/assets/css/components/checkout.css` (no changes needed)  

## Files Created

✅ `GOOGLE_SHEETS_SETUP_GUIDE.md` - Complete setup guide  
✅ `GOOGLE_SHEETS_QUICK_REFERENCE.md` - This file  

## Existing Documentation

✅ `CHECKOUT_TESTING_GUIDE.md` - Testing & validation guide  
✅ `CEK_DOMAIN_AUDIT_DETAILED.md` - Original audit (still valid)  

---

## Next Steps

1. **Immediate**: Follow GOOGLE_SHEETS_SETUP_GUIDE.md to setup
2. **Test**: Run testOrderCreation() and end-to-end test
3. **Monitor**: Check Google Sheet for new orders
4. **Future**: Setup payment page at `/payment/{orderId}`

---

**Ready to Start?** → Read [GOOGLE_SHEETS_SETUP_GUIDE.md](GOOGLE_SHEETS_SETUP_GUIDE.md)
