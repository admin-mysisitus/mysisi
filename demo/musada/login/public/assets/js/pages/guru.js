// guru.js — Modul Guru/Wali Kelas.
// Fitur: melihat kelas yang diampu, penilaian karakter tap-to-rate,
// catatan observasi, dan riwayat observasi.
const ATTENDANCE_GEOFENCE = window.APP_ATTENDANCE_GEOFENCE || {
  lat: null,
  lng: null,
  radiusMeters: null
};

const GuruPages = {
  // ========== BERANDA (Dasbor Universal) ==========
  async renderDashboard(container) {
    Router.setTitle('Beranda', 'Selamat datang di Dasbor Digital Sekolah.');
    
    // Ambil data hari ini
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const [classArr, students, myAtt] = await Promise.all([DB.getClassesForTeacher(Auth.currentUser.uid), DB.getAllStudents(), DB.getTeacherAttendance(dateStr, Auth.currentUser.uid)]);
    const studentCount = DB.toArray(students).filter(s => classArr.some(c => c.id === s.classId)).length;
    let attStatus = 'Belum Presensi';
    let attClass = 'badge-warning';
    if (myAtt) {
      if (myAtt.time_out) {
        attStatus = 'Sudah Pulang (' + myAtt.time_out + ')';
        attClass = 'badge-success';
      } else if (myAtt.time_in) {
        attStatus = 'Sudah Datang (' + myAtt.time_in + ')';
        attClass = 'badge-success';
      }
    }

    container.innerHTML = `
      <div class="card hero-panel">
        <div class="hero-panel__inner">
          <div>
            <p class="hero-panel__meta">${today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 class="hero-panel__time">${timeStr}</h2>
          </div>
          <div class="hero-panel__status">
            <p class="hero-panel__meta">Status Kehadiran</p>
            <span class="badge ${attClass}">${attStatus}</span>
          </div>
        </div>
      </div>

      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-map-pin"></i></div>
          <div><p class="stat-value">${myAtt ? (myAtt.time_in ? '✓' : '—') : '—'}</p><p class="stat-label text-muted">Datang</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-users-three"></i></div>
          <div><p class="stat-value">${studentCount}</p><p class="stat-label text-muted">Siswa di kelas saya</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${classArr.length}</p><p class="stat-label text-muted">Kelas terlibat</p></div>
        </div>
      </section>

      <h3 class="card-title">Aksi Cepat</h3>
      <div class="quick-grid section-spacer">
        <div class="card quick-action quick-action--success" onclick="window.location.hash='#/guru/attendance'">
          <div class="quick-action-icon"><i class="ph ph-map-pin"></i></div>
          <h4 class="quick-action-title">Presensi Saya</h4>
        </div>
        <div class="card quick-action quick-action--info" onclick="window.location.hash='#/guru/student-attendance'">
          <div class="quick-action-icon"><i class="ph ph-users-three"></i></div>
          <h4 class="quick-action-title">Absensi Siswa</h4>
        </div>
        <div class="card quick-action quick-action--danger" onclick="window.location.hash='#/guru/classes'">
          <div class="quick-action-icon"><i class="ph ph-star"></i></div>
          <h4 class="quick-action-title">E-Rapor</h4>
        </div>
      </div>

      <div class="card panel-callout">
        <h3 class="card-title info-banner"><i class="ph ph-megaphone"></i> Papan Informasi</h3>
        <p class="text-muted soft-note">Validasi lokasi dilakukan oleh server secara aman. Browser tidak menyimpan koordinat sekolah untuk keperluan validasi presensi.</p>
      </div>
    `;
  },
  // ========== KELAS SAYA (Untuk E-Rapor) ==========
  async renderClasses(container) {
    Router.setTitle('Kelas Saya', 'Pilih kelas untuk menilai karakter dan akademik.');
    const classArr = await DB.getClassesForTeacher(Auth.currentUser.uid);
    const students = await DB.getAllStudents();
    const studentArr = DB.toArray(students);
    if (!classArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Anda belum ditugaskan mengajar di kelas manapun. Hubungi admin untuk mendapatkan akses.</p></div>`;
      return;
    }
    const cards = classArr.map(c => {
      const isWali = c.teacherId === Auth.currentUser.uid;
      const count = studentArr.filter(s => s.classId === c.id).length;
      return `
        <div class="card class-card" onclick="window.location.hash='#/guru/assess/${c.id}'">
          <div class="card-header">
            <h3 class="card-title">${c.name}</h3>
            ${isWali ? '<span class="badge badge-primary">Wali Kelas</span>' : '<span class="badge badge-success">Guru Mapel</span>'}
          </div>
          <p class="text-muted">${count} siswa terdaftar</p>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window.location.hash='#/guru/assess/${c.id}'"><i class="ph ph-note-pencil"></i> Nilai Karakter</button>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();window.location.hash='#/guru/observe/${c.id}'"><i class="ph ph-chat-text"></i> Catatan</button>
          </div>
        </div>`;
    }).join('');
    container.innerHTML = `<div class="card-grid">${cards}</div>`;
  },
  // ========== PENILAIAN KARAKTER (tap-to-rate) ==========
  async renderAssessment(container, classId) {
    const [classes, charData, settings] = await Promise.all([
      DB.getClasses(),
      DB.getCharacters(),
      DB.getSettings()
    ]);
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }
    Router.setTitle(`Penilaian ${cls.name}`, `${settings.currentAcademicYear} — Semester ${settings.currentSemester}`);
    const studentData = await DB.getStudentsByClass(classId);
    const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
    const charArr = DB.toArray(charData).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!studentArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini. Minta admin menambahkan data siswa.</p></div>`;
      return;
    }
    if (!charArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Belum ada indikator karakter aktif. Minta admin untuk menambahkan indikator.</p></div>`;
      return;
    }
    // Fetch existing scores for every student in this period
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const allScores = {};
    for (const s of studentArr) {
      allScores[s.id] = await DB.getAssessments(year, sem, s.id);
    }
    const scoreLabel = {
      1: 'Perlu Bimbingan',
      2: 'Mulai Berkembang',
      3: 'Baik',
      4: 'Sangat Baik'
    };
    const studentCards = studentArr.map(s => {
      const ratingRows = charArr.map(ch => {
        const existing = allScores[s.id]?.[ch.id]?.score || 0;
        const btns = [1, 2, 3, 4].map(n => `
          <button class="rating-btn ${existing === n ? 'active' : ''}"
                  data-score="${n}" data-stu="${s.id}" data-char="${ch.id}"
                  title="${scoreLabel[n]}">${n}</button>
        `).join('');
        return `
          <div class="rating-row">
            <div class="rating-label">${ch.name}</div>
            <div class="rating-options">${btns}</div>
          </div>`;
      }).join('');
      return `
        <div class="card assess-card">
          <div class="card-header">
            <h3 class="card-title" style="font-size:15px">${s.name}</h3>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-outline btn-sm" onclick="window.open('print.html?id=${s.id}', '_blank')">
                <i class="ph ph-printer"></i> Cetak
              </button>
              <button class="btn btn-outline btn-sm" onclick="GuruPages._openObsModal('${s.id}','${s.name.replace(/'/g, "\\'")}')">
                <i class="ph ph-chat-text"></i> Catatan
              </button>
            </div>
          </div>
          ${ratingRows}
        </div>`;
    }).join('');
    container.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <p class="text-muted" style="font-size:13px">Ketuk angka untuk memberi nilai: <strong>1</strong> (Perlu Bimbingan) — <strong>4</strong> (Sangat Baik). Nilai langsung tersimpan ke database.</p>
      </div>
      <div class="card-grid">${studentCards}</div>
      ${this._obsModal(charArr)}
    `;
    // delegated click handler — tap-to-rate
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('.rating-btn');
      if (!btn) return;
      const {
        stu,
        char,
        score
      } = btn.dataset;
      const siblings = btn.parentElement.querySelectorAll('.rating-btn');
      siblings.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // simpan ke Firebase
      try {
        await DB.saveAssessment(year, sem, stu, char, score, Auth.currentUser.uid);
      } catch (err) {
        
      }
    });
  },
  // ========== CATATAN OBSERVASI (per kelas) ==========
  async renderObserveClass(container, classId) {
    const [classes, charData, studentData] = await Promise.all([
      DB.getClasses(),
      DB.getCharacters(),
      DB.getStudentsByClass(classId)
    ]);
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }
    Router.setTitle(`Catatan observasi — ${cls.name}`, 'Catat perilaku positif atau yang perlu bimbingan.');
    const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
    const charArr = DB.toArray(charData).filter(c => c.active !== false);
    // tampilkan form catatan cepat
    const stuOpts = studentArr.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const charOpts = charArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    // fetch existing observations by this teacher
    const obsData = await DB.getObservationsByTeacher(Auth.currentUser.uid);
    const obsArr = DB.toArray(obsData).filter(o => studentArr.some(s => s.id === o.studentId)).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 30); // 30 terbaru
    const obsRows = obsArr.length ? obsArr.map(o => {
      const stu = studentArr.find(s => s.id === o.studentId);
      const ch = charArr.find(c => c.id === o.characterId);
      const d = o.date || '-';
      return `
        <div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
          <div class="obs-meta">
            <strong>${stu ? stu.name : '?'}</strong>
            <span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
          </div>
          <p class="obs-note">${o.note || '-'}</p>
          <p class="obs-date text-muted">${ch ? ch.name : ''} · ${d}</p>
        </div>`;
    }).join('') : '<p class="text-muted" style="padding:12px 0">Belum ada catatan observasi.</p>';
    container.innerHTML = `
      <div style="margin-bottom:16px"><a href="#/guru/classes" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>

      <div class="card" style="margin-bottom:20px">
        <h3 class="card-title" style="margin-bottom:16px">Tambah catatan cepat</h3>
        <form id="form-obs-quick">
          <div class="form-group"><label>Siswa</label><select id="oq-stu" required>${stuOpts}</select></div>
          <div class="form-row">
            <div class="form-group"><label>Jenis</label>
              <select id="oq-type"><option value="positive">👍 Positif</option><option value="needs_improvement">⚠ Perlu bimbingan</option></select>
            </div>
            <div class="form-group"><label>Karakter</label><select id="oq-char" required>${charOpts}</select></div>
          </div>
          <div class="form-group"><label>Catatan</label>
            <textarea id="oq-note" rows="2" placeholder="Contoh: Membantu teman merapikan kelas setelah selesai belajar."></textarea>
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-paper-plane-tilt"></i> Simpan</button>
        </form>
      </div>

      <div class="card">
        <h3 class="card-title" style="margin-bottom:12px">Riwayat catatan terbaru</h3>
        <div class="obs-list">${obsRows}</div>
      </div>
    `;
    document.getElementById('form-obs-quick').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
      const today = new Date().toISOString().slice(0, 10);
      await DB.saveObservation({
        studentId: document.getElementById('oq-stu').value,
        teacherId: Auth.currentUser.uid,
        type: document.getElementById('oq-type').value,
        characterId: document.getElementById('oq-char').value,
        note: document.getElementById('oq-note').value.trim(),
        date: today
      });
      // re-render to show new entry
      this.renderObserveClass(container, classId);
    };
  },
  // ========== RIWAYAT OBSERVASI GLOBAL ==========
  async renderObservationHistory(container) {
    Router.setTitle('Riwayat observasi', 'Seluruh catatan perilaku yang pernah Anda tulis.');
    const [obsData, students, charData] = await Promise.all([
      DB.getObservationsByTeacher(Auth.currentUser.uid),
      DB.getAllStudents(),
      DB.getCharacters()
    ]);
    const obsArr = DB.toArray(obsData).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const studentMap = students || {};
    const charMap = charData || {};
    if (!obsArr.length) {
      container.innerHTML = '<div class="card"><p class="text-muted">Belum ada catatan observasi. Mulai dari halaman kelas Anda.</p></div>';
      return;
    }
    const items = obsArr.map(o => {
      const stu = studentMap[o.studentId];
      const ch = charMap[o.characterId];
      return `
        <div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
          <div class="obs-meta">
            <strong>${stu ? stu.name : 'Siswa'}</strong>
            <span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
          </div>
          <p class="obs-note">${o.note || '-'}</p>
          <p class="obs-date text-muted">${ch ? ch.name : ''} · ${o.date || ''}</p>
        </div>`;
    }).join('');
    container.innerHTML = `<div class="card"><div class="obs-list">${items}</div></div>`;
  },
  // ========== PENILAIAN AKADEMIK ==========
  async renderAcademicGrades(container) {
    Router.setTitle('Nilai Akademik', 'Input nilai akhir dan capaian kompetensi siswa.');
    const uid = Auth.currentUser.uid; const [classArr, subjects, settings] = await Promise.all([DB.getClassesForTeacher(uid), DB.getSubjects(), DB.getSettings()]);
    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (!classArr.length || !subArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Data kelas atau mata pelajaran belum tersedia untuk Anda.</p></div>`;
      return;
    }
    const classOpts = classArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    container.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <form id="filter-academic" class="inline-form" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end">
          <div class="form-group" style="margin-bottom:0;flex:1;min-width:200px">
            <label>Pilih Kelas</label>
            <select id="ac-class" required>
              <option value="">— Pilih Kelas —</option>
              ${classOpts}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;flex:1;min-width:200px">
            <label>Mata Pelajaran</label>
            <select id="ac-subject" required disabled>
              <option value="">— Pilih Mata Pelajaran —</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-magnifying-glass"></i> Tampilkan</button>
        </form>
      </div>
      <div id="academic-container"></div>
    `;

    document.getElementById('ac-class').addEventListener('change', (e) => {
      const classId = e.target.value;
      const subSelect = document.getElementById('ac-subject');
      subSelect.innerHTML = '<option value="">— Pilih Mata Pelajaran —</option>';
      if (!classId) {
        subSelect.disabled = true;
        return;
      }
      
      const cls = classArr.find(c => c.id === classId);
      const isWali = cls.teacherId === uid;
      
      let availableSubjects = [];
      if (isWali) {
        availableSubjects = subArr;
      } else {
        const mySubjectIds = Object.keys(cls.subjectTeachers || {}).filter(subId => cls.subjectTeachers[subId] === uid);
        availableSubjects = subArr.filter(s => mySubjectIds.includes(s.id));
      }
      
      availableSubjects.forEach(s => {
        subSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });
      subSelect.disabled = availableSubjects.length === 0;
    });

    document.getElementById('filter-academic').onsubmit = async (e) => {
      e.preventDefault();
      const classId = document.getElementById('ac-class').value;
      const subjectId = document.getElementById('ac-subject').value;
      if (!classId || !subjectId) return;
      const acContainer = document.getElementById('academic-container');
      acContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
      const students = await DB.getStudentsByClass(classId);
      const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
      if (!studentArr.length) {
        acContainer.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
        return;
      }
      const year = settings.currentAcademicYear;
      const sem = settings.currentSemester;
      const grades = {};
      for (const s of studentArr) {
        const studentGrades = await DB.getAcademicGrades(year, sem, s.id);
        grades[s.id] = studentGrades[subjectId] || {
          score: '',
          competency: ''
        };
      }
      const rows = studentArr.map((s, idx) => `
        <div class="card" style="margin-bottom: 12px; padding: 12px;">
          <h4 style="margin-top:0; margin-bottom:12px; font-size:15px">${idx + 1}. ${s.name}</h4>
          <div style="display:flex; gap:16px; flex-wrap:wrap">
            <div class="form-group" style="flex: 0 0 100px; margin-bottom:0">
              <label>Nilai Akhir</label>
              <input type="number" class="ac-score" data-stu="${s.id}" value="${grades[s.id].score || ''}" placeholder="0-100" min="0" max="100">
            </div>
            <div class="form-group" style="flex: 1; min-width:250px; margin-bottom:0">
              <label>Capaian Kompetensi</label>
              <textarea class="ac-comp" data-stu="${s.id}" rows="2" placeholder="Contoh: Ananda sangat baik dalam...">${grades[s.id].competency || ''}</textarea>
            </div>
          </div>
        </div>
      `).join('');
      acContainer.innerHTML = `
        <div style="margin-bottom: 16px;">
          ${rows}
        </div>
        <button id="btn-save-academic" class="btn btn-primary" style="width:100%"><i class="ph ph-floppy-disk"></i> Simpan Semua Nilai</button>
      `;
      document.getElementById('btn-save-academic').onclick = async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
        const scores = document.querySelectorAll('.ac-score');
        const comps = document.querySelectorAll('.ac-comp');
        const promises = [];
        for (let i = 0; i < studentArr.length; i++) {
          const stuId = studentArr[i].id;
          const score = scores[i].value;
          const comp = comps[i].value.trim();
          if (score || comp) {
            promises.push(DB.saveAcademicGrade(year, sem, stuId, subjectId, {
              score: score ? parseInt(score) : null,
              competency: comp,
              updatedBy: Auth.currentUser.uid
            }));
          }
        }
        try {
          await Promise.all(promises);
          btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
          setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai';
          }, 2000);
        } catch (err) {
          
          alert('Gagal menyimpan nilai.');
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai';
        }
      };
    };
  },
  // ========== DATA TAMBAHAN RAPOR ==========
  async renderAdditionalData(container) {
    Router.setTitle('Data Tambahan', 'Input Kokurikuler, Ekstrakurikuler, Kehadiran, dan Catatan Wali Kelas.');
    const [classes, ekskuls, settings] = await Promise.all([
      DB.getClasses(),
      DB.getExtracurriculars(),
      DB.getSettings()
    ]);
    const classArr = DB.toArray(classes);
    const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!classArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Data kelas belum tersedia.</p></div>`;
      return;
    }
    const classOpts = classArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    container.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="form-group" style="margin-bottom:0">
          <label>Pilih Kelas</label>
          <select id="add-class">
            <option value="">— Pilih Kelas —</option>
            ${classOpts}
          </select>
        </div>
      </div>
      <div id="add-student-container"></div>
      <div id="add-form-container"></div>
    `;
    document.getElementById('add-class').onchange = async (e) => {
      const classId = e.target.value;
      const stuContainer = document.getElementById('add-student-container');
      const formContainer = document.getElementById('add-form-container');
      formContainer.innerHTML = '';
      if (!classId) {
        stuContainer.innerHTML = '';
        return;
      }
      stuContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
      const students = await DB.getStudentsByClass(classId);
      const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
      if (!studentArr.length) {
        stuContainer.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
        return;
      }
      const stuOpts = studentArr.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
      stuContainer.innerHTML = `
        <div class="card" style="margin-bottom:20px">
          <div class="form-group" style="margin-bottom:0">
            <label>Pilih Siswa</label>
            <select id="add-student">
              <option value="">— Pilih Siswa —</option>
              ${stuOpts}
            </select>
          </div>
        </div>
      `;
      document.getElementById('add-student').onchange = async (e) => {
        const studentId = e.target.value;
        if (!studentId) {
          formContainer.innerHTML = '';
          return;
        }
        formContainer.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
        const year = settings.currentAcademicYear;
        const sem = settings.currentSemester;
        const [cocu, stuEks, att, note] = await Promise.all([
          DB.getCocurricular(year, sem, studentId),
          DB.getStudentExtracurriculars(year, sem, studentId),
          DB.getAttendance(year, sem, studentId),
          DB.getTeacherNote(year, sem, studentId)
        ]);
        const eksList = eksArr.map(e => {
          const selected = stuEks && stuEks[e.id];
          return `
            <div style="border: 1px solid #ddd; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-weight:bold; cursor:pointer">
                <input type="checkbox" class="chk-eks" data-id="${e.id}" ${selected ? 'checked' : ''}>
                ${e.name}
              </label>
              <textarea id="desc-eks-${e.id}" rows="2" placeholder="Keterangan untuk ekstrakurikuler ini..." style="display: ${selected ? 'block' : 'none'}; width:100%">${selected ? (selected.description || '') : ''}</textarea>
            </div>
          `;
        }).join('');
        formContainer.innerHTML = `
          <div class="card" style="margin-bottom:20px">
            <h3 class="card-title" style="margin-bottom:16px">Kokurikuler</h3>
            <div class="form-group">
              <textarea id="add-cocu" rows="3" placeholder="Contoh: Ananda mandiri dan aktif dalam kegiatan sekolah...">${cocu ? (cocu.description || '') : ''}</textarea>
            </div>
          </div>

          <div class="card" style="margin-bottom:20px">
            <h3 class="card-title" style="margin-bottom:16px">Ekstrakurikuler</h3>
            ${eksArr.length ? eksList : '<p class="text-muted">Belum ada master ekstrakurikuler.</p>'}
          </div>

          <div class="card" style="margin-bottom:20px">
            <h3 class="card-title" style="margin-bottom:16px">Ketidakhadiran (Hari)</h3>
            <div style="display:flex; gap:12px; flex-wrap:wrap">
              <div class="form-group" style="flex:1; min-width:80px">
                <label>Sakit</label>
                <input type="number" id="add-sakit" value="${att ? (att.sakit || 0) : 0}" min="0">
              </div>
              <div class="form-group" style="flex:1; min-width:80px">
                <label>Izin</label>
                <input type="number" id="add-izin" value="${att ? (att.izin || 0) : 0}" min="0">
              </div>
              <div class="form-group" style="flex:1; min-width:80px">
                <label>Tanpa Keterangan</label>
                <input type="number" id="add-alpa" value="${att ? (att.alpa || 0) : 0}" min="0">
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom:20px">
            <h3 class="card-title" style="margin-bottom:16px">Catatan Wali Kelas</h3>
            <div class="form-group">
              <textarea id="add-note" rows="3" placeholder="Contoh: Ananda anak yang santun, aktif dalam ibadah berjamaah...">${note ? (note.note || '') : ''}</textarea>
            </div>
          </div>

          <button id="btn-save-additional" class="btn btn-primary" style="width:100%; margin-bottom:40px"><i class="ph ph-floppy-disk"></i> Simpan Data Tambahan</button>
        `;
        // Toggle textarea visibility for extracurriculars
        document.querySelectorAll('.chk-eks').forEach(chk => {
          chk.onchange = (e) => {
            const txt = document.getElementById(`desc-eks-${e.target.dataset.id}`);
            txt.style.display = e.target.checked ? 'block' : 'none';
          };
        });
        // Save logic
        document.getElementById('btn-save-additional').onclick = async (e) => {
          const btn = e.target;
          btn.disabled = true;
          btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
          const pCocu = DB.saveCocurricular(year, sem, studentId, {
            description: document.getElementById('add-cocu').value.trim(),
            updatedBy: Auth.currentUser.uid
          });
          const pNote = DB.saveTeacherNote(year, sem, studentId, {
            note: document.getElementById('add-note').value.trim(),
            updatedBy: Auth.currentUser.uid
          });
          const pAtt = DB.saveAttendance(year, sem, studentId, {
            sakit: parseInt(document.getElementById('add-sakit').value) || 0,
            izin: parseInt(document.getElementById('add-izin').value) || 0,
            alpa: parseInt(document.getElementById('add-alpa').value) || 0,
            updatedBy: Auth.currentUser.uid
          });
          const pEks = [];
          document.querySelectorAll('.chk-eks').forEach(chk => {
            const id = chk.dataset.id;
            if (chk.checked) {
              const desc = document.getElementById(`desc-eks-${id}`).value.trim();
              pEks.push(DB.saveStudentExtracurricular(year, sem, studentId, id, {
                description: desc,
                updatedBy: Auth.currentUser.uid
              }));
            } else {
              pEks.push(DB.deleteStudentExtracurricular(year, sem, studentId, id));
            }
          });
          try {
            await Promise.all([pCocu, pNote, pAtt, ...pEks]);
            btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
            setTimeout(() => {
              btn.disabled = false;
              btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Data Tambahan';
            }, 2000);
          } catch (err) {
            
            alert('Gagal menyimpan data.');
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Data Tambahan';
          }
        };
      };
    };
  },
  // ========== MODAL OBSERVASI (dari halaman penilaian) ==========
  _obsModal(charArr) {
    const charOpts = charArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    return `
    <div class="modal-overlay" id="modal-obs">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="obs-title">Catatan perilaku</h3>
          <button class="btn-icon" onclick="App.closeModal('modal-obs')"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-obs-modal">
          <input type="hidden" id="obs-stu-id">
          <div class="modal-body">
            <div class="form-group"><label>Jenis</label>
              <select id="obs-type"><option value="positive">👍 Positif</option><option value="needs_improvement">⚠ Perlu bimbingan</option></select>
            </div>
            <div class="form-group"><label>Karakter</label><select id="obs-char" required>${charOpts}</select></div>
            <div class="form-group"><label>Catatan</label><textarea id="obs-note" rows="3" placeholder="Contoh: Mengerjakan tugas tepat waktu tanpa diingatkan."></textarea></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-obs')">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openObsModal(studentId, studentName) {
    document.getElementById('obs-title').innerText = `Catatan — ${studentName}`;
    document.getElementById('obs-stu-id').value = studentId;
    document.getElementById('obs-note').value = '';
    document.getElementById('modal-obs').classList.add('active');
    // attach submit only once
    const form = document.getElementById('form-obs-modal');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const today = new Date().toISOString().slice(0, 10);
      await DB.saveObservation({
        studentId: document.getElementById('obs-stu-id').value,
        teacherId: Auth.currentUser.uid,
        type: document.getElementById('obs-type').value,
        characterId: document.getElementById('obs-char').value,
        note: document.getElementById('obs-note').value.trim(),
        date: today
      });
      btn.disabled = false;
      App.closeModal('modal-obs');
    };
  },

  // ========== INPUT EKSTRAKURIKULER (Khusus Guru Pembina) ==========
  async renderEkskulInput(container, eksId) {
    const [ekskuls, classes, settings] = await Promise.all([
      DB.getExtracurriculars(),
      DB.getClasses(),
      DB.getSettings()
    ]);
    
    const eks = ekskuls[eksId];
    if (!eks || eks.teacherId !== Auth.currentUser.uid) {
      container.innerHTML = '<div class="card"><p class="error-text">Ekstrakurikuler tidak ditemukan atau Anda tidak memiliki akses.</p></div>';
      return;
    }
    
    Router.setTitle(`Nilai Ekskul: ${eks.name}`, 'Pilih kelas untuk menginput nilai siswa.');
    
    const classArr = DB.toArray(classes);
    const classOpts = classArr.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    container.innerHTML = `
      <div style="margin-bottom:16px"><a href="#/dashboard" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>
      <div class="card" style="margin-bottom:20px">
        <form id="filter-eks" class="inline-form" style="display:flex;gap:12px;align-items:flex-end">
          <div class="form-group" style="margin-bottom:0;flex:1">
            <label>Pilih Kelas</label>
            <select id="eks-class" required>
              <option value="">— Pilih Kelas —</option>
              ${classOpts}
            </select>
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-magnifying-glass"></i> Tampilkan</button>
        </form>
      </div>
      <div id="eks-container"></div>
    `;
    
    document.getElementById('filter-eks').onsubmit = async (e) => {
      e.preventDefault();
      const classId = document.getElementById('eks-class').value;
      if (!classId) return;
      
      const eksCont = document.getElementById('eks-container');
      eksCont.innerHTML = '<div class="loader" style="margin: 20px auto"></div>';
      
      const students = await DB.getStudentsByClass(classId);
      const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
      
      if (!studentArr.length) {
        eksCont.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
        return;
      }
      
      const year = settings.currentAcademicYear;
      const sem = settings.currentSemester;
      
      const sEksData = {};
      for (const s of studentArr) {
        const dt = await DB.getStudentExtracurriculars(year, sem, s.id);
        sEksData[s.id] = dt[eks.id] || { score: '', description: '' };
      }
      
      const rows = studentArr.map((s, idx) => `
        <div class="card" style="margin-bottom: 12px; padding: 12px;">
          <h4 style="margin-top:0; margin-bottom:12px; font-size:15px">${idx + 1}. ${s.name}</h4>
          <div style="display:flex; gap:16px; flex-wrap:wrap">
            <div class="form-group" style="flex: 0 0 120px; margin-bottom:0">
              <label>Nilai (A/B/C/D)</label>
              <select class="input-score" data-stu="${s.id}">
                <option value="">—</option>
                <option value="A" ${sEksData[s.id].score === 'A' ? 'selected' : ''}>A (Sangat Baik)</option>
                <option value="B" ${sEksData[s.id].score === 'B' ? 'selected' : ''}>B (Baik)</option>
                <option value="C" ${sEksData[s.id].score === 'C' ? 'selected' : ''}>C (Cukup)</option>
                <option value="D" ${sEksData[s.id].score === 'D' ? 'selected' : ''}>D (Kurang)</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1; margin-bottom:0">
              <label>Keterangan</label>
              <textarea rows="2" class="input-desc" data-stu="${s.id}">${sEksData[s.id].description || ''}</textarea>
            </div>
          </div>
        </div>
      `).join('');
      
      eksCont.innerHTML = `
        <form id="form-save-eks">
          ${rows}
          <div style="text-align:right; margin-top:20px; position:sticky; bottom:20px; z-index:100;">
            <button type="submit" class="btn btn-primary" style="box-shadow: 0 4px 12px rgba(0,0,0,0.15)"><i class="ph ph-floppy-disk"></i> Simpan Semua Nilai</button>
          </div>
        </form>
      `;
      
      document.getElementById('form-save-eks').onsubmit = async (ev) => {
        ev.preventDefault();
        const btn = ev.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
        btn.disabled = true;
        
        try {
          const scores = document.querySelectorAll('.input-score');
          const descs = document.querySelectorAll('.input-desc');
          
          for (let i = 0; i < scores.length; i++) {
            const stu = scores[i].dataset.stu;
            const score = scores[i].value;
            const desc = descs[i].value;
            
            if (score || desc) {
              await DB.saveStudentExtracurricular(year, sem, stu, eks.id, { score, description: desc });
            } else {
              await DB.deleteStudentExtracurricular(year, sem, stu, eks.id);
            }
          }
          alert('Berhasil menyimpan nilai ekstrakurikuler!');
        } catch (err) {
          alert('Gagal menyimpan: ' + err.message);
        } finally {
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Semua Nilai';
          btn.disabled = false;
        }
      };
    };
  },
  // ========== PRESENSI GURU (Geofencing) ==========
  async renderTeacherAttendance(container) {
    Router.setTitle('Presensi Kehadiran', 'Rekam kehadiran harian Anda di area sekolah.');
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 32px 16px;">
        <div id="geo-status-icon" style="width: 64px; height: 64px; background: #F3F4F6; color: #9CA3AF; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; transition: all 0.3s ease;">
          <i class="ph ph-spinner ph-spin" style="font-size: 32px;"></i>
        </div>
        <h3 id="geo-status-title" style="margin: 0 0 8px 0;">Mencari Lokasi...</h3>
        <p id="geo-status-text" class="text-muted" style="margin: 0 0 24px 0; font-size: 14px;">Mohon tunggu dan pastikan posisi Anda aktif.</p>
        
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="btn-checkin" class="btn btn-primary" disabled><i class="ph ph-sign-in"></i> Presensi Datang</button>
          <button id="btn-checkout" class="btn btn-outline" disabled><i class="ph ph-sign-out"></i> Presensi Pulang</button>
        </div>

        <div id="proof-panel" style="margin-top: 20px; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; text-align: left; display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px;">
            <strong style="font-size: 13px;">Bukti Foto Kehadiran dari Kamera</strong>
            <span id="proof-status" class="text-muted" style="font-size: 12px;">Belum ada foto</span>
          </div>
          <video id="attendance-camera-video" autoplay playsinline muted style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; border: 1px solid #E5E7EB; background: #000; display: block;"></video>
          <button id="attendance-camera-capture" type="button" class="btn btn-primary" style="width: 100%; margin-top: 12px;">Ambil Foto Kamera</button>
          <div id="attendance-proof-wrapper" style="display: none; margin-top: 12px;">
            <img id="attendance-proof-preview" src="" alt="Preview bukti presensi" style="width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; border: 1px solid #E5E7EB;">
          </div>
        </div>
      </div>
      <div class="card" style="margin-top: 16px;">
        <h4 style="margin: 0 0 12px 0; font-size: 14px;">Riwayat Hari Ini</h4>
        <div id="att-history-container">
          <p class="text-muted" style="font-size: 13px; margin: 0;">Memuat data...</p>
        </div>
      </div>
    `;

    const statusIcon = document.getElementById('geo-status-icon');
    const statusTitle = document.getElementById('geo-status-title');
    const statusText = document.getElementById('geo-status-text');
    const btnCheckin = document.getElementById('btn-checkin');
    const btnCheckout = document.getElementById('btn-checkout');
    const histContainer = document.getElementById('att-history-container');
    const proofPanel = document.getElementById('proof-panel');
    const cameraVideo = document.getElementById('attendance-camera-video');
    const cameraCaptureBtn = document.getElementById('attendance-camera-capture');
    const proofPreview = document.getElementById('attendance-proof-preview');
    const proofStatus = document.getElementById('proof-status');
    const proofWrapper = document.getElementById('attendance-proof-wrapper');

    let cameraStream = null;
    let capturedProofDataUrl = null;

    const stopCamera = () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }
      if (cameraVideo) {
        cameraVideo.srcObject = null;
      }
    };

    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Browser Anda tidak mendukung akses kamera.');
        return false;
      }

      try {
        if (cameraStream) return true;
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        cameraVideo.srcObject = cameraStream;
        cameraVideo.play();
        return true;
      } catch (error) {
        console.error('Kamera error:', error);
        alert('Izin kamera diperlukan untuk mengambil bukti presensi.');
        return false;
      }
    };

    const compressImageDataUrl = async (dataUrl, maxWidth = 1600, quality = 0.82) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    };

    const captureCameraProof = async () => {
      if (!cameraVideo || !cameraVideo.videoWidth || !cameraVideo.videoHeight) {
        alert('Kamera belum siap. Silakan tunggu sebentar lalu coba lagi.');
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = cameraVideo.videoWidth;
        canvas.height = cameraVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

        const snapshot = canvas.toDataURL('image/jpeg', 0.82);
        const compressed = await compressImageDataUrl(snapshot, 1600, 0.82);
        capturedProofDataUrl = compressed;
        proofPreview.src = compressed;
        proofWrapper.style.display = 'block';
        proofStatus.innerText = 'Foto siap dikirim';
        cameraCaptureBtn.innerText = 'Ambil Ulang Foto';
        stopCamera();
      } catch (error) {
        console.error('Capture camera error:', error);
        alert('Gagal mengambil foto dari kamera. Silakan coba lagi.');
      }
    };

    cameraCaptureBtn.addEventListener('click', async () => {
      const started = await startCamera();
      if (!started || !cameraVideo) return;
      try {
        await new Promise((resolve) => {
          const onReady = () => {
            cameraVideo.removeEventListener('loadeddata', onReady);
            resolve();
          };
          if (cameraVideo.readyState >= 2) {
            resolve();
            return;
          }
          cameraVideo.addEventListener('loadeddata', onReady, { once: true });
        });
        await captureCameraProof();
      } catch (error) {
        console.error('Camera capture button error:', error);
        alert('Gagal mengakses kamera. Silakan coba lagi.');
      }
    });

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const teacherId = Auth.currentUser.uid;

    // Load History
    const loadHistory = async () => {
      const myAtt = await DB.getTeacherAttendance(dateStr, teacherId);
      if (!myAtt) {
        histContainer.innerHTML = '<p class="text-muted" style="font-size: 13px; margin: 0;">Belum ada rekam presensi hari ini.</p>';
      } else {
        const proofMarkup = myAtt.proof_url
          ? `<div style="margin-top: 12px;"><img src="${DriveBridge.normalizeDriveImageUrl(myAtt.proof_url, 'w300', '')}" alt="Bukti presensi" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 10px; border: 1px solid #E5E7EB;"></div>`
          : '';

        histContainer.innerHTML = `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
            <span class="text-muted" style="font-size: 13px;">Datang</span>
            <strong style="font-size: 13px;">${myAtt.time_in || '-'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 8px;">
            <span class="text-muted" style="font-size: 13px;">Pulang</span>
            <strong style="font-size: 13px;">${myAtt.time_out || '-'}</strong>
          </div>
          ${proofMarkup}
        `;
        if (myAtt.time_in && !myAtt.time_out) {
          btnCheckin.style.display = 'none';
        } else if (myAtt.time_in && myAtt.time_out) {
          btnCheckin.style.display = 'none';
          btnCheckout.style.display = 'none';
          statusTitle.innerText = "Presensi Selesai";
          statusText.innerText = "Anda sudah menyelesaikan presensi hari ini.";
        }
      }
    };
    await loadHistory();

    // Geolocation Logic
    const schoolLat = Number(ATTENDANCE_GEOFENCE?.lat);
    const schoolLng = Number(ATTENDANCE_GEOFENCE?.lng);
    const maxRadius = Number(ATTENDANCE_GEOFENCE?.radiusMeters ?? 0);
    const maxAccuracy = 200;
    const hasLocalGeofence = Number.isFinite(schoolLat) && Number.isFinite(schoolLng) && Number.isFinite(maxRadius) && maxRadius > 0;

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3;
      const p1 = lat1 * Math.PI / 180;
      const p2 = lat2 * Math.PI / 180;
      const dp = (lat2 - lat1) * Math.PI / 180;
      const dl = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let currentLocation = null;
    let currentAccuracy = null;
    let watchId = null;

    const acceptPosition = (latitude, longitude, accuracy, distance) => {
      currentAccuracy = Number(accuracy || 0);
      currentLocation = { lat: latitude, lng: longitude };

      if (!hasLocalGeofence) {
        const posisiReady = currentAccuracy <= maxAccuracy;
        if (posisiReady) {
          statusIcon.style.background = '#D1FAE5'; statusIcon.style.color = '#10B981';
          statusIcon.innerHTML = '<i class="ph ph-shield-check" style="font-size: 32px;"></i>';
          statusTitle.innerText = 'Posisi Sudah Siap';
          statusText.innerText = `Akurasi posisi saat ini ${Math.round(currentAccuracy)} m. Validasi final tetap dilakukan di server untuk memastikan lokasi sekolah benar.`;
          proofPanel.style.display = 'block';
          cameraVideo.style.display = 'block';
          proofWrapper.style.display = 'none';
          proofStatus.innerText = 'Belum ada foto';
          cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
          btnCheckin.disabled = false;
          btnCheckout.disabled = false;
          void startCamera();
          if (watchId !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }
          return true;
        }

        statusIcon.style.background = '#FEF3C7'; statusIcon.style.color = '#F59E0B';
        statusIcon.innerHTML = '<i class="ph ph-warning" style="font-size: 32px;"></i>';
        statusTitle.innerText = 'Posisi Belum Cukup Akurat';
        statusText.innerText = `Akurasi posisi saat ini ${Math.round(currentAccuracy)} m. Sistem butuh ${maxAccuracy} m atau lebih baik agar presensi bisa diproses.`;
        btnCheckin.disabled = true;
        btnCheckout.disabled = true;
        return false;
      }

      const adjustedDistance = Math.max(0, distance - accuracy);
      const isInside = adjustedDistance <= maxRadius && accuracy <= maxAccuracy;

      if (isInside) {
        statusIcon.style.background = '#D1FAE5'; statusIcon.style.color = '#10B981';
        statusIcon.innerHTML = '<i class="ph ph-check-circle" style="font-size: 32px;"></i>';
        statusTitle.innerText = "Berada di Area Sekolah";
        statusText.innerText = `Jarak efektif: ${Math.round(adjustedDistance)} meter. Akurasi posisi: ${Math.round(accuracy)} m.`;
        proofPanel.style.display = 'block';
        cameraVideo.style.display = 'block';
        proofWrapper.style.display = 'none';
        proofStatus.innerText = 'Belum ada foto';
        cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
        btnCheckin.disabled = false;
        btnCheckout.disabled = false;
        void startCamera();
        if (watchId !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        return true;
      }

      statusIcon.style.background = '#FEF3C7'; statusIcon.style.color = '#F59E0B';
      statusIcon.innerHTML = '<i class="ph ph-warning" style="font-size: 32px;"></i>';
      statusTitle.innerText = "Posisi Belum Valid";
      statusText.innerText = `Jarak Anda sekitar ${Math.round(distance)} m dari sekolah dan akurasi posisi ${Math.round(accuracy)} m. Harap bergerak ke area yang lebih dekat atau tunggu posisi lebih stabil.`;
      btnCheckin.disabled = true;
      btnCheckout.disabled = true;
      return false;
    };

    if (!navigator.geolocation) {
      statusIcon.style.background = '#FEE2E2'; statusIcon.style.color = '#EF4444';
      statusIcon.innerHTML = '<i class="ph ph-warning-circle" style="font-size: 32px;"></i>';
      statusTitle.innerText = "Perangkat Tidak Mendukung Posisi";
      statusText.innerText = "Perangkat Anda tidak mendukung fitur lokasi.";
      return;
    }

    const onGeoSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const distance = hasLocalGeofence ? getDistance(schoolLat, schoolLng, latitude, longitude) : 0;
      const ok = acceptPosition(latitude, longitude, accuracy, distance);
      if (!ok && watchId === null && hasLocalGeofence) {
        statusTitle.innerText = "Posisi Belum Valid";
        statusText.innerText = `Jarak Anda sekitar ${Math.round(distance)} m dari sekolah dan akurasi posisi ${Math.round(accuracy)} m. Harap bergerak ke area yang lebih dekat atau tunggu posisi lebih stabil.`;
      }
    };

    const onGeoError = (error) => {
      statusIcon.style.background = '#FEE2E2'; statusIcon.style.color = '#EF4444';
      statusIcon.innerHTML = '<i class="ph ph-warning-circle" style="font-size: 32px;"></i>';
      statusTitle.innerText = "Akses Posisi Ditolak";
      statusText.innerText = "Izinkan akses posisi pada browser untuk melakukan presensi.";
      console.error('Geolocation error:', error);
    };

    watchId = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    const handlePresensi = async (type) => {
      if (!currentLocation) return;
      const btn = type === 'in' ? btnCheckin : btnCheckout;
      if (!capturedProofDataUrl || !capturedProofDataUrl.startsWith('data:image/')) {
        alert('Harap ambil foto bukti kehadiran dari kamera sebelum presensi disimpan.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memproses...';

      try {
        const compressedProof = await compressImageDataUrl(capturedProofDataUrl, 1600, 0.82);
        const result = await DB.submitTeacherAttendanceToWorker({
          dateStr,
          teacherId,
          type,
          photoDataUrl: compressedProof,
          location: currentLocation,
          accuracy: currentAccuracy
        });

        const payload = type === 'in'
          ? { time_in: result.serverTimestamp ? new Date(result.serverTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), location_in: result.location || currentLocation }
          : { time_out: result.serverTimestamp ? new Date(result.serverTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), location_out: result.location || currentLocation };

        if (result.proof_url) payload.proof_url = result.proof_url;
        if (result.record && Object.keys(result.record).length) Object.assign(payload, result.record);

        await DB.saveTeacherAttendance(dateStr, teacherId, payload);
        alert('Presensi berhasil dicatat.');
        capturedProofDataUrl = null;
        proofPreview.src = '';
        proofWrapper.style.display = 'none';
        proofStatus.innerText = 'Belum ada foto';
        cameraCaptureBtn.innerText = 'Ambil Foto Kamera';
        stopCamera();
        await loadHistory();
      } catch (err) {
        console.error(err);
        alert(err && err.message ? err.message : 'Gagal mencatat presensi. Pastikan foto dan lokasi benar, serta endpoint Drive aktif.');
        btn.disabled = false;
        btn.innerHTML = type === 'in' ? '<i class="ph ph-sign-in"></i> Presensi Datang' : '<i class="ph ph-sign-out"></i> Presensi Pulang';
      }
    };

    btnCheckin.onclick = () => handlePresensi('in');
    btnCheckout.onclick = () => handlePresensi('out');
  },
  
  // ========== ABSENSI SISWA (Oleh Guru) ==========
  async renderStudentAttendance(container) {
    Router.setTitle('Absensi Siswa', 'Pilih kelas untuk mengabsen siswa hari ini.');
    const classes = await DB.getClasses();
    const classArr = DB.toArray(classes).filter(c => c.teacherId === Auth.currentUser.uid);
    
    if (!classArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Anda belum ditugaskan sebagai wali kelas.</p></div>`;
      return;
    }
    
    const cards = classArr.map(c => `
      <div class="card class-card" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.location.hash='#/guru/student-attendance/${c.id}'">
        <div>
          <h3 class="card-title" style="margin: 0 0 4px 0;">${c.name}</h3>
          <p class="text-muted" style="margin: 0; font-size: 13px;">Input Absensi Kelas</p>
        </div>
        <i class="ph ph-caret-right" style="color: #9CA3AF;"></i>
      </div>
    `).join('');
    container.innerHTML = `<div class="card-grid">${cards}</div>`;
  },

  async renderStudentAttendanceInput(container, classId) {
    const classes = await DB.getClasses();
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const dateDisplay = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    Router.setTitle(`Absensi ${cls.name}`, dateDisplay);
    
    const studentData = await DB.getStudentsByClass(classId);
    const studentArr = DB.toArray(studentData).sort((a, b) => a.name.localeCompare(b.name));
    
    if (!studentArr.length) {
      container.innerHTML = `<div class="card"><p class="text-muted">Belum ada siswa di kelas ini.</p></div>`;
      return;
    }

    const attData = await DB.getDailyStudentAttendance(dateStr, classId);

    const rows = studentArr.map((s, idx) => {
      const currentAtt = attData[s.id] || 'H'; // Default Hadir
      return `
        <div class="card" style="margin-bottom: 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 150px;">
            <p style="margin: 0; font-weight: 500; font-size: 14px;">${idx + 1}. ${s.name}</p>
          </div>
          <div class="att-toggle-group" data-stu="${s.id}" style="display: flex; background: #F3F4F6; border-radius: 8px; padding: 2px;">
            <button class="att-btn ${currentAtt === 'H' ? 'active-h' : ''}" data-val="H" style="border: none; background: transparent; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; color: #6B7280;">H</button>
            <button class="att-btn ${currentAtt === 'S' ? 'active-s' : ''}" data-val="S" style="border: none; background: transparent; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; color: #6B7280;">S</button>
            <button class="att-btn ${currentAtt === 'I' ? 'active-i' : ''}" data-val="I" style="border: none; background: transparent; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; color: #6B7280;">I</button>
            <button class="att-btn ${currentAtt === 'A' ? 'active-a' : ''}" data-val="A" style="border: none; background: transparent; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; color: #6B7280;">A</button>
          </div>
        </div>
      `;
    }).join('');

    // Inject CSS khusus untuk toggle absensi agar tidak mengganggu global
    const style = `
      <style>
        .att-btn { transition: all 0.2s; }
        .att-btn.active-h { background: #10B981; color: white !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .att-btn.active-s { background: #3B82F6; color: white !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .att-btn.active-i { background: #F59E0B; color: white !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .att-btn.active-a { background: #EF4444; color: white !important; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
      </style>
    `;

    container.innerHTML = `
      ${style}
      <div style="margin-bottom:16px"><a href="#/guru/student-attendance" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>
      <div class="card" style="margin-bottom: 16px; padding: 12px; background: #F8FAFC;">
        <p style="margin: 0; font-size: 13px; color: #64748B;">Ketuk inisial untuk mengubah status: <strong>H</strong> (Hadir), <strong>S</strong> (Sakit), <strong>I</strong> (Izin), <strong>A</strong> (Alpa).</p>
      </div>
      <div id="student-list-container">
        ${rows}
      </div>
      <div style="position: sticky; bottom: 16px; margin-top: 24px; z-index: 100;">
        <button id="btn-save-att" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <i class="ph ph-floppy-disk"></i> Simpan Absensi
        </button>
      </div>
    `;

    // Event delegation for toggles
    document.getElementById('student-list-container').addEventListener('click', (e) => {
      if (e.target.classList.contains('att-btn')) {
        const group = e.target.closest('.att-toggle-group');
        group.querySelectorAll('.att-btn').forEach(b => {
          b.classList.remove('active-h', 'active-s', 'active-i', 'active-a');
        });
        const val = e.target.dataset.val;
        e.target.classList.add(`active-${val.toLowerCase()}`);
      }
    });

    document.getElementById('btn-save-att').onclick = async (e) => {
      const btn = e.target;
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      
      const payload = {};
      document.querySelectorAll('.att-toggle-group').forEach(group => {
        const stuId = group.dataset.stu;
        const activeBtn = group.querySelector('.att-btn[class*="active-"]');
        if (activeBtn) {
          payload[stuId] = activeBtn.dataset.val;
        }
      });

      try {
        await DB.saveDailyStudentAttendance(dateStr, classId, payload);
        btn.innerHTML = '<i class="ph ph-check"></i> Berhasil Disimpan';
        btn.style.background = '#10B981';
        btn.style.borderColor = '#10B981';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Absensi';
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 2000);
      } catch (err) {
        alert('Gagal menyimpan absensi.');
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan Absensi';
      }
    };
  }
};
// Route registration
Router.add('#/guru/classes', c => GuruPages.renderClasses(c));
Router.add('#/guru/attendance', c => GuruPages.renderTeacherAttendance(c));
Router.add('#/guru/student-attendance', c => GuruPages.renderStudentAttendance(c));
Router.add('#/guru/student-attendance/:id', (c, id) => GuruPages.renderStudentAttendanceInput(c, id));
Router.add('#/guru/assess/:id', (c, id) => GuruPages.renderAssessment(c, id));
Router.add('#/guru/academic', c => GuruPages.renderAcademicGrades(c));
Router.add('#/guru/additional', c => GuruPages.renderAdditionalData(c));
Router.add('#/guru/observe/:id', (c, id) => GuruPages.renderObserveClass(c, id));
Router.add('#/guru/observations', c => GuruPages.renderObservationHistory(c));
Router.add('#/guru/ekskul/:id', (c, eksId) => GuruPages.renderEkskulInput(c, eksId));




