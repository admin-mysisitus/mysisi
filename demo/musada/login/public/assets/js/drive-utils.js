const DriveBridge = {
  normalizeDriveImageUrl(rawUrl, size = 'w200', fallback = '') {
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
  },
  ensureUploadConfig() {
    const uploadUrl = window.GOOGLE_DRIVE_UPLOAD_URL || (window.GOOGLE_DRIVE_CONFIG && window.GOOGLE_DRIVE_CONFIG.uploadUrl) || '';
    if (!uploadUrl) {
      throw new Error('Konfigurasi Google Drive belum lengkap. Set GOOGLE_DRIVE_UPLOAD_URL di firebase-config.js atau window global.');
    }
    return { uploadUrl };
  },
  async uploadBase64({ fileName, mimeType, base64Data, folderId = null, folderKey = null }) {
    const normalizedBase64 = typeof base64Data === 'string' && base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;

    if (!fileName || !mimeType || !normalizedBase64) {
      throw new Error('File, tipe file, dan data base64 wajib diisi.');
    }

    const config = this.ensureUploadConfig();
    const payload = new URLSearchParams();
    payload.append('action', 'upload');
    payload.append('fileName', fileName);
    payload.append('mimeType', mimeType);
    payload.append('fileData', normalizedBase64);

    if (folderKey) payload.append('folderKey', folderKey);
    if (folderId) payload.append('folderId', folderId);

    const response = await fetch(config.uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: payload.toString()
    });

    let result;
    try {
      result = await response.json();
    } catch (error) {
      const text = await response.text();
      throw new Error(text || 'Upload ke Google Drive gagal.');
    }

    if (!result || result.status !== 'success') {
      throw new Error(result && result.message ? result.message : 'Upload ke Google Drive gagal.');
    }

    return result;
  },
  async uploadProfilePhoto(uid, base64Data, mimeType = 'image/jpeg') {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `profile_${uid}_${Date.now()}.${ext}`;
    const upload = await this.uploadBase64({ fileName, mimeType, base64Data, folderKey: 'profile' });
    return upload.fileUrl;
  },
  async uploadAttendanceProof(dateStr, teacherId, base64Data, mimeType = 'image/jpeg') {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `attendance_${teacherId}_${dateStr}_${Date.now()}.${ext}`;
    const upload = await this.uploadBase64({ fileName, mimeType, base64Data, folderKey: 'attendance' });
    return upload.fileUrl;
  }
};
