Melodic Vault — Product Requirements Document

1. Product Overview

Melodic Vault is a secure file-vault application where a user's unique melody and timing pattern acts as the basis for unlocking encrypted files.

The first implementation is software-first. The 4-day MVP must demonstrate the complete security concept without depending on physical piano hardware. Melody/note timing can initially be entered or simulated in the application. Hardware/ESP32 integration will be added after the MVP.

Core idea

User
  ↓
Create / select vault
  ↓
Provide melody + timing pattern
  ↓
Deterministic melody representation
  ↓
Cryptographic key derivation
  ↓
Encrypt selected file
  ↓
Download/store .vault file

Later:
Piano → ESP32 → Web/Desktop bridge → Melody + timing

The product is not a music player. The melody is an authentication/key-generation mechanism.

2. Target Users

Primary

Students/researchers demonstrating behavioral or musical authentication.

Individual users who want an unusual passwordless-style vault experience.

Creators/technical users interested in biometric-like authentication concepts.

Secondary

Security/ML researchers.

Final-year project evaluators.

Future users of hardware-assisted authentication systems.

MVP user persona

A user has a file they want to protect. Instead of entering a conventional password, the user creates a melody pattern and uses that pattern to encrypt/decrypt the file.

3. Problem Statement

Traditional file protection normally depends on passwords or keys that users must remember and type.

Melodic Vault explores a different interaction:

Can a reproducible melody + timing pattern become the user's secret for accessing an encrypted vault?

The system therefore needs to:

Capture a melody representation.

Include timing information.

Convert it deterministically into key material.

Encrypt files locally.

Allow the same melody to reproduce the key for decryption.

Never require the raw secret/key to be stored on the server.

4. Product Goals

MVP goals

Working React web interface.

Working Node/Express backend for vault metadata where required.

MongoDB for non-secret application metadata.

Local/client-side encryption.

Melody + timing based deterministic key derivation.

Encrypt a file into a .vault artifact.

Decrypt the .vault artifact using the same melody.

Wrong melody must fail.

Clear encryption/decryption status and error handling.

Demoable end-to-end flow without hardware.

Post-MVP goals

ESP32/piano integration.

Automatic note/timing capture.

Serial/USB communication.

Session protocol and validation.

Recovery mnemonic.

Multiple vaults and richer account management.

More robust cryptographic and threat-model evaluation.

5. Non-Goals for the 4-Day MVP

Do not spend MVP time on:

Full social features.

Music streaming.

Payment systems.

Public music marketplace.

Complex admin dashboard.

AI model training.

Blockchain.

Production-grade multi-device synchronization.

Physical piano integration as a blocker for the demo.

6. Core MVP Features — Priority Order

Priority

Feature

Required

P0

Landing/dashboard UI

Yes

P0

Create vault

Yes

P0

Melody + timing input

Yes

P0

Deterministic key derivation

Yes

P0

Local file encryption

Yes

P0

.vault generation/download

Yes

P0

.vault decryption

Yes

P0

Wrong melody rejection

Yes

P0

Basic vault metadata

Yes

P1

Authentication/login

Yes, simple

P1

MongoDB metadata storage

Yes

P1

Encryption history/status

Nice to have

P1

Melody visualizer

Nice to have

P2

ESP32 integration

Later

P2

Mnemonic recovery

Later

P2

Continuous authentication

Later

P2

Advanced analytics

Later

7. Main User Flows

Flow A — Create encrypted vault

Login
 ↓
Dashboard
 ↓
Create Vault
 ↓
Select file
 ↓
Enter/capture melody
 ↓
Enter timing values
 ↓
Preview melody
 ↓
Generate key
 ↓
Encrypt locally
 ↓
Create .vault
 ↓
Download .vault

Flow B — Decrypt vault

Dashboard
 ↓
Open/Decrypt Vault
 ↓
Select .vault
 ↓
Enter same melody + timing
 ↓
Derive key
 ↓
Decrypt locally
 ↓
Validate decrypted data
 ↓
Download original file

Flow C — Wrong secret

.vault
 ↓
Wrong melody/timing
 ↓
Different derived key
 ↓
Decryption/authentication failure
 ↓
Show "Melody does not match"
 ↓
Do not expose decrypted data

8. Melody Representation

For the MVP, represent a melody as deterministic structured data:

{
  "notes": ["C4", "E4", "G4", "A4"],
  "deltas": [0, 312, 287, 401]
}

Serialize deterministically, for example:

C4:0|E4:312|G4:287|A4:401

The exact serialization rules must remain identical during encryption and decryption.

9. Key Derivation

The project concept uses the serialized melody/timing representation as cryptographic input.

For a first implementation:

melody + timing
      ↓
canonical serialization
      ↓
SHA-256 / KDF
      ↓
256-bit key

For the MVP, the implementation should preferably use a proper password/key derivation mechanism such as HKDF or PBKDF2 over canonical melody material rather than treating raw SHA-256 as a general password KDF.

The raw derived key must remain in memory and must not be stored in MongoDB.

10. File Encryption

The application should encrypt the selected file on the client so the backend does not receive plaintext files.

Preferred modern implementation:

File
 ↓
Web Crypto API
 ↓
AES-256-GCM
 ↓
IV + ciphertext + authentication tag
 ↓
.vault

The earlier research concept references AES-256-CBC. For a real software implementation, authenticated encryption such as AES-GCM is preferred because integrity/authentication is built in.

If the academic specification strictly requires CBC, document that separately and add an integrity mechanism rather than presenting unauthenticated CBC as fully secure.

11. Vault File

The .vault file should contain enough non-secret information to decrypt it later, such as:

{
  "version": 1,
  "algorithm": "AES-256-GCM",
  "kdf": "HKDF-SHA-256",
  "iv": "...",
  "ciphertext": "...",
  "originalName": "...",
  "mimeType": "..."
}

Do not store:

Raw melody secret.

Derived encryption key.

Password/mnemonic in plaintext.

Private secret material in logs.

For binary efficiency, the production format can later move from JSON/base64 to a compact binary container.

12. Backend Responsibilities

The backend should not perform plaintext file encryption in the MVP.

Backend responsibilities:

User authentication.

User/vault metadata.

Vault names and timestamps.

Optional encrypted-vault references.

API validation.

Authorization.

The backend should never need the user's derived encryption key.

13. Data Model

User

User
- _id
- name
- email
- passwordHash
- createdAt

VaultMetadata

VaultMetadata
- _id
- userId
- name
- originalFileName
- algorithm
- createdAt
- updatedAt
- status

Do not store the melody or derived key in the database.

14. Success Criteria

The MVP is successful when a demo can show:

User selects a file.

User enters a melody and timing sequence.

App generates key material.

App encrypts the file locally.

.vault is produced.

Original file can be removed.

Same melody successfully decrypts it.

Different melody fails.

Backend/database never receives the plaintext file or raw key.

15. Future Product Direction

After MVP:

Real piano/ESP32 capture.

USB serial/Web Serial bridge.

Note-duration extraction.

Session handshake.

CRC/protocol validation if required by the hardware protocol.

Mnemonic recovery.

Multiple vault management.

Secure device pairing.

Better threat modeling.

Cross-device support.

Desktop wrapper if Web Serial/browser constraints become limiting.