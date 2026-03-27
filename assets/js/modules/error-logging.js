/**
 * CENTRALIZED ERROR LOGGING MODULE
 * ================================
 * Production-ready error tracking and logging
 * - Captures errors with context
 * - Sends to logging service (optional)
 * - Maintains local error history
 * - Provides error analytics
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
    this.enableRemoteLogging = false;
    this.remoteLoggingUrl = null;
  }

  /**
   * Initialize remote logging (e.g., Sentry, LogRocket)
   */
  initializeRemoteLogging(url) {
    this.enableRemoteLogging = true;
    this.remoteLoggingUrl = url;
  }

  /**
   * Log an error with full context
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || '',
      type: error.name || 'Error',
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: context,
      userId: this._getUserId(),
      sessionId: this._getSessionId()
    };

    // Add to local history
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Store in localStorage for persistence
    this._persistError(errorEntry);

    // Log to console in development
    if (!this._isProduction()) {
      console.error('🔴 ERROR LOGGED:', errorEntry);
    }

    // Send to remote service if enabled
    if (this.enableRemoteLogging) {
      this._sendToRemote(errorEntry);
    }

    return errorEntry;
  }

  /**
   * Log a warning
   */
  logWarning(message, context = {}) {
    const warningEntry = {
      timestamp: new Date().toISOString(),
      message: message,
      level: 'warning',
      url: window.location.href,
      context: context,
      userId: this._getUserId(),
      sessionId: this._getSessionId()
    };

    if (!this._isProduction()) {
      console.warn('⚠️ WARNING LOGGED:', warningEntry);
    }

    if (this.enableRemoteLogging) {
      this._sendToRemote(warningEntry);
    }

    return warningEntry;
  }

  /**
   * Log API errors specifically
   */
  logAPIError(action, statusCode, response, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      type: 'API_ERROR',
      action: action,
      statusCode: statusCode,
      response: response,
      context: context,
      url: window.location.href,
      userId: this._getUserId(),
      sessionId: this._getSessionId()
    };

    if (!this._isProduction()) {
      console.error('🔴 API ERROR:', errorEntry);
    }

    if (this.enableRemoteLogging) {
      this._sendToRemote(errorEntry);
    }

    return errorEntry;
  }

  /**
   * Get error history
   */
  getErrorHistory(limit = 10) {
    return this.errors.slice(-limit).reverse();
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errors.length,
      byType: {},
      recentErrors: this.getErrorHistory(10)
    };

    this.errors.forEach(err => {
      const type = err.type || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errors = [];
    localStorage.removeItem('error_log_history');
  }

  /**
   * Export error history as JSON
   */
  exportErrorHistory() {
    return JSON.stringify(this.getErrorStats(), null, 2);
  }

  // ===== PRIVATE METHODS =====

  /**
   * Get user ID from session storage
   */
  _getUserId() {
    try {
      const session = JSON.parse(sessionStorage.getItem('auth_session') || '{}');
      return session.userId || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get session ID
   */
  _getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session-' + Date.now();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Persist error to localStorage
   */
  _persistError(errorEntry) {
    try {
      const history = JSON.parse(localStorage.getItem('error_log_history') || '[]');
      history.push(errorEntry);
      if (history.length > this.maxErrors) {
        history.shift();
      }
      localStorage.setItem('error_log_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not persist error to localStorage:', e);
    }
  }

  /**
   * Check if production environment
   */
  _isProduction() {
    return window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127');
  }

  /**
   * Send error to remote logging service
   */
  _sendToRemote(errorEntry) {
    if (!this.remoteLoggingUrl) return;

    try {
      fetch(this.remoteLoggingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEntry)
      }).catch(err => {
        console.warn('Failed to send error to remote logging:', err);
      });
    } catch (e) {
      console.warn('Error in remote logging:', e);
    }
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

/**
 * Setup global error handler
 */
export function setupGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error, {
      type: 'uncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(event.reason, {
      type: 'unhandledRejection'
    });
  });
}

/**
 * Export individual logging functions for convenience
 */
export const logError = (error, context) => errorLogger.logError(error, context);
export const logWarning = (message, context) => errorLogger.logWarning(message, context);
export const logAPIError = (action, status, response, context) => 
  errorLogger.logAPIError(action, status, response, context);
