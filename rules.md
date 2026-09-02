Melodic Vault — Development Rules

These rules keep the project focused, secure, consistent, and easy to extend.

1. Core Product Rules

Melodic Vault is a secure file vault, not a music streaming application.

The melody is an authentication/key-generation mechanism.

MVP must work without physical hardware.

Hardware integration comes after the software MVP.

Every feature must support the core vault concept or be deferred.

2. Architecture Rules

Use

React + Vite.

Node.js + Express.

MongoDB + Mongoose.

Web Crypto API for browser cryptography.

REST APIs.

Modular feature-based frontend structure.

Controller/service separation on backend.

Environment variables for configuration.

Avoid

Mixing database logic directly into React components.

Putting all backend code in one file.

Putting crypto code inside UI components.

Sending plaintext files to the server unnecessarily.

Storing encryption keys in MongoDB.

Storing raw melody secrets in MongoDB.

3. Cryptography Rules

MUST

Use cryptographic APIs/libraries rather than implementing AES manually.

Generate a fresh random IV for every encryption operation.

Use authenticated encryption where possible.

Keep derived keys in memory only.

Validate decryption/authentication before releasing plaintext.

Version the .vault format.

Document the cryptographic choices.

IMPORTANT

The original project concept references AES-256-CBC. CBC by itself does not provide authentication/integrity.

For the software implementation, prefer:

AES-256-GCM

If CBC must be demonstrated for academic compatibility, pair it with a separate integrity mechanism and clearly document the design.

NEVER

Hardcode encryption keys.

Use a constant IV.

Log encryption keys.

Log the raw melody secret.

Create custom encryption algorithms.

Store plaintext passwords.

Claim SHA-256 alone is a password KDF.

4. Melody Rules

The melody representation must be deterministic.

Example:

C4:0|E4:312|G4:287

Rules:

Same melody + timing → same key material.

Any changed note → different key material.

Any changed timing value → different key material.

Use consistent timing units.

Validate note names.

Validate timing values.

Do not silently modify user input during serialization.

5. Backend Security Rules

Use:

Helmet.

CORS configured for the frontend.

Rate limiting.

Input validation.

Secure HTTP-only cookies for authentication where applicable.

Password hashing with a modern password hashing algorithm.

Centralized error handling.

Authorization middleware.

Avoid:

* CORS in production.

Returning passwords or hashes in API responses.

Trusting client-supplied user IDs.

Detailed internal error messages in production.

Secrets in source code.

6. File Handling Rules

Process files locally whenever possible.

Never upload plaintext files to the backend just to encrypt them.

Limit file sizes where necessary.

Validate .vault structure before processing.

Never overwrite original files automatically.

Never automatically delete user files.

Preserve original filename/mime metadata only when needed.

7. Frontend Rules

Components should be small and focused.

Avoid:

1000-line components.

Crypto logic inside JSX.

API calls scattered throughout components.

Duplicated validation.

Hardcoded colors everywhere.

Inline styles for the whole application.

Prefer:

Component
 ↓
Hook / feature logic
 ↓
Service
 ↓
API

8. Git Rules

Use small commits:

feat: add melody input
feat: add vault encryption
feat: add vault decryption
feat: add auth
fix: validate timing values
style: improve dashboard

Never commit:

.env

secrets

generated vault files containing real personal data

node_modules

build output

9. MVP Scope Rule

When time is limited:

Build first

Melody input
↓
Key derivation
↓
File encryption
↓
.vault
↓
Decryption
↓
Wrong melody rejection

Build later

Hardware
Mnemonic recovery
Advanced dashboard
Analytics
Cloud file storage
Multi-device support

10. Demo Rules

The demo must visibly prove:

File is selected.

Melody is entered.

Encryption succeeds.

.vault is created.

Original file is no longer needed for the vault.

Same melody decrypts successfully.

Wrong melody fails.

Server/database does not need the encryption key.

11. Code Quality

Every module should have one clear responsibility.

Example:

serializer.js       → melody → canonical string
keyDerivation.js    → canonical string → key
encryption.js       → file → ciphertext
decryption.js       → ciphertext → file
vaultFormat.js      → package/unpackage vault

Do not combine all of these into one function.