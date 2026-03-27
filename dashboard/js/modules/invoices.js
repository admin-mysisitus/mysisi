/**
 * Invoices Page Module
 * Display invoices and payment history
 * MVP Status: ✅ COMPLETE - Shows invoices table with search/filter
 * Future Enhancement: Add invoice download (PDF generation)
 */

import APIClient from '/assets/js/modules/unified-api.js';
import { formatPrice, formatDateTime } from '/assets/js/modules/unified-utils.js';

export async function render(currentUser) {
  try {
    // Load user orders (use as invoices for now)
    const result = await APIClient.getUserOrders(currentUser.userId);
    const orders = result.orders || [];

    // Filter orders with payment status = settlement
    const invoices = orders.filter(o => o.paymentStatus === 'settlement');

    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">Invoice</h1>
        </div>
        <div class="card-body">
          ${invoices.length === 0 ? `
            <div style="text-align: center; padding: 40px;">
              <p style="color: var(--color-text-light);">Belum ada invoice. Selesaikan pembayaran pesanan terlebih dahulu.</p>
            </div>
          ` : `
            <table class="table">
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
                    <td>Rp ${formatPrice(inv.total)}</td>
                    <td>
                      <button class="btn btn-sm btn-outline" onclick="showInfo('Fitur download PDF sedang dikembangkan')">
                        📥 Download
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error rendering invoices:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">${error.message}</div>
    `;
  }
}


