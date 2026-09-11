document.getElementById('form-daftar-santri').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitDaftar');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph-fill ph-spinner ph-animation-spin"></i> Mengirim Data...';
    
    const name = document.getElementById('nama-santri').value;
    const nis = document.getElementById('nis-santri').value;
    const kelas = document.getElementById('jenjang-santri').value;
    const jk = document.getElementById('jk-santri').value;
    const nama_ayah = document.getElementById('nama-ayah').value;
    const nama_ibu = document.getElementById('nama-ibu').value;
    const wa_wali = document.getElementById('wa-wali').value;
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('pass-login').value;
    
    const kamar = "Belum Ditentukan";
    
    try {
        let res = await callApi('addSantri', {
            name,
            nis,
            kelas,
            kamar,
            nama_ayah,
            nama_ibu,
            wa_wali,
            email,
            password
        });
        
        if (res.status === 'success') {
            showToast("Pendaftaran berhasil disimpan!");
            
            // Replace form content with success card
            const formCard = document.getElementById('form-daftar-santri').parentNode;
            formCard.innerHTML = `
                <div class="js-success-container">
                    <div class="js-success-icon-wrapper">
                        <i class="ph-fill ph-check-circle"></i>
                    </div>
                    <h2 class="section-title" class="js-success-title">Pendaftaran Berhasil!</h2>
                    <p class="js-success-desc">Data calon santri <strong>${name}</strong> telah tersimpan di sistem kami.</p>
                    
                    <div class="js-account-info-box">
                        <h4 class="js-account-info-title">Informasi Akun E-Ponpes Anda:</h4>
                        <p class="js-account-info-text"><strong>Email:</strong> ${email}</p>
                        <p class="js-account-info-text mb-12"><strong>Password:</strong> <em>(Sesuai yang Anda buat)</em></p>
                        <div class="js-account-info-note">
                            Gunakan email dan password ini untuk masuk ke portal E-Ponpes untuk memantau status kelulusan, melakukan daftar ulang, dan mengunggah administrasi.
                        </div>
                    </div>
                    
                    <a href="../../e-ponpes/index.html" class="btn-primary" class="js-btn-primary-padded">Masuk ke E-Ponpes</a>
                </div>
            `;
        } else {
            showToast(res.message || "Gagal melakukan pendaftaran.", true);
            btn.disabled = false;
            btn.innerHTML = '<i class="ph-fill ph-user-plus"></i> Kirim Pendaftaran';
        }
    } catch (err) {
        console.error(err);
        showToast("Terjadi kesalahan koneksi.", true);
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-fill ph-user-plus"></i> Kirim Pendaftaran';
    }
});

document.getElementById('form-cek-status').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('input-cek-status').value.trim();
    const resultContainer = document.getElementById('status-result-container');
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = '<div class="js-loading-container"><i class="ph-fill ph-spinner ph-animation-spin" class="js-loading-icon"></i><p class="js-loading-text">Mencari data...</p></div>';
    
    try {
        let res = await callApi('checkStatus', { query });
        if (res && res.status === 'success' && res.data) {
            const santri = res.data;
            const status_aktif = santri.status_aktif || 'Menunggu Ujian Seleksi';
            
            // Map status to steps
            let activeStep = 1;
            let statusText = "Berkas pendaftaran Anda telah kami terima dan sedang diverifikasi.";
            
            if (status_aktif === 'Menunggu Administrasi') {
                activeStep = 2;
                statusText = "Silakan menyelesaikan biaya pendaftaran untuk memverifikasi dokumen Anda.";
            } else if (status_aktif === 'Menunggu Ujian Seleksi') {
                activeStep = 3;
                statusText = "Administrasi terverifikasi. Anda dijadwalkan mengikuti Ujian Seleksi Tahfidz & Akademik.";
            } else if (status_aktif === 'Menunggu Daftar Ulang') {
                activeStep = 4;
                statusText = "Selamat! Anda dinyatakan LULUS. Silakan lakukan daftar ulang dan pembayaran uang pangkal.";
            } else if (status_aktif === 'Aktif') {
                activeStep = 5;
                statusText = "Proses pendaftaran selesai. Anda telah resmi terdaftar sebagai Santri Aktif PPTQ AL WAHYU.";
            }
            
            // Calculate progress percentage
            const pct = ((activeStep - 1) / 4) * 100;
            
            resultContainer.innerHTML = `
                <div class="js-status-card">
                    <div class="js-status-header">
                        <div>
                            <h3 class="js-status-name">${santri.name}</h3>
                            <span class="js-status-nisn">NISN: ${santri.nis || '-'} | Jenjang: ${santri.kelas}</span>
                        </div>
                        <span class="js-status-badge">
                            ${status_aktif}
                        </span>
                    </div>

                    <div class="status-timeline" class="js-timeline-wrapper">
                        <div class="js-timeline-line-bg"></div>
                        <div class="js-timeline-line-active" style="width: ${pct}%;"></div>
                        
                        ${[1, 2, 3, 4, 5].map(step => {
                            const labels = ["Pendaftaran", "Administrasi", "Ujian Seleksi", "Daftar Ulang", "Aktif"];
                            const isCompleted = step <= activeStep;
                            const isActive = step === activeStep;
                            const color = isCompleted ? 'var(--alwahyu-primary)' : '#64748b';
                            const bg = isCompleted ? 'var(--alwahyu-primary)' : '#e2e8f0';
                            const dotColor = isCompleted ? 'white' : '#64748b';
                            const border = isActive ? '3px solid var(--alwahyu-accent)' : '3px solid white';
                            const shadow = isActive ? '0 0 10px rgba(62,125,55,0.3)' : 'none';
                            
                            return `
                                <div class="status-step js-status-step">
                                    <div class="step-dot js-step-dot" style="background: ${bg}; border: ${border}; color: ${dotColor}; box-shadow: ${shadow};">
                                        ${isCompleted && step < activeStep ? '✓' : step}
                                    </div>
                                    <div class="step-label js-step-label" style="color: ${color};">${labels[step-1]}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="js-status-msg">
                        ${statusText}
                    </div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = `
                <div class="js-error-container">
                    <i class="ph-fill ph-warning" class="js-error-icon"></i>
                    <h4 class="js-error-title">Data Tidak Ditemukan</h4>
                    <p class="js-error-desc">Pendaftaran dengan email atau NISN "${query}" tidak ditemukan. Pastikan email/NISN yang dimasukkan sudah benar.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        resultContainer.innerHTML = `
            <div class="js-error-container">
                <i class="ph-fill ph-warning" class="js-error-icon"></i>
                <h4 class="js-error-title">Kesalahan Koneksi</h4>
                <p class="js-error-desc">Gagal menghubungi server untuk mengecek status. Silakan coba beberapa saat lagi.</p>
            </div>
        `;
    }
});