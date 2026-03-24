/**
 * Dashboard Home Page Module
 */

import APIClient from '/assets/js/modules/unified-api.js';

export async function render(currentUser) {
  try {
    // Get analytics data if available
    let stats = null;
    try {
      const result = await APIClient.getAnalytics(currentUser.userId);
      stats = result.data || {};
    } catch (error) {
      console.warn('Analytics not available yet:', error);
    }

    // Setup event listeners
    setupEventListeners(currentUser);

  } catch (error) {
    console.error('Error rendering dashboard:', error);
    document.getElementById('content').innerHTML = `
      <div class="alert alert-error">
        ${error.message}
      </div>
    `;
  }
}

function setupEventListeners(currentUser) {
  // Quick action buttons
  const btnCheckout = document.getElementById('btn-quick-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      window.location.hash = '#!checkout';
    });
  }

  const btnOrders = document.getElementById('btn-quick-orders');
  if (btnOrders) {
    btnOrders.addEventListener('click', () => {
      window.location.hash = '#!orders';
    });
  }

  const btnProfile = document.getElementById('btn-quick-profile');
  if (btnProfile) {
    btnProfile.addEventListener('click', () => {
      window.location.hash = '#!profile';
    });
  }
}
