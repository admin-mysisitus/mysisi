import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentDomains = [];
export async function render() {
  setupEventListeners();
  await loadDomains();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add-domain');
  const btnClose = document.getElementById('btn-close-domain');
  const modal = document.getElementById('domain-modal');
  const form = document.getElementById('domain-form');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      form.reset();
      document.getElementById('domain-ext').readOnly = false;
      document.getElementById('domain-modal-title').textContent = 'Tambah Ekstensi Domain';
      document.getElementById('domain-order').value = '99';
      document.getElementById('domain-color').value = '#2563eb';
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
      const submitBtn = document.getElementById('btn-save-domain');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      submitBtn.disabled = true;
      const ext = document.getElementById('domain-ext').value.trim();
      let oldPrice = document.getElementById('domain-oldprice').value;
      const domainData = {
        ext: ext,
        registration: parseInt(document.getElementById('domain-registration').value),
        renewal: parseInt(document.getElementById('domain-renewal').value),
        order: parseInt(document.getElementById('domain-order').value) || 99,
        oldPrice: oldPrice ? parseInt(oldPrice) : null,
        info: document.getElementById('domain-info').value.trim(),
        highlight: document.getElementById('domain-highlight').value,
        label: document.getElementById('domain-label').value.trim(),
        color: document.getElementById('domain-color').value
      };
      try {
        const adminId = AuthManager.getUserId();
        const res = await APIClient.saveAdminDomain(adminId, domainData);
        if (res.success) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Domain berhasil disimpan!'
            });
          }
          modal.style.display = 'none';
          await loadDomains();
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
  window.editDomain = (extKey) => {
    // Find the domain that matches the modified key or exact ext
    const d = currentDomains.find(item => {
      const key = item.ext.replace('.', '').replace(/\./g, '_');
      return key === extKey || item.ext === extKey;
    });
    if (!d) return;
    document.getElementById('domain-modal-title').textContent = 'Edit Ekstensi Domain';
    document.getElementById('domain-ext').value = d.ext;
    document.getElementById('domain-ext').readOnly = true;
    document.getElementById('domain-order').value = typeof d.order === 'number' ? d.order : 99;
    document.getElementById('domain-oldprice').value = d.oldPrice || '';
    document.getElementById('domain-registration').value = d.registration || d.newPrice || '';
    document.getElementById('domain-renewal').value = d.renewal || d.registration || d.newPrice || '';
    document.getElementById('domain-info').value = d.info || '';
    document.getElementById('domain-highlight').value = d.highlight || 'none';
    document.getElementById('domain-label').value = d.label || '';
    document.getElementById('domain-color').value = d.color || '#ea4335';
    document.getElementById('domain-modal').style.display = 'flex';
  };
  window.deleteDomain = async (extKey) => {
    if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
        title: 'Hapus Ekstensi?',
        text: `Ekstensi domain ini akan dihapus secara permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Ya, Hapus'
      });
      if (result.isConfirmed) {
        try {
          // fetch by exact ext matching the key
          const d = currentDomains.find(item => {
            const key = item.ext.replace('.', '').replace(/\./g, '_');
            return key === extKey || item.ext === extKey;
          });
          const extToDel = d ? d.ext : extKey;
          const res = await APIClient.deleteAdminDomain(AuthManager.getUserId(), extToDel);
          if (res.success) {
            Swal.fire('Berhasil!', 'Ekstensi telah dihapus.', 'success');
            await loadDomains();
          } else {
            throw new Error(res.message);
          }
        } catch (err) {
          Swal.fire('Error', err.message, 'error');
        }
      }
    }
  };
}
async function loadDomains() {
  const container = document.getElementById('domains-grid');
  if (!container) return;
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-text-muted);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
      Memuat data domain...
    </div>
  `;
  try {
    const adminId = AuthManager.getUserId();
    const response = await APIClient.getAdminDomains(adminId);
    if (response.success) {
      const domains = response.data || [];
      if (domains.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px;">Belum ada ekstensi domain.</div>';
      } else {
        renderDomains(domains, container);
      }
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Failed to load domains:', error);
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-danger);">${error.message}</div>`;
  }
}

function renderDomains(domains, container) {
  container.innerHTML = '';
  currentDomains = domains;
  // Sort domains by order first, then highlight
  const sortedDomains = domains.sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    if (orderA !== orderB) return orderA - orderB;
    // Fallback sort
    const hlOrder = {
      best: 3,
      cheap: 2,
      business: 1,
      none: 0
    };
    return (hlOrder[b.highlight] || 0) - (hlOrder[a.highlight] || 0);
  });
  sortedDomains.forEach(domain => {
    const extKey = domain.ext.replace('.', '').replace(/\./g, '_');
    const hasDiscount = domain.oldPrice && domain.oldPrice > domain.registration;
    let discountPercent = 0;
    if (hasDiscount) {
      discountPercent = Math.round((1 - domain.registration / domain.oldPrice) * 100);
    }
    const card = document.createElement('div');
    card.style.background = 'rgba(0, 0, 0, 0.2)';
    card.style.border = '1px solid var(--admin-border)';
    card.style.borderRadius = '16px';
    card.style.padding = '24px';
    card.style.position = 'relative';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    // Highlight border for "best"
    if (domain.highlight === 'best') {
      card.style.border = '1px solid var(--admin-primary)';
      card.style.background = 'linear-gradient(145deg, rgba(99, 102, 241, 0.05), rgba(0, 0, 0, 0.2))';
    }
    const formatNumber = (num) => Number(num).toLocaleString('id-ID');
    let badges = '';
    if (domain.label) {
      badges += `<span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${domain.label}</span>`;
    }
    if (discountPercent > 0) {
      badges += `<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">-${discountPercent}%</span>`;
    }
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <h3 style="margin: 0; color: ${domain.color || 'var(--admin-text-main)'}; font-size: 1.5rem;">
          ${domain.ext}
        </h3>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
          ${badges}
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        ${hasDiscount ? `<span style="color: var(--admin-text-muted); text-decoration: line-through; font-size: 0.9rem; margin-right: 8px;">Rp ${formatNumber(domain.oldPrice)}</span>` : ''}
        <span style="font-size: 1.5rem; font-weight: 700; color: var(--admin-text-main);">Rp ${formatNumber(domain.registration)}</span>
      </div>
      <div style="margin-bottom: 16px; color: var(--admin-text-muted); font-size: 0.85rem;">
        Perpanjangan: Rp ${formatNumber(domain.renewal || domain.registration)}
      </div>
      
      <p style="color: var(--admin-text-muted); font-size: 0.9rem; margin: 0 0 24px 0; flex-grow: 1;">
        ${domain.info || '-'}
      </p>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="editDomain('${extKey}')" class="admin-btn" style="flex: 1; padding: 10px; background: rgba(99, 102, 241, 0.1); color: var(--admin-primary); border: 1px solid rgba(99, 102, 241, 0.2);">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteDomain('${extKey}')" class="admin-btn" style="padding: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}
