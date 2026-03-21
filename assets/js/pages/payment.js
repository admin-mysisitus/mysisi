/**
 * Payment Page - Order Status & Payment Instructions Module
 * Handles: Retrieve order data from Google Sheets, display payment options, contact methods
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Google Apps Script deployment URL - SAME AS CHECKOUT.JS
// This is already configured from checkout.js setup
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0kjkAboUSL31Q8jYl1Are09qcZXXC4nC9pgSiP9Oday1GMvRBOnphTfGs0CtG3K2g/exec';

// WhatsApp number for admin (international format, no + needed)
const ADMIN_WHATSAPP = '6281215289095'; // Replace with admin WhatsApp number

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('Payment page loaded');
  console.log('Current URL:', window.location.href);
  
  const orderId = getOrderIdFromURL();
  console.log('Extracted Order ID:', orderId);
  
  if (!orderId) {
    console.error('No Order ID found in URL');
    showErrorState('Order ID tidak ditemukan di URL');
    return;
  }

  loadOrderData(orderId);
});

// ============================================================================
// GET ORDER DATA FROM GOOGLE SHEETS
// ============================================================================

async function loadOrderData(orderId) {
  try {
    const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getOrder&orderId=${encodeURIComponent(orderId)}`;
    console.log('Fetching order from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('API Response:', result);

    if (result.success && result.data) {
      console.log('Order found, displaying data');
      console.log('Order data fields:');
      console.log('  - orderId:', result.data.orderId, '(type:', typeof result.data.orderId, ')');
      console.log('  - phone:', result.data.phone, '(type:', typeof result.data.phone, ')');
      console.log('  - createdAt:', result.data.createdAt, '(type:', typeof result.data.createdAt, ')');
      console.log('  - total:', result.data.total, '(type:', typeof result.data.total, ')');
      console.log('Object keys:', Object.keys(result.data));
      
      displayOrderData(result.data);
      hideLoadingState();
    } else {
      console.error('API returned error:', result.message);
      showErrorState(result.message || 'Pesanan tidak ditemukan');
    }
  } catch (error) {
    console.error('Error loading order:', error);
    console.error('Error details:', error.message, error.stack);
    showErrorState(`Gagal memuat pesanan: ${error.message}`);
  }
}

function displayOrderData(orderData) {
  // Display Order ID
  document.getElementById('order-id-display').innerHTML = `Order ID: <strong>${sanitizeHTML(orderData.orderId)}</strong>`;
  
  // Display order expire time (24 hours from creation)
  // Handle createdAt - could be string or number from Google Sheets
  let createdDate;
  if (typeof orderData.createdAt === 'string') {
    createdDate = new Date(orderData.createdAt);
  } else if (typeof orderData.createdAt === 'number') {
    createdDate = new Date(orderData.createdAt);
  } else {
    createdDate = new Date(); // fallback to now
  }
  
  const expireDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
  document.getElementById('expire-time-display').textContent = 
    `Berlaku hingga: ${formatDateTime(expireDate)}`;

  // Display payment status badge
  updateStatusBadge(orderData.status);

  // Display domain & paket
  document.getElementById('domain-display').textContent = sanitizeHTML(orderData.domain);
  document.getElementById('paket-display').textContent = `Paket ${sanitizeHTML(orderData.paket)}`;
  
  // Display total price
  document.getElementById('total-display').textContent = `Rp ${formatPrice(orderData.total)}`;

  // Display order details
  document.getElementById('detail-domain').textContent = sanitizeHTML(orderData.domain);
  document.getElementById('detail-paket').textContent = sanitizeHTML(orderData.paket);

  // Display customer info
  document.getElementById('info-nama').textContent = sanitizeHTML(orderData.namaCustomer);
  document.getElementById('info-email').textContent = sanitizeHTML(orderData.email);
  document.getElementById('info-phone').textContent = formatPhoneNumber(orderData.phone);
  document.getElementById('info-alamat').textContent = sanitizeHTML(orderData.alamat);

  // Store order data for later use
  window.currentOrder = orderData;

  // Setup payment method listeners
  setupPaymentMethodListeners();
}

function updateStatusBadge(status) {
  const statusHeader = document.getElementById('status-header');
  const statusMap = {
    'Pending': { icon: 'fa-hourglass-half', text: 'Pesanan Menunggu Pembayaran', class: 'pending' },
    'Processing': { icon: 'fa-spinner', text: 'Sedang Diproses', class: 'processing' },
    'Completed': { icon: 'fa-check-circle', text: 'Pesanan Selesai', class: 'completed' },
    'Cancelled': { icon: 'fa-times-circle', text: 'Pesanan Dibatalkan', class: 'cancelled' }
  };

  const statusInfo = statusMap[status] || statusMap['Pending'];
  statusHeader.className = `status-header ${statusInfo.class}`;
  statusHeader.innerHTML = `
    <i class="fas ${statusInfo.icon}"></i>
    <h2>${statusInfo.text}</h2>
  `;
}

// ============================================================================
// PAYMENT METHOD HANDLING
// ============================================================================

function setupPaymentMethodListeners() {
  const radioButtons = document.querySelectorAll('input[name="payment-method"]');
  const bankDetailsDiv = document.getElementById('bank-details');

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'bank-transfer') {
        bankDetailsDiv.style.display = 'block';
      } else {
        bankDetailsDiv.style.display = 'none';
      }
    });
  });

  // Trigger WhatsApp method by default
  document.getElementById('radio-whatsapp').click();
}

function contactViaWhatsApp() {
  if (!window.currentOrder) {
    showErrorMessage('Order data tidak tersedia');
    return;
  }

  const order = window.currentOrder;
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

  let message = `Halo, saya ingin melanjutkan pembayaran pesanan:\n\n`;
  message += `Order ID: ${order.orderId}\n`;
  message += `Domain: ${order.domain}\n`;
  message += `Paket: ${order.paket}\n`;
  message += `Total: Rp ${formatPrice(order.total)}\n`;
  message += `Nama: ${order.namaCustomer}\n`;
  message += `Email: ${order.email}\n\n`;

  if (selectedMethod === 'bank-transfer') {
    message += `Saya ingin membayar melalui transfer bank.\n`;
  } else if (selectedMethod === 'ewallet') {
    message += `Saya ingin membayar melalui e-wallet.\n`;
  } else {
    message += `Saya ingin mengetahui metode pembayaran yang tersedia.\n`;
  }

  message += `\nBagaimana cara untuk melanjutkan?`;

  // Open WhatsApp (encode message untuk URL)
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
  
  window.open(whatsappURL, '_blank');
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

function hideLoadingState() {
  console.log('Hiding loading state');
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'none';
  document.getElementById('order-state').style.display = 'block';
}

function showErrorState(message) {
  console.log('Showing error state with message:', message);
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'block';
  document.getElementById('error-message').textContent = message;
  document.getElementById('order-state').style.display = 'none';
}

function showErrorMessage(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5000);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getOrderIdFromURL() {
  // Get orderId from query parameter: ?orderId=ORD-20260322-ABC123
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  return orderId || null;
}

function formatPrice(price) {
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('id-ID').format(numPrice || 0);
}

function formatPhoneNumber(phone) {
  // Handle null/undefined and convert to string
  if (!phone) {
    return '-';
  }
  
  // Convert to string (in case it's a number)
  const phoneStr = String(phone).trim();
  
  // Convert 08xxx to +628xxx for display
  if (phoneStr.startsWith('08')) {
    return '+62' + phoneStr.substring(1);
  }
  return phoneStr;
}

function formatDateTime(date) {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showCopyNotification();
  }).catch(function(err) {
    console.error('Copy failed:', err);
  });
}

function showCopyNotification() {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Nomor rekening disalin ke clipboard</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 3000);
}

// ============================================================================
// STATUS CHECKING (for automatic refresh)
// ============================================================================

/**
 * Check payment status (optional - can be called periodically)
 * Could be extended to auto-refresh if payment is confirmed
 */
function checkPaymentStatus() {
  if (!window.currentOrder) return;

  // In a real implementation, you would:
  // 1. Query Google Sheets for updated order status
  // 2. Check if payment was confirmed
  // 3. Redirect to success page if payment confirmed

  // For now, users must manually confirm via WhatsApp/phone
}

// Optional: Auto-refresh payment status every 30 seconds
// setInterval(checkPaymentStatus, 30000);
