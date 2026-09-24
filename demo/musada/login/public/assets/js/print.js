// print.js — Logika untuk men-generate cetakan rapor
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');
  const container = document.getElementById('print-container');
  if (!studentId) {
    container.innerHTML = '<p style="text-align:center; padding:50px;">Error: ID Siswa tidak ditemukan.</p>';
    return;
  }
  // Wait for Firebase to be ready
  const checkDB = setInterval(() => {
    if (typeof DB !== 'undefined' && firebase.auth) {
      clearInterval(checkDB);
      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          await generateReport(studentId, container);
        } else {
          container.innerHTML = '<p style="text-align:center; padding:50px;">Harap login terlebih dahulu untuk mencetak rapor.</p>';
        }
      });
    }
  }, 100);
});
async function generateReport(studentId, container) {
  try {
    const student = await DB.getStudent(studentId);
    if (!student) throw new Error('Siswa tidak ditemukan');
    const [settings, classes, subjectsObj, ekskulsObj, charactersObj] = await Promise.all([
      DB.getSettings(),
      DB.getClasses(),
      DB.getSubjects(),
      DB.getExtracurriculars(),
      DB.getCharacters()
    ]);
    const cls = classes[student.classId] || {
      name: '-',
      phase: '-',
      teacherId: null
    };
    const year = settings.currentAcademicYear;
    const sem = settings.currentSemester;
    // Fetch all related data
    const [academic, cocu, stuEks, att, note, parentResp, chars] = await Promise.all([
      DB.getAcademicGrades(year, sem, studentId),
      DB.getCocurricular(year, sem, studentId),
      DB.getStudentExtracurriculars(year, sem, studentId),
      DB.getAttendance(year, sem, studentId),
      DB.getTeacherNote(year, sem, studentId),
      DB.getParentResponse(year, sem, studentId),
      DB.getAssessments(year, sem, studentId)
    ]);
    const subjects = DB.toArray(subjectsObj).sort((a, b) => (a.order || 0) - (b.order || 0));
    const ekskuls = DB.toArray(ekskulsObj);
    const characters = DB.toArray(charactersObj).sort((a, b) => (a.order || 0) - (b.order || 0));
    // Grouping Subjects
    const getGroupHtml = (groupName, startNo, groupLabel) => {
      const groupSubjects = subjects.filter(s => s.category === groupName);
      if (!groupSubjects.length) return '';
      let html = `
        <tr>
            <td class="text-center" rowspan="${groupSubjects.length + 1}" style="vertical-align: top; padding-top: 6px;">${startNo}.</td>
            <td><strong>${groupLabel}</strong></td>
            <td class="text-center"></td>
            <td class="capaian-box"></td>
        </tr>
      `;
      groupSubjects.forEach((sub, idx) => {
        const grade = academic[sub.id] || {};
        html += `
          <tr class="sub-subject">
              <td>${startNo}.${idx + 1} ${sub.name}</td>
              <td class="text-center">${grade.score || ''}</td>
              <td class="capaian-box">
                  ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : ''}
                  ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                  ${!grade.descPositive && !grade.descNegative ? '<p>-</p>' : ''}
              </td>
          </tr>
        `;
      });
      return html;
    };
    const getGeneralHtml = (startNo) => {
      const generalSubjects = subjects.filter(s => s.category === 'Umum');
      if (!generalSubjects.length) return {
        html: '',
        count: 0
      };
      let html = '';
      generalSubjects.forEach((sub, idx) => {
        const grade = academic[sub.id] || {};
        html += `
          <tr>
              <td class="text-center">${startNo + idx}.</td>
              <td>${sub.name}</td>
              <td class="text-center">${grade.score || ''}</td>
              <td class="capaian-box">
                  ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : ''}
                  ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                  ${!grade.descPositive && !grade.descNegative ? '<p>-</p>' : ''}
              </td>
          </tr>
        `;
      });
      return {
        html,
        count: generalSubjects.length
      };
    };
    let tableHtml = '';
    let currentNo = 1;
    // Agama
    tableHtml += getGroupHtml('Agama', currentNo, 'Pendidikan Agama');
    if (subjects.some(s => s.category === 'Agama')) currentNo++;
    // Umum
    const general = getGeneralHtml(currentNo);
    tableHtml += general.html;
    currentNo += general.count;
    // Muatan Lokal
    tableHtml += getGroupHtml('Muatan Lokal', currentNo, 'Muatan Lokal');
    if (subjects.some(s => s.category === 'Muatan Lokal')) currentNo++;
    // Kemuhammadiyahan (Kekhasan)
    const kekhasanSubjects = subjects.filter(s => s.category === 'Kekhasan');
    kekhasanSubjects.forEach((sub, idx) => {
      const grade = academic[sub.id] || {};
      tableHtml += `
        <tr>
            <td class="text-center">${currentNo + idx}.</td>
            <td>${sub.name}</td>
            <td class="text-center">${grade.score || ''}</td>
            <td class="capaian-box">
                ${grade.descPositive ? '<p>' + grade.descPositive + '</p>' : ''}
                ${grade.descNegative ? '<p>' + grade.descNegative + '</p>' : ''}
                ${!grade.descPositive && !grade.descNegative ? '<p>-</p>' : ''}
            </td>
        </tr>
      `;
    });
    // Ekstrakurikuler
    const myEks = DB.toArray(stuEks);
    let eksHtml = '';
    if (myEks.length) {
      myEks.forEach((e, i) => {
        const masterEks = ekskuls.find(x => x.id === e.id);
        eksHtml += `
          <tr>
              <td class="text-center">${i + 1}</td>
              <td>${masterEks ? masterEks.name : '-'}</td>
              <td>${e.description || '-'}</td>
          </tr>
        `;
      });
    } else {
      eksHtml = '<tr><td colspan="3" class="text-center text-muted">Belum ada data ekstrakurikuler</td></tr>';
    }
    // Get Headmaster Name
    const kepsekName = settings.kepsekName || 'Dhani Harsyahyadi, S.H.I.';
    const headmasterNBM = settings.kepsekNBM || '';
    // Get Wali Kelas Name
    let waliKelasName = '_______________';
    if (cls.teacherId) {
      const teacher = await DB.getUser(cls.teacherId);
      if (teacher && teacher.name) waliKelasName = teacher.name;
    }
    // Generate Lampiran Karakter
    let characterRows = '';
    const scoreLabel = {
      4: 'Sangat Baik',
      3: 'Baik',
      2: 'Mulai Berkembang',
      1: 'Perlu Bimbingan'
    };
    characters.forEach((c, idx) => {
      const sc = chars[c.id]?.score;
      characterRows += `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>${c.name}</td>
          <td class="text-center">${sc ? sc : '-'}</td>
          <td>${sc ? scoreLabel[sc] : '-'}</td>
        </tr>
      `;
    });
    const lampiranHtml = `
      <div class="page" style="page-break-before: always; margin-top: 20px;">
        <h2 class="text-center" style="margin-bottom:20px;">LAMPIRAN PERKEMBANGAN KARAKTER</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 8%;">No.</th>
              <th style="width: 52%;">Aspek Karakter / Akhlak</th>
              <th style="width: 15%;">Skor (1-4)</th>
              <th style="width: 25%;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${characterRows || '<tr><td colspan="4" class="text-center text-muted">Belum ada data karakter</td></tr>'}
          </tbody>
        </table>
        <p style="font-size: 12px; color: #555; margin-top: 10px;">Keterangan Skor:<br>4 = Sangat Baik<br>3 = Baik<br>2 = Mulai Berkembang<br>1 = Perlu Bimbingan</p>
      </div>
    `;
    // Render HTML
    container.innerHTML = `
      <div class="print-actions">
        <button class="btn-action btn-close" onclick="window.close()">✖ Tutup</button>
        <button class="btn-action" onclick="window.print()">🖨️ Cetak Rapor (F4)</button>
      </div>
      <div class="page">
          <!-- Identitas Murid -->
          <table class="identity-table">
              <tr>
                  <td style="width: 15%;">Nama Murid</td>
                  <td style="width: 35%;">: <span>${student.name || '-'}</span></td>
                  <td style="width: 15%;">Kelas</td>
                  <td style="width: 35%;">: <span>${cls.name}</span></td>
              </tr>
              <tr>
                  <td>NISN / NBM</td>
                  <td>: <span>${student.nis || '-'}</span></td>
                  <td>Fase</td>
                  <td>: <span>${cls.phase || '-'}</span></td>
              </tr>
              <tr>
                  <td>Sekolah</td>
                  <td>: <span>SD Muhammadiyah 1 Sedati</span></td>
                  <td>Semester</td>
                  <td>: <span>${sem}</span></td>
              </tr>
              <tr>
                  <td>Alamat</td>
                  <td>: <span>Jl. H. Syukur No. 65, Sedati</span></td>
                  <td>Tahun Ajaran</td>
                  <td>: <span>${year}</span></td>
              </tr>
          </table>

          <!-- Tabel Mata Pelajaran Utama -->
          <table class="data-table">
              <thead>
                  <tr>
                      <th style="width: 6%;">No.</th>
                      <th style="width: 28%;">Mata Pelajaran</th>
                      <th style="width: 10%;">Nilai Akhir</th>
                      <th style="width: 56%;">Capaian Kompetensi</th>
                  </tr>
              </thead>
              <tbody>
                  ${tableHtml || '<tr><td colspan="4" class="text-center text-muted">Belum ada nilai akademik</td></tr>'}
              </tbody>
          </table>

          <!-- Kokurikuler -->
          <div class="section-header">Kokurikuler</div>
          <div class="content-box">
            ${cocu && cocu.description ? cocu.description.replace(/\\n/g, '<br>') : '-'}
          </div>

          <!-- Ekstrakurikuler -->
          <table class="data-table">
              <thead>
                  <tr>
                      <th style="width: 6%;">No.</th>
                      <th style="width: 44%;">Ekstrakurikuler</th>
                      <th style="width: 50%;">Keterangan</th>
                  </tr>
              </thead>
              <tbody>
                  ${eksHtml}
              </tbody>
          </table>

          <!-- Ketidakhadiran & Catatan Wali Kelas -->
          <div class="flex-row">
              <div class="flex-col-left">
                  <table class="attendance-table">
                      <thead>
                          <tr>
                              <th colspan="2">Ketidakhadiran</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td style="width: 60%;">Sakit</td>
                              <td>: <span>${att ? (att.sakit || 0) : 0}</span> hari</td>
                          </tr>
                          <tr>
                              <td>Izin</td>
                              <td>: <span>${att ? (att.izin || 0) : 0}</span> hari</td>
                          </tr>
                          <tr>
                              <td>Tanpa Keterangan</td>
                              <td>: <span>${att ? (att.alpa || 0) : 0}</span> hari</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
              <div class="flex-col-right">
                  <div class="section-header">Catatan Wali Kelas</div>
                  <div class="content-box" style="min-height: 88px; margin-bottom: 0;">
                    ${note && note.note ? note.note.replace(/\\n/g, '<br>') : '-'}
                  </div>
              </div>
          </div>

          <!-- Tanggapan Orang Tua/Wali Murid -->
          <div class="section-header">Tanggapan Orang Tua/Wali Murid</div>
          <div class="content-box" style="min-height: 50px;">
            ${parentResp && parentResp.response ? parentResp.response.replace(/\\n/g, '<br>') : '-'}
          </div>

          <!-- Tanda Tangan -->
          <table class="signature-table">
              <tr>
                  <td>
                      Orang Tua Murid
                      <div class="signature-space"></div>
                      ( <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> )
                  </td>
                  <td>
                      Kepala Sekolah
                      <div class="signature-space"></div>
                      ( <u>${kepsekName}</u> )
                      ${headmasterNBM ? '<br><span style="font-size: 8pt">NBM: ' + headmasterNBM + '</span>' : ''}
                  </td>
                  <td>
                      <span>Sedati</span>, <span>___ ________ ${new Date().getFullYear()}</span><br>
                      Wali Kelas
                      <div class="signature-space"></div>
                      ( <u>${waliKelasName}</u> )
                  </td>
              </tr>
          </table>
      </div>
      
      ${lampiranHtml}
    `;
  } catch (err) {
    
    container.innerHTML = '<p style="text-align:center; padding:50px; color:red;">Terjadi kesalahan: ' + err.message + '</p>';
  }
}