// Konfigurasi nama spreadsheet dan sheet
const SPREADSHEET_ID = '1-2hZMrkXtCRS7iScdGlSzgtQt-Ppv1V3MsWWZpJzJI8';
// Nama Sheet
const SHEET_BIODATA = "Data Santri";
const SHEET_WALI = "Data Wali";
const SHEET_KEUANGAN = "Data Keuangan";
const SHEET_ABSENSI = "Data Absensi";
const SHEET_PELANGGARAN = "Data Pelanggaran";
const SHEET_RAPORT = "Data Raport";
const SHEET_PENGURUS = "Data Pengurus";

function doPost(e) {
  const action = e.parameter.action;
  
  try {
    switch(action) {
      // Login
      case 'login_wali': return loginWali(e);
      case 'login_pengurus': return loginPengurus(e);
      
      // Wali Santri
      case 'getAllDataSantri': return getAllDataSantri(e);
      
      // Pengurus
      case 'getDashboardData': return getDashboardData(e);
      case 'getDaftarSantri': return getDaftarSantri(e);
      
      // Keuangan
      case 'simpanKeuangan': return simpanKeuangan(e);
      case 'getDataKeuangan': return getDataKeuangan(e);
      
      // Absensi
      case 'simpanAbsensi': return simpanAbsensi(e);
      case 'getDataAbsensi': return getDataAbsensi(e);
      
      // Pelanggaran
      case 'simpanPelanggaran': return simpanPelanggaran(e);
      case 'getDataPelanggaran': return getDataPelanggaran(e);
      
      // Raport
      case 'simpanRaport': return simpanRaport(e);
      case 'getDataRaport': return getDataRaport(e);
      
      // Pengurus
      case 'tambahPengurus': return tambahPengurus(e);
      case 'getDaftarPengurus': return getDaftarPengurus(e);
      
      // Hapus Data
      case 'hapusData': return hapusData(e);
      
      default: return createResponse('error', 'Aksi tidak dikenali');
    }
  } catch(error) {
    return createResponse('error', error.message);
  }
}

// Fungsi Bantu: Buat Response JSON
function createResponse(status, message, data = null) {
  const response = { status: status, message: message };
  if(data) response.data = data;
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// === LOGIN WALI SANTRI ===
function loginWali(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WALI);
  const data = sheet.getDataRange().getValues();
  
  for(let i=1; i<data.length; i++) {
    if(data[i][2] === username && data[i][3] === password) {
      return createResponse('success', 'Login berhasil', {
        id_wali: data[i][0],
        nama: data[i][1],
        id_santri: data[i][4]
      });
    }
  }
  return createResponse('error', 'Username atau password salah');
}

// === LOGIN PENGURUS ===
function loginPengurus(e) {
  const username = e.parameter.username;
  const password = e.parameter.password;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGURUS);
  const data = sheet.getDataRange().getValues();
  
  for(let i=1; i<data.length; i++) {
    if(data[i][2] === username && data[i][3] === password) {
      return createResponse('success', 'Login berhasil', {
        id_akun: data[i][0],
        nama: data[i][1],
        username: data[i][2],
        bidang: data[i][4],
        no_hp: data[i][5]
      });
    }
  }
  return createResponse('error', 'Username atau password salah');
}

// === AMBIL SEMUA DATA SANTRI (UNTUK WALI) ===
function getAllDataSantri(e) {
  const idSantri = e.parameter.id_santri;
  
  // Ambil Biodata
  const sheetBiodata = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_BIODATA);
  const dataBiodata = sheetBiodata.getDataRange().getValues();
  let biodata = {};
  
  for(let i=1; i<dataBiodata.length; i++) {
    if(dataBiodata[i][0] === idSantri) {
      biodata = {
        id_santri: dataBiodata[i][0],
        nama: dataBiodata[i][1],
        tempat_lahir: dataBiodata[i][2],
        tanggal_lahir: dataBiodata[i][3],
        jenjang: dataBiodata[i][4],
        kelas: dataBiodata[i][5],
        asrama: dataBiodata[i][6],
        no_kamar: dataBiodata[i][7],
        alamat: dataBiodata[i][8]
      };
      break;
    }
  }
  
  // Ambil Keuangan
  const sheetKeuangan = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_KEUANGAN);
  const dataKeuangan = sheetKeuangan.getDataRange().getValues();
  const keuanganHistori = [];
  let keuanganTerbaru = {};
  
  for(let i=1; i<dataKeuangan.length; i++) {
    if(dataKeuangan[i][1] === idSantri) {
      const item = {
        bulan: dataKeuangan[i][2],
        nominal: Number(dataKeuangan[i][3]),
        status: dataKeuangan[i][4],
        tempo: dataKeuangan[i][5],
        tanggal_bayar: dataKeuangan[i][6]
      };
      keuanganHistori.push(item);
      if(!keuanganTerbaru.bulan || item.bulan > keuanganTerbaru.bulan) {
        keuanganTerbaru = item;
      }
    }
  }
  
  // Ambil Absensi
  const sheetAbsensi = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ABSENSI);
  const dataAbsensi = sheetAbsensi.getDataRange().getValues();
  const absensiDetail = [];
  const absensiRingkasan = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
  const bulanSekarang = new Date().toISOString().slice(0, 7);
  let absensiBulan = bulanSekarang;
  
  for(let i=1; i<dataAbsensi.length; i++) {
    if(dataAbsensi[i][1] === idSantri) {
      const tanggal = dataAbsensi[i][2];
      const bulan = tanggal.slice(0, 7);
      const hari = new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long' });
      const status = dataAbsensi[i][3];
      
      absensiDetail.push({
        tanggal: tanggal,
        hari: hari,
        status: status,
        keterangan: dataAbsensi[i][4]
      });
      
      if(bulan === bulanSekarang) {
        if(status === 'Hadir') absensiRingkasan.hadir++;
        else if(status === 'Sakit') absensiRingkasan.sakit++;
        else if(status === 'Izin') absensiRingkasan.izin++;
        else if(status === 'Alpa') absensiRingkasan.alpa++;
      }
    }
  }
  
  // Ambil Pelanggaran
  const sheetPelanggaran = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PELANGGARAN);
  const dataPelanggaran = sheetPelanggaran.getDataRange().getValues();
  const pelanggaranDetail = [];
  
  for(let i=1; i<dataPelanggaran.length; i++) {
    if(dataPelanggaran[i][1] === idSantri) {
      pelanggaranDetail.push({
        tanggal: dataPelanggaran[i][2],
        jenis: dataPelanggaran[i][3],
        tingkat: dataPelanggaran[i][4],
        sanksi: dataPelanggaran[i][5],
        status: dataPelanggaran[i][6]
      });
    }
  }
  
  // Ambil Raport
  const sheetRaport = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_RAPORT);
  const dataRaport = sheetRaport.getDataRange().getValues();
  const raportDetail = [];
  const raportRingkasan = {};
  const raportChart = { labels: [], data: [] };
  const raportCatatan = {};
  
  for(let i=1; i<dataRaport.length; i++) {
    if(dataRaport[i][1] === idSantri) {
      const nilaiDetail = JSON.parse(dataRaport[i][3]);
      nilaiDetail.forEach(item => {
        raportDetail.push(item);
        raportChart.labels.push(item.mapel);
        raportChart.data.push(Number(item.nilai));
      });
      
      raportRingkasan.semester = dataRaport[i][2];
      raportRingkasan.rata_akademik = dataRaport[i][4];
      raportRingkasan.nilai_keagamaan = dataRaport[i][5];
      raportRingkasan.nilai_sikap = dataRaport[i][6];
      raportRingkasan.prestasi = dataRaport[i][7];
      
      raportCatatan.guru = dataRaport[i][8];
      raportCatatan.nama_guru = dataRaport[i][9];
      break;
    }
  }
  
  return createResponse('success', 'Data berhasil dimuat', {
    biodata: biodata,
    keuangan: {
      terbaru: keuanganTerbaru,
      histori: keuanganHistori
    },
    absensi: {
      bulan: absensiBulan,
      ringkasan: absensiRingkasan,
      detail: absensiDetail
    },
    pelanggaran: {
      jumlah: pelanggaranDetail.length,
      detail: pelanggaranDetail
    },
    raport: {
      ringkasan: raportRingkasan,
      detail: raportDetail,
      chart: raportChart,
      catatan: raportCatatan
    }
  });
}

// === DASHBOARD PENGURUS ===
function getDashboardData(e) {
  const bidang = e.parameter.bidang;
  const sheetSantri = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_BIODATA);
  const totalSantri = sheetSantri.getLastRow() - 1;
  
  let summaryLabel = '';
  let summaryValue = 0;
  
  if(bidang === 'keuangan') {
    const sheetKeuangan = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_KEUANGAN);
    const dataKeuangan = sheetKeuangan.getDataRange().getValues();
    const bulanSekarang = new Date().toISOString().slice(0, 7);
    
    for(let i=1; i<dataKeuangan.length; i++) {
      if(dataKeuangan[i][2] === bulanSekarang && dataKeuangan[i][4] === 'Belum Dibayar') {
        summaryValue++;
      }
    }
    summaryLabel = 'Santri Belum Bayar';
  } else if(bidang === 'absensi') {
    const sheetAbsensi = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ABSENSI);
    const dataAbsensi = sheetAbsensi.getDataRange().getValues();
    const tanggalHariIni = new Date().toISOString().slice(0, 10);
    
    for(let i=1; i<dataAbsensi.length; i++) {
      if(dataAbsensi[i][2] === tanggalHariIni && (dataAbsensi[i][3] === 'Alpa' || dataAbsensi[i][3] === 'Sakit')) {
        summaryValue++;
      }
    }
    summaryLabel = 'Santri Tidak Hadir';
  } else if(bidang === 'pelanggaran') {
    const sheetPelanggaran = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PELANGGARAN);
    const dataPelanggaran = sheetPelanggaran.getDataRange().getValues();
    const bulanSekarang = new Date().toISOString().slice(0, 7);
    
    for(let i=1; i<dataPelanggaran.length; i++) {
      const tanggal = dataPelanggaran[i][2];
      const bulan = tanggal.slice(0, 7);
      if(bulan === bulanSekarang) {
        summaryValue++;
      }
    }
    summaryLabel = 'Pelanggaran Bulan Ini';
  } else if(bidang === 'raport') {
    const sheetRaport = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_RAPORT);
    const dataRaport = sheetRaport.getDataRange().getValues();
    const semesterAktif = 'Semester 1 (2025/2026)'; // Sesuaikan dengan semester aktif
    
    for(let i=1; i<dataRaport.length; i++) {
      if(dataRaport[i][2] === semesterAktif) {
        summaryValue++;
      }
    }
    summaryLabel = 'Raport Sudah Diupload';
  } else if(bidang === 'admin') {
    const sheetPengurus = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGURUS);
    summaryValue = sheetPengurus.getLastRow() - 1;
    summaryLabel = 'Total Pengurus';
  }
  
  return createResponse('success', 'Data dashboard berhasil dimuat', {
    total_santri: totalSantri,
    summary_label: summaryLabel,
    summary_value: summaryValue
  });
}

// === DAFTAR SANTRI ===
function getDaftarSantri(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_BIODATA);
  const data = sheet.getDataRange().getValues();
  const daftar = [];
  
  for(let i=1; i<data.length; i++) {
    // Ambil nama wali dari sheet Data Wali
    const sheetWali = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_WALI);
    const dataWali = sheetWali.getDataRange().getValues();
    let namaWali = '-';
    let noHpWali = '-';
    
    for(let j=1; j<dataWali.length; j++) {
      if(dataWali[j][4] === data[i][0]) {
        namaWali = dataWali[j][1];
        noHpWali = dataWali[j][5];
        break;
      }
    }
    
    daftar.push({
      id_santri: data[i][0],
      nama: data[i][1],
      jenjang: data[i][4],
      kelas: data[i][5],
      nama_wali: namaWali,
      no_hp_wali: noHpWali
    });
  }
  
  return createResponse('success', 'Daftar santri berhasil dimuat', daftar);
}

// === MANAJEMEN KEUANGAN ===
function simpanKeuangan(e) {
  const idSantri = e.parameter.id_santri;
  const bulan = e.parameter.bulan;
  const nominal = Number(e.parameter.nominal);
  const status = e.parameter.status;
  const tanggalBayar = e.parameter.tanggal_bayar;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_KEUANGAN);
  const data = sheet.getDataRange().getValues();
  let isUpdate = false;
  
  // Cek apakah data sudah ada
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri && data[i][2] === bulan) {
      sheet.getRange(i+1, 4).setValue(nominal);
      sheet.getRange(i+1, 5).setValue(status);
      sheet.getRange(i+1, 7).setValue(tanggalBayar);
      isUpdate = true;
      break;
    }
  }
  
  // Tambah data baru jika tidak ada
  if(!isUpdate) {
    const lastRow = sheet.getLastRow() + 1;
    const tempo = new Date(bulan + '-01');
    tempo.setMonth(tempo.getMonth() + 1);
    tempo.setDate(tempo.getDate() - 5);
    const tempoFormatted = tempo.toISOString().slice(0, 10);
    
    sheet.getRange(lastRow, 1).setValue('KEU-' + new Date().getTime());
    sheet.getRange(lastRow, 2).setValue(idSantri);
    sheet.getRange(lastRow, 3).setValue(bulan);
    sheet.getRange(lastRow, 4).setValue(nominal);
    sheet.getRange(lastRow, 5).setValue(status);
    sheet.getRange(lastRow, 6).setValue(tempoFormatted);
    sheet.getRange(lastRow, 7).setValue(tanggalBayar);
    sheet.getRange(lastRow, 8).setValue(new Date().toISOString().slice(0, 10));
  }
  
  SpreadsheetApp.flush();
  return createResponse('success', isUpdate ? 'Data keuangan berhasil diupdate' : 'Data keuangan berhasil disimpan');
}

function getDataKeuangan(e) {
  const idSantri = e.parameter.id_santri;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_KEUANGAN);
  const data = sheet.getDataRange().getValues();
  const hasil = [];
  
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri) {
      hasil.push({
        id_keuangan: data[i][0],
        tanggal_input: data[i][8],
        bulan: data[i][2],
        nominal: Number(data[i][3]),
        status: data[i][4],
        tanggal_bayar: data[i][7]
      });
    }
  }
  
  return createResponse('success', 'Data keuangan berhasil dimuat', hasil);
}

// === MANAJEMEN ABSENSI ===
function simpanAbsensi(e) {
  const idSantri = e.parameter.id_santri;
  const tanggal = e.parameter.tanggal;
  const status = e.parameter.status;
  const keterangan = e.parameter.keterangan;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ABSENSI);
  const data = sheet.getDataRange().getValues();
  let isUpdate = false;
  
  // Cek apakah data sudah ada
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri && data[i][2] === tanggal) {
      sheet.getRange(i+1, 4).setValue(status);
      sheet.getRange(i+1, 5).setValue(keterangan);
      isUpdate = true;
      break;
    }
  }
  
  // Tambah data baru jika tidak ada
  if(!isUpdate) {
    const lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1).setValue('ABS-' + new Date().getTime());
    sheet.getRange(lastRow, 2).setValue(idSantri);
    sheet.getRange(lastRow, 3).setValue(tanggal);
    sheet.getRange(lastRow, 4).setValue(status);
    sheet.getRange(lastRow, 5).setValue(keterangan);
  }
  
  SpreadsheetApp.flush();
  return createResponse('success', isUpdate ? 'Data absensi berhasil diupdate' : 'Data absensi berhasil disimpan');
}

function getDataAbsensi(e) {
  const idSantri = e.parameter.id_santri;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_ABSENSI);
  const data = sheet.getDataRange().getValues();
  const hasil = [];
  
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri) {
      hasil.push({
        id_absensi: data[i][0],
        tanggal: data[i][2],
        status: data[i][3],
        keterangan: data[i][4]
      });
    }
  }
  
  return createResponse('success', 'Data absensi berhasil dimuat', hasil);
}

// === MANAJEMEN PELANGGARAN ===
function simpanPelanggaran(e) {
  const idSantri = e.parameter.id_santri;
  const tanggal = e.parameter.tanggal;
  const jenis = e.parameter.jenis;
  const tingkat = e.parameter.tingkat;
  const sanksi = e.parameter.sanksi;
  const status = e.parameter.status;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PELANGGARAN);
  const lastRow = sheet.getLastRow() + 1;
  
  sheet.getRange(lastRow, 1).setValue('PEL-' + new Date().getTime());
  sheet.getRange(lastRow, 2).setValue(idSantri);
  sheet.getRange(lastRow, 3).setValue(tanggal);
  sheet.getRange(lastRow, 4).setValue(jenis);
  sheet.getRange(lastRow, 5).setValue(tingkat);
  sheet.getRange(lastRow, 6).setValue(sanksi);
  sheet.getRange(lastRow, 7).setValue(status);
  
  SpreadsheetApp.flush();
  return createResponse('success', 'Data pelanggaran berhasil disimpan');
}

function getDataPelanggaran(e) {
  const idSantri = e.parameter.id_santri;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PELANGGARAN);
  const data = sheet.getDataRange().getValues();
  const hasil = [];
  
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri) {
      hasil.push({
        id_pelanggaran: data[i][0],
        tanggal: data[i][2],
        jenis: data[i][3],
        tingkat: data[i][4],
        sanksi: data[i][5],
        status: data[i][6]
      });
    }
  }
  
  return createResponse('success', 'Data pelanggaran berhasil dimuat', hasil);
}

// === MANAJEMEN RAPORT ===
function simpanRaport(e) {
  const idSantri = e.parameter.id_santri;
  const semester = e.parameter.semester;
  const nilaiDetail = e.parameter.nilai_detail;
  const catatan = e.parameter.catatan;
  const namaGuru = e.parameter.nama_guru;
  
  // Hitung rata-rata akademik dan nilai keagamaan
  const nilaiArray = JSON.parse(nilaiDetail);
  let totalNilai = 0;
  let nilaiKeagamaan = 0;
  
  nilaiArray.forEach(item => {
    totalNilai += Number(item.nilai);
    if(item.mapel === 'Aqidah Akhlak' || item.mapel === 'Bahasa Arab') {
      nilaiKeagamaan += Number(item.nilai);
    }
  });
  
  const rataRata = Math.round((totalNilai / nilaiArray.length) * 100) / 100;
  nilaiKeagamaan = Math.round((nilaiKeagamaan / 2) * 100) / 100;
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_RAPORT);
  const lastRow = sheet.getLastRow() + 1;
  
  sheet.getRange(lastRow, 1).setValue('RAP-' + new Date().getTime());
  sheet.getRange(lastRow, 2).setValue(idSantri);
  sheet.getRange(lastRow, 3).setValue(semester);
  sheet.getRange(lastRow, 4).setValue(nilaiDetail);
  sheet.getRange(lastRow, 5).setValue(rataRata);
  sheet.getRange(lastRow, 6).setValue(nilaiKeagamaan);
  sheet.getRange(lastRow, 7).setValue('Baik'); // Nilai sikap default
  sheet.getRange(lastRow, 8).setValue('-'); // Prestasi default
  sheet.getRange(lastRow, 9).setValue(catatan);
  sheet.getRange(lastRow, 10).setValue(namaGuru);
  
  SpreadsheetApp.flush();
  return createResponse('success', 'Data raport berhasil disimpan');
}

function getDataRaport(e) {
  const idSantri = e.parameter.id_santri;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_RAPORT);
  const data = sheet.getDataRange().getValues();
  const hasil = [];
  
  for(let i=1; i<data.length; i++) {
    if(data[i][1] === idSantri) {
      hasil.push({
        id_raport: data[i][0],
        semester: data[i][2],
        rata_rata_akademik: data[i][4],
        nilai_keagamaan: data[i][5],
        catatan: data[i][8]
      });
    }
  }
  
  return createResponse('success', 'Data raport berhasil dimuat', hasil);
}

// === MANAJEMEN PENGURUS ===
function tambahPengurus(e) {
  const nama = e.parameter.nama;
  const username = e.parameter.username;
  const bidang = e.parameter.bidang;
  const nohp = e.parameter.nohp;
  
  // Cek username duplikat
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGURUS);
  const data = sheet.getDataRange().getValues();
  
  for(let i=1; i<data.length; i++) {
    if(data[i][2] === username) {
      return createResponse('error', 'Username sudah digunakan');
    }
  }
  
  // Password default: 6 digit terakhir no HP
  const password = nohp.slice(-6);
  const lastRow = sheet.getLastRow() + 1;
  
  sheet.getRange(lastRow, 1).setValue('AKN-' + new Date().getTime());
  sheet.getRange(lastRow, 2).setValue(nama);
  sheet.getRange(lastRow, 3).setValue(username);
  sheet.getRange(lastRow, 4).setValue(password);
  sheet.getRange(lastRow, 5).setValue(bidang);
  sheet.getRange(lastRow, 6).setValue(nohp);
  
  SpreadsheetApp.flush();
  return createResponse('success', `Akun pengurus berhasil dibuat. Password default: ${password}`);
}

function getDaftarPengurus(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_PENGURUS);
  const data = sheet.getDataRange().getValues();
  const hasil = [];
  
  for(let i=1; i<data.length; i++) {
    hasil.push({
      id_akun: data[i][0],
      nama: data[i][1],
      username: data[i][2],
      bidang: data[i][4],
      no_hp: data[i][5]
    });
  }
  
  return createResponse('success', 'Daftar pengurus berhasil dimuat', hasil);
}

// === HAPUS DATA ===
function hapusData(e) {
  const tipe = e.parameter.tipe;
  const id = e.parameter.id;
  
  let sheetName = '';
  let idKolom = 0; // Kolom di mana ID data disimpan (dimulai dari 1)
  
  switch(tipe) {
    case 'keuangan':
      sheetName = SHEET_KEUANGAN;
      idKolom = 1;
      break;
    case 'absensi':
      sheetName = SHEET_ABSENSI;
      idKolom = 1;
      break;
    case 'pelanggaran':
      sheetName = SHEET_PELANGGARAN;
      idKolom = 1;
      break;
    case 'raport':
      sheetName = SHEET_RAPORT;
      idKolom = 1;
      break;
    case 'pengurus':
      sheetName = SHEET_PENGURUS;
      idKolom = 1;
      break;
    default:
      return createResponse('error', 'Tipe data tidak dikenali');
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  let rowToDelete = -1;
  
  // Cari baris yang akan dihapus
  for(let i=1; i<data.length; i++) {
    if(data[i][idKolom - 1] === id) { // Karena array JavaScript dimulai dari 0
      rowToDelete = i + 1; // Karena baris spreadsheet dimulai dari 1
      break;
    }
  }
  
  if(rowToDelete === -1) {
    return createResponse('error', 'Data tidak ditemukan');
  }
  
  sheet.deleteRow(rowToDelete);
  SpreadsheetApp.flush();
  return createResponse('success', `Data ${tipe} berhasil dihapus`);
}
