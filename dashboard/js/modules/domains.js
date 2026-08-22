/**
 * Domains Page Module
 * Manage registered domains, renewal, DNS settings
 * MVP Status: ✅ COMPLETE - Shows list of registered domains
 * Future Enhancement: Add DNS management, renewal, domain settings
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  showInfo
} from '/assets/js/modules/unified-utils.js';
export async function render(currentUser) {
  try {
    // Load user orders to get registered domains
    const result = await APIClient.getUserOrders(currentUser.userId);
    const orders = result.data?.orders || result.orders || [];
    // Filter completed orders to show as registered domains
    const domains = orders.filter(o => o.paymentStatus === 'paid').map(o => ({
      name: o.domain,
      registeredDate: o.createdAt,
      expiryDate: calculateExpiryDate(o.createdAt, o.domainDuration || 1),
      status: getDomainStatus(o.createdAt, o.domainDuration || 1),
      orderId: o.orderId
    }));
    const container = document.getElementById('domains-list-container');
    if (!container) return;
    if (domains.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Belum ada domain terdaftar.</p>
          <a href="#!/dashboard/checkout" class="btn btn-primary">Daftar Domain Baru</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="domain-grid">
          ${domains.map(dom => `
            <article class="domain-card">
              <div class="domain-card__head">
                <div class="domain-card__title">${dom.name}</div>
                <span class="domain-card__badge">${dom.status.text}</span>
              </div>
              <div class="domain-card__meta">
                <p><strong>Terdaftar:</strong> ${formatDate(dom.registeredDate)}</p>
                <p><strong>Kadaluarsa:</strong> ${formatDate(dom.expiryDate)}</p>
              </div>
              <div class="domain-card__actions">
                <button class="btn btn-sm btn-outline btn-dns" data-domain="${dom.name}">⚙️ DNS</button>
                <button class="btn btn-sm btn-outline btn-renew" data-domain="${dom.name}">🔄 Renew</button>
              </div>
            </article>
          `).join('')}
        </div>
      `;
      // Attach modern event listeners instead of using inline onclick with global fallback
      container.querySelectorAll('.btn-dns').forEach(btn => {
        btn.addEventListener('click', () => {
          showInfo(`Fitur DNS Management untuk domain ${btn.dataset.domain} sedang dikembangkan.`);
        });
      });
      container.querySelectorAll('.btn-renew').forEach(btn => {
        btn.addEventListener('click', () => {
          showInfo(`Fitur Renewal untuk domain ${btn.dataset.domain} sedang dikembangkan.`);
        });
      });
    }
  } catch (error) {
    console.error('Error rendering domains:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">${error.message}</div>
    `;
  }
}

function calculateExpiryDate(createdDate, years = 1) {
  const date = new Date(createdDate);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

function getDomainStatus(createdDate, years = 1) {
  const expiryDate = calculateExpiryDate(createdDate, years);
  const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) {
    return {
      text: 'Kadaluarsa',
      class: 'danger'
    };
  } else if (daysUntilExpiry < 30) {
    return {
      text: `Segera Kadaluarsa (${daysUntilExpiry} hari)`,
      class: 'warning'
    };
  } else {
    return {
      text: 'Aktif',
      class: 'active'
    };
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
