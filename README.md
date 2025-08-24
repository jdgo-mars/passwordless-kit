# Passwordless Kit

The easiest way to add passkey authentication to your website.

## Features

- 🔐 **Simple API** - Just two methods: `register()` and `authenticate()`
- 🛡️ **TypeScript First** - Full type safety and IntelliSense
- 📱 **Cross-Platform** - Works with Touch ID, Face ID, Windows Hello, and security keys
- 🚀 **Zero Dependencies** - Lightweight and fast
- 🔧 **Flexible** - Customizable options for different use cases

## Installation

```bash
npm install passwordless-kit
```

## Quick Start

```javascript
import { PasswordlessKit } from 'passwordless-kit'

const kit = new PasswordlessKit({
  rpName: 'My App',
  userVerification: 'preferred'
})

// Register a new passkey
try {
  const result = await kit.register({
    username: 'user@example.com',
    displayName: 'John Doe'
  })
  console.log('Registration successful:', result.credentialId)
} catch (error) {
  console.error('Registration failed:', error.message)
}

// Authenticate with existing passkey
try {
  const result = await kit.authenticate()
  console.log('Authentication successful:', result.credentialId)
} catch (error) {
  console.error('Authentication failed:', error.message)
}
```

## API Reference

### Constructor

```javascript
const kit = new PasswordlessKit(options?)
```

**Options:**
- `rpId?` - Relying Party ID (defaults to current domain)
- `rpName?` - Relying Party name (defaults to document title)
- `timeout?` - Operation timeout in milliseconds (default: 60000)
- `userVerification?` - User verification requirement (default: 'preferred')

### Methods

#### `register(options)`

Registers a new passkey for the user.

```javascript
const result = await kit.register({
  username: 'user@example.com',
  displayName: 'John Doe',
  challenge?: BufferSource, // Optional custom challenge
  excludeCredentials?: PublicKeyCredentialDescriptor[],
  authenticatorSelection?: AuthenticatorSelectionCriteria,
  attestation?: AttestationConveyancePreference
})
```

**Returns:** `RegistrationResult`
- `credentialId` - Base64url encoded credential ID
- `publicKey` - Public key ArrayBuffer
- `attestationObject` - Attestation object ArrayBuffer
- `clientDataJSON` - Client data JSON ArrayBuffer

#### `authenticate(options?)`

Authenticates with an existing passkey.

```javascript
const result = await kit.authenticate({
  challenge?: BufferSource, // Optional custom challenge
  allowCredentials?: PublicKeyCredentialDescriptor[],
  userVerification?: UserVerificationRequirement
})
```

**Returns:** `AuthenticationResult`
- `credentialId` - Base64url encoded credential ID
- `authenticatorData` - Authenticator data ArrayBuffer
- `signature` - Signature ArrayBuffer
- `clientDataJSON` - Client data JSON ArrayBuffer
- `userHandle?` - User handle ArrayBuffer (if present)

#### `isSupported()`

Checks if WebAuthn is supported in the current browser.

```javascript
const supported = kit.isSupported()
```

#### `isPlatformAuthenticatorAvailable()`

Checks if a platform authenticator (like Touch ID) is available.

```javascript
const available = await kit.isPlatformAuthenticatorAvailable()
```

## Error Handling

The library throws descriptive errors with specific error codes:

- `NOT_SUPPORTED` - WebAuthn not supported
- `USER_CANCELLED` - User cancelled the operation
- `SECURITY_ERROR` - Security error occurred
- `REGISTRATION_FAILED` - Registration failed
- `AUTHENTICATION_FAILED` - Authentication failed

```javascript
try {
  await kit.register({ username: 'test' })
} catch (error) {
  if (error.code === 'USER_CANCELLED') {
    // Handle user cancellation
  } else if (error.code === 'NOT_SUPPORTED') {
    // Show fallback authentication method
  }
}
```

## Browser Support

Passwordless Kit works in all modern browsers that support WebAuthn:

- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

## Example

See the `example/` directory for a complete working example.

## License

MIT