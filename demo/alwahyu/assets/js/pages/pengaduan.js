document.getElementById('form-pengaduan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph-fill ph-spinner ph-animation-spin"></i> Mengirim Laporan...';
    
    const nama = document.getElementById('nama-pengadu').value;
    const kontak = document.getElementById('kontak-pengadu').value;
    const jenis = document.getElementById('jenis-pengaduan').value;
    const isi = document.getElementById('isi-pengaduan').value;
    
    try {
        let res = await callApi('submitPengaduan', { nama, kontak, jenis, isi });
        if (res.status === 'success') {
            showToast("Laporan Anda berhasil dikirim!");
            e.target.reset();
        } else {
            showToast(res.message || "Gagal mengirim laporan.", true);
        }
    } catch (err) {
        console.error(err);
        showToast("Terjadi kesalahan koneksi.", true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "Kirim Pengaduan";
    }
});