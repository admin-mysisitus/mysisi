import APIClient from '/assets/js/modules/unified-api.js';
import {
  AuthManager
} from '/assets/js/modules/unified-auth.js';
import {
  normalizeDriveImageUrl,
  withCacheBust,
  setButtonLoading,
  getPasswordStrengthInfo
} from '/assets/js/modules/unified-utils.js';
export async function render() {
  try {
    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');
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
        void('Failed to parse corrupt user displayName JSON:', e);
      }
    }
    // Setup form with current data
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      document.getElementById('input-name').value = user.displayName || '';
      const photoPreview = document.getElementById('photo-preview');
      const photoPlaceholder = document.getElementById('photo-placeholder');
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
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              Swal.fire('Error', 'Ukuran foto maksimal 2MB', 'error');
              this.value = '';
              return;
            }
            const reader = new FileReader();
            reader.onload = function(event) {
              if (photoPreview) {
                photoPreview.src = event.target.result;
                photoPreview.style.display = 'block';
                inputPhoto.dataset.base64 = event.target.result;
              }
              if (photoPlaceholder) {
                photoPlaceholder.style.display = 'none';
              }
              const nameDisplay = document.getElementById('file-name-display');
              if (nameDisplay) {
                nameDisplay.textContent = file.name;
                nameDisplay.style.display = 'inline-block';
              }
            };
            reader.readAsDataURL(file);
          }
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
      formChangePassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePasswordChange(currentUser.userId);
      });
      // Setup toggle password visibility
      const toggleBtns = document.querySelectorAll('.toggle-password-btn');
      toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const targetId = this.getAttribute('data-target');
          const input = document.getElementById(targetId);
          const icon = this.querySelector('i');
          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        });
      });
      // Setup password strength indicator
      const newPwdInput = document.getElementById('input-new-password');
      if (newPwdInput) {
        newPwdInput.addEventListener('input', function() {
          updatePasswordStrength(this.value, 'admin-password-strength', 'admin-strength-bar', 'admin-strength-text');
        });
      }
    }
  } catch (error) {
    void('Error rendering profile:', error);
    Swal.fire('Error', error.message, 'error');
  }
}
async function handleProfileUpdate(userId) {
  try {
    const displayName = document.getElementById('input-name').value.trim();
    const photoInput = document.getElementById('input-photo');
    const photoBase64 = photoInput && photoInput.dataset.base64 ? photoInput.dataset.base64 : null;
    const whatsapp = document.getElementById('input-whatsapp').value.trim();
    if (!displayName || displayName.length < 3) {
      Swal.fire('Error', 'Nama minimal 3 karakter', 'error');
      return;
    }
    // Show loading state (you could implement a spinner button)
    const btn = document.querySelector('#form-edit-profile button[type="submit"]');
    setButtonLoading(btn, true, 'Menyimpan...');
    const result = await APIClient.updateUserProfile(userId, displayName, whatsapp, photoBase64);
    if (result.success) {
      // Update session
      const user = AuthManager.getCurrentUser();
      user.displayName = displayName;
      user.whatsapp = whatsapp;
      if (result.data && result.data.photoURL) {
        user.photoURL = result.data.photoURL;
      }
      AuthManager.updateUser(user);
      Swal.fire('Sukses', 'Profil berhasil diperbarui', 'success');
      // Update Navbar immediately
      const initials = displayName.charAt(0).toUpperCase();
      const profileBtn = document.getElementById('admin-profile-trigger');
      if (profileBtn) {
        const avatarEl = profileBtn.querySelector('.admin-avatar');
        if (avatarEl) avatarEl.textContent = initials;
        const nameEl = profileBtn.querySelector('span');
        if (nameEl) nameEl.textContent = displayName;
      }
    } else {
      throw new Error(result.message || 'Gagal memperbarui profil');
    }
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  } finally {
    const btn = document.querySelector('#form-edit-profile button[type="submit"]');
    setButtonLoading(btn, false, 'Simpan Profil');
  }
}
async function handlePasswordChange(userId) {
  try {
    const oldPassword = document.getElementById('input-old-password').value;
    const newPassword = document.getElementById('input-new-password').value;
    const confirmPassword = document.getElementById('input-confirm-password').value;
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire('Error', 'Semua field harus diisi', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Password baru tidak sesuai', 'error');
      return;
    }
    if (newPassword.length < 8) {
      Swal.fire('Error', 'Password minimal 8 karakter', 'error');
      return;
    }
    const btn = document.querySelector('#form-change-password button[type="submit"]');
    setButtonLoading(btn, true, 'Menyimpan...');
    const result = await APIClient.changePassword(userId, oldPassword, newPassword);
    if (result.success) {
      Swal.fire('Sukses', 'Password berhasil diubah', 'success');
      document.getElementById('form-change-password').reset();
    } else {
      throw new Error(result.message || 'Gagal mengubah password');
    }
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  } finally {
    const btn = document.querySelector('#form-change-password button[type="submit"]');
    setButtonLoading(btn, false, 'Ubah Password');
  }
}

function updatePasswordStrength(password, strengthDivId, strengthBarId, strengthTextId) {
  const strengthDiv = document.getElementById(strengthDivId);
  const strengthBar = document.getElementById(strengthBarId);
  const strengthText = document.getElementById(strengthTextId);
  if (!strengthDiv || !strengthBar || !strengthText) return;
  const strengthInfo = getPasswordStrengthInfo(password);
  if (!strengthInfo.visible) {
    strengthDiv.style.display = 'none';
    return;
  }
  strengthDiv.style.display = 'block';
  strengthBar.className = `strength-bar ${strengthInfo.className}`;
  strengthBar.style.background = strengthInfo.color;
  strengthBar.style.width = `${strengthInfo.strength * 20}%`;
  strengthText.textContent = strengthInfo.text;
}