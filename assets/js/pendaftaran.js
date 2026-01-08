// Tampilkan kolom sesuai opsi pendaftaran
  const jenisPendaftaran = document.getElementById('jenis-pendaftaran');
  const sectionFormal = document.getElementById('section-formal');
  const sectionMadin = document.getElementById('section-madin');
  const jenjangFormal = document.getElementById('jenjang-pendidikan');
  const minatJurusan = document.getElementById('minat-jurusan');
  
  jenisPendaftaran.addEventListener('change', () => {
    // Reset semua section khusus
    sectionFormal.classList.add('hidden');
    sectionMadin.classList.add('hidden');
    minatJurusan.classList.add('hidden');
    resetRequiredFields('section-formal');
    resetRequiredFields('section-madin');

    if(jenisPendaftaran.value === 'gabungan') {
      sectionFormal.classList.remove('hidden');
      sectionMadin.classList.remove('hidden');
      setRequiredFields('section-formal');
      setRequiredFields('section-madin');
    } else if(jenisPendaftaran.value === 'madin') {
      sectionMadin.classList.remove('hidden');
      setRequiredFields('section-madin');
    }
  });

  // Tampilkan kolom minat jurusan jika memilih SMA
  jenjangFormal.addEventListener('change', () => {
    if(jenjangFormal.value === 'SMA') {
      minatJurusan.classList.remove('hidden');
    } else {
      minatJurusan.classList.add('hidden');
      document.getElementById('minat-jurusan-sma').value = '';
    }
  });

  // Fungsi untuk mengatur atribut required
  function setRequiredFields(sectionId) {
    const inputs = document.querySelectorAll(`#${sectionId} input, #${sectionId} select, #${sectionId} textarea`);
    inputs.forEach(input => {
      if(input.hasAttribute('placeholder') && input.id !== 'deskripsi-prestasi' && input.id !== 'deskripsi-agama' && input.id !== 'minat-jurusan-sma') {
        input.required = true;
      }
    });
  }

  // Fungsi untuk menghapus atribut required
  function resetRequiredFields(sectionId) {
    const inputs = document.querySelectorAll(`#${sectionId} input, #${sectionId} select, #${sectionId} textarea`);
    inputs.forEach(input => {
      input.required = false;
      input.value = '';
    });
  }

  // Tampilkan field deskripsi prestasi jika memilih Ya
  const prestasiRadios = document.querySelectorAll('input[name="prestasi"]');
  const prestasiField = document.getElementById('prestasi-field');
  prestasiRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if(radio.value === 'Ya') {
        prestasiField.classList.remove('hidden');
        prestasiField.querySelector('textarea').required = true;
      } else {
        prestasiField.classList.add('hidden');
        prestasiField.querySelector('textarea').required = false;
        prestasiField.querySelector('textarea').value = '';
      }
    });
  });

  // Tampilkan field deskripsi pendidikan agama jika memilih Ya
  const agamaRadios = document.querySelectorAll('input[name="pendidikan-agama"]');
  const agamaField = document.getElementById('agama-field');
  agamaRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if(radio.value === 'Ya') {
        agamaField.classList.remove('hidden');
        agamaField.querySelector('textarea').required = true;
      } else {
        agamaField.classList.add('hidden');
        agamaField.querySelector('textarea').required = false;
        agamaField.querySelector('textarea').value = '';
      }
    });
  });

  // Fungsi refresh captcha
  function refreshCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for(let i = 0; i < 5; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    document.getElementById('captcha-text').textContent = captcha;
    document.getElementById('captcha').value = '';
  }

  // Validasi captcha saat submit
  const pendaftaranForm = document.querySelector('.pendaftaran-form');
  pendaftaranForm.addEventListener('submit', (e) => {
    const captchaInput = document.getElementById('captcha').value;
    const captchaText = document.getElementById('captcha-text').textContent;
    if(captchaInput !== captchaText) {
      e.preventDefault();
      alert('Kode verifikasi tidak sesuai! Silakan coba lagi.');
      refreshCaptcha();
    }

    // Validasi opsi pendaftaran telah dipilih
    if(jenisPendaftaran.value === '') {
      e.preventDefault();
      alert('Silakan pilih opsi pendaftaran terlebih dahulu!');
    }
  });

