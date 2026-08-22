/**
 * Profile Page Module
 * User account management, profile editing, password change
 */
import APIClient from '/assets/js/modules/unified-api.js';
import {
  showError,
  showSuccess,
  initPasswordToggle,
  normalizeDriveImageUrl,
  withCacheBust,
  setButtonLoading,
  setInlineStatus,
  getPasswordStrengthInfo
} from '/assets/js/modules/unified-utils.js';
import {
  DashboardAuth
} from './auth.js';
export async function render(currentUser) {
  try {
    // Load user profile data
    const result = await APIClient.getUserProfile(currentUser.userId);
    let user = result.data || currentUser;
    // Defensive parsing for corrupt JSON displayName
    if (user.displayName && typeof user.displayName === 'string' && user.displayName.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(user.displayName);
        if (parsed.displayName) {
          user.displayName = parsed.displayName;
        }
        if (parsed.whatsapp) {
          user.whatsapp = parsed.whatsapp;
        }
      } catch (e) {
        console.warn('Failed to parse corrupt user displayName JSON:', e);
      }
    }
    // Setup form with current data
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      // Sinkronkan session lokal dengan data API terbaru (agar Navbar langsung update jika berbeda)
      if (user.displayName !== currentUser.displayName || user.photoURL !== currentUser.photoURL) {
        DashboardAuth.updateSession(user);
      }
      const inputName = document.getElementById('input-name');
      inputName.value = user.displayName || '';
      // Live update nama di navbar saat user mengetik (Premium feel)
      inputName.addEventListener('input', (e) => {
        const userNameEl = document.querySelector('.user-profile-trigger .user-name');
        const dropdownNameEl = document.querySelector('.dropdown-header strong');
        const newName = e.target.value.trim() || user.displayName || 'Pelanggan';
        if (userNameEl) userNameEl.textContent = newName;
        if (dropdownNameEl) dropdownNameEl.textContent = newName;
      });
      const photoPreview = document.getElementById('photo-preview');
      const photoPlaceholder = document.getElementById('photo-placeholder');
      const photoStatus = document.getElementById('photo-upload-status');
      if (user.photoURL && photoPreview) {
        const normalized = normalizeDriveImageUrl(user.photoURL, 'w300', '');
        photoPreview.src = withCacheBust(normalized);
        photoPreview.style.display = 'block';
        if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        photoPreview.onerror = () => {
          photoPreview.style.display = 'none';
          if (photoPlaceholder) photoPlaceholder.style.display = 'block';
        };
      }
      const inputPhoto = document.getElementById('input-photo');
      if (inputPhoto) {
        inputPhoto.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) {
            delete inputPhoto.dataset.base64;
            setInlineStatus(photoStatus, '', false);
            return;
          }
          if (file.size > 2 * 1024 * 1024) {
            showError('Ukuran foto maksimal 2MB');
            this.value = '';
            delete inputPhoto.dataset.base64;
            setInlineStatus(photoStatus, 'Foto terlalu besar. Pilih file maksimal 2MB.', true);
            return;
          }
          setInlineStatus(photoStatus, 'Pratinjau foto diperbarui. Klik Simpan Profil untuk menyimpan perubahan.', true);
          const reader = new FileReader();
          reader.onload = function(event) {
            if (photoPreview) {
              photoPreview.src = event.target.result;
              photoPreview.style.display = 'block';
            }
            if (photoPlaceholder) {
              photoPlaceholder.style.display = 'none';
            }
            inputPhoto.dataset.base64 = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
      document.getElementById('input-whatsapp').value = user.whatsapp || '';
      formEditProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleProfileUpdate(currentUser.userId);
      });
    }
    // Setup password change form
    const formChangePassword = document.getElementById('form-change-password');
    if (formChangePassword) {
      const oldPwdInput = document.getElementById('input-old-password');
      const submitBtn = formChangePassword.querySelector('button[type="submit"]');
      const isSetPassword = user.hasPassword === false;
      // Jika user belum punya password (misal login via Google baru), hide form Password Lama
      if (isSetPassword && oldPwdInput) {
        const formGroup = oldPwdInput.closest('.form-group');
        if (formGroup) formGroup.style.display = 'none';
        oldPwdInput.removeAttribute('required');
        oldPwdInput.value = '';
        if (submitBtn) submitBtn.textContent = 'Set Password';
      }
      // Handler untuk fitur Lupa Password Inline
      const forgotPwdBtn = document.getElementById('btn-forgot-password-inline');
      if (forgotPwdBtn) {
        if (isSetPassword) {
          forgotPwdBtn.style.display = 'none'; // Sembunyikan jika tidak butuh password lama
        } else {
          forgotPwdBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const originalText = forgotPwdBtn.textContent;
            forgotPwdBtn.textContent = 'Mengirim...';
            forgotPwdBtn.style.pointerEvents = 'none';
            try {
              const result = await APIClient.requestPasswordReset(currentUser.email);
              if (result.success) {
                showSuccess('Link reset password telah dikirim ke email Anda (' + currentUser.email + ').');
              } else {
                throw new Error(result.message || 'Gagal mengirim link reset');
              }
            } catch (err) {
              showError(err.message);
            } finally {
              forgotPwdBtn.textContent = originalText;
              forgotPwdBtn.style.pointerEvents = 'auto';
            }
          });
        }
      }
      initPasswordToggle(formChangePassword);
      formChangePassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePasswordChange(currentUser.userId, isSetPassword);
      });
      const newPwdInput = document.getElementById('input-new-password');
      if (newPwdInput) {
        newPwdInput.addEventListener('input', function() {
          const strengthDiv = document.getElementById('user-password-strength');
          const strengthBar = document.getElementById('user-strength-bar');
          const strengthText = document.getElementById('user-strength-text');
          if (!strengthDiv || !strengthBar || !strengthText) return;
          const strengthInfo = getPasswordStrengthInfo(this.value);
          if (!strengthInfo.visible) {
            strengthDiv.style.display = 'none';
            return;
          }
          strengthDiv.style.display = 'block';
          strengthBar.className = `strength-bar ${strengthInfo.className}`;
          strengthBar.style.background = strengthInfo.color;
          strengthBar.style.width = `${strengthInfo.strength * 20}%`;
          strengthText.textContent = strengthInfo.text;
        });
      }
    }
  } catch (error) {
    console.error('Error rendering profile:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">
        ${error.message}
      </div>
    `;
  }
}
async function handleProfileUpdate(userId) {
  try {
    const displayName = document.getElementById('input-name').value.trim();
    const photoInput = document.getElementById('input-photo');
    const photoBase64 = photoInput && photoInput.dataset.base64 ? photoInput.dataset.base64 : null;
    const whatsapp = document.getElementById('input-whatsapp').value.trim();
    if (!displayName || displayName.length < 3) {
      showError('Nama minimal 3 karakter');
      return;
    }
    const btn = document.querySelector('#form-edit-profile button[type="submit"]');
    setButtonLoading(btn, true, 'Menyimpan...');
    const result = await APIClient.updateUserProfile(userId, displayName, whatsapp, photoBase64);
    if (result.success) {
      // Update session
      const user = DashboardAuth.getCurrentUser();
      user.displayName = displayName;
      user.whatsapp = whatsapp;
      if (result.data && result.data.photoURL) {
        user.photoURL = result.data.photoURL;
      }
      DashboardAuth.updateSession(user);
      const photoStatus = document.getElementById('photo-upload-status');
      setInlineStatus(photoStatus, '', false);
      showSuccess('Profil berhasil diperbarui');
    } else {
      throw new Error(result.message || 'Gagal memperbarui profil');
    }
  } catch (error) {
    showError('Error: ' + error.message);
  } finally {
    const btn = document.querySelector('#form-edit-profile button[type="submit"]');
    setButtonLoading(btn, false, 'Simpan Profil');
  }
}
async function handlePasswordChange(userId, isSetPassword = false) {
  try {
    const oldPassword = document.getElementById('input-old-password').value;
    const newPassword = document.getElementById('input-new-password').value;
    const confirmPassword = document.getElementById('input-confirm-password').value;
    if (isSetPassword) {
      if (!newPassword || !confirmPassword) {
        showError('Password baru dan konfirmasi harus diisi');
        return;
      }
    } else {
      if (!oldPassword || !newPassword || !confirmPassword) {
        showError('Semua field harus diisi');
        return;
      }
    }
    if (newPassword !== confirmPassword) {
      showError('Password baru tidak sesuai');
      return;
    }
    if (newPassword.length < 8) {
      showError('Password minimal 8 karakter');
      return;
    }
    const btn = document.querySelector('#form-change-password button[type="submit"]');
    setButtonLoading(btn, true, 'Menyimpan...');
    const result = await APIClient.changePassword(userId, isSetPassword ? '' : oldPassword, newPassword);
    if (result.success) {
      showSuccess(isSetPassword ? 'Password berhasil diatur' : 'Password berhasil diubah');
      document.getElementById('form-change-password').reset();
      // Update session local state to mark that password is now set
      const user = DashboardAuth.getCurrentUser();
      if (user && user.hasPassword === false) {
        user.hasPassword = true;
        DashboardAuth.updateSession(user);
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Reload to reset the UI forms
      }
    } else {
      throw new Error(result.message || 'Gagal mengubah password');
    }
  } catch (error) {
    showError('Error: ' + error.message);
  } finally {
    const btn = document.querySelector('#form-change-password button[type="submit"]');
    setButtonLoading(btn, false, isSetPassword ? 'Set Password' : 'Ubah Password');
  }
}
