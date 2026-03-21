/**
 * GOOGLE APPS SCRIPT - Order Handler
 * 
 * SETUP INSTRUCTIONS:
 * ===================
 * 1. Buat Google Sheet baru dengan nama "Orders"
 * 2. Buat tab bernama "Orders" dengan kolom:
 *    A: Order ID
 *    B: Tanggal Order
 *    C: Domain
 *    D: Paket
 *    E: Harga Paket
 *    F: Total
 *    G: Nama Customer
 *    H: Email
 *    I: Phone
 *    J: Alamat
 *    K: Status
 *    L: Created At
 * 
 * 3. Buka Google Apps Script (Tools > Script Editor)
 * 4. Copy-paste code di bawah ke Apps Script editor
 * 5. Deploy sebagai Web App:
 *    - Pilih "Deploy" > "New Deployment" > "Web App"
 *    - Execute as: Your Google Account
 *    - Who has access: Anyone
 *    - Copy Deployment ID
 * 6. Update GOOGLE_APPS_SCRIPT_URL di checkout.js dengan URL deployment
 * 
 * DEPLOYMENT URL FORMAT:
 * https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
 * 
 * Contoh: https://script.google.com/macros/d/1ABcD_EfGhIj2KlMnOpQRstUV-WxYzAbCdEFgHiJkL/usercontent
 */

// ============================================================================
// CONFIGURATION - UBAH SESUAI KEBUTUHAN
// ============================================================================

// ID dari Google Sheet tempat order disimpan
// Dapatkan dari URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/...
const SPREADSHEET_ID = '1qA1LzzVXmVaJ5U36lDuaoW2Eo4wiSkqL_0Y9i-Rav5s';

// Nama sheet tempat order disimpan
const SHEET_NAME = 'Orders';

// Email untuk notifikasi order baru (opsional)
const ADMIN_EMAIL = 'semutpeyok@gmail.com'; // email contoh saya sementara

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique Order ID
 * Format: ORD-YYYYMMDD-ABC123
 */
function generateOrderId() {
  const date = new Date();
  const dateStr = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyyMMdd');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${randomStr}`;
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indonesian phone number
 */
function validatePhone(phone) {
  const phoneRegex = /^08\d{8,11}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate domain format
 */
function validateDomain(domain) {
  const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Validate order data
 */
function validateOrderData(data) {
  const errors = {};

  // Validate domain
  if (!data.domain || typeof data.domain !== 'string') {
    errors.domain = 'Domain diperlukan';
  } else if (!validateDomain(data.domain)) {
    errors.domain = 'Format domain tidak valid';
  }

  // Validate package
  const validPackages = ['starter', 'grower', 'pioneer'];
  if (!data.packageId || !validPackages.includes(data.packageId)) {
    errors.packageId = 'Paket tidak valid';
  }

  // Validate prices
  if (typeof data.packagePrice !== 'number' || data.packagePrice <= 0) {
    errors.packagePrice = 'Harga paket tidak valid';
  }
  if (typeof data.domainPrice !== 'number' || data.domainPrice <= 0) {
    errors.domainPrice = 'Harga domain tidak valid';
  }

  // Validate customer data
  const { customerData } = data;
  if (!customerData) {
    errors.customerData = 'Data pelanggan diperlukan';
  } else {
    if (!customerData.fullname || customerData.fullname.length < 3) {
      errors.fullname = 'Nama minimal 3 karakter';
    }
    if (!validateEmail(customerData.email)) {
      errors.email = 'Email tidak valid';
    }
    if (!validatePhone(customerData.phone)) {
      errors.phone = 'No. WhatsApp tidak valid (08xxxxxxxxxx)';
    }
    if (!customerData.address || customerData.address.length < 10) {
      errors.address = 'Alamat minimal 10 karakter';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Save order to Google Sheet
 */
function saveOrderToSheet(orderId, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" tidak ditemukan`);
  }

  // Prepare row data
  const rowData = [
    orderId,                              // A: Order ID
    new Date(),                           // B: Tanggal Order
    data.domain,                          // C: Domain
    data.packageName,                     // D: Paket
    data.packagePrice,                    // E: Harga Paket
    data.totalPrice,                      // F: Total
    data.customerData.fullname,           // G: Nama Customer
    data.customerData.email,              // H: Email
    data.customerData.phone,              // I: Phone
    data.customerData.address,            // J: Alamat
    'Pending',                            // K: Status
    new Date().toISOString()              // L: Created At
  ];

  // Append row to sheet
  sheet.appendRow(rowData);
}

/**
 * Send email notification
 */
function sendOrderNotification(orderId, data) {
  try {
    // Email to customer
    const customerSubject = `Pesanan Anda Diterima - ${data.domain}`;
    const customerBody = `
Halo ${data.customerData.fullname},

Terima kasih telah melakukan pemesanan di SISITUS!

Detail Pesanan:
- Order ID: ${orderId}
- Domain: ${data.domain}
- Paket: ${data.packageName}
- Total: Rp ${new Intl.NumberFormat('id-ID').format(data.totalPrice)}

Kami akan segera menghubungi Anda melalui WhatsApp untuk melanjutkan proses pembayaran.

Nomor WhatsApp Anda: ${data.customerData.phone}
Email: ${data.customerData.email}

Terima kasih,
Tim SISITUS
    `;

    GmailApp.sendEmail(
      data.customerData.email,
      customerSubject,
      customerBody,
      { replyTo: ADMIN_EMAIL }
    );

    // Email to admin
    if (ADMIN_EMAIL) {
      const adminSubject = `[NEW ORDER] ${orderId} - ${data.domain}`;
      const adminBody = `
Pesanan baru diterima!

Order ID: ${orderId}
Domain: ${data.domain}
Paket: ${data.packageName}
Total: Rp ${new Intl.NumberFormat('id-ID').format(data.totalPrice)}

Customer:
- Nama: ${data.customerData.fullname}
- Email: ${data.customerData.email}
- Phone: ${data.customerData.phone}
- Alamat: ${data.customerData.address}

Link Google Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
      `;

      GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody);
    }
  } catch (error) {
    Logger.log('Email notification error: ' + error);
    // Don't throw error, email failure shouldn't block order creation
  }
}

// ============================================================================
// MAIN HANDLER - doPost()
// ============================================================================

/**
 * Handle POST requests from checkout.js
 * This function is called automatically when POST data is sent to the Web App URL
 */
function doPost(e) {
  try {
    // Parse POST data
    const postData = JSON.parse(e.postData.contents);

    // Validate order data
    const validationErrors = validateOrderData(postData);
    if (validationErrors) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Validasi data gagal',
        errors: validationErrors
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Save to Google Sheet
    saveOrderToSheet(orderId, postData);

    // Send email notifications
    sendOrderNotification(orderId, postData);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderId: orderId,
      message: 'Pesanan berhasil dibuat. Silakan cek email Anda.',
      paymentUrl: `/payment/${orderId}`
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Gagal memproses pesanan. Silakan coba lagi.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests for retrieving order data
 * Usage: GET ?action=getOrder&orderId=ORD-20260322-ABC123
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const orderId = e.parameter.orderId;

    if (action === 'getOrder' && orderId) {
      // Retrieve order from Google Sheet by ID
      const order = getOrderByID(orderId);
      
      if (order) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: order
        }))
        .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Order tidak ditemukan'
        }))
        .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Default: Health check
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Apps Script Order Handler is running',
      usage: 'GET ?action=getOrder&orderId=ORD-YYYYMMDD-ABC123'
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doGet: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Retrieve order data from Google Sheet by Order ID
 */
function getOrderByID(orderId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return null;
    }

    // Get all data from sheet
    const data = sheet.getDataRange().getValues();
    
    // Skip header row (row 0)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        // Found the order, format it
        return {
          orderId: data[i][0],
          tanggal: data[i][1],
          domain: data[i][2],
          paket: data[i][3],
          hargaPaket: data[i][4],
          total: data[i][5],
          namaCustomer: data[i][6],
          email: data[i][7],
          phone: data[i][8],
          alamat: data[i][9],
          status: data[i][10],
          createdAt: data[i][11]
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log('Error in getOrderByID: ' + error);
    return null;
  }
}

// ============================================================================
// TESTING FUNCTIONS - Jalankan dari Script Editor untuk test
// ============================================================================

/**
 * Test function - Jalankan di Script Editor (Ctrl+Enter)
 */
function testOrderCreation() {
  const testData = {
    domain: "example.com",
    packageId: "grower",
    packageName: "Grower",
    packagePrice: 1299000,
    domainPrice: 299000,
    totalPrice: 1598000,
    customerData: {
      fullname: "Budi Santoso",
      email: "budi@example.com",
      phone: "08812345678",
      address: "Jln. Sudirman No. 123, Jakarta"
    },
    timestamp: new Date().toISOString()
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}