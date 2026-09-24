document.addEventListener('DOMContentLoaded', () => {
  const pegawaiList = document.querySelector('.pegawai-list');
  if (!pegawaiList) return;
  pegawaiList.innerHTML = '<p class="loading-text">Memuat data pegawai...</p>';
  fetch('/assets/data/data-pegawai.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      pegawaiList.innerHTML = '';
      data.forEach(pegawai => {
        const card = document.createElement('div');
        card.className = 'pegawai-card';
        card.innerHTML = `
          <div class="pegawai-photo-col">
            <img src="${pegawai.foto}" alt="${pegawai.nama}" class="pegawai-photo">
            <a href="${pegawai.tupoksi_url}" class="btn-tupoksi">Belum ada Tupoksi</a>
          </div>
          <div class="pegawai-info-col">
            <table class="pegawai-table">
              <tr>
                <th>Nama</th>
                <td>: <strong>${pegawai.nama}</strong></td>
              </tr>
              <tr>
                <th>Jabatan</th>
                <td>: ${pegawai.jabatan}</td>
              </tr>
              <tr>
                <th>Tempat Tanggal Lahir</th>
                <td>: ${pegawai.ttl}</td>
              </tr>
              <tr>
                <th>Jenis Kelamin</th>
                <td>: ${pegawai.jenis_kelamin}</td>
              </tr>
              <tr>
                <th>Pangkat Golongan</th>
                <td>: ${pegawai.pangkat_golongan}</td>
              </tr>
            </table>
            <a href="${pegawai.detail_url}" class="btn-detail-full">Lihat Detail &raquo;</a>
          </div>
        `;
        pegawaiList.appendChild(card);
      });
    })
    .catch(error => {
      console.error(error);
      pegawaiList.innerHTML = '<p class="error-text">Gagal memuat data pegawai.</p>';
    });
});
