export function showSuccess(title = '', message = '') {
  const displayTitle = message ? title : '';
  const displayMessage = message ? message : title;
  return Swal.fire({
    toast: true,
    position: 'top',
    icon: 'success',
    iconColor: 'white',
    title: displayTitle,
    text: displayMessage,
    background: '#10b981',
    color: 'white',
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup: 'modern-toast-popup'
    }
  });
}
export function showError(title = '', message = '') {
  const displayTitle = message ? title : '';
  const displayMessage = message ? message : title;
  return Swal.fire({
    toast: true,
    position: 'top',
    icon: 'error',
    iconColor: 'white',
    title: displayTitle,
    text: displayMessage,
    background: '#ef4444',
    color: 'white',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: 'modern-toast-popup'
    }
  });
}
export function showWarning(title = '', message = '') {
  const displayTitle = message ? title : '';
  const displayMessage = message ? message : title;
  return Swal.fire({
    toast: true,
    position: 'top',
    icon: 'warning',
    iconColor: 'white',
    title: displayTitle,
    text: displayMessage,
    background: '#f59e0b',
    color: 'white',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: 'modern-toast-popup'
    }
  });
}
export function showInfo(title = '', message = '') {
  const displayTitle = message ? title : '';
  const displayMessage = message ? message : title;
  return Swal.fire({
    toast: true,
    position: 'top',
    icon: 'info',
    iconColor: 'white',
    title: displayTitle,
    text: displayMessage,
    background: '#3b82f6',
    color: 'white',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: 'modern-toast-popup'
    }
  });
}
export function showLoading(title = '', message = '') {
  Swal.fire({
    title: title || 'Memproses...',
    text: message || '',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen() {
      Swal.showLoading();
    }
  });
}
export function hideLoading() {
  Swal.close();
}
export function showConfirm(message = '', onConfirm, onCancel) {
  return Swal.fire({
    icon: 'question',
    title: 'Konfirmasi',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#2563EB',
    cancelButtonColor: '#6c757d'
  }).then(result => {
    if (result.isConfirmed) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  });
}
export function showToast(message = '', type = 'success') {
  return Swal.fire({
    icon: type,
    title: message,
    toast: true,
    position: 'top-end',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false
  });
}
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
export function isValidEmailStrict(email) {
  const regex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return regex.test(email) && email.length <= 254;
}
export function isValidPassword(password) {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password minimal 8 karakter'
    };
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasUpperCase) {
    return {
      valid: false,
      message: 'Password harus mengandung huruf besar'
    };
  }
  if (!hasLowerCase) {
    return {
      valid: false,
      message: 'Password harus mengandung huruf kecil'
    };
  }
  if (!hasNumber) {
    return {
      valid: false,
      message: 'Password harus mengandung angka'
    };
  }
  return {
    valid: true
  };
}
export function isValidPhoneNumber(phone) {
  const regex = /^(\+62|62|0)?8\d{8,12}$/;
  return regex.test(phone.replace(/[\s\-]/g, ''));
}
export function isValidDomain(domain) {
  domain = domain.replace(/^https?:\/\//, '');
  const regex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return regex.test(domain);
}
  export const Base64Utils = {
    encode: (str) => {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      }));
    },
    decode: (str) => {
      return decodeURIComponent(atob(str).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    }
  };
  export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  export function formatDate(date, format = 'long') {
    const dateObj = new Date(date);
    const options = {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      full: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit'
      },
      datetime: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    };
    return new Intl.DateTimeFormat('id-ID', options[format] || options.long).format(dateObj);
  }
  export function formatTimeAgo(date) {
    const now = new Date();
    const passed = now - new Date(date);
    const seconds = Math.floor(passed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return 'baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`;
    if (days < 365) return `${Math.floor(days / 30)} bulan yang lalu`;
    return `${Math.floor(days / 365)} tahun yang lalu`;
  }
  export function formatPrice(value) {
    let formatted = formatCurrency(value);
    formatted = formatted.replace(/IDR|Rp/g, '').trim();
    return `Rp ${formatted}`;
  }
  export function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  export function truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.substr(0, length) + '...';
  }
  export function normalizeDriveImageUrl(rawUrl, size = 'w200', fallback = '') {
    if (!rawUrl || typeof rawUrl !== 'string') return fallback;
    const url = rawUrl.trim();
    if (!url) return fallback;
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=${size}`;
    }
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if ((url.includes('drive.google.com/uc') || url.includes('drive.google.com/open')) && idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=${size}`;
    }
    return url;
  }
  export function withCacheBust(url) {
    if (!url || typeof url !== 'string') return '';
    return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  }
  export function getDefaultAvatarSVG() {
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%232563EB%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22/%3E%3Cpath d=%22M 12 14 C 7.6 14 4 16.2 4 19 L 4 22 L 20 22 L 20 19 C 20 16.2 16.4 14 12 14 Z%22/%3E%3C/svg%3E';
  }
  export function renderUserAvatarHtml(user, size = 'w200', extraClass = '') {
    const defaultSvg = getDefaultAvatarSVG();
    const rawUrl = user?.photoURL || '';
    let profileSrc = normalizeDriveImageUrl(rawUrl, size, defaultSvg);
    profileSrc = profileSrc !== defaultSvg ? withCacheBust(profileSrc) : profileSrc;
    const displayName = user?.displayName || 'User';
    return `<img src="${profileSrc}" alt="${displayName}" class="user-avatar ${extraClass}" onerror="this.src='${defaultSvg}'">`;
  }
  export function getPasswordStrengthInfo(password) {
    if (!password) {
      return {
        visible: false,
        text: '',
        className: '',
        color: '',
        strength: 0
      };
    }
    const checks = {
      length: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    };
    const strength = Object.values(checks).filter(Boolean).length;
    if (strength <= 2) {
      return {
        visible: true,
        text: 'Lemah',
        className: 'strength-weak',
        color: '#ef4444',
        strength
      };
    }
    if (strength === 3) {
      return {
        visible: true,
        text: 'Sedang',
        className: 'strength-fair',
        color: '#f59e0b',
        strength
      };
    }
    if (strength === 4) {
      return {
        visible: true,
        text: 'Kuat',
        className: 'strength-good',
        color: '#3b82f6',
        strength
      };
    }
    return {
      visible: true,
      text: 'Sangat Kuat',
      className: 'strength-strong',
      color: '#10b981',
      strength
    };
  }
  export function setButtonLoading(button, isLoading = true, loadingText = 'Memproses...') {
    if (!button) return;
    if (isLoading) {
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }
      const cleanText = loadingText.replace('⏳ ', '');
      button.innerHTML = `<span class="css-spinner"></span> ${cleanText}`;
      button.disabled = true;
    } else {
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
      } else {
        button.textContent = 'Submit';
      }
      button.disabled = false;
    }
  }
  export function setInlineStatus(element, text = '', isVisible = true) {
    if (!element) return;
    element.textContent = text;
    element.style.display = isVisible ? 'block' : 'none';
  }
  export function fadeOut(element, duration = 300) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  }
  export function fadeIn(element, duration = 300) {
    return new Promise(resolve => {
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.opacity = '1';
        resolve();
      }, 50);
    });
  }
  export function getStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      const data = JSON.parse(item);
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      return data.value;
    } catch (error) {
      void(`[Storage] Error reading ${key}:`, error);
      return defaultValue;
    }
  }
  export function setStorage(key, value, expirationMinutes = null) {
    try {
      const data = {
        value,
        expiresAt: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      void(`[Storage] Error writing ${key}:`, error);
    }
  }
  export function removeStorage(key) {
    localStorage.removeItem(key);
  }
  export function clearAllStorage() {
    localStorage.clear();
  }
  export function getErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors[0] || 'Terjadi kesalahan';
    }
    if (error.detail) return error.detail;
    return 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
  }
  export function handleAPIError(error, showNotification = true) {
    const message = getErrorMessage(error);
    void('[API Error]:', error);
    if (showNotification) {
      showError('Terjadi Kesalahan', message);
    }
    return message;
  }
  export function showLoadingOverlay(message = '') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
      <div class="spinner"></div>
      ${message ? `<p>${message}</p>` : ''}
    `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }
  export function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
  export function initPasswordToggle(container = document) {
    const passwordInputs = container.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      if (input.dataset.passwordToggleInit) return;
      input.dataset.passwordToggleInit = 'true';
      const wrapper = document.createElement('div');
      wrapper.className = 'password-input-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'block';
      wrapper.style.width = '100%';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      input.style.paddingRight = '40px';
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'password-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Tampilkan sandi');
      toggleBtn.style.position = 'absolute';
      toggleBtn.style.right = '12px';
      toggleBtn.style.top = '50%';
      toggleBtn.style.transform = 'translateY(-50%)';
      toggleBtn.style.border = 'none';
      toggleBtn.style.background = 'none';
      toggleBtn.style.cursor = 'pointer';
      toggleBtn.style.color = '#64748b';
      toggleBtn.style.fontSize = '16px';
      toggleBtn.style.padding = '0';
      toggleBtn.style.margin = '0';
      toggleBtn.style.display = 'flex';
      toggleBtn.style.alignItems = 'center';
      toggleBtn.style.justifyContent = 'center';
      toggleBtn.style.zIndex = '5';
      const icon = document.createElement('i');
      icon.className = 'fas fa-eye';
      toggleBtn.appendChild(icon);
      wrapper.appendChild(toggleBtn);
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
          toggleBtn.setAttribute('aria-label', 'Sembunyikan sandi');
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
          toggleBtn.setAttribute('aria-label', 'Tampilkan sandi');
        }
      });
    });
  }
  export function formatPhoneNumber(phone) {
    if (!phone) return '-';
    return phone.replace(/(\d{4})(\d{4})(\d)/, '$1-$2-$3');
  }
  export function formatNumber(num) {
    return Number(num).toLocaleString('id-ID');
  }
  export function sanitizeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  export const EnvHelper = {
    isLocal: () => {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    },
    getDomainUrl: (subdomain, path = '') => {
      const isLocal = EnvHelper.isLocal();
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      if (isLocal) {
        if (subdomain === 'my') {
          return window.location.origin + '/my' + (cleanPath === '/' ? '' : cleanPath);
        } else if (subdomain === 'backstage') {
          return window.location.origin + '/admin' + (cleanPath === '/' ? '' : cleanPath);
        } else if (subdomain === 'public') {
          return window.location.origin + cleanPath;
        }
      } else {
        if (subdomain === 'my') {
          return 'https://my.sisitus.com' + cleanPath;
        } else if (subdomain === 'backstage') {
          return 'https://backstage.sisitus.com' + cleanPath;
        } else if (subdomain === 'public') {
          return 'https://sisitus.com' + cleanPath;
        }
      }
      return cleanPath;
    }
  };
  export const Utilities = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideLoading,
    showConfirm,
    showToast,
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber,
    isValidDomain,
    formatPhoneNumber,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTimeAgo,
    capitalize,
    truncate,
    sanitizeHTML,
    setButtonLoading,
    setInlineStatus,
    fadeOut,
    fadeIn,
    initPasswordToggle,
    getPasswordStrengthInfo,
    getStorage,
    setStorage,
    removeStorage,
    clearAllStorage,
    getErrorMessage,
    handleAPIError,
    showLoadingOverlay,
    hideLoadingOverlay,
    EnvHelper
  };