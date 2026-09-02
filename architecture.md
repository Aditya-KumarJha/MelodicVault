Melodic Vault — Architecture

1. Architecture Decision

The software MVP will be MERN-oriented:

Frontend: React + Vite

Backend: Node.js + Express

Database: MongoDB

Authentication: JWT with secure HTTP-only cookies

Client cryptography: Web Crypto API

Styling: Tailwind CSS

Validation: Zod/Joi on API boundaries

Testing: Vitest/Jest + Supertest

Later hardware bridge: ESP32 over USB Serial / Web Serial or desktop bridge

Important architectural rule

Encryption/decryption happens client-side.

The backend is not a trusted location for plaintext files or derived encryption keys.

2. High-Level Architecture

                    ┌─────────────────────┐
                    │       React UI      │
                    │   Melodic Vault     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
       Melody Engine                       File Engine
       - notes                             - file read
       - timing                            - encryption
       - serialization                     - decryption
              │                             - vault format
              ▼                                 │
       Key Derivation                           │
       SHA-256 / KDF                            │
              │                                 │
              └──────────────┬──────────────────┘
                             ▼
                      Web Crypto API
                       AES-256-GCM
                             │
                             ▼
                       .vault artifact


React UI
   │
   │ HTTPS/JSON
   ▼
Node + Express API
   │
   ▼
MongoDB
(metadata only)

3. Application Flow

Create Vault

User
 ↓
Dashboard
 ↓
Select file
 ↓
Enter melody + timing
 ↓
Validate melody
 ↓
Canonical serialization
 ↓
Derive 256-bit key
 ↓
Generate random IV
 ↓
AES-256-GCM encrypt
 ↓
Build .vault container
 ↓
Download .vault
 ↓
Save optional metadata

Decrypt Vault

User
 ↓
Select .vault
 ↓
Read metadata + ciphertext
 ↓
Enter melody + timing
 ↓
Canonical serialization
 ↓
Derive same key
 ↓
Read IV
 ↓
AES-GCM decrypt
 ↓
Authentication check
 ├── Success → restore file
 └── Failure → reject

4. MERN Responsibilities

React

Responsible for:

Pages.

Forms.

Melody input.

Timing input.

File selection.

Vault creation/decryption UI.

Progress/status.

API calls.

Client-side crypto orchestration.

Express/Node

Responsible for:

Authentication.

User APIs.

Vault metadata APIs.

Authorization.

Input validation.

Rate limiting.

Security headers.

Error handling.

MongoDB

Stores:

Users.

Vault metadata.

Timestamps.

Status.

Optional references to encrypted vault artifacts.

MongoDB does not store:

Plaintext files.

Raw melody secret.

Derived encryption key.

5. Folder Structure

melodic-vault/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── MelodyInput.jsx
│   │   │   ├── TimingInput.jsx
│   │   │   ├── FileDropzone.jsx
│   │   │   ├── MelodyVisualizer.jsx
│   │   │   ├── VaultCard.jsx
│   │   │   └── StatusMessage.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateVault.jsx
│   │   │   └── DecryptVault.jsx
│   │   │
│   │   ├── features/
│   │   │   ├── melody/
│   │   │   │   ├── serializer.js
│   │   │   │   └── validator.js
│   │   │   │
│   │   │   ├── crypto/
│   │   │   │   ├── keyDerivation.js
│   │   │   │   ├── encryption.js
│   │   │   │   ├── decryption.js
│   │   │   │   └── vaultFormat.js
│   │   │   │
│   │   │   └── auth/
│   │   │       └── authApi.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── VaultMetadata.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── vaultController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── vaultRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── rules.md
│   ├── phases.md
│   ├── design.md
│   └── memory.md
│
├── .env.example
├── .gitignore
├── README.md
└── package.json

6. API Design

Auth

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Vault Metadata

GET    /api/vaults
POST   /api/vaults
GET    /api/vaults/:id
DELETE /api/vaults/:id

The file encryption itself should remain client-side.

7. Melody Engine

Input:

{
  "notes": ["C4", "E4", "G4"],
  "deltas": [0, 312, 287]
}

Canonical representation:

C4:0|E4:312|G4:287

Important:

Same input must always create the same canonical string.

Note ordering must remain unchanged.

Timing units must remain consistent.

Validation must reject malformed input.

8. Crypto Engine

Canonical melody
        ↓
TextEncoder
        ↓
KDF / SHA-256-derived material
        ↓
AES-256 key
        ↓
Random 12-byte IV
        ↓
AES-GCM
        ↓
Ciphertext + authentication tag

The key exists only in application memory.

9. Later Hardware Architecture

Piano
  ↓
ESP32
  ↓ USB Serial
Web Serial / Local Bridge
  ↓
React Melody Engine
  ↓
Key Derivation
  ↓
Crypto Engine

The hardware layer can later implement:

Device detection.

Handshake.

Session IDs.

JSON payloads.

Timing capture.

CRC validation.

Timeout handling.

The earlier project specification uses serial communication and JSON for the ESP32 layer; these belong to the post-MVP hardware phase.

10. Security Boundaries

Browser/client

Trusted with:

User's file during encryption.

Melody input.

Derived key during active operation.

Backend

Trusted with:

Account information.

Metadata.

Authorization.

Not trusted with:

Plaintext files.

Derived encryption keys.

Raw melody secrets.

Database

Contains only metadata and account records.

11. Deployment

MVP:

React/Vite
   ↓
Static hosting

Node/Express
   ↓
Backend hosting

MongoDB Atlas

Environment variables:

MONGODB_URI=
JWT_SECRET=
CLIENT_URL=
NODE_ENV=

Never commit real secrets.