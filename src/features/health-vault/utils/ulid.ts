// ─── Cryptographically Secure, Sortable Unique ID (ULID) Generator ────────────
// Generates a 26-character sortable identifier combining 48-bit timestamp
// and 80-bit entropy, avoiding random Firestore ID sorting limitations.

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ENCODING_LEN = 32;

function encodeTime(now: number, len: number): string {
  let str = '';
  let time = now;
  for (let i = len - 1; i >= 0; i--) {
    const mod = time % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    time = Math.floor(time / ENCODING_LEN);
  }
  return str;
}

function encodeRandom(len: number): string {
  let str = '';
  const randomBytes = new Uint8Array(len);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    // Server-side Node.js environment fallback if web standard crypto is not global
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      const bytes = nodeCrypto.randomBytes(len);
      for (let i = 0; i < len; i++) {
        randomBytes[i] = bytes[i];
      }
    } catch {
      // Math.random secondary fallback in testing/isolated environments
      for (let i = 0; i < len; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }
  }

  for (let i = 0; i < len; i++) {
    str += ENCODING.charAt(randomBytes[i] % ENCODING_LEN);
  }
  return str;
}

/**
 * Generates a sortable unique identifier (ULID).
 * @param now Timestamp in milliseconds (defaults to Date.now()).
 * @returns 26-character alphanumeric uppercase string.
 */
export function ulid(now: number = Date.now()): string {
  return encodeTime(now, 10) + encodeRandom(16);
}
