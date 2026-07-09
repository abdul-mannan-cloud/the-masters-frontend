// Shared input formatting/validation — every phone/CNIC field in the app
// must use these instead of hand-rolling its own regex, so behavior stays
// identical everywhere. Component state always holds raw digits; these
// functions only produce the display string.
export const stripNonDigits = (value = "") => (value ?? "").toString().replace(/\D/g, "");

export const formatCnic = (value = "") => {
  const digits = stripNonDigits(value).slice(0, 13);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);
  return [part1, part2, part3].filter(Boolean).join("-");
};

export const formatPhone = (value = "") => {
  const digits = stripNonDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 4);
  const part2 = digits.slice(4, 11);
  return [part1, part2].filter(Boolean).join("-");
};

// Pakistani mobile numbers: 11 digits, always starting "03".
export const isValidPhone = (value = "") => /^03\d{9}$/.test(stripNonDigits(value));

// NADRA CNIC: exactly 13 digits.
export const isValidCnic = (value = "") => /^\d{13}$/.test(stripNonDigits(value));

export const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
