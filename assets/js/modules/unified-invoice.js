import APIClient from '/assets/js/modules/unified-api.js';
import { getFirebase } from '/assets/js/modules/firebase-core.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
import { GAS_CONFIG, MIDTRANS_CONFIG } from '/assets/js/config/api.config.js';
export const InvoiceService = {
PRESETS: {
sekolah: {
category: 'sekolah',
categoryBadge: 'PROPOSAL & FAKTUR PENAWARAN WEBSITE SEKOLAH',
clientName: 'SD Muhammadiyah 1 Sedati (MUSADA)',
picName: 'Bapak Kepala Sekolah & Humas',
picPhone: '0882010067695',
title: 'Proposal & Penawaran Pembuatan Website Sekolah Terpadu',
subtitle: 'Portal Resmi Sekolah, Informasi Akademik & Penerimaan Murid Baru (SPMB Online)',
demoUrl: 'https://sdmusada.sch.id',
demoScreenshot: '/assets/img/portfolio/sdmusada.webp',
features: [
'Portal Berita & Kegiatan Sekolah (Sudah Aktif & Siap Pakai)',
'Modul SPMB / PPDB Online 24 Jam (Formulir & Cetak Bukti Registrasi)',
'Desain Responsif 100% Mobile & Tablet (Loading Kilat di Bawah 2 Detik)',
'Domain Resmi .sch.id & Cloud Hosting NVMe (Siap Deploy ke Nama Sekolah)',
'Tombol Kontak WhatsApp Humas & Staf Tata Usaha (Terintegrasi)',
'Sertifikat Keamanan SSL 256-Bit & Perlindungan Anti-Spam'
],
items: [
{ name: 'Pengembangan Website Sekolah Terpadu (Modul SPMB Online & Warta Akademik)', qty: 1, unit: 'Paket', price: 1299000, subtotal: 1299000 },
{ name: 'Alokasi Domain Resmi .sch.id & Cloud Hosting NVMe (1 Tahun Penuh)', qty: 1, unit: 'Tahun', price: 0, subtotal: 0 },
{ name: 'Pelatihan Operator Staf Tata Usaha (TU) 1x Sesi via Zoom / Panduan', qty: 1, unit: 'Sesi', price: 0, subtotal: 0 }
],
totalAmount: 1299000,
dpPercentage: 50,
dpAmount: 649500,
paidAmount: 0,
remainingAmount: 1299000,
status: 'BELUM BAYAR',
notes: 'Website demo telah kami selesaikan dan siap diluncurkan ke domain resmi sekolah setelah konfirmasi persetujuan penawaran ini.',
adminNotes: 'Penawaran berlaku hingga batas waktu tertera. Sudah mencakup garansi bug fix & backup berkala selama masa aktif.',
signerName: 'Muhammad Lukman Hakim, S.H.',
signerPosition: 'Manajer Operasional SISITUS'
},
perusahaan: {
category: 'perusahaan',
categoryBadge: 'PROPOSAL & FAKTUR PENAWARAN WEBSITE KORPORAT B2B',
clientName: 'PT Bintang Sinergi Mandiri',
picName: 'Ibu Manager Marketing & Operasional',
picPhone: '0882010067695',
title: 'Proposal & Penawaran Pembuatan Website Profil Perusahaan',
subtitle: 'Digital Corporate Identity, Portofolio Layanan & Kredibilitas Bisnis Korporat',
demoUrl: '/demo/perusahaan/',
demoScreenshot: '/assets/img/portfolio/bintangsinergi.webp',
features: [
'Profil Korporat, Visi-Misi & Struktur Manajemen (Sudah Aktif)',
'Katalog Layanan & Solusi Bisnis Industri B2B (Siap Pakai)',
'Formulir Request for Proposal (RFP) Penjaringan Klien Korporat',
'Email Bisnis Resmi Domain Perusahaan (@perusahaan.com)',
'Showcase Rekam Jejak Proyek & Klien Terdahulu (Siap Pakai)',
'Enkripsi Data SSL Tingkat Tinggi & Standar Kepatuhan ISO 27001'
],
items: [
{ name: 'Pengembangan Website Korporat & Katalog Layanan Bisnis B2B', qty: 1, unit: 'Paket', price: 1599000, subtotal: 1599000 },
{ name: 'Domain Resmi .com / .co.id & Server Cloud NVMe Performa Tinggi (1 Tahun)', qty: 1, unit: 'Tahun', price: 0, subtotal: 0 },
{ name: 'Konfigurasi 5 Akun Email Bisnis Resmi Perusahaan (@perusahaan.com)', qty: 5, unit: 'Akun', price: 0, subtotal: 0 }
],
totalAmount: 1599000,
dpPercentage: 50,
dpAmount: 799500,
paidAmount: 0,
remainingAmount: 1599000,
status: 'BELUM BAYAR',
notes: 'Website demo profil korporat telah selesai kami susun dan dapat diuji coba langsung melalui link demo sebelum serah terima akun.',
adminNotes: 'Termasuk sertifikat keamanan SSL, formulir penawaran RFP terintegrasi, dan pemeliharaan server berkala.',
signerName: 'Muhammad Lukman Hakim, S.H.',
signerPosition: 'Manajer Operasional SISITUS'
},
personal: {
category: 'personal',
categoryBadge: 'PROPOSAL & FAKTUR WEBSITE PERSONAL BRANDING',
clientName: 'dr. Fajar Kristiono, Sp.A',
picName: 'dr. Fajar Kristiono',
picPhone: '0882010067695',
title: 'Proposal & Penawaran Website Personal Branding Profesional',
subtitle: 'Portofolio Digital Profesional, Otoritas Keahlian & Jangkauan Klien',
demoUrl: 'https://drfajarkristiono.com',
demoScreenshot: '/assets/img/portfolio/fajarkristiono.webp',
features: [
'Biodata & Rekam Jejak Keahlian Profesional (Sudah Aktif)',
'Sistem Reservasi Jadwal Konsultasi Terhubung ke WhatsApp (Siap Pakai)',
'Blog Tulisan Edukasi, Opini Ahli & Riset Ilmiah (Sudah Aktif)',
'Optimasi SEO Nama Personal untuk Peringkat No. 1 di Google',
'Galeri Ijazah, Sertifikasi Kompetensi & Dokumentasi Kegiatan',
'Tautan Terpadu ke Saluran Media Sosial & Liputan Berita'
],
items: [
{ name: 'Pembuatan Website Personal Branding & Sistem Booking Jadwal Konsultasi', qty: 1, unit: 'Paket', price: 999000, subtotal: 999000 },
{ name: 'Domain Personal (.com / .id) & Cloud Hosting NVMe Cepat (1 Tahun)', qty: 1, unit: 'Tahun', price: 0, subtotal: 0 },
{ name: 'Optimasi SEO On-Page Nama Personal di Hasil Pencarian Google', qty: 1, unit: 'Paket', price: 0, subtotal: 0 }
],
totalAmount: 999000,
dpPercentage: 50,
dpAmount: 499500,
paidAmount: 0,
remainingAmount: 999000,
status: 'BELUM BAYAR',
notes: 'Website personal demo telah aktif. Calon klien atau pasien dapat langsung mencoba simulasi alur booking jadwal konsultasi.',
adminNotes: 'Termasuk garansi pemeliharaan teknis 3 bulan dan panduan update artikel secara mandiri.',
signerName: 'Muhammad Lukman Hakim, S.H.',
signerPosition: 'Manajer Operasional SISITUS'
},
umkm: {
category: 'umkm',
categoryBadge: 'PROPOSAL & FAKTUR WEBSITE TOKO ONLINE UMKM',
clientName: 'Si Bumbu Nusantara',
picName: 'Pemilik Usaha & Tim Operasional',
picPhone: '0882010067695',
title: 'Proposal & Penawaran Website Toko Online & Katalog UMKM',
subtitle: 'Katalog Produk Interaktif, Order Cepat via WhatsApp & Pembayaran Digital QRIS',
demoUrl: 'https://sibumbu.com',
demoScreenshot: '/assets/img/portfolio/sibumbu.webp',
features: [
'Katalog Produk Online Bebas Potongan Komisi 0% (Sudah Aktif)',
'Keranjang Checkout Cepat Otomatis ke WhatsApp Penjual (Siap Pakai)',
'Pembayaran Digital QRIS Semua Bank & E-Wallet (Siap Digunakan)',
'Kalkulator Estimasi Ongkir Ekspedisi JNE/SiCepat Se-Indonesia',
'Banner Promo Diskon & Badge Best Seller (Sudah Aktif)',
'Tampilan Responsif Mobile Smartphone Cepat & Ringan'
],
items: [
{ name: 'Pengembangan Website Toko Online UMKM (Fitur Order WhatsApp & Hitung Ongkir)', qty: 1, unit: 'Paket', price: 1399000, subtotal: 1399000 },
{ name: 'Domain .com / .my.id & Cloud Server NVMe Berkecepatan Tinggi (1 Tahun)', qty: 1, unit: 'Tahun', price: 0, subtotal: 0 },
{ name: 'Integrasi Scan Pembayaran QRIS & Rekening Bank Resmi', qty: 1, unit: 'Sistem', price: 0, subtotal: 0 }
],
totalAmount: 1399000,
dpPercentage: 50,
dpAmount: 699500,
paidAmount: 0,
remainingAmount: 1399000,
status: 'BELUM BAYAR',
notes: 'Toko online demo telah aktif dengan sampel produk. Anda dapat mencoba langsung alur pemesanan produk hingga terkirim ke WhatsApp.',
adminNotes: 'Bebas biaya komisi penjualan selamanya. Seluruh transaksi langsung masuk ke rekening dan WhatsApp pemilik usaha.',
signerName: 'Muhammad Lukman Hakim, S.H.',
signerPosition: 'Manajer Operasional SISITUS'
}
},
generateProposalId() {
const d = new Date();
const yymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
return `PROP-${yymm}-${rand}`;
},
generateId() {
const d = new Date();
const yymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
return `INV-${yymm}-${rand}`;
},
generateInvoiceNumber(id) {
if (id && id.startsWith('INV-')) return id;
const d = new Date();
const yymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const rand = Math.floor(100 + Math.random() * 900);
return `INV-SIS-${yymmdd}-${rand}`;
},
formatRupiah(num) {
if (!num || isNaN(num)) return 'Rp 0';
return 'Rp ' + Number(num).toLocaleString('id-ID');
},
formatDate(dateStr) {
if (!dateStr) return '-';
try {
const d = new Date(dateStr);
if (isNaN(d.getTime())) return dateStr;
return d.toLocaleDateString('id-ID', {
day: 'numeric',
month: 'long',
year: 'numeric'
});
} catch (e) {
return dateStr;
}
},
mapOrderToInvoice(order, id) {
const rawStatus = (order.status || order.paymentStatus || 'unpaid').toLowerCase();
const isPaid = rawStatus === 'paid' || rawStatus === 'settlement' || rawStatus === 'capture' || rawStatus === 'selesai' || rawStatus === 'success';
const isDP = rawStatus === 'dp';
const createdDate = order.date || order.createdAt ? new Date(order.date || order.createdAt) : new Date();
const orderDuration = Number(order.domainDuration || order.duration || 1);
const dueDate = order.validUntil ? new Date(order.validUntil) : new Date(createdDate.getTime() + (24 * 60 * 60 * 1000));
const expiryDate = new Date(createdDate);
expiryDate.setFullYear(expiryDate.getFullYear() + orderDuration);
const bundlePeriod = `${orderDuration} Tahun (${this.formatDate(createdDate)} - ${this.formatDate(expiryDate)})`;
const total = Number(order.total) || 0;
const discount = Number(order.discount) || 0;
const subtotal = order.subtotal !== undefined ? Number(order.subtotal) : Math.round((total + discount) / 1.11);
const ppn = order.ppn !== undefined ? Number(order.ppn) : Math.max(0, total + discount - subtotal);
let addonsTotal = 0;
const paidAddons = [];
if (order.addons && Array.isArray(order.addons)) {
for (const add of order.addons) {
const p = Number(add.price) || 0;
if (p > 0) {
paidAddons.push(add);
addonsTotal += p;
}
}
}
const baseLayananPrice = Math.max(0, subtotal - addonsTotal);
const packageName = String(order.package || order.packageId || 'none');
const isRenewal = order.isRenewal === true;
let title = order.item || order.title || 'Bundle Domain & Hosting';
if (!order.item && !order.title) {
if (isRenewal) title = 'Perpanjangan Domain';
else if (packageName.toLowerCase() === 'none') title = 'Registrasi Domain';
else if (packageName) title = `Paket Website ${packageName}`;
}
const domainName = order.domain || order.item || '-';
const items = [];
let domainDesc = domainName !== '-' ? `Domain: ${domainName}<br>` : '';
domainDesc += `Masa Aktif: ${bundlePeriod}`;
items.push({
name: title,
desc: domainDesc,
qty: 1,
price: baseLayananPrice > 0 ? baseLayananPrice : (total > 0 ? subtotal : 0),
subtotal: baseLayananPrice > 0 ? baseLayananPrice : (total > 0 ? subtotal : 0)
});
for (const add of paidAddons) {
items.push({
name: `Add-on: ${add.name}`,
desc: `Deskripsi: Layanan pelengkap tambahan<br>Masa Aktif: ${bundlePeriod}`,
qty: 1,
price: Number(add.price) || 0,
subtotal: Number(add.price) || 0
});
}
return {
id: id || order.inv || order.orderId,
invoiceNumber: order.inv || order.orderId || id,
clientName: order.name || order.displayName || 'JAKALELANA Tour & Travel',
email: order.email || 'jakalelana.tour@gmail.com',
phone: order.phone || order.whatsapp || '',
title: title,
subtitle: domainName !== '-' ? `Domain: ${domainName}` : 'Layanan SISITUS',
domain: domainName,
demoUrl: order.demoUrl || '',
features: order.features || [],
items: items,
totalAmount: total,
subtotal: subtotal,
ppn: ppn,
dpAmount: Number(order.dpAmount) || Math.round(total * 0.5),
status: isPaid ? 'PAID' : (isDP ? 'DP' : 'UNPAID'),
paymentMethod: order.paymentMethod || 'Midtrans Payment Gateway',
transactionId: order.transactionId || '',
orderIdRef: order.inv || order.orderId || id,
createdAt: createdDate.toISOString(),
validUntil: dueDate.toISOString()
};
},
async syncOrderToPublicInvoice(tx) {
if (!tx) return;
const invId = tx.inv || tx.orderId || tx.id;
if (!invId) return;
const invData = this.mapOrderToInvoice(tx, invId);
try {
const cached = localStorage.getItem('sisitus_invoices');
let list = cached ? JSON.parse(cached) : [];
const idx = list.findIndex(p => p.id === invId || p.invoiceNumber === invId);
if (idx >= 0) {
list[idx] = { ...list[idx], ...invData };
} else {
list.unshift(invData);
}
localStorage.setItem('sisitus_invoices', JSON.stringify(list));
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
await db.ref(`invoices/${invId}`).update(invData);
}
} catch (e) {
console.warn('[InvoiceService] Sync order to invoices:', e.message);
}
},
async syncOrdersToInvoices(ordersList) {
if (!Array.isArray(ordersList)) return;
for (const tx of ordersList) {
await this.syncOrderToPublicInvoice(tx);
}
},
async getInvoice(id) {
if (!id) return { success: false, message: 'ID dokumen tidak ditemukan' };
if (id === 'INV-2026-11-21-INV-1') {
return {
success: true,
data: {
id: 'INV-2026-11-21-INV-1',
invoiceNumber: 'INV-2026-11-21-INV-1',
clientName: 'PT Sintara Digital Nusantara',
email: 'sisitus.com@gmail.com',
phone: '',
status: 'PAID',
paymentMethod: 'Gopay',
transactionId: 'f8e488ad-7277-4605-9eee-eeb877d23fdf',
orderIdRef: 'INV-1790067823837-0JN3VG',
createdAt: '2026-09-22T00:00:00.000Z',
validUntil: '2026-09-23T00:00:00.000Z',
items: [
{
name: 'Registrasi Domain',
desc: 'Domain: yourschool.sch.id<br>Masa Aktif: 1 Tahun (22 September 2026 - 22 September 2027)',
qty: 1,
price: 59000,
subtotal: 59000
},
{
name: 'Add-on: Privacy Protection',
desc: 'Deskripsi: Layanan pelengkap tambahan<br>Masa Aktif: 1 Tahun (22 September 2026 - 22 September 2027)',
qty: 1,
price: 6625,
subtotal: 6625
},
{
name: 'Add-on: SSL Certificate',
desc: 'Deskripsi: Layanan pelengkap tambahan<br>Masa Aktif: 1 Tahun (22 September 2026 - 22 September 2027)',
qty: 1,
price: 99000,
subtotal: 99000
}
],
subtotal: 164625,
ppn: 18109,
totalAmount: 182734
}
};
}
if (id === 'PROP-SEKOLAH-DEMO') {
return { success: true, data: { ...this.PRESETS.sekolah, id, invoiceNumber: id } };
}
if (id === 'PROP-CORP-DEMO') {
return { success: true, data: { ...this.PRESETS.perusahaan, id, invoiceNumber: id } };
}
if (id === 'PROP-PERSONAL-DEMO') {
return { success: true, data: { ...this.PRESETS.personal, id, invoiceNumber: id } };
}
try {
const cached = localStorage.getItem('sisitus_invoices') || localStorage.getItem('sisitus_proposals');
if (cached) {
const list = JSON.parse(cached);
const item = list.find(p => p.id === id || p.invoiceNumber === id);
if (item) return { success: true, data: item };
}
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
let snap = await db.ref(`invoices/${id}`).once('value');
if (snap.exists()) {
return { success: true, data: { ...snap.val(), id } };
}
snap = await db.ref(`proposals/${id}`).once('value');
if (snap.exists()) {
return { success: true, data: { ...snap.val(), id } };
}
snap = await db.ref(`orders/${id}`).once('value');
if (snap.exists()) {
const mapped = this.mapOrderToInvoice(snap.val(), id);
this.syncOrderToPublicInvoice(snap.val());
return { success: true, data: mapped };
}
}
} catch (fbErr) {
console.warn('[InvoiceService] Firebase RTDB read note:', fbErr.message);
}
try {
const curUser = (typeof AuthManager !== 'undefined' && AuthManager.getCurrentUser) ? AuthManager.getCurrentUser() : null;
const resOrder = await APIClient.getOrderDetail(id, curUser?.userId);
if (resOrder && resOrder.success && (resOrder.data || resOrder.order)) {
return {
success: true,
data: this.mapOrderToInvoice(resOrder.data || resOrder.order, id)
};
}
} catch (apiErr) {
console.warn('[InvoiceService] APIClient fallback note:', apiErr.message);
}
try {
const restInv = await fetch(`https://sisitus-project-default-rtdb.firebaseio.com/invoices/${encodeURIComponent(id)}.json`);
if (restInv.ok) {
const d = await restInv.json();
if (d && typeof d === 'object') return { success: true, data: { ...d, id } };
}
const restProp = await fetch(`https://sisitus-project-default-rtdb.firebaseio.com/proposals/${encodeURIComponent(id)}.json`);
if (restProp.ok) {
const d = await restProp.json();
if (d && typeof d === 'object') return { success: true, data: { ...d, id } };
}
const restOrd = await fetch(`https://sisitus-project-default-rtdb.firebaseio.com/orders/${encodeURIComponent(id)}.json`);
if (restOrd.ok) {
const d = await restOrd.json();
if (d && typeof d === 'object') return { success: true, data: this.mapOrderToInvoice(d, id) };
}
} catch (restErr) {}
return {
success: false,
message: 'Faktur / Proposal dengan ID tersebut tidak ditemukan'
};
},
async saveProposal(proposalData) {
try {
const id = proposalData.id || this.generateProposalId();
proposalData.id = id;
proposalData.updatedAt = new Date().toISOString();
if (!proposalData.createdAt) {
proposalData.createdAt = proposalData.updatedAt;
}
if (!proposalData.status) {
proposalData.status = 'aktif';
}
try {
const cached = localStorage.getItem('sisitus_proposals');
let list = cached ? JSON.parse(cached) : [];
const idx = list.findIndex(p => p.id === id);
if (idx >= 0) {
list[idx] = proposalData;
} else {
list.unshift(proposalData);
}
localStorage.setItem('sisitus_proposals', JSON.stringify(list));
} catch (locErr) {}
try {
const { db } = await getFirebase();
if (db) {
await db.ref(`proposals/${id}`).set(proposalData);
}
} catch (fbErr) {}
return {
success: true,
message: 'Proposal berhasil disimpan',
data: proposalData
};
} catch (e) {
return {
success: false,
message: 'Gagal menyimpan proposal: ' + e.message
};
}
},
async getProposal(id) {
if (!id) return { success: false, message: 'ID proposal tidak ditemukan' };
if (id === 'PROP-SEKOLAH-DEMO') {
return { success: true, data: { ...this.PRESETS.sekolah, id } };
}
if (id === 'PROP-CORP-DEMO') {
return { success: true, data: { ...this.PRESETS.perusahaan, id } };
}
if (id === 'PROP-PERSONAL-DEMO') {
return { success: true, data: { ...this.PRESETS.personal, id } };
}
try {
const cached = localStorage.getItem('sisitus_proposals');
if (cached) {
const list = JSON.parse(cached);
const item = list.find(p => p.id === id);
if (item) return { success: true, data: item };
}
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
const snap = await db.ref(`proposals/${id}`).once('value');
if (snap.exists()) {
return { success: true, data: { ...snap.val(), id } };
}
}
} catch (fbErr) {}
try {
const restProp = await fetch(`https://sisitus-project-default-rtdb.firebaseio.com/proposals/${encodeURIComponent(id)}.json`);
if (restProp.ok) {
const d = await restProp.json();
if (d && typeof d === 'object') return { success: true, data: { ...d, id } };
}
} catch (restErr) {}
return { success: false, message: 'Proposal tidak ditemukan' };
},
async submitProposalSPK(proposalId, spkData) {
try {
const propRes = await this.getProposal(proposalId);
let proposal = propRes.success ? propRes.data : null;
if (!proposal) {
proposal = {
id: proposalId,
clientName: spkData.clientName || 'Klien Terhormat',
title: 'Pengembangan Website',
category: 'perusahaan',
demoUrl: '/demo/perusahaan/'
};
}
const selectedPrice = Number(spkData.selectedPkgPrice) || 1599000;
const dpAmount = Math.round(selectedPrice * 0.5);
const invId = proposal.invoiceId || this.generateId();
const invoiceNumber = this.generateInvoiceNumber(invId);
const invData = {
id: invId,
proposalId: proposalId,
invoiceNumber: invoiceNumber,
clientName: proposal.clientName,
picName: spkData.picName || proposal.picName || '',
phone: spkData.phone || proposal.picPhone || '',
email: spkData.email || proposal.clientEmail || '',
userId: spkData.userId || proposal.userId || '',
title: `Pengembangan Website ${proposal.category === 'perusahaan' ? 'Perusahaan' : (proposal.category === 'sekolah' ? 'Sekolah' : 'Profil')} - ${spkData.selectedPkgName}`,
subtitle: `Nomor Ref Penawaran: ${proposalId} | Paket: ${spkData.selectedPkgName}`,
category: proposal.category || 'perusahaan',
demoUrl: proposal.demoUrl || '/demo/perusahaan/',
totalAmount: selectedPrice,
subtotal: Math.round(selectedPrice / 1.11),
ppn: selectedPrice - Math.round(selectedPrice / 1.11),
dpAmount: dpAmount,
paidAmount: 0,
remainingAmount: selectedPrice,
status: 'UNPAID',
paymentMethod: 'Midtrans / Transfer Bank',
createdAt: new Date().toISOString(),
validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
items: [
{
name: `Paket ${spkData.selectedPkgName}`,
desc: `Paket Pengerjaan Website Sesuai Kesepakatan SPK (Ref: ${proposalId})<br>Masa Aktif: 1 Tahun Penuh`,
qty: 1,
price: selectedPrice,
subtotal: selectedPrice
},
{
name: 'Alokasi Domain & Server Cloud NVMe Performa Tinggi (1 Tahun)',
desc: 'Server Cloud NVMe, Domain Resmi & Setup DNS Terintegrasi<br>Masa Aktif: 1 Tahun Penuh',
qty: 1,
price: 0,
subtotal: 0
},
{
name: 'Sertifikat Keamanan SSL 256-Bit & Maintenance Pemeliharaan',
desc: 'Enkripsi Data SSL 256-Bit, Proteksi DDoS & Garansi Pemeliharaan<br>Masa Aktif: 1 Tahun Penuh',
qty: 1,
price: 0,
subtotal: 0
}
]
};
await this.saveInvoice(invData);
const updatedProposal = {
...proposal,
status: 'deal',
invoiceId: invId,
selectedPackage: spkData.selectedPkgName,
selectedPrice: selectedPrice,
dealAt: new Date().toISOString(),
spk: {
picName: spkData.picName || '',
role: spkData.role || '',
phone: spkData.phone || '',
email: spkData.email || '',
selectedPkgName: spkData.selectedPkgName || '',
selectedPkgPrice: selectedPrice,
notes: spkData.notes || '',
submittedAt: new Date().toISOString()
}
};
await this.saveProposal(updatedProposal);
return {
success: true,
message: 'Surat Perjanjian Kerja (SPK) berhasil disetujui.',
invoiceId: invId,
proposal: updatedProposal,
invoice: invData
};
} catch (e) {
return {
success: false,
message: 'Gagal memproses SPK: ' + e.message
};
}
},
async getUserInvoices(userId, email) {
let list = [];
try {
const cached = localStorage.getItem('sisitus_invoices');
if (cached) {
list = JSON.parse(cached);
}
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
if (userId) {
const snap = await db.ref('invoices').orderByChild('userId').equalTo(userId).once('value');
if (snap.exists()) {
const val = snap.val();
Object.keys(val).forEach(k => {
const item = { ...val[k], id: k };
const idx = list.findIndex(l => l.id === k);
if (idx >= 0) list[idx] = item;
else list.push(item);
});
}
}
if (email) {
const snap2 = await db.ref('invoices').orderByChild('email').equalTo(email).once('value');
if (snap2.exists()) {
const val2 = snap2.val();
Object.keys(val2).forEach(k => {
const item = { ...val2[k], id: k };
const idx = list.findIndex(l => l.id === k);
if (idx >= 0) list[idx] = item;
else list.push(item);
});
}
}
}
} catch (e) {}
return list.filter(inv => {
const matchUser = userId && inv.userId === userId;
const matchEmail = email && inv.email && inv.email.toLowerCase() === email.toLowerCase();
return matchUser || matchEmail;
});
},
async saveInvoice(invoiceData) {
try {
const id = invoiceData.id || this.generateId();
invoiceData.id = id;
if (!invoiceData.invoiceNumber) {
invoiceData.invoiceNumber = this.generateInvoiceNumber(id);
}
invoiceData.updatedAt = new Date().toISOString();
if (!invoiceData.createdAt) {
invoiceData.createdAt = invoiceData.updatedAt;
}
try {
const cached = localStorage.getItem('sisitus_invoices');
let list = cached ? JSON.parse(cached) : [];
const idx = list.findIndex(p => p.id === id);
if (idx >= 0) {
list[idx] = invoiceData;
} else {
list.unshift(invoiceData);
}
localStorage.setItem('sisitus_invoices', JSON.stringify(list));
} catch (locErr) {
console.warn('Gagal simpan ke localStorage:', locErr);
}
try {
const { db } = await getFirebase();
if (db) {
await db.ref(`invoices/${id}`).set(invoiceData);
await db.ref(`proposals/${id}`).set(invoiceData);
}
} catch (fbErr) {
console.warn('[InvoiceService] Firebase sync note:', fbErr.message);
}
return {
success: true,
message: 'Faktur / Proposal berhasil disimpan',
data: invoiceData
};
} catch (e) {
return {
success: false,
message: 'Gagal menyimpan faktur: ' + e.message
};
}
},
async getAllInvoices() {
let list = [];
try {
const cached = localStorage.getItem('sisitus_invoices');
if (cached) {
list = JSON.parse(cached);
}
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
const snap = await db.ref('invoices').once('value');
if (snap.exists()) {
const val = snap.val();
const remoteList = Object.keys(val).map(k => ({ ...val[k], id: k }));
remoteList.forEach(rItem => {
const idx = list.findIndex(l => l.id === rItem.id);
if (idx >= 0) {
list[idx] = rItem;
} else {
list.push(rItem);
}
});
}
}
} catch (fbErr) {
console.warn('[InvoiceService] Firebase fetch note:', fbErr.message);
}
return {
success: true,
data: list
};
},
async deleteInvoice(id) {
if (!id) return { success: false, message: 'ID tidak valid' };
try {
const cached = localStorage.getItem('sisitus_invoices');
if (cached) {
let list = JSON.parse(cached);
list = list.filter(p => p.id !== id);
localStorage.setItem('sisitus_invoices', JSON.stringify(list));
}
} catch (e) {}
try {
const { db } = await getFirebase();
if (db) {
await db.ref(`invoices/${id}`).remove();
await db.ref(`proposals/${id}`).remove();
}
} catch (e) {}
return {
success: true,
message: 'Faktur / Proposal berhasil dihapus'
};
},
async payWithMidtrans(invoiceData, type = 'DP') {
const isPelunasan = type === 'PELUNASAN';
const isDP = type === 'DP';
let amount = invoiceData.totalAmount;
let itemTitle = invoiceData.title;
let orderTypeTag = 'FP';
if (isDP) {
amount = invoiceData.dpAmount || Math.round(invoiceData.totalAmount * 0.5);
itemTitle = `DP (50%) - ${invoiceData.title}`;
orderTypeTag = 'DP';
} else if (isPelunasan) {
amount = invoiceData.remainingAmount || (invoiceData.totalAmount - (invoiceData.paidAmount || invoiceData.dpAmount));
itemTitle = `Pelunasan (Sisa 50%) - ${invoiceData.title}`;
orderTypeTag = 'PELUNASAN';
}
const orderId = `${invoiceData.invoiceNumber || invoiceData.id}-${orderTypeTag}-${Date.now().toString().slice(-4)}`;
const tokenRes = await APIClient.generateMidtransToken({
orderId: orderId,
grossAmount: amount,
customerDetails: {
first_name: invoiceData.clientName,
email: invoiceData.email || 'customer@sisitus.com',
phone: invoiceData.picPhone || invoiceData.phone || '0882010067695'
},
itemDetails: [
{
id: invoiceData.id,
price: amount,
quantity: 1,
name: itemTitle.substring(0, 50)
}
]
});
if (!tokenRes || !tokenRes.success || !tokenRes.data || !tokenRes.data.token) {
throw new Error(tokenRes?.message || 'Gagal membuat sesi pembayaran Midtrans Snap');
}
const snapToken = tokenRes.data.token;
if (!window.snap) {
await this.loadSnapScript();
}
return new Promise((resolve, reject) => {
window.snap.pay(snapToken, {
onSuccess: async (result) => {
if (isDP) {
invoiceData.status = 'DP';
invoiceData.paidAmount = amount;
invoiceData.remainingAmount = Math.max(0, (invoiceData.totalAmount || 0) - amount);
} else {
invoiceData.status = 'LUNAS';
invoiceData.paidAmount = invoiceData.totalAmount;
invoiceData.remainingAmount = 0;
}
invoiceData.paymentMethod = result.payment_type || 'midtrans';
invoiceData.transactionId = result.transaction_id || '';
await this.saveInvoice(invoiceData);
resolve(result);
},
onPending: async (result) => {
invoiceData.status = isDP ? 'PENDING_DP' : 'PENDING';
await this.saveInvoice(invoiceData);
resolve(result);
},
onError: (err) => {
reject(err);
},
onClose: () => {
reject(new Error('Jendela pembayaran ditutup oleh pengguna.'));
}
});
});
},
async loadSnapScript() {
return new Promise((resolve, reject) => {
if (window.snap) return resolve();
const script = document.createElement('script');
script.src = MIDTRANS_CONFIG.SNAP_URL[MIDTRANS_CONFIG.ENVIRONMENT] || MIDTRANS_CONFIG.SNAP_URL.sandbox;
script.setAttribute('data-client-key', MIDTRANS_CONFIG.CLIENT_KEY);
script.onload = () => resolve();
script.onerror = () => reject(new Error('Gagal memuat SDK Midtrans Snap. Silakan refresh halaman.'));
document.head.appendChild(script);
});
}
};
export default InvoiceService;
