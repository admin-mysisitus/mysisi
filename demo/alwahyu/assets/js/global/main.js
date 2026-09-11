document.addEventListener("DOMContentLoaded", () => {
    // Intersection Observer for animations
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // Hero Slideshow
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // Inject WhatsApp Floating Button globally
    if (!document.querySelector('.wa-float')) {
        const waFloat = document.createElement('a');
        waFloat.href = 'https://wa.me/6281230200098';
        waFloat.className = 'wa-float slide-in-up animate';
        waFloat.target = '_blank';
        waFloat.rel = 'noopener noreferrer';
        waFloat.innerHTML = '<i class="ph ph-whatsapp-logo"></i>';
        document.body.appendChild(waFloat);
    }
});
