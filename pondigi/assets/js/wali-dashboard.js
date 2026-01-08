// ====================== FUNGSI UMUM ======================
// Fungsi Pindah Tab
function switchTab(tabName) {
    // Sembunyikan semua tab konten
    const tabContents = document.querySelectorAll('.wali-tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Nonaktifkan semua tombol tab
    const tabButtons = document.querySelectorAll('.wali-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Tampilkan tab yang dipilih
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Fungsi Logout
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem? Semua sesi akan diakhiri.')) {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEY_WALI);
        window.location.href = 'index.html'; // Arahkan ke halaman utama pilihan login
    }
}

// ====================== INISIALISASI HALAMAN ======================
document.addEventListener('DOMContentLoaded', () => {
    // Ambil data wali dari localStorage
    const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
    
    // Cek apakah sudah login
    if (!waliData || typeof waliData.id === 'undefined') {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        window.location.href = 'login-wali.html';
        return;
    }

    // Tampilkan nama wali
    document.getElementById('nama-wali').textContent = waliData.nama || '-';

    // Set nilai default filter absensi dengan bulan saat ini
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    document.getElementById('filter-absensi').value = currentMonth;

    // Inisialisasi semua data saat halaman dimuat
    loadProfilSantri();
    loadAbsensiSantri(currentMonth); // Load data bulan saat ini secara default
    loadKeuanganSantri();
    loadPelanggaranSantri();
    loadRaportSantri();

    // Event Listener untuk tombol navigasi tab
    const tabButtons = document.querySelectorAll('.wali-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Event Listener untuk tombol logout
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Event Listener untuk tombol filter absensi
    document.getElementById('btn-filter-absensi').addEventListener('click', filterDataAbsensi);
});

// ====================== PROFIL SANTRI ======================
async function loadProfilSantri() {
    try {
        const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getSantriByWali&idWali=${encodeURIComponent(waliData.id)}`
        });

        // Cek apakah response valid
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
            const santri = result.data.santri;
            const ringkasan = result.data.ringkasan;

            // Validasi data sebelum menampilkan
            if (!santri) throw new Error('Data santri tidak ditemukan dalam respons');

            // Isi data profil
            document.getElementById('profil-nama').textContent = santri.nama || '-';
            document.getElementById('profil-id').textContent = santri.id || '-';
            document.getElementById('profil-jenjang').textContent = santri.jenjang || '-';
            document.getElementById('profil-kelas').textContent = santri.kelas || '-';
            // PERBAIKAN: Penanganan tanggal yang tidak valid
            document.getElementById('profil-tgl-lahir').textContent = santri.tglLahir 
                ? new Date(santri.tglLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                : '-';
            document.getElementById('profil-alamat').textContent = santri.alamat || '-';
            document.getElementById('profil-nama-wali').textContent = santri.namaWali || '-';
            document.getElementById('profil-hp-wali').textContent = santri.hpWali || '-';

            // Isi ringkasan
            document.getElementById('profil-presentase-hadir').textContent = `${ringkasan.presentaseHadir || 0}%`;
            document.getElementById('profil-rata-nilai').textContent = ringkasan.rataRataNilai 
                ? ringkasan.rataRataNilai.toFixed(1) 
                : '0';
            document.getElementById('profil-status-biaya').textContent = ringkasan.statusBiaya || '-';
            document.getElementById('profil-jumlah-pelanggaran').textContent = ringkasan.jumlahPelanggaran || 0;

            // Buat grafik nilai mata pelajaran - PERBAIKAN: Hapus grafik lama jika ada
            const ctx = document.getElementById('chart-nilai-santri').getContext('2d');
            if (window.nilaiChart) window.nilaiChart.destroy(); // Hapus instance lama
            
            window.nilaiChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Matematika', 'Bahasa Indonesia', 'Aqidah Akhlak', 'Bahasa Arab'],
                    datasets: [{
                        label: 'Nilai (0-100)',
                        data: [
                            ringkasan.nilaiMTK || 0,
                            ringkasan.nilaiBindo || 0,
                            ringkasan.nilaiAqidah || 0,
                            ringkasan.nilaiBarab || 0
                        ],
                        backgroundColor: 'rgba(47, 133, 90, 0.2)',
                        borderColor: 'rgba(47, 133, 90, 1)',
                        pointBackgroundColor: 'rgba(47, 133, 90, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(47, 133, 90, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: { 
                            min: 0, 
                            max: 100,
                            ticks: { stepSize: 10 }
                        }
                    },
                    plugins: {
                        legend: { position: 'top' }
                    }
                }
            });

            document.getElementById('loading-profil').style.display = 'none';
            document.getElementById('content-profil').style.display = 'block';
        } else {
            alert(`Gagal memuat profil: ${result.message}`);
            document.getElementById('loading-profil').textContent = 'Gagal memuat data profil.';
        }
    } catch (error) {
        console.error('Error load profil:', error);
        alert(`Terjadi kesalahan saat memuat profil: ${error.message}`);
        document.getElementById('loading-profil').textContent = 'Gagal memuat data profil.';
    }
}

// ====================== RIWAYAT ABSENSI ======================
async function loadAbsensiSantri(filterBulan = '') {
    try {
        const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
        const body = filterBulan 
            ? `action=getAbsensiByWali&idWali=${encodeURIComponent(waliData.id)}&bulan=${encodeURIComponent(filterBulan)}`
            : `action=getAbsensiByWali&idWali=${encodeURIComponent(waliData.id)}`;

        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-absensi');
            tbody.innerHTML = '';
            
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center py-3">Tidak ada data absensi untuk periode ini</td></tr>`;
            } else {
                // Urutkan data dari tanggal terbaru ke terlama
                const sortedData = result.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                
                sortedData.forEach(abs => {
                    let statusTag = '';
                    let statusText = abs.status || '-';
                    switch(statusText) {
                        case 'Hadir': statusTag = 'tag-hadir'; break;
                        case 'Sakit': statusTag = 'tag-sakit'; break;
                        case 'Izin': statusTag = 'tag-izin'; break;
                        case 'Alpa': statusTag = 'tag-alpa'; break;
                        default: statusTag = 'tag-default';
                    }

                    const row = document.createElement('tr');
                    // PERBAIKAN: Penanganan tanggal yang tidak valid
                    const tanggal = abs.tanggal 
                        ? new Date(abs.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : '-';
                    row.innerHTML = `
                        <td>${tanggal}</td>
                        <td><span class="tag ${statusTag}">${statusText}</span></td>
                        <td>${abs.keterangan || '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            document.getElementById('loading-absensi').style.display = 'none';
            document.getElementById('table-absensi').style.display = 'block';
        } else {
            document.getElementById('loading-absensi').textContent = `Gagal memuat absensi: ${result.message}`;
        }
    } catch (error) {
        console.error('Error load absensi:', error);
        document.getElementById('loading-absensi').textContent = 'Gagal memuat data absensi.';
    }
}

// Fungsi filter absensi berdasarkan bulan
async function filterDataAbsensi() {
    const bulan = document.getElementById('filter-absensi').value;
    
    document.getElementById('loading-absensi').style.display = 'block';
    document.getElementById('loading-absensi').textContent = 'Memuat data absensi...';
    document.getElementById('table-absensi').style.display = 'none';
    
    if (!bulan) {
        alert('Silakan pilih bulan terlebih dahulu.');
        document.getElementById('loading-absensi').style.display = 'none';
        return;
    }
    
    await loadAbsensiSantri(bulan);
}

// ====================== STATUS KEUANGAN ======================
async function loadKeuanganSantri() {
    try {
        const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getKeuanganByWali&idWali=${encodeURIComponent(waliData.id)}`
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-keuangan');
            tbody.innerHTML = '';
            
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">Tidak ada data keuangan yang terdaftar</td></tr>`;
            } else {
                // Urutkan data dari bulan terbaru ke terlama
                const sortedData = result.data.sort((a, b) => b.bulan.localeCompare(a.bulan));
                
                sortedData.forEach(keu => {
                    const statusTag = keu.status === 'Lunas' ? 'tag-lunas' : 'tag-belum';
                    const statusText = keu.status || '-';
                    const tglBayar = keu.tglBayar 
                        ? new Date(keu.tglBayar).toLocaleDateString('id-ID') 
                        : '-';
                    // PERBAIKAN: Penanganan nominal yang tidak valid
                    const nominal = keu.nominal ? parseInt(keu.nominal) : 0;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${keu.bulan || '-'}</td>
                        <td>Rp ${nominal.toLocaleString('id-ID')}</td>
                        <td><span class="tag ${statusTag}">${statusText}</span></td>
                        <td>${tglBayar}</td>
                        <td>${keu.keterangan || '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            document.getElementById('loading-keuangan').style.display = 'none';
            document.getElementById('table-keuangan').style.display = 'block';
        } else {
            document.getElementById('loading-keuangan').textContent = `Gagal memuat keuangan: ${result.message}`;
        }
    } catch (error) {
        console.error('Error load keuangan:', error);
        document.getElementById('loading-keuangan').textContent = 'Gagal memuat data keuangan.';
    }
}

// ====================== RIWAYAT PELANGGARAN ======================
async function loadPelanggaranSantri() {
    try {
        const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getPelanggaranByWali&idWali=${encodeURIComponent(waliData.id)}`
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
            const tbody = document.getElementById('tbody-pelanggaran');
            tbody.innerHTML = '';
            
            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3">Tidak ada riwayat pelanggaran</td></tr>`;
            } else {
                // Urutkan data dari tanggal terbaru ke terlama
                const sortedData = result.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                
                sortedData.forEach(pel => {
                    const tanggal = pel.tanggal 
                        ? new Date(pel.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : '-';
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${tanggal}</td>
                        <td>${pel.jenis || '-'}</td>
                        <td>${pel.tingkat || '-'}</td>
                        <td>${pel.sanksi || '-'}</td>
                        <td>${pel.status || '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }

            document.getElementById('loading-pelanggaran').style.display = 'none';
            document.getElementById('table-pelanggaran').style.display = 'block';
        } else {
            document.getElementById('loading-pelanggaran').textContent = `Gagal memuat pelanggaran: ${result.message}`;
        }
    } catch (error) {
        console.error('Error load pelanggaran:', error);
        document.getElementById('loading-pelanggaran').textContent = 'Gagal memuat data pelanggaran.';
    }
}

// ====================== RAPORT AKADEMIK ======================
async function loadRaportSantri() {
    try {
        const waliData = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI));
        const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=getRaportByWali&idWali=${encodeURIComponent(waliData.id)}`
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const result = await response.json();
        if (result.success) {
            const raportList = document.getElementById('raport-list');
            raportList.innerHTML = '';
            
            if (result.data.length === 0) {
                raportList.innerHTML = `<p class="text-center py-3">Tidak ada data raport akademik yang tersedia</p>`;
            } else {
                // Urutkan data dari semester terbaru ke terlama
                const sortedData = result.data.sort((a, b) => b.semester.localeCompare(a.semester));
                
                sortedData.forEach(rap => {
                    // PERBAIKAN: Validasi nilai sebelum perhitungan
                    const mtk = parseInt(rap.mtk) || 0;
                    const bindo = parseInt(rap.bindo) || 0;
                    const aqidah = parseInt(rap.aqidah) || 0;
                    const barab = parseInt(rap.barab) || 0;
                    const rataRata = ((mtk + bindo + aqidah + barab) / 4).toFixed(1);
                    
                    const raportCard = document.createElement('div');
                    raportCard.className = 'form-section mb-3';
                    raportCard.innerHTML = `
                        <h3 class="mb-2">Raport ${rap.semester || '-'}</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Matematika</label>
                                <p>${mtk}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bahasa Indonesia</label>
                                <p>${bindo}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Aqidah Akhlak</label>
                                <p>${aqidah}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bahasa Arab</label>
                                <p>${barab}</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Rata-Rata Nilai</label>
                                <p><strong>${rataRata}</strong></p>
                            </div>
                        </div>
                        <div class="form-group mt-3">
                            <label class="form-label">Catatan Guru</label>
                            <p class="text-muted">${rap.catatan || 'Tidak ada catatan'}</p>
                        </div>
                    `;
                    raportList.appendChild(raportCard);
                });
            }

            document.getElementById('loading-raport').style.display = 'none';
            document.getElementById('content-raport').style.display = 'block';
        } else {
            alert(`Gagal memuat raport: ${result.message}`);
            document.getElementById('loading-raport').textContent = 'Gagal memuat data raport.';
        }
    } catch (error) {
        console.error('Error load raport:', error);
        alert(`Terjadi kesalahan saat memuat raport: ${error.message}`);
        document.getElementById('loading-raport').textContent = 'Gagal memuat data raport akademik.';
    }
}