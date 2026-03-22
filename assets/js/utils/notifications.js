/**
 * Centralized Notification & Message Utilities
 * Consolidated from: checkout-auth.js, profile.js, order-history.js, payment.js, checkout.js
 */

/**
 * Display error message in standardized format
 * Handles both single messages and multi-line error lists
 * @param {string} message - Error message (supports newline-separated errors)
 * @param {string} elementId - ID of element to display error in (optional)
 * @param {number} autoDismissMs - Auto-dismiss after ms (default: 5000ms)
 */
function showError(message, elementId = 'auth-error', autoDismissMs = 5000) {
  const errorDiv = document.getElementById(elementId);
  if (!errorDiv) {
    console.error('Error display element not found:', elementId);
    alert(message); // Fallback to alert
    return;
  }

  const errorList = message.split('\n').filter(err => err.trim());
  let errorHTML = '<strong>❌ Error</strong>';
  
  if (errorList.length > 1) {
    errorHTML += '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">';
    errorList.forEach(err => {
      if (err.trim()) errorHTML += `<li>${err}</li>`;
    });
    errorHTML += '</ul>';
  } else {
    errorHTML += `<br>${message}`;
  }

  errorDiv.innerHTML = errorHTML;
  errorDiv.classList.add('show');

  // Auto-dismiss
  if (autoDismissMs > 0) {
    setTimeout(() => {
      errorDiv.classList.remove('show');
    }, autoDismissMs);
  }
}

/**
 * Display success message
 * @param {string} message - Success message
 * @param {string} elementId - ID of element to display message in (optional)
 * @param {number} autoDismissMs - Auto-dismiss after ms (default: 5000ms)
 */
function showSuccess(message, elementId = 'auth-success', autoDismissMs = 5000) {
  const successDiv = document.getElementById(elementId);
  if (!successDiv) {
    console.log('Success:', message);
    return;
  }

  successDiv.innerHTML = `<strong>✅ Sukses</strong><br>${message}`;
  successDiv.classList.add('show');

  if (autoDismissMs > 0) {
    setTimeout(() => {
      successDiv.classList.remove('show');
    }, autoDismissMs);
  }
}

/**
 * Display info/warning message
 * @param {string} message - Info message
 * @param {string} elementId - ID of element to display message in (optional)
 * @param {number} autoDismissMs - Auto-dismiss after ms (default: 0 = no auto dismiss)
 */
function showInfo(message, elementId = null, autoDismissMs = 0) {
  if (!elementId) {
    console.info('Info:', message);
    return;
  }

  const infoDiv = document.getElementById(elementId);
  if (infoDiv) {
    infoDiv.innerHTML = `<strong>ℹ️ Informasi</strong><br>${message}`;
    infoDiv.classList.add('show');

    if (autoDismissMs > 0) {
      setTimeout(() => {
        infoDiv.classList.remove('show');
      }, autoDismissMs);
    }
  }
}

/**
 * Show toast notification (floating message)
 * Creates temporary notification element in DOM
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duration in ms (default: 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  // Try to find existing toast container
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast show ${type}`;
  toast.style.cssText = `
    background: white;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 280px;
    animation: slideIn 0.3s ease-out;
    pointer-events: all;
  `;

  // Add icon based on type
  let icon = '';
  let color = '#333';
  
  if (type === 'success') {
    icon = '✅';
    color = '#28a745';
  } else if (type === 'error') {
    icon = '❌';
    color = '#dc3545';
  } else if (type === 'info') {
    icon = 'ℹ️';
    color = '#0c5460';
  } else if (type === 'warning') {
    icon = '⚠️';
    color = '#856404';
  }

  toast.innerHTML = `
    <span style="color: ${color}; font-weight: bold;">${icon}</span>
    <span style="color: #333;">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

/**
 * Show error message and log to console
 * Combines console logging with user message display
 * @param {string} message - User-facing message
 * @param {string} consoleMessage - Console log message (optional)
 * @param {string} elementId - Element to display error in (optional)
 */
function showErrorMessage(message, consoleMessage = null, elementId = null) {
  // Log to console
  if (consoleMessage) {
    console.error(consoleMessage);
  } else {
    console.error(message);
  }

  // Show to user
  if (elementId) {
    showError(message, elementId);
  } else {
    showToast(message, 'error');
  }
}

/**
 * Show temporary message with specific styling
 * Used for form field validation messages
 * @param {string} elementId - ID of message element
 * @param {string} text - Message text
 * @param {string} type - Type: 'error', 'success'
 */
function showMessage(elementId, text, type) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = text;
  element.className = `message show ${type}`;

  // Auto-hide after 3 seconds
  setTimeout(() => {
    element.classList.remove('show');
  }, 3000);
}

/**
 * Clear all messages from a container
 * @param {string} elementId - ID of message element to clear
 */
function clearMessage(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove('show');
    element.innerHTML = '';
  }
}

/**
 * Show/hide loading spinner in element
 * @param {string} elementId - ID of element to show spinner in
 * @param {boolean} show - True to show, false to hide
 * @param {string} message - Optional loading message
 */
function showLoading(elementId, show = true, message = 'Loading...') {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (show) {
    element.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 10px; color: #666;">${message}</p>
      </div>
    `;
  } else {
    element.innerHTML = '';
  }
}

// Export as ES6 module
export {
  showError,
  showSuccess,
  showInfo,
  showToast,
  showErrorMessage,
  showMessage,
  clearMessage,
  showLoading
};

// Also expose global Notifications object for classical scripts
window.Notifications = {
  showError,
  showSuccess,
  showInfo,
  showToast,
  showErrorMessage,
  showMessage,
  clearMessage,
  showLoading
};
