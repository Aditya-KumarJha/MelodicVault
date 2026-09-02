Melodic Vault — 4-Day MVP Plan

Objective

In four days, produce a working software MVP that demonstrates the core Melodic Vault idea end-to-end.

The MVP does not need physical piano hardware.

The evaluator should be able to see:

File
 ↓
Melody + Timing
 ↓
Key
 ↓
Encryption
 ↓
.vault
 ↓
Same Melody
 ↓
Decryption
 ↓
Original File

And:

Wrong Melody
 ↓
Decryption Failure

Priority Levels

P0 — Must Have

These features define the MVP.

React application.

Dashboard.

Create Vault screen.

File selection.

Melody + timing input.

Deterministic serialization.

Key derivation.

AES-256-GCM encryption.

.vault generation.

.vault decryption.

Wrong melody rejection.

Basic backend.

MongoDB metadata.

Basic authentication.

P1 — Should Have

Melody visualizer.

Vault history.

Better error states.

Drag-and-drop file selection.

Download decrypted file.

Polished dashboard.

P2 — Later

ESP32.

Piano integration.

Serial protocol.

Automatic timing capture.

Mnemonic recovery.

Continuous authentication.

Cloud encrypted storage.

Advanced security/threat modeling.

Desktop wrapper.

Analytics.

DAY 1 — Foundation + Core Melody Engine

Goal

Get the application structure running and make melody input deterministic.

Tasks

Frontend

Initialize React + Vite.

Add Tailwind.

Create routing.

Create:

Landing

Login

Register

Dashboard

Create Vault

Decrypt Vault

Backend

Initialize Express.

Connect MongoDB.

Create basic server structure.

Add environment configuration.

Add health endpoint.

Melody Engine

Create:

features/melody/serializer.js
features/melody/validator.js

Implement:

notes + timing
      ↓
canonical string

Example:

C4:0|E4:312|G4:287

End-of-Day Test

Given the same melody twice:

C4 E4 G4
0  312 287

the application must produce exactly the same serialized representation.

DAY 2 — Encryption Engine

Goal

Encrypt an actual file.

Tasks

Implement:

keyDerivation.js
encryption.js
vaultFormat.js

Flow:

File
 ↓
Read ArrayBuffer
 ↓
Melody
 ↓
Canonical string
 ↓
Key derivation
 ↓
AES-256-GCM
 ↓
Vault object
 ↓
Download .vault

UI

Create a clear state flow:

Select File
 ↓
Enter Melody
 ↓
Ready
 ↓
Encrypting...
 ↓
Vault Created ✓

End-of-Day Test

Take:

hello.txt

Encrypt it and produce:

hello.vault

The original file should not be required by the encryption process after the encrypted artifact has been created.

DAY 3 — Decryption + Authentication

Goal

Complete the reverse flow and prove that the melody is actually required.

Tasks

Implement:

decryption.js

Flow:

.vault
 ↓
Read metadata
 ↓
Enter melody
 ↓
Canonical serialization
 ↓
Derive key
 ↓
AES-GCM decrypt
 ↓
Authentication verification
 ↓
Original file

Critical Test 1 — Correct Melody

Correct melody
 ↓
Correct key
 ↓
Decrypt ✓

Critical Test 2 — Wrong Melody

Wrong melody
 ↓
Different key
 ↓
Authentication failure
 ↓
Reject

This is the most important security demonstration.

Backend

Add:

User model.

Register.

Login.

Logout.

Auth middleware.

Vault metadata API.

DAY 4 — Polish + Demo Preparation

Goal

Turn the working prototype into a convincing final-year-project MVP.

UI polish

Apply final theme.

Improve spacing.

Add loading states.

Add success/error messages.

Add vault cards.

Add melody visualization.

Improve responsive layout.

Dashboard

Show:

MELODIC VAULT

Vaults
────────────────────

Project Report.pdf
Created: Today
Status: Encrypted

Research.zip
Created: Today
Status: Encrypted

[ + Create Vault ]

Demo page

Make the demo flow extremely obvious:

1. Choose File
2. Enter Melody
3. Encrypt
4. Download .vault

Then:

1. Choose .vault
2. Enter Melody
3. Decrypt
4. Download File

Final Testing Checklist

Register works.

Login works.

Dashboard loads.

File selection works.

Melody validation works.

Encryption works.

.vault downloads.

Correct melody decrypts.

Wrong melody fails.

Key is not stored in DB.

Plaintext file is not sent to backend.

No secrets committed to Git.

README explains setup.

Demo data is prepared.

4-Day Final MVP

At the end of Day 4, the product should demonstrate:

                 MELODIC VAULT

                 ┌───────────┐
                 │   FILE    │
                 └─────┬─────┘
                       ↓
              ┌────────────────┐
              │ Melody + Timing│
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │ Key Derivation │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │   AES-256-GCM  │
              └───────┬────────┘
                      ↓
                ┌───────────┐
                │ .VAULT    │
                └─────┬─────┘
                      ↓
              Same Melody
                      ↓
                Decrypt ✓

After the 4-Day Demo

Phase 2 — Hardware

Piano
 ↓
ESP32
 ↓
USB Serial
 ↓
Melody Capture
 ↓
React/Desktop Bridge
 ↓
Key Derivation

Phase 3 — Advanced Recovery

Mnemonic backup.

Recovery flow.

Better device/session handling.

Phase 4 — Full Product

Multiple vaults.

Encrypted cloud storage.

Device management.

Hardware pairing.

Security hardening.

Full test suite.

Deployment.

Documentation.