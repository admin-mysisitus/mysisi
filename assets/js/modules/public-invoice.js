import InvoiceService from '/assets/js/modules/unified-invoice.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
let currentInvoice = null;
function formatRupiah(num) {
    if (!num || isNaN(num)) return 'Rp 0';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}
function formatDateIndo(dateStr) {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
async function loadInvoice() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || urlParams.get('orderId') || urlParams.get('orderid');
    const reqType = (urlParams.get('type') || '').toLowerCase();
    const isDemo = urlParams.get('demo') === 'true' || urlParams.get('demo') === '1';
    let data = null;
    if (id) {
        try {
            if (typeof AuthManager !== 'undefined') {
                AuthManager.init();
                await AuthManager.waitForAuth(800);
            }
        } catch (e) { }
        try {
            const res = await InvoiceService.getInvoice(id);
            if (res && res.success && res.data) {
                data = res.data;
            }
        } catch (e) {
            console.warn('Gagal memuat invoice:', e);
        }
    } else if (reqType || isDemo) {
        const cat = reqType && InvoiceService.PRESETS[reqType] ? reqType : 'sekolah';
        const preset = InvoiceService.PRESETS[cat] || InvoiceService.PRESETS.sekolah;
        data = {
            ...preset,
            id: 'DEMO-' + cat.toUpperCase(),
            invoiceNumber: 'DEMO-' + cat.toUpperCase()
        };
    } else {
        const resSample = await InvoiceService.getInvoice('INV-2026-11-21-INV-1');
        if (resSample && resSample.success) {
            data = resSample.data;
        }
    }
    if (!data) {
        renderNotFoundDOM(id);
        return;
    }
    currentInvoice = data;
    renderInvoiceDOM(data);
}
function renderNotFoundDOM(id) {
    const container = document.getElementById('invoiceContainer');
    if (!container) return;
    const actions = document.querySelector('.invoice-actions');
    if (actions) actions.style.display = 'none';
    document.title = 'Faktur Tidak Ditemukan - sisitus.com';
    container.innerHTML = '<div class="invoice-page not-found-page">' +
        '<div class="not-found-icon"><i class="fas fa-file-circle-xmark"></i></div>' +
        '<h2 class="not-found-title">Faktur / Invoice Tidak Ditemukan</h2>' +
        '<p class="not-found-desc">Dokumen dengan nomor <strong>' + escapeHtml(id || '-') + '</strong> tidak ditemukan di database sistem atau telah dihapus.</p>' +
        '<div class="not-found-actions">' +
        '<a href="/" class="inv-btn inv-btn-dark"><i class="fas fa-home"></i> Kembali ke Beranda</a>' +
        '<a href="/invoice/?type=sekolah" class="inv-btn inv-btn-outline"><i class="fas fa-file-invoice"></i> Lihat Contoh Proposal</a>' +
        '</div>' +
        '</div>';
}
function renderInvoiceDOM(inv) {
    const isPaid = (inv.status || '').toUpperCase() === 'LUNAS' || (inv.status || '').toUpperCase() === 'FP' || (inv.status || '').toUpperCase() === 'PAID';
    const isDP = (inv.status || '').toUpperCase() === 'DP';
    document.title = 'Invoice_' + (inv.invoiceNumber || inv.id);
    const createdDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
    const dueDate = inv.validUntil ? new Date(inv.validUntil) : new Date(createdDate.getTime() + (24 * 60 * 60 * 1000));
    const elHeaderDate = document.getElementById('inv-header-date');
    const elHeaderDue = document.getElementById('inv-header-due');
    const elHeaderNum = document.getElementById('inv-header-number');
    if (elHeaderDate) elHeaderDate.textContent = formatDateIndo(createdDate);
    if (elHeaderDue) elHeaderDue.textContent = formatDateIndo(dueDate);
    if (elHeaderNum) elHeaderNum.textContent = inv.invoiceNumber || inv.id;
    const elBilledName = document.getElementById('inv-billed-name');
    const elBilledEmail = document.getElementById('inv-billed-email');
    const elBilledPhone = document.getElementById('inv-billed-phone');
    if (elBilledName) elBilledName.textContent = inv.clientName || inv.name || 'PT Sintara Digital Nusantara';
    if (elBilledEmail) elBilledEmail.textContent = inv.picName ? (inv.picName + ' (' + (inv.picPhone || '0882-0100-67695') + ')') : (inv.email || 'sisitus.com@gmail.com');
    if (elBilledPhone) elBilledPhone.textContent = inv.phone || '';
    const statusBadge = document.getElementById('inv-status-badge');
    const watermarkStamp = document.getElementById('watermarkStamp');
    if (statusBadge) {
        if (isPaid) {
            statusBadge.className = 'inv-badge-paid';
            statusBadge.textContent = 'PAID / LUNAS';
        } else if (isDP) {
            statusBadge.className = 'inv-badge-dp';
            statusBadge.textContent = 'DP TERBAYAR (50%)';
        } else {
            statusBadge.className = 'inv-badge-unpaid';
            statusBadge.textContent = 'UNPAID';
        }
    }
    if (watermarkStamp) {
        if (isPaid) {
            watermarkStamp.className = 'inv-watermark-stamp visible';
            watermarkStamp.textContent = 'PAID';
        } else if (isDP) {
            watermarkStamp.className = 'inv-watermark-stamp visible';
            watermarkStamp.textContent = 'DP PAID';
        } else {
            watermarkStamp.className = 'inv-watermark-stamp';
        }
    }
    const elMethod = document.getElementById('inv-method-text');
    const elRef = document.getElementById('inv-ref-text');
    const elOrder = document.getElementById('inv-order-text');
    if (elMethod) elMethod.textContent = isPaid ? (inv.paymentMethod || 'Gopay') : 'Midtrans Payment Gateway';
    if (elRef) elRef.textContent = 'Ref: ' + (inv.transactionId || 'f8e488ad-7277-4605-9eee-eeb877d23fdf');
    if (elOrder) elOrder.textContent = 'Order: ' + (inv.orderIdRef || inv.invoiceNumber || inv.id);
    const tbody = document.getElementById('invoiceTableBody');
    const items = inv.items || [
        { name: inv.title || 'Pengembangan Website Profesional', qty: 1, price: inv.totalAmount || 1299000, subtotal: inv.totalAmount || 1299000 }
    ];
    let featuresHtml = '';
    if (inv.features && Array.isArray(inv.features) && inv.features.length > 0) {
        featuresHtml = '<ul class="inv-features-list">' + inv.features.map(f => '<li><i class="fas fa-check-circle"></i> <span>' + escapeHtml(f) + '</span></li>').join('') + '</ul>';
    }
    let demoLinkHtml = '';
    if (inv.demoUrl) {
        demoLinkHtml = '<div><a href="' + escapeHtml(inv.demoUrl) + '" target="_blank" rel="noopener noreferrer" class="inv-demo-pill"><i class="fas fa-external-link-alt"></i> <span>Live Demo: ' + escapeHtml(inv.demoUrl) + '</span></a></div>';
    }
    if (tbody) {
        tbody.innerHTML = items.map((it, idx) => {
            let descContent = it.desc || '';
            if (!descContent) {
                descContent = (idx === 0 ? ('Layanan: ' + escapeHtml(inv.subtitle || 'Solusi Website Terpadu') + '<br>') : '') +
                    (idx === 0 && demoLinkHtml ? demoLinkHtml : '') +
                    (idx === 0 && featuresHtml ? featuresHtml : '') +
                    'Masa Aktif: 1 Tahun Penuh (' + formatDateIndo(createdDate) + ' - ' + formatDateIndo(dueDate) + ')';
            }
            return '<tr>' +
                '<td class="col-desc">' +
                '<strong class="inv-item-title">' + escapeHtml(it.name) + '</strong>' +
                '<div class="inv-item-desc">' + descContent + '</div>' +
                '</td>' +
                '<td class="col-qty">' + (it.qty || 1) + '</td>' +
                '<td class="col-unit-price">' + formatRupiah(it.price || 0) + '</td>' +
                '<td class="col-total">' + formatRupiah(it.subtotal || it.price || 0) + '</td>' +
                '</tr>';
        }).join('');
    }
    const total = Number(inv.totalAmount) || 1299000;
    const subtotal = inv.subtotal !== undefined ? Number(inv.subtotal) : Math.round(total / 1.11);
    const ppn = inv.ppn !== undefined ? Number(inv.ppn) : (total - subtotal);
    const dp = Number(inv.dpAmount) || Math.round(total * 0.5);
    const elSubtotal = document.getElementById('inv-subtotal');
    const elPpn = document.getElementById('inv-ppn');
    const elRowDp = document.getElementById('row-dp-summary');
    const elDpVal = document.getElementById('inv-dp-val');
    const elTotalDue = document.getElementById('inv-total-due');
    if (elSubtotal) elSubtotal.textContent = formatRupiah(subtotal);
    if (elPpn) elPpn.textContent = formatRupiah(ppn);
    const elGrandTotal = document.getElementById('inv-grand-total');
    if (elGrandTotal) elGrandTotal.textContent = formatRupiah(total);
    const elLabel = document.getElementById('inv-total-due-label');
    if (elRowDp && elDpVal) {
        if (isDP) {
            elRowDp.style.display = 'flex';
            const lbl = elRowDp.querySelector('.inv-summary-label');
            if (lbl) lbl.textContent = 'Sudah Dibayar (DP 50%)';
            elDpVal.textContent = formatRupiah(dp);
        } else if (!isPaid && dp < total && inv.demoUrl) {
            elRowDp.style.display = 'flex';
            const lbl = elRowDp.querySelector('.inv-summary-label');
            if (lbl) lbl.textContent = 'Opsi DP (50%)';
            elDpVal.textContent = formatRupiah(dp);
        } else {
            elRowDp.style.display = 'none';
        }
    }
    if (elTotalDue) {
        if (isPaid) {
            if (elLabel) elLabel.textContent = 'Sisa Tagihan';
            elTotalDue.textContent = 'Rp 0 (Lunas)';
            elTotalDue.className = 'inv-summary-total due-paid';
        } else if (isDP) {
            const remaining = inv.remainingAmount !== undefined ? Number(inv.remainingAmount) : Math.max(0, total - dp);
            if (elLabel) elLabel.textContent = 'Sisa Pelunasan (50%)';
            elTotalDue.textContent = formatRupiah(remaining);
            elTotalDue.className = 'inv-summary-total';
        } else {
            if (elLabel) elLabel.textContent = 'Total Tagihan';
            elTotalDue.textContent = formatRupiah(total);
            elTotalDue.className = 'inv-summary-total';
        }
    }
    const elQr = document.getElementById('inv-qr-image');
    if (elQr) {
        elQr.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(window.location.href);
    }
    const btnDemo = document.getElementById('btn-open-demo-site');
    if (btnDemo) {
        if (inv.demoUrl) {
            btnDemo.style.display = 'inline-flex';
            btnDemo.href = inv.demoUrl;
        } else {
            btnDemo.style.display = 'none';
        }
    }
    setupActions(inv, isPaid, isDP);
}
function setupActions(inv, isPaid, isDP) {
    const btnPrint = document.getElementById('btn-print-pdf');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }
    const btnPay = document.getElementById('btn-pay-online');
    if (btnPay) {
        if (isPaid) {
            btnPay.style.display = 'none';
        } else {
            btnPay.style.display = 'inline-flex';
            const payType = isDP ? 'PELUNASAN' : 'DP';
            const btnLabel = isDP ? '<i class="fas fa-credit-card"></i> Bayar Pelunasan (Midtrans)' : '<i class="fas fa-credit-card"></i> Bayar DP 50% (Midtrans)';
            btnPay.innerHTML = btnLabel;
            btnPay.addEventListener('click', async () => {
                try {
                    btnPay.disabled = true;
                    btnPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan Midtrans...';
                    await InvoiceService.payWithMidtrans(inv, payType);
                    window.location.reload();
                } catch (e) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'info',
                            title: 'Pembayaran Online',
                            text: e.message || 'Mengarahkan ke konfirmasi transfer via WhatsApp.',
                            confirmButtonText: 'Konfirmasi WhatsApp'
                        }).then(() => {
                            triggerWA(inv);
                        });
                    } else {
                        triggerWA(inv);
                    }
                } finally {
                    btnPay.disabled = false;
                    btnPay.innerHTML = btnLabel;
                }
            });
        }
    }
    const btnShare = document.getElementById('btn-share-link');
    if (btnShare) {
        btnShare.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Link Faktur Tersalin!',
                        text: 'Tautan invoice resmi siap dibagikan.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    alert('Link invoice berhasil disalin!');
                }
            });
        });
    }
    const btnWa = document.getElementById('btn-wa-confirm');
    if (btnWa) {
        btnWa.addEventListener('click', () => {
            triggerWA(inv);
        });
    }
}
function triggerWA(inv) {
    const msg = '*KONFIRMASI INVOICE / FAKTUR SISITUS*' +
        '\n----------------------------------------' +
        '\n*No. Invoice:* ' + (inv.invoiceNumber || inv.id) +
        '\n*Klien:* ' + (inv.clientName || 'Klien') +
        '\n*Layanan:* ' + (inv.title || 'Layanan Website') +
        '\n*Total:* ' + formatRupiah(inv.totalAmount) +
        '\n*Status:* ' + (inv.status || 'BELUM BAYAR') +
        '\n----------------------------------------' +
        '\nHalo Tim SISITUS, saya ingin mengonfirmasi tagihan invoice ini. Mohon panduan pembayarannya. Terima kasih!';
    window.open('https://wa.me/62882010067695?text=' + encodeURIComponent(msg), '_blank');
}
window.addEventListener('DOMContentLoaded', loadInvoice);
