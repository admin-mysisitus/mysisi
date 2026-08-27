import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
let currentAddons = [];
export async function render() {
  console.log('Admin Addons Module Loaded');
  setupEventListeners();
  await loadAddons();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btn-add-addon');
  const btnClose = document.getElementById('btn-close-addon');
  const modal = document.getElementById('addon-modal');
  const form = document.getElementById('addon-form');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      form.reset();
      document.getElementById('addon-id').readOnly = false;
      document.getElementById('addon-modal-title').textContent = 'Tambah Addon Baru';
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
      const submitBtn = document.getElementById('btn-save-addon');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      submitBtn.disabled = true;
      const addonData = {
        id: document.getElementById('addon-id').value.trim(),
        name: document.getElementById('addon-name').value.trim(),
        description: document.getElementById('addon-description').value.trim(),
        price: parseInt(document.getElementById('addon-price').value),
        duration: parseInt(document.getElementById('addon-duration').value),
        recommended: document.getElementById('addon-recommended').checked,
        order: parseInt(document.getElementById('addon-order').value) || 99
      };
      try {
        const adminId = AuthManager.getUserId();
        const res = await APIClient.saveAdminAddon(adminId, addonData);
        if (res.success) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Addon berhasil disimpan!'
            });
          }
          modal.style.display = 'none';
          await loadAddons();
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
  window.editAddon = (id) => {
    const addon = currentAddons.find(a => a.id === id);
    if (!addon) return;
    document.getElementById('addon-modal-title').textContent = 'Edit Addon';
    document.getElementById('addon-id').value = addon.id;
    document.getElementById('addon-id').readOnly = true;
    document.getElementById('addon-name').value = addon.name;
    document.getElementById('addon-description').value = addon.description || addon.desc || '';
    document.getElementById('addon-price').value = addon.price;
    document.getElementById('addon-duration').value = addon.duration || 1;
    document.getElementById('addon-recommended').checked = addon.recommended || false;
    document.getElementById('addon-order').value = typeof addon.order === 'number' ? addon.order : 99;
    document.getElementById('addon-modal').style.display = 'flex';
  };
  window.deleteAddon = async (id) => {
    if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
        title: 'Hapus Addon?',
        text: `Layanan tambahan (Addon) ini akan dihapus secara permanen.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#4b5563',
        confirmButtonText: 'Ya, Hapus'
      });
      if (result.isConfirmed) {
        try {
          const res = await APIClient.deleteAdminAddon(AuthManager.getUserId(), id);
          if (res.success) {
            Swal.fire('Berhasil!', 'Addon telah dihapus.', 'success');
            await loadAddons();
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
async function loadAddons() {
  const container = document.getElementById('addons-grid');
  if (!container) return;
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-text-muted);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
      Memuat data addon...
    </div>
  `;
  try {
    const adminId = AuthManager.getUserId();
    const response = await APIClient.getAdminAddons(adminId);
    if (response.success) {
      const addons = (response.data || []).sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        return orderA - orderB;
      });
      if (addons.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 20px;">Belum ada addon.</div>';
      } else {
        renderAddons(addons, container);
      }
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error('Failed to load addons:', error);
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--admin-danger);">${error.message}</div>`;
  }
}

function renderAddons(addons, container) {
  container.innerHTML = '';
  currentAddons = addons;
  // Sort: recommended first
  const sortedAddons = addons.sort((a, b) => {
    return (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0);
  });
  sortedAddons.forEach(addon => {
    const card = document.createElement('div');
    card.style.background = 'rgba(0, 0, 0, 0.2)';
    card.style.border = '1px solid var(--admin-border)';
    card.style.borderRadius = '16px';
    card.style.padding = '24px';
    card.style.position = 'relative';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    // Highlight if recommended
    if (addon.recommended) {
      card.style.border = '1px solid var(--admin-primary)';
      card.style.background = 'linear-gradient(145deg, rgba(99, 102, 241, 0.05), rgba(0, 0, 0, 0.2))';
    }
    const formatNumber = (num) => Number(num).toLocaleString('id-ID');
    const displayPrice = addon.price > 0 ? `Rp ${formatNumber(addon.price)}` : 'Gratis';
    let badges = '';
    if (addon.recommended) {
      badges += `<span style="background: rgba(99, 102, 241, 0.2); color: var(--admin-primary); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;"><i class="fas fa-star" style="margin-right:4px;"></i> Recommended</span>`;
    }
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <h3 style="margin: 0; color: var(--admin-text-main); font-size: 1.25rem;">
          ${addon.name}
        </h3>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end;">
          ${badges}
        </div>
      </div>
      
      <div style="margin-bottom: 16px;">
        <span style="font-size: 1.5rem; font-weight: 700; color: var(--admin-text-main);">${displayPrice}</span>
        <span style="color: var(--admin-text-muted);">/${addon.duration} Tahun</span>
      </div>
      
      <p style="color: var(--admin-text-muted); font-size: 0.9rem; margin: 0 0 24px 0; flex-grow: 1;">
        ${addon.description || addon.desc || '-'}
      </p>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="editAddon('${addon.id}')" class="admin-btn" style="flex: 1; padding: 10px; background: rgba(99, 102, 241, 0.1); color: var(--admin-primary); border: 1px solid rgba(99, 102, 241, 0.2);">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteAddon('${addon.id}')" class="admin-btn" style="padding: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}