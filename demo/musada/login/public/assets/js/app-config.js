(function () {
  const ROLES = Object.freeze({
    ADMIN: 'admin',
    GURU: 'guru',
    KEPSEK: 'kepsek',
    ORTU: 'ortu'
  });

  const ROLE_LABELS = Object.freeze({
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.GURU]: 'Guru / Wali Kelas',
    [ROLES.KEPSEK]: 'Kepala Sekolah',
    [ROLES.ORTU]: 'Orang Tua / Wali'
  });

  const NAV_ITEMS = Object.freeze({
    [ROLES.ADMIN]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Dashboard' },
      { hash: '#/admin/attendance', icon: 'ph-calendar-check', text: 'Rekapan Presensi' },
      { hash: '#/admin/users', icon: 'ph-users', text: 'Pengguna' },
      { hash: '#/admin/classes', icon: 'ph-books', text: 'Kelas & Siswa' },
      { hash: '#/admin/subjects', icon: 'ph-book-bookmark', text: 'Mata Pelajaran' },
      { hash: '#/admin/extracurriculars', icon: 'ph-person-simple-run', text: 'Ekstrakurikuler' },
      { hash: '#/admin/characters', icon: 'ph-star', text: 'Indikator Karakter' }
    ],
    [ROLES.GURU]: [
      { hash: '#/dashboard', icon: 'ph-squares-four', text: 'Beranda' },
      { hash: '#/guru/attendance', icon: 'ph-map-pin', text: 'Presensi Guru' },
      { hash: '#/guru/student-attendance', icon: 'ph-users-three', text: 'Absensi Siswa' },
      { hash: '#/guru/classes', icon: 'ph-chalkboard-teacher', text: 'E-Rapor (Kelas)' },
      { hash: '#/guru/academic', icon: 'ph-exam', text: 'Nilai Akademik' },
      { hash: '#/guru/additional', icon: 'ph-folder-plus', text: 'Data Tambahan Rapor' },
      { hash: '#/guru/observations', icon: 'ph-note-pencil', text: 'Riwayat Observasi' }
    ],
    [ROLES.KEPSEK]: [
      { hash: '#/dashboard', icon: 'ph-chart-pie', text: 'Dashboard Sekolah' },
      { hash: '#/kepsek/reports', icon: 'ph-file-text', text: 'Laporan Kelas' }
    ],
    [ROLES.ORTU]: [
      { hash: '#/ortu/dashboard', icon: 'ph-student', text: 'Perkembangan Anak' }
    ]
  });

  const DEFAULT_SETTINGS = Object.freeze({
    currentAcademicYear: '2026/2027',
    currentSemester: '1',
    attendanceRules: Object.freeze({
      checkInStart: '07:00',
      checkInEnd: '09:00',
      checkOutStart: '15:00',
      checkOutEnd: '17:00',
      attendanceStartDate: '',
      attendanceEndDate: ''
    })
  });

  function normalizeSettings(rawSettings = {}) {
    const source = rawSettings || {};
    const attendanceRules = source.attendanceRules || {};

    return {
      ...DEFAULT_SETTINGS,
      ...source,
      attendanceRules: {
        ...DEFAULT_SETTINGS.attendanceRules,
        ...attendanceRules
      }
    };
  }

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return Object.keys(value).map((key) => ({
      id: key,
      ...value[key]
    }));
  }

  function getRoleLabel(role) {
    return ROLE_LABELS[role] || 'Pengguna';
  }

  function getRoleNav(role) {
    return NAV_ITEMS[role] || [];
  }

  function getRoleBadgeClass(role) {
    switch (role) {
      case ROLES.ADMIN:
        return 'badge-primary';
      case ROLES.GURU:
        return 'badge-warning';
      case ROLES.KEPSEK:
        return 'badge-success';
      case ROLES.ORTU:
        return 'badge-outline';
      default:
        return 'badge-outline';
    }
  }

  const APP_DEFAULTS = Object.freeze({
    googleDriveUploadUrl: 'https://script.google.com/macros/s/AKfycbwHNSb34p_FcX_dTQuw87viaZ9joh2rT3KdtMLBVvwpocWzyF3HICPUPRfPuy63LDsNsw/exec',
    attendanceWorkerUrl: 'https://musada-absensi.sisitusdotcom.workers.dev/',
    attendanceGeofence: Object.freeze({
      lat: null,
      lng: null,
      radiusMeters: null
    })
  });

  const runtimeConfig = {
    googleDriveUploadUrl: window.GOOGLE_DRIVE_UPLOAD_URL || APP_DEFAULTS.googleDriveUploadUrl,
    attendanceWorkerUrl: window.CLOUDFLARE_ATTENDANCE_WORKER_URL || APP_DEFAULTS.attendanceWorkerUrl,
    attendanceGeofence: window.APP_ATTENDANCE_GEOFENCE || APP_DEFAULTS.attendanceGeofence
  };

  window.APP_ATTENDANCE_GEOFENCE = Object.freeze(runtimeConfig.attendanceGeofence);
  window.GOOGLE_DRIVE_UPLOAD_URL = runtimeConfig.googleDriveUploadUrl;
  window.CLOUDFLARE_ATTENDANCE_WORKER_URL = runtimeConfig.attendanceWorkerUrl;
  window.GOOGLE_DRIVE_CONFIG = Object.freeze({
    uploadUrl: runtimeConfig.googleDriveUploadUrl,
    attendanceWorkerUrl: runtimeConfig.attendanceWorkerUrl
  });

  window.AppConfig = Object.freeze({
    ROLES,
    ROLE_LABELS,
    NAV_ITEMS,
    DEFAULT_SETTINGS,
    APP_DEFAULTS,
    normalizeSettings,
    toArray,
    getRoleLabel,
    getRoleNav,
    getRoleBadgeClass
  });
})();
