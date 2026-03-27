/**
 * Dashboard Home Page Module
 */

import APIClient from '/assets/js/modules/unified-api.js';
import { formatCurrency } from '/assets/js/modules/unified-utils.js';

export async function render(currentUser) {
  try {
    // Get order statistics from userOrderStats endpoint
    let stats = null;
    try {
      const result = await APIClient.getUserOrderStats(currentUser.userId);
      if (result.success) {
        stats = result.data || {};
        // Update dashboard with statistics
        updateStatisticsDisplay(stats);
      }
    } catch (error) {
      console.warn('Statistics not available:', error);
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

function updateStatisticsDisplay(stats) {
  // Update dashboard statistics widgets
  const widgets = {
    'stat-total-orders': stats.totalOrders || 0,
    'stat-total-spent': stats.totalSpent ? formatCurrency(stats.totalSpent) : 'Rp 0',
    'stat-average-order': stats.averageOrderValue ? formatCurrency(stats.averageOrderValue) : 'Rp 0',
    'stat-active-orders': stats.ordersByStatus?.processing || 0,
    'stat-completed': stats.ordersByStatus?.completed || 0
  };
  
  Object.entries(widgets).forEach(([elementId, value]) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  });
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
