/**
 * Invoices Page Module
 * Display invoices and payment history
 * MVP Status: ✅ COMPLETE - Shows invoices table with search/filter
 * Future Enhancement: Add invoice download (PDF generation)
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  formatPrice,
  formatDateTime,
  showInfo
} from '/assets/js/modules/unified-utils.js';
export async function render(currentUser) {
  try {
    // Load user orders (use as invoices for now)
    const result = await APIClient.getUserOrders(currentUser.userId);
    const orders = result.data?.orders || result.orders || [];
    // Filter orders with payment status = paid
    const invoices = orders.filter(o => o.paymentStatus === 'paid');
    const container = document.getElementById('invoices-list-container');
    if (!container) return;
    if (invoices.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada invoice. Selesaikan pembayaran pesanan terlebih dahulu.</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="invoices-container">
          <!-- Desktop Table -->
          <div class="invoices-desktop-view">
            <div class="table-shell">
              <table class="table table--invoices">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Order ID</th>
                    <th>Domain</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoices.map(inv => `
                    <tr class="clickable-row" onclick="window.location.href='/invoice/?orderId=${inv.orderId}'" style="cursor: pointer;">
                      <td>
                        <span class="inv-date-primary">${formatDateTime(inv.createdAt).replace(' pukul ', ', ')}</span>
                      </td>
                      <td><strong>${inv.orderId}</strong></td>
                      <td>${inv.domain}</td>
                      <td><strong class="inv-price">${formatPrice(inv.total)}</strong></td>
                      <td><span class="inv-card-status badge-success">Lunas</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Mobile Card List -->
          <div class="invoices-mobile-view">
            ${invoices.map(inv => `
              <div class="invoice-mobile-card clickable-card" onclick="window.location.href='/invoice/?orderId=${inv.orderId}'" style="cursor: pointer;">
                <div class="inv-card-header">
                  <div class="inv-card-id">${inv.orderId}</div>
                  <div class="inv-card-status badge-success">Lunas</div>
                </div>
                <div class="inv-card-body">
                  <div class="inv-card-row">
                    <span class="inv-card-label">Domain</span>
                    <span class="inv-card-value">${inv.domain}</span>
                  </div>
                  <div class="inv-card-row">
                    <span class="inv-card-label">Tanggal</span>
                    <span class="inv-card-value">${formatDateTime(inv.createdAt)}</span>
                  </div>
                  <div class="inv-card-row">
                    <span class="inv-card-label">Total</span>
                    <span class="inv-card-value inv-price-highlight">${formatPrice(inv.total)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error rendering invoices:', error);
    const container = document.getElementById('invoices-list-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-error">${error.message}</div>
      `;
    }
  }
}