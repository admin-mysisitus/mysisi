// Check Session immediately
(function checkSession() {
    const session = sessionStorage.getItem('active_user');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    try {
        const data = JSON.parse(session);
        if (!data || !data.user || data.user.role !== 'santri') {
            window.location.href = 'index.html';
            return;
        }
        activeUser = data.user;
        currentSantriInfo = data.santriInfo;
    } catch (e) {
        sessionStorage.removeItem('active_user');
        window.location.href = 'index.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Setup Profile Box
    document.getElementById('userName').textContent = activeUser.name;
    document.getElementById('userRole').textContent = 'Santri';
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
    const targetPanel = document.getElementById(`panel-santri-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    renderTabContent(tabId);
}

async function renderTabContent(tabId) {
    const db = await fetchDb();
    if (!currentSantriInfo) return;
    const myId = currentSantriInfo.id;
    
    if (tabId === 'dashboard') {
        const myHafalan = db.hafalan.filter(h => Number(h.santri_id) === Number(myId));
        document.getElementById('stat-santri-juz').textContent = `${myHafalan.length ? Math.min(30, Math.floor(myHafalan.length * 1.5)) : 0} Juz`;
        
        const myBilling = db.pembayaran.filter(p => Number(p.santri_id) === Number(myId) && p.status !== 'Lunas');
        const totalTunggakan = myBilling.reduce((sum, p) => sum + Number(p.nominal), 0);
        document.getElementById('stat-santri-spp').textContent = formatRupiah(totalTunggakan);
        
        const myAbsen = db.absensi.filter(a => Number(a.santri_id) === Number(myId) && a.status === 'Hadir').length;
        document.getElementById('stat-santri-absen').textContent = `${myAbsen} Hari`;
        
        const myIzin = db.perizinan.filter(i => Number(i.santri_id) === Number(myId) && i.status === 'Disetujui');
        document.getElementById('stat-santri-izin').textContent = myIzin.length ? 'Izin Aktif' : 'Pondok';
        
        const juzNum = myHafalan.length ? Math.min(30, Math.floor(myHafalan.length * 1.5)) : 0;
        const pct = Math.floor((juzNum / 30) * 100);
        document.getElementById('santri-progress-bar').style.width = `${pct}%`;
        document.getElementById('progress-juz-text').textContent = `${juzNum} Juz`;
        
        const listAnn = document.getElementById('santri-dashboard-pengumuman-list');
        listAnn.innerHTML = '';
        db.pengumuman.slice(-2).reverse().forEach(ann => {
            listAnn.innerHTML += `
                <div class="js-ann-card">
                    <strong class="js-ann-title">${ann.judul}</strong>
                    <p class="js-ann-desc">${ann.isi.substring(0, 70)}...</p>
                    <span class="js-ann-date">${formatDateString(ann.tanggal)}</span>
                </div>
            `;
        });
    } else if (tabId === 'setoran') {
        const tbody = document.getElementById('table-santri-hafalan-body');
        tbody.innerHTML = '';
        const myHafalan = db.hafalan.filter(h => Number(h.santri_id) === Number(myId)).reverse();
        if (myHafalan.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada riwayat setoran.</td></tr>`;
        } else {
            myHafalan.forEach(h => {
                tbody.innerHTML += `
                    <tr>
                        <td>${formatDateString(h.tanggal)}</td>
                        <td><strong>${h.surat}</strong></td>
                        <td>Ayat ${h.ayat_awal} - ${h.ayat_akhir}</td>
                        <td><span class="badge badge-info" class="js-badge-padded">${h.nilai}</span></td>
                        <td><em>${h.catatan || '-'}</em></td>
                    </tr>
                `;
            });
        }
    } else if (tabId === 'nilai') {
        const tbody = document.getElementById('table-santri-nilai-body');
        tbody.innerHTML = '';
        const myNilai = db.nilai.filter(n => Number(n.santri_id) === Number(myId));
        if (myNilai.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Belum ada catatan nilai raport.</td></tr>`;
        } else {
            myNilai.forEach(n => {
                let predikat = "C";
                if (n.nilai >= 85) predikat = "A";
                else if (n.nilai >= 75) predikat = "B";
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${n.mapel}</strong></td>
                        <td>${n.nilai}</td>
                        <td>${n.semester}</td>
                        <td><span class="badge ${predikat==='A'?'badge-success':'badge-info'}">${predikat}</span></td>
                    </tr>
                `;
            });
        }
    } else if (tabId === 'keuangan') {
        const tbody = document.getElementById('table-santri-keuangan-body');
        tbody.innerHTML = '';
        const myBills = db.pembayaran.filter(p => Number(p.santri_id) === Number(myId)).reverse();
        if (myBills.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Tidak ada catatan tagihan.</td></tr>`;
        } else {
            myBills.forEach(p => {
                let statusBadge = '';
                let actionButton = '';
                if (p.status === 'Lunas') {
                    statusBadge = '<span class="badge badge-success">Lunas</span>';
                    actionButton = '<span class="js-text-muted">Terverifikasi</span>';
                } else if (p.status === 'Menunggu Verifikasi') {
                    statusBadge = '<span class="badge badge-warning">Verifikasi Pending</span>';
                    actionButton = '<span class="js-text-muted">Menunggu</span>';
                } else {
                    statusBadge = '<span class="badge badge-danger">Belum Bayar</span>';
                    actionButton = `<button class="ep-btn-sm ep-btn-success btn-bayar" data-id="${p.id}" data-nominal="${p.nominal}"><i class="ph-fill ph-upload-simple"></i> Bayar</button>`;
                }
                tbody.innerHTML += `
                    <tr>
                        <td>${formatDateString(p.tanggal)}</td>
                        <td><strong>${p.jenis}</strong></td>
                        <td>${formatRupiah(p.nominal)}</td>
                        <td>${statusBadge}</td>
                        <td>${actionButton}</td>
                    </tr>
                `;
            });
            
            document.querySelectorAll('.btn-bayar').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('modal-invoice-id').value = btn.dataset.id;
                    document.getElementById('modal-invoice-nominal').textContent = formatRupiah(btn.dataset.nominal);
                    document.getElementById('paymentModal').classList.add('active');
                });
            });
        }
    } else if (tabId === 'perizinan') {
        const tbody = document.getElementById('table-santri-izin-body');
        tbody.innerHTML = '';
        const myIzins = db.perizinan.filter(i => Number(i.santri_id) === Number(myId)).reverse();
        if (myIzins.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada pengajuan perizinan.</td></tr>`;
        } else {
            myIzins.forEach(i => {
                let statusBadge = '';
                if (i.status === 'Disetujui') statusBadge = '<span class="badge badge-success">Disetujui</span>';
                else if (i.status === 'Dalam Pengajuan') statusBadge = '<span class="badge badge-warning">Dalam Pengajuan</span>';
                else if (i.status === 'Ditolak') statusBadge = '<span class="badge badge-danger">Ditolak</span>';
                else statusBadge = '<span class="badge badge-info">Selesai</span>';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${formatDateString(i.tanggal_pengajuan)}</td>
                        <td><strong>${i.jenis}</strong></td>
                        <td>${i.keterangan}</td>
                        <td>${formatDateString(i.tanggal_kembali)}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        }
    } else if (tabId === 'pengumuman') {
        const wall = document.getElementById('santri-pengumuman-wall');
        wall.innerHTML = '';
        db.pengumuman.slice().reverse().forEach(ann => {
            wall.innerHTML += `
                <div class="ep-card">
                    <h3 class="js-modal-title"><i class="ph-fill ph-megaphone"></i> ${ann.judul}</h3>
                    <p class="js-modal-meta"><i class="ph ph-calendar"></i> Diterbitkan: ${formatDateString(ann.tanggal)} | Pembuat: ${ann.pembuat}</p>
                    <p class="js-modal-content">${ann.isi}</p>
                </div>
            `;
        });
    }
}

// Form submissions
document.getElementById('form-santri-setor').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSantriInfo) return;
    const surat = document.getElementById('setor-surat').value;
    const ayat_awal = document.getElementById('setor-ayat-awal').value;
    const ayat_akhir = document.getElementById('setor-ayat-akhir').value;
    
    let res = await callApi('inputSetoran', {
        santri_id: currentSantriInfo.id,
        surat,
        ayat_awal,
        ayat_akhir,
        nilai: 0,
        catatan: "Menunggu Penilaian Online",
        tanggal: new Date().toISOString().split('T')[0]
    });
    if (res.status === 'success') {
        showToast("Setoran hafalan diajukan!");
        document.getElementById('form-santri-setor').reset();
        renderTabContent('setoran');
    } else {
        showToast(res.message, true);
    }
});

document.getElementById('form-santri-izin').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSantriInfo) return;
    const jenis = document.getElementById('izin-jenis').value;
    const tanggal_kembali = document.getElementById('izin-kembali').value;
    const keterangan = document.getElementById('izin-keterangan').value;
    
    let res = await callApi('submitIzin', {
        santri_id: currentSantriInfo.id,
        jenis,
        tanggal_kembali,
        keterangan
    });
    if (res.status === 'success') {
        showToast(res.message);
        document.getElementById('form-santri-izin').reset();
        renderTabContent('perizinan');
    } else {
        showToast(res.message, true);
    }
});

document.getElementById('form-upload-bukti').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-invoice-id').value;
    const file = document.getElementById('payment-proof-file').value;
    
    let res = await callApi('uploadBuktiTransfer', { id, bukti_transfer: file });
    if (res.status === 'success') {
        showToast("Bukti pembayaran berhasil diunggah!");
        document.getElementById('paymentModal').classList.remove('active');
        renderTabContent('keuangan');
    } else {
        showToast(res.message, true);
    }
});

document.getElementById('closePaymentModal').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.remove('active');
});