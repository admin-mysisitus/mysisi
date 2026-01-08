document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login-wali');

    // Cek apakah sudah login
    const savedWali = localStorage.getItem(APP_CONFIG.STORAGE_KEY_WALI);
    if (savedWali) {
        window.location.href = 'wali-dashboard.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validasi input
        if (!username || !password) {
            alert('Username dan password tidak boleh kosong!');
            return;
        }

        try {
            // Kirim permintaan ke Google Apps Script
            const response = await fetch(APP_CONFIG.GAS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=loginWali&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });

            const result = await response.json();
            
            if (result.success) {
                // Simpan data wali ke localStorage
                localStorage.setItem(APP_CONFIG.STORAGE_KEY_WALI, JSON.stringify(result.data));
                alert('Login berhasil! Akan dialihkan ke dashboard.');
                window.location.href = 'wali-dashboard.html';
            } else {
                alert(result.message || 'Login gagal! Periksa username dan password.');
            }
        } catch (error) {
            console.error('Error saat login:', error);
            alert('Terjadi kesalahan saat menghubungi server. Silakan coba lagi nanti.');
        }
    });
});

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