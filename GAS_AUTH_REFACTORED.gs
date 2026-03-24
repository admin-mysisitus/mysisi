/**
 * GAS REFACTORED AUTH MODULE (To replace in Google Apps Script)
 * ===================================
 * Replace all auth functions in your gas.js with this cleaner, more consistent version
 * 
 * UNIFIED RESPONSE FORMAT FOR ALL ENDPOINTS:
 * {
 *   success: boolean,
 *   data: any (null if error),
 *   message: string,
 *   error?: {
 *     code: string,
 *     details: any
 *   },
 *   timestamp: number
 * }
 * 
 * COPY THIS FILE'S FUNCTIONS AND REPLACE THEM IN YOUR GAS PROJECT
 * Then redeploy the Web App
 */

// ============================================================================
// CONFIGURATION - REPLACE DENGAN DATA KAMU
// ============================================================================

// Google Sheet ID untuk menyimpan user data
// Dapatkan dari URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
const SPREADSHEET_ID = '1qA1LzzVXmVaJ5U36lDuaoW2Eo4wiSkqL_0Y9i-Rav5s';

// Base URL untuk verification links di email
// IMPORTANT: Ganti dengan domain production Anda
const BASE_URL = 'https://mysisi.pages.dev';

// Admin email untuk notifikasi dan reply-to
// IMPORTANT: Ganti dengan email Anda
const ADMIN_EMAIL = 'semutpeyok@gmail.com';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create Users sheet
 */
function ensureUsersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    sheet = ss.insertSheet('Users');
    // Add headers
    sheet.appendRow([
      'User ID',           // A
      'Display Name',      // B
      'Email',            // C
      'WhatsApp',         // D
      'Photo URL',        // E
      'Created At',       // F
      'Updated At',       // G
      'Email Verified',   // H
      'Verification Token',  // I
      'Password Hash',    // J
      'Status',          // K
      'Auth Method'       // L
    ]);
  }
  
  return sheet;
}

/**
 * Standardized response builder
 */
function buildResponse(success, data = null, message = '', errorCode = null) {
  const response = {
    success,
    data,
    message: message || (success ? 'Operation successful' : 'Operation failed'),
    timestamp: Date.now()
  };

  if (!success && errorCode) {
    response.error = {
      code: errorCode,
      details: message
    };
  }

  return response;
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf besar' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kecil' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' };
  }

  return { valid: true, message: 'Password kuat' };
}

/**
 * Generate verification token
 */
function generateVerificationToken() {
  return Utilities.getUuid() + '-' + Date.now();
}

/**
 * Hash password using HMAC-SHA256
 */
function hashPassword(plainPassword) {
  const salt = Utilities.getUuid().substring(0, 16);
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainPassword + salt);
  const hashHex = hash.map(byte => {
    const hex = (byte & 0xff).toString(16);
    return (hex.length === 1 ? '0' : '') + hex;
  }).join('');
  return salt + '$' + hashHex;
}

/**
 * Verify password
 */
function verifyPassword(inputPassword, storedPassword) {
  try {
    if (!storedPassword || !storedPassword.includes('$')) {
      return false;
    }

    const parts = storedPassword.split('$');
    if (parts.length !== 2) {
      Logger.log('WARNING: Invalid password hash format');
      return false;
    }

    const salt = parts[0];
    const storedHash = parts[1];
    const inputHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, inputPassword + salt);
    const inputHashHex = inputHash.map(byte => {
      const hex = (byte & 0xff).toString(16);
      return (hex.length === 1 ? '0' : '') + hex;
    }).join('');

    return inputHashHex === storedHash;
  } catch (error) {
    Logger.log('Error in verifyPassword: ' + error);
    return false;
  }
}

/**
 * Send verification email
 */
function sendVerificationEmail(email, token, displayName) {
  try {
    const verificationUrl = `${BASE_URL}/auth/?verify=${encodeURIComponent(token)}`;

    const subject = '🔐 Verifikasi Email SISITUS - Aktivasi Akun Anda';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563EB; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">SISITUS</h1>
          <p style="margin: 5px 0 0 0;">Verifikasi Email Anda</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2>Halo ${displayName}!</h2>
          
          <p>Terima kasih telah mendaftar di SISITUS. Untuk melanjutkan, silakan verifikasi email Anda dengan mengklik tombol di bawah:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ✓ Verifikasi Email
            </a>
          </div>
          
          <p>Atau salin link berikut ke browser Anda:</p>
          <p style="background-color: #e8e8e8; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${verificationUrl}
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #7f8c8d; font-size: 12px;">
            Link verifikasi ini akan berlaku selama 24 jam.<br>
            Jika Anda tidak melakukan registrasi, abaikan email ini.
          </p>
        </div>
      </div>
    `;

    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      replyTo: ADMIN_EMAIL
    });

    Logger.log(`Verification email sent to ${email}`);
  } catch (error) {
    Logger.log('Error in sendVerificationEmail: ' + error);
  }
}

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/**
 * REGISTER USER
 * POST: /registerUser
 * Body: { email, password, displayName, whatsapp, authMethod }
 */
function registerUser(userData) {
  try {
    // Validate input
    if (!userData.email) {
      return buildResponse(false, null, 'Email diperlukan', 'INVALID_EMAIL');
    }

    if (!userData.authMethod) {
      userData.authMethod = 'email';
    }

    // Email/password validation
    if (userData.authMethod === 'email') {
      if (!userData.password) {
        return buildResponse(false, null, 'Password diperlukan', 'MISSING_PASSWORD');
      }

      const pwdValidation = validatePasswordStrength(userData.password);
      if (!pwdValidation.valid) {
        return buildResponse(false, null, pwdValidation.message, 'WEAK_PASSWORD');
      }
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Check if user already exists
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === userData.email) {
        return buildResponse(false, null, 'Email sudah terdaftar', 'EMAIL_EXISTS');
      }
    }

    // Create new user
    const userId = `USER-${Date.now()}`;
    const token = generateVerificationToken();

    let passwordHash = '';
    if (userData.authMethod === 'email' && userData.password) {
      passwordHash = hashPassword(userData.password);
    } else if (userData.authMethod === 'google') {
      passwordHash = Utilities.getUuid();
    }

    sheet.appendRow([
      userId,
      userData.displayName || userData.email.split('@')[0],
      userData.email,
      userData.whatsapp || '',
      userData.photoURL || '',
      new Date().toISOString(),
      new Date().toISOString(),
      userData.authMethod === 'google' ? 'Yes' : 'No',
      token,
      passwordHash,
      'active',
      userData.authMethod
    ]);

    // Send verification email for email auth
    if (userData.authMethod === 'email') {
      sendVerificationEmail(
        userData.email,
        token,
        userData.displayName || userData.email.split('@')[0]
      );
    }

    return buildResponse(true, { userId }, 'Registrasi berhasil. Email verifikasi telah dikirim.');
  } catch (error) {
    Logger.log('Error in registerUser: ' + error);
    return buildResponse(false, null, error.toString(), 'REGISTER_ERROR');
  }
}

/**
 * LOGIN USER
 * POST: /loginUser
 * Body: { email, password }
 */
function loginUser(email, password) {
  try {
    if (!email || !password) {
      return buildResponse(false, null, 'Email dan password diperlukan', 'MISSING_CREDENTIALS');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === email) {
        // Check if email is verified
        if (data[i][7] !== 'Yes') {
          return buildResponse(false, null, 'Email belum diverifikasi', 'EMAIL_NOT_VERIFIED');
        }

        // Check if account is active
        if (data[i][10] !== 'active') {
          return buildResponse(false, null, 'Akun tidak aktif', 'ACCOUNT_INACTIVE');
        }

        // Verify password
        const storedPassword = data[i][9];
        if (!verifyPassword(password, storedPassword)) {
          return buildResponse(false, null, 'Email atau password salah', 'INVALID_CREDENTIALS');
        }

        // Login successful - return user data
        return buildResponse(true, {
          userId: data[i][0],
          displayName: data[i][1],
          email: data[i][2],
          whatsapp: data[i][3],
          photoURL: data[i][4],
          authMethod: data[i][11],
          verifiedAt: data[i][6]
        }, 'Login berhasil');
      }
    }

    return buildResponse(false, null, 'Email atau password salah', 'INVALID_CREDENTIALS');
  } catch (error) {
    Logger.log('Error in loginUser: ' + error);
    return buildResponse(false, null, error.toString(), 'LOGIN_ERROR');
  }
}

/**
 * VERIFY EMAIL TOKEN (Auto-login after registration)
 * GET: /verifyEmailToken?token=xxx
 */
function verifyEmailToken(token) {
  try {
    if (!token) {
      return buildResponse(false, null, 'Token diperlukan', 'MISSING_TOKEN');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Find user with matching token
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === token) {
        // Check if already verified
        if (data[i][7] === 'Yes') {
          return buildResponse(false, null, 'Email sudah diverifikasi sebelumnya', 'ALREADY_VERIFIED');
        }

        // Mark email as verified
        sheet.getRange(i + 1, 8).setValue('Yes'); // H - Email Verified
        sheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // G - Updated At

        // Return user data for auto-login
        return buildResponse(true, {
          userId: data[i][0],
          displayName: data[i][1],
          email: data[i][2],
          whatsapp: data[i][3],
          photoURL: data[i][4],
          authMethod: data[i][11],
          verifiedAt: new Date().toISOString()
        }, 'Email berhasil diverifikasi! Anda sekarang dapat menggunakan akun ini.');
      }
    }

    return buildResponse(false, null, 'Token tidak valid atau sudah kadaluarsa', 'INVALID_TOKEN');
  } catch (error) {
    Logger.log('Error in verifyEmailToken: ' + error);
    return buildResponse(false, null, error.toString(), 'VERIFY_ERROR');
  }
}

/**
 * VERIFY GOOGLE TOKEN
 * POST: /verifyGoogleToken
 * Body: { token }
 */
function verifyGoogleToken(token) {
  try {
    if (!token) {
      return buildResponse(false, null, 'Token diperlukan', 'MISSING_TOKEN');
    }

    // Decode JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return buildResponse(false, null, 'Format token tidak valid', 'INVALID_FORMAT');
    }

    // Decode payload
    let payload = parts[1];
    payload += '=='.substring(0, (4 - payload.length % 4) % 4);

    const decoded = JSON.parse(Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString());

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return buildResponse(false, null, 'Token sudah expired', 'TOKEN_EXPIRED');
    }

    if (!decoded.email) {
      return buildResponse(false, null, 'Email tidak ditemukan dalam token', 'NO_EMAIL');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    let userId = null;
    let userFound = false;

    // Check if user exists
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === decoded.email) {
        userFound = true;
        userId = data[i][0];
        break;
      }
    }

    // Create new user if doesn't exist
    if (!userFound) {
      userId = `USER-${Date.now()}`;
      const displayName = decoded.name || decoded.email.split('@')[0];
      const photoURL = decoded.picture || '';

      sheet.appendRow([
        userId,
        displayName,
        decoded.email,
        '',
        photoURL,
        new Date().toISOString(),
        new Date().toISOString(),
        'Yes', // Email auto-verified for Google
        generateVerificationToken(),
        Utilities.getUuid(), // Random password hash
        'active',
        'google'
      ]);
    }

    return buildResponse(true, {
      userId,
      displayName: decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      photoURL: decoded.picture || '',
      whatsapp: '',
      authMethod: 'google',
      isNewUser: !userFound
    }, 'Google token berhasil diverifikasi');
  } catch (error) {
    Logger.log('Error in verifyGoogleToken: ' + error);
    return buildResponse(false, null, error.toString(), 'VERIFY_ERROR');
  }
}

/**
 * REQUEST PASSWORD RESET
 * POST: /requestPasswordReset
 * Body: { email }
 */
function requestPasswordReset(email) {
  try {
    if (!email) {
      return buildResponse(false, null, 'Email diperlukan', 'MISSING_EMAIL');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Find user
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === email) {
        // Generate reset token
        const resetToken = generateVerificationToken();

        // Store reset token in verification token column temporarily
        sheet.getRange(i + 1, 9).setValue(resetToken); // I - Token

        // Send reset email
        const resetUrl = `${BASE_URL}/auth/reset-password.html?token=${encodeURIComponent(resetToken)}`;
        const subject = '🔑 Reset Password SISITUS';
        const htmlBody = `
          <p>Anda meminta reset password. Klik link berikut untuk melanjutkan:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Link ini berlaku selama 1 jam.</p>
        `;

        GmailApp.sendEmail(email, subject, '', { htmlBody });

        return buildResponse(true, null, 'Email reset password telah dikirim');
      }
    }

    // Don't reveal if email exists for security
    return buildResponse(true, null, 'Jika email terdaftar, link reset password akan dikirim');
  } catch (error) {
    Logger.log('Error in requestPasswordReset: ' + error);
    return buildResponse(false, null, error.toString(), 'RESET_ERROR');
  }
}

/**
 * RESET PASSWORD
 * POST: /resetPassword
 * Body: { token, password }
 */
function resetPassword(token, newPassword) {
  try {
    if (!token || !newPassword) {
      return buildResponse(false, null, 'Token dan password diperlukan', 'MISSING_DATA');
    }

    const pwdValidation = validatePasswordStrength(newPassword);
    if (!pwdValidation.valid) {
      return buildResponse(false, null, pwdValidation.message, 'WEAK_PASSWORD');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Find user with matching token
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === token) {
        // Update password
        const newHash = hashPassword(newPassword);
        sheet.getRange(i + 1, 10).setValue(newHash); // J - Password
        sheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // G - Updated At

        // Clear token
        sheet.getRange(i + 1, 9).setValue('');

        return buildResponse(true, null, 'Password berhasil direset. Silakan login dengan password baru.');
      }
    }

    return buildResponse(false, null, 'Token tidak valid atau sudah kadaluarsa', 'INVALID_TOKEN');
  } catch (error) {
    Logger.log('Error in resetPassword: ' + error);
    return buildResponse(false, null, error.toString(), 'RESET_ERROR');
  }
}

/**
 * CHANGE PASSWORD (logged-in user)
 * POST: /changePassword
 * Body: { userId, oldPassword, newPassword }
 */
function changePassword(userId, oldPassword, newPassword) {
  try {
    if (!userId || !oldPassword || !newPassword) {
      return buildResponse(false, null, 'Semua field diperlukan', 'MISSING_DATA');
    }

    const pwdValidation = validatePasswordStrength(newPassword);
    if (!pwdValidation.valid) {
      return buildResponse(false, null, pwdValidation.message, 'WEAK_PASSWORD');
    }

    if (oldPassword === newPassword) {
      return buildResponse(false, null, 'Password baru tidak boleh sama dengan password lama', 'SAME_PASSWORD');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    // Find user
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        // Verify old password
        const storedPassword = data[i][9];
        if (!verifyPassword(oldPassword, storedPassword)) {
          return buildResponse(false, null, 'Password lama tidak sesuai', 'INVALID_PASSWORD');
        }

        // Update password
        const newHash = hashPassword(newPassword);
        sheet.getRange(i + 1, 10).setValue(newHash);
        sheet.getRange(i + 1, 7).setValue(new Date().toISOString());

        return buildResponse(true, null, 'Password berhasil diubah');
      }
    }

    return buildResponse(false, null, 'User tidak ditemukan', 'USER_NOT_FOUND');
  } catch (error) {
    Logger.log('Error in changePassword: ' + error);
    return buildResponse(false, null, error.toString(), 'CHANGE_ERROR');
  }
}

/**
 * GET USER PROFILE
 * GET: /getUserProfile?userId=xxx
 */
function getUserProfile(userId) {
  try {
    if (!userId) {
      return buildResponse(false, null, 'User ID diperlukan', 'MISSING_ID');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return buildResponse(true, {
          userId: data[i][0],
          displayName: data[i][1],
          email: data[i][2],
          whatsapp: data[i][3],
          photoURL: data[i][4],
          authMethod: data[i][11],
          createdAt: data[i][5],
          updatedAt: data[i][6]
        }, 'Profil user berhasil diambil');
      }
    }

    return buildResponse(false, null, 'User tidak ditemukan', 'USER_NOT_FOUND');
  } catch (error) {
    Logger.log('Error in getUserProfile: ' + error);
    return buildResponse(false, null, error.toString(), 'PROFILE_ERROR');
  }
}

/**
 * UPDATE USER PROFILE
 * POST: /updateUserProfile
 * Body: { userId, displayName, whatsapp }
 */
function updateUserProfile(userId, data) {
  try {
    if (!userId) {
      return buildResponse(false, null, 'User ID diperlukan', 'MISSING_ID');
    }

    const sheet = ensureUsersSheet();
    const sheetData = sheet.getDataRange().getValues();

    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === userId) {
        // Update fields
        if (data.displayName) {
          sheet.getRange(i + 1, 2).setValue(data.displayName);
        }
        if (data.whatsapp !== undefined) {
          sheet.getRange(i + 1, 4).setValue(data.whatsapp);
        }

        // Update timestamp
        sheet.getRange(i + 1, 7).setValue(new Date().toISOString());

        return buildResponse(true, {
          userId,
          displayName: data.displayName || sheetData[i][1],
          whatsapp: data.whatsapp !== undefined ? data.whatsapp : sheetData[i][3]
        }, 'Profil berhasil diperbarui');
      }
    }

    return buildResponse(false, null, 'User tidak ditemukan', 'USER_NOT_FOUND');
  } catch (error) {
    Logger.log('Error in updateUserProfile: ' + error);
    return buildResponse(false, null, error.toString(), 'UPDATE_ERROR');
  }
}

/**
 * GET USER BY EMAIL
 * GET: /getUserByEmail?email=xxx
 */
function getUserByEmail(email) {
  try {
    if (!email) {
      return buildResponse(false, null, 'Email diperlukan', 'MISSING_EMAIL');
    }

    const sheet = ensureUsersSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === email) {
        return buildResponse(true, {
          userId: data[i][0],
          displayName: data[i][1],
          email: data[i][2],
          whatsapp: data[i][3],
          photoURL: data[i][4],
          authMethod: data[i][11]
        }, 'User ditemukan');
      }
    }

    return buildResponse(false, null, 'User tidak ditemukan', 'USER_NOT_FOUND');
  } catch (error) {
    Logger.log('Error in getUserByEmail: ' + error);
    return buildResponse(false, null, error.toString(), 'QUERY_ERROR');
  }
}

/**
 * PLACEHOLDER: Generate Midtrans Payment Token
 * TODO: Implement with actual Midtrans API integration
 */
function generateMidtransToken(orderId, amount, email) {
  try {
    return buildResponse(false, null, 'Midtrans integration not yet configured', 'NOT_IMPLEMENTED');
  } catch (error) {
    Logger.log('Error in generateMidtransToken: ' + error);
    return buildResponse(false, null, error.toString(), 'ERROR');
  }
}

/**
 * PLACEHOLDER: Log Transaction
 * TODO: Implement with actual transaction logging
 */
function logTransaction(params) {
  try {
    return buildResponse(true, { logged: true }, 'Transaction logged');
  } catch (error) {
    Logger.log('Error in logTransaction: ' + error);
    return buildResponse(false, null, error.toString(), 'ERROR');
  }
}

// ============================================================================
// REQUEST HANDLERS - HTTP Entry Points (CORS-Enabled)
// ============================================================================

/**
 * Handle POST requests - Main entry point for API calls
 * This function routes all API requests to the appropriate handler
 */
function doPost(e) {
  try {
    // Parse POST data - handle both JSON body and URL parameters
    let params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // If JSON parsing fails, try URL parameters
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    const action = params.action || '';
    
    // Route based on action
    if (action === 'registerUser') {
      const result = registerUser(params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'loginUser') {
      const result = loginUser(params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'verifyEmailToken') {
      const result = verifyEmailToken(params.token);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getUserProfile') {
      const result = getUserProfile(params.userId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'updateUserProfile') {
      const result = updateUserProfile(params.userId, params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'getUserByEmail') {
      const result = getUserByEmail(params.email);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'verifyGoogleToken') {
      const result = verifyGoogleToken(params.token);
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

    if (action === 'generateMidtransToken') {
      const result = generateMidtransToken(params.orderId, params.amount, params.email);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    if (action === 'logTransaction') {
      const result = logTransaction(params);
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
      const result = resetPassword(params.token, params.newPassword);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*');
    }

    // If action not found
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      data: null,
      message: 'Action tidak ditemukan atau tidak valid',
      errorCode: 'INVALID_ACTION',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      data: null,
      message: 'Server error: ' + error.toString(),
      errorCode: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
  }
}

/**
 * Handle CORS preflight OPTIONS requests
 * Browser sends this before actual request to check if endpoint is allowed
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Helper function to build response with CORS headers
 */
function buildCORSResponse(success, data, message, errorCode = null) {
  return {
    success: success,
    data: data || null,
    message: message,
    errorCode: errorCode,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================
// 1. Copy all content of this file
// 2. Go to https://script.google.com
// 3. Open your existing GAS project
// 4. Replace all content in Code.gs with this file
// 5. Save the file (Ctrl+S)
// 6. Click "Deploy" → "New Deployment"
// 7. Select type: "Web app"
// 8. Execute as: Your Google Account
// 9. Who has access: "Anyone"
// 10. Copy the deployment URL
// 11. Update GAS_CONFIG.URL in /assets/js/config/api.config.js
// 12. Test authentication on your website
// ============================================================================
