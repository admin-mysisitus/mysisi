// ====================== FUNGSI UMUM ======================
// Fungsi Toggle Tampilan Password
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.currentTarget.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Fungsi Pindah Tab
function switchTab(tabName) {
    // Sembunyikan semua tab konten
    const tabContents = document.querySelectorAll('.pengurus-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Nonaktifkan semua tombol tab
    const tabButtons = document.querySelectorAll('.pengurus-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Tampilkan tab yang dipilih
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Fungsi Logout
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEY_PENGURUS);
        window.location.href = 'login-pengurus.html';
    }
}

// Fungsi Reset Form
function resetFormSantri() { document.getElementById('form-santri').reset(); }
function resetFormKeuangan() { document.getElementById('form-keuangan').reset(); }
function resetFormAbsensi() { document.getElementById('form-absensi').reset(); }
function resetFormPelanggaran() { document.getElementById('form-pelanggaran').reset(); }
function resetFormRaport() { document.getElementById('form-raport').reset(); }
function resetFormPengurus() { document.getElementById('form-pengurus').reset(); }

// ====================== INISIALISASI HALAMAN ======================
document.addEventListener('DOMContentLoaded', () => {
    // Ambil data pengurus dari localStorage
    const pengurusData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_PENGURUS));
    
    // Cek apakah sudah login
    if (!pengurusData) {
        window.location.href = 'login-pengurus.html';
        return;
    }

    // Tampilkan nama dan bidang pengurus
    document.getElementById('nama-pengurus').textContent = pengurusData.nama;
    document.getElementById('bidang-pengurus').textContent = pengurusData.bidang;

    // Tampilkan tab manajemen pengurus hanya jika role Admin
    if (pengurusData.bidang === 'Admin') {
        document.getElementById('tab-btn-pengurus').style.display = 'block';
    }

    // Inisialisasi semua data saat halaman dimuat
    loadDashboardData();
    loadSantriData();
    loadKeuanganData();
    loadAbsensiData();
    loadPelanggaranData();
    loadRaportData();
    if (pengurusData.bidang === 'Admin') loadPengurusData();

    // Setup event listener untuk semua form
    setupFormSantri();
    setupFormKeuangan();
    setupFormAbsensi();
    setupFormPelanggaran();
    setupFormRaport();
    if (pengurusData.bidang === 'Admin') setupFormPengurus();

    // Event untuk tombol logout
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Event untuk tombol tab navigasi
    const tabButtons = document.querySelectorAll('.pengurus-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Event untuk tombol toggle password
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            togglePassword(this.dataset.target);
        });
    });

    // Event untuk tombol reset form
    document.getElementById('btn-reset-santri').addEventListener('click', resetFormSantri);
    document.getElementById('btn-reset-keuangan').addEventListener('click', resetFormKeuangan);
    document.getElementById('btn-reset-absensi').addEventListener('click', resetFormAbsensi);
    document.getElementById('btn-reset-pelanggaran').addEventListener('click', resetFormPelanggaran);
    document.getElementById('btn-reset-raport').addEventListener('click', resetFormRaport);
    document.getElementById('btn-reset-pengurus').addEventListener('click', resetFormPengurus);

    // Event untuk tombol cari data
    document.getElementById('btn-cari-santri').addEventListener('click', cariSantri);
    document.getElementById('btn-cari-keuangan').addEventListener('click', cariKeuangan);
    document.getElementById('btn-cari-absensi').addEventListener('click', cariAbsensi);
    document.getElementById('btn-cari-pelanggaran').addEventListener('click', cariPelanggaran);
    document.getElementById('btn-cari-raport').addEventListener('click', cariRaport);
    document.getElementById('btn-cari-pengurus').addEventListener('click', cariPengurus);
});

// ====================== DASHBOARD ======================
async function loadDashboardData() {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getDashboardData'
        });

        const result = await response.json();
        if (result.success) {
            const data = result.data;
            document.getElementById('total-santri').textContent = data.totalSantri;
            document.getElementById('total-lunas').textContent = data.totalLunas;
            document.getElementById('total-tidak-hadir').textContent = data.totalTidakHadir;
            document.getElementById('total-pelanggaran').textContent = data.totalPelanggaran;

            // Buat grafik santri per jenjang
            const ctx = document.getElementById('chart-santri-per-jenjang').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['MI', 'MTs', 'MA'],
                    datasets: [{
                        label: 'Jumlah Santri',
                        data: [data.jumlahMI, data.jumlahMTs, data.jumlahMA],
                        backgroundColor: ['#2b6cb0', '#4299e1', '#63b3ed']
                    }]
                },
                options: { responsive: true }
            });

            document.getElementById('loading-dashboard').style.display = 'none';
            document.getElementById('content-dashboard').style.display = 'block';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error load dashboard:', error);
        alert('Gagal memuat data dashboard.');
    }
}

// ====================== DATA SANTRI ======================
async function loadSantriData() {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getSantriData'
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-santri');
            tbody.innerHTML = '';
            
            result.data.forEach(santri => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${santri.id}</td>
                    <td>${santri.nama}</td>
                    <td>${santri.jenjang}</td>
                    <td>${santri.kelas}</td>
                    <td>${santri.namaWali}</td>
                    <td>${santri.hpWali}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editSantri('${santri.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteSantri('${santri.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-santri').style.display = 'none';
            document.getElementById('table-santri').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load santri:', error);
    }
}

function setupFormSantri() {
    const form = document.getElementById('form-santri');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('santri-id').value,
            nama: document.getElementById('santri-nama').value,
            jenjang: document.getElementById('santri-jenjang').value,
            kelas: document.getElementById('santri-kelas').value,
            tglLahir: document.getElementById('santri-tgl-lahir').value,
            alamat: document.getElementById('santri-alamat').value,
            namaWali: document.getElementById('santri-nama-wali').value,
            hpWali: document.getElementById('santri-hp-wali').value
        };

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=saveSantriData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadSantriData();
            }
        } catch (error) {
            console.error('Error save santri:', error);
        }
    });
}

async function editSantri(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getSantriById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const santri = result.data;
            document.getElementById('santri-id').value = santri.id;
            document.getElementById('santri-nama').value = santri.nama;
            document.getElementById('santri-jenjang').value = santri.jenjang;
            document.getElementById('santri-kelas').value = santri.kelas;
            document.getElementById('santri-tgl-lahir').value = santri.tglLahir;
            document.getElementById('santri-alamat').value = santri.alamat;
            document.getElementById('santri-nama-wali').value = santri.namaWali;
            document.getElementById('santri-hp-wali').value = santri.hpWali;
        }
    } catch (error) {
        console.error('Error edit santri:', error);
    }
}

async function deleteSantri(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data santri ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteSantriData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadSantriData();
    } catch (error) {
        console.error('Error delete santri:', error);
    }
}

// ====================== DATA KEUANGAN ======================
async function loadKeuanganData() {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=getKeuanganData'
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-keuangan');
            tbody.innerHTML = '';
            
            result.data.forEach(keu => {
                const statusTag = keu.status === 'Lunas' ? 'tag-lunas' : 'tag-belum';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${keu.id}</td>
                    <td>${keu.idSantri}</td>
                    <td>${keu.bulan}</td>
                    <td>Rp ${keu.nominal.toLocaleString('id-ID')}</td>
                    <td><span class="tag ${statusTag}">${keu.status}</span></td>
                    <td>${keu.tglBayar || '-'}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editKeuangan('${keu.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteKeuangan('${keu.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-keuangan').style.display = 'none';
            document.getElementById('table-keuangan').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load keuangan:', error);
    }
}

function setupFormKeuangan() {
    const form = document.getElementById('form-keuangan');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('keuangan-id').value,
            idSantri: document.getElementById('keuangan-id-santri').value,
            bulan: document.getElementById('keuangan-bulan').value,
            nominal: parseInt(document.getElementById('keuangan-nominal').value),
            status: document.getElementById('keuangan-status').value,
            tglBayar: document.getElementById('keuangan-tgl-bayar').value || ''
        };

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=saveKeuanganData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadKeuanganData();
            }
        } catch (error) {
            console.error('Error save keuangan:', error);
        }
    });
}

async function editKeuangan(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getKeuanganById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const keu = result.data;
            document.getElementById('keuangan-id').value = keu.id;
            document.getElementById('keuangan-id-santri').value = keu.idSantri;
            document.getElementById('keuangan-bulan').value = keu.bulan;
            document.getElementById('keuangan-nominal').value = keu.nominal;
            document.getElementById('keuangan-status').value = keu.status;
            document.getElementById('keuangan-tgl-bayar').value = keu.tglBayar || '';
        }
    } catch (error) {
        console.error('Error edit keuangan:', error);
    }
}

async function deleteKeuangan(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data keuangan ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteKeuanganData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadKeuanganData();
    } catch (error) {
        console.error('Error delete keuangan:', error);
    }
}

// ====================== DATA ABSENSI ======================
async function loadAbsensiData(filter = '') {
    try {
        const body = filter ? `action=getAbsensiData&filter=${encodeURIComponent(filter)}` : 'action=getAbsensiData';
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-absensi');
            tbody.innerHTML = '';
            
            result.data.forEach(abs => {
                let statusTag = '';
                switch(abs.status) {
                    case 'Hadir': statusTag = 'tag-hadir'; break;
                    case 'Sakit': statusTag = 'tag-sakit'; break;
                    case 'Izin': statusTag = 'tag-izin'; break;
                    case 'Alpa': statusTag = 'tag-alpa'; break;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${abs.id}</td>
                    <td>${abs.idSantri}</td>
                    <td>${abs.namaSantri}</td>
                    <td>${abs.tanggal}</td>
                    <td><span class="tag ${statusTag}">${abs.status}</span></td>
                    <td>${abs.keterangan || '-'}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editAbsensi('${abs.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteAbsensi('${abs.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-absensi').style.display = 'none';
            document.getElementById('table-absensi').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load absensi:', error);
    }
}

// Fungsi cari/filter absensi
async function cariAbsensi() {
    const search = document.getElementById('search-absensi').value;
    const bulan = document.getElementById('filter-absensi-bulan').value;
    const filter = JSON.stringify({ search, bulan });
    
    document.getElementById('loading-absensi').style.display = 'block';
    document.getElementById('table-absensi').style.display = 'none';
    await loadAbsensiData(filter);
}

function setupFormAbsensi() {
    const form = document.getElementById('form-absensi');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('absensi-id').value,
            idSantri: document.getElementById('absensi-id-santri').value,
            tanggal: document.getElementById('absensi-tanggal').value,
            status: document.getElementById('absensi-status').value,
            keterangan: document.getElementById('absensi-keterangan').value || ''
        };

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=saveAbsensiData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadAbsensiData();
            }
        } catch (error) {
            console.error('Error save absensi:', error);
        }
    });
}

async function editAbsensi(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getAbsensiById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const abs = result.data;
            document.getElementById('absensi-id').value = abs.id;
            document.getElementById('absensi-id-santri').value = abs.idSantri;
            document.getElementById('absensi-tanggal').value = abs.tanggal;
            document.getElementById('absensi-status').value = abs.status;
            document.getElementById('absensi-keterangan').value = abs.keterangan || '';
        }
    } catch (error) {
        console.error('Error edit absensi:', error);
    }
}

async function deleteAbsensi(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteAbsensiData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadAbsensiData();
    } catch (error) {
        console.error('Error delete absensi:', error);
    }
}

// ====================== DATA PELANGGARAN ======================
async function loadPelanggaranData(filter = '') {
    try {
        const body = filter ? `action=getPelanggaranData&filter=${encodeURIComponent(filter)}` : 'action=getPelanggaranData';
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-pelanggaran');
            tbody.innerHTML = '';
            
            result.data.forEach(pel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pel.id}</td>
                    <td>${pel.idSantri}</td>
                    <td>${pel.namaSantri}</td>
                    <td>${pel.tanggal}</td>
                    <td>${pel.jenis}</td>
                    <td>${pel.tingkat}</td>
                    <td>${pel.sanksi}</td>
                    <td>${pel.status}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editPelanggaran('${pel.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deletePelanggaran('${pel.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-pelanggaran').style.display = 'none';
            document.getElementById('table-pelanggaran').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load pelanggaran:', error);
    }
}

// Fungsi cari pelanggaran
async function cariPelanggaran() {
    const search = document.getElementById('search-pelanggaran').value;
    const filter = JSON.stringify({ search });
    
    document.getElementById('loading-pelanggaran').style.display = 'block';
    document.getElementById('table-pelanggaran').style.display = 'none';
    await loadPelanggaranData(filter);
}

function setupFormPelanggaran() {
    const form = document.getElementById('form-pelanggaran');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('pelanggaran-id').value,
            idSantri: document.getElementById('pelanggaran-id-santri').value,
            tanggal: document.getElementById('pelanggaran-tanggal').value,
            jenis: document.getElementById('pelanggaran-jenis').value,
            tingkat: document.getElementById('pelanggaran-tingkat').value,
            sanksi: document.getElementById('pelanggaran-sanksi').value,
            status: document.getElementById('pelanggaran-status').value
        };

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=savePelanggaranData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadPelanggaranData();
            }
        } catch (error) {
            console.error('Error save pelanggaran:', error);
        }
    });
}

async function editPelanggaran(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getPelanggaranById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const pel = result.data;
            document.getElementById('pelanggaran-id').value = pel.id;
            document.getElementById('pelanggaran-id-santri').value = pel.idSantri;
            document.getElementById('pelanggaran-tanggal').value = pel.tanggal;
            document.getElementById('pelanggaran-jenis').value = pel.jenis;
            document.getElementById('pelanggaran-tingkat').value = pel.tingkat;
            document.getElementById('pelanggaran-sanksi').value = pel.sanksi;
            document.getElementById('pelanggaran-status').value = pel.status;
        }
    } catch (error) {
        console.error('Error edit pelanggaran:', error);
    }
}

async function deletePelanggaran(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data pelanggaran ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deletePelanggaranData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadPelanggaranData();
    } catch (error) {
        console.error('Error delete pelanggaran:', error);
    }
}

// ====================== DATA RAPORT ======================
async function loadRaportData(filter = '') {
    try {
        const body = filter ? `action=getRaportData&filter=${encodeURIComponent(filter)}` : 'action=getRaportData';
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-raport');
            tbody.innerHTML = '';
            
            result.data.forEach(rap => {
                const rataRata = ((parseInt(rap.mtk) + parseInt(rap.bindo) + parseInt(rap.aqidah) + parseInt(rap.barab)) / 4).toFixed(1);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rap.id}</td>
                    <td>${rap.idSantri}</td>
                    <td>${rap.namaSantri}</td>
                    <td>${rap.semester}</td>
                    <td>${rataRata}</td>
                    <td>${rap.catatan || '-'}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editRaport('${rap.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteRaport('${rap.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-raport').style.display = 'none';
            document.getElementById('table-raport').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load raport:', error);
    }
}

// Fungsi cari raport
async function cariRaport() {
    const search = document.getElementById('search-raport').value;
    const filter = JSON.stringify({ search });
    
    document.getElementById('loading-raport').style.display = 'block';
    document.getElementById('table-raport').style.display = 'none';
    await loadRaportData(filter);
}

function setupFormRaport() {
    const form = document.getElementById('form-raport');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('raport-id').value,
            idSantri: document.getElementById('raport-id-santri').value,
            semester: document.getElementById('raport-semester').value,
            mtk: document.getElementById('raport-mtk').value,
            bindo: document.getElementById('raport-bindo').value,
            aqidah: document.getElementById('raport-aqidah').value,
            barab: document.getElementById('raport-barab').value,
            catatan: document.getElementById('raport-catatan').value || ''
        };

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=saveRaportData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadRaportData();
            }
        } catch (error) {
            console.error('Error save raport:', error);
        }
    });
}

async function editRaport(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getRaportById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const rap = result.data;
            document.getElementById('raport-id').value = rap.id;
            document.getElementById('raport-id-santri').value = rap.idSantri;
            document.getElementById('raport-semester').value = rap.semester;
            document.getElementById('raport-mtk').value = rap.mtk;
            document.getElementById('raport-bindo').value = rap.bindo;
            document.getElementById('raport-aqidah').value = rap.aqidah;
            document.getElementById('raport-barab').value = rap.barab;
            document.getElementById('raport-catatan').value = rap.catatan || '';
        }
    } catch (error) {
        console.error('Error edit raport:', error);
    }
}

async function deleteRaport(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data raport ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteRaportData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadRaportData();
    } catch (error) {
        console.error('Error delete raport:', error);
    }
}

// ====================== DATA PENGURUS ======================
async function loadPengurusData(filter = '') {
    try {
        const body = filter ? `action=getPengurusData&filter=${encodeURIComponent(filter)}` : 'action=getPengurusData';
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-pengurus');
            tbody.innerHTML = '';
            
            result.data.forEach(pg => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pg.id}</td>
                    <td>${pg.nama}</td>
                    <td>${pg.username}</td>
                    <td>${pg.bidang}</td>
                    <td>${pg.status}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editPengurus('${pg.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deletePengurus('${pg.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-pengurus').style.display = 'none';
            document.getElementById('table-pengurus').style.display = 'block';
        }
    } catch (error) {
        console.error('Error load pengurus:', error);
    }
}

// Fungsi cari pengurus
async function cariPengurus() {
    const search = document.getElementById('search-pengurus').value;
    const filter = JSON.stringify({ search });
    
    document.getElementById('loading-pengurus').style.display = 'block';
    document.getElementById('table-pengurus').style.display = 'none';
    await loadPengurusData(filter);
}

function setupFormPengurus() {
    const form = document.getElementById('form-pengurus');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            id: document.getElementById('pengurus-id').value,
            nama: document.getElementById('pengurus-nama').value,
            username: document.getElementById('pengurus-username').value,
            password: document.getElementById('pengurus-password').value || '',
            bidang: document.getElementById('pengurus-bidang').value,
            status: document.getElementById('pengurus-status').value
        };

        // Validasi password jika baru ditambah
        if (data.password && data.password.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
            alert(`Password minimal ${APP_CONFIG.MIN_PASSWORD_LENGTH} karakter!`);
            return;
        }

        try {
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=savePengurusData&data=${encodeURIComponent(JSON.stringify(data))}`
            });

            const result = await response.json();
            alert(result.message);
            if (result.success) {
                form.reset();
                loadPengurusData();
            }
        } catch (error) {
            console.error('Error save pengurus:', error);
        }
    });
}

async function editPengurus(id) {
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getPengurusById&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        if (result.success) {
            const pg = result.data;
            document.getElementById('pengurus-id').value = pg.id;
            document.getElementById('pengurus-nama').value = pg.nama;
            document.getElementById('pengurus-username').value = pg.username;
            document.getElementById('pengurus-bidang').value = pg.bidang;
            document.getElementById('pengurus-status').value = pg.status;
            // Kosongkan password agar tidak terisi
            document.getElementById('pengurus-password').value = '';
        }
    } catch (error) {
        console.error('Error edit pengurus:', error);
    }
}

async function deletePengurus(id) {
    // Jangan izinkan menghapus akun sendiri
    const pengurusData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_PENGURUS));
    if (pengurusData.id === id) {
        alert('Tidak dapat menghapus akun Anda sendiri!');
        return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus data pengurus ini?')) return;
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deletePengurusData&id=${encodeURIComponent(id)}`
        });

        const result = await response.json();
        alert(result.message);
        if (result.success) loadPengurusData();
    } catch (error) {
        console.error('Error delete pengurus:', error);
    }
}

// ====================== FUNGSI PENCARIAN LAIN ======================
async function cariSantri() {
    const search = document.getElementById('search-santri').value;
    const filter = JSON.stringify({ search });
    
    document.getElementById('loading-santri').style.display = 'block';
    document.getElementById('table-santri').style.display = 'none';
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getSantriData&filter=${encodeURIComponent(filter)}`
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-santri');
            tbody.innerHTML = '';
            
            result.data.forEach(santri => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${santri.id}</td>
                    <td>${santri.nama}</td>
                    <td>${santri.jenjang}</td>
                    <td>${santri.kelas}</td>
                    <td>${santri.namaWali}</td>
                    <td>${santri.hpWali}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editSantri('${santri.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteSantri('${santri.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-santri').style.display = 'none';
            document.getElementById('table-santri').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cari santri:', error);
    }
}

async function cariKeuangan() {
    const search = document.getElementById('search-keuangan').value;
    const filter = JSON.stringify({ search });
    
    document.getElementById('loading-keuangan').style.display = 'block';
    document.getElementById('table-keuangan').style.display = 'none';
    
    try {
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getKeuanganData&filter=${encodeURIComponent(filter)}`
        });

        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-keuangan');
            tbody.innerHTML = '';
            
            result.data.forEach(keu => {
                const statusTag = keu.status === 'Lunas' ? 'tag-lunas' : 'tag-belum';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${keu.id}</td>
                    <td>${keu.idSantri}</td>
                    <td>${keu.bulan}</td>
                    <td>Rp ${keu.nominal.toLocaleString('id-ID')}</td>
                    <td><span class="tag ${statusTag}">${keu.status}</span></td>
                    <td>${keu.tglBayar || '-'}</td>
                    <td>
                        <button class="btn btn-warning btn-small" onclick="editKeuangan('${keu.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small ml-1" onclick="deleteKeuangan('${keu.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById('loading-keuangan').style.display = 'none';
            document.getElementById('table-keuangan').style.display = 'block';
        }
    } catch (error) {
        console.error('Error cari keuangan:', error);
    }
}
