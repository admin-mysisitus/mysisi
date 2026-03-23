# Authentication System - Comprehensive Analysis Report
**Generated:** March 23, 2026

---

## EXECUTIVE SUMMARY

The authentication system has multiple architectural issues that could cause bugs, maintenance difficulties, and inconsistent behavior. While the core functionality works, there are **duplicate implementations**, **missing imports**, **incomplete utilities**, and **module loading conflicts** that need to be refactored.

**Critical Issues to Fix:** 3  
**Important Issues to Address:** 5  
**Warnings/Optimizations:** 7

---

## 1. SYSTEM STRUCTURE OVERVIEW

### Auth Files Inventory

```
auth/ (HTML)
  ├── index.html              ✅ Main login/register page
  ├── forgot-password.html    ✅ Password reset request
  ├── reset-password.html     ✅ Password reset (with token validation)
  └── verify-email.html       ✅ Email verification (auto-redirect)

assets/js/pages/
  ├── auth.js                 ✅ Main auth module (exports: handleLogout, isUserLoggedIn, getCurrentUser, redirectToLogin)
  ├── checkout.js             ✅ Checkout logic (DUPLICATES userAuth from sessionStorage)
  └── profile.js              ✅ Profile management (DUPLICATES userAuth from sessionStorage)

assets/js/config/
  ├── api.config.js           ✅ GAS endpoints, Midtrans, packages (GAS_CONFIG, DOMAIN_PACKAGES)
  ├── api-wrapper.js          ✅ API client wrapper with error handling (AuthAPI, OrderAPI, PaymentAPI)
  ├── domain-config.js        ✅ Domain extensions and pricing

assets/js/utils/
  ├── notifications.js        ✅ Global notifications (exports + window.Notifications)
  ├── formatting.js           ⚠️  NO WINDOW EXPORT (uses module.exports, breaks in browser)
  └── (missing auth utils)    ❌ No centralized auth-related utilities

api/
  └── orders-create.js        ✅ GAS backend with auth functions
```

---

## 2. CRITICAL ISSUES

### ❌ ISSUE #1: Missing Imports in profile.js
**Severity:** CRITICAL  
**File:** [assets/js/pages/profile.js](assets/js/pages/profile.js#L1-L20)  
**Problem:** 
- Imports ONLY `GAS_CONFIG` from api.config.js
- Uses `userAuth` directly on **line 16** without importing from auth.js
- References `Notifications` (line 49) without import → relies on classically-loaded notifications.js
- References `Formatting` (line 394) without import → will fail because formatting.js doesn't expose window.Formatting object

```javascript
// ❌ CURRENT (BROKEN):
import { GAS_CONFIG } from '../config/api.config.js';
// ... 
document.addEventListener('DOMContentLoaded', async () => {
  if (!userAuth || !userAuth.isLoggedIn) {  // ❌ undefined variable!
```

**Impact:** 
- `userAuth` is undefined in ES6 module scope
- Profile page won't authenticate users properly
- `Formatting.formatRupiah()` will throw error on line 394

**Fix Required:**
```javascript
// ✅ CORRECT:
import { GAS_CONFIG } from '../config/api.config.js';
import { getCurrentUser, isUserLoggedIn } from './auth.js';
// Then use:
if (!isUserLoggedIn()) {
  window.location.href = '/verify-email.html';
}
const userAuth = getCurrentUser();
```

---

### ❌ ISSUE #2: formatting.js Uses CommonJS in Browser Context
**Severity:** CRITICAL  
**File:** [assets/js/utils/formatting.js](assets/js/utils/formatting.js#L122-L130)  
**Problem:**
- Uses `module.exports` at end of file
- Loaded as classical `<script>` tag in [profile/index.html](profile/index.html#L259)
- No `window.Formatting` object created (unlike notifications.js)
- profile.js tries to call `Formatting.formatRupiah()` → **Will throw ReferenceError**

```javascript
// ❌ CURRENT (CommonJS - breaks in browser):
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatRupiah,
    // ...
  };
}

// ❌ Missing:
// window.Formatting = { ... };
```

**Impact:**
- Line 394 in profile.js: `Formatting.formatRupiah(order.total)` → TypeError
- Line 433 in profile.js: `Formatting.formatRupiah(stats.totalSpent)` → TypeError

**Fix Required:** Add window export:
```javascript
// ✅ At end of formatting.js:
window.Formatting = {
  formatRupiah,
  formatNumber,
  formatDate,
  formatDateWithTime,
  calculateDiscount,
  getTimeAgo,
  sanitizeHTML
};
```

---

### ❌ ISSUE #3: password validation functions in auth.js aren't exported/available
**Severity:** CRITICAL  
**File:** [auth/reset-password.html](auth/reset-password.html#L280-L350)  
**Problem:**
- reset-password.html defines inline functions: `togglePasswordVisibility()`, `checkPasswordStrength()`, `validatePasswordMatch()`
- These functions are hardcoded in HTML (not in a module)
- Could be orphaned if HTML is refactored

**Impact:**
- No centralized password validation logic
- Duplicate code across multiple password-reset pages
- Maintenance nightmare if validation rules change

---

## 3. IMPORTANT ISSUES (Non-Critical)

### ⚠️ ISSUE #A: Incomplete Implementations in checkout.js
**File:** [assets/js/pages/checkout.js](assets/js/pages/checkout.js#L399-L403)  
**Problem:**
```javascript
addons: [], // TODO: Add addon selection logic if available
promoCode: '', // TODO: Add promo code if available
// ...
discount: 0, // TODO: Apply promo discount if available
```
- Promo code validation exists in GAS but not integrated in checkout
- Discount calculation incomplete

---

### ⚠️ ISSUE #B: Duplicate userAuth State
**Files:** 
- [auth.js](assets/js/pages/auth.js#L15-L25) - Maintains module-level `userAuth` object
- [checkout.js](assets/js/pages/checkout.js#L342-L344) - Reads from sessionStorage, creates local `userAuth`
- [profile.js](assets/js/pages/profile.js#L15) - References global `userAuth` (broken)

**Problem:**
- Each file manages its own copy of user state
- If user logs out from one page, others don't know
- No single source of truth
- Inconsistent implementation patterns

**Solution:** Export from auth.js, import elsewhere:
```javascript
// ✅ Create: assets/js/utils/auth-utils.js
export function getUserSession() {
  return JSON.parse(sessionStorage.getItem('sisitus_user'));
}

export function setUserSession(user) {
  sessionStorage.setItem('sisitus_user', JSON.stringify(user));
}

export function clearUserSession() {
  sessionStorage.removeItem('sisitus_user');
}
```

---

### ⚠️ ISSUE #C: Incomplete Password Reset Implementation in GAS
**File:** [api/orders-create.js](api/orders-create.js#L1068)  
**Problem:**
```javascript
// TODO: Replace with bcrypt in production
```
- Password handling uses plain-text comparison in sandbox
- No bcrypt integration
- Reset token generation exists but handling incomplete

---

### ⚠️ ISSUE #D: Missing loginUser Implementation Details
**File:** [api/orders-create.js](api/orders-create.js)  
**Problem:**
- `loginUser()` function is referenced but exact implementation not visible in read output
- Password validation logic unclear
- No account lock-out after failed attempts

---

### ⚠️ ISSUE #E: verifyGoogleToken Not in orders-create.js
**File:** [assets/js/pages/auth.js](assets/js/pages/auth.js#L270-L295)  
**Problem:**
- auth.js calls `callGAS('verifyGoogleToken', {...})` 
- This action is not defined in orders-create.js doGet/doPost handlers
- Will fail with "unknown action" error

---

## 4. ARCHITECTURAL PROBLEMS

### Problem A: No Centralized Auth Context
**Current State:** Each page independently manages auth
```
auth.js ──→ userAuth (module scope)
checkout.js ──→ userAuth (local scope from sessionStorage)
profile.js ──→ userAuth (undefined, should import from auth.js)
```

**Needed:** Single source of truth
```
sessionStorage ──→ 'sisitus_user' (single source)
                      ↓
                   {auto-imported by all modules}
```

### Problem B: jQuery-Free BUT Not Fully ES6 Modular
- Some files are ES6 modules (import/export)
- Some files are classical scripts loaded via `<script>`
- Mixed approach = inconsistent error handling

**Files using mixed approach:**
- [checkout/index.html](checkout/index.html) - imports ES6 modules but also loads classical scripts
- [profile/index.html](profile/index.html) - imports auth.js but loads formatting.js as classical script

### Problem C: Wrong API Wrapper Being Used
**Defined in:** [assets/js/config/api-wrapper.js](assets/js/config/api-wrapper.js)  
**Provides:** `AuthAPI`, `OrderAPI`, `DomainAPI`, `PaymentAPI` objects

**But auth.js doesn't use it!**
- auth.js implements its own `callGAS()` function
- Duplicates API call logic
- Doesn't use error handling from `api-wrapper.js`

---

## 5. MISSING IMPLEMENTATIONS

### Missing: Password Reset Functions in GAS
**Status:** Partially implemented  
**Missing Actions in orders-create.js:**
- `resetPassword` action exists but incomplete
- `requestPasswordReset` handler visible
- `validateResetToken` handler visible

### Missing: User Profile Functions in GAS
**Status:** Partially implemented
- `getUserProfile` action missing implementation details
- `updateUserProfile` action missing
- `changePassword` action missing

### Missing: Email Verification in GAS
- `verifyEmailToken` handler exists (line ~900)
- But implementation may be incomplete

---

## 6. USAGE & IMPORT ANALYSIS

### Where auth.js is Imported
```
✅ profile/index.html (line 263)
✅ orders/index.html (line 184)
✅ orders/detail/index.html (line 245)
✅ auth/index.html (imports via <script type="module">)
```

### Which Files Use sessionStorage for Auth
```
✅ auth.js - Sets sessionStorage.setItem('sisitus_user')
✅ checkout.js - Reads sessionStorage.getItem('sisitus_user')
⚠️ profile.js - Tries to use `userAuth` (undefined)
```

### Exported Functions NOT Being Used
From [auth.js](assets/js/pages/auth.js#L387-L398):
```javascript
export function isUserLoggedIn() { ... }
export function getCurrentUser() { ... }
export function redirectToLogin(returnTo) { ... }
export function handleLogout() { ... }
```

**Usage Count:**
- `isUserLoggedIn()` - 0 uses (should be used in profile.js!)
- `getCurrentUser()` - 0 uses (should be used in profile.js!)
- `redirectToLogin()` - 0 uses (implemented manually in checkout.js)
- `handleLogout()` - 0 uses (profile.js implements own logout)

---

## 7. INCONSISTENCIES & DUPLICATIONS

### Duplicate Auth State Management

| Task | auth.js | checkout.js | profile.js |
|------|---------|-------------|-----------|
| Load from sessionStorage | ✅ Line 40 | ✅ Line 31 | ❌ Missing |
| Save to sessionStorage | ✅ Line 234 | N/A | N/A |
| Parse userAuth | ✅ | ✅ (local) | ❌ Undefined |
| Login redirect | ✅ | ✅ | ❌ N/A |

### Duplicate API Call Implementation
- auth.js has own `callGAS()` (line 354-369)
- api-wrapper.js has `API.call()` (same purpose)
- checkout.js uses fetch directly
- No standardization

---

## 8. FRONTEND-BACKEND MISMATCH

### Missing GAS Actions
**Called from Frontend but not defined in GAS:**
- `verifyGoogleToken` (auth.js line 270)

**Defined in GAS but never called from frontend:**
- `createOrderWithAuth` (orders-create.js doPost - defined but might not be called)

### Package ID Validation Sync
**Frontend:** [api.config.js](assets/js/config/api.config.js#L80)
```javascript
export const VALID_PACKAGE_IDS = ['starter', 'professional', 'business', 'enterprise'];
```

**Backend:** [orders-create.js](api/orders-create.js#L119)
```javascript
const validPackages = ['starter', 'professional', 'business', 'enterprise'];
```

✅ **Synchronized** - Both match

---

## 9. ORPHANED & UNNECESSARY CODE

### Orphaned Functions
- Password validation functions in reset-password.html (inline)
- Multiple `showLoggedInState()` implementations
- `formatNumber()` in profile.js (line 456) - unused, duplicate of Formatting.formatNumber()

### Unused Exported Functions
From auth.js:
- `isUserLoggedIn()` - defined but never imported elsewhere
- `getCurrentUser()` - defined but never imported elsewhere
- `redirectToLogin()` - defined but never used

### Unnecessary Files
None identified, but:
- domain-config.js is loaded on every page even if not needed
- api-wrapper.js exports are never used from auth.js

---

## 10. DETAILED FINDINGS TABLE

| Issue | File | Line | Severity | Type | Status |
|-------|------|------|----------|------|--------|
| userAuth undefined | profile.js | 16 | CRITICAL | Missing Import | Need Fix |
| Missing window.Formatting | formatting.js | 122 | CRITICAL | Module Export | Need Fix |
| verifyGoogleToken missing | orders-create.js | - | CRITICAL | Missing GAS Action | Need Add |
| Incomplete password reset | orders-create.js | 1068 | HIGH | TODO/Incomplete | Need Complete |
| Duplicate userAuth | checkout.js + profile.js | 342, 16 | HIGH | Architecture | Need Refactor |
| No centralized auth utils | - | - | MEDIUM | Architecture | Need Create |
| Unused exported functions | auth.js | 387-398 | MEDIUM | Code Smell | Can Remove |
| missing loginUser impl | orders-create.js | - | HIGH | Missing Code | Need Check |
| Missing password hashing | orders-create.js | 1068 | CRITICAL | Security | Need Complete |
| Promo code incomplete | checkout.js | 400 | LOW | Incomplete Feature | In Progress |

---

## 11. RECOMMENDED FIXES (Priority Order)

### Priority 1 (CRITICAL - Breaking Bugs)
1. ✅ Fix formatting.js window export
2. ✅ Fix profile.js imports (userAuth, Formatting)
3. ✅ Implement verifyGoogleToken in GAS
4. ✅ Complete password hashing in GAS

### Priority 2 (IMPORTANT - Architecture)
5. ✅ Create centralized auth-utils.js
6. ✅ Refactor userAuth state management
7. ✅ Use exported functions from auth.js
8. ✅ Complete inline password validation functions

### Priority 3 (NICE-TO-HAVE - Code Quality)
9. ✅ Consolidate password validation
10. ✅ Remove unused exported functions or document why they exist
11. ✅ Complete promo code integration
12. ✅ Add request time-out handling consistently

---

## 12. TESTING COVERAGE NEEDED

### Authentication Flow Tests
- [ ] Login with email/password
- [ ] Google OAuth sign-in
- [ ] Register new account
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Session persistence across pages
- [ ] Logout functionality
- [ ] Redirect after login (return URL)

### Integration Tests
- [ ] Profile page loads with correct user data
- [ ] Checkout requires login
- [ ] Order creation with authenticated user
- [ ] Profile updates reflected in orders

### API Tests
- [ ] All GAS endpoints respond correctly
- [ ] Error handling for network timeouts
- [ ] Token generation for Midtrans
- [ ] Email notifications sent

---

## 13. CONFIGURATION CHECKLIST

### GAS Backend Needs
- [ ] Google Sheet "Orders" with correct columns
- [ ] Google Sheet "Users" sheet created
- [ ] Midtrans credentials in Script Properties
- [ ] verifyGoogleToken function implemented
- [ ] Password hashing logic (bcrypt simulation or actual bcrypt)
- [ ] Email verification token generation

### Frontend Needs
- [ ] Google OAuth Client ID set in auth/index.html
- [ ] GAS_CONFIG.URL updated with correct deployment URL
- [ ] MIDTRANS_CONFIG keys in environment

---

## SUMMARY

**Current State:** Functional but fragile (7-8 issues, mostly fixable)

**Critical Blockers:** 
1. profile.js won't work due to missing imports
2. formatting.js won't expose functions
3. Google OAuth token verification missing in GAS

**Estimated Fix Time:** 2-3 hours for all issues

**Recommendation:** Refactor before entering production to prevent maintenance issues.

