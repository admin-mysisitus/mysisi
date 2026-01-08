
  // Fungsi untuk menampilkan pesan saat berbagi berita
  const shareButtons = document.querySelectorAll('.share-btn a');
  shareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Fitur berbagi sedang dalam pengembangan. Silakan salin tautan halaman ini untuk berbagi!');
    });
  });
  // Animasi gambar gallery saat di-scroll
  const galleryImages = document.querySelectorAll('.gallery-grid img');
  window.addEventListener('scroll', () => {
    galleryImages.forEach(img => {
      const imgTop = img.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if(imgTop < windowHeight * 0.8) {
        img.style.opacity = '1';
        img.style.transform = 'translateY(0)';
      }
    });
  });
  // Inisialisasi animasi gambar gallery
  galleryImages.forEach(img => {
    img.style.opacity = '0';
    img.style.transform = 'translateY(20px)';
    img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
