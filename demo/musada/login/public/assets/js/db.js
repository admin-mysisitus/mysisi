// db.js — service layer untuk seluruh operasi Firebase RTDB.
// Setiap fungsi return data langsung (bukan snapshot) supaya caller bersih.
const DB = {
  _read(path, fallback = null) {
    if (!isDBReady()) return Promise.resolve(fallback);
    return db.ref(path).once('value').then((snap) => snap.val() ?? fallback);
  },

  _readCollection(path, fallback = {}) {
    return this._read(path, fallback);
  },

  _sanitizeUserPayload(data = {}) {
    const safeData = { ...data };
    delete safeData.password;
    return safeData;
  },

  _currentUserIsAdmin() {
    return !!(typeof Auth !== 'undefined' && Auth.currentRole === AppConfig.ROLES.ADMIN);
  },

  async _canManageClass(classId) {
    if (!classId || typeof Auth === 'undefined' || !Auth.currentUser) return true;
    if (this._currentUserIsAdmin()) return true;

    const classes = await this.getClasses();
    const cls = classes[classId] || null;
    return !!(cls && (cls.teacherId === Auth.currentUser.uid || (cls.subjectTeachers && Object.values(cls.subjectTeachers).includes(Auth.currentUser.uid))));
  },

  _buildAttendancePayload(data = {}) {
    const payload = {};
    if (data.time_in) payload.time_in = data.time_in;
    if (data.location_in) payload.location_in = data.location_in;
    if (data.time_out) payload.time_out = data.time_out;
    if (data.location_out) payload.location_out = data.location_out;
    if (data.proof_url) payload.proof_url = data.proof_url;
    if (data.proofUrl) payload.proof_url = data.proofUrl;
    return payload;
  },

  _serializeStudentAttendance(data = {}) {
    const normalized = {};
    Object.entries(data || {}).forEach(([studentId, status]) => {
      if (['H', 'S', 'I', 'A'].includes(status)) normalized[studentId] = status;
    });
    return normalized;
  },

  // --- USERS ---
  async getUser(uid) {
    return this._read(`users/${uid}`, null);
  },
  async getAllUsers() {
    return this._readCollection('users', {});
  },
  async getUsersByRole(role) {
    const users = await this.getAllUsers();
    return this.toArray(users).filter(u => u.role === role);
  },
  async saveUser(uid, data) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).update(this._sanitizeUserPayload(data));
  },
  async saveProfilePhoto(uid, base64Data, mimeType = 'image/jpeg') {
    if (!uid || !base64Data) return null;
    const fileUrl = await DriveBridge.uploadProfilePhoto(uid, base64Data, mimeType);
    if (!fileUrl) return null;
    await db.ref(`users/${uid}/photoURL`).set(fileUrl);
    return fileUrl;
  },
  async uploadDriveFile(fileName, mimeType, base64Data, folderId = null) {
    if (!fileName || !mimeType || !base64Data) return null;
    const result = await DriveBridge.uploadBase64({ fileName, mimeType, base64Data, folderId });
    return result.fileUrl || null;
  },
  async createUserInDB(uid, data) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).set({
      ...this._sanitizeUserPayload(data),
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async deleteUser(uid) {
    if (!isDBReady()) return;
    await db.ref(`users/${uid}`).remove();
  },
  // --- SETTINGS (Tahun ajaran & semester) ---
  async getSettings() {
    const defaultSettings = AppConfig.DEFAULT_SETTINGS;

    if (!isDBReady()) return defaultSettings;
    const snap = await db.ref('settings').once('value');
    const current = snap.val() || {};
    return AppConfig.normalizeSettings(current);
  },
  async updateSettings(data) {
    if (!isDBReady()) return;
    await db.ref('settings').update(data);
  },
  // --- SCHOOL SETTINGS (Global config) ---
  async getSchoolSettings() {
    const defaultSettings = {
      location: {
        lat: null,
        lng: null,
        radius_meters: null
      }
    };
    if (!isDBReady()) return defaultSettings;
    const snap = await db.ref('school_settings').once('value');
    const current = snap.val() || {};
    return {
      ...defaultSettings,
      ...current,
      location: {
        lat: current.location?.lat ?? null,
        lng: current.location?.lng ?? null,
        radius_meters: current.location?.radius_meters ?? null
      }
    };
  },
  async updateSchoolSettings(data) {
    if (!isDBReady()) return;
    await db.ref('school_settings').update(data);
  },
  // --- TEACHER ATTENDANCE ---
  async getTeacherAttendance(dateStr, teacherId) {
    return this._read(`teacher_attendance/${dateStr}/${teacherId}`, null);
  },
  async getTeacherAttendanceByDate(dateStr) {
    return this._readCollection(`teacher_attendance/${dateStr}`, {});
  },
  async saveTeacherAttendance(dateStr, teacherId, data) {
    if (!isDBReady()) return;
    const isAdmin = this._currentUserIsAdmin();
    if (typeof Auth !== 'undefined' && Auth.currentUser && teacherId !== Auth.currentUser.uid && !isAdmin) {
      throw new Error('Anda tidak berwenang mengubah presensi guru lain.');
    }

    const payload = this._buildAttendancePayload(data || {});
    if (!Object.keys(payload).length) return;
    await db.ref(`teacher_attendance/${dateStr}/${teacherId}`).update(payload);
  },
  async saveTeacherAttendanceProof(dateStr, teacherId, base64Data, mimeType = 'image/jpeg') {
    if (!base64Data) return null;
    const fileUrl = await DriveBridge.uploadAttendanceProof(dateStr, teacherId, base64Data, mimeType);
    if (!fileUrl) return null;
    await this.saveTeacherAttendance(dateStr, teacherId, { proof_url: fileUrl });
    return fileUrl;
  },
  async submitTeacherAttendanceToWorker({ dateStr, teacherId, type, photoDataUrl, location, accuracy }) {
    const workerUrl = (window.CLOUDFLARE_ATTENDANCE_WORKER_URL || '').trim();

    if (!workerUrl || workerUrl.includes('your-subdomain')) {
      const fallbackProof = await this.saveTeacherAttendanceProof(dateStr, teacherId, photoDataUrl, 'image/jpeg');
      const payload = {
        ...(type === 'in' ? { time_in: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(type === 'out' ? { time_out: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : {}),
        ...(location ? (type === 'in' ? { location_in: location } : { location_out: location }) : {}),
        ...(fallbackProof ? { proof_url: fallbackProof } : {})
      };
      await this.saveTeacherAttendance(dateStr, teacherId, payload);
      return { status: 'success', proof_url: fallbackProof, record: payload };
    }

    const user = typeof firebase !== 'undefined' && firebase.auth ? firebase.auth().currentUser : null;
    const idToken = user ? await user.getIdToken() : '';
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        dateStr,
        teacherId,
        type,
        photoDataUrl,
        location,
        accuracy,
        clientTimestamp: new Date().toISOString()
      })
    });

    let result = {};
    try {
      result = await response.json();
    } catch (error) {
      result = { status: 'error', message: 'Respons worker tidak valid JSON.' };
    }

    if (!response.ok || result.status !== 'success') {
      throw new Error(result && result.message ? result.message : 'Gagal memvalidasi absensi di server.');
    }

    return result;
  },
  // --- STUDENT ATTENDANCE (Daily per class) ---
  async getDailyStudentAttendance(dateStr, classId) {
    return this._readCollection(`student_attendance_daily/${dateStr}/${classId}`, {});
  },
  async getDailyStudentAttendanceByDate(dateStr) {
    return this._readCollection(`student_attendance_daily/${dateStr}`, {});
  },
  async saveDailyStudentAttendance(dateStr, classId, data) {
    if (!isDBReady()) return;
    if (typeof Auth !== 'undefined' && Auth.currentUser && !this._currentUserIsAdmin()) {
      const canManage = await this._canManageClass(classId);
      if (!canManage) {
        throw new Error('Anda tidak berwenang mengisi absensi kelas ini.');
      }
    }

    const normalized = this._serializeStudentAttendance(data);
    if (!Object.keys(normalized).length) return;
    await db.ref(`student_attendance_daily/${dateStr}/${classId}`).update(normalized);
  },
  // --- CHARACTERS (Aspek/Indikator) ---
  async getCharacters() {
    if (!isDBReady()) return {};
    const snap = await db.ref('characters').orderByChild('order').once('value');
    return snap.val() || {};
  },
  async saveCharacter(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`characters/${id}`) : db.ref('characters').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteCharacter(id) {
    if (!isDBReady()) return;
    await db.ref(`characters/${id}`).remove();
  },
  // --- CLASSES ---
  async getClasses() {
    return this._readCollection('classes', {});
  },
  async getClassesForTeacher(teacherUid) {
    const classes = await this.getClasses();
    return this.toArray(classes).filter(c => {
      const isWali = c.teacherId === teacherUid;
      const isMapel = c.subjectTeachers && Object.values(c.subjectTeachers).includes(teacherUid);
      return isWali || isMapel;
    });
  },
  async saveClass(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`classes/${id}`) : db.ref('classes').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteClass(id) {
    if (!isDBReady()) return;
    await db.ref(`classes/${id}`).remove();
  },
  async saveClassSubjectTeachers(classId, subjectTeachers) {
    if (!isDBReady()) return;
    await db.ref(`classes/${classId}/subjectTeachers`).set(subjectTeachers);
  },
  // --- STUDENTS ---
  async getAllStudents() {
    return this._readCollection('students', {});
  },
  async getStudentsByClass(classId) {
    if (!isDBReady()) return {};
    const snap = await db.ref('students').orderByChild('classId').equalTo(classId).once('value');
    return snap.val() || {};
  },
  async getStudentsByParent(parentUid) {
    if (!isDBReady()) return {};
    const snap = await db.ref('students').orderByChild('parentId').equalTo(parentUid).once('value');
    return snap.val() || {};
  },
  async getStudent(id) {
    return this._read(`students/${id}`, null);
  },
  async saveStudent(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`students/${id}`) : db.ref('students').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteStudent(id) {
    if (!isDBReady()) return;
    await db.ref(`students/${id}`).remove();
  },
  // --- ASSESSMENTS (Penilaian skala 1-4) ---
  // Struktur: assessments/{year-sem}/{studentId}/{charId} = { score, updatedAt, updatedBy }
  _assessPath(year, sem) {
    return `assessments/${year.replace('/', '-')}_${sem}`;
  },
  async getAssessments(year, sem, studentId) {
    return this._readCollection(`${this._assessPath(year, sem)}/${studentId}`, {});
  },
  async getAllAssessmentsForPeriod(year, sem) {
    return this._readCollection(this._assessPath(year, sem), {});
  },
  async saveAssessment(year, sem, studentId, charId, score, teacherId) {
    if (!isDBReady()) return;
    await db.ref(`${this._assessPath(year, sem)}/${studentId}/${charId}`).set({
      score: parseInt(score),
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      updatedBy: teacherId
    });
  },
  // --- OBSERVATIONS (Catatan perilaku) ---
  async getObservationsByStudent(studentId) {
    if (!isDBReady()) return {};
    const snap = await db.ref('observations').orderByChild('studentId').equalTo(studentId).once('value');
    return snap.val() || {};
  },
  async getObservationsByTeacher(teacherUid) {
    if (!isDBReady()) return {};
    const snap = await db.ref('observations').orderByChild('teacherId').equalTo(teacherUid).once('value');
    return snap.val() || {};
  },
  async getAllObservations() {
    return this._readCollection('observations', {});
  },
  async saveObservation(data) {
    if (!isDBReady()) return null;
    data.timestamp = firebase.database.ServerValue.TIMESTAMP;
    const ref = await db.ref('observations').push(data);
    return ref.key;
  },
  async deleteObservation(id) {
    if (!isDBReady()) return;
    await db.ref(`observations/${id}`).remove();
  },
  // --- SUBJECTS (Mata Pelajaran) ---
  async getSubjects() {
    if (!isDBReady()) return {};
    const snap = await db.ref('subjects').orderByChild('order').once('value');
    return snap.val() || {};
  },
  async saveSubject(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`subjects/${id}`) : db.ref('subjects').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteSubject(id) {
    if (!isDBReady()) return;
    await db.ref(`subjects/${id}`).remove();
  },
  // --- EXTRACURRICULARS (Master Data Ekskul) ---
  async getExtracurriculars() {
    return this._readCollection('extracurriculars', {});
  },
  async saveExtracurricular(id, data) {
    if (!isDBReady()) return null;
    const ref = id ? db.ref(`extracurriculars/${id}`) : db.ref('extracurriculars').push();
    await ref.set(data);
    return ref.key;
  },
  async deleteExtracurricular(id) {
    if (!isDBReady()) return;
    await db.ref(`extracurriculars/${id}`).remove();
  },
  // --- RAPOR DATA PATH HELPER ---
  _raporPath(type, year, sem) {
    return `${type}/${year.replace('/', '-')}_${sem}`;
  },
  // --- ACADEMIC GRADES ---
  async getAcademicGrades(year, sem, studentId) {
    return this._readCollection(`${this._raporPath('academic_grades', year, sem)}/${studentId}`, {});
  },
  async getAllAcademicGrades(year, sem) {
    return this._readCollection(this._raporPath('academic_grades', year, sem), {});
  },
  async saveAcademicGrade(year, sem, studentId, subjectId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('academic_grades', year, sem)}/${studentId}/${subjectId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  // --- STUDENT EXTRACURRICULARS ---
  async getStudentExtracurriculars(year, sem, studentId) {
    return this._readCollection(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}`, {});
  },
  async saveStudentExtracurricular(year, sem, studentId, ekskulId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}/${ekskulId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  async deleteStudentExtracurricular(year, sem, studentId, ekskulId) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('student_extracurriculars', year, sem)}/${studentId}/${ekskulId}`).remove();
  },
  // --- COCURRICULARS ---
  async getCocurricular(year, sem, studentId) {
    return this._read(`${this._raporPath('cocurriculars', year, sem)}/${studentId}`, null);
  },
  async saveCocurricular(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('cocurriculars', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  // --- ATTENDANCES ---
  async getAttendance(year, sem, studentId) {
    return this._read(`${this._raporPath('attendances', year, sem)}/${studentId}`, null);
  },
  async saveAttendance(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('attendances', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  // --- TEACHER NOTES ---
  async getTeacherNote(year, sem, studentId) {
    return this._read(`${this._raporPath('teacher_notes', year, sem)}/${studentId}`, null);
  },
  async saveTeacherNote(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('teacher_notes', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  },
  // --- PARENT RESPONSES ---
  async getParentResponse(year, sem, studentId) {
    return this._read(`${this._raporPath('parent_responses', year, sem)}/${studentId}`, null);
  },
  async saveParentResponse(year, sem, studentId, data) {
    if (!isDBReady()) return;
    await db.ref(`${this._raporPath('parent_responses', year, sem)}/${studentId}`).set({
      ...data,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    });
  }
};

Object.assign(DB, {
  normalizeSettings: AppConfig.normalizeSettings,
  toArray: AppConfig.toArray
});