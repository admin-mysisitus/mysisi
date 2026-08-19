export const MULTI_PART_EXTENSIONS = ['.co.id', '.my.id', '.sch.id', '.ac.id', '.go.id', '.or.id', '.web.id', '.biz.id', '.net.id', '.ponpes.id', '.desa.id', '.it.com'];

/**
 * Parse domain into base and extension
 * @param {string} input - Domain to parse
 * @param {Array} pricingData - Array of domain pricing objects to check extensions against
 * @returns {Object} { base, ext, isFullDomain, isInvalid }
 */
export function parseDomain(input, pricingData = []) {
  const cleaned = input.toLowerCase().trim();
  
  // 1. Compile all known extensions (from pricing + hardcoded multi-parts)
  const knownExtensions = [
    ...new Set([
      ...pricingData.map(p => p.ext),
      ...MULTI_PART_EXTENSIONS
    ])
  ].sort((a, b) => b.length - a.length); // Sort longest first to match .ponpes.id before .id

  // 2. Check against known extensions
  for (const ext of knownExtensions) {
    if (cleaned.endsWith(ext)) {
      return {
        base: cleaned.slice(0, -ext.length),
        ext,
        isFullDomain: true,
        isInvalid: false
      };
    }
  }

  // 3. Fallback for unknown extensions (split at the first dot)
  if (cleaned.includes('.')) {
    const firstDotIndex = cleaned.indexOf('.');
    const base = cleaned.slice(0, firstDotIndex);
    const ext = cleaned.slice(firstDotIndex);
    return {
      base,
      ext,
      isFullDomain: true,
      isUnsupportedExt: true,
      isInvalid: false
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
      error: 'Masukkan nama domain untuk memulai (minimal 2 karakter)'
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
  if (base.length < 2) {
    return {
      valid: false,
      error: 'Nama domain minimal 2 karakter'
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