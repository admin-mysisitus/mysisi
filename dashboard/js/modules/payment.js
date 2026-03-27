/**
 * Payment Page Module
 * Midtrans payment integration, order status tracking
 * Migrated and fixed from assets/js/pages/payment.js
 */

import APIClient from '/assets/js/modules/unified-api.js';
import { showError, showSuccess, showWarning, showInfo } from '/assets/js/modules/unified-utils.js';

const ADMIN_WHATSAPP = '6281215289095';
let currentUser = null;
let currentOrder = null;
let currentTransaction = null;

export async function render(user) {
  try {
    // Store current user for use in other functions
    currentUser = user;
    
    // Get order ID from URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (!orderId) {
      throw new Error('Order ID tidak ditemukan');
    }

    // Load order data
    await loadOrderData(orderId, currentUser);

    // Setup buttons
    setupPaymentButtons();

  } catch (error) {
    console.error('Error rendering payment page:', error);
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="alert alert-error">
        <h3>Error</h3>
        <p>${error.message}</p>
        <button onclick="window.history.back()" class="btn btn-primary">Kembali</button>
      </div>
    `;
  }
}

async function loadOrderData(orderId, currentUser) {
  try {
    // Show loading
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="card">
        <div class="card-body" style="text-align: center;">
          <div class="spinner"></div>
          <p>Memuat data pesanan...</p>
        </div>
      </div>
    `;

    // Fetch order data
    const result = await APIClient.getOrderDetail(orderId, currentUser.userId);
    if (!result.success) {
      throw new Error(result.message || 'Gagal memuat pesanan');
    }

    currentOrder = result.order;

    // Display order
    displayOrderData(currentOrder);

    // Generate payment token if not yet paid
    if (currentOrder.paymentStatus !== 'settlement') {
      await generateMidtransToken(currentOrder);
    }

  } catch (error) {
    console.error('Error loading order data:', error);
    throw error;
  }
}

async function generateMidtransToken(orderData) {
  try {
    if (!currentUser) {
      throw new Error('Data pengguna tidak ditemukan');
    }

    // Call GAS to generate Midtrans token with all required parameters
    const result = await APIClient.generateMidtransToken(
      orderData.orderId,
      currentUser.email,
      currentUser.phone || '',
      currentUser.displayName || currentUser.name || 'Customer',
      orderData.domain,
      orderData.packageId || orderData.packageName,
      orderData.total
    );

    if (!result.success || !result.data || !result.data.snapToken) {
      throw new Error(result.message || 'Gagal membuat token pembayaran');
    }

    currentTransaction = {
      token: result.data.snapToken,
      redirectUrl: result.data.snapRedirectUrl,
      orderId: orderData.orderId,
      amount: orderData.total
    };

  } catch (error) {
    console.error('Error generating Midtrans token:', error);
    // Show error but don't crash
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning';
    errorDiv.innerHTML = `
      Gagal memuat sistem pembayaran. Coba refresh halaman atau hubungi support.
      <br><a href="https://wa.me/${ADMIN_WHATSAPP}" target="_blank" class="btn btn-primary btn-sm">Chat Support</a>
    `;
    document.getElementById('payment-actions').appendChild(errorDiv);
  }
}

function setupPaymentButtons() {
  const btnPayment = document.getElementById('btn-payment');
  if (btnPayment) {
    btnPayment.addEventListener('click', () => openMidtransPayment());
  }

  const btnPreview = document.getElementById('btn-payment-preview');
  if (btnPreview) {
    btnPreview.addEventListener('click', () => requestPaymentAfterPreview());
  }
}

function openMidtransPayment() {
  try {
    if (!currentTransaction) {
      showWarning('Sistem pembayaran belum siap. Coba refresh halaman.');
      return;
    }

    if (!window.snap) {
      throw new Error('Midtrans library tidak loaded');
    }

    // Show loading
    const btn = document.getElementById('btn-payment');
    btn.disabled = true;
    btn.textContent = 'Membuka pembayaran...';

    // Open Midtrans Snap
    window.snap.pay(currentTransaction.token, {
      onSuccess: handlePaymentSuccess,
      onPending: handlePaymentPending,
      onError: handlePaymentError,
      onClose: handlePaymentClose
    });

  } catch (error) {
    console.error('Error opening payment:', error);
    showError('Error: ' + error.message);
    const btn = document.getElementById('btn-payment');
    btn.disabled = false;
    btn.textContent = 'Lanjut Pembayaran';
  }
}

function handlePaymentSuccess(result) {
  updateOrderStatus(currentOrder.orderId, 'settlement', result.transaction_id);
    showSuccess('Pembayaran berhasil! Terima kasih atas pemesanan Anda.');
  setTimeout(() => {
    window.location.hash = '#!orders';
  }, 2000);
}

function handlePaymentPending(result) {
  showInfo('Pembayaran sedang diproses. Anda akan menerima konfirmasi dalam waktu singkat.');
}

function handlePaymentError(result) {
  showError('Pembayaran gagal. Silakan coba lagi.');
}

function handlePaymentClose() {
  // Re-enable button
  const btn = document.getElementById('btn-payment');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Lanjut Pembayaran';
  }
}

async function updateOrderStatus(orderId, status, transactionId) {
  try {
    await APIClient.updateOrderStatus(orderId, status);
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

function requestPaymentAfterPreview() {
  try {
    if (!currentOrder) return;

    const message = `Halo, saya ingin meminta preview desain untuk order berikut:\n\nOrder ID: ${currentOrder.orderId}\nDomain: ${currentOrder.domain}\nPaket: ${currentOrder.packageName}\nTotal: Rp ${formatPrice(currentOrder.total)}\n\nTerima kasih`;

    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

  } catch (error) {
    console.error('Error with WhatsApp:', error);
    showError('Gagal membuka WhatsApp. Hubungi support secara manual.');
  }
}

function displayOrderData(orderData) {
  const content = document.getElementById('content');

  const expirationDate = new Date(new Date(orderData.createdAt).getTime() + 24 * 60 * 60 * 1000);
  const isExpired = new Date() > expirationDate;
  const statusInfo = getStatusInfo(orderData.paymentStatus);

  content.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="order-header">
          <div>
            <h1 class="card-title">${orderData.orderId}</h1>
            <small class="text-muted">Dibuat: ${formatDateTime(orderData.createdAt)}</small>
          </div>
          <div class="status-badge ${statusInfo.class}">
            <span class="status-icon">${statusInfo.icon}</span>
            <span>${statusInfo.text}</span>
          </div>
        </div>
      </div>

      <div class="card-body">
        <!-- Order Summary -->
        <div class="section">
          <h3>Ringkasan Pesanan</h3>
          <div class="order-summary">
            <div class="summary-row">
              <span>Domain:</span>
              <strong>${orderData.domain}</strong>
            </div>
            <div class="summary-row">
              <span>Paket:</span>
              <strong>${orderData.packageName}</strong>
            </div>
            <div class="summary-row">
              <span>Durasi:</span>
              <strong>${orderData.domainDuration} tahun</strong>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total Pembayaran:</span>
              <strong class="total-price">Rp ${formatPrice(orderData.total)}</strong>
            </div>
          </div>
        </div>

        <!-- Order Details -->
        <div class="section">
          <h3>Data Pelanggan</h3>
          <div class="details-grid">
            <div class="detail-item">
              <label>Nama:</label>
              <div>${orderData.customerName}</div>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <div>${orderData.email}</div>
            </div>
            <div class="detail-item">
              <label>Telepon:</label>
              <div>${formatPhoneNumber(orderData.phone)}</div>
            </div>
            <div class="detail-item">
              <label>Alamat:</label>
              <div>${sanitizeHTML(orderData.address)}</div>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="section">
          <h3>Status Pembayaran</h3>
          <div class="payment-status">
            <div class="status-item ${orderData.paymentStatus === 'settlement' ? 'completed' : ''}">
              <span class="status-check">${orderData.paymentStatus === 'settlement' ? '✓' : ''}</span>
              <div class="status-text">
                <strong>Pembayaran</strong>
                <small>${orderData.paymentStatus === 'settlement' ? 'Selesai' : 'Menunggu'}</small>
              </div>
            </div>
            <div class="status-item ${orderData.paymentStatus === 'settlement' ? 'completed' : ''}">
              <span class="status-check">${orderData.paymentStatus === 'settlement' ? '✓' : ''}</span>
              <div class="status-text">
                <strong>Proses</strong>
                <small>${orderData.paymentStatus === 'settlement' ? 'Sedang Diproses' : 'Menunggu Pembayaran'}</small>
              </div>
            </div>
            <div class="status-item">
              <span class="status-check"></span>
              <div class="status-text">
                <strong>Penyelesaian</strong>
                <small>Dalam 1-7 hari kerja</small>
              </div>
            </div>
          </div>

          ${isExpired && orderData.paymentStatus !== 'settlement' ? `
            <div class="alert alert-danger" style="margin-top: 15px;">
              ⚠️ Pembayaran telah expired. Silakan buat pesanan baru.
            </div>
          ` : orderData.paymentStatus !== 'settlement' ? `
            <div class="alert alert-warning" style="margin-top: 15px;">
              ⏳ Pembayaran harus selesai sebelum: <strong>${formatDateTime(expirationDate)}</strong>
            </div>
          ` : ''}
        </div>

        <!-- Payment Actions -->
        <div id="payment-actions" class="section">
          <h3>Opsi Pembayaran</h3>
          <div class="button-group">
            ${orderData.paymentStatus !== 'settlement' && !isExpired ? `
              <button id="btn-payment" class="btn btn-primary btn-lg">
                💳 Lanjut Pembayaran
              </button>
              <button id="btn-payment-preview" class="btn btn-secondary btn-lg">
                👁️ Minta Preview Dulu
              </button>
            ` : ''}
            <button onclick="window.location.hash='#!orders'" class="btn btn-outline">
              Kembali ke Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getStatusInfo(status) {
  const statusMap = {
    'settlement': {
      text: 'Pembayaran Selesai',
      icon: '✓',
      class: 'success'
    },
    'pending': {
      text: 'Pembayaran Tertunda',
      icon: '⏳',
      class: 'warning'
    },
    'processing': {
      text: 'Sedang Diproses',
      icon: '⚙️',
      class: 'info'
    },
    'expired': {
      text: 'Pembayaran Expired',
      icon: '✕',
      class: 'danger'
    },
    'cancelled': {
      text: 'Pesanan Dibatalkan',
      icon: '✕',
      class: 'danger'
    }
  };

  return statusMap[status] || statusMap['pending'];
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}

function formatPhoneNumber(phone) {
  if (!phone) return '';
  // Convert 08x to +628x
  if (phone.startsWith('0')) {
    return '+62' + phone.substring(1);
  }
  if (!phone.startsWith('+')) {
    return '+62' + phone;
  }
  return phone;
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

function sanitizeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
