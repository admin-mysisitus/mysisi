export const MULTI_PART_EXTENSIONS = ['.co.id', '.my.id', '.sch.id', '.ac.id', '.go.id', '.or.id', '.web.id', '.biz.id', '.net.id', '.it.com'];
/**
 * Parse domain into base and extension
 * @param {string} input - Domain to parse
 * @param {Array} pricingData - Array of domain pricing objects to check extensions against
 * @returns {Object} { base, ext, isFullDomain, isInvalid }
 */
export function parseDomain(input, pricingData = []) {
  const cleaned = input.toLowerCase().trim();
  for (const ext of MULTI_PART_EXTENSIONS) {
    if (cleaned.endsWith(ext)) {
      return {
        base: cleaned.slice(0, -ext.length),
        ext,
        isFullDomain: true,
        isInvalid: false
      };
    }
  }
  if (cleaned.includes('.')) {
    const ext = cleaned.slice(cleaned.lastIndexOf('.'));
    if (pricingData.some(e => e.ext === ext)) {
      return {
        base: cleaned.slice(0, -ext.length),
        ext,
        isFullDomain: true,
        isInvalid: false
      };
    }
    return {
      base: cleaned,
      ext: null,
      isFullDomain: false,
      isInvalid: true
    };
  }
  return {
    base: cleaned,
    ext: null,
    isFullDomain: false,
    isInvalid: false
  };
}
/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @param {Array} pricingData - Array of domain pricing objects to check extensions against
 * @returns {Object} { valid, error }
 */
export function validateDomain(domain, pricingData = []) {
  if (!domain || !domain.trim()) {
    return {
      valid: false,
      error: 'Masukkan nama domain untuk memulai (minimal 3 karakter)'
    };
  }
  const {
    base,
    isInvalid
  } = parseDomain(domain, pricingData);
  if (isInvalid) {
    return {
      valid: false,
      error: 'Ekstensi tidak valid. Coba: .com, .id, .co.id, atau ekstensi lainnya'
    };
  }
  if (base.length < 3) {
    return {
      valid: false,
      error: 'Nama domain minimal 3 karakter'
    };
  }
  const baseRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
  if (!baseRegex.test(base)) {
    return {
      valid: false,
      error: 'Nama domain hanya boleh mengandung huruf, angka, dan strip (-)'
    };
  }
  return {
    valid: true,
    error: null
  };
}