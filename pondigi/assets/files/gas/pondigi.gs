// CONFIGURASI
const SPREADSHEET_ID = '1-2hZMrkXtCRS7iScdGlSzgtQt-Ppv1V3MsWWZpJzJI8';
const SHEET_NAMES = {
    SANTRI: 'Santri',
    KEUANGAN: 'Keuangan',
    ABSENSI: 'Absensi',
    PELANGGARAN: 'Pelanggaran',
    RAPORT: 'Raport',
    PENGURUS: 'Pengurus',
    WALI: 'Wali'
};
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_FORMAT_REGEX = /^\d{4}-\d{2}$/;

// Fungsi bantu untuk mengubah nama kolom menjadi camelCase
function toCamelCase(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

// Fungsi bantu untuk enkripsi password SHA-256
function hashPassword(password) {
    if (!password) return '';
    return Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        password,
        Utilities.Charset.UTF_8
    ).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

// Fungsi bantu untuk memvalidasi dan mengonversi tanggal
function validateDate(dateValue) {
    if (!dateValue) return null;
    const tgl = new Date(dateValue);
    return isNaN(tgl.getTime()) ? null : tgl;
}

// Fungsi utama untuk menangani request dari frontend
function doPost(e) {
    try {
        const action = e.parameter.action;
        if (!action) {
            return ContentService.createTextOutput(JSON.stringify({
                success: false,
                message: 'Parameter action tidak ditemukan'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        let result;
        switch(action) {
            // === LOGIN ===
            case 'loginPengurus':
                result = loginPengurus(e.parameter.username, e.parameter.password);
                break;
            case 'loginWali':
                result = loginWali(e.parameter.username, e.parameter.password);
                break;

            // === DASHBOARD PENGURUS ===
            case 'getDashboardData':
                result = getDashboardData();
                break;

            // === MANAJEMEN SANTRI ===
            case 'getSantriData':
                result = getSantriData(e.parameter.filter);
                break;
            case 'getSantriById':
                result = getSantriById(e.parameter.id);
                break;
            case 'saveSantriData':
                result = saveSantriData(JSON.parse(e.parameter.data));
                break;
            case 'deleteSantriData':
                result = deleteSantriData(e.parameter.id);
                break;
            case 'getSantriByWali':
                result = getSantriByWali(e.parameter.idWali);
                break;

            // === MANAJEMEN KEUANGAN ===
            case 'getKeuanganData':
                result = getKeuanganData(e.parameter.filter);
                break;
            case 'getKeuanganById':
                result = getKeuanganById(e.parameter.id);
                break;
            case 'saveKeuanganData':
                result = saveKeuanganData(JSON.parse(e.parameter.data));
                break;
            case 'deleteKeuanganData':
                result = deleteKeuanganData(e.parameter.id);
                break;
            case 'getKeuanganByWali':
                result = getKeuanganByWali(e.parameter.idWali);
                break;

            // === MANAJEMEN ABSENSI ===
            case 'getAbsensiData':
                result = getAbsensiData(e.parameter.filter ? JSON.parse(e.parameter.filter) : null);
                break;
            case 'getAbsensiById':
                result = getAbsensiById(e.parameter.id);
                break;
            case 'saveAbsensiData':
                result = saveAbsensiData(JSON.parse(e.parameter.data));
                break;
            case 'deleteAbsensiData':
                result = deleteAbsensiData(e.parameter.id);
                break;
            case 'getAbsensiByWali':
                result = getAbsensiByWali(e.parameter.idWali, e.parameter.bulan);
                break;

            // === MANAJEMEN PELANGGARAN ===
            case 'getPelanggaranData':
                result = getPelanggaranData(e.parameter.filter);
                break;
            case 'getPelanggaranById':
                result = getPelanggaranById(e.parameter.id);
                break;
            case 'savePelanggaranData':
                result = savePelanggaranData(JSON.parse(e.parameter.data));
                break;
            case 'deletePelanggaranData':
                result = deletePelanggaranData(e.parameter.id);
                break;
            case 'getPelanggaranByWali':
                result = getPelanggaranByWali(e.parameter.idWali);
                break;

            // === MANAJEMEN RAPORT ===
            case 'getRaportData':
                result = getRaportData(e.parameter.filter);
                break;
            case 'getRaportById':
                result = getRaportById(e.parameter.id);
                break;
            case 'saveRaportData':
                result = saveRaportData(JSON.parse(e.parameter.data));
                break;
            case 'deleteRaportData':
                result = deleteRaportData(e.parameter.id);
                break;
            case 'getRaportByWali':
                result = getRaportByWali(e.parameter.idWali);
                break;

            // === MANAJEMEN PENGURUS ===
            case 'getPengurusData':
                result = getPengurusData(e.parameter.filter);
                break;
            case 'getPengurusById':
                result = getPengurusById(e.parameter.id);
                break;
            case 'savePengurusData':
                result = savePengurusData(JSON.parse(e.parameter.data));
                break;
            case 'deletePengurusData':
                result = deletePengurusData(e.parameter.id);
                break;

            default:
                result = { success: false, message: 'Aksi tidak dikenali' };
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: error.message + ' | Baris kesalahan: ' + error.lineNumber
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ====================== FUNGSI LOGIN ======================
function loginPengurus(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Username dan password tidak boleh kosong' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PENGURUS);
    const data = sheet.getDataRange().getValues();
    const hashedInputPassword = hashPassword(password);

    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === username && data[i][3] === hashedInputPassword) {
            return {
                success: true,
                data: {
                    id: data[i][0],
                    nama: data[i][1],
                    username: data[i][2],
                    bidang: data[i][4],
                    status: data[i][5]
                }
            };
        }
    }
    return { success: false, message: 'Username atau password salah' };
}

function loginWali(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Username dan password tidak boleh kosong' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.WALI);
    const data = sheet.getDataRange().getValues();
    const hashedInputPassword = hashPassword(password);

    for (let i = 1; i < data.length; i++) {
        if (data[i][2] === username && data[i][3] === hashedInputPassword) {
            return {
                success: true,
                data: {
                    id: data[i][0],
                    nama: data[i][1],
                    username: data[i][2],
                    idSantri: data[i][4]
                }
            };
        }
    }
    return { success: false, message: 'Username atau password salah' };
}

// ====================== FUNGSI DASHBOARD ======================
function getDashboardData() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const keuanganSheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const absensiSheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
    const pelanggaranSheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);

    const santriData = santriSheet.getDataRange().getValues();
    const keuanganData = keuanganSheet.getDataRange().getValues();
    const absensiData = absensiSheet.getDataRange().getValues();
    const pelanggaranData = pelanggaranSheet.getDataRange().getValues();

    let jumlahMI = 0, jumlahMTs = 0, jumlahMA = 0;
    for (let i = 1; i < santriData.length; i++) {
        switch(santriData[i][2]) {
            case 'MI': jumlahMI++; break;
            case 'MTs': jumlahMTs++; break;
            case 'MA': jumlahMA++; break;
        }
    }

    let totalLunas = 0;
    for (let i = 1; i < keuanganData.length; i++) {
        if (data[i][4] === 'Lunas') totalLunas++;
    }

    let totalTidakHadir = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const absensiHeaders = absensiData[0];
    const absensiTanggalIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'tanggal');
    const absensiStatusIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'status');

    for (let i = 1; i < absensiData.length; i++) {
        const tgl = validateDate(absensiData[i][absensiTanggalIndex]);
        const status = absensiData[i][absensiStatusIndex];
        if (tgl && tgl >= thirtyDaysAgo && status !== 'Hadir') totalTidakHadir++;
    }

    const totalPelanggaran = pelanggaranData.length - 1;

    return {
        success: true,
        data: {
            totalSantri: santriData.length - 1,
            jumlahMI, jumlahMTs, jumlahMA,
            totalLunas,
            totalTidakHadir,
            totalPelanggaran
        }
    };
}

// ====================== FUNGSI SANTRI ======================
function getSantriData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            row[toCamelCase(header)] = data[i][idx];
        });
        
        if (filter) {
            const searchLower = filter.toLowerCase();
            if (row.id?.toLowerCase().includes(searchLower) || row.nama?.toLowerCase().includes(searchLower)) {
                result.push(row);
            }
        } else {
            result.push(row);
        }
    }

    return { success: true, data: result };
}

function getSantriById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                row[toCamelCase(header)] = data[i][idx];
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data santri tidak ditemukan' };
}

function saveSantriData(data) {
    if (!data?.id || !data?.nama) {
        return { success: false, message: 'ID dan nama santri tidak boleh kosong' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.nama);
            sheet.getRange(i+1, 3).setValue(data.jenjang);
            sheet.getRange(i+1, 4).setValue(data.kelas);
            sheet.getRange(i+1, 5).setValue(data.tglLahir);
            sheet.getRange(i+1, 6).setValue(data.alamat);
            sheet.getRange(i+1, 7).setValue(data.namaWali);
            sheet.getRange(i+1, 8).setValue(data.hpWali);
            sheet.getRange(i+1, 9).setValue(data.idWali); // Tambahkan kolom idWali jika ada
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
        sheet.appendRow([
            data.id, data.nama, data.jenjang, data.kelas,
            data.tglLahir, data.alamat, data.namaWali, data.hpWali, data.idWali
        ]);
    }

    return { 
        success: true, 
        message: isUpdate ? 'Data santri berhasil diupdate' : 'Data santri berhasil ditambahkan' 
    };
}

function deleteSantriData(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i+1);
            return { success: true, message: 'Data santri berhasil dihapus' };
        }
    }
    return { success: false, message: 'Data santri tidak ditemukan' };
}

function getSantriByWali(idWali) {
    if (!idWali) return { success: false, message: 'Parameter idWali tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const keuanganSheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const absensiSheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
    const pelanggaranSheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const raportSheet = ss.getSheetByName(SHEET_NAMES.RAPORT);

    const santriData = santriSheet.getDataRange().getValues();
    const headers = santriData[0];
    let santri = null;
    let idSantri = '';

    const idWaliColumnIndex = headers.findIndex(header => toCamelCase(header) === 'idWali');
    if (idWaliColumnIndex === -1) {
        return { success: false, message: 'Kolom ID Wali tidak ditemukan di sheet Santri' };
    }

    for (let i = 1; i < santriData.length; i++) {
        if (santriData[i][idWaliColumnIndex] === idWali) {
            santri = {};
            headers.forEach((header, idx) => {
                santri[toCamelCase(header)] = santriData[i][idx];
            });
            idSantri = santriData[i][0];
            break;
        }
    }

   
    if (!santri) return { success: false, message: 'Data santri tidak ditemukan' };

    // Hitung ringkasan data
    const absensiData = absensiSheet.getDataRange().getValues();
    const keuanganData = keuanganSheet.getDataRange().getValues();
    const pelanggaranData = pelanggaranSheet.getDataRange().getValues();
    const raportData = raportSheet.getDataRange().getValues();

    // Presentase kehadiran (30 hari terakhir)
    let totalHadir = 0, totalHari = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Dapatkan indeks kolom yang diperlukan untuk absensi
    const absensiHeaders = absensiData[0];
    const absensiIdSantriIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const absensiTanggalIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'tanggal');
    const absensiStatusIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'status');

    for (let i = 1; i < absensiData.length; i++) {
        if (absensiData[i][absensiIdSantriIndex] === idSantri) {
            const tgl = validateDate(absensiData[i][absensiTanggalIndex]);
            if (tgl && tgl >= thirtyDaysAgo) {
                totalHari++;
                if (absensiData[i][absensiStatusIndex] === 'Hadir') totalHadir++;
            }
        }
    }
    const presentaseHadir = totalHari > 0 ? Math.round((totalHadir / totalHari) * 100) : 0;

    // Rata-rata nilai akademik
    let nilaiMTK = 0, nilaiBindo = 0, nilaiAqidah = 0, nilaiBarab = 0, jumlahRaport = 0;
    const raportHeaders = raportData[0];
    const raportIdSantriIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const raportMtkIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'mtk');
    const raportBindoIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'bindo');
    const raportAqidahIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'aqidah');
    const raportBarabIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'barab');

    for (let i = 1; i < raportData.length; i++) {
        if (raportData[i][raportIdSantriIndex] === idSantri) {
            nilaiMTK += parseInt(raportData[i][raportMtkIndex]) || 0;
            nilaiBindo += parseInt(raportData[i][raportBindoIndex]) || 0;
            nilaiAqidah += parseInt(raportData[i][raportAqidahIndex]) || 0;
            nilaiBarab += parseInt(raportData[i][raportBarabIndex]) || 0;
            jumlahRaport++;
        }
    }
    const rataRataNilai = jumlahRaport > 0 
        ? (nilaiMTK + nilaiBindo + nilaiAqidah + nilaiBarab) / (jumlahRaport * 4) 
        : 0;

    // Status biaya terbaru
    let statusBiaya = 'Tidak ada data';
    let terbaruBulan = '';
    const keuanganHeaders = keuanganData[0];
    const keuanganIdSantriIndex = keuanganHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const keuanganBulanIndex = keuanganHeaders.findIndex(header => toCamelCase(header) === 'bulan');
    const keuanganStatusIndex = keuanganHeaders.findIndex(header => toCamelCase(header) === 'status');

    for (let i = 1; i < keuanganData.length; i++) {
        if (keuanganData[i][keuanganIdSantriIndex] === idSantri) {
            const bulan = keuanganData[i][keuanganBulanIndex];
            if (bulan && bulan > terbaruBulan) {
                terbaruBulan = bulan;
                statusBiaya = keuanganData[i][keuanganStatusIndex] || '-';
            }
        }
    }

    // Jumlah pelanggaran bulan ini
    let jumlahPelanggaran = 0;
    const bulanIni = new Date().toISOString().slice(0, 7);
    const pelanggaranHeaders = pelanggaranData[0];
    const pelanggaranIdSantriIndex = pelanggaranHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const pelanggaranTanggalIndex = pelanggaranHeaders.findIndex(header => toCamelCase(header) === 'tanggal');

    for (let i = 1; i < pelanggaranData.length; i++) {
        if (pelanggaranData[i][pelanggaranIdSantriIndex] === idSantri) {
            const tglPelValue = pelanggaranData[i][pelanggaranTanggalIndex];
            const tglPel = tglPelValue ? tglPelValue.slice(0, 7) : '';
            if (tglPel === bulanIni) jumlahPelanggaran++;
        }
    }

    return {
        success: true,
        data: {
            santri: santri,
            ringkasan: {
                presentaseHadir,
                rataRataNilai: parseFloat(rataRataNilai.toFixed(1)),
                statusBiaya,
                jumlahPelanggaran,
                nilaiMTK: jumlahRaport > 0 ? parseFloat((nilaiMTK / jumlahRaport).toFixed(1)) : 0,
                nilaiBindo: jumlahRaport > 0 ? parseFloat((nilaiBindo / jumlahRaport).toFixed(1)) : 0,
                nilaiAqidah: jumlahRaport > 0 ? parseFloat((nilaiAqidah / jumlahRaport).toFixed(1)) : 0,
                nilaiBarab: jumlahRaport > 0 ? parseFloat((nilaiBarab / jumlahRaport).toFixed(1)) : 0
            }
        }
    };
}

// ====================== FUNGSI KEUANGAN ======================
function getKeuanganData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            const camelHeader = toCamelCase(header);
            row[camelHeader] = camelHeader === 'nominal' ? parseInt(data[i][idx]) || 0 : data[i][idx];
        });
        
        if (filter) {
            const searchLower = filter.toLowerCase();
            if (row.id?.toLowerCase().includes(searchLower) || row.idSantri?.toLowerCase().includes(searchLower)) {
                result.push(row);
            }
        } else {
            result.push(row);
        }
    }

    return { success: true, data: result };
}

function getKeuanganById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                const camelHeader = toCamelCase(header);
                row[camelHeader] = camelHeader === 'nominal' ? parseInt(data[i][idx]) || 0 : data[i][idx];
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data keuangan tidak ditemukan' };
}

function saveKeuanganData(data) {
    if (!data?.id || !data?.idSantri || !data?.bulan) {
        return { success: false, message: 'ID, ID Santri, dan Bulan tidak boleh kosong' };
    }
    if (!MONTH_FORMAT_REGEX.test(data.bulan)) {
        return { success: false, message: 'Format bulan tidak valid (gunakan YYYY-MM)' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.idSantri);
            sheet.getRange(i+1, 3).setValue(data.bulan);
            sheet.getRange(i+1, 4).setValue(parseInt(data.nominal) || 0);
            sheet.getRange(i+1, 5).setValue(data.status || '-');
            sheet.getRange(i+1, 6).setValue(data.tglBayar);
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
        sheet.appendRow([
            data.id, data.idSantri, data.bulan, parseInt(data.nominal) || 0,
            data.status || '-', data.tglBayar
        ]);
    }

    return { 
        success: true, 
        message: isUpdate ? 'Data keuangan berhasil diupdate' : 'Data keuangan berhasil ditambahkan' 
    };
}

function deleteKeuanganData(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i+1);
            return { success: true, message: 'Data keuangan berhasil dihapus' };
        }
    }
    return { success: false, message: 'Data keuangan tidak ditemukan' };
}

function getKeuanganByWali(idWali) {
    if (!idWali) return { success: false, message: 'Parameter idWali tidak boleh kosong' };

    // Dapatkan ID Santri terlebih dahulu
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    const santriHeaders = santriData[0];
    const idWaliColumnIndex = santriHeaders.findIndex(header => toCamelCase(header) === 'idWali');
    
    if (idWaliColumnIndex === -1) {
        return { success: false, message: 'Kolom ID Wali tidak ditemukan di sheet Santri' };
    }

    let idSantri = '';
    for (let i = 1; i < santriData.length; i++) {
        if (santriData[i][idWaliColumnIndex] === idWali) {
            idSantri = santriData[i][0];
            break;
        }
    }

    if (!idSantri) return { success: false, message: 'Data santri tidak ditemukan' };

    const keuanganSheet = ss.getSheetByName(SHEET_NAMES.KEUANGAN);
    const keuanganData = keuanganSheet.getDataRange().getValues();
    const keuanganHeaders = keuanganData[0];
    const keuanganIdSantriIndex = keuanganHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const result = [];

    for (let i = 1; i < keuanganData.length; i++) {
        if (keuanganData[i][keuanganIdSantriIndex] === idSantri) {
            const row = {};
            keuanganHeaders.forEach((header, idx) => {
                const camelHeader = toCamelCase(header);
                row[camelHeader] = camelHeader === 'nominal' ? parseInt(keuanganData[i][idx]) || 0 : keuanganData[i][idx];
            });
            result.push(row);
        }
    }

    return { success: true, data: result };
}

// ====================== FUNGSI ABSENSI ======================
function getAbsensiData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            row[toCamelCase(header)] = data[i][idx];
        });
        
        let match = true;
        if (filter?.search) {
            const searchLower = filter.search.toLowerCase();
            match = row.id?.toLowerCase().includes(searchLower) || row.idSantri?.toLowerCase().includes(searchLower) || row.namaSantri?.toLowerCase().includes(searchLower);
        }
        if (filter?.bulan) {
            if (!MONTH_FORMAT_REGEX.test(filter.bulan)) {
                return { success: false, message: 'Format bulan tidak valid (gunakan YYYY-MM)' };
            }
            const tglAbsen = row.tanggal ? row.tanggal.slice(0, 7) : '';
            if (tglAbsen !== filter.bulan) match = false;
        }

        if (match) result.push(row);
    }

    return { success: true, data: result };
}

function getAbsensiById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                row[toCamelCase(header)] = data[i][idx];
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data absensi tidak ditemukan' };
}

function saveAbsensiData(data) {
    if (!data?.id || !data?.idSantri || !data?.tanggal) {
        return { success: false, message: 'ID, ID Santri, dan Tanggal tidak boleh kosong' };
    }
    if (!DATE_FORMAT_REGEX.test(data.tanggal)) {
        return { success: false, message: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    // Dapatkan nama santri untuk kolom tambahan
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    let namaSantri = '-';
    for (let j = 1; j < santriData.length; j++) {
        if (santriData[j][0] === data.idSantri) {
            namaSantri = santriData[j][1] || '-';
            break;
        }
    }

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.idSantri);
            sheet.getRange(i+1, 3).setValue(namaSantri);
            sheet.getRange(i+1, 4).setValue(data.tanggal);
            sheet.getRange(i+1, 5).setValue(data.status || '-');
            sheet.getRange(i+1, 6).setValue(data.keterangan || '-');
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
            sheet.appendRow([
                data.id, data.idSantri, namaSantri, data.tanggal,
                data.status || '-', data.keterangan || '-'
            ]);
        }

        return { 
            success: true, 
            message: isUpdate ? 'Data absensi berhasil diupdate' : 'Data absensi berhasil ditambahkan' 
        };
    }

    function deleteAbsensiData(id) {
        if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
        const data = sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === id) {
                sheet.deleteRow(i+1);
                return { success: true, message: 'Data absensi berhasil dihapus' };
            }
        }
        return { success: false, message: 'Data absensi tidak ditemukan' };
    }

    function getAbsensiByWali(idWali, bulan) {
        if (!idWali) return { success: false, message: 'Parameter idWali tidak boleh kosong' };
        if (bulan && !MONTH_FORMAT_REGEX.test(bulan)) {
            return { success: false, message: 'Format bulan tidak valid (gunakan YYYY-MM)' };
        }

        // Dapatkan ID Santri terlebih dahulu
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
        const santriData = santriSheet.getDataRange().getValues();
        const santriHeaders = santriData[0];
        const idWaliColumnIndex = santriHeaders.findIndex(header => toCamelCase(header) === 'idWali');
        
        if (idWaliColumnIndex === -1) {
            return { success: false, message: 'Kolom ID Wali tidak ditemukan di sheet Santri' };
        }

        let idSantri = '';
        for (let i = 1; i < santriData.length; i++) {
            if (santriData[i][idWaliColumnIndex] === idWali) {
                idSantri = santriData[i][0];
                break;
            }
        }

        if (!idSantri) return { success: false, message: 'Data santri tidak ditemukan' };

        const absensiSheet = ss.getSheetByName(SHEET_NAMES.ABSENSI);
        const absensiData = absensiSheet.getDataRange().getValues();
        const absensiHeaders = absensiData[0];
        const absensiIdSantriIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
        const absensiTanggalIndex = absensiHeaders.findIndex(header => toCamelCase(header) === 'tanggal');
        const result = [];

        for (let i = 1; i < absensiData.length; i++) {
            if (absensiData[i][absensiIdSantriIndex] === idSantri) {
                // Filter berdasarkan bulan jika ada
                if (bulan) {
                    const tglAbsen = absensiData[i][absensiTanggalIndex];
                    if (!tglAbsen || tglAbsen.slice(0, 7) !== bulan) continue;
                }
                const row = {};
                absensiHeaders.forEach((header, idx) => {
                    row[toCamelCase(header)] = absensiData[i][idx];
                });
                result.push(row);
            }
        }

        return { success: true, data: result };
    }

// ====================== FUNGSI PELANGGARAN ======================
function getPelanggaranData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            row[toCamelCase(header)] = data[i][idx];
        });
        
        if (filter) {
            const searchLower = filter.toLowerCase();
            if (row.id?.toLowerCase().includes(searchLower) || row.idSantri?.toLowerCase().includes(searchLower) || row.namaSantri?.toLowerCase().includes(searchLower)) {
                result.push(row);
            }
        } else {
            result.push(row);
        }
    }

    return { success: true, data: result };
}

function getPelanggaranById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                row[toCamelCase(header)] = data[i][idx];
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data pelanggaran tidak ditemukan' };
}

function savePelanggaranData(data) {
    if (!data?.id || !data?.idSantri || !data?.tanggal) {
        return { success: false, message: 'ID, ID Santri, dan Tanggal tidak boleh kosong' };
    }
    if (!DATE_FORMAT_REGEX.test(data.tanggal)) {
        return { success: false, message: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    let namaSantri = '-';
    for (let j = 1; j < santriData.length; j++) {
        if (santriData[j][0] === data.idSantri) {
            namaSantri = santriData[j][1] || '-';
            break;
        }
    }

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.idSantri);
            sheet.getRange(i+1, 3).setValue(namaSantri);
            sheet.getRange(i+1, 4).setValue(data.tanggal);
            sheet.getRange(i+1, 5).setValue(data.jenis || '-');
            sheet.getRange(i+1, 6).setValue(data.tingkat || '-');
            sheet.getRange(i+1, 7).setValue(data.sanksi || '-');
            sheet.getRange(i+1, 8).setValue(data.status || '-');
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
        sheet.appendRow([
            data.id, data.idSantri, namaSantri, data.tanggal,
            data.jenis || '-', data.tingkat || '-', data.sanksi || '-', data.status || '-'
        ]);
    }

    return { 
        success: true, 
        message: isUpdate ? 'Data pelanggaran berhasil diupdate' : 'Data pelanggaran berhasil ditambahkan' 
    };
}

function deletePelanggaranData(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i+1);
            return { success: true, message: 'Data pelanggaran berhasil dihapus' };
        }
    }
    return { success: false, message: 'Data pelanggaran tidak ditemukan' };
}

function getPelanggaranByWali(idWali) {
    if (!idWali) return { success: false, message: 'Parameter idWali tidak boleh kosong' };

    // Dapatkan ID Santri terlebih dahulu
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    const santriHeaders = santriData[0];
    const idWaliColumnIndex = santriHeaders.findIndex(header => toCamelCase(header) === 'idWali');
    
    if (idWaliColumnIndex === -1) {
        return { success: false, message: 'Kolom ID Wali tidak ditemukan di sheet Santri' };
    }

    let idSantri = '';
    for (let i = 1; i < santriData.length; i++) {
        if (santriData[i][idWaliColumnIndex] === idWali) {
            idSantri = santriData[i][0];
            break;
        }
    }

    if (!idSantri) return { success: false, message: 'Data santri tidak ditemukan' };

    const pelanggaranSheet = ss.getSheetByName(SHEET_NAMES.PELANGGARAN);
    const pelanggaranData = pelanggaranSheet.getDataRange().getValues();
    const pelanggaranHeaders = pelanggaranData[0];
    const pelanggaranIdSantriIndex = pelanggaranHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const result = [];

    for (let i = 1; i < pelanggaranData.length; i++) {
        if (pelanggaranData[i][pelanggaranIdSantriIndex] === idSantri) {
            const row = {};
            pelanggaranHeaders.forEach((header, idx) => {
                row[toCamelCase(header)] = pelanggaranData[i][idx];
            });
            result.push(row);
        }
    }

    return { success: true, data: result };
}

// ====================== FUNGSI RAPORT ======================
function getRaportData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.RAPORT);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            const camelHeader = toCamelCase(header);
            const value = data[i][idx];
            // Konversi nilai akademik ke angka
            if (['mtk', 'bindo', 'aqidah', 'barab'].includes(camelHeader)) {
                row[camelHeader] = parseInt(value) || 0;
            } else {
                row[camelHeader] = value;
            }
        });
        
        if (filter) {
            const searchLower = filter.toLowerCase();
            if (row.id?.toLowerCase().includes(searchLower) || row.idSantri?.toLowerCase().includes(searchLower) || row.namaSantri?.toLowerCase().includes(searchLower)) {
                result.push(row);
            }
        } else {
            result.push(row);
        }
    }

    return { success: true, data: result };
}

function getRaportById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.RAPORT);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                const camelHeader = toCamelCase(header);
                const value = data[i][idx];
                if (['mtk', 'bindo', 'aqidah', 'barab'].includes(camelHeader)) {
                    row[camelHeader] = parseInt(value) || 0;
                } else {
                    row[camelHeader] = value;
                }
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data raport tidak ditemukan' };
}

function saveRaportData(data) {
    if (!data?.id || !data?.idSantri || !data?.semester) {
        return { success: false, message: 'ID, ID Santri, dan Semester tidak boleh kosong' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.RAPORT);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    let namaSantri = '-';
    for (let j = 1; j < santriData.length; j++) {
        if (santriData[j][0] === data.idSantri) {
            namaSantri = santriData[j][1] || '-';
            break;
        }
    }

    // Validasi nilai harus berupa angka antara 0-100
    const validateNilai = (nilai) => {
        const num = parseInt(nilai);
        return num >= 0 && num <= 100 ? num : 0;
    };

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.idSantri);
            sheet.getRange(i+1, 3).setValue(namaSantri);
            sheet.getRange(i+1, 4).setValue(data.semester);
            sheet.getRange(i+1, 5).setValue(validateNilai(data.mtk));
            sheet.getRange(i+1, 6).setValue(validateNilai(data.bindo));
            sheet.getRange(i+1, 7).setValue(validateNilai(data.aqidah));
            sheet.getRange(i+1, 8).setValue(validateNilai(data.barab));
            sheet.getRange(i+1, 9).setValue(data.catatan || 'Tidak ada catatan');
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
        sheet.appendRow([
            data.id, data.idSantri, namaSantri, data.semester,
            validateNilai(data.mtk), validateNilai(data.bindo), validateNilai(data.aqidah), validateNilai(data.barab),
            data.catatan || 'Tidak ada catatan'
        ]);
    }

    return { 
        success: true, 
        message: isUpdate ? 'Data raport berhasil diupdate' : 'Data raport berhasil ditambahkan' 
    };
}

function deleteRaportData(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.RAPORT);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i+1);
            return { success: true, message: 'Data raport berhasil dihapus' };
        }
    }
    return { success: false, message: 'Data raport tidak ditemukan' };
}

function getRaportByWali(idWali) {
    if (!idWali) return { success: false, message: 'Parameter idWali tidak boleh kosong' };

    // Dapatkan ID Santri terlebih dahulu
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const santriSheet = ss.getSheetByName(SHEET_NAMES.SANTRI);
    const santriData = santriSheet.getDataRange().getValues();
    const santriHeaders = santriData[0];
    const idWaliColumnIndex = santriHeaders.findIndex(header => toCamelCase(header) === 'idWali');
    
    if (idWaliColumnIndex === -1) {
        return { success: false, message: 'Kolom ID Wali tidak ditemukan di sheet Santri' };
    }

    let idSantri = '';
    for (let i = 1; i < santriData.length; i++) {
        if (santriData[i][idWaliColumnIndex] === idWali) {
            idSantri = santriData[i][0];
            break;
        }
    }

    if (!idSantri) return { success: false, message: 'Data santri tidak ditemukan' };

    const raportSheet = ss.getSheetByName(SHEET_NAMES.RAPORT);
    const raportData = raportSheet.getDataRange().getValues();
    const raportHeaders = raportData[0];
    const raportIdSantriIndex = raportHeaders.findIndex(header => toCamelCase(header) === 'idSantri');
    const result = [];

    for (let i = 1; i < raportData.length; i++) {
        if (raportData[i][raportIdSantriIndex] === idSantri) {
            const row = {};
            raportHeaders.forEach((header, idx) => {
                const camelHeader = toCamelCase(header);
                const value = raportData[i][idx];
                if (['mtk', 'bindo', 'aqidah', 'barab'].includes(camelHeader)) {
                    row[camelHeader] = parseInt(value) || 0;
                } else {
                    row[camelHeader] = value;
                }
            });
            result.push(row);
        }
    }

    return { success: true, data: result };
}

// ====================== FUNGSI PENGURUS ======================
function getPengurusData(filter) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PENGURUS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const result = [];

    for (let i = 1; i < data.length; i++) {
        const row = {};
        headers.forEach((header, idx) => {
            const camelHeader = toCamelCase(header);
            // Jangan kembalikan kolom password untuk keamanan
            if (camelHeader !== 'password') {
                row[camelHeader] = data[i][idx];
            }
        });
        
        if (filter) {
            const searchLower = filter.toLowerCase();
            if (row.id?.toLowerCase().includes(searchLower) || row.nama?.toLowerCase().includes(searchLower) || row.username?.toLowerCase().includes(searchLower)) {
                result.push(row);
            }
        } else {
            result.push(row);
        }
    }

    return { success: true, data: result };
}

function getPengurusById(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PENGURUS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const row = {};
            headers.forEach((header, idx) => {
                const camelHeader = toCamelCase(header);
                // Jangan kembalikan kolom password untuk keamanan
                if (camelHeader !== 'password') {
                    row[camelHeader] = data[i][idx];
                }
            });
            return { success: true, data: row };
        }
    }
    return { success: false, message: 'Data pengurus tidak ditemukan' };
}

function savePengurusData(data) {
    if (!data?.id || !data?.nama || !data?.username) {
        return { success: false, message: 'ID, Nama, dan Username tidak boleh kosong' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PENGURUS);
    const range = sheet.getDataRange().getValues();
    let isUpdate = false;

    for (let i = 1; i < range.length; i++) {
        if (range[i][0] === data.id) {
            sheet.getRange(i+1, 2).setValue(data.nama);
            sheet.getRange(i+1, 3).setValue(data.username);
            // Hanya update password jika diberikan dan tidak kosong
            if (data.password && data.password.trim() !== '') {
                sheet.getRange(i+1, 4).setValue(hashPassword(data.password));
            }
            sheet.getRange(i+1, 5).setValue(data.bidang || '-');
            sheet.getRange(i+1, 6).setValue(data.status || 'Aktif');
            isUpdate = true;
            break;
        }
    }

    if (!isUpdate) {
        // Jika menambahkan data baru, password wajib diisi
        if (!data.password || data.password.trim() === '') {
            return { success: false, message: 'Password wajib diisi untuk data pengurus baru' };
        }
        sheet.appendRow([
            data.id, data.nama, data.username, hashPassword(data.password),
            data.bidang || '-', data.status || 'Aktif'
        ]);
    }

    return { 
        success: true, 
        message: isUpdate ? 'Data pengurus berhasil diupdate' : 'Data pengurus berhasil ditambahkan' 
    };
}

function deletePengurusData(id) {
    if (!id) return { success: false, message: 'Parameter id tidak boleh kosong' };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.PENGURUS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i+1);
            return { success: true, message: 'Data pengurus berhasil dihapus' };
        }
    }
    return { success: false, message: 'Data pengurus tidak ditemukan' };
}
