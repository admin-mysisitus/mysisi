// =====================================================
//  GAS: Backend
// =====================================================
const CONFIG = {
  SHEET: {
    ARTICLES: "ArtikelData",
    VISITORS: "VisitorData"
  },
  REQUIRED_ARTICLE_FIELDS: ["title", "slug", "category", "date"],
  REQUIRED_VISITOR_FIELDS: ["nama", "kategori", "pesan"],
  ALLOWED_ORIGINS: [] // kosong = izinkan semua
};
// -------------------------
// Entry points
// -------------------------
function doGet(e) {
  e = e || {
    parameter: {}
  };
  try {
    if(!validateOrigin(e)) return respondText("akses ditolak");
    const action = (e.parameter.action || "").toLowerCase();
    switch(action) {
      case "getarticle":
        return getArticles();
      case "getvisitor":
        return getVisitors();
      default:
        return respondText("aksi tidak valid");
    }
  } catch (err) {
    console.error("doGet error:", err);
    return respondText("server error");
  }
}

function doPost(e) {
  e = e || {
    parameter: {},
    postData: {
      contents: "",
      type: ""
    }
  };
  try {
    if(!validateOrigin(e)) return respondText("akses ditolak");
    const action = (e.parameter.action || tryParseJsonAction(e) || "").toLowerCase();
    switch(action) {
      case "savevisitor":
        return saveVisitor(e);
      default:
        return respondText("aksi tidak valid");
    }
  } catch (err) {
    console.error("doPost error:", err);
    return respondText("server error");
  }
}
// helper
function tryParseJsonAction(e) {
  try {
    if(e.postData && e.postData.type && e.postData.type.indexOf("application/json") !== -1 && e.postData.contents) {
      const b = JSON.parse(e.postData.contents);
      return b.action;
    }
  } catch (err) {}
  return null;
}
// -------------------------
// getArticles
// -------------------------
function getArticles() {
  ensureSheetExists(CONFIG.SHEET.ARTICLES, ["title", "slug", "category", "date", "summary", "thumbnail", "content"]);
  const sh = getSheet(CONFIG.SHEET.ARTICLES);
  const values = sh.getDataRange().getValues();
  if(values.length <= 1) return respondJson([]);
  const headers = normalizeHeaders(values[0]);
  const out = [];
  for(let i = 1; i < values.length; i++) {
    const obj = rowToObject(headers, values[i]);
    const ok = CONFIG.REQUIRED_ARTICLE_FIELDS.every(f => obj[f] && obj[f] !== "");
    if(ok) out.push(obj);
  }
  out.sort((a, b) => safeDate(b.date) - safeDate(a.date));
  return respondJson(out);
}
// -------------------------
// getVisitors
// -------------------------
function getVisitors() {
  ensureSheetExists(CONFIG.SHEET.VISITORS, ["timestamp", "nama", "email", "kategori", "pesan", "userAgent"]);
  const sh = getSheet(CONFIG.SHEET.VISITORS);
  const values = sh.getDataRange().getValues();
  if(values.length <= 1) return respondJson([]);
  const headers = normalizeHeaders(values[0]);
  const out = [];
  for(let i = 1; i < values.length; i++) {
    out.push(rowToObject(headers, values[i]));
  }
  out.sort((a, b) => safeDate(b.timestamp) - safeDate(a.timestamp));
  return respondJson(out);
}
// -------------------------
// saveVisitor (NO IP)
// -------------------------
function saveVisitor(e) {
  // UA
  let userAgent = (e.parameter && (e.parameter.ua || e.parameter.useragent || e.parameter.userAgent)) || "";
  if(!userAgent && e.postData && e.postData.type && e.postData.type.indexOf("application/json") !== -1 && e.postData.contents) {
    try {
      const b = JSON.parse(e.postData.contents);
      userAgent = b.userAgent || b.ua || "";
    } catch (err) {}
  }
  if(!userAgent) userAgent = "unknown-user-agent";
  // input
  let input = {
    nama: "",
    email: "",
    kategori: "",
    pesan: ""
  };
  if(e.postData && e.postData.type && e.postData.type.indexOf("application/json") !== -1 && e.postData.contents) {
    try {
      const b = JSON.parse(e.postData.contents);
      input.nama = (b.nama || "").trim();
      input.email = (b.email || "").trim();
      input.kategori = (b.kategori || "").trim();
      input.pesan = (b.pesan || "").trim();
    } catch (err) {}
  }
  if(e.parameter) {
    input.nama = (e.parameter.nama || input.nama).trim();
    input.email = (e.parameter.email || input.email).trim();
    input.kategori = (e.parameter.kategori || input.kategori).trim();
    input.pesan = (e.parameter.pesan || input.pesan).trim();
  }
  // validasi
  const missing = CONFIG.REQUIRED_VISITOR_FIELDS.filter(f => !input[f] || input[f] === "");
  if(missing.length) return respondText("kolom wajib tidak lengkap: " + missing.join(", "));
  // simpan (tanpa IP)
  ensureSheetExists(CONFIG.SHEET.VISITORS, ["timestamp", "nama", "email", "kategori", "pesan", "userAgent"]);
  const sh = getSheet(CONFIG.SHEET.VISITORS);
  const ts = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  sh.appendRow([
    ts,
    input.nama,
    input.email,
    input.kategori,
    input.pesan,
    userAgent
  ]);
  return respondText("success");
}
// -------------------------
// RESPOND
// -------------------------
function respondText(text) {
  return ContentService.createTextOutput(String(text)).setMimeType(ContentService.MimeType.TEXT);
}

function respondJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// -------------------------
// UTILITIES
// -------------------------
function validateOrigin(e) {
  if(!CONFIG.ALLOWED_ORIGINS.length) return true;
  try {
    const origin = (e.parameter && (e.parameter.origin || e.parameter.Origin)) || "";
    const lower = origin.toString().toLowerCase();
    return CONFIG.ALLOWED_ORIGINS.some(o => lower.indexOf(o.toLowerCase()) === 0);
  } catch (err) {
    return false;
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if(!sh) throw new Error("sheet '" + name + "' tidak ditemukan");
  return sh;
}

function normalizeHeaders(arr) {
  return arr.map(h => String(h || "").trim().toLowerCase().replace(/\s+/g, ""));
}

function rowToObject(headers, row) {
  const o = {};
  headers.forEach((key, i) => {
    o[key] = row[i] != null ? String(row[i]).trim() : "";
  });
  return o;
}

function safeDate(str) {
  const d = new Date(str);
  return isNaN(d) ? new Date(0) : d;
}

function ensureSheetExists(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if(!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    return;
  }
  const first = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const empty = first.every(c => !c);
  if(empty) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
}