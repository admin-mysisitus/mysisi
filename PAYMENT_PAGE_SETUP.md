# Payment Page Setup Guide

**Status**: ✅ Complete  
**Date**: March 22, 2026

## What's New

Created complete payment page with:
- ✅ Order status display (pending, processing, completed, cancelled)
- ✅ Order summary with domain, package, and pricing
- ✅ Multiple payment methods (Bank Transfer, E-Wallet, WhatsApp)
- ✅ Bank account details for manual transfer
- ✅ Customer information display
- ✅ WhatsApp integration for quick contact
- ✅ Mobile responsive design
- ✅ Auto-loads order data from Google Sheets

## Quick Setup

### Step 1: Update Google Apps Script URL

**File**: [/assets/js/pages/payment.js](/assets/js/pages/payment.js)  
**Line**: ~13

Find this line:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID_HERE/usercontent';
```

Replace `YOUR_DEPLOYMENT_ID_HERE` with your actual deployment ID (same URL as checkout.js):
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/d/1ABcD_EfGhIj2KlMnOpQRstUV-WxYzAbCdEFgHiJkL/usercontent';
```

### Step 2: Update Admin WhatsApp Number

**File**: [/assets/js/pages/payment.js](/assets/js/pages/payment.js)  
**Line**: ~16

Find this line:
```javascript
const ADMIN_WHATSAPP = '62812345678'; // Replace with admin WhatsApp number
```

Replace with your actual WhatsApp number:
```javascript
const ADMIN_WHATSAPP = '6281234567890'; // Your WhatsApp number
```

**Format**: International format without + (replace 0 at start with 62)
- User's: 0812345678 → 6281234567890
- Your: 0811234567 → 62811234567

### Step 3: Update Bank Account Details

**File**: [/payment/index.html](/payment/index.html)  
**Lines**: ~178-190

Find the bank account section:
```html
<div class="account-item">
  <span class="bank-name">BCA</span>
  <span class="account-number">1234567890 (a.n. PT SISITUS)</span>
  <button class="btn-copy" onclick="copyToClipboard('1234567890')">
```

Update with your actual bank accounts:
```html
<div class="account-item">
  <span class="bank-name">BCA</span>
  <span class="account-number">YOUR_BCA_ACCOUNT (a.n. YOUR_COMPANY_NAME)</span>
  <button class="btn-copy" onclick="copyToClipboard('YOUR_BCA_ACCOUNT')">
```

## Data Flow

```
User submits checkout form
    ↓
POST to Google Apps Script
    ↓
Order saved to Google Sheets
    ↓
Redirect to /payment/{orderId}
    ↓
payment.js loads order ID from URL
    ↓
Fetch order data from Google Apps Script (getOrder endpoint)
    ↓
Display order summary & payment options
    ↓
User selects payment method:
  - Bank Transfer → Show account details
  - E-Wallet → Direct to WhatsApp for link
  - WhatsApp → Open WhatsApp chat with message
```

## Payment Methods Explained

### Bank Transfer
- Customer sees bank account details
- Copy button to easily copy account number
- Customer makes manual transfer
- Admin confirms payment manually via Google Sheet

### E-Wallet
- Currently redirects to WhatsApp for admin to send payment link
- Could be extended with Midtrans/Xendit integration

### WhatsApp
- Direct WhatsApp contact with admin
- Pre-filled message with order details
- Customer and admin can discuss payment method

## How Google Apps Script Retrieves Order

When payment page loads, it calls:
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent?action=getOrder&orderId=ORD-20260322-ABC123
```

Google Apps Script `doGet()` function:
1. Receives orderId from query parameter
2. Opens Google Sheet
3. Searches for row with matching Order ID
4. Returns order data as JSON

Response format:
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20260322-ABC123",
    "tanggal": "3/22/2026 10:30",
    "domain": "example.com",
    "paket": "Grower",
    "hargaPaket": 1299000,
    "total": 1598000,
    "namaCustomer": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "08812345678",
    "alamat": "Jln. Sudirman...",
    "status": "Pending",
    "createdAt": "2026-03-22T10:30:00Z"
  }
}
```

## Testing Payment Page

1. **Test URL format**: `/payment/ORD-20260322-ABC123`
2. **Manual test**: Enter any Order ID that exists in your Google Sheet
3. **From checkout**: Complete checkout to get real Order ID then navigate to payment page

### Test Steps:
1. Go to `http://localhost/payment/test-123`
   - Should show error "Order tidak ditemukan"
2. Create order via checkout
   - Get Order ID from success page
3. Go to `/payment/{ORDER_ID}`
   - Should display order data
   - Test bank transfer method
   - Test WhatsApp contact

## Browser Console Debugging

If page shows error, check browser console (F12):

```javascript
// Check if Google Apps Script URL is configured
console.log(GOOGLE_APPS_SCRIPT_URL);

// Check current order data
console.log(window.currentOrder);

// Check what happens when fetch fails
// Look for network error in Network tab
```

## Files Created/Modified

### Created:
- ✅ [/payment/index.html](/payment/index.html) - Payment page template
- ✅ [/assets/js/pages/payment.js](/assets/js/pages/payment.js) - Payment logic
- ✅ [/assets/css/components/payment.css](/assets/css/components/payment.css) - Payment styles

### Modified:
- ✅ [/api/orders-create.js](/api/orders-create.js) - Added `doGet()` and `getOrderByID()` functions

## Important Notes

⚠️ **Google Apps Script Update Required:**
- Need to re-deploy Google Apps Script after adding new functions
- Steps:
  1. Open Google Apps Script editor
  2. Confirm the updated code has `doGet()` and `getOrderByID()` functions (check if already there)
  3. If functions are new, Deploy > Update (not new deployment)
  4. No need to change deployment URL if updating existing deployment

❓ **Order ID Format:**
- All Order IDs are ORD-YYYYMMDD-ABC123
- Always 6 digits for date (20260322)
- Always 6 alphanumeric for random part

## Next Steps

1. ✅ Update Google Apps Script URL in payment.js
2. ✅ Update WhatsApp number in payment.js
3. ✅ Update bank accounts in index.html
4. ✅ Re-deploy Google Apps Script (update existing)
5. ✅ Test payment page with real order ID
6. 📋 Optional: Setup automatic payment status checking
7. 📋 Optional: Integrate Midtrans/Xendit for online payment

## Limitations & Enhancements

### Current (Manual):
- Uses Google Sheets only
- Manual payment confirmation
- WhatsApp for payment method discussion

### Future (Enhanced):
- Integrate payment gateway (Midtrans/Xendit)
- Automatic payment confirmation
- On-site payment form
- Email receipt generation
- Automatic domain registration after payment

---

**Ready?** → Complete the 3 configuration steps above, then test!
