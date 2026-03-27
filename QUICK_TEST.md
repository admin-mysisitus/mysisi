# 🧪 QUICK TEST - Auth Login Flow

## 1️⃣ CLEAR CACHE
```
Ctrl + Shift + Delete → Clear all data
```

## 2️⃣ OPEN DEV TOOLS
```
F12 atau Right Click → Inspect
```

## 3️⃣ GO TO CONSOLE TAB
```
Click "Console" tab
```

## 4️⃣ NAVIGATE TO AUTH PAGE
```
http://127.0.0.1:5500/auth/ 
(atau domain Anda)
```

## 5️⃣ REFRESH & CHECK CONSOLE
```
Refresh page (F5)
Wait 2-3 seconds
```

## ✅ EXPECTED CONSOLE OUTPUT
```
[Navigation] Navigation elements not found on this page - skipping initialization
[Auth Google] SDK loaded, initializing...
[Auth Google] Google Sign-In button rendered
[Auth Google] Google Sign-In ready
```

---

## 🔴 IF YOU SEE ERROR

| Error | Solution |
|-------|----------|
| `callback is not a function` | Hard refresh (Ctrl+F5), Clear cache again |
| `initialize() is called multiple times` | Should not happen now, refresh page |
| `Failed to fetch` | Verify GAS doGet deployed, check network tab |
| `CORS policy error` | Verify APIClient uses URLSearchParams |

---

## 🎯 FUNCTIONAL TEST

### Test 1: Register
1. Fill email, password, confirm
2. Click "Buat Akun"
3. ✅ Should NOT see "Failed to fetch"
4. ✅ Should see success message

### Test 2: Login
1. Go to login tab
2. Enter credentials
3. Click "Login"
4. ✅ Should redirect to `/dashboard/`

### Test 3: Google Sign-In
1. Click Google button
2. Complete Google login
3. ✅ Should redirect to `/dashboard/`

---

**Done!** If all tests pass, your auth flow is fixed ✅
