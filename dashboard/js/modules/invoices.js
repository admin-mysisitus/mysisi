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
        <div class="table-shell">
          <table class="table table--invoices">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Order ID</th>
                <th>Domain</th>
                <th>Jumlah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr>
                  <td>${formatDateTime(inv.createdAt)}</td>
                  <td><strong>${inv.orderId}</strong></td>
                  <td>${inv.domain}</td>
                  <td>${formatPrice(inv.total)}</td>
                  <td class="invoice-actions">
                    <a href="/invoice/?orderId=${inv.orderId}" class="btn btn-sm btn-primary">
                      👁️ Lihat
                    </a>
                    <button class="btn btn-sm btn-outline btn-pdf" data-order-id="${inv.orderId}">
                      📥 PDF
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      // Attach event listeners for PDF buttons
      container.querySelectorAll('.btn-pdf').forEach(btn => {
        btn.addEventListener('click', () => {
          showInfo(`Fitur download PDF untuk invoice ${btn.dataset.orderId} sedang dikembangkan.`);
        });
      });
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
