import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentTx = [];
export async function render() {
  setupEventListeners();
  await loadTransactions();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add-tx');
  const btnClose = document.getElementById('btn-close-tx');
  const modal = document.getElementById('tx-modal');
  const form = document.getElementById('tx-form');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      form.reset();
      document.getElementById('tx-inv').value = '';
      document.getElementById('tx-modal-title').textContent = 'Buat Invoice Manual';
      modal.style.display = 'flex';
    });
  }
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-save-tx');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      submitBtn.disabled = true;
      const txData = {
        inv: document.getElementById('tx-inv').value.trim(),
        name: document.getElementById('tx-name').value.trim(),
        email: document.getElementById('tx-email').value.trim(),
        item: document.getElementById('tx-item').value.trim(),
        domain: document.getElementById('tx-domain').value.trim(),
        total: parseInt(document.getElementById('tx-total').value),
        status: document.getElementById('tx-status').value
      };
      try {
        const adminId = AuthManager.getUserId();
        const res = await APIClient.saveAdminTransaction(adminId, txData);
        if (res.success) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Transaksi berhasil disimpan!'
            });
          }
          modal.style.display = 'none';
          await loadTransactions();
        } else {
          throw new Error(res.message);
        }
      } catch (error) {
        console.error(error);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.message
          });
        }
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  window.editTx = (inv) => {
    const tx = currentTx.find(t => t.inv === inv);
    if (!tx) return;
    document.getElementById('tx-modal-title').textContent = 'Edit Invoice';
    document.getElementById('tx-inv').value = tx.inv;
    document.getElementById('tx-name').value = tx.name;
    document.getElementById('tx-email').value = tx.email;
    document.getElementById('tx-item').value = tx.item;
    document.getElementById('tx-domain').value = tx.domain || '';
    document.getElementById('tx-total').value = tx.total;
    document.getElementById('tx-status').value = tx.status || 'unpaid';
    document.getElementById('tx-modal').style.display = 'flex';
  };
  window.deleteTx = async (inv) => {
    if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
        title: 'Batalkan Transaksi?',
        text: `Transaksi ${inv} akan dibatalkan/digagalkan.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Ya, Batalkan'
      });
      if (result.isConfirmed) {
        try {
          const res = await APIClient.deleteAdminTransaction(AuthManager.getUserId(), inv);
          if (res.success) {
            Swal.fire('Berhasil!', 'Transaksi telah dibatalkan.', 'success');
            await loadTransactions();
          } else {
            throw new Error(res.message);
          }
        } catch (err) {
          Swal.fire('Error', err.message, 'error');
        }
      }
    }
  };
  const searchInput = document.getElementById('search-tx');
  const filterSelect = document.getElementById('filter-status');
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyFilters);
}

function applyFilters() {
  const tbody = document.getElementById('tx-table-body');
  if (!tbody) return;
  const searchVal = (document.getElementById('search-tx')?.value || '').toLowerCase();
  const filterVal = document.getElementById('filter-status')?.value || 'all';
  let filteredTx = currentTx;
  if (searchVal) {
    filteredTx = filteredTx.filter(tx => {
      const txInv = (tx.inv || tx.orderId || '').toLowerCase();
      return txInv.includes(searchVal) || (tx.email && tx.email.toLowerCase().includes(searchVal)) || (tx.name && tx.name.toLowerCase().includes(searchVal));
    });
  }
  if (filterVal !== 'all') {
    filteredTx = filteredTx.filter(tx => {
      const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
      if (filterVal === 'paid') return status === 'paid' || status === 'settlement' || status === 'capture' || status === 'selesai' || status === 'success';
      if (filterVal === 'unpaid') return status === 'unpaid' || status === 'pending' || status === 'tertunda';
      if (filterVal === 'failed') return status === 'failed' || status === 'expire' || status === 'cancel' || status === 'deny';
      return true;
    });
  }
  updateStats(currentTx); // Stats usually show based on ALL data, or filtered? Usually ALL data.
  renderTxTable(filteredTx, tbody);
}

function updateStats(allTx) {
  let revenue = 0;
  let pendingAmount = 0;
  let successCount = 0;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  allTx.forEach(tx => {
    const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
    const total = parseInt(tx.total || 0);
    const date = new Date(tx.date || tx.createdAt || new Date());
    if (status === 'paid' || status === 'settlement' || status === 'capture' || status === 'selesai' || status === 'success') {
      revenue += total;
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        successCount++;
      }
    } else if (status === 'unpaid' || status === 'pending' || status === 'tertunda') {
      pendingAmount += total;
    }
  });
  const statRevenue = document.getElementById('stat-revenue');
  const statPending = document.getElementById('stat-pending');
  const statSuccess = document.getElementById('stat-success');
  if (statRevenue) statRevenue.textContent = `Rp ${revenue.toLocaleString('id-ID')}`;
  if (statPending) statPending.textContent = `Rp ${pendingAmount.toLocaleString('id-ID')}`;
  if (statSuccess) statSuccess.textContent = successCount;
}
async function loadTransactions() {
  const tbody = document.getElementById('tx-table-body');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 40px; color: var(--admin-text-muted);">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
        Memuat data transaksi...
      </td>
    </tr>
  `;
  try {
    const adminId = AuthManager.getUserId();
    const response = await APIClient.getAllTransactions(adminId);
    if (response.success && response.data) {
      if (response.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Belum ada transaksi.</td></tr>';
        updateStats([]);
      } else {
        currentTx = response.data;
        applyFilters();
      }
    } else {
      throw new Error(response.message || 'Gagal memuat transaksi');
    }
  } catch (error) {
    console.error('Failed to load transactions:', error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--admin-danger);">Error: ${error.message}</td></tr>`;
  }
}

function renderTxTable(mockTx, tbody) {
  tbody.innerHTML = '';
  if (mockTx.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tidak ada transaksi yang sesuai.</td></tr>';
    return;
  }
  mockTx.forEach(tx => {
    // Map Firebase properties to expected table properties
    const inv = tx.inv || tx.orderId || '-';
    const date = tx.date || tx.createdAt || new Date().toISOString();
    const name = tx.name || '-';
    const email = tx.email || '-';
    const item = tx.item || tx.domain || tx.packageId || '-';
    const total = tx.total || 0;
    const status = (tx.status || tx.paymentStatus || 'unpaid').toLowerCase();
    let statusBg, statusColor;
    if (status === 'paid' || status === 'settlement' || status === 'capture') {
      statusBg = 'rgba(16, 185, 129, 0.1)';
      statusColor = 'var(--admin-success)';
    } else if (status === 'pending' || status === 'unpaid') {
      statusBg = 'rgba(245, 158, 11, 0.1)';
      statusColor = 'var(--admin-warning)';
    } else {
      statusBg = 'rgba(239, 68, 68, 0.1)';
      statusColor = 'var(--admin-danger)';
    }
    const rowOpacity = (status === 'failed' || status === 'expire' || status === 'cancel' || status === 'deny') ? '0.6' : '1';
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--admin-border)';
    tr.style.opacity = rowOpacity;
    tr.innerHTML = `
      <td style="padding: 16px;">
        <p style="margin: 0; font-weight: 600; color: var(--admin-primary);">${inv}</p>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--admin-text-muted);">${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </td>
      <td style="padding: 16px;">
        <p style="margin: 0; font-weight: 500;">${name}</p>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--admin-text-muted);">${email}</p>
      </td>
      <td style="padding: 16px; color: var(--admin-text-muted);">
        ${item}
      </td>
      <td style="padding: 16px; font-weight: 600;">
        Rp ${parseInt(total || 0).toLocaleString('id-ID')}
      </td>
      <td style="padding: 16px;">
        <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase;">
          ${status === 'settlement' || status === 'capture' ? 'PAID' : status}
        </span>
      </td>
      <td style="padding: 16px; text-align: right;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="admin-btn" onclick="window.editTx('${inv}')" style="background: rgba(99, 102, 241, 0.1); color: var(--admin-primary); padding: 8px; border-radius: 6px;" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="admin-btn" onclick="window.deleteTx('${inv}')" style="background: rgba(239, 68, 68, 0.1); color: var(--admin-danger); padding: 8px; border-radius: 6px;" title="Batalkan">
            <i class="fas fa-ban"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
