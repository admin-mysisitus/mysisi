import APIClient from '/assets/js/modules/unified-api.js';
import { AuthManager } from '/assets/js/modules/unified-auth.js';
export async function render() {
const user = AuthManager.getCurrentUser();
const welcomeNameEl = document.getElementById('admin-welcome-name');
if (welcomeNameEl && user && user.displayName) {
welcomeNameEl.textContent = user.displayName;
}
const refreshBtn = document.getElementById('refresh-stats');
if (refreshBtn) {
refreshBtn.addEventListener('click', async () => {
refreshBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Memuat...';
refreshBtn.disabled = true;
await loadStats();
refreshBtn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Refresh Data';
refreshBtn.disabled = false;
if (typeof Swal !== 'undefined') {
Swal.fire({
toast: true,
position: 'top-end',
icon: 'success',
title: 'Data diperbarui',
showConfirmButton: false,
timer: 2000
});
}
});
}
await loadStats();
}
async function loadStats() {
try {
const adminId = AuthManager.getUserId();
const response = await APIClient.getAdminStats(adminId);
if (response.success && response.data) {
const stats = response.data;
const usersEl = document.getElementById('stat-users');
const revenueEl = document.getElementById('stat-revenue');
const subsEl = document.getElementById('stat-subs');
const ticketsEl = document.getElementById('stat-tickets');
if (usersEl) usersEl.textContent = stats.users;
if (revenueEl) revenueEl.textContent = stats.revenue;
if (subsEl) subsEl.textContent = stats.subscriptions;
if (ticketsEl) ticketsEl.textContent = stats.tickets;
const activitiesEl = document.getElementById('recent-activities');
if (activitiesEl && stats.recentActivities) {
if (stats.recentActivities.length === 0) {
activitiesEl.innerHTML = '<p class="activity-empty">Belum ada aktivitas.</p>';
} else {
activitiesEl.innerHTML = stats.recentActivities.map(act => {
let iconStr = '<i class="ph ph-check"></i>';
let iconClass = 'activity-item__icon--transaction';
if (act.type === 'transaction') {
iconStr = '<i class="ph ph-check"></i>';
iconClass = 'activity-item__icon--transaction';
} else if (act.type === 'user') {
iconStr = '<i class="ph ph-user-plus"></i>';
iconClass = 'activity-item__icon--user';
} else {
iconStr = '<i class="ph ph-ticket"></i>';
iconClass = 'activity-item__icon--ticket';
}
let timeText = act.timeStr;
try {
const dateObj = new Date(act.timeStr);
if (!isNaN(dateObj.getTime())) {
const diffMinutes = Math.floor((Date.now() - dateObj.getTime()) / 60000);
if (diffMinutes < 1) timeText = 'Baru saja';
else if (diffMinutes < 60) timeText = `${diffMinutes} menit lalu`;
else if (diffMinutes < 1440) timeText = `${Math.floor(diffMinutes / 60)} jam lalu`;
else timeText = dateObj.toLocaleDateString('id-ID', {
day: 'numeric',
month: 'short'
});
}
} catch (e) {}
return `
<div class="activity-item">
<div class="activity-item__icon ${iconClass}">
${iconStr}
</div>
<div class="activity-item__content">
<p class="activity-item__title">${act.title}</p>
<p class="activity-item__time">${timeText}</p>
</div>
</div>
`;
}).join('');
}
}
renderChart(response.data.chartData);
} else {
throw new Error(response.message || 'Gagal mengambil statistik');
}
} catch (error) {
console.error('Failed to load stats:', error);
if (typeof Swal !== 'undefined') {
Swal.fire({
icon: 'error',
title: 'Error',
text: 'Gagal mengambil data statistik'
});
}
}
}
let registrationChart = null;
function renderChart(chartData) {
const ctx = document.getElementById('registration-chart');
if (!ctx) return;
if (registrationChart) {
registrationChart.destroy();
}
const labels = chartData?.labels || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const dataPoints = chartData?.dataPoints || [0, 0, 0, 0, 0, 0, 0];
registrationChart = new Chart(ctx, {
type: 'line',
data: {
labels: labels,
datasets: [{
label: 'Pendaftaran Baru',
data: dataPoints,
borderColor: '#2563eb',
backgroundColor: 'rgba(37, 99, 235, 0.12)',
borderWidth: 2,
fill: true,
tension: 0.4,
pointBackgroundColor: '#2563eb',
pointBorderColor: '#ffffff',
pointHoverBackgroundColor: '#ffffff',
pointHoverBorderColor: '#2563eb'
}]
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
display: false
},
tooltip: {
backgroundColor: 'rgba(255, 255, 255, 0.95)',
titleColor: '#0f172a',
bodyColor: '#475569',
borderColor: 'rgba(15, 23, 42, 0.1)',
borderWidth: 1,
padding: 10
}
},
scales: {
x: {
grid: {
display: false,
drawBorder: false
},
ticks: {
color: '#64748b'
}
},
y: {
grid: {
color: 'rgba(15, 23, 42, 0.05)',
drawBorder: false
},
ticks: {
color: '#64748b',
stepSize: 10
},
beginAtZero: true
}
}
}
});
}