// admin.js — Modul Admin: dashboard ringkasan, CRUD pengguna, kelas, siswa,
// indikator karakter, dan pengaturan tahun ajaran/semester.
const AdminPages = {
  // ========== DASHBOARD ==========
  async renderDashboard(container) {
    Router.setTitle('Dashboard admin', 'Ringkasan data dan pengaturan sistem.');
    const [settings, users, classes, chars, students] = await Promise.all([
      DB.getSettings(),
      DB.getAllUsers(),
      DB.getClasses(),
      DB.getCharacters(),
      DB.getAllStudents()
    ]);
    const attendanceRules = settings.attendanceRules || {};
    const userArr = DB.toArray(users);
    const classArr = DB.toArray(classes);
    const charArr = DB.toArray(chars);
    const studentArr = DB.toArray(students);
    const guruCount = userArr.filter(u => u.role === AppConfig.ROLES.GURU).length;
    const ortuCount = userArr.filter(u => u.role === AppConfig.ROLES.ORTU).length;
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${studentArr.length}</p><p class="stat-label text-muted">Siswa terdaftar</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-chalkboard-teacher"></i></div>
          <div><p class="stat-value">${guruCount}</p><p class="stat-label text-muted">Guru aktif</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${classArr.length}</p><p class="stat-label text-muted">Kelas</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--danger"><i class="ph ph-users"></i></div>
          <div><p class="stat-value">${ortuCount}</p><p class="stat-label text-muted">Orang tua/wali</p></div>
        </div>
      </section>

      <section class="card section-spacer">
        <div class="card-header">
          <h3 class="card-title">Pengaturan tahun ajaran</h3>
        </div>
        <form id="form-settings" class="inline-form">
          <div class="form-group compact-field">
            <label>Tahun ajaran aktif</label>
            <input id="set-year" value="${settings.currentAcademicYear}" placeholder="Contoh: 2026/2027">
          </div>
          <div class="form-group compact-field">
            <label>Semester</label>
            <select id="set-sem">
              <option value="1" ${settings.currentSemester === '1' ? 'selected' : ''}>Semester 1</option>
              <option value="2" ${settings.currentSemester === '2' ? 'selected' : ''}>Semester 2</option>
            </select>
          </div>
          <div class="form-group compact-field">
            <label>Jam masuk mulai</label>
            <input id="set-checkin-start" type="time" value="${attendanceRules.checkInStart || '07:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Jam masuk selesai</label>
            <input id="set-checkin-end" type="time" value="${attendanceRules.checkInEnd || '09:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Jam pulang mulai</label>
            <input id="set-checkout-start" type="time" value="${attendanceRules.checkOutStart || '15:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Jam pulang selesai</label>
            <input id="set-checkout-end" type="time" value="${attendanceRules.checkOutEnd || '17:00'}">
          </div>
          <div class="form-group compact-field">
            <label>Tanggal absensi mulai</label>
            <input id="set-date-start" type="date" value="${attendanceRules.attendanceStartDate || ''}">
          </div>
          <div class="form-group compact-field">
            <label>Tanggal absensi selesai</label>
            <input id="set-date-end" type="date" value="${attendanceRules.attendanceEndDate || ''}">
          </div>
          <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> Simpan</button>
        </form>
      </section>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">Indikator karakter aktif</h3>
          <span class="badge badge-primary">${charArr.filter(c => c.active !== false).length} aktif</span>
        </div>
        <p class="text-muted soft-note">Kelola di menu <strong>Indikator Karakter</strong> pada sidebar.</p>
      </section>
    `;
    document.getElementById('form-settings').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
      await DB.updateSettings({
        currentAcademicYear: document.getElementById('set-year').value.trim(),
        currentSemester: document.getElementById('set-sem').value,
        attendanceRules: {
          checkInStart: document.getElementById('set-checkin-start').value || '07:00',
          checkInEnd: document.getElementById('set-checkin-end').value || '09:00',
          checkOutStart: document.getElementById('set-checkout-start').value || '15:00',
          checkOutEnd: document.getElementById('set-checkout-end').value || '17:00',
          attendanceStartDate: document.getElementById('set-date-start').value || '',
          attendanceEndDate: document.getElementById('set-date-end').value || ''
        }
      });
      btn.disabled = false;
      btn.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
      setTimeout(() => {
        btn.innerHTML = '<i class="ph ph-floppy-disk"></i> Simpan';
      }, 1500);
    });
  },
  // ========== INDIKATOR KARAKTER ==========
  async renderCharacters(container) {
    Router.setTitle('Indikator karakter', 'Aspek karakter yang dinilai guru.');
    const chars = await DB.getCharacters();
    const charArr = DB.toArray(chars).sort((a, b) => (a.order || 0) - (b.order || 0));
    const rows = charArr.length ? charArr.map(c => `
      <tr>
        <td>${c.order || '-'}</td>
        <td><strong>${c.name}</strong></td>
        <td><span class="badge ${c.active !== false ? 'badge-success' : 'badge-danger'}">${c.active !== false ? 'Aktif' : 'Nonaktif'}</span></td>
        <td class="action-cell">
          <button class="btn btn-outline btn-sm" data-edit-char="${c.id}"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn btn-danger btn-sm" data-del-char="${c.id}"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada indikator. Klik "Tambah" untuk memulai.</td></tr>';
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar aspek karakter</h3>
          <button class="btn btn-primary" id="btn-add-char"><i class="ph ph-plus"></i> Tambah</button>
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th class="table-col-sm">No</th><th>Nama</th><th>Status</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      ${this._charModal()}
    `;
    // event: tambah
    document.getElementById('btn-add-char').onclick = () => this._openCharModal(null, charArr.length + 1);
    // event: edit
    container.querySelectorAll('[data-edit-char]').forEach(btn => {
      btn.onclick = () => {
        const c = charArr.find(x => x.id === btn.dataset.editChar);
        if (c) this._openCharModal(c);
      };
    });
    // event: hapus
    container.querySelectorAll('[data-del-char]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Yakin hapus indikator ini?')) return;
        await DB.deleteCharacter(btn.dataset.delChar);
        this.renderCharacters(container);
      };
    });
    // event: simpan modal
    document.getElementById('form-char').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('char-id').value || null;
      await DB.saveCharacter(id, {
        name: document.getElementById('char-name').value.trim(),
        order: parseInt(document.getElementById('char-order').value) || 1,
        active: document.getElementById('char-active').value === 'true'
      });
      App.closeModal('modal-char');
      this.renderCharacters(container);
    };
  },
  _charModal() {
    return `
    <div class="modal-overlay" id="modal-char">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="char-modal-title">Tambah indikator</h3>
          <button class="btn-icon" onclick="App.closeModal('modal-char')"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-char">
          <div class="modal-body">
            <input type="hidden" id="char-id">
            <div class="form-group">
              <label>Nama karakter</label>
              <input id="char-name" required placeholder="Contoh: Disiplin">
            </div>
            <div class="form-group">
              <label>Urutan tampil</label>
              <input id="char-order" type="number" min="1" value="1">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select id="char-active"><option value="true">Aktif</option><option value="false">Nonaktif</option></select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-char')">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openCharModal(existing, nextOrder) {
    document.getElementById('char-modal-title').innerText = existing ? 'Edit indikator' : 'Tambah indikator';
    document.getElementById('char-id').value = existing ? existing.id : '';
    document.getElementById('char-name').value = existing ? existing.name : '';
    document.getElementById('char-order').value = existing ? existing.order : (nextOrder || 1);
    document.getElementById('char-active').value = existing ? String(existing.active !== false) : 'true';
    App.openModal('modal-char');
  },
  // ========== MANAJEMEN PENGGUNA ==========
  async renderUsers(container) {
    Router.setTitle('Kelola Pengguna', 'Tambah, edit, dan atur peran pengguna sistem.');
    const users = await DB.getAllUsers();
    let userArr = DB.toArray(users);
    
    const renderTable = () => {
      const q = (document.getElementById('search-user')?.value || '').toLowerCase();
      const roleFilter = document.getElementById('filter-role')?.value || '';
      
      const filtered = userArr.filter(u => {
        const matchSearch = (u.name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
        const matchRole = roleFilter ? u.role === roleFilter : true;
        return matchSearch && matchRole;
      });
      
      const rows = filtered.length ? filtered.map(u => `
        <tr>
          <td><strong>${u.name}</strong><br><small class="text-muted">${u.email || '-'}</small></td>
          <td>${u.username}</td>
          <td><span class="badge ${AppConfig.getRoleBadgeClass(u.role)}">${u.role}</span></td>
          <td class="action-cell">
            <button class="btn btn-outline btn-sm" data-edit-usr="${u.id}"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-usr="${u.id}"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `).join('') : '<tr><td colspan="4" class="text-center text-muted">Tidak ada pengguna ditemukan.</td></tr>';
      
      const tbody = container.querySelector('#tbody-users');
      if (tbody) tbody.innerHTML = rows;
      
      // Bind events for dynamically rendered rows
      container.querySelectorAll('[data-edit-usr]').forEach(btn => {
        btn.onclick = () => {
          const u = userArr.find(x => x.id === btn.dataset.editUsr);
          if (!u) return;
          document.getElementById('usr-modal-title').innerText = 'Edit pengguna';
          document.getElementById('usr-id').value = u.id;
          document.getElementById('usr-name').value = u.name;
          document.getElementById('usr-email').value = u.email || '';
          document.getElementById('usr-username').value = u.username;
          document.getElementById('usr-password').value = '';
          document.getElementById('usr-password').placeholder = '(Kosongkan jika tidak diubah)';
          document.getElementById('usr-role').value = u.role;
          document.getElementById('usr-password').removeAttribute('required');
          App.openModal('modal-usr');
        };
      });
      container.querySelectorAll('[data-del-usr]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus pengguna ini?')) return;
          await DB.deleteUser(btn.dataset.delUsr);
          this.renderUsers(container);
        };
      });
    };

    container.innerHTML = `
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-user" placeholder="Cari nama, username...">
            </div>
            <select id="filter-role" class="toolbar-select">
              <option value="">Semua Peran</option>
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="kepsek">Kepsek</option>
              <option value="ortu">Orang Tua</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btn-add-usr"><i class="ph ph-plus"></i> Tambah Pengguna</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Nama / Email</th><th>Username</th><th>Peran</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody id="tbody-users"></tbody></table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-usr">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="usr-modal-title">Tambah pengguna</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-usr')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-usr">
            <div class="modal-body">
              <input type="hidden" id="usr-id">
              <div class="form-group"><label>Nama Lengkap</label><input id="usr-name" required></div>
              <div class="form-group"><label>Email (opsional)</label><input type="email" id="usr-email"></div>
              <div class="form-group"><label>Username</label><input id="usr-username" required></div>
              <div class="form-group"><label>Password</label><input type="password" id="usr-password" required minlength="6"></div>
              <div class="form-group"><label>Peran</label><select id="usr-role" required><option value="guru">Guru</option><option value="ortu">Orang Tua</option><option value="admin">Admin</option><option value="kepsek">Kepsek</option></select></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-usr')">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Initial render
    renderTable();

    // Event listeners for search and filter
    document.getElementById('search-user').addEventListener('input', renderTable);
    document.getElementById('filter-role').addEventListener('change', renderTable);

    document.getElementById('btn-add-usr').onclick = () => {
      document.getElementById('usr-modal-title').innerText = 'Tambah pengguna';
      document.getElementById('usr-id').value = '';
      document.getElementById('usr-name').value = '';
      document.getElementById('usr-email').value = '';
      document.getElementById('usr-username').value = '';
      document.getElementById('usr-password').value = '';
      document.getElementById('usr-password').placeholder = '';
      document.getElementById('usr-role').value = 'guru';
      document.getElementById('usr-password').setAttribute('required', 'true');
      App.openModal('modal-usr');
    };

    document.getElementById('form-usr').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Menyimpan...';
      const id = document.getElementById('usr-id').value || null;
      const pwd = document.getElementById('usr-password').value;
      const data = {
        name: document.getElementById('usr-name').value.trim(),
        email: document.getElementById('usr-email').value.trim(),
        username: document.getElementById('usr-username').value.trim(),
        role: document.getElementById('usr-role').value
      };
      if (pwd) data.password = pwd;
      try {
        await DB.saveUser(id, data);
        App.closeModal('modal-usr');
        this.renderUsers(container);
      } catch (err) {
        alert(err.message || 'Gagal menyimpan');
        btn.disabled = false;
        btn.innerHTML = 'Simpan';
      }
    };
  },
  async renderClasses(container) {
    Router.setTitle('Data kelas', 'Kelola kelas dan penugasan wali kelas serta guru mapel.');
    const [classes, users, students, subjects] = await Promise.all([
      DB.getClasses(),
      DB.getAllUsers(),
      DB.getAllStudents(),
      DB.getSubjects()
    ]);
    const classArr = DB.toArray(classes);
    const guruArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU);
    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const studentArr = DB.toArray(students);
    const rows = classArr.length ? classArr.map(c => {
      const teacher = guruArr.find(g => g.id === c.teacherId);
      const count = studentArr.filter(s => s.classId === c.id).length;
      return `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${teacher ? teacher.name : '<span class="text-muted">Belum ditugaskan</span>'}</td>
          <td>${count} siswa</td>
          <td class="action-cell table-col-lg">
            <button class="btn btn-outline btn-sm" data-mapel-cls="${c.id}" title="Atur Guru Mapel"><i class="ph ph-books"></i> Mapel</button>
            <button class="btn btn-outline btn-sm" data-edit-cls="${c.id}" title="Edit Kelas"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-outline btn-sm" data-view-cls="${c.id}" title="Lihat Siswa"><i class="ph ph-eye"></i></button>
            <button class="btn btn-danger btn-sm" data-del-cls="${c.id}" title="Hapus"><i class="ph ph-trash"></i></button>
          </td>
        </tr>`;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada kelas.</td></tr>';
    
    const guruOptions = guruArr.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    
    // Generate subjects dropdowns for mapel modal
    const mapelRows = subArr.map(sub => `
      <div class="subject-editor-row">
        <label>${sub.name}</label>
        <select class="mapel-select" data-subject-id="${sub.id}">
          <option value="">— Default (Wali Kelas) —</option>
          ${guruOptions}
        </select>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar kelas</h3>
          <button class="btn btn-primary" id="btn-add-cls"><i class="ph ph-plus"></i> Tambah</button>
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th>Nama Kelas</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th style="width:220px">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>

      <div class="modal-overlay" id="modal-cls">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="cls-modal-title">Tambah kelas</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-cls')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-cls">
            <div class="modal-body">
              <input type="hidden" id="cls-id">
              <div class="form-group">
                <label>Nama kelas</label>
                <input id="cls-name" required placeholder="Contoh: 4A">
              </div>
              <div class="form-group">
                <label>Wali kelas</label>
                <select id="cls-teacher">
                  <option value="">— Pilih guru —</option>
                  ${guruOptions}
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-cls')">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      <div class="modal-overlay" id="modal-mapel">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="mapel-modal-title">Atur Guru Mata Pelajaran</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-mapel')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-mapel">
            <div class="modal-body">
              <input type="hidden" id="mapel-cls-id">
              <p class="text-muted soft-note">Tentukan guru khusus untuk mata pelajaran tertentu. Jika dikosongkan, hak akses pengisian nilai akan dikembalikan ke Wali Kelas.</p>
              ${mapelRows}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-mapel')">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan Penugasan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-add-cls').onclick = () => {
      document.getElementById('cls-modal-title').innerText = 'Tambah kelas';
      document.getElementById('cls-id').value = '';
      document.getElementById('cls-name').value = '';
      document.getElementById('cls-teacher').value = '';
      document.getElementById('modal-cls').classList.add('active');
    };
    
    container.querySelectorAll('[data-edit-cls]').forEach(btn => {
      btn.onclick = () => {
        const c = classArr.find(x => x.id === btn.dataset.editCls);
        if (!c) return;
        document.getElementById('cls-modal-title').innerText = 'Edit kelas';
        document.getElementById('cls-id').value = c.id;
        document.getElementById('cls-name').value = c.name;
        document.getElementById('cls-teacher').value = c.teacherId || '';
        document.getElementById('modal-cls').classList.add('active');
      };
    });

    container.querySelectorAll('[data-mapel-cls]').forEach(btn => {
      btn.onclick = () => {
        const c = classArr.find(x => x.id === btn.dataset.mapelCls);
        if (!c) return;
        document.getElementById('mapel-modal-title').innerText = `Guru Mapel - Kelas ${c.name}`;
        document.getElementById('mapel-cls-id').value = c.id;
        
        // Reset and prefill selects
        const selects = document.querySelectorAll('.mapel-select');
        selects.forEach(sel => {
          const subId = sel.dataset.subjectId;
          sel.value = (c.subjectTeachers && c.subjectTeachers[subId]) ? c.subjectTeachers[subId] : '';
        });
        
        document.getElementById('modal-mapel').classList.add('active');
      };
    });

    container.querySelectorAll('[data-del-cls]').forEach(btn => {
      btn.onclick = async () => {
        const classId = btn.dataset.delCls;
        const studentsInClass = await DB.getStudentsByClass(classId);
        if (Object.keys(studentsInClass || {}).length > 0) {
          alert('Tidak dapat menghapus kelas karena masih ada siswa yang terdaftar di dalamnya. Silakan pindahkan atau hapus siswa terlebih dahulu.');
          return;
        }
        if (!confirm('Yakin ingin menghapus kelas ini secara permanen?')) return;
        await DB.deleteClass(classId);
        this.renderClasses(container);
      };
    });
    
    container.querySelectorAll('[data-view-cls]').forEach(btn => {
      btn.onclick = () => {
        window.location.hash = `#/admin/students/${btn.dataset.viewCls}`;
      };
    });

    document.getElementById('form-cls').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('cls-id').value || null;
      await DB.saveClass(id, {
        name: document.getElementById('cls-name').value.trim(),
        teacherId: document.getElementById('cls-teacher').value || null
      });
      App.closeModal('modal-cls');
      this.renderClasses(container);
    };

    document.getElementById('form-mapel').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('mapel-cls-id').value;
      if (!id) return;
      
      const subjectTeachers = {};
      document.querySelectorAll('.mapel-select').forEach(sel => {
        if (sel.value) {
          subjectTeachers[sel.dataset.subjectId] = sel.value;
        }
      });
      
      await DB.saveClassSubjectTeachers(id, subjectTeachers);
      App.closeModal('modal-mapel');
      this.renderClasses(container);
    };
  },
  // ========== DATA SISWA (per kelas) ==========
  async renderStudents(container, classId) {
    const classes = await DB.getClasses();
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }
    Router.setTitle(`Siswa kelas ${cls.name}`, 'Kelola data siswa dan hubungkan dengan akun orang tua.');
    const [studentData, users] = await Promise.all([
      DB.getStudentsByClass(classId),
      DB.getAllUsers()
    ]);
    const studentArr = DB.toArray(studentData).sort((a,b) => a.name.localeCompare(b.name));
    const ortuArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.ORTU);
    
    const renderTable = () => {
      const q = (document.getElementById('search-student')?.value || '').toLowerCase();
      const genderFilter = document.getElementById('filter-gender')?.value || '';
      
      const filtered = studentArr.filter(s => {
        const matchSearch = (s.name || '').toLowerCase().includes(q) || (s.nis || '').toLowerCase().includes(q);
        const matchGender = genderFilter ? s.gender === genderFilter : true;
        return matchSearch && matchGender;
      });
      
      const rows = filtered.length ? filtered.map(s => {
        const parent = ortuArr.find(p => p.id === s.parentId);
        return `
          <tr>
            <td>${s.nis || '-'}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-'}</td>
            <td>${parent ? parent.name : '<span class="text-muted">Belum tertaut</span>'}</td>
            <td class="action-cell">
              <button class="btn btn-outline btn-sm" data-edit-stu="${s.id}"><i class="ph ph-pencil-simple"></i></button>
              <button class="btn btn-danger btn-sm" data-del-stu="${s.id}"><i class="ph ph-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('') : '<tr><td colspan="5" class="text-center text-muted">Tidak ada data siswa ditemukan.</td></tr>';
      
      const tbody = container.querySelector('#tbody-students');
      if (tbody) tbody.innerHTML = rows;

      // Bind events
      container.querySelectorAll('[data-edit-stu]').forEach(btn => {
        btn.onclick = () => {
          const s = studentArr.find(x => x.id === btn.dataset.editStu);
          if (!s) return;
          document.getElementById('stu-modal-title').innerText = 'Edit siswa';
          document.getElementById('stu-id').value = s.id;
          document.getElementById('stu-nis').value = s.nis || '';
          document.getElementById('stu-nisn').value = s.nisn || '';
          document.getElementById('stu-name').value = s.name;
          document.getElementById('stu-gender').value = s.gender || 'L';
          document.getElementById('stu-parent').value = s.parentId || '';
          App.openModal('modal-stu');
        };
      });
      container.querySelectorAll('[data-del-stu]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus siswa ini?')) return;
          await DB.deleteStudent(btn.dataset.delStu);
          this.renderStudents(container, classId);
        };
      });
    };

    const ortuOptions = ortuArr.map(p => `<option value="${p.id}">${p.name} (${p.username})</option>`).join('');
    
    container.innerHTML = `
      <div class="toolbar-panel"><a href="#/admin/classes" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali ke kelas</a></div>
      <div class="card toolbar-panel">
        <div class="toolbar-row">
          <div class="toolbar-controls">
            <div class="search-box">
              <i class="ph ph-magnifying-glass"></i>
              <input type="text" id="search-student" placeholder="Cari nama atau NIS...">
            </div>
            <select id="filter-gender" class="toolbar-select">
              <option value="">Semua L/P</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <button class="btn btn-primary" id="btn-add-stu"><i class="ph ph-plus"></i> Tambah Siswa</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th>NIS</th><th>Nama Siswa</th><th>L/P</th><th>Orang Tua</th><th class="table-col-md">Aksi</th></tr></thead>
          <tbody id="tbody-students"></tbody></table>
        </div>
      </div>
      <div class="modal-overlay" id="modal-stu">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="stu-modal-title">Tambah siswa</h3>
            <button class="btn-icon" onclick="App.closeModal('modal-stu')"><i class="ph ph-x"></i></button>
          </div>
          <form id="form-stu">
            <div class="modal-body">
              <input type="hidden" id="stu-id">
              <div class="form-split">
                <div class="form-group"><label>NIS</label><input id="stu-nis" required></div>
                <div class="form-group"><label>NISN</label><input id="stu-nisn"></div>
              </div>
              <div class="form-group"><label>Nama Lengkap</label><input id="stu-name" required></div>
              <div class="form-group"><label>Jenis Kelamin</label><select id="stu-gender"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
              <div class="form-group"><label>Tautkan Orang Tua</label><select id="stu-parent"><option value="">— Tidak ditautkan —</option>${ortuOptions}</select></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-stu')">Batal</button>
              <button type="submit" class="btn btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    `;

    renderTable();

    document.getElementById('search-student').addEventListener('input', renderTable);
    document.getElementById('filter-gender').addEventListener('change', renderTable);

    document.getElementById('btn-add-stu').onclick = () => {
      document.getElementById('stu-modal-title').innerText = 'Tambah siswa';
      document.getElementById('stu-id').value = '';
      document.getElementById('stu-nis').value = '';
      document.getElementById('stu-nisn').value = '';
      document.getElementById('stu-name').value = '';
      document.getElementById('stu-gender').value = 'L';
      document.getElementById('stu-parent').value = '';
      App.openModal('modal-stu');
    };

    document.getElementById('form-stu').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('stu-id').value || null;
      await DB.saveStudent(id, {
        classId: classId,
        nis: document.getElementById('stu-nis').value.trim(),
        nisn: document.getElementById('stu-nisn').value.trim(),
        name: document.getElementById('stu-name').value.trim(),
        gender: document.getElementById('stu-gender').value,
        parentId: document.getElementById('stu-parent').value || null
      });
      App.closeModal('modal-stu');
      this.renderStudents(container, classId);
    };
  },
  async renderSubjects(container) {
    Router.setTitle('Mata Pelajaran', 'Kelola daftar mata pelajaran sekolah.');
    const subjects = await DB.getSubjects();
    const subArr = DB.toArray(subjects).sort((a, b) => (a.order || 0) - (b.order || 0));
    const categoryLabel = {
      'agama': 'Agama',
      'standar': 'Umum',
      'lokal': 'Muatan Lokal',
      'kekhasan': 'Kekhasan'
    };
    const categoryBadge = {
      'agama': 'badge-success',
      'standar': 'badge-primary',
      'lokal': 'badge-warning',
      'kekhasan': 'badge-danger'
    };
    
    const renderTable = () => {
      const q = (document.getElementById('search-sub')?.value || '').toLowerCase();
      const filtered = subArr.filter(s => (s.name || '').toLowerCase().includes(q));
      
      const rows = filtered.length ? filtered.map(s => `
        <tr>
          <td>${s.order || '-'}</td>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge ${categoryBadge[s.category] || 'badge-primary'}">${categoryLabel[s.category] || s.category}</span></td>
          <td class="action-cell">
            <button class="btn btn-outline btn-sm" data-edit-sub="${s.id}"><i class="ph ph-pencil-simple"></i></button>
            <button class="btn btn-danger btn-sm" data-del-sub="${s.id}"><i class="ph ph-trash"></i></button>
          </td>
        </tr>
      `).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada mata pelajaran.</td></tr>';
      
      const tbody = container.querySelector('#tbody-subjects');
      if (tbody) tbody.innerHTML = rows;

      container.querySelectorAll('[data-edit-sub]').forEach(btn => {
        btn.onclick = () => {
          const s = subArr.find(x => x.id === btn.dataset.editSub);
          if (s) this._openSubjectModal(s);
        };
      });
      container.querySelectorAll('[data-del-sub]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Yakin menghapus mata pelajaran ini?')) return;
          await DB.deleteSubject(btn.dataset.delSub);
          this.renderSubjects(container);
        };
      });
    };

    container.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center; justify-content:space-between">
          <div class="search-box" style="flex:1; min-width:250px; position:relative">
            <i class="ph ph-magnifying-glass" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted)"></i>
            <input type="text" id="search-sub" placeholder="Cari mata pelajaran..." style="width:100%; padding-left:36px; height:40px; border-radius:8px; border:1px solid var(--border)">
          </div>
          <button class="btn btn-primary" id="btn-add-sub"><i class="ph ph-plus"></i> Tambah Mapel</button>
        </div>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="table"><thead><tr><th style="width:50px">No</th><th>Nama Mata Pelajaran</th><th>Kategori</th><th style="width:100px">Aksi</th></tr></thead>
          <tbody id="tbody-subjects"></tbody></table>
        </div>
      </div>
      ${this._subjectModal()}
    `;
    
    renderTable();
    document.getElementById('search-sub').addEventListener('input', renderTable);

    document.getElementById('btn-add-sub').onclick = () => this._openSubjectModal(null, subArr.length + 1);
    
    document.getElementById('form-sub').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('sub-id').value || null;
      await DB.saveSubject(id, {
        name: document.getElementById('sub-name').value.trim(),
        category: document.getElementById('sub-category').value,
        order: parseInt(document.getElementById('sub-order').value) || 1
      });
      App.closeModal('modal-sub');
      this.renderSubjects(container);
    };
  },
  _subjectModal() {
    return `
    <div class="modal-overlay" id="modal-sub">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="sub-modal-title">Tambah mata pelajaran</h3>
          <button class="btn-icon" onclick="App.closeModal('modal-sub')"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-sub">
          <div class="modal-body">
            <input type="hidden" id="sub-id">
            <div class="form-group">
              <label>Kategori</label>
              <select id="sub-category" required>
                <option value="standar">Umum</option>
                <option value="agama">Agama</option>
                <option value="lokal">Muatan Lokal</option>
                <option value="kekhasan">Kekhasan</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nama Mata Pelajaran</label>
              <input type="text" id="sub-name" required placeholder="Contoh: Matematika">
            </div>
            <div class="form-group">
              <label>Urutan (Opsional)</label>
              <input type="number" id="sub-order" placeholder="Contoh: 1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-sub')">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openSubjectModal(existing = null, nextOrder = 1) {
    document.getElementById('sub-modal-title').innerText = existing ? 'Edit mata pelajaran' : 'Tambah mata pelajaran';
    document.getElementById('sub-id').value = existing ? existing.id : '';
    document.getElementById('sub-category').value = existing ? existing.category : 'standar';
    document.getElementById('sub-name').value = existing ? existing.name : '';
    document.getElementById('sub-order').value = existing ? existing.order : nextOrder;
    document.getElementById('modal-sub').classList.add('active');
  },
  async renderExtracurriculars(container) {
    Router.setTitle('Ekstrakurikuler', 'Kelola daftar ekstrakurikuler sekolah.');
    const [ekskuls, users] = await Promise.all([
      DB.getExtracurriculars(),
      DB.getAllUsers()
    ]);
    const guruArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU);
    const eksArr = DB.toArray(ekskuls).sort((a, b) => (a.order || 0) - (b.order || 0));
    const rows = eksArr.length ? eksArr.map(e => {
      const guru = guruArr.find(g => g.id === e.teacherId);
      return `
      <tr>
        <td>${e.order || '-'}</td>
        <td><strong>${e.name}</strong></td>
        <td>${guru ? guru.name : '<span class="text-muted">Belum ada pembina</span>'}</td>
        <td class="action-cell">
          <button class="btn btn-outline btn-sm" data-edit-eks="${e.id}"><i class="ph ph-pencil-simple"></i></button>
          <button class="btn btn-danger btn-sm" data-del-eks="${e.id}"><i class="ph ph-trash"></i></button>
        </td>
      </tr>
    `}).join('') : '<tr><td colspan="4" class="text-center text-muted">Belum ada ekstrakurikuler.</td></tr>';
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Daftar Ekstrakurikuler</h3>
          <button class="btn btn-primary" id="btn-add-eks"><i class="ph ph-plus"></i> Tambah</button>
        </div>
        <div class="table-responsive">
          <table class="table"><thead><tr><th style="width:50px">No</th><th>Nama Ekstrakurikuler</th><th>Guru Pembina</th><th style="width:100px">Aksi</th></tr></thead>
          <tbody>${rows}</tbody></table>
        </div>
      </div>
      ${this._extracurricularModal(guruArr)}
    `;
    document.getElementById('btn-add-eks').onclick = () => this._openExtracurricularModal(null, eksArr.length + 1);
    container.querySelectorAll('[data-edit-eks]').forEach(btn => {
      btn.onclick = () => {
        const e = eksArr.find(x => x.id === btn.dataset.editEks);
        if (e) this._openExtracurricularModal(e);
      };
    });
    container.querySelectorAll('[data-del-eks]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Yakin hapus ekstrakurikuler ini?')) return;
        await DB.deleteExtracurricular(btn.dataset.delEks);
        this.renderExtracurriculars(container);
      };
    });
    document.getElementById('form-eks').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('eks-id').value || null;
      await DB.saveExtracurricular(id, {
        name: document.getElementById('eks-name').value.trim(),
        order: parseInt(document.getElementById('eks-order').value) || 1,
        teacherId: document.getElementById('eks-teacher').value || null
      });
      App.closeModal('modal-eks');
      this.renderExtracurriculars(container);
    };
  },
  _extracurricularModal(guruArr) {
    return `
    <div class="modal-overlay" id="modal-eks">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" id="eks-modal-title">Tambah ekstrakurikuler</h3>
          <button class="btn-icon" onclick="App.closeModal('modal-eks')"><i class="ph ph-x"></i></button>
        </div>
        <form id="form-eks">
          <div class="modal-body">
            <input type="hidden" id="eks-id">
            <div class="form-group">
              <label>Nama ekstrakurikuler</label>
              <input id="eks-name" required placeholder="Contoh: Hizbul Wathan (HW)">
            </div>
            <div class="form-group">
              <label>Urutan tampil</label>
              <input id="eks-order" type="number" min="1" value="1">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="App.closeModal('modal-eks')">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>`;
  },
  _openExtracurricularModal(existing, nextOrder) {
    document.getElementById('eks-modal-title').innerText = existing ? 'Edit ekstrakurikuler' : 'Tambah ekstrakurikuler';
    document.getElementById('eks-id').value = existing ? existing.id : '';
    document.getElementById('eks-name').value = existing ? existing.name : '';
    document.getElementById('eks-teacher').value = existing ? (existing.teacherId || '') : '';
    document.getElementById('eks-order').value = existing ? existing.order : (nextOrder || 1);
    document.getElementById('modal-eks').classList.add('active');
  },
  // ========== REKAP PRESENSI ==========
  async renderAttendance(container) {
    Router.setTitle('Rekapan Presensi', 'Monitoring absensi guru dan siswa per hari.');
    const today = new Date();
    const defaultDate = today.toISOString().slice(0, 10);
    const settings = await DB.getSettings();
    const [teacherAttendance, studentAttendance, classes, students, users] = await Promise.all([
      DB.getTeacherAttendanceByDate(defaultDate),
      DB.getDailyStudentAttendanceByDate(defaultDate),
      DB.getClasses(),
      DB.getAllStudents(),
      DB.getAllUsers()
    ]);
    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(students);
    const teacherArr = DB.toArray(users).filter(u => u.role === AppConfig.ROLES.GURU);

    const renderTeacherRows = (dateStr, teacherData, attendanceData) => teacherArr.map(g => {
      const att = attendanceData[g.id] || {};
      const status = att.time_in ? (att.time_out ? 'Selesai' : 'Datang') : 'Belum hadir';
      const timeIn = att.time_in || '-';
      const timeOut = att.time_out || '-';
      const proofBtn = att.proof_url
        ? `<button class="btn btn-outline btn-sm" data-proof-date="${dateStr}" data-proof-teacher="${g.id}" data-proof-url="${att.proof_url}"><i class="ph ph-eye"></i> Lihat bukti</button>`
        : '<span class="text-muted">Tidak ada bukti</span>';
      return `
        <tr>
          <td>${g.name}</td>
          <td><span class="badge ${att.time_in ? 'badge-success' : 'badge-warning'}">${status}</span></td>
          <td>${timeIn}</td>
          <td>${timeOut}</td>
          <td>${proofBtn}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" class="text-center text-muted">Belum ada data presensi guru.</td></tr>';

    const renderStudentSummary = (dateStr, attendanceData) => classArr.map(cls => {
      const classStudents = studentArr.filter(s => s.classId === cls.id);
      const att = attendanceData[cls.id] || {};
      let had = 0, sick = 0, izin = 0, alpha = 0;
      classStudents.forEach(s => {
        const v = att[s.id];
        if (v === 'H') had++;
        else if (v === 'S') sick++;
        else if (v === 'I') izin++;
        else if (v === 'A') alpha++;
      });
      return `
        <tr>
          <td>${cls.name}</td>
          <td>${had}</td>
          <td>${sick}</td>
          <td>${izin}</td>
          <td>${alpha}</td>
          <td>${classStudents.length}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="6" class="text-center text-muted">Belum ada data absensi siswa.</td></tr>';

    const buildTable = async (selectedDate) => {
      const [teacherData, studentData] = await Promise.all([
        DB.getTeacherAttendanceByDate(selectedDate),
        DB.getDailyStudentAttendanceByDate(selectedDate)
      ]);
      const teacherRows = renderTeacherRows(selectedDate, teacherArr, teacherData);
      const studentSummary = renderStudentSummary(selectedDate, studentData);
      container.innerHTML = `
        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 class="card-title" style="margin:0;">Rekapan presensi</h3>
              <p class="text-muted" style="margin:6px 0 0 0;">Atur tanggal untuk melihat semua rekapan.</p>
            </div>
            <div class="form-group" style="margin:0; min-width:220px;">
              <label style="display:block; margin-bottom:6px; font-size:12px;">Tanggal</label>
              <input id="attendance-date-picker" type="date" value="${selectedDate}" class="form-control" style="width:100%;">
            </div>
          </div>
        </div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <h3 class="card-title">Presensi Guru</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Nama Guru</th><th>Status</th><th>Datang</th><th>Pulang</th><th>Bukti</th></tr></thead>
              <tbody>${teacherRows}</tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Absensi Siswa per Kelas</h3>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>Kelas</th><th>H</th><th>S</th><th>I</th><th>A</th><th>Total</th></tr></thead>
              <tbody>${studentSummary}</tbody>
            </table>
          </div>
        </div>
      `;

      const datePicker = document.getElementById('attendance-date-picker');
      if (datePicker) {
        datePicker.onchange = async () => {
          const nextDate = datePicker.value || defaultDate;
          await buildTable(nextDate);
        };
      }

      container.querySelectorAll('[data-proof-url]').forEach(btn => {
        btn.onclick = () => {
          const url = btn.dataset.proofUrl;
          const modal = document.createElement('div');
          modal.className = 'modal-overlay active';
          modal.innerHTML = `
            <div class="modal" style="max-width: 720px;">
              <div class="modal-header">
                <h3 class="modal-title">Bukti Presensi</h3>
                <button class="btn-icon" type="button" data-close-proof="1"><i class="ph ph-x"></i></button>
              </div>
              <div class="modal-body" style="text-align:center;">
                <img src="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" alt="Bukti presensi" style="max-width:100%; max-height:70vh; border-radius:10px; object-fit:contain; background:#f3f4f6;">
              </div>
              <div class="modal-footer">
                <a href="${DriveBridge.normalizeDriveImageUrl(url, 'w800', '')}" target="_blank" class="btn btn-primary">Buka ukuran penuh</a>
                <button type="button" class="btn btn-outline" data-close-proof="1">Tutup</button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          modal.querySelectorAll('[data-close-proof]').forEach(el => {
            el.onclick = () => modal.remove();
          });
        };
      });
    };

    await buildTable(defaultDate);
  },
  // ========== HELPERS ==========

};
// Route registration
Router.add('#/admin/attendance', c => AdminPages.renderAttendance(c));
Router.add('#/admin/characters', c => AdminPages.renderCharacters(c));
Router.add('#/admin/users', c => AdminPages.renderUsers(c));
Router.add('#/admin/classes', c => AdminPages.renderClasses(c));
Router.add('#/admin/subjects', c => AdminPages.renderSubjects(c));
Router.add('#/admin/extracurriculars', c => AdminPages.renderExtracurriculars(c));
Router.add('#/admin/students/:id', (c, classId) => AdminPages.renderStudents(c, classId));
