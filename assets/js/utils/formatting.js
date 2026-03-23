/**
 * Centralized Formatting Utilities
 * Consolidated from: checkout.js, cek-domain.js, order-history.js, profile.js
 */

/**
 * Format number to Indonesian Rupiah currency format
 * Supports both number and string input
 * @param {number|string} value - Value to format
 * @returns {string} Formatted Rupiah string (e.g., "Rp 1.234.567")
 */
function formatRupiah(value) {
  if (!value) return 'Rp 0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format plain number with thousand separators
 * Indonesian format: dots for thousands (e.g., "1.234.567")
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
  if (!num) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date to Indonesian locale
 * Short format: "22 Mar 2026"
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date with time to Indonesian locale
 * Format: "22 Mar 2026 12:30"
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date with time
 */
function formatDateWithTime(dateString) {
  if (!dateString) return '-';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate discount percentage from old and new price
 * @param {number} oldPrice - Original price
 * @param {number} newPrice - Current price
 * @returns {number} Discount percentage (0-100)
 */
function calculateDiscount(oldPrice, newPrice) {
  if (!oldPrice || oldPrice === 0) return 0;
  return Math.round((1 - newPrice / oldPrice) * 100);
}

/**
 * Format time ago from a given date (e.g., "5m yang lalu", "2h yang lalu")
 * @param {Date} date - Date to calculate from
 * @returns {string} Time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Baru saja';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m yang lalu`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h yang lalu`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d yang lalu`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w yang lalu`;
  
  return formatDate(date);
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Converts HTML special characters to entities
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized HTML-safe string
 */
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export all functions for use in DOM-loaded scripts
// This allows profile.js and other scripts to use Formatting.formatRupiah() etc.
window.Formatting = {
  formatRupiah,
  formatNumber,
  formatDate,
  formatDateWithTime,
  calculateDiscount,
  getTimeAgo,
  sanitizeHTML
};

// Also support CommonJS if needed in Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Formatting;
}
