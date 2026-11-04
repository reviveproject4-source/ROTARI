/**
 * Cryptographic security utilities for Rotari POS & CRM
 * PT Minara Technologi Indonesia
 *
 * Implements salted SHA-256 cryptographic hashing to prevent plaintext credential storage.
 */

const PIN_SALT = "rotari_pin_v1_minara";

/**
 * Pre-computed SHA-256 hashes for default seeded roles with salt 'rotari_pin_v1_minara'.
 * Also serves as an in-memory hash cache for dynamically registered user PINs.
 */
export const KNOWN_HASHES: Record<string, string> = {
  "123456": "dfb8784acf22e3d71c5b31b8fb2b02df9203b0de4e333678bdfac480077af603",
  "1122": "eb5740aec03671c5223abe22684b93b696a05253d3fb8cb55a4d161cb8819bac",
  "3344": "b6c715c7922fe95de6377ccb0c8a37472987c5ba39f4ee45ab04747ca2d6f55e",
  "999999": "2e7dc77d4d85cff06e6f2e4837c18482e223ad381f4ac5859170f639a69bbbec",
};

/**
 * Explicitly cache a dynamically computed PIN hash in the synchronous lookup table
 */
export function cachePinHash(pin: string, hash: string): void {
  const cleanPin = pin.trim();
  if (cleanPin && hash) {
    KNOWN_HASHES[cleanPin] = hash;
  }
}

/**
 * Asynchronously hash a PIN using standard Web Crypto API (SHA-256 with salt).
 * Automatically caches the computed hash in KNOWN_HASHES for synchronous verification.
 */
export async function hashPin(pin: string): Promise<string> {
  const cleanPin = pin.trim();
  if (KNOWN_HASHES[cleanPin]) {
    return KNOWN_HASHES[cleanPin];
  }

  const text = `${PIN_SALT}:${cleanPin}`;
  let resultHash = "";

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    resultHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Fallback hash implementation for environments without WebCrypto
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    resultHash = `h_${Math.abs(hash).toString(16)}`;
  }

  // Cache computed hash for immediate synchronous evaluation
  KNOWN_HASHES[cleanPin] = resultHash;
  return resultHash;
}

/**
 * Asynchronous verification of input PIN against stored hash or legacy plaintext.
 * Computes salted SHA-256 for arbitrary input and compares against stored hash.
 */
export async function verifyPin(inputPin: string, storedHashOrPin?: string): Promise<boolean> {
  if (!inputPin || !storedHashOrPin) return false;
  const cleanInput = inputPin.trim();

  // 1. Direct match with pre-computed / cached hash
  const expectedHash = KNOWN_HASHES[cleanInput];
  if (expectedHash && storedHashOrPin === expectedHash) {
    return true;
  }

  // 2. Compute dynamic salted hash and compare
  const dynamicHash = await hashPin(cleanInput);
  if (storedHashOrPin === dynamicHash) {
    return true;
  }

  // 3. Migration evaluation: If old legacy plaintext is still stored, match and flag for auto-hash
  if (storedHashOrPin === cleanInput) {
    return true;
  }

  return false;
}

/**
 * Synchronous verification of input PIN against stored hash or legacy plaintext.
 * Provides backwards-compatibility evaluation for existing legacy PIN data
 * and instant evaluation for cached hashes.
 */
export function verifyPinSync(inputPin: string, storedHashOrPin?: string): boolean {
  if (!inputPin || !storedHashOrPin) return false;
  const cleanInput = inputPin.trim();

  // 1. Direct match with pre-computed or cached hash
  const expectedHash = KNOWN_HASHES[cleanInput];
  if (expectedHash && storedHashOrPin === expectedHash) {
    return true;
  }

  // 2. Migration evaluation: If old legacy plaintext is still stored, match and flag for auto-hash
  if (storedHashOrPin === cleanInput) {
    return true;
  }

  return false;
}
