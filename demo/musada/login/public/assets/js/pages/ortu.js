// ortu.js — Modul Orang Tua / Wali.
// Dashboard lengkap: Karakter, Akademik, dan Catatan lainnya (dengan tab navigasi).
const OrtuPages = {
  async renderDashboard(container) {
    Router.setTitle('Perkembangan anak', 'Pantau seluruh hasil belajar dan karakter anak Anda.');
    const myStudents = await DB.getStudentsByParent(Auth.currentUser.uid);
    const studentArr = DB.toArray(myStudents);
    if (!studentArr.length) {
      container.innerHTML = `
        <div class="card panel-callout" style="margin-top:20px;text-align:center;padding:40px 20px;">
          <div style="font-size:48px;color:var(--text-muted);margin-bottom:16px"><i class="ph ph-users-three"></i></div>
          <h3 style="margin-bottom:8px">Akun belum terhubung</h3>
          <p class="text-muted">Silakan hubungi wali kelas atau admin sekolah untuk menautkan akun ini ke data anak Anda.</p>
        </div>`;
      return;
    }
    const [settings, chars, classes, subjectsData, extrasData] = await Promise.all([
      DB.getSettings(),
      DB.getCharacters(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getExtracurriculars()
    ]);
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const subjArr = DB.toArray(subjectsData).filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const exArr = DB.toArray(extrasData);
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    const scoreColor = {
      4: 'var(--primary)',
      3: 'var(--success)',
      2: 'var(--warning)',
      1: 'var(--danger)'
    };
    let html = '';
    for (const student of studentArr) {
      const cls = classes[student.classId];
      const [scores, obsData, parentResp, acadGrades, stuExtra, cocurr, attendance, teacherNote] = await Promise.all([
        DB.getAssessments(year, sem, student.id),
        DB.getObservationsByStudent(student.id),
        DB.getParentResponse(year, sem, student.id),
        DB.getAcademicGrades(year, sem, student.id),
        DB.getStudentExtracurriculars(year, sem, student.id),
        DB.getCocurricular(year, sem, student.id),
        DB.getAttendance(year, sem, student.id),
        DB.getTeacherNote(year, sem, student.id)
      ]);
      const obsArr = DB.toArray(obsData).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 15);
      // --- TAB 1: KARAKTER & OBSERVASI ---
      const charCards = charArr.map(c => {
        const sc = scores[c.id]?.score;
        return `
          <div class="char-progress-item">
            <div class="char-progress-header">
              <span class="char-name">${c.name}</span>
              <span class="char-score" style="color:${sc ? scoreColor[sc] : 'var(--text-muted)'}">
                ${sc ? scoreLabel[sc] : 'Belum dinilai'}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${sc ? (sc / 4 * 100) : 0}%;background:${sc ? scoreColor[sc] : '#e2e8f0'}"></div>
            </div>
          </div>`;
      }).join('');
      const vals = charArr.map(c => scores[c.id]?.score).filter(Boolean);
      const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
      const obsHtml = obsArr.length ? obsArr.map(o => {
        const ch = charArr.find(c => c.id === o.characterId);
        return `
          <div class="obs-item ${o.type === 'positive' ? 'obs-positive' : 'obs-warning'}">
            <div class="obs-meta">
              <span class="badge ${o.type === 'positive' ? 'badge-success' : 'badge-warning'}">${o.type === 'positive' ? 'Positif' : 'Perlu Bimbingan'}</span>
              <span class="obs-date text-muted">${o.date || ''}</span>
            </div>
            <p class="obs-note">${o.note || '-'}</p>
            <p class="text-muted" style="font-size:12px">${ch ? ch.name : ''}</p>
          </div>`;
      }).join('') : '<p class="text-muted" style="padding:8px 0">Belum ada catatan observasi dari guru.</p>';
      // --- TAB 2: AKADEMIK ---
      const acadHtml = subjArr.map(s => {
        const g = acadGrades ? acadGrades[s.id] : null;
        return `
          <tr>
            <td>${s.name}</td>
            <td class="text-center"><strong>${g && g.score ? g.score : '-'}</strong></td>
            <td style="font-size:13px;color:var(--text-muted)">${g && g.desc ? g.desc : '-'}</td>
          </tr>
        `;
      }).join('');
      // --- TAB 3: LAIN-LAIN ---
      const extraHtml = DB.toArray(stuExtra || {}).map(e => {
        const baseEx = exArr.find(x => x.id === e.extraId);
        return `<tr><td>${baseEx ? baseEx.name : 'Ekstrakurikuler'}</td><td>${e.score || '-'}</td><td>${e.desc || '-'}</td></tr>`;
      }).join('') || '<tr><td colspan="3" class="text-muted text-center">Belum ada data ekstrakurikuler.</td></tr>';
      const cocurrHtml = DB.toArray(cocurr || {}).map(c => `
        <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
          <strong>${c.title || 'Proyek'}</strong><br>
          <span style="font-size:13px" class="text-muted">${c.desc || '-'}</span>
        </div>
      `).join('') || '<p class="text-muted">Belum ada catatan proyek.</p>';
      const att = attendance || {};
      const attHtml = `
        <table class="table" style="width:100%">
          <tr><td style="width:60%">Sakit</td><td style="width:40%"><strong>${att.sakit || 0}</strong> hari</td></tr>
          <tr><td>Izin</td><td><strong>${att.izin || 0}</strong> hari</td></tr>
          <tr><td>Tanpa Keterangan</td><td><strong>${att.alpa || 0}</strong> hari</td></tr>
        </table>
      `;
      html += `
        <section class="student-report" style="margin-bottom:40px">
          <!-- Profil Singkat -->
          <div class="card" style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin-bottom:4px">${student.name}</h3>
              <p class="text-muted" style="font-size:13px">${cls ? cls.name : '-'} · NIS: ${student.nis || '-'} · ${year} Sem ${sem}</p>
            </div>
            <div class="avg-score" style="text-align:right">
              <div style="font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600">Skor Karakter</div>
              <div>${avg}<span class="avg-max">/4</span></div>
            </div>
          </div>

          <!-- Navigasi Tabs -->
          <div class="tabs" style="margin-bottom:16px; display:flex; gap:8px; border-bottom:1px solid var(--border); padding-bottom:8px; overflow-x:auto">
            <button class="btn btn-tab active" data-target="tab-karakter-${student.id}" onclick="OrtuPages.switchTab('${student.id}', 'karakter')"><i class="ph ph-star"></i> Karakter</button>
            <button class="btn btn-tab" data-target="tab-akademik-${student.id}" onclick="OrtuPages.switchTab('${student.id}', 'akademik')"><i class="ph ph-books"></i> Akademik</button>
            <button class="btn btn-tab" data-target="tab-lain-${student.id}" onclick="OrtuPages.switchTab('${student.id}', 'lain')"><i class="ph ph-info"></i> Lainnya</button>
          </div>

          <!-- TAB 1: Karakter -->
          <div id="tab-karakter-${student.id}" class="tab-content active">
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items:start; gap:16px;">
              <div class="card" style="padding:16px">
                <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Perkembangan Aspek Karakter</h3>
                <div class="char-progress-list">${charCards}</div>
              </div>
              <div style="display:grid;gap:16px">
                <div class="card" style="padding:16px">
                  <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Catatan Observasi Guru</h3>
                  <div class="obs-list">${obsHtml}</div>
                </div>
                <div class="card" style="padding:16px">
                  <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Grafik Rata-rata</h3>
                  <div style="position:relative;width:100%"><canvas id="chart-${student.id}"></canvas></div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Akademik -->
          <div id="tab-akademik-${student.id}" class="tab-content hidden">
            <div class="card" style="padding:16px">
              <h3 class="card-title" style="margin-bottom:16px;font-size:15px">Nilai Capaian Kompetensi (Akademik)</h3>
              <div class="table-responsive">
                <table class="table">
                  <thead><tr><th>Mata Pelajaran</th><th style="width:80px;text-align:center">Nilai</th><th>Deskripsi Capaian</th></tr></thead>
                  <tbody>${acadHtml}</tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 3: Lainnya -->
          <div id="tab-lain-${student.id}" class="tab-content hidden">
            <div class="card-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items:start; gap:16px;">
              <div class="card" style="padding:16px">
                <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Ketidakhadiran</h3>
                ${attHtml}
              </div>
              <div class="card" style="padding:16px">
                <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Catatan Wali Kelas</h3>
                <p style="background:var(--primary-light);padding:12px;border-radius:8px;font-size:14px;color:var(--text-main)">
                  ${teacherNote ? (teacherNote.note || '-') : '-'}
                </p>
              </div>
              <div class="card" style="padding:16px">
                <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Ekstrakurikuler</h3>
                <div class="table-responsive"><table class="table"><thead><tr><th>Kegiatan</th><th>Predikat</th><th>Keterangan</th></tr></thead><tbody>${extraHtml}</tbody></table></div>
              </div>
              <div class="card" style="padding:16px">
                <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Kokurikuler (Proyek Profil Pelajar Pancasila)</h3>
                ${cocurrHtml}
              </div>
            </div>
          </div>

          <!-- TANGGAPAN ORTU (Selalu muncul di bawah) -->
          <div class="card" style="margin-top:16px; border-left:4px solid var(--primary)">
            <h3 class="card-title" style="margin-bottom:12px;font-size:15px">Tanggapan Orang Tua / Wali</h3>
            <div class="form-group" style="margin-bottom:12px">
              <textarea id="resp-${student.id}" rows="3" placeholder="Tuliskan tanggapan Anda mengenai perkembangan Ananda..." style="background:#fafafa">${parentResp ? (parentResp.response || '') : ''}</textarea>
            </div>
            <button class="btn btn-primary btn-sm btn-save-resp" data-stu="${student.id}"><i class="ph ph-floppy-disk"></i> Simpan Tanggapan</button>
          </div>
        </section>
      `;
    }
    container.innerHTML = html;
    container.querySelectorAll('.btn-save-resp').forEach(btn => {
      btn.onclick = async (e) => {
        const studentId = e.target.dataset.stu;
        const respText = document.getElementById(`resp-${studentId}`).value.trim();
        const oldHtml = e.target.innerHTML;
        e.target.disabled = true;
        e.target.innerHTML = '<i class="ph ph-spinner"></i> Menyimpan...';
        try {
          await DB.saveParentResponse(year, sem, studentId, {
            response: respText,
            updatedBy: Auth.currentUser.uid
          });
          e.target.innerHTML = '<i class="ph ph-check"></i> Tersimpan';
          setTimeout(() => {
            e.target.disabled = false;
            e.target.innerHTML = oldHtml;
          }, 2000);
        } catch (err) {
          alert('Gagal menyimpan tanggapan.');
          e.target.disabled = false;
          e.target.innerHTML = oldHtml;
        }
      };
    });
    for (const student of studentArr) {
      const scores = await DB.getAssessments(year, sem, student.id);
      const labels = charArr.map(c => c.name);
      const values = charArr.map(c => scores[c.id]?.score || 0);
      new Chart(document.getElementById(`chart-${student.id}`), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Skor',
            data: values,
            backgroundColor: values.map(v => v >= 4 ? 'rgba(59,130,246,0.7)' : v >= 3 ? 'rgba(16,185,129,0.7)' : v >= 2 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.5)'),
            borderRadius: 6,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 4,
              ticks: {
                stepSize: 1
              }
            },
            x: {
              ticks: {
                font: {
                  size: 10
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }
  },
  switchTab(studentId, tabName) {
    const parent = document.querySelector(`#tab-karakter-${studentId}`).parentElement.parentElement;
    parent.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    parent.querySelectorAll('.btn-tab').forEach(b => {
      if (b.dataset.target.includes(studentId)) b.classList.remove('active');
    });
    parent.querySelector(`#tab-${tabName}-${studentId}`).classList.remove('hidden');
    parent.querySelector(`[data-target="tab-${tabName}-${studentId}"]`).classList.add('active');
  }
};
Router.add('#/ortu/dashboard', c => OrtuPages.renderDashboard(c));