export function validateEmail(email: string | unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(val: string | unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim();
}

export function validateRequiredString(val: unknown, fieldName: string, maxLength: number = 500): { valid: true; value: string } | { valid: false; error: string } {
  if (typeof val !== 'string') return { valid: false, error: `${fieldName} must be a string` };
  const sanitized = val.trim();
  if (!sanitized) return { valid: false, error: `${fieldName} is required` };
  if (sanitized.length > maxLength) return { valid: false, error: `${fieldName} exceeds maximum length of ${maxLength}` };
  return { valid: true, value: sanitized };
}

export function validateOptionalString(val: unknown, maxLength: number = 500): { valid: true; value: string | undefined } | { valid: false; error: string } {
  if (val === undefined || val === null || val === '') return { valid: true, value: undefined };
  if (typeof val !== 'string') return { valid: false, error: `Field must be a string` };
  const sanitized = val.trim();
  if (sanitized.length > maxLength) return { valid: false, error: `Field exceeds maximum length of ${maxLength}` };
  return { valid: true, value: sanitized };
}
