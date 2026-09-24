// kepsek.js — Modul Kepala Sekolah.
// Memantau metrik sekolah secara keseluruhan, rata-rata kelas, dan siswa dengan perhatian khusus.
const KepsekPages = {
  // ========== DASHBOARD (Global) ==========
  async renderDashboard(container) {
    Router.setTitle('Dasbor Kepala Sekolah', 'Ringkasan data akademik dan karakter seluruh sekolah.');
    const settings = await DB.getSettings();
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    const [students, classes, chars, allAssess, allAcad, obsData] = await Promise.all([
      DB.getAllStudents(),
      DB.getClasses(),
      DB.getCharacters(),
      DB.getAllAssessmentsForPeriod(year, sem),
      DB.getAllAcademicGrades(year, sem),
      DB.getAllObservations()
    ]);
    const studentArr = DB.toArray(students);
    const classArr = DB.toArray(classes);
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const obsArr = DB.toArray(obsData);
    let needsAttention = 0;
    const studentAverages = {};
    const charAverages = {};
    charArr.forEach(c => {
      charAverages[c.id] = {
        total: 0,
        count: 0
      };
    });
    // Calculate Character averages and find at-risk students
    const atRiskStudents = [];
    studentArr.forEach(s => {
      const scores = allAssess?.[s.id];
      const sObs = obsArr.filter(o => o.studentId === s.id);
      const hasWarningObs = sObs.some(o => o.type === 'needs_improvement');
      if (scores) {
        let total = 0,
          count = 0;
        Object.keys(scores).forEach(charId => {
          const sc = scores[charId].score;
          if (sc && charAverages[charId]) {
            charAverages[charId].total += sc;
            charAverages[charId].count++;
            total += sc;
            count++;
          }
        });
        const avg = count > 0 ? (total / count) : 0;
        studentAverages[s.id] = avg;
        if ((avg > 0 && avg < 2.5) || hasWarningObs) {
          needsAttention++;
          atRiskStudents.push({
            student: s,
            avg: avg.toFixed(2),
            warningCount: sObs.filter(o => o.type === 'needs_improvement').length
          });
        }
      } else if (hasWarningObs) {
        needsAttention++;
        atRiskStudents.push({
          student: s,
          avg: '-',
          warningCount: sObs.filter(o => o.type === 'needs_improvement').length
        });
      }
    });
    // Calculate Academic Global Average
    let globalAcadTotal = 0;
    let globalAcadCount = 0;
    Object.values(allAcad || {}).forEach(studentGrades => {
      Object.values(studentGrades || {}).forEach(grade => {
        if (grade.score) {
          globalAcadTotal += parseInt(grade.score);
          globalAcadCount++;
        }
      });
    });
    const globalAcadAvg = globalAcadCount > 0 ? Math.round(globalAcadTotal / globalAcadCount) : '-';
    // Calculate Teacher Compliance (Progres Pengisian)
    let assessedStudentsCount = 0;
    studentArr.forEach(s => {
      // Consider a student assessed if they have at least 1 character score or 1 academic score
      const hasChar = allAssess && allAssess[s.id] && Object.values(allAssess[s.id]).some(v => v.score);
      const hasAcad = allAcad && allAcad[s.id] && Object.values(allAcad[s.id]).some(v => v.score);
      if (hasChar || hasAcad) assessedStudentsCount++;
    });
    const complianceRate = studentArr.length > 0 ? Math.round((assessedStudentsCount / studentArr.length) * 100) : 0;
    const positiveObs = obsArr.filter(o => o.type === 'positive').length;
    const warningObs = obsArr.filter(o => o.type === 'needs_improvement').length;
    // Build At-Risk Table HTML
    const atRiskHtml = atRiskStudents.length > 0 ? atRiskStudents.map(item => {
      const cls = classArr.find(c => c.id === item.student.classId);
      return `
        <tr>
          <td><strong>${item.student.name}</strong></td>
          <td>${cls ? cls.name : '-'}</td>
          <td class="text-center"><span class="badge ${item.avg < 2.5 && item.avg !== '-' ? 'badge-danger' : 'badge-warning'}">${item.avg}</span></td>
          <td class="text-center">${item.warningCount > 0 ? `<span class="badge badge-warning">${item.warningCount} Catatan</span>` : '-'}</td>
        </tr>
      `;
    }).join('') : '<tr><td colspan="4" class="text-center text-muted">Bagus! Tidak ada siswa yang terdeteksi memerlukan perhatian khusus.</td></tr>';
    // Stat cards
    container.innerHTML = `
      <section class="card-grid section-spacer">
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-books"></i></div>
          <div><p class="stat-value">${globalAcadAvg}</p><p class="stat-label text-muted">Rata-rata Akademik Sekolah</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--success"><i class="ph ph-check-circle"></i></div>
          <div><p class="stat-value">${complianceRate}%</p><p class="stat-label text-muted">Progres Pengisian Rapor</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--warning"><i class="ph ph-warning"></i></div>
          <div><p class="stat-value">${needsAttention}</p><p class="stat-label text-muted">Siswa Perlu Perhatian</p></div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon stat-icon--primary"><i class="ph ph-student"></i></div>
          <div><p class="stat-value">${studentArr.length}</p><p class="stat-label text-muted">Total Siswa Aktif</p></div>
        </div>
      </section>

      <section class="card-grid section-spacer">
        <div class="card card-accent-danger">
          <h3 class="card-title section-spacer"><i class="ph ph-warning-circle" style="color:var(--danger)"></i> Daftar Siswa Perlu Perhatian Khusus</h3>
          <p class="text-muted soft-note section-spacer">Daftar siswa dengan rata-rata karakter di bawah 2.5 atau memiliki catatan observasi "Perlu Bimbingan".</p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr><th>Nama Siswa</th><th>Kelas</th><th class="text-center">Rata-rata Karakter</th><th class="text-center">Catatan Peringatan</th></tr>
              </thead>
              <tbody>${atRiskHtml}</tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title section-spacer">Rata-rata Karakter Sekolah — Sem ${sem}, ${year}</h3>
          <div style="position:relative;width:100%;max-width:500px;margin:0 auto"><canvas id="chart-school"></canvas></div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">Rekapitulasi per Kelas</h3>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Kelas</th><th>Jumlah Siswa</th><th>Rata-rata Karakter</th><th>Aksi</th></tr></thead>
            <tbody id="class-recap-body"></tbody>
          </table>
        </div>
      </section>
    `;
    // Chart.js — radar chart rata-rata per karakter
    const labels = charArr.map(c => c.name);
    const values = charArr.map(c => {
      const d = charAverages[c.id];
      return d && d.count > 0 ? parseFloat((d.total / d.count).toFixed(2)) : 0;
    });
    new Chart(document.getElementById('chart-school'), {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Rata-rata sekolah',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          pointBackgroundColor: '#3b82f6',
          pointRadius: 4
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 4,
            ticks: {
              stepSize: 1,
              font: {
                size: 10
              }
            },
            pointLabels: {
              font: {
                size: 11
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
    // tabel per kelas
    const tbody = document.getElementById('class-recap-body');
    classArr.forEach(cls => {
      const clsStudents = studentArr.filter(s => s.classId === cls.id);
      let clsTotal = 0,
        clsCount = 0;
      clsStudents.forEach(s => {
        const scores = allAssess?.[s.id];
        if (!scores) return;
        Object.values(scores).forEach(d => {
          if (d.score) {
            clsTotal += d.score;
            clsCount++;
          }
        });
      });
      const avg = clsCount > 0 ? (clsTotal / clsCount).toFixed(2) : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${cls.name}</strong></td>
        <td>${clsStudents.length}</td>
        <td>${avg !== '-' ? avg + ' / 4' : '<span class="text-muted">Belum ada data</span>'}</td>
        <td><a href="#/kepsek/class/${cls.id}" class="btn btn-outline btn-sm"><i class="ph ph-eye"></i> Detail</a></td>`;
      tbody.appendChild(tr);
    });
  },
  // ========== DETAIL KELAS ==========
  async renderClassDetail(container, classId) {
    const [classes, students, chars, settings] = await Promise.all([
      DB.getClasses(),
      DB.getStudentsByClass(classId),
      DB.getCharacters(),
      DB.getSettings()
    ]);
    const cls = classes[classId];
    if (!cls) {
      container.innerHTML = '<div class="card"><p class="error-text">Kelas tidak ditemukan.</p></div>';
      return;
    }
    Router.setTitle(`Rekap ${cls.name}`, `${settings.currentAcademicYear} — Semester ${settings.currentSemester}`);
    const studentArr = DB.toArray(students).sort((a, b) => a.name.localeCompare(b.name));
    const charArr = DB.toArray(chars).filter(c => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    // ambil nilai setiap siswa
    const allScores = {};
    for (const s of studentArr) {
      allScores[s.id] = await DB.getAssessments(year, sem, s.id);
    }
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    const scoreBadge = {
      4: 'badge-primary',
      3: 'badge-success',
      2: 'badge-warning',
      1: 'badge-danger'
    };
    // tabel siswa x karakter
    const thChars = charArr.map(c => `<th style="text-align:center">${c.name}</th>`).join('');
    const rows = studentArr.map(s => {
      const scores = allScores[s.id] || {};
      let total = 0,
        count = 0;
      const tds = charArr.map(c => {
        const sc = scores[c.id]?.score;
        if (sc) {
          total += sc;
          count++;
        }
        return `<td style="text-align:center">${sc ? `<span class="badge ${scoreBadge[sc] || ''}">${sc}</span>` : '<span class="text-muted">—</span>'}</td>`;
      }).join('');
      const avg = count > 0 ? (total / count).toFixed(1) : '-';
      return `<tr><td><strong>${s.name}</strong></td>${tds}<td style="text-align:center;font-weight:600">${avg}</td></tr>`;
    }).join('');
    container.innerHTML = `
      <div style="margin-bottom:16px"><a href="#/dashboard" class="btn btn-outline"><i class="ph ph-arrow-left"></i> Kembali</a></div>
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead><tr><th>Siswa</th>${thChars}<th style="text-align:center">Rata-rata</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  },
  // ========== LAPORAN KELAS ==========
  async renderReports(container) {
    Router.setTitle('Laporan per kelas', 'Pilih kelas untuk melihat laporan lengkap.');
    const [classes, students] = await Promise.all([DB.getClasses(), DB.getAllStudents()]);
    const classArr = DB.toArray(classes);
    const studentArr = DB.toArray(students);
    const cards = classArr.map(c => {
      const count = studentArr.filter(s => s.classId === c.id).length;
      return `
        <div class="card class-card" onclick="window.location.hash='#/kepsek/class/${c.id}'">
          <h3 class="card-title">${c.name}</h3>
          <p class="text-muted">${count} siswa</p>
        </div>`;
    }).join('');
    container.innerHTML = classArr.length ? `<div class="card-grid">${cards}</div>` : '<div class="card"><p class="text-muted">Belum ada data kelas.</p></div>';
  }
};
// Route registration
Router.add('#/kepsek/reports', c => KepsekPages.renderReports(c));
Router.add('#/kepsek/class/:id', (c, id) => KepsekPages.renderClassDetail(c, id));