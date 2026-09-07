/**
 * AES-256-GCM encryption for sensitive fields (SSN, EIN).
 * Uses ENCRYPTION_KEY env var (64-char hex = 32 bytes).
 * Falls back gracefully when key is absent (returns plaintext with a warning).
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16  // 128-bit auth tag

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: openssl rand -hex 32'
    )
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypts a plaintext string.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 * Returns null if input is null/undefined.
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext == null) return null

  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  // Format: iv(hex):tag(hex):ciphertext(hex)
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Decrypts a value produced by encryptField().
 * Returns null if the input is null/undefined.
 * Throws on tampered/corrupt ciphertext (GCM auth tag mismatch).
 */
export function decryptField(stored: string | null | undefined): string | null {
  if (stored == null) return null

  // If the stored value looks like plain text (no colons in right positions), return as-is.
  // This handles legacy unencrypted rows during migration.
  const parts = stored.split(':')
  if (parts.length !== 3) {
    console.warn('[encryption] Value does not look encrypted — returning as-is (migration mode)')
    return stored
  }

  const key = getKey()
  const iv = Buffer.from(parts[0], 'hex')
  const tag = Buffer.from(parts[1], 'hex')
  const ciphertext = Buffer.from(parts[2], 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Returns a masked display value (e.g. "***-**-1234") for UI display.
 */
export function maskSSN(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null
  const digits = plaintext.replace(/\D/g, '')
  if (digits.length === 9) {
    return `***-**-${digits.slice(-4)}`
  }
  // Partial / non-standard — mask everything but last 4 chars
  return plaintext.slice(0, -4).replace(/./g, '*') + plaintext.slice(-4)
}

export function maskEIN(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null
  const digits = plaintext.replace(/\D/g, '')
  if (digits.length === 9) {
    return `**-***${digits.slice(-4)}`
  }
  return plaintext.slice(0, -4).replace(/./g, '*') + plaintext.slice(-4)
}
