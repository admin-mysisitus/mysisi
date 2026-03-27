# GAS Script Routes - Copy & Paste into doPost

## Location
Open Google Apps Script → Find `doPost` function → Around line 1834

## Instructions
1. Find the `doPost` function
2. Locate the line: `if (action === 'getUserProfile')`
3. **After** the `getUserProfile` handler, add all the code below
4. Make sure to add them **BEFORE** the final `// Unknown action` handler
5. Save and Deploy

## Code to Add

```javascript
    if (action === 'updateUserProfile') {
      const result = updateUserProfile(params.userId, {
        displayName: params.displayName,
        whatsapp: params.whatsapp
      });
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'changePassword') {
      const result = changePassword(params.userId, params.oldPassword, params.newPassword);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'requestPasswordReset') {
      const result = requestPasswordReset(params.email);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'resetPassword') {
      const result = resetPassword(params.token, params.password);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'checkDomain') {
      const result = checkDomain(params.domain);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getDomainPricing') {
      const result = getDomainPricing(params.tld);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getUserOrders') {
      const result = getUserOrders(params.userId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getOrderDetail') {
      const result = getOrderDetail(params.orderId, params.userId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'updateOrderStatus') {
      const result = updateOrderStatus(params.orderId, params.status);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getUserOrderStats') {
      const result = getUserOrderStats(params.userId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'createOrderWithAuth') {
      const result = createOrder(params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }
```

## Verification

After pasting, verify:
1. All routes are properly indented (match surrounding code)
2. All `if` statements are closed with `}`
3. All `ContentService.createTextOutput()` lines are complete
4. Code is added **before** the `// Unknown action` handler
5. No syntax errors in the editor

## Alternative: Copy from Local File

If you prefer to copy from your local file:
1. Open your local `gas.gs` file in a text editor
2. Search for: `if (action === 'updateUserProfile')`
3. From there to `if (action === 'createOrderWithAuth')` - that's all the code to copy
4. Paste into Google Apps Script editor
5. Save and Deploy

## Deploy Instructions

1. After pasting the code in Google Apps Script editor
2. Click the **"Deploy"** button (top right)
3. Select **"New deployment"**
4. Choose type: **"Web app"**
5. Execute as: Your Google account
6. Who has access: "Anyone"
7. Click **"Deploy"**
8. Copy the new deployment URL
9. If URL changed, update `assets/js/config/api.config.js`:
   ```javascript
   // Update this line in api.config.js
   URL: 'https://script.google.com/macros/s/[NEW_URL_HERE]/exec'
   ```

## Testing

After deployment, test:
1. Open browser DevTools (F12)
2. Go to `/auth/` page
3. Try to register or login
4. Should see success instead of "Failed to fetch" error
5. Check console for "[API]" messages (should show successful calls)

**Success = No 'failed to fetch' errors and ability to login/register!**
