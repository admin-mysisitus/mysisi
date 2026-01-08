// Animasi Elemen Saat Di-Scroll
const animateOnScroll = () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    if(sectionTop < windowHeight * 0.8) {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }
  });
};

// Inisialisasi Animasi
const sections = document.querySelectorAll('.section');
sections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// Panggil Fungsi Saat Scroll dan Halaman Dimuat
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);


