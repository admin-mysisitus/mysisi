export const MULTI_PART_EXTENSIONS = ['.co.id', '.my.id', '.sch.id', '.ac.id', '.go.id', '.or.id', '.web.id', '.biz.id', '.net.id', '.ponpes.id', '.desa.id', '.it.com'];
export function parseDomain(input, pricingData = []) {
  const cleaned = input.toLowerCase().trim();
  const knownExtensions = [...new Set([...pricingData.map(p => p.ext), ...MULTI_PART_EXTENSIONS])].sort((a, b) => b.length - a.length);
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