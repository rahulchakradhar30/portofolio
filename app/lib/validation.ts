export function validateEmail(email: string | unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeString(val: string | unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim();
}
