import APIClient from './unified-api.js';

export async function openDnsManagement(domainName, onSetupCloudflare = null) {
  if (typeof Swal === 'undefined') {
    alert('SweetAlert is required');
    return;
  }

  let records = [];
  let isEditing = null;

  const loadRecords = async () => {
    Swal.fire({
      title: 'Memuat DNS...',
      text: `Menghubungkan ke server DNS untuk ${domainName}`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await APIClient.getDnsRecords(domainName);
      if (!res.success) {
        if (onSetupCloudflare) {
          Swal.fire({
            title: 'Domain Belum Setup',
            text: res.message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Setup Sekarang'
          }).then(r => {
            if (r.isConfirmed) onSetupCloudflare(domainName);
          });
        } else {
          Swal.fire('Error', res.message, 'error');
        }
        return;
      }
      records = res.data || [];
      renderModal();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const renderModal = () => {
    const rowsHtml = records.length === 0
      ? `<tr><td colspan="6" style="text-align:center; padding: 40px 20px; color: #94a3b8; font-size: 0.9rem;">Belum ada record DNS yang ditambahkan.</td></tr>`
      : records.map(r => {
        if (isEditing === r.id) {
          return `
              <tr class="editing-row">
                <td data-label="Type" style="padding:8px;">
                  <select id="edit-type-${r.id}" class="dns-input dns-input-sm">
                    ${['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'].map(t => `<option value="${t}" ${t === r.type ? 'selected' : ''}>${t}</option>`).join('')}
                  </select>
                </td>
                <td data-label="Name" style="padding:8px;"><input id="edit-name-${r.id}" value="${r.name}" class="dns-input dns-input-sm"></td>
                <td data-label="Content" style="padding:8px;"><input id="edit-content-${r.id}" value="${r.content}" class="dns-input dns-input-sm"></td>
                <td data-label="TTL" style="padding:8px;">
                  <select id="edit-ttl-${r.id}" class="dns-input dns-input-sm">
                    <option value="1" ${r.ttl === 1 ? 'selected' : ''}>Auto</option>
                    <option value="120" ${r.ttl === 120 ? 'selected' : ''}>2 min</option>
                    <option value="3600" ${r.ttl === 3600 ? 'selected' : ''}>1 hr</option>
                  </select>
                </td>
                <td data-label="Proxy" style="text-align:center;">
                  <label class="dns-checkbox-label" style="justify-content:center;">
                    <input type="checkbox" id="edit-proxied-${r.id}" ${r.proxied ? 'checked' : ''} style="width:18px;height:18px;">
                  </label>
                </td>
                <td data-label="Aksi" style="text-align:center;">
                  <div style="display:flex; gap:4px; justify-content:flex-end;">
                    <button class="dns-icon-btn btn-save btn-save-record" data-id="${r.id}" title="Simpan"><i class="fas fa-check"></i></button>
                    <button class="dns-icon-btn btn-cancel btn-cancel-edit" data-id="${r.id}" title="Batal"><i class="fas fa-times"></i></button>
                  </div>
                </td>
              </tr>
            `;
        }
        return `
            <tr>
              <td data-label="Type" class="record-type">${r.type}</td>
              <td data-label="Name">${r.name}</td>
              <td data-label="Content" class="record-content" title="${r.content}">${r.content}</td>
              <td data-label="TTL">${r.ttl === 1 ? 'Auto' : r.ttl}</td>
              <td data-label="Proxy" style="text-align:center;">
                ${r.proxied ? '<i class="fas fa-cloud proxy-active" title="Proxied"></i>' : '<i class="fas fa-cloud proxy-inactive" title="DNS Only"></i>'}
              </td>
              <td data-label="Aksi" style="text-align:center;">
                <div style="display:flex; gap:4px; justify-content:flex-end;">
                  <button class="dns-icon-btn btn-edit btn-edit-record" data-id="${r.id}" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="dns-icon-btn btn-del btn-delete-record" data-id="${r.id}" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          `;
      }).join('');

    const html = `
      <style>
        .dns-container { font-family: 'Inter', system-ui, -apple-system, sans-serif; text-align: left; }
        .dns-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-right: 40px; }
        .dns-title { font-size: clamp(1.125rem, 3vw, 1.25rem); color: #0f172a; font-weight: 700; margin: 0; }
        .dns-title span { color: #3b82f6; }
        .btn-refresh { background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-refresh:hover { background: #f1f5f9; color: #0f172a; transform: translateY(-1px); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .btn-refresh:active { transform: scale(0.97); }
        .dns-table-wrapper { border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; margin-bottom: 24px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .dns-table { width: 100%; border-collapse: collapse; }
        .dns-table th { background: #f8fafc; padding: 14px 16px; font-weight: 600; color: #475569; font-size: 0.8125rem; text-align: left; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .dns-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #334155; vertical-align: middle; }
        .dns-table tr:last-child td { border-bottom: none; }
        .dns-table tr:hover:not(.editing-row) { background: #f8fafc; }
        .editing-row { background: #f8fafc; border-left: 3px solid #3b82f6; }
        .record-type { font-weight: 700; color: #334155; }
        .record-content { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #64748b; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8125rem; }
        .proxy-active { color: #f59e0b; font-size: 1.1rem; }
        .proxy-inactive { color: #cbd5e1; font-size: 1.1rem; }
        .dns-icon-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9rem; }
        .dns-icon-btn:hover { background: #e2e8f0; }
        .btn-edit { color: #3b82f6; } .btn-edit:hover { background: rgba(59, 130, 246, 0.1); }
        .btn-del { color: #ef4444; } .btn-del:hover { background: rgba(239, 68, 68, 0.1); }
        .btn-save { color: #10b981; } .btn-save:hover { background: rgba(16, 185, 129, 0.1); }
        .btn-cancel { color: #64748b; }
        .dns-form-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01); }
        .dns-form-title { display: block; font-weight: 600; color: #0f172a; margin-bottom: 16px; font-size: 0.9375rem; display: flex; align-items: center; gap: 8px; }
        .dns-form-grid { display: grid; grid-template-columns: 100px 1.5fr 2fr 100px auto auto; gap: 12px; align-items: center; }
        .dns-input { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.875rem; outline: none; transition: all 0.2s; box-sizing: border-box; background: #fff; font-family: inherit; }
        .dns-input-sm { padding: 6px 8px; font-size: 0.8125rem; border-radius: 6px; }
        .dns-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .dns-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: #475569; cursor: pointer; user-select: none; font-weight: 500; }
        .btn-primary { background: #3b82f6; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center; height: 40px; box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3); }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2); }
        .btn-primary:active { transform: scale(0.97); }
        @media (max-width: 768px) {
          .dns-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
          .dns-table, .dns-table tbody, .dns-table tr, .dns-table td, .dns-table th { display: block; }
          .dns-table thead { display: none; }
          .dns-table tr { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; padding: 8px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
          .dns-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
          .dns-table td:last-child { border-bottom: none; }
          .dns-table td::before { content: attr(data-label); font-weight: 600; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }
          .record-content { flex: 1; text-align: right; white-space: nowrap; overflow-x: auto; overflow-y: hidden; max-width: calc(100vw - 120px); -webkit-overflow-scrolling: touch; }
          /* Optional: Hide scrollbar for cleaner look if you prefer, but auto is fine */
          .record-content::-webkit-scrollbar { height: 4px; }
          .record-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .dns-form-grid { grid-template-columns: 1fr; gap: 16px; }
          .dns-table-wrapper { border: none; background: transparent; box-shadow: none; }
          .dns-form-card { padding: 16px; }
          .btn-primary { width: 100%; height: 44px; }
        }
      </style>
      <div class="dns-container">
        <div class="dns-header">
          <h3 class="dns-title">DNS: <span>${domainName}</span></h3>
          <button id="btn-refresh-dns" class="btn-refresh"><i class="fas fa-sync"></i> Refresh Data</button>
        </div>
        
        <div class="dns-table-wrapper">
          <table class="dns-table">
            <thead>
              <tr>
                <th style="width: 12%;">Type</th>
                <th style="width: 25%;">Name</th>
                <th style="width: 35%;">Content</th>
                <th style="width: 10%;">TTL</th>
                <th style="width: 8%; text-align:center;">Proxy</th>
                <th style="width: 10%; text-align:right; padding-right:24px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div class="dns-form-card">
          <strong class="dns-form-title"><i class="fas fa-plus-circle" style="color:#3b82f6;"></i> Tambah Record Baru</strong>
          <div class="dns-form-grid">
            <select id="new-type" class="dns-input">
              <option value="A">A</option><option value="AAAA">AAAA</option><option value="CNAME">CNAME</option>
              <option value="TXT">TXT</option><option value="MX">MX</option><option value="NS">NS</option>
              <option value="SRV">SRV</option><option value="CAA">CAA</option>
            </select>
            <input type="text" id="new-name" class="dns-input" placeholder="@ untuk root" />
            <input type="text" id="new-content" class="dns-input" placeholder="Target / IP Address" />
            <select id="new-ttl" class="dns-input">
              <option value="1">Auto</option><option value="120">2 min</option><option value="3600">1 hr</option>
            </select>
            <label class="dns-checkbox-label" title="Proxy (Orange Cloud)">
              <input type="checkbox" id="new-proxied" style="width:18px;height:18px;"> Proxy
            </label>
            <button id="btn-add-record" class="btn-primary">Tambah Record</button>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      html: html,
      width: '900px',
      showConfirmButton: false,
      showCloseButton: true,
      didRender: () => {
        const popup = Swal.getPopup();

        popup.querySelector('#btn-refresh-dns').onclick = loadRecords;

        popup.querySelector('#btn-add-record').onclick = async (e) => {
          const btn = e.target;
          const type = popup.querySelector('#new-type').value;
          const name = popup.querySelector('#new-name').value.trim() || '@';
          const content = popup.querySelector('#new-content').value.trim();
          const ttl = parseInt(popup.querySelector('#new-ttl').value);
          const proxied = popup.querySelector('#new-proxied').checked;

          if (!content) return Swal.showValidationMessage('Content wajib diisi');
          Swal.resetValidationMessage();

          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          try {
            const res = await APIClient.addDnsRecord(domainName, { type, name, content, ttl, proxied });
            if (!res.success) throw new Error(res.message);
            await loadRecords();
          } catch (err) {
            Swal.showValidationMessage(err.message);
            btn.disabled = false;
            btn.innerHTML = 'Tambah';
          }
        };

        popup.addEventListener('click', async (e) => {
          const btnDel = e.target.closest('.btn-delete-record');
          if (btnDel) {
            if (!confirm('Yakin menghapus record ini secara permanen?')) return;
            const id = btnDel.dataset.id;
            btnDel.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            try {
              const res = await APIClient.deleteDnsRecord(domainName, id);
              if (!res.success) throw new Error(res.message);
              records = records.filter(r => r.id !== id);
              renderModal();
            } catch (err) {
              Swal.showValidationMessage(err.message);
              btnDel.innerHTML = '<i class="fas fa-trash"></i>';
            }
          }

          const btnEdit = e.target.closest('.btn-edit-record');
          if (btnEdit) {
            isEditing = btnEdit.dataset.id;
            renderModal();
          }

          const btnCancel = e.target.closest('.btn-cancel-edit');
          if (btnCancel) {
            isEditing = null;
            renderModal();
          }

          const btnSave = e.target.closest('.btn-save-record');
          if (btnSave) {
            const id = btnSave.dataset.id;
            const type = popup.querySelector(`#edit-type-${id}`).value;
            const name = popup.querySelector(`#edit-name-${id}`).value.trim();
            const content = popup.querySelector(`#edit-content-${id}`).value.trim();
            const ttl = parseInt(popup.querySelector(`#edit-ttl-${id}`).value);
            const proxied = popup.querySelector(`#edit-proxied-${id}`).checked;

            btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            try {
              const res = await APIClient.editDnsRecord(domainName, id, { type, name, content, ttl, proxied });
              if (!res.success) throw new Error(res.message);
              isEditing = null;
              await loadRecords();
            } catch (err) {
              Swal.showValidationMessage(err.message);
              btnSave.innerHTML = '<i class="fas fa-check"></i>';
            }
          }
        });
      }
    });
  };

  await loadRecords();
}
