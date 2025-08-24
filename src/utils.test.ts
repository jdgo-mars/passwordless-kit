import { describe, it, expect, vi } from 'vitest'
import { bufferToBase64url, base64urlToBuffer, generateChallenge, isWebAuthnSupported } from './utils'

describe('utils', () => {
  describe('bufferToBase64url', () => {
    it('should convert buffer to base64url', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer
      const result = bufferToBase64url(buffer)
      expect(result).toBe('SGVsbG8')
    })

    it('should handle empty buffer', () => {
      const buffer = new ArrayBuffer(0)
      const result = bufferToBase64url(buffer)
      expect(result).toBe('')
    })
  })

  describe('base64urlToBuffer', () => {
    it('should convert base64url to buffer', () => {
      const base64url = 'SGVsbG8'
      const result = base64urlToBuffer(base64url)
      const bytes = new Uint8Array(result)
      expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111])
    })

    it('should handle empty string', () => {
      const result = base64urlToBuffer('')
      expect(result.byteLength).toBe(0)
    })
  })

  describe('generateChallenge', () => {
    it('should generate 32-byte challenge', () => {
      const challenge = generateChallenge()
      expect(challenge).toBeInstanceOf(Uint8Array)
      expect(challenge.length).toBe(32)
    })

    it('should generate different challenges', () => {
      const challenge1 = generateChallenge()
      const challenge2 = generateChallenge()
      expect(challenge1).not.toEqual(challenge2)
    })
  })

  describe('isWebAuthnSupported', () => {
    it('should return true when WebAuthn is supported', () => {
      Object.defineProperty(globalThis, 'window', {
        value: { PublicKeyCredential: {} },
        writable: true,
      })
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          credentials: {
            create: vi.fn(),
            get: vi.fn(),
          },
        },
        writable: true,
      })

      const supported = isWebAuthnSupported()
      expect(supported).toBe(true)
    })

    it('should return false when WebAuthn is not supported', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
      })

      const supported = isWebAuthnSupported()
      expect(supported).toBe(false)
    })
  })
})