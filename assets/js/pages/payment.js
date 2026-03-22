/**
 * Payment Page - Midtrans Integration Module
 * Handles: Order status display, Midtrans payment gateway integration
 * 
 * Midtrans Configuration:
 * - Server Key: Configured via VITE_MIDTRANS_SERVER_KEY environment variable
 * - Client Key: Configured via VITE_MIDTRANS_CLIENT_KEY environment variable
 * - Environment: Sandbox (Testing)
 * - Payment Methods: Bank Transfer, E-Wallet, Credit Card, BNPL
 * 
 * See .env file for configuration
 */

import { GAS_CONFIG, MIDTRANS_CONFIG } from '../config/api.config.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Admin WhatsApp
const ADMIN_WHATSAPP = '6281215289095';

// Store current order and transaction data
window.currentOrder = null;
window.currentTransaction = null;

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
// GET ORDER DATA FROM GOOGLE SHEETS & GENERATE TRANSACTION TOKEN
// ============================================================================

async function loadOrderData(orderId) {
  try {
    const url = `\$\{GAS_CONFIG.URL\}?action=getOrder&orderId=${encodeURIComponent(orderId)}`;
    console.log('Fetching order from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('API Response:', result);

    if (result.success && result.data) {
      console.log('Order found, displaying data');
      const orderData = result.data;
      
      // Store current order
      window.currentOrder = orderData;

      // Display order
      displayOrderData(orderData);

      // Generate Midtrans transaction token
      generateMidtransToken(orderData);

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

/**
 * Generate Midtrans transaction token via Google Apps Script
 * Uses GET with query parameters to avoid CORS issues
 */
async function generateMidtransToken(orderData) {
  try {
    console.log('Generating Midtrans transaction token for order:', orderData.orderId);
    
    // Build URL with query parameters (GET instead of POST to avoid CORS)
    const params = new URLSearchParams({
      action: 'generateMidtransToken',
      orderId: orderData.orderId,
      email: orderData.email,
      phone: orderData.phone,
      nama: orderData.namaCustomer,
      domain: orderData.domain,
      paket: orderData.paket,
      total: parseInt(orderData.total) || 0
    });
    
    const url = `\$\{GAS_CONFIG.URL\}?${params.toString()}`;
    console.log('Generating token URL:', url);
    
    const response = await fetch(url);
    console.log('Token Response status:', response.status);
    
    const result = await response.json();
    console.log('Midtrans Token Response:', result);

    if (result.success && result.snapToken) {
      window.currentTransaction = {
        token: result.snapToken,
        orderId: orderData.orderId,
        amount: orderData.total
      };
      console.log('✅ Midtrans token generated successfully');
    } else {
      console.error('❌ Failed to generate Midtrans token:', result.message);
      showErrorMessage('Gagal membuat token pembayaran. Silakan refresh halaman.');
    }
  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    console.error('Error details:', error.message, error.stack);
    showErrorMessage('Gagal membuat token pembayaran: ' + error.message);
  }
}

// ============================================================================
// MIDTRANS PAYMENT HANDLING
// ============================================================================

function openMidtransPayment() {
  if (!window.currentTransaction || !window.currentTransaction.token) {
    showErrorMessage('Token pembayaran tidak tersedia. Silakan refresh halaman.');
    return;
  }

  console.log('Opening Midtrans payment with token:', window.currentTransaction.token);

  // Open Midtrans Snap popup
  snap.pay(window.currentTransaction.token, {
    onSuccess: handlePaymentSuccess,
    onPending: handlePaymentPending,
    onError: handlePaymentError,
    onClose: handlePaymentClose
  });
}

function handlePaymentSuccess(result) {
  console.log('✅ Payment Success:', result);
  
  if (!window.currentOrder) {
    showErrorMessage('Order data tidak tersedia');
    return;
  }

  // Update order status to "Processing"
  updateOrderStatus(window.currentOrder.orderId, 'Processing', result);

  // Show success message
  const successMsg = `
    Pembayaran berhasil diterima! 
    
    Order ID: ${window.currentOrder.orderId}
    Transaction ID: ${result.transaction_id}
    
    Tim kami akan segera menghubungi Anda via WhatsApp untuk tahap selanjutnya.
  `;
  
  alert(successMsg);
  
  // Reload page to show updated status
  setTimeout(() => {
    location.reload();
  }, 2000);
}

function handlePaymentPending(result) {
  console.log('⏳ Payment Pending:', result);
  showErrorMessage('Pembayaran sedang diproses. Silakan tunggu konfirmasi...');
}

function handlePaymentError(result) {
  console.error('❌ Payment Error:', result);
  showErrorMessage('Pembayaran gagal atau dibatalkan. Silakan coba lagi.');
}

function handlePaymentClose() {
  console.log('Payment dialog closed');
  showErrorMessage('Anda menutup dialog pembayaran. Silakan coba lagi.');
}

// ============================================================================
// UPDATE ORDER STATUS
// ============================================================================

async function updateOrderStatus(orderId, status, transactionData) {
  try {
    console.log('Updating order status:', orderId, '→', status);
    
    // Build URL with query parameters (GET to avoid CORS)
    const params = new URLSearchParams({
      action: 'updateOrderStatus',
      orderId: orderId,
      status: status,
      transactionId: transactionData ? transactionData.transaction_id : '',
      paymentMethod: transactionData ? transactionData.payment_type : ''
    });
    
    const url = `\$\{GAS_CONFIG.URL\}?${params.toString()}`;
    console.log('Updating order status URL:', url);
    
    const response = await fetch(url);
    const result = await response.json();
    console.log('Order status update result:', result);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

// ============================================================================
// SPECIAL: PAYMENT AFTER PREVIEW (FOR WEBSITE DESIGN)
// ============================================================================

function requestPaymentAfterPreview() {
  if (!window.currentOrder) {
    showErrorMessage('Order data tidak tersedia');
    return;
  }

  const message = `Halo, saya pemesan pembuatan website dengan Order ID: ${window.currentOrder.orderId}

Saya ingin melihat design preview terlebih dahulu sebelum melakukan pembayaran.

Domain: ${window.currentOrder.domain}
Paket: ${window.currentOrder.paket}
Total: Rp ${formatPrice(window.currentOrder.total)}

Bisakah saya melihat preview-nya dulu?`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`;
  
  window.open(whatsappURL, '_blank');
}

// ============================================================================
// DISPLAY ORDER DATA
// ============================================================================

function displayOrderData(orderData) {
  // Display Order ID
  document.getElementById('order-id-display').innerHTML = `Order ID: <strong>${sanitizeHTML(orderData.orderId)}</strong>`;
  
  // Display order expire time (24 hours from creation)
  let createdDate;
  if (typeof orderData.createdAt === 'string') {
    createdDate = new Date(orderData.createdAt);
  } else if (typeof orderData.createdAt === 'number') {
    createdDate = new Date(orderData.createdAt);
  } else {
    createdDate = new Date();
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

  // Show "Payment After Preview" button if this is a website design order
  // (You can add logic to detect website design orders here)
  // For now, we can add a condition in Google Sheets to mark these orders
  // if (orderData.serviceType === 'website-design') {
  //   document.getElementById('btn-payment-after-preview').style.display = 'inline-block';
  // }
}

function updateStatusBadge(status) {
  const statusHeader = document.getElementById('status-header');
  const statusMap = {
    'Pending': { icon: 'fa-hourglass-half', text: 'Pesanan Menunggu Pembayaran', class: 'pending' },
    'Processing': { icon: 'fa-spinner', text: 'Pembayaran Diterima - Sedang Diproses', class: 'processing' },
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
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  return orderId || null;
}

function formatPrice(price) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('id-ID').format(numPrice || 0);
}

function formatPhoneNumber(phone) {
  if (!phone) {
    return '-';
  }
  
  const phoneStr = String(phone).trim();
  
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
