document.addEventListener('DOMContentLoaded', () => {
const btnMobileToggle = document.getElementById('btnMobileToggle');
const navMenu = document.getElementById('navMenu');
if (btnMobileToggle && navMenu) {
btnMobileToggle.addEventListener('click', () => {
navMenu.classList.toggle('active');
const icon = btnMobileToggle.querySelector('i');
if (icon) {
icon.classList.toggle('fa-bars');
icon.classList.toggle('fa-times');
}
});
navMenu.querySelectorAll('a').forEach(link => {
link.addEventListener('click', () => {
navMenu.classList.remove('active');
const icon = btnMobileToggle.querySelector('i');
if (icon) {
icon.classList.add('fa-bars');
icon.classList.remove('fa-times');
}
});
});
}
const rfpForm = document.getElementById('rfpForm');
if (rfpForm) {
rfpForm.addEventListener('submit', (e) => {
e.preventDefault();
const company = document.getElementById('rfpCompany').value.trim();
const pic = document.getElementById('rfpPic').value.trim();
const email = document.getElementById('rfpEmail').value.trim();
const phone = document.getElementById('rfpPhone').value.trim();
const service = document.getElementById('rfpService').value;
const scope = document.getElementById('rfpScope').value.trim();
if (!company || !pic || !email || !phone) {
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'warning',
title: 'Mohon Lengkapi Data',
text: 'Nama Perusahaan, PIC, Email resmi, dan No. Telepon wajib diisi.'
});
} else {
alert('Mohon lengkapi formulir permohonan RFP.');
}
return;
}
const submitBtn = document.getElementById('btnSubmitRfp');
const origHtml = submitBtn.innerHTML;
submitBtn.disabled = true;
submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
setTimeout(() => {
submitBtn.disabled = false;
submitBtn.innerHTML = origHtml;
rfpForm.reset();
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'success',
title: 'Permohonan RFP Terkirim!',
html: `<p>Terima kasih <strong>${pic}</strong> (${company}).</p><p style="margin-top:8px;font-size:13px;color:#64748b;">Tim estimasi teknis kami akan meninjau spesifikasi dan menghubungi Anda via email <strong>${email}</strong> atau WhatsApp <strong>${phone}</strong> dalam 1x24 jam kerja.</p>`,
confirmButtonColor: '#2563EB',
confirmButtonText: 'Tutup'
});
} else {
alert('Permohonan RFP berhasil dikirim.');
}
}, 800);
});
}
});
