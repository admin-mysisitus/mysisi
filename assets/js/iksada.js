
  // Tampilkan field divisi relawan jika memilih Ya
  const relawanRadios = document.querySelectorAll('input[name="relawan"]');
  const divisiRelawan = document.getElementById('divisi-relawan');
  relawanRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if(radio.value === 'Ya') {
        divisiRelawan.style.display = 'block';
      } else {
        divisiRelawan.style.display = 'none';
        document.getElementById('pilihan-divisi').value = '';
      }
    });
  });

  // Fungsi refresh captcha alumni
  function refreshCaptchaAlumni() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for(let i = 0; i < 5; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.getElementById('captcha-text-alumni').textContent = captcha;
    document.getElementById('captcha-alumni').value = '';
  }

  // Validasi captcha saat submit
  const daftarForm = document.querySelector('.daftar-form form');
  if(daftarForm) {
    daftarForm.addEventListener('submit', (e) => {
      const captchaInput = document.getElementById('captcha-alumni').value;
      const captchaText = document.getElementById('captcha-text-alumni').textContent;
      if(captchaInput !== captchaText) {
        e.preventDefault();
        alert('Kode verifikasi tidak sesuai! Silakan coba lagi.');
        refreshCaptchaAlumni();
      }
    });
  }