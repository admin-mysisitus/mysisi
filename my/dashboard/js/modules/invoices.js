import APIClient from '/assets/js/modules/unified-api.js';
import InvoiceService from '/assets/js/modules/unified-invoice.js';
import {
  formatPrice,
  formatDateTime,
  showInfo,
  EnvHelper
} from '/assets/js/modules/unified-utils.js';
export async function render(currentUser) {
  try {
    let combined = [];
    try {
      const result = await APIClient.getUserOrders(currentUser.userId);
      const orders = result.data?.orders || result.orders || [];
      orders.forEach(o => {
        combined.push({
          orderId: o.orderId || o.inv || o.id,
          createdAt: o.createdAt || o.date || new Date().toISOString(),
          domain: o.domain || o.item || o.title || 'Layanan Website',
          total: o.total || 0,
          status: (o.paymentStatus || o.status || 'unpaid').toUpperCase()
        });
      });
    } catch (e) {}
    try {
      const b2bList = await InvoiceService.getUserInvoices(currentUser.userId, currentUser.email);
      b2bList.forEach(inv => {
        const id = inv.invoiceNumber || inv.id;
        const exists = combined.some(c => c.orderId === id || c.orderId === inv.id);
        if (!exists) {
          combined.push({
            orderId: id,
            createdAt: inv.createdAt || new Date().toISOString(),
            domain: inv.domain || inv.title || 'Paket Website Korporat',
            total: inv.totalAmount || inv.total || 0,
            status: (inv.status || 'UNPAID').toUpperCase()
          });
        }
      });
    } catch (e) {}
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const container = document.getElementById('invoices-list-container');
    if (!container) return;
    if (combined.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada tagihan atau invoice aktif untuk akun Anda.</p>
        </div>
      `;
    } else {
      const getStatusBadge = (st) => {
        if (st === 'PAID' || st === 'LUNAS' || st === 'SETTLEMENT') {
          return '<span class="inv-card-status badge-success">Lunas</span>';
        }
        if (st === 'DP') {
          return '<span class="inv-card-status badge-info">DP 50%</span>';
        }
        return '<span class="inv-card-status badge-warning">Belum Bayar</span>';
      };
      container.innerHTML = `
        <div class="invoices-container">
          <div class="invoices-desktop-view">
            <div class="table-shell">
              <table class="table table--invoices">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Order / No. Faktur</th>
                    <th>Layanan / Domain</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${combined.map(inv => `
                    <tr class="clickable-row" data-invoice-url="${EnvHelper.getDomainUrl('my', '/invoice/?id=' + encodeURIComponent(inv.orderId))}">
                      <td>
                        <span class="inv-date-primary">${formatDateTime(inv.createdAt).replace(' pukul ', ', ')}</span>
                      </td>
                      <td><strong>${inv.orderId}</strong></td>
                      <td>${inv.domain}</td>
                      <td><strong class="inv-price">${formatPrice(inv.total)}</strong></td>
                      <td>${getStatusBadge(inv.status)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="invoices-mobile-view">
            ${combined.map(inv => `
              <div class="invoice-mobile-card clickable-card" data-invoice-url="${EnvHelper.getDomainUrl('my', '/invoice/?id=' + encodeURIComponent(inv.orderId))}">
                <div class="inv-card-header">
                  <div class="inv-card-id">${inv.orderId}</div>
                  ${getStatusBadge(inv.status)}
                </div>
                <div class="inv-card-body">
                  <div class="inv-card-row">
                    <span class="inv-card-label">Layanan / Domain</span>
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
      container.querySelectorAll('[data-invoice-url]').forEach(el => {
        el.addEventListener('click', () => {
          window.location.href = el.dataset.invoiceUrl;
        });
      });
    }
  } catch (error) {
    console.log('Error rendering invoices:', error);
    const container = document.getElementById('invoices-list-container');
    if (container) {
      container.innerHTML = `
        <div class="alert alert-error">${error.message}</div>
      `;
    }
  }
}
