/**
 * Form Validators and Validation Utilities
 */

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesia format)
 * Must start with 08 or +62, followed by digits
 */
export function validatePhone(phone) {
  if (!phone) return false;
  phone = phone.replace(/[^\d+]/g, '');
  
  // Must be 8-13 digits
  if (phone.length < 8 || phone.length > 13) return false;
  
  // Must be valid Indonesia number
  if (phone.startsWith('08') && phone.length >= 10 && phone.length <= 12) return true;
  if (phone.startsWith('+628') && phone.length >= 11 && phone.length <= 13) return true;
  
  return false;
}

/**
 * Validate domain name
 */
export function validateDomain(domain) {
  if (!domain) return false;
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Domain packages configuration
 */
export const DOMAIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199000,
    recommended: false,
    features: [
      '1 Email Account',
      '5 GB Storage',
      'SSL Certificate',
      'Free Domain Redirect',
      'Basic Support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 399000,
    recommended: true,
    features: [
      '10 Email Accounts',
      '50 GB Storage',
      'SSL Certificate',
      'Unlimited Subdomains',
      'Database Access',
      'Priority Support'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 699000,
    recommended: false,
    features: [
      'Unlimited Email Accounts',
      'Unlimited Storage',
      'SSL Certificate',
      'Unlimited Subdomains',
      'Database Access',
      'CDN Integration',
      'Daily Backups',
      '24/7 Phone Support'
    ]
  }
];
