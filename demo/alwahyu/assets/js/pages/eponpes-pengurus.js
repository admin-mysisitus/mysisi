// Check Session immediately
(function checkSession() {
    const session = sessionStorage.getItem('active_user');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const data = JSON.parse(session);
        if (!data || !data.user || data.user.role !== 'pengurus') {
            window.location.href = 'index.html';
            return;
        }
        activeUser = data.user;
        currentPengurusInfo = data.pengurusInfo;
    } catch (e) {
        sessionStorage.removeItem('active_user');
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Setup Profile Box
    document.getElementById('userName').textContent = activeUser.name;
    document.getElementById('userRole').textContent = 'Pengurus / Ustadz';
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
    const targetPanel = document.getElementById(`panel-pengurus-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    renderTabContent(tabId);
}

async function renderTabContent(tabId) {
    const db = await fetchDb();
    
    if (tabId === 'dashboard') {
        document.getElementById('stat-pengurus-santri').textContent = `${db.santri.length} Santri`;
        document.getElementById('stat-pengurus-setoran').textContent = `${db.hafalan.length} Catatan`;
        
        const pendingIzins = db.perizinan.filter(i => i.status === 'Dalam Pengajuan').length;
        document.getElementById('stat-pengurus-izin-pending').textContent = `${pendingIzins} Izin`;
        
        // Render bimbingan table
        const tbody = document.getElementById('table-pengurus-bimbingan-body');
        tbody.innerHTML = '';
        db.santri.forEach(s => {
            const u = db.users.find(user => Number(user.id) === Number(s.user_id));
            tbody.innerHTML += `
                <tr>
                    <td>${s.nis}</td>
                    <td><strong>${u ? u.name : 'Santri'}</strong></td>
                    <td>${s.kelas}</td>
                    <td>${s.kamar}</td>
                    <td><span class="badge badge-success">${s.status_aktif}</span></td>
                </tr>
            `;
        });
    }
    
    else if (tabId === 'setoran') {
        // Populate select santri
        const select = document.getElementById('ps-santri');
        select.innerHTML = '';
        db.santri.forEach(s => {
            const u = db.users.find(user => Number(user.id) === Number(s.user_id));
            select.innerHTML += `<option value="${s.id}">${s.nis} - ${u ? u.name : 'Santri'}</option>`;
        });
        
        // Render recent log table
        const tbody = document.getElementById('table-pengurus-log-setoran-body');
        tbody.innerHTML = '';
        db.hafalan.slice().reverse().forEach(h => {
            const s = db.santri.find(item => Number(item.id) === Number(h.santri_id));
            const u = s ? db.users.find(user => Number(user.id) === Number(s.user_id)) : null;
            
            tbody.innerHTML += `
                <tr>
                    <td>${formatDateString(h.tanggal)}</td>
                    <td><strong>${u ? u.name : 'Santri'}</strong></td>
                    <td>${h.surat}</td>
                    <td>Ayat ${h.ayat_awal} - ${h.ayat_akhir}</td>
                    <td><span class="badge badge-info">${h.nilai}</span></td>
                    <td><em>${h.catatan || '-'}</em></td>
                </tr>
            `;
        });
    }
    
    else if (tabId === 'nilai') {
        const select = document.getElementById('pn-santri');
        select.innerHTML = '';
        db.santri.forEach(s => {
            const u = db.users.find(user => Number(user.id) === Number(s.user_id));
            select.innerHTML += `<option value="${s.id}">${s.nis} - ${u ? u.name : 'Santri'}</option>`;
        });
    }
    
    else if (tabId === 'absensi') {
        // Setup default date to today
        document.getElementById('pa-tanggal').value = new Date().toISOString().split('T')[0];
        
        // Reload list when class changes
        const loadAbsenList = () => {
            const kls = document.getElementById('pa-kelas').value;
            const filterSantri = db.santri.filter(s => s.kelas === kls);
            const tbody = document.getElementById('table-pengurus-absensi-body');
            tbody.innerHTML = '';
            
            if (filterSantri.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center">Tidak ada santri di kelas ini.</td></tr>`;
            } else {
                filterSantri.forEach(s => {
                    const u = db.users.find(user => Number(user.id) === Number(s.user_id));
                    // Cari status absensi hari ini jika ada
                    const curDate = document.getElementById('pa-tanggal').value;
                    const existingAbs = db.absensi.find(a => Number(a.santri_id) === Number(s.id) && a.tanggal === curDate);
                    const status = existingAbs ? existingAbs.status : 'Hadir';
                    
                    tbody.innerHTML += `
                        <tr>
                            <td>${s.nis}</td>
                            <td><strong>${u ? u.name : 'Santri'}</strong></td>
                            <td>
                                <label class="js-radio-hadir"><input type="radio" name="abs-${s.id}" value="Hadir" ${status==='Hadir'?'checked':''}> Hadir</label>
                                <label class="js-radio-izin"><input type="radio" name="abs-${s.id}" value="Izin" ${status==='Izin'?'checked':''}> Izin</label>
                                <label class="js-radio-sakit"><input type="radio" name="abs-${s.id}" value="Sakit" ${status==='Sakit'?'checked':''}> Sakit</label>
                                <label class="js-radio-alpha"><input type="radio" name="abs-${s.id}" value="Alpha" ${status==='Alpha'?'checked':''}> Alpha</label>
                            </td>
                        </tr>
                    `;
                });
            }
        };
        
        document.getElementById('pa-kelas').onchange = loadAbsenList;
        document.getElementById('pa-tanggal').onchange = loadAbsenList;
        loadAbsenList();
    }
    
    else if (tabId === 'perizinan') {
        const tbody = document.getElementById('table-pengurus-izin-body');
        tbody.innerHTML = '';
        const pendingIzins = db.perizinan.filter(i => i.status === 'Dalam Pengajuan').reverse();
        if (pendingIzins.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">Tidak ada permohonan izin pending.</td></tr>`;
        } else {
            pendingIzins.forEach(i => {
                const s = db.santri.find(item => Number(item.id) === Number(i.santri_id));
                const u = s ? db.users.find(user => Number(user.id) === Number(s.user_id)) : null;
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${u ? u.name : 'Santri'}</strong> (${s ? s.kelas : '-'})</td>
                        <td>${i.jenis}</td>
                        <td>${i.keterangan}</td>
                        <td>${formatDateString(i.tanggal_kembali)}</td>
                        <td><span class="badge badge-warning">Pending</span></td>
                        <td>
                            <button class="ep-btn-sm ep-btn-success btn-izin-approve" data-id="${i.id}"><i class="ph-fill ph-check"></i> Setujui</button>
                            <button class="ep-btn-sm ep-btn-danger btn-izin-reject" data-id="${i.id}"><i class="ph-fill ph-x"></i> Tolak</button>
                        </td>
                    </tr>
                `;
            });
            
            // Add event listeners for approval
            document.querySelectorAll('.btn-izin-approve').forEach(btn => {
                btn.addEventListener('click', async () => {
                    let res = await callApi('updateIzinStatus', { id: btn.dataset.id, status: 'Disetujui' });
                    if (res.status === 'success') {
                        showToast(res.message);
                        renderTabContent('perizinan');
                    } else {
                        showToast(res.message, true);
                    }
                });
            });
            
            document.querySelectorAll('.btn-izin-reject').forEach(btn => {
                btn.addEventListener('click', async () => {
                    let res = await callApi('updateIzinStatus', { id: btn.dataset.id, status: 'Ditolak' });
                    if (res.status === 'success') {
                        showToast(res.message);
                        renderTabContent('perizinan');
                    } else {
                        showToast(res.message, true);
                    }
                });
            });
        }
    }
}

// PENGURUS: Input Setoran Hafalan
document.getElementById('form-pengurus-setoran').addEventListener('submit', async (e) => {
    e.preventDefault();
    const santri_id = document.getElementById('ps-santri').value;
    const surat = document.getElementById('ps-surat').value;
    const ayat_awal = document.getElementById('ps-ayat-awal').value;
    const ayat_akhir = document.getElementById('ps-ayat-akhir').value;
    const nilai = document.getElementById('ps-nilai').value;
    const tanggal = document.getElementById('ps-tanggal').value;
    const catatan = document.getElementById('ps-catatan').value;
    
    let res = await callApi('inputSetoran', { santri_id, surat, ayat_awal, ayat_akhir, nilai, tanggal, catatan });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-pengurus-setoran').reset();
        document.getElementById('ps-tanggal').value = new Date().toISOString().split('T')[0];
        renderTabContent('setoran');
    } else {
        showToast(res.message, true);
    }
});

// Set default date for setoran form
document.getElementById('ps-tanggal').value = new Date().toISOString().split('T')[0];

// PENGURUS: Input Nilai Pelajaran
document.getElementById('form-pengurus-nilai').addEventListener('submit', async (e) => {
    e.preventDefault();
    const santri_id = document.getElementById('pn-santri').value;
    const mapel = document.getElementById('pn-mapel').value;
    const nilai = document.getElementById('pn-nilai').value;
    const semester = document.getElementById('pn-semester').value;
    
    let res = await callApi('inputNilai', { santri_id, mapel, nilai, semester });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-pengurus-nilai').reset();
        renderTabContent('nilai');
    } else {
        showToast(res.message, true);
    }
});

// PENGURUS: Save Absensi Massal
document.getElementById('form-pengurus-absensi').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tanggal = document.getElementById('pa-tanggal').value;
    
    const radios = document.querySelectorAll('#table-pengurus-absensi-body input[type="radio"]:checked');
    let errors = 0;
    
    for (let radio of radios) {
        const sId = radio.name.split('-')[1];
        const status = radio.value;
        
        let res = await callApi('inputAbsensi', { santri_id: sId, tanggal, status });
        if (res.status !== 'success') {
            errors++;
        }
    }
    
    if (errors === 0) {
        showToast("Absensi berhasil disimpan!");
    } else {
        showToast(`Absensi tersimpan dengan ${errors} error`, true);
    }
});