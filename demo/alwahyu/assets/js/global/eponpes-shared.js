// Global State
let activeUser = null;
let currentSantriInfo = null;
let currentPengurusInfo = null;
let currentTabId = "dashboard";

// API Fetch Controller — Semua data langsung dari Google Apps Script (Online)
async function callApi(action, data) {
    try {
        const params = new URLSearchParams();
        params.append('action', action);
        if (data) {
            for (let key in data) {
                params.append(key, data[key]);
            }
        }
        const response = await fetch(`${API_URL}?${params.toString()}`);
        return await response.json();
    } catch (err) {
        console.error("GAS API error: ", err);
        return { status: 'error', message: 'Gagal menghubungi server. Periksa koneksi internet Anda.' };
    }
}

// Database Fetcher — Ambil seluruh data dari Spreadsheet via GAS
async function fetchDb() {
    try {
        const response = await fetch(`${API_URL}?action=getDb`);
        const result = await response.json();
        if (result.status === 'success') {
            return result.data;
        } else {
            console.error("GAS getDb failed: ", result.message);
            return { users: [], santri: [], pengurus: [], pembayaran: [], hafalan: [], nilai: [], absensi: [], perizinan: [], pengumuman: [], pengaduan: [], administrasi: [] };
        }
    } catch (err) {
        console.error("GAS getDb error: ", err);
        return { users: [], santri: [], pengurus: [], pembayaran: [], hafalan: [], nilai: [], absensi: [], perizinan: [], pengumuman: [], pengaduan: [], administrasi: [] };
    }
}

// Toast Notification
function showToast(message, isError = false) {
    const toast = document.getElementById('epToast');
    const toastMsg = document.getElementById('epToastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = 'ep-toast show';

    if (isError) {
        toast.classList.add('ep-toast-error');
        const icon = toast.querySelector('.ep-toast-icon i');
        if (icon) icon.className = 'ph-fill ph-x-circle';
    } else {
        toast.classList.add('ep-toast-success');
        const icon = toast.querySelector('.ep-toast-icon i');
        if (icon) icon.className = 'ph-fill ph-check-circle';
    }

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Formatting Helpers
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDateString(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = parseInt(parts[2], 10);
    const m = months[parseInt(parts[1], 10) - 1];
    const y = parts[0];
    return `${d} ${m} ${y}`;
}

// Logout Action
function logout() {
    sessionStorage.removeItem('active_user');
    window.location.href = 'index.html';
}
