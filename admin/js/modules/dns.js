import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  openDnsManagement
} from '/assets/js/modules/dns-ui.js';
let registeredDomains = [];
export async function render() {
  setupEventListeners();
  await loadDNS();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add-dns');
  const btnClose = document.getElementById('btn-close-dns');
  const modal = document.getElementById('dns-modal');
  if (btnAdd) {
    // We repurpose "Tambah DNS" to a refresh or just hide it
    btnAdd.innerHTML = '<i class="fas fa-sync"></i> Refresh Data';
    btnAdd.addEventListener('click', async () => {
      btnAdd.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
      await loadDNS();
      btnAdd.innerHTML = '<i class="fas fa-sync"></i> Refresh Data';
    });
  }
  // Make functions global for inline onclicks in the table
  window.setupCloudflare = async (domain) => {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Menyiapkan Sistem DNS...',
        text: `Mendaftarkan ${domain} ke Sistem DNS`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }
    try {
      const res = await APIClient.setupCloudflareZone(domain);
      if (res.success) {
        const nsList = res.data.name_servers.map(ns => `<li><strong>${ns}</strong></li>`).join('');
        Swal.fire({
          icon: 'success',
          title: 'Sistem DNS Berhasil Disetup!',
          html: `
            <p>Silakan ubah Nameserver (NS) domain <b>${domain}</b> di penyedia domain Anda (misal DomaiNesia) menjadi:</p>
            <ul style="text-align:left; background:#f3f4f6; padding:15px 30px; border-radius:8px; margin-top:10px;">
              ${nsList}
            </ul>
          `
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };
  window.manageDNS = async (domainName) => {
    openDnsManagement(domainName, window.setupCloudflare);
  };
}
async function loadDNS() {
  const tbody = document.getElementById('dns-table-body');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
        Mencari data domain dari pesanan...
      </td>
    </tr>
  `;
  try {
    const adminId = AuthManager.getUserId();
    const response = await APIClient.getAllTransactions(adminId);
    if (response.success) {
      const orders = response.data || [];
      // Extract unique domains from paid orders
      const domainMap = new Map();
      orders.forEach(o => {
        if (o.paymentStatus === 'paid' && o.domain) {
          if (!domainMap.has(o.domain)) {
            domainMap.set(o.domain, {
              domain: o.domain,
              user: o.customerEmail || o.userId || 'Unknown User'
            });
          }
        }
      });
      registeredDomains = Array.from(domainMap.values());
      if (registeredDomains.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Belum ada pesanan domain lunas.</td></tr>';
      } else {
        renderDNS(registeredDomains, tbody);
      }
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Failed to load DNS domains:', error);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: var(--admin-danger);">${error.message}</td></tr>`;
  }
}

function renderDNS(domainsList, tbody) {
  tbody.innerHTML = '';
  domainsList.forEach(d => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--admin-border)';
    tr.innerHTML = `
      <td style="padding: 16px; font-weight: 600; color: var(--admin-text-main);">
        <i class="fas fa-globe" style="color: var(--admin-primary); margin-right: 8px;"></i> ${d.domain}
      </td>
      <td style="padding: 16px; color: var(--admin-text-muted);">
        ${d.user}
      </td>
      <td style="padding: 16px;">
        <span style="background: rgba(59, 130, 246, 0.1); color: var(--admin-info); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
          <i class="fas fa-cloud"></i> Otomatis
        </span>
      </td>
      <td style="padding: 16px; text-align: right;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="admin-btn" onclick="window.setupCloudflare('${d.domain}')" style="background: rgba(16, 185, 129, 0.1); color: var(--admin-success); padding: 8px 12px; border-radius: 6px;" title="Setup Cloudflare">
            <i class="fas fa-bolt"></i> Setup CF
          </button>
          <button class="admin-btn" onclick="window.manageDNS('${d.domain}')" style="background: rgba(59, 130, 246, 0.1); color: var(--admin-info); padding: 8px 12px; border-radius: 6px;" title="Kelola Record">
            <i class="fas fa-list"></i> Records
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
