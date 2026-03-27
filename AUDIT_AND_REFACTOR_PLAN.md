# AUDIT & REFACTOR PLAN: ORDER FLOW UPGRADE
**Date:** March 28, 2026  
**Status:** ANALYSIS & RECOMMENDATIONS  
**Scope:** Restructure checkout flow to match proposal_upgrade.md  

---

## 1. CURRENT SYSTEM ANALYSIS

### ✅ What Currently Exists
```
Homepage
  ├─ Domain search with "Amankan Sekarang" button
  ├─ Add to cart functionality (localStorage)
  └─ Redirects to login if needed

Cart Page (dashboard/cart)
  ├─ Shows cart items
  ├─ Displays prices
  ├─ Has "Lanjut ke Checkout" button
  └─ No inline login

Checkout Page (dashboard/checkout)
  ├─ Requires authentication
  ├─ Collects customer data
  ├─ Package selection (Starter, Professional, Business, Enterprise)
  ├─ Promo code field (not fully implemented)
  └─ Creates order and redirects to payment

Payment Page (dashboard/payment)
  ├─ Midtrans integration (skeleton)
  ├─ Order status display
  └─ Payment processing

Data Management
  ├─ CartManager (unified-cart.js) - localStorage based
  ├─ Basic persistence
  └─ No addon support
```

### ❌ What's Missing / Wrong

| Issue | Severity | Impact |
|-------|----------|--------|
| **NO ORDER SUMMARY PAGE** | CRITICAL | Users see checkout directly - no upsell opportunity |
| **ADDON SYSTEM MISSING** | HIGH | Can't sell DNS, Privacy, Email addons |
| **PROMO/COUPON INCOMPLETE** | HIGH | Discount logic exists but UI/UX broken |
| **NO GUEST CHECKOUT** | HIGH | Can't view summary without login - friction |
| **INLINE LOGIN MISSING** | HIGH | Users redirected away from cart - conversion loss |
| **DATA LOSS RISK** | HIGH | Login might clear localStorage cart items |
| **NO DOMAIN RECHECK** | MEDIUM | Domain availability not validated at checkout |
| **SINGLE SERVICE ONLY** | MEDIUM | System locked to domains only - can't extend |
| **REDIRECT FRICTION** | MEDIUM | Multiple redirects lose user context |
| **PRICE LOCKING** | LOW | Prices could change between pages |

---

## 2. PROPOSED NEW FLOW (from proposal_upgrade.md)

```
┌─────────────────────────────────────────────────────────────┐
│                    HOMEPAGE (Public)                         │
│  - Domain search box                                         │
│  - "Amankan Sekarang" button                                │
│  - Login button (top right)                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Choose path)
                     ┌────┴────┐
                     ↓         ↓
        ┌─────────────────┐  ┌──────────────────┐
        │  LOGIN PAGE     │  │ ORDER SUMMARY*   │
        │ (if clicked)    │  │ (Guest Allowed)  │
        └────────┬────────┘  └────────┬─────────┘
                 │                     │
                 └─────────────┬───────┘
                               ↓
        ┌──────────────────────────────────────────┐
        │   CART PAGE (Login Required)             │
        │  - Inline login form if not auth         │
        │  - Cart items + addons                   │
        │  - Price summary                         │
        │  - Promo code field                      │
        │  - Checkout button                       │
        └──────────┬───────────────────────────────┘
                   ↓
        ┌──────────────────────────────────────────┐
        │   ORDER CREATION (Checkout)              │
        │  - Confirm items                         │
        │  - Billing address                       │
        │  - Payment method selection              │
        └──────────┬───────────────────────────────┘
                   ↓
        ┌──────────────────────────────────────────┐
        │   INVOICE & PAYMENT (Midtrans)           │
        │  - Payment gateway                       │
        │  - Success/Pending callback              │
        └──────────────────────────────────────────┘

* = NEW PAGE (Order Summary)
```

---

## 3. GAP ANALYSIS: Current → Proposed

### 3.1 ARCHITECTURE GAPS

#### Page Structure
| Requirement | Current | Status | Action |
|-------------|---------|--------|--------|
| Order Summary Page | ❌ Missing | CRITICAL | **CREATE** `/dashboard/views/order-summary.html` |
| Guest Access to Summary | ❌ Missing | HIGH | **ENABLE** public access (no auth check) |
| Cart Inline Login | ❌ Missing | HIGH | **ADD** login form to cart.html |
| Single-Service System | ✅ Domain only | MEDIUM | **REFACTOR** for multi-service (future) |
| Domain Recheck at Checkout | ❌ Missing | MEDIUM | **ADD** availability check on order-summary |

#### Data Management
| Requirement | Current | Status | Action |
|-------------|---------|--------|--------|
| Addon Storage | ❌ Missing | HIGH | **EXTEND** CartManager.addons field |
| Promo Application | ⚠️ Partial | HIGH | **COMPLETE** promo logic in cart |
| Data Persistence (Pre-login) | ✅ localStorage | GOOD | KEEP - already working |
| Data Survival After Login | ⚠️ Risky | MEDIUM | **VERIFY** cart doesn't clear on login |

#### Flow Control
| Requirement | Current | Status | Action |
|-------------|---------|--------|--------|
| No Redirect Friction | ⚠️ Multiple redirects | MEDIUM | **REDUCE** to single-page flows |
| Inline Auth vs Redirect | ❌ Redirect only | HIGH | **IMPLEMENT** inline login in cart |
| Guest → Auth Transition | ⚠️ Loses data | MEDIUM | **TEST** localStorage survives login |

---

## 4. RECOMMENDED CHANGES

### 4.1 FILES TO CREATE

```
📄 dashboard/views/order-summary.html
   Purpose: Display order details with addons/promo
   Features: Guest accessible, price display, addon selection
   Auth: PUBLIC (no login required)

📄 dashboard/js/modules/order-summary.js
   Purpose: Handle order summary page logic
   Exports: render(currentUser) function (currentUser can be null)
   Features: Load from cart, addon UI, promo display

📄 assets/js/modules/addon-manager.js
   Purpose: Manage addons (DNS, Privacy, Email, etc.)
   Methods: add(), remove(), get(), calculate()
   Storage: localStorage['addons']

📄 pages/order-summary.html (PUBLIC)
   Purpose: Guest-accessible order summary (NOT in /dashboard)
   Auth: PUBLIC
   Features: Search result → Order summary → Cart (with login)
```

### 4.2 FILES TO REFACTOR

**assets/js/modules/unified-cart.js**
```
ADD:
  - addons: [] field to store selected addons
  - getTotal(includeAddons = true)
  - applyPromo(code)
  - hasPromo()
  - validateAvailability() - recheck domain

IMPROVE:
  - Better error handling
  - Data validation
  - Type checking
```

**dashboard/js/modules/cart.js**
```
ADD:
  - Inline login form rendering
  - Login handler (async)
  - Addon selection UI
  - Promo code validation UI
  - Real-time total recalculation

REFACTOR:
  - Remove redirect to login
  - Add auth check inline
  - Cleaner HTML structure
```

**dashboard/views/cart.html**
```
ADD:
  - Login form container (hidden by default)
  - Addon section
  - Promo input with validation feedback
  - Better visual hierarchy

REMOVE:
  - "Lanjut ke Checkout" button redirect logic
```

**dashboard/js/dashboard-app.js**
```
ADD:
  - Route: '/dashboard/order-summary' (PUBLIC access)
  - Auth bypass for public routes
```

**assets/js/pages/auth.js**
```
MODIFY:
  - After login check localStorage for cart data
  - DO NOT clear cart on login
  - Pass cart data to dashboard redirect
```

### 4.3 FILES TO DELETE / DEPRECATE

| File | Reason | Action |
|------|--------|--------|
| `dashboard/views/checkout.html` | Consolidate with order-summary | REFACTOR (move logic to order-summary) |
| N/A | Most code stays, but restructured | - |

### 4.4 CONFIGURATION CHANGES

**assets/js/config/api.config.js**
```javascript
ADD ADDON_PACKAGES = {
  dns_management: { id: 'dns', name: 'DNS Management', price: 0, duration: 1 },
  privacy_protection: { id: 'privacy', name: 'Privacy Protection', price: 6625, duration: 1 },
  email_2gb: { id: 'email_2gb', name: 'Email 2GB', price: 5000, duration: 1 },
  email_10gb: { id: 'email_10gb', name: 'Email 10GB', price: 15000, duration: 1 }
}

ADD PROMO_CODES = {
  'GRATIS1DOMAIN': { discount: 100, type: 'percent', maxUse: 100 },
  'RIBA10': { discount: 10, type: 'percent', maxUse: 50 }
}
```

---

## 5. PRIORITY IMPLEMENTATION ROADMAP

### Phase 1: FOUNDATION (Critical)
```
PRIORITY 1: Create order-summary route & page
  └─ Enable public access
  └─ Display domain + price
  └─ Add to cart button

PRIORITY 2: Extend CartManager with addons
  └─ Add addons[] field
  └─ Add addon methods
  └─ Recalculate totals

PRIORITY 3: Implement inline login in cart
  └─ Add login form to cart.html
  └─ Handle auth inline
  └─ Avoid redirects
```

### Phase 2: ENHANCEMENT (High)
```
PRIORITY 4: Addon UI in Order Summary
  └─ Display available addons
  └─ Price display
  └─ Add/remove addon logic

PRIORITY 5: Promo code full implementation
  └─ Validate promo
  └─ Apply discount
  └─ Show discount breakdown

PRIORITY 6: Domain recheck at summary
  └─ API call to verify availability
  └─ Warn if taken
  └─ Prevent ordering unavailable
```

### Phase 3: INTEGRATION (Medium)
```
PRIORITY 7: Refactor checkout page
  └─ Merge with order-summary flow
  └─ Clean up redundant pages
  └─ Optimize navigation

PRIORITY 8: Payment integration
  └─ Include addons in Midtrans payload
  └─ Send complete order with addons
  └─ Handle addon-based pricing
```

### Phase 4: OPTIMIZATION (Low priority, future-proofing)
```
PRIORITY 9: Multi-service support
  └─ Generic service/addon model
  └─ Not domain-specific
  └─ Ready for website builder, SSL, etc.

PRIORITY 10: Analytics & tracking
  └─ Track cart abandonment
  └─ Monitor addon selection rates
  └─ Promo effectiveness
```

---

## 6. DATA FLOW DIAGRAM: PROPOSED SYSTEM

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser Storage                             │
│  localStorage['cart'] = {                                       │
│    domains: [{domain, tld, price, package, duration}],         │
│    addons: [{id, name, price}],                                │
│    promo: {code, discount},                                    │
│    timestamp                                                    │
│  }                                                              │
└──────────────┬────────────────────────────────┬─────────────────┘
               │ Read/Write                     │
         ┌─────┴──────────┐              ┌──────┴──────────────┐
         │  CartManager   │              │ PromoManager        │
         │ (unified-cart) │              │ (new addon module)  │
         └─────┬──────────┘              └──────┬──────────────┘
               │                                 │
         ┌─────┴────────────────────────────────┴──────┐
         │       UI Layer Modules                      │
         │  - order-summary.js                        │
         │  - cart.js                                 │
         │  - addon-manager.js                        │
         └──────┬───────────────────────────────┬─────┘
                │ Data Display                  │ Data Update
         ┌──────┴────────────┐          ┌──────┴────────────┐
         │   Order Summary   │          │   Cart Page       │
         │   (public)        │          │   (auth req'd)    │
         └───────────────────┘          └───────────────────┘
```

---

## 7. RISK ANALYSIS & MITIGATION

### Risk 1: Data Loss on Login
**Problem:** Cart data cleared when user authenticates  
**Probability:** HIGH (localStorage isolated per domain)  
**Mitigation:**
- Verify localStorage persists after login
- Save cart to backend immediately after login
- Test cross-tab data sync

### Risk 2: Duplicate Orders from Multiple Addons
**Problem:** User adds addon same as base package  
**Probability:** LOW  
**Mitigation:**
- Validate addon doesn't duplicate package features
- Show clear addon descriptions
- Price breaks show what's included

### Risk 3: Promo Code Abuse
**Problem:** Invalid codes submitted, or overuse  
**Probability:** MEDIUM  
**Mitigation:**
- Backend validation (not client-side)
- Rate limit promo checks
- Track promo usage per user
- Set max redemptions

### Risk 4: Domain Availability Changes
**Problem:** Domain available at summary but taken by checkout  
**Probability:** MEDIUM  
**Mitigation:**
- Recheck availability every 60 seconds
- Lock domain for 5 minutes after selection
- Show warning if not available
- Prevent order creation if unavailable

### Risk 5: Multiple Service Types Conflict
**Problem:** Only domain support now, system needs multi-service future  
**Probability:** MEDIUM (future risk)  
**Mitigation:**
- Use generic "service" model now
- Service type in CartManager
- Not domain-specific code paths
- Ready for refactor to websites, SSL, etc.

---

## 8. TESTING CHECKLIST

### User Flow Testing
- [ ] Guest visits homepage → searches domain → clicks "Amankan Sekarang"
- [ ] Redirects to ORDER SUMMARY (public page)
- [ ] Can add addons in summary (DNS, Privacy, Email)
- [ ] Can apply promo code in summary
- [ ] Clicks "Tambahkan ke Troli" → redirects to CART
- [ ] Cart shows all items (domain + addons)
- [ ] Domain available recheck completes
- [ ] If not logged in, inline login form appears
- [ ] User logs in, data preserved
- [ ] Can proceed to checkout
- [ ] Order created with all addons
- [ ] Payment page shows correct total (domain + addons)
- [ ] After payment, invoice includes addons

### Edge Cases
- [ ] Add addon → remove addon → total recalculates
- [ ] Apply promo → total shows discount breakdown
- [ ] Invalid promo code → error message
- [ ] Domain becomes unavailable → warning shown
- [ ] Multiple tabs open → cart syncs across tabs
- [ ] Login in different tab → cart persists
- [ ] Clear localStorage → empty cart works

### Data Integrity
- [ ] localStorage['cart'] survives login
- [ ] Addons array properly structured
- [ ] Prices locked during checkout
- [ ] Promo discount calculated correctly
- [ ] Domain name preserved exactly

---

## 9. IMPLEMENTATION SUMMARY

| Phase | Tasks | Timeline | Files |
|-------|-------|----------|-------|
| **1** | Core structure (order-summary, CartManager addons) | 1-2 hrs | 3 files |
| **2** | UI & inline login (cart addon UI, login form) | 2-3 hrs | 4 files |
| **3** | Business logic (promo, recheck, validation) | 2-3 hrs | 3 files |
| **4** | Integration & testing | 1-2 hrs | 2 files |
| **TOTAL** | Full implementation | 6-10 hrs | 12 files |

---

## 10. SUCCESS CRITERIA

- ✅ Guest can view order summary without login
- ✅ Addons selectable and add to total
- ✅ Promo codes apply with discount shown
- ✅ Inline login in cart (no redirects)
- ✅ Cart data survives login
- ✅ Domain availability rechecked
- ✅ Price locked throughout flow
- ✅ Zero conversion loss from friction
- ✅ All data properly stored/retrieved
- ✅ Mobile responsive

---

## 11. NEXT STEPS

1. **Approve Plan** - Review this audit document
2. **Phase 1 Implementation** - Create core files
3. **Phase 2 Implementation** - Add UI & login
4. **Testing** - Verify all flows work
5. **Deployment** - Push to production
6. **Monitor** - Track conversion metrics

---

**END OF AUDIT DOCUMENT**
