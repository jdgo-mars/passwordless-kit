export interface PasswordlessKitOptions {
  rpId?: string
  rpName?: string
  timeout?: number
  userVerification?: UserVerificationRequirement
}

export interface RegistrationOptions {
  username: string
  displayName?: string
  challenge?: BufferSource
  excludeCredentials?: PublicKeyCredentialDescriptor[]
  authenticatorSelection?: AuthenticatorSelectionCriteria
  attestation?: AttestationConveyancePreference
}

export interface AuthenticationOptions {
  challenge?: BufferSource
  allowCredentials?: PublicKeyCredentialDescriptor[]
  userVerification?: UserVerificationRequirement
}

export interface PasswordlessKitError extends Error {
  code: string
  details?: any
}

export interface RegistrationResult {
  credential: PublicKeyCredential
  credentialId: string
  publicKey: ArrayBuffer
  attestationObject: ArrayBuffer
  clientDataJSON: ArrayBuffer
}

export interface AuthenticationResult {
  credential: PublicKeyCredential
  credentialId: string
  authenticatorData: ArrayBuffer
  signature: ArrayBuffer
  clientDataJSON: ArrayBuffer
  userHandle?: ArrayBuffer
}

export type SupportedAlgorithms = -7 | -257 | -8 | -37 | -38 | -39