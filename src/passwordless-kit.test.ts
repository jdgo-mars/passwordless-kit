import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PasswordlessKit } from './passwordless-kit'

// Mock WebAuthn API
const mockCreate = vi.fn()
const mockGet = vi.fn()
const mockIsUserVerifyingPlatformAuthenticatorAvailable = vi.fn()

Object.defineProperty(globalThis, 'navigator', {
  value: {
    credentials: {
      create: mockCreate,
      get: mockGet,
    },
  },
  writable: true,
})

Object.defineProperty(globalThis, 'window', {
  value: {
    location: { hostname: 'localhost' },
    PublicKeyCredential: {
      isUserVerifyingPlatformAuthenticatorAvailable: mockIsUserVerifyingPlatformAuthenticatorAvailable,
    },
  },
  writable: true,
})

Object.defineProperty(globalThis, 'document', {
  value: { title: 'Test App' },
  writable: true,
})

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
  writable: true,
})

describe('PasswordlessKit', () => {
  let kit: PasswordlessKit

  beforeEach(() => {
    vi.clearAllMocks()
    kit = new PasswordlessKit()
  })

  it('should create instance with default options', () => {
    expect(kit).toBeInstanceOf(PasswordlessKit)
  })

  it('should create instance with custom options', () => {
    const customKit = new PasswordlessKit({
      rpId: 'example.com',
      rpName: 'Custom App',
      timeout: 30000,
      userVerification: 'required',
    })
    expect(customKit).toBeInstanceOf(PasswordlessKit)
  })

  it('should check WebAuthn support', () => {
    const supported = kit.isSupported()
    expect(supported).toBe(true)
  })

  it('should check platform authenticator availability', async () => {
    mockIsUserVerifyingPlatformAuthenticatorAvailable.mockResolvedValue(true)
    
    const available = await kit.isPlatformAuthenticatorAvailable()
    expect(available).toBe(true)
    expect(mockIsUserVerifyingPlatformAuthenticatorAvailable).toHaveBeenCalled()
  })

  it('should handle platform authenticator check failure', async () => {
    mockIsUserVerifyingPlatformAuthenticatorAvailable.mockRejectedValue(new Error('Not available'))
    
    const available = await kit.isPlatformAuthenticatorAvailable()
    expect(available).toBe(false)
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockCredential = {
        rawId: new ArrayBuffer(32),
        response: {
          getPublicKey: vi.fn().mockReturnValue(new ArrayBuffer(65)),
          attestationObject: new ArrayBuffer(100),
          clientDataJSON: new ArrayBuffer(50),
        },
      }

      mockCreate.mockResolvedValue(mockCredential)

      const result = await kit.register({ username: 'testuser' })

      expect(result.credential).toBe(mockCredential)
      expect(result.credentialId).toBeDefined()
      expect(result.publicKey).toBe(mockCredential.response.getPublicKey())
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should throw error when registration fails', async () => {
      mockCreate.mockRejectedValue(new Error('Failed'))

      await expect(kit.register({ username: 'testuser' })).rejects.toThrow('Registration failed')
    })

    it('should handle user cancellation', async () => {
      const error = new Error('User cancelled')
      error.name = 'NotAllowedError'
      mockCreate.mockRejectedValue(error)

      await expect(kit.register({ username: 'testuser' })).rejects.toMatchObject({
        code: 'USER_CANCELLED',
        message: 'User cancelled registration',
      })
    })
  })

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      const mockCredential = {
        rawId: new ArrayBuffer(32),
        response: {
          authenticatorData: new ArrayBuffer(37),
          signature: new ArrayBuffer(64),
          clientDataJSON: new ArrayBuffer(50),
          userHandle: new ArrayBuffer(16),
        },
      }

      mockGet.mockResolvedValue(mockCredential)

      const result = await kit.authenticate()

      expect(result.credential).toBe(mockCredential)
      expect(result.credentialId).toBeDefined()
      expect(result.authenticatorData).toBe(mockCredential.response.authenticatorData)
      expect(result.signature).toBe(mockCredential.response.signature)
      expect(mockGet).toHaveBeenCalled()
    })

    it('should throw error when authentication fails', async () => {
      mockGet.mockRejectedValue(new Error('Failed'))

      await expect(kit.authenticate()).rejects.toThrow('Authentication failed')
    })

    it('should handle user cancellation', async () => {
      const error = new Error('User cancelled')
      error.name = 'NotAllowedError'
      mockGet.mockRejectedValue(error)

      await expect(kit.authenticate()).rejects.toMatchObject({
        code: 'USER_CANCELLED',
        message: 'User cancelled authentication',
      })
    })
  })
})