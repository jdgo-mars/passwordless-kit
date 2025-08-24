import {
  PasswordlessKitOptions,
  RegistrationOptions,
  AuthenticationOptions,
  RegistrationResult,
  AuthenticationResult,
  SupportedAlgorithms,
} from './types'
import { createError, validateBrowser, generateChallenge, bufferToBase64url } from './utils'

export class PasswordlessKit {
  private rpId: string
  private rpName: string
  private timeout: number
  private userVerification: UserVerificationRequirement

  private readonly supportedAlgorithms: SupportedAlgorithms[] = [-7, -257]

  constructor(options: PasswordlessKitOptions = {}) {
    this.rpId = options.rpId || window.location.hostname
    this.rpName = options.rpName || document.title || 'My App'
    this.timeout = options.timeout || 60000
    this.userVerification = options.userVerification || 'preferred'

    validateBrowser()
  }

  async register(options: RegistrationOptions): Promise<RegistrationResult> {
    try {
      const userId = new TextEncoder().encode(options.username)
      const challenge = options.challenge || generateChallenge()

      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            id: this.rpId,
            name: this.rpName,
          },
          user: {
            id: userId,
            name: options.username,
            displayName: options.displayName || options.username,
          },
          pubKeyCredParams: this.supportedAlgorithms.map(alg => ({
            type: 'public-key' as const,
            alg,
          })),
          timeout: this.timeout,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: this.userVerification,
            ...options.authenticatorSelection,
          },
          attestation: options.attestation || 'none',
          excludeCredentials: options.excludeCredentials || [],
        },
      }

      const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential

      if (!credential) {
        throw createError('REGISTRATION_FAILED', 'Failed to create credential')
      }

      const response = credential.response as AuthenticatorAttestationResponse

      return {
        credential,
        credentialId: bufferToBase64url(credential.rawId),
        publicKey: response.getPublicKey()!,
        attestationObject: response.attestationObject,
        clientDataJSON: response.clientDataJSON,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw createError('USER_CANCELLED', 'User cancelled registration')
        }
        if (error.name === 'NotSupportedError') {
          throw createError('NOT_SUPPORTED', 'WebAuthn not supported')
        }
        if (error.name === 'SecurityError') {
          throw createError('SECURITY_ERROR', 'Security error during registration')
        }
      }
      throw createError('REGISTRATION_FAILED', 'Registration failed', error)
    }
  }

  async authenticate(options: AuthenticationOptions = {}): Promise<AuthenticationResult> {
    try {
      const challenge = options.challenge || generateChallenge()

      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          timeout: this.timeout,
          userVerification: options.userVerification || this.userVerification,
          allowCredentials: options.allowCredentials,
        },
      }

      const credential = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential

      if (!credential) {
        throw createError('AUTHENTICATION_FAILED', 'Failed to get credential')
      }

      const response = credential.response as AuthenticatorAssertionResponse

      return {
        credential,
        credentialId: bufferToBase64url(credential.rawId),
        authenticatorData: response.authenticatorData,
        signature: response.signature,
        clientDataJSON: response.clientDataJSON,
        userHandle: response.userHandle || undefined,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw createError('USER_CANCELLED', 'User cancelled authentication')
        }
        if (error.name === 'NotSupportedError') {
          throw createError('NOT_SUPPORTED', 'WebAuthn not supported')
        }
      }
      throw createError('AUTHENTICATION_FAILED', 'Authentication failed', error)
    }
  }

  isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      navigator.credentials &&
      typeof navigator.credentials.create === 'function' &&
      typeof navigator.credentials.get === 'function'
    )
  }

  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      }
      return false
    } catch {
      return false
    }
  }
}