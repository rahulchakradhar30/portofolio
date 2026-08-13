import { createHash } from 'crypto';

export interface ImageValidationResult {
  valid: boolean;
  format: 'jpeg' | 'png' | 'webp' | 'gif' | 'svg' | 'unknown';
  error?: string;
}

/**
 * Validates file signature (magic bytes) to ensure file content matches image type.
 */
export function validateImageMagicBytes(buffer: Buffer): ImageValidationResult {
  if (!buffer || buffer.length < 8) {
    return { valid: false, format: 'unknown', error: 'File is empty or corrupted' };
  }

  // Check JPEG (FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // Check PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, format: 'png' };
  }

  // Check WebP (RIFF .... WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: 'webp' };
  }

  // Check GIF (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: true, format: 'gif' };
  }

  // Check SVG (text based)
  const headerStr = buffer.slice(0, 1024).toString('utf8').toLowerCase();
  if (headerStr.includes('<svg') || (headerStr.includes('<?xml') && headerStr.includes('svg'))) {
    // Sanitize SVG against XSS
    if (
      headerStr.includes('<script') ||
      headerStr.includes('onload=') ||
      headerStr.includes('onerror=') ||
      headerStr.includes('javascript:')
    ) {
      return { valid: false, format: 'svg', error: 'Unsafe SVG content detected' };
    }
    return { valid: true, format: 'svg' };
  }

  return { valid: false, format: 'unknown', error: 'Unrecognized image file format or magic bytes' };
}

/**
 * Computes SHA-256 hash of a file buffer for deduplication.
 */
export function computeFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
