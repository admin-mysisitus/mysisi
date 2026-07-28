/* ========== KONTAK PAGE SCRIPT ========== */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm?.querySelector('button[type="submit"]');

  // Get URL parameters for auto-prefill
  const urlParams = new URLSearchParams(window.location.search);
  const karirType = urlParams.get('tipe');
  const jobPosition = urlParams.get('posisi');
  const autoSubmit = urlParams.get('auto') === 'true';

  // Auto-prefill form for career applications
  if (karirType === 'karir' && jobPosition) {
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect) {
      subjectSelect.value = 'karir';
      
      // Update or create message template for career application
      const messageField = document.getElementById('message');
      if (messageField && !messageField.value) {
        const positionDisplay = jobPosition
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        messageField.value = `Saya ingin melamar untuk posisi: ${positionDisplay}\n\nBerikut adalah informasi singkat tentang saya:\n[Tolong jelaskan pengalaman dan keahlian Anda]`;
      }
    }
  }

  if (contactForm) {
    // Validate email format
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Validate phone format (basic)
    const validatePhone = (phone) => {
      const phoneRegex = /^(\+62|0)[0-9]{7,12}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    // Show error message on field (form validation)
    const showFieldError = (fieldId, message) => {
      const field = document.getElementById(fieldId);
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('input-error');
      
      // Trigger shake animation
      field.style.animation = 'none';
      setTimeout(() => {
        field.style.animation = '';
      }, 10);
      
      let errorMsg = field.parentElement.querySelector('.error-message');
      if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        field.parentElement.appendChild(errorMsg);
      }
      errorMsg.textContent = message;
    };

    // Clear error message on field (form validation)
    const clearFieldError = (fieldId) => {
      const field = document.getElementById(fieldId);
      field.removeAttribute('aria-invalid');
      field.classList.remove('input-error');
      
      const errorMsg = field.parentElement.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    };

    // Real-time validation
    const fields = ['fullname', 'email', 'phone', 'subject', 'message'];
    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => {
          const value = field.value.trim();
          
          if (!value) {
            showFieldError(fieldId, 'Field ini harus diisi');
            return;
          }

          if (fieldId === 'email' && !validateEmail(value)) {
            showFieldError(fieldId, 'Email tidak valid');
            return;
          }

          if (fieldId === 'phone' && !validatePhone(value)) {
            showFieldError(fieldId, 'Nomor telepon tidak valid (gunakan format 08xx atau +62xxx)');
            return;
          }

          clearFieldError(fieldId);
        });

        // Clear error on input
        field.addEventListener('input', () => {
          if (field.classList.contains('input-error')) {
            clearFieldError(fieldId);
          }
        });
      }
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form values
      const fullname = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value.trim();

      // Validate all fields
      let isValid = true;

      if (!fullname) {
        showFieldError('fullname', 'Nama lengkap harus diisi');
        isValid = false;
      } else {
        clearFieldError('fullname');
      }

      if (!email || !validateEmail(email)) {
        showFieldError('email', 'Email harus diisi dan valid');
        isValid = false;
      } else {
        clearFieldError('email');
      }

      if (!phone || !validatePhone(phone)) {
        showFieldError('phone', 'Nomor telepon harus diisi dan valid');
        isValid = false;
      } else {
        clearFieldError('phone');
      }

      if (!subject) {
        showFieldError('subject', 'Subjek harus dipilih');
        isValid = false;
      } else {
        clearFieldError('subject');
      }

      if (!message) {
        showFieldError('message', 'Pesan harus diisi');
        isValid = false;
      } else {
        clearFieldError('message');
      }

      if (!isValid) return;

      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
      }

      try {
        // Create WhatsApp message
        const whatsappMessage = encodeURIComponent(
          `Halo SISITUS!\n\n` +
          `Nama: ${fullname}\n` +
          `Email: ${email}\n` +
          `Telepon: ${phone}\n` +
          `Subjek: ${subject}\n\n` +
          `Pesan:\n${message}`
        );

        // Open WhatsApp
        const whatsappURL = `https://wa.me/6281215289095?text=${whatsappMessage}`;
        window.open(whatsappURL, '_blank');

        // Reset form
        contactForm.reset();

        // Show success message
        const successMsg = karirType === 'karir' 
          ? 'Terima kasih! Lamaran Anda akan dikirim via WhatsApp.'
          : 'Terima kasih! Pesan Anda akan dikirim via WhatsApp.';
        
        showSuccess(successMsg);

        // Clear URL parameters after submission
        window.history.replaceState({}, document.title, window.location.pathname);

      } catch (error) {
        console.error('Error:', error);
        showError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesan';
        }
      }
    });

    // Auto-submit if parameter is set
    if (autoSubmit) {
      // Wait for form to be ready, then auto-submit if possible
      setTimeout(() => {
        // Only auto-submit if no required fields are empty
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // If all fields are empty, don't auto-submit (user needs to fill form)
        if (!fullname || !email || !phone || !message) {
          // Scroll to form
          contactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showInfo('Silakan lengkapi form lamaran Anda');
          return;
        }
        
        // Auto-submit the form
        contactForm.dispatchEvent(new Event('submit'));
      }, 300);
    }
  }

  // ========== AUTO SCROLL SLIDERS ==========
  function initAutoSnapSlider(sliderElement) {
    if (!sliderElement) return;
    
    let autoScrollInterval;
    let resumeTimeout;
    let isAutoScrolling = false;
    let scrollFlagTimeout;
    const slideInterval = 2500;
    const resumeDelay = 3000;
    
    let track = sliderElement.firstElementChild;
    if (track && track.classList.contains('contact-item')) {
      track = sliderElement;
    }

    if(!track || track.children.length === 0) return;
    
    const scrollToNext = () => {
      const scrollLeft = sliderElement.scrollLeft;
      const clientWidth = sliderElement.clientWidth;
      const scrollWidth = sliderElement.scrollWidth;
      
      if (clientWidth >= scrollWidth - 5) return;
      
      isAutoScrolling = true;
      if (scrollFlagTimeout) clearTimeout(scrollFlagTimeout);
      
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderElement.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = track.children[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 16; 
        sliderElement.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }
      
      scrollFlagTimeout = setTimeout(() => {
        isAutoScrolling = false;
      }, 800);
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(scrollToNext, slideInterval);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };

    const handleInteraction = (e) => {
      if (e && e.type === 'scroll' && isAutoScrolling) return;
      
      stopAutoScroll();
      if (resumeTimeout) clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(startAutoScroll, resumeDelay);
    };

    sliderElement.addEventListener('scroll', handleInteraction, {passive: true});
    sliderElement.addEventListener('wheel', handleInteraction, {passive: true});
    sliderElement.addEventListener('touchstart', handleInteraction, {passive: true});
    sliderElement.addEventListener('mousedown', handleInteraction);
    
    startAutoScroll();
  }

  initAutoSnapSlider(document.querySelector('.contact-info-grid'));
});

// Note: Notification functions are imported from /assets/js/utils/notifications.js
// showSuccess(), showError(), showInfo(), showToast(), showConfirm(), etc. are globally available