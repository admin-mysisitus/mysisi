/**
 * INVOICE PAGE MODULE
 * ===================================
 * Display invoice after successful payment
 * - Show order details
 * - Display invoice number
 * - PDF download option (optional)
 * - Link to dashboard
 * 
 * Usage: /invoice/{order_id}
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  formatPrice,
  formatDateTime,
  formatDate,
  capitalize,
  showError
} from '/assets/js/modules/unified-utils.js';
let invoiceData = null;
let currentUser = null;
/**
 * Main render function
 */
export async function render(user) {
  try {
    currentUser = user || AuthManager.getCurrentUser();
    // Get order ID from URL
    const orderId = extractOrderIdFromUrl();
    if (!orderId) {
      throw new Error('Order ID tidak ditemukan di URL');
    }
    // Load order data
    await loadOrderData(orderId);
    // Render UI
    renderInvoice();
    setupEventListeners();
  } catch (error) {
    console.error('Error rendering invoice:', error);
    showError('Error', error.message);
    const container = document.getElementById('invoice-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="color: #dc2626; margin-bottom: 20px; font-size: 48px;">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <h2>${error.message}</h2>
          <a href="/dashboard/" class="btn" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px;">
            <i class="fas fa-arrow-left"></i> Kembali ke Dashboard
          </a>
        </div>
      `;
    }
  }
}
/**
 * Extract order ID from URL
 * Support both /invoice/ORDER-123 and URL with hash routing
 */
function extractOrderIdFromUrl() {
  // Try from pathname
  const pathParts = window.location.pathname.split('/');
  if (pathParts.length >= 3 && pathParts[1] === 'invoice' && pathParts[2]) {
    return pathParts[2];
  }
  // Try from search params
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId') || params.get('orderid');
  if (orderId) return orderId;
  // Try from hash
  const hash = window.location.hash;
  if (hash.includes('?')) {
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    return hashParams.get('orderId');
  }
  return null;
}
/**
 * Load order data from backend
 */
async function loadOrderData(orderId) {
  try {
    // Show loading
    const container = document.getElementById('invoice-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2563EB; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 20px; color: #666;">Memuat invoice...</p>
        </div>
      `;
    }
    // Fetch order data
    const result = await APIClient.getOrderDetail(orderId, currentUser?.userId);
    if (!result.success) {
      throw new Error(result.message || 'Gagal memuat order');
    }
    invoiceData = result.data || result.order;
    if (!invoiceData) {
      throw new Error('Data order tidak ditemukan');
    }
    // Verify payment was successful
    if (invoiceData.paymentStatus !== 'paid' && invoiceData.orderStatus !== 'completed') {
      console.warn('Order payment status:', invoiceData.paymentStatus, 'Order status:', invoiceData.orderStatus);
      // Proactively sync order status to catch late webhook or slow Midtrans updates
      try {
        const syncResult = await APIClient.syncOrderStatus(orderId);
        if (syncResult.success && syncResult.data && syncResult.data.paymentStatus === 'paid') {
          console.log('[Invoice] Late payment status updated to paid via sync!');
          // Sync returned paid! Re-fetch order data
          const newResult = await APIClient.getOrderDetail(orderId, currentUser?.userId);
          if (newResult.success && (newResult.data || newResult.order)) {
            invoiceData = newResult.data || newResult.order;
          }
        }
      } catch (e) {
        console.warn('Failed to sync', e);
      }
    }
  } catch (error) {
    console.error('Error loading order data:', error);
    throw error;
  }
}
/**
 * Render invoice
 */
function renderInvoice() {
  const container = document.getElementById('invoice-container');
  if (!container || !invoiceData) return;
  const invoiceNumber = generateInvoiceNumber(invoiceData.orderId);
  const isPaid = invoiceData.paymentStatus === 'paid';
  
  // Set document title for clean PDF filename download
  const cleanDomain = (invoiceData.domain || 'Layanan').replace(/[^a-zA-Z0-9-.]/g, '');
  document.title = `Invoice_${invoiceNumber}_${cleanDomain}`;
  
  // Calculate due date (24 hours from created)
  const createdDate = new Date(invoiceData.createdAt);
  const dueDate = new Date(createdDate.getTime() + (24 * 60 * 60 * 1000));
  const paymentMethodText = invoiceData.paymentMethod ? capitalize(invoiceData.paymentMethod.replace(/_/g, ' ')) : 'Midtrans Payment Gateway';
  const headerHTML = `
    <div class="inv-header">
      <div class="inv-logo">
        <img src="/assets/img/logo/logo-with-text-light.webp" alt="sisitus.com" onerror="this.outerHTML='<h2 style=\\'margin:0;color:#ffffff;\\'>sisitus.com</h2>'" style="height: 38px; margin-bottom: 4px; display: block;">
        <div class="inv-logo-subtitle">PT. SINTARA DIGITAL NUSANTARA</div>
      </div>
      <div class="inv-title-section">
        <h1 class="inv-title">INVOICE</h1>
        <div class="inv-meta"><span>Date</span><strong>${formatDate(createdDate, 'long')}</strong></div>
        <div class="inv-meta"><span>Due</span><strong>${formatDate(dueDate, 'long')}</strong></div>
        <div class="inv-meta"><span>No.</span><strong>${invoiceNumber}</strong></div>
      </div>
    </div>
  `;

  // Backwards compatibility calculation for older orders
  const discount = invoiceData.discount || 0;
  let subtotal = invoiceData.subtotal;
  let ppn = invoiceData.ppn;
  if (subtotal === undefined || ppn === undefined) {
    subtotal = Math.round((invoiceData.total + discount) / 1.11);
    ppn = invoiceData.total + discount - subtotal;
  }
  // Prepare addons data
  const paidAddons = [];
  const freeAddons = [];
  let addonsTotal = 0;
  if (invoiceData.addons && Array.isArray(invoiceData.addons)) {
    for (const addon of invoiceData.addons) {
      if (addon.price > 0) {
        paidAddons.push(addon);
        addonsTotal += addon.price;
      } else {
        freeAddons.push(addon);
      }
    }
  }
  const baseLayananPrice = subtotal - addonsTotal;

  // Calculate Dates and Periods
  const orderDuration = invoiceData.duration || 1;
  const expiryDate = new Date(createdDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + orderDuration);
  const bundlePeriod = `${orderDuration} Tahun (${formatDate(createdDate)} - ${formatDate(expiryDate)})`;

  let freeAddonsText = '';
  if (freeAddons.length > 0) {
     freeAddonsText = ' + ' + freeAddons.map(a => a.name).join(' + ');
  }
  
  const packageName = formatPackageName(invoiceData.packageId || invoiceData.package);

  // Refined Watermark
  const watermarkHTML = isPaid ? `
    <div class="inv-watermark-stamp">PAID</div>
  ` : '';

  container.innerHTML = `
    <div class="invoice-wrapper">
      
      <!-- PAGE 1 -->
      <div class="invoice-page">
        ${watermarkHTML}
        ${headerHTML}

        <div class="inv-details-grid">
          <div class="inv-grid-col">
            <div class="inv-label">From</div>
            <div class="inv-address">
              <strong>sisitus.com</strong><br>
              Jl. Manyar II, Punggul, Gedangan<br>
              Sidoarjo, Jawa Timur 61254<br>
              Indonesia<br>
              <br>
              <span class="muted-text">NPWP: 950355107564000</span>
            </div>
          </div>
          <div class="inv-grid-col">
            <div class="inv-label">Billed To</div>
            <div class="inv-address">
              <strong>${invoiceData.name || invoiceData.displayName || 'Customer'}</strong><br>
              <span class="muted-text">${invoiceData.email}</span><br>
              <span class="muted-text">${invoiceData.phone || ''}</span>
            </div>
          </div>
          <div class="inv-grid-col">
            <div class="inv-label">Payment Status</div>
            <div style="margin-bottom: 12px;">
              ${isPaid ? '<span class="inv-badge-paid">PAID / LUNAS</span>' : '<span class="inv-badge-unpaid">UNPAID</span>'}
            </div>
            <div class="inv-label">Method & Reference</div>
            <div class="inv-address">
              <strong>${paymentMethodText}</strong><br>
              <span class="muted-text">Ref: ${invoiceData.transactionId || '-'}</span><br>
              <span class="muted-text">Order: ${invoiceData.orderId}</span>
            </div>
          </div>
        </div>

        <table class="inv-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 55%;">Description</th>
              <th style="text-align: center; width: 10%;">Qty</th>
              <th style="text-align: right; width: 15%;">Unit Price</th>
              <th style="text-align: right; width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong class="inv-item-title">Bundle Domain & Hosting</strong>
                <div class="inv-item-desc">
                  Domain: ${invoiceData.domain || '-'}<br>
                  Paket: ${packageName} ${freeAddonsText}<br>
                  Masa Aktif: ${bundlePeriod}
                </div>
              </td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">${formatPrice(baseLayananPrice).replace('Rp ', '')}</td>
              <td style="text-align: right; font-weight: 600; color: #0f172a;">${formatPrice(baseLayananPrice).replace('Rp ', '')}</td>
            </tr>
            ${renderInvoiceAddons(paidAddons, createdDate)}
          </tbody>
        </table>

        <div class="inv-summary-container">
          <div class="inv-qr-section">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://sisitus.com/invoice/?orderId=${invoiceNumber}`)}" alt="QR Code">
            <div class="inv-qr-text">Scan untuk verifikasi<br>atau melihat invoice online</div>
          </div>
          <div class="inv-summary">
            <div class="inv-summary-row">
              <span class="inv-summary-label">Subtotal</span>
              <span class="inv-summary-value">${formatPrice(subtotal).replace('Rp ', '')}</span>
            </div>
            <div class="inv-summary-row">
              <span class="inv-summary-label">PPN (11%)</span>
              <span class="inv-summary-value">${formatPrice(ppn).replace('Rp ', '')}</span>
            </div>
            ${discount > 0 ? `
            <div class="inv-summary-row" style="color: #16a34a;">
              <span class="inv-summary-label">Diskon (${invoiceData.promoCode || 'Promo'})</span>
              <span class="inv-summary-value">-${formatPrice(discount).replace('Rp ', '')}</span>
            </div>
            ` : ''}
            <div class="inv-summary-row inv-summary-total">
              <span>Total Due</span>
              <span style="${isPaid ? 'color:#16a34a;' : ''}">${isPaid ? '0' : formatPrice(invoiceData.total || 0).replace('Rp ', '')}</span>
            </div>
          </div>
        </div>

        <div class="inv-signature">
          <div class="inv-sig-text">Billing Admin,</div>
          <strong class="inv-sig-name">sisitus.com</strong>
        </div>
      </div>

      <!-- PAGE 2 -->
      <div class="invoice-page print-page-break">
        <div class="inv-terms-section">
          <div class="inv-terms-block">
            <div class="inv-terms-title"><i class="fas fa-info-circle"></i> Important Notes</div>
            <div class="inv-terms-content">
              <ul>
                <li>Invoice ini merupakan tagihan resmi <strong>sisitus.com</strong>. Pembayaran dianggap sah setelah dana diterima dan terverifikasi.</li>
                <li>Jika terdapat kesalahan data (nama, layanan, nominal, dll), klien WAJIB mengajukan perubahan invoice melalui:<br>
                <a href="https://sisitus.com/kontak/" style="color:#2563EB;text-decoration:none;font-weight:500;">https://sisitus.com/kontak/</a></li>
                <li>Dalam proses perubahan invoice, mohon <strong>TIDAK melakukan pembayaran</strong> sebelum menerima invoice terbaru. Segala kesalahan pembayaran menjadi tanggung jawab klien.</li>
                <li>Layanan akan diproses secara otomatis segera setelah pembayaran dikonfirmasi oleh sistem atau tim sisitus.</li>
              </ul>
            </div>
          </div>
          
          <div class="inv-terms-block">
            <div class="inv-terms-title"><i class="fas fa-file-contract"></i> Terms & Conditions</div>
            <div class="inv-terms-content">
              <ol>
                <li>Pembayaran bersifat <em>non-refundable</em>, kecuali terjadi kesalahan teknis dari pihak sisitus.</li>
                <li>Pengerjaan layanan/produk dimulai setelah status invoice berubah menjadi LUNAS.</li>
                <li>Revisi pengerjaan akan mengikuti ketentuan paket atau kontrak awal yang disepakati.</li>
                <li>Keterlambatan penyediaan data dari pihak klien (konten, feedback, approval) dapat memengaruhi keseluruhan <em>timeline</em> proyek.</li>
                <li>SISITUS berkomitmen penuh membantu penyelesaian kendala teknis (termasuk layanan pihak ketiga) sesuai dengan batas kendali dan akses yang kami miliki.</li>
                <li>Dengan melakukan pembayaran, klien dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan layanan yang berlaku.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="invoice-actions no-print">
        <button onclick="window.print()" class="inv-btn inv-btn-dark">
          <i class="fas fa-print"></i> Download / Print PDF
        </button>
        <a href="/dashboard/" class="inv-btn inv-btn-primary">
          <i class="fas fa-home"></i> Kembali Dashboard
        </a>
      </div>

      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .invoice-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
        }

        .invoice-page {
          background: white;
          padding: 30px;
          margin-bottom: 25px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* Elevate all content above watermark */
        .inv-header, .inv-due-date, .inv-details-grid, .inv-total-section, .inv-table, .inv-summary-container, .inv-signature, .inv-terms-section {
          position: relative;
          z-index: 10;
        }

        .inv-watermark-stamp {
          position: absolute;
          top: 30%;
          right: 5%;
          transform: rotate(-15deg);
          font-size: 60px;
          font-weight: 800;
          color: rgba(22, 163, 74, 0.04);
          border: 4px solid rgba(22, 163, 74, 0.04);
          padding: 10px 20px;
          border-radius: 8px;
          z-index: 1;
          pointer-events: none;
          user-select: none;
        }

        .inv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 0 0 25px 0;
          padding: 20px;
          background-color: #0f172a;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
          background-size: 16px 16px;
          border-radius: 8px;
        }

        .inv-title-section {
          text-align: right;
        }

        .inv-title {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #ffffff;
          letter-spacing: 1.5px;
        }

        .inv-meta {
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .inv-meta strong {
          color: #f8fafc;
          margin-left: 8px;
        }

        .inv-meta span {
          display: inline-block;
          width: 40px;
          text-align: right;
        }

        .inv-logo-subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          letter-spacing: 0.5px;
        }

        .inv-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
          font-size: 12px;
          line-height: 1.5;
          color: #334155;
        }

        .inv-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 6px;
        }
        
        .inv-address {
          color: #334155;
        }

        .muted-text {
          color: #64748b;
        }

        .inv-badge-paid {
          display: inline-block;
          background-color: #dcfce7;
          color: #166534;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .inv-badge-unpaid {
          display: inline-block;
          background-color: #fee2e2;
          color: #991b1b;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .inv-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .inv-table tr {
          page-break-inside: avoid;
        }

        .inv-table th {
          border-bottom: 1px solid #e2e8f0;
          padding: 8px 4px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .inv-table td {
          padding: 10px 4px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 12px;
          vertical-align: top;
        }

        .inv-item-title {
          font-size: 13px;
          color: #0f172a;
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }
        
        .inv-item-desc {
          color: #64748b;
          font-size: 11px;
        }

        .inv-summary-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .inv-qr-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 8px; /* Align slightly with total */
        }
        
        .inv-qr-section img {
          width: 70px;
          height: 70px;
          border-radius: 6px;
          padding: 4px;
          border: 1px solid #e2e8f0;
          background: #fff;
        }
        
        .inv-qr-text {
          font-size: 10px;
          color: #64748b;
          line-height: 1.4;
        }

        .inv-summary {
          width: 280px;
        }

        .inv-summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          color: #475569;
          font-size: 12px;
        }

        .inv-summary-total {
          display: flex;
          justify-content: space-between;
          border-top: 2px solid #e2e8f0;
          margin-top: 6px;
          padding-top: 10px;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .inv-signature {
          text-align: right;
          margin-top: 25px;
          font-size: 12px;
          page-break-inside: avoid;
        }

        .inv-terms-section {
          background-color: #f8fafc;
          padding: 25px;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.6;
          color: #334155;
          border: 1px solid #e2e8f0;
          page-break-inside: avoid;
        }

        .inv-terms-block {
          margin-bottom: 20px;
        }

        .inv-terms-block:last-child {
          margin-bottom: 0;
        }

        .inv-terms-title {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .inv-terms-title i {
          color: #2563EB;
          font-size: 14px;
        }

        .inv-terms-content {
          color: #475569;
        }

        .inv-terms-content p {
          margin: 0 0 8px 0;
        }
        
        /* Modern Unordered List */
        .inv-terms-content ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .inv-terms-content ul li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 8px;
        }
        
        .inv-terms-content ul li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #2563EB;
          font-weight: bold;
          font-size: 16px;
          line-height: 1;
          top: 0px;
        }

        /* Modern Ordered List */
        .inv-terms-content ol {
          margin: 0;
          padding-left: 20px;
          color: #475569;
        }

        .inv-terms-content ol li {
          margin-bottom: 8px;
          padding-left: 4px;
        }
        
        .inv-terms-content ol li::marker {
          color: #64748b;
          font-weight: 600;
        }

        /* BUTTONS */
        .invoice-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 25px;
          padding-bottom: 30px;
        }

        .inv-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          outline: none;
          font-family: inherit;
        }

        .inv-btn-dark {
          background: #0f172a;
          color: white;
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.1);
        }

        .inv-btn-dark:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .inv-btn-primary {
          background: #2563EB;
          color: white;
          box-shadow: 0 2px 4px -1px rgba(37,99,235,0.2);
        }

        .inv-btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* PRINT CONFIGURATION */
        @page {
          size: A4;
          margin: 15mm; 
        }

        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .page-container {
            padding: 0 !important;
            margin: 0 !important;
          }

          .invoice-wrapper {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
          }

          .invoice-page {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }

          .inv-watermark-stamp {
            border: 4px solid rgba(22, 163, 74, 0.15);
            color: rgba(22, 163, 74, 0.15);
          }

          .no-print {
            display: none !important;
          }
        }


        @media screen and (max-width: 768px) {
          .invoice-page {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
          }
          .inv-watermark-stamp {
            font-size: 40px;
            padding: 5px 15px;
          }
          /* Keep header side-by-side on mobile to save vertical space */
          .inv-header {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 12px;
            padding-bottom: 12px;
            align-items: flex-start;
          }
          .inv-logo-title {
            font-size: 13px;
          }
          .inv-logo-subtitle {
            font-size: 9px;
          }
          .inv-logo img {
            height: 22px !important;
          }
          .inv-title-section {
            text-align: right;
          }
          .inv-title {
            font-size: 18px;
            margin-bottom: 2px;
          }
          .inv-meta {
            font-size: 10px;
          }
          .inv-due-date {
            margin-bottom: 15px;
            padding: 4px 12px;
            font-size: 11px;
          }
          .inv-details-grid {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 10px;
            word-break: break-word; /* Prevents long emails from breaking the grid */
          }
          .inv-paid-status {
            font-size: 12px;
          }
          .inv-item-title {
            font-size: 11px;
          }
          .inv-sig-text {
            margin-bottom: 15px;
            font-size: 10px;
          }
          .inv-sig-name {
            font-size: 11px;
          }
          /* 'Pay via' takes full width on mobile, 'From' and 'Bill to' sit side-by-side */
          .inv-pay-via {
            grid-column: span 2;
            padding: 10px;
          }
          .inv-total-section {
            padding: 10px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .inv-total-text {
            font-size: 13px;
            margin: 0;
          }
          .inv-order-id {
            font-size: 10px;
          }
          .inv-table {
            display: block;
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
            margin-bottom: 15px;
          }
          .inv-table th, .inv-table td {
            min-width: 60px;
            padding: 6px 4px;
            font-size: 10px;
          }
          .inv-table th:first-child, .inv-table td:first-child {
            min-width: 160px;
          }
          .inv-summary-container {
            margin-bottom: 15px;
          }
          .inv-summary {
            width: 100%;
            font-size: 11px;
          }
          .inv-terms-block {
            margin-bottom: 15px;
          }
          .inv-terms-title {
            font-size: 11px;
            margin-bottom: 6px;
          }
          .inv-terms-title i {
            font-size: 12px;
          }
          .inv-terms-content {
            font-size: 10px;
          }
          .invoice-actions {
            flex-direction: column;
            padding: 0 10px 20px 10px;
            gap: 10px;
          }
          .inv-btn {
            width: 100%;
            padding: 10px;
            font-size: 13px;
          }
        }
      </style>
    </div>
  `;
}
/**
 * Generate formatted invoice number
 */
function generateInvoiceNumber(orderId) {
  // Format: INV-2026-03-28-00001
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = orderId.replace('ORDER-', '').slice(0, 5);
  return `INV-${year}-${month}-${day}-${sequence}`;
}
/**
 * Format package name nicely
 */
function formatPackageName(packageId) {
  const names = {
    'starter': 'Starter',
    'professional': 'Professional',
    'business': 'Business',
    'enterprise': 'Enterprise'
  };
  return names[packageId?.toLowerCase()] || packageId || 'Standard';
}
/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Print button
  const printBtn = document.querySelector('[onclick="window.print()"]');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  // Keyboard shortcut for print
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  });
}
/**
 * Render addons in invoice items table
 * Returns HTML rows for each addon
 */
function renderInvoiceAddons(paidAddons, createdDate) {
  if (!paidAddons || !Array.isArray(paidAddons) || paidAddons.length === 0) {
    return '';
  }
  let html = '';
  for (const addon of paidAddons) {
    const addonDuration = addon.duration || 1;
    const expiryDate = new Date(createdDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + addonDuration);
    const addonPeriod = `${addonDuration} Tahun (${formatDate(createdDate)} - ${formatDate(expiryDate)})`;

    html += `
      <tr>
        <td>
          <strong class="inv-item-title">Add-on: ${addon.name || 'Layanan Tambahan'}</strong>
          <div class="inv-item-desc">
            Deskripsi: Layanan pelengkap tambahan<br>
            Masa Aktif: ${addonPeriod}
          </div>
        </td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">${formatPrice(addon.price).replace('Rp ', '')}</td>
        <td style="text-align: right; font-weight:600; color:#0f172a;">${formatPrice(addon.price).replace('Rp ', '')}</td>
      </tr>
    `;
  }
  return html;
}
export default render;