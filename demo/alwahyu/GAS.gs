/**
 * Google Apps Script Backend for PPTQ Al Wahyu E-Ponpes
 * 
 * Paste this script into your Apps Script project linked to your Google Spreadsheet.
 * Make sure the spreadsheet has the following sheets (tabs) with these headers in row 1:
 * - users       : id, name, email, password, role
 * - santri      : id, user_id, nis, kelas, kamar, nama_ayah, nama_ibu, wa_wali, status_aktif
 * - pengurus    : id, user_id, nip, nama, jabatan, mapel
 * - pembayaran  : id, santri_id, jenis, nominal, status, bukti_transfer, tanggal
 * - hafalan     : id, santri_id, surat, ayat_awal, ayat_akhir, nilai, catatan, tanggal
 * - nilai       : id, santri_id, mapel, nilai, semester
 * - absensi     : id, santri_id, tanggal, status
 * - perizinan   : id, santri_id, jenis, keterangan, status, tanggal_pengajuan, tanggal_kembali
 * - pengumuman  : id, judul, isi, tanggal, pembuat
 * - pengaduan   : id, nama, kontak, jenis, isi, tanggal
 * - administrasi: id, layanan_type, field_0, field_1, field_2, field_3, tanggal
 */

// Handle semua requests via GET (query params) - menghindari CORS preflight
function doGet(e) {
  try {
    // Guard: e atau e.parameter bisa undefined saat diuji dari editor
    var p = (e && e.parameter) ? e.parameter : {};
    var action = p.action;
    
    if (!action) {
      return jsonResponse("error", "Action parameter is missing", null);
    }
    
    // ── READ ACTIONS ──────────────────────────────────────────
    if (action === "getDb") {
      var db = getCompleteDatabase();
      return jsonResponse("success", "Database loaded", db);
    }
    
    if (action === "getPengumuman") {
      return jsonResponse("success", "Pengumuman loaded", getSheetData("pengumuman"));
    }
    
    // ── WRITE ACTIONS (dikirim lewat GET + query params) ───────
    if (action === "login")                return handleLogin(p);
    if (action === "addSantri")            return handleAddSantri(p);
    if (action === "addPengurus")          return handleAddPengurus(p);
    if (action === "addPembayaran")        return handleAddPembayaran(p);
    if (action === "uploadBuktiTransfer")  return handleUploadBukti(p);
    if (action === "verifikasiPembayaran") return handleVerifikasiPembayaran(p);
    if (action === "inputSetoran")         return handleInputSetoran(p);
    if (action === "inputNilai")           return handleInputNilai(p);
    if (action === "inputAbsensi")         return handleInputAbsensi(p);
    if (action === "submitIzin")           return handleSubmitIzin(p);
    if (action === "updateIzinStatus")     return handleUpdateIzinStatus(p);
    if (action === "addPengumuman")        return handleAddPengumuman(p);
    if (action === "checkStatus")          return handleCheckStatus(p);
    if (action === "submitPengaduan")      return handleSubmitPengaduan(p);
    if (action === "submitAdministrasi")   return handleSubmitAdministrasi(p);
    
    return jsonResponse("error", "Unknown action: " + action, null);
    
  } catch (error) {
    return jsonResponse("error", error.toString(), null);
  }
}

// doPost tetap ada sebagai fallback (tidak dipakai frontend)
function doPost(e) {
  return doGet(e);
}

// Logika Handlers

function handleLogin(data) {
  var email = data.email;
  var password = data.password;
  
  var users = getSheetData("users");
  var user = users.find(function(u) {
    return u.email === email && u.password === password;
  });
  
  if (!user) {
    return jsonResponse("error", "Email atau password salah", null);
  }
  
  // Ambil detail tambahan sesuai role
  var extraDetails = {};
  if (user.role === "santri") {
    var santris = getSheetData("santri");
    var s = santris.find(function(item) { return String(item.user_id) === String(user.id); });
    if (s) {
      extraDetails.santriInfo = s;
    }
  } else if (user.role === "pengurus") {
    var penguruses = getSheetData("pengurus");
    var p = penguruses.find(function(item) { return String(item.user_id) === String(user.id); });
    extraDetails.pengurusInfo = p;
  }
  
  return jsonResponse("success", "Login berhasil", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    details: extraDetails
  });
}

function handleAddSantri(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tambah user baru
  var usersSheet = ss.getSheetByName("users");
  var userId = getNextId(usersSheet);
  var userEmail = data.email || (data.nis + "@alwahyu.com");
  var userPassword = data.password || "santri123";
  
  appendRowToSheet(usersSheet, {
    id: userId,
    name: data.name,
    email: userEmail,
    password: userPassword,
    role: "santri"
  });
  
  // 2. Tambah santri baru
  var santriSheet = ss.getSheetByName("santri");
  var santriId = getNextId(santriSheet);
  appendRowToSheet(santriSheet, {
    id: santriId,
    user_id: userId,
    nis: data.nis,
    kelas: data.kelas,
    kamar: data.kamar,
    nama_ayah: data.nama_ayah,
    nama_ibu: data.nama_ibu,
    wa_wali: data.wa_wali,
    status_aktif: "Menunggu Ujian Seleksi"
  });
  
  return jsonResponse("success", "Santri berhasil ditambahkan", { id: santriId, user_id: userId });
}

function handleAddPengurus(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tambah user baru
  var usersSheet = ss.getSheetByName("users");
  var userId = getNextId(usersSheet);
  
  appendRowToSheet(usersSheet, {
    id: userId,
    name: data.name,
    email: data.email,
    password: data.password || "pengurus123",
    role: "pengurus"
  });
  
  // 2. Tambah pengurus baru
  var pengurusSheet = ss.getSheetByName("pengurus");
  var pengurusId = getNextId(pengurusSheet);
  appendRowToSheet(pengurusSheet, {
    id: pengurusId,
    user_id: userId,
    nip: data.nip,
    nama: data.name,
    jabatan: data.jabatan,
    mapel: data.mapel
  });
  
  return jsonResponse("success", "Pengurus berhasil ditambahkan", { id: pengurusId, user_id: userId });
}

function handleAddPembayaran(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pembayaran");
  var newId = getNextId(sheet);
  
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  appendRowToSheet(sheet, {
    id: newId,
    santri_id: data.santri_id,
    jenis: data.jenis,
    nominal: data.nominal,
    status: "Belum Bayar",
    bukti_transfer: "-",
    tanggal: dateStr
  });
  
  return jsonResponse("success", "Tagihan berhasil dibuat", { id: newId });
}

function handleUploadBukti(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pembayaran");
  var idToUpdate = String(data.id);
  
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  var statusColIndex = headers.indexOf("status") + 1;
  var buktiColIndex = headers.indexOf("bukti_transfer") + 1;
  
  var rows = sheet.getLastRow();
  var found = false;
  
  for (var i = 2; i <= rows; i++) {
    if (String(sheet.getRange(i, idColIndex).getValue()) === idToUpdate) {
      sheet.getRange(i, statusColIndex).setValue("Menunggu Verifikasi");
      sheet.getRange(i, buktiColIndex).setValue(data.bukti_transfer || "bukti_bayar.jpg");
      found = true;
      break;
    }
  }
  
  if (found) {
    return jsonResponse("success", "Bukti transfer berhasil diunggah", null);
  } else {
    return jsonResponse("error", "Data tagihan tidak ditemukan", null);
  }
}

function handleVerifikasiPembayaran(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pembayaran");
  var idToUpdate = String(data.id);
  var status = data.status; // Lunas atau Ditolak
  
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  var statusColIndex = headers.indexOf("status") + 1;
  
  var rows = sheet.getLastRow();
  var found = false;
  
  for (var i = 2; i <= rows; i++) {
    if (String(sheet.getRange(i, idColIndex).getValue()) === idToUpdate) {
      sheet.getRange(i, statusColIndex).setValue(status);
      found = true;
      break;
    }
  }
  
  if (found) {
    return jsonResponse("success", "Verifikasi status " + status + " berhasil disimpan", null);
  } else {
    return jsonResponse("error", "Data tagihan tidak ditemukan", null);
  }
}

function handleInputSetoran(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("hafalan");
  var newId = getNextId(sheet);
  
  var dateStr = data.tanggal || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  appendRowToSheet(sheet, {
    id: newId,
    santri_id: data.santri_id,
    surat: data.surat,
    ayat_awal: data.ayat_awal,
    ayat_akhir: data.ayat_akhir,
    nilai: data.nilai,
    catatan: data.catatan || "",
    tanggal: dateStr
  });
  
  return jsonResponse("success", "Setoran hafalan berhasil dicatat", { id: newId });
}

function handleInputNilai(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("nilai");
  
  // Cek apakah data nilai mapel & semester ini sudah ada untuk santri tersebut. Jika ya, timpa. Jika tidak, buat baru.
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  var santriColIndex = headers.indexOf("santri_id") + 1;
  var mapelColIndex = headers.indexOf("mapel") + 1;
  var nilaiColIndex = headers.indexOf("nilai") + 1;
  var semesterColIndex = headers.indexOf("semester") + 1;
  
  var rows = sheet.getLastRow();
  var foundRow = -1;
  
  for (var i = 2; i <= rows; i++) {
    var checkSantri = String(sheet.getRange(i, santriColIndex).getValue());
    var checkMapel = String(sheet.getRange(i, mapelColIndex).getValue());
    var checkSem = String(sheet.getRange(i, semesterColIndex).getValue());
    
    if (checkSantri === String(data.santri_id) && 
        checkMapel.toLowerCase() === String(data.mapel).toLowerCase() && 
        checkSem.toLowerCase() === String(data.semester).toLowerCase()) {
      foundRow = i;
      break;
    }
  }
  
  if (foundRow !== -1) {
    sheet.getRange(foundRow, nilaiColIndex).setValue(data.nilai);
    return jsonResponse("success", "Nilai akademik berhasil diperbarui", { id: sheet.getRange(foundRow, idColIndex).getValue() });
  } else {
    var newId = getNextId(sheet);
    appendRowToSheet(sheet, {
      id: newId,
      santri_id: data.santri_id,
      mapel: data.mapel,
      nilai: data.nilai,
      semester: data.semester
    });
    return jsonResponse("success", "Nilai akademik berhasil disimpan", { id: newId });
  }
}

function handleInputAbsensi(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("absensi");
  
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  var santriColIndex = headers.indexOf("santri_id") + 1;
  var dateColIndex = headers.indexOf("tanggal") + 1;
  var statusColIndex = headers.indexOf("status") + 1;
  
  var rows = sheet.getLastRow();
  var foundRow = -1;
  
  for (var i = 2; i <= rows; i++) {
    var checkSantri = String(sheet.getRange(i, santriColIndex).getValue());
    var checkDate = String(sheet.getRange(i, dateColIndex).getValue());
    
    // Cek format tanggal (YYYY-MM-DD)
    if (checkDate.indexOf("T") !== -1) checkDate = checkDate.split("T")[0];
    var targetDate = data.tanggal;
    if (targetDate.indexOf("T") !== -1) targetDate = targetDate.split("T")[0];
    
    if (checkSantri === String(data.santri_id) && checkDate === targetDate) {
      foundRow = i;
      break;
    }
  }
  
  if (foundRow !== -1) {
    sheet.getRange(foundRow, statusColIndex).setValue(data.status);
    return jsonResponse("success", "Absensi berhasil diperbarui", { id: sheet.getRange(foundRow, idColIndex).getValue() });
  } else {
    var newId = getNextId(sheet);
    appendRowToSheet(sheet, {
      id: newId,
      santri_id: data.santri_id,
      tanggal: data.tanggal,
      status: data.status
    });
    return jsonResponse("success", "Absensi berhasil disimpan", { id: newId });
  }
}

function handleSubmitIzin(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("perizinan");
  var newId = getNextId(sheet);
  
  var reqDateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  appendRowToSheet(sheet, {
    id: newId,
    santri_id: data.santri_id,
    jenis: data.jenis,
    keterangan: data.keterangan,
    status: "Dalam Pengajuan",
    tanggal_pengajuan: reqDateStr,
    tanggal_kembali: data.tanggal_kembali
  });
  
  return jsonResponse("success", "Permohonan izin berhasil diajukan", { id: newId });
}

function handleUpdateIzinStatus(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("perizinan");
  var idToUpdate = String(data.id);
  var status = data.status; // Disetujui, Ditolak, Selesai
  
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  var statusColIndex = headers.indexOf("status") + 1;
  
  var rows = sheet.getLastRow();
  var found = false;
  
  for (var i = 2; i <= rows; i++) {
    if (String(sheet.getRange(i, idColIndex).getValue()) === idToUpdate) {
      sheet.getRange(i, statusColIndex).setValue(status);
      found = true;
      break;
    }
  }
  
  if (found) {
    return jsonResponse("success", "Status izin diperbarui menjadi " + status, null);
  } else {
    return jsonResponse("error", "Data izin tidak ditemukan", null);
  }
}

function handleAddPengumuman(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("pengumuman");
  var newId = getNextId(sheet);
  
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
  
  appendRowToSheet(sheet, {
    id: newId,
    judul: data.judul,
    isi: data.isi,
    tanggal: dateStr,
    pembuat: data.pembuat || "Admin"
  });
  
  return jsonResponse("success", "Pengumuman berhasil dipublikasikan", { id: newId });
}

function handleCheckStatus(data) {
  var query = (data.query || "").trim().toLowerCase();
  if (!query) {
    return jsonResponse("error", "Query parameter is empty", null);
  }
  
  var santris = getSheetData("santri");
  var users = getSheetData("users");
  
  var foundSantri = null;
  for (var i = 0; i < santris.length; i++) {
    var s = santris[i];
    if (String(s.nis).toLowerCase() === query) {
      foundSantri = s;
      break;
    }
  }
  
  if (!foundSantri) {
    var foundUser = users.find(function(u) {
      return String(u.email).toLowerCase() === query;
    });
    if (foundUser) {
      foundSantri = santris.find(function(s) {
        return String(s.user_id) === String(foundUser.id);
      });
    }
  }
  
  if (!foundSantri) {
    return jsonResponse("error", "Data tidak ditemukan", null);
  }
  
  var assocUser = users.find(function(u) {
    return String(u.id) === String(foundSantri.user_id);
  });
  
  return jsonResponse("success", "Data ditemukan", {
    name: assocUser ? assocUser.name : "Santri",
    nis: foundSantri.nis,
    kelas: foundSantri.kelas,
    status_aktif: foundSantri.status_aktif || "Menunggu Ujian Seleksi"
  });
}

function handleSubmitPengaduan(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("pengaduan");
  
  if (!sheet) {
    sheet = ss.insertSheet("pengaduan");
    sheet.appendRow(["id", "nama", "kontak", "jenis", "isi", "tanggal"]);
  }
  
  var newId = getNextId(sheet);
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  
  appendRowToSheet(sheet, {
    id: newId,
    nama: data.nama || "-",
    kontak: data.kontak || "-",
    jenis: data.jenis || "Pengaduan",
    isi: data.isi || "-",
    tanggal: dateStr
  });
  
  return jsonResponse("success", "Pengaduan berhasil disimpan", { id: newId });
}

function handleSubmitAdministrasi(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("administrasi");
  
  if (!sheet) {
    sheet = ss.insertSheet("administrasi");
    sheet.appendRow(["id", "layanan_type", "field_0", "field_1", "field_2", "field_3", "tanggal"]);
  }
  
  var newId = getNextId(sheet);
  var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  
  appendRowToSheet(sheet, {
    id: newId,
    layanan_type: data.layanan_type || "Administrasi",
    field_0: data.field_0 || "-",
    field_1: data.field_1 || "-",
    field_2: data.field_2 || "-",
    field_3: data.field_3 || "-",
    tanggal: dateStr
  });
  
  return jsonResponse("success", "Permohonan administrasi berhasil disimpan", { id: newId });
}

// Database Helpers

function getCompleteDatabase() {
  return {
    users: getSheetData("users"),
    santri: getSheetData("santri"),
    pengurus: getSheetData("pengurus"),
    pembayaran: getSheetData("pembayaran"),
    hafalan: getSheetData("hafalan"),
    nilai: getSheetData("nilai"),
    absensi: getSheetData("absensi"),
    perizinan: getSheetData("perizinan"),
    pengumuman: getSheetData("pengumuman")
  };
}

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return [];
  }
  
  var rows = sheet.getLastRow();
  if (rows <= 1) {
    return [];
  }
  
  var cols = sheet.getLastColumn();
  var data = sheet.getRange(2, 1, rows - 1, cols).getValues();
  var headers = getHeaders(sheet);
  
  var result = [];
  
  for (var r = 0; r < data.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var val = data[r][c];
      
      // Format tanggal ke String YYYY-MM-DD
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "GMT+7", "yyyy-MM-dd");
      }
      obj[headers[c]] = val;
    }
    result.push(obj);
  }
  
  return result;
}

function getHeaders(sheet) {
  var cols = sheet.getLastColumn();
  if (cols === 0) return [];
  return sheet.getRange(1, 1, 1, cols).getValues()[0];
}

function getNextId(sheet) {
  var rows = sheet.getLastRow();
  if (rows <= 1) return 1;
  
  var headers = getHeaders(sheet);
  var idColIndex = headers.indexOf("id") + 1;
  
  if (idColIndex === 0) return rows;
  
  var ids = sheet.getRange(2, idColIndex, rows - 1, 1).getValues();
  var maxId = 0;
  
  for (var i = 0; i < ids.length; i++) {
    var currentId = parseInt(ids[i][0], 10);
    if (!isNaN(currentId) && currentId > maxId) {
      maxId = currentId;
    }
  }
  
  return maxId + 1;
}

function appendRowToSheet(sheet, dataObj) {
  var headers = getHeaders(sheet);
  var newRowValues = [];
  
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    newRowValues.push(dataObj[header] !== undefined ? dataObj[header] : "");
  }
  
  sheet.appendRow(newRowValues);
}

function jsonResponse(status, message, data) {
  var response = {
    status: status,
    message: message,
    data: data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
