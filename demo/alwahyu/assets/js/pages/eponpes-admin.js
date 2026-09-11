// Check Session immediately
(function checkSession() {
    const session = sessionStorage.getItem('active_user');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const data = JSON.parse(session);
        if (!data || !data.user || data.user.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        activeUser = data.user;
    } catch (e) {
        sessionStorage.removeItem('active_user');
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Setup Profile Box
    document.getElementById('userName').textContent = activeUser.name;
    document.getElementById('userRole').textContent = 'Administrator';
    const initials = activeUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    document.getElementById('userAvatar').textContent = initials;

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Setup navigation tabs
    const menuButtons = document.querySelectorAll('.ep-menu-btn[data-tab]');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            const tabTitle = btn.textContent.trim();
            switchTab(tabId, tabTitle);
        });
    });

    // Initial render
    switchTab('dashboard', 'Dashboard');
});

function switchTab(tabId, tabTitle) {
    currentTabId = tabId;
    document.getElementById('contentTitle').textContent = tabTitle;
    
    // Hide all panels
    document.querySelectorAll('.ep-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected panel
    const targetPanel = document.getElementById(`panel-admin-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    renderTabContent(tabId);
}

async function renderTabContent(tabId) {
    const db = await fetchDb();
    
    if (tabId === 'dashboard') {
        document.getElementById('stat-admin-santri').textContent = `${db.santri.length} Santri`;
        document.getElementById('stat-admin-pengurus').textContent = `${db.pengurus.length} Ustadz`;
        
        const lunas = db.pembayaran.filter(p => p.status === 'Lunas').length;
        const tunggakan = db.pembayaran.filter(p => p.status !== 'Lunas').length;
        document.getElementById('stat-admin-lunas').textContent = `${lunas} Lunas`;
        document.getElementById('stat-admin-tunggakan').textContent = `${tunggakan} Pending`;
    }
    
    else if (tabId === 'santri') {
        const tbody = document.getElementById('table-admin-santri-body');
        tbody.innerHTML = '';
        db.santri.forEach(s => {
            const u = db.users.find(user => Number(user.id) === Number(s.user_id));
            tbody.innerHTML += `
                <tr>
                    <td>${s.nis}</td>
                    <td><strong>${u ? u.name : 'Santri'}</strong></td>
                    <td>${s.kelas}</td>
                    <td>${s.kamar}</td>
                    <td>${s.wa_wali}</td>
                    <td><span class="badge badge-success">${s.status_aktif}</span></td>
                </tr>
            `;
        });
    }
    
    else if (tabId === 'pengurus') {
        const tbody = document.getElementById('table-admin-pengurus-body');
        tbody.innerHTML = '';
        db.pengurus.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nip}</td>
                    <td><strong>${p.nama}</strong></td>
                    <td>${p.jabatan}</td>
                    <td>${p.mapel}</td>
                </tr>
            `;
        });
    }
    
    else if (tabId === 'verifikasi') {
        const tbody = document.getElementById('table-admin-verifikasi-body');
        tbody.innerHTML = '';
        const pendingVer = db.pembayaran.filter(p => p.status === 'Menunggu Verifikasi').reverse();
        if (pendingVer.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Tidak ada tagihan menunggu verifikasi.</td></tr>`;
        } else {
            pendingVer.forEach(p => {
                const s = db.santri.find(item => Number(item.id) === Number(p.santri_id));
                const u = s ? db.users.find(user => Number(user.id) === Number(s.user_id)) : null;
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${u ? u.name : 'Santri'}</strong> (${s ? s.nis : '-'})</td>
                        <td>${p.jenis}</td>
                        <td>${formatRupiah(p.nominal)}</td>
                        <td><a href="#" class="js-link-bukti"><i class="ph-fill ph-image"></i> ${p.bukti_transfer}</a></td>
                        <td>
                            <button class="ep-btn-sm ep-btn-success btn-pay-approve" data-id="${p.id}"><i class="ph-fill ph-check"></i> Verifikasi</button>
                            <button class="ep-btn-sm ep-btn-danger btn-pay-reject" data-id="${p.id}"><i class="ph-fill ph-x"></i> Tolak</button>
                        </td>
                    </tr>
                `;
            });
            
            // Add event listeners for verifikasi
            document.querySelectorAll('.btn-pay-approve').forEach(btn => {
                btn.addEventListener('click', async () => {
                    let res = await callApi('verifikasiPembayaran', { id: btn.dataset.id, status: 'Lunas' });
                    if (res.status === 'success') {
                        showToast(res.message);
                        renderTabContent('verifikasi');
                    } else {
                        showToast(res.message, true);
                    }
                });
            });
            
            document.querySelectorAll('.btn-pay-reject').forEach(btn => {
                btn.addEventListener('click', async () => {
                    let res = await callApi('verifikasiPembayaran', { id: btn.dataset.id, status: 'Ditolak' });
                    if (res.status === 'success') {
                        showToast(res.message);
                        renderTabContent('verifikasi');
                    } else {
                        showToast(res.message, true);
                    }
                });
            });
        }
    }
    
    else if (tabId === 'laporan') {
        const tbody = document.getElementById('table-admin-laporan-keuangan-body');
        tbody.innerHTML = '';
        
        let totalMasuk = 0;
        let totalTunggakan = 0;
        
        db.pembayaran.slice().reverse().forEach(p => {
            const s = db.santri.find(item => Number(item.id) === Number(p.santri_id));
            const u = s ? db.users.find(user => Number(user.id) === Number(s.user_id)) : null;
            
            if (p.status === 'Lunas') {
                totalMasuk += Number(p.nominal);
            } else {
                totalTunggakan += Number(p.nominal);
            }
            
            let statusBadge = '';
            if (p.status === 'Lunas') statusBadge = '<span class="badge badge-success">Lunas</span>';
            else if (p.status === 'Menunggu Verifikasi') statusBadge = '<span class="badge badge-warning">Pending</span>';
            else statusBadge = '<span class="badge badge-danger">Tunggakan</span>';
            
            tbody.innerHTML += `
                <tr>
                    <td>#INV00${p.id}</td>
                    <td><strong>${u ? u.name : 'Santri'}</strong></td>
                    <td>${p.jenis}</td>
                    <td>${formatRupiah(p.nominal)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
        
        document.getElementById('laporan-total-masuk').textContent = formatRupiah(totalMasuk);
        document.getElementById('laporan-total-tunggakan').textContent = formatRupiah(totalTunggakan);
    }
}

// ADMIN: Buat Tagihan Massal
document.getElementById('btn-admin-buat-tagihan').addEventListener('click', async () => {
    const db = await fetchDb();
    let count = 0;
    
    for (let s of db.santri) {
        if (s.status_aktif === 'Aktif') {
            let res = await callApi('addPembayaran', {
                santri_id: s.id,
                jenis: "Syahriyah Bulanan (Juni 2026)",
                nominal: 1200000
            });
            if (res.status === 'success') {
                count++;
            }
        }
    }
    showToast(`Berhasil menerbitkan ${count} invoice tagihan baru!`);
    renderTabContent('dashboard');
});

// ADMIN: Daftarkan Santri Baru
document.getElementById('form-admin-santri').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('as-nama').value;
    const nis = document.getElementById('as-nis').value;
    const email = document.getElementById('as-email').value;
    const kelas = document.getElementById('as-kelas').value;
    const kamar = document.getElementById('as-kamar').value;
    const password = document.getElementById('as-password').value;
    
    const nama_ayah = document.getElementById('as-ayah').value;
    const nama_ibu = document.getElementById('as-ibu').value;
    const wa_wali = document.getElementById('as-wali-wa').value;
    
    let res = await callApi('addSantri', { name, nis, email, kelas, kamar, password, nama_ayah, nama_ibu, wa_wali });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-admin-santri').reset();
        document.getElementById('as-password').value = 'santri123';
        renderTabContent('santri');
    } else {
        showToast(res.message, true);
    }
});

// ADMIN: Daftarkan Pengurus Baru
document.getElementById('form-admin-pengurus').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('ap-nama').value;
    const nip = document.getElementById('ap-nip').value;
    const email = document.getElementById('ap-email').value;
    const password = document.getElementById('ap-password').value;
    const jabatan = document.getElementById('ap-jabatan').value;
    const mapel = document.getElementById('ap-mapel').value;
    
    let res = await callApi('addPengurus', { name, nip, email, password, jabatan, mapel });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-admin-pengurus').reset();
        document.getElementById('ap-password').value = 'pengurus123';
        renderTabContent('pengurus');
    } else {
        showToast(res.message, true);
    }
});

// ADMIN: Terbitkan Pengumuman
document.getElementById('form-admin-pengumuman').addEventListener('submit', async (e) => {
    e.preventDefault();
    const judul = document.getElementById('ap-judul').value;
    const isi = document.getElementById('ap-isi').value;
    
    let res = await callApi('addPengumuman', { judul, isi, pembuat: activeUser.name });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-admin-pengumuman').reset();
    } else {
        showToast(res.message, true);
    }
});