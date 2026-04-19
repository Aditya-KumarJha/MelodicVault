# Melodic Vault — Project Memory

## 1. Project Summary
Melodic Vault is a secure file encryption and authentication system that replaces traditional text passwords with **melody + rhythm-based authentication**.

It combines:
- Knowledge factor: what the user plays (note sequence)
- Behavioral biometric factor: how the user plays (timing/rhythm dynamics)

The system generates cryptographic keys dynamically from musical performance data and uses those keys for file encryption/decryption, without storing plaintext files or reusable static keys.

## 2. Problem Statement
Traditional authentication methods (passwords, stored keys) have critical weaknesses:
- Weak user passwords are easy to guess or brute-force.
- Password reuse across systems expands attack surface.
- Typed passwords are vulnerable to keyloggers and phishing.
- Strong passwords are hard to remember.
- Stored digital keys can be copied/exfiltrated if system is compromised.
- Authentication is usually identity-light: anyone with the secret can impersonate the user.

Core issue:
- Most systems depend on **"what you know"** (password), not **"how you behave"** (biometric uniqueness).

## 3. Core Idea
Humans typically remember melodies and rhythm patterns more naturally than complex passwords.

Two users can reproduce the same tune in notes, but their micro-timing and rhythmic expression often differ.

Melodic Vault leverages this by using musical performance as a dual-factor-style mechanism:
- Melody (discrete symbolic pattern)
- Rhythm dynamics (behavioral signature)

## 4. Solution Definition
Melodic Vault is a file protection framework where a user-selected melody and rhythm profile become the basis for generating encryption material.

### Key principle
- No static password required.
- No long-lived reusable encryption key needs to be stored in plaintext.
- Key material is derived when needed from user input.

## 5. System Workflow

### A. Encryption (Lock)
1. User selects a target file.
2. User performs a melody on a piano interface (virtual keyboard or compatible physical input).
3. System captures:
   - Note sequence (pitch/order)
   - Timing intervals (inter-key delays, rhythm pattern)
4. Input is normalized and transformed into a deterministic key derivation input.
5. AES-based encryption is performed.
6. Output encrypted file is stored.

### B. Decryption (Unlock)
1. User requests access to encrypted file.
2. User performs the melody again.
3. System captures note and rhythm data again.
4. Authentication module compares current pattern with enrolled/expected profile using tolerance rules.
5. If accepted, key is re-derived and used for AES decryption.
6. If rejected, access is denied.

## 6. Core Components

### 6.1 Input Module
Responsibilities:
- Record key press/release events.
- Map events to notes/pitches.
- Capture timestamps with sufficient precision.

Input sources:
- Virtual piano (web/app interface)
- Optional physical MIDI keyboard integration

### 6.2 Behavioral Analysis Module
Responsibilities:
- Derive rhythm features from event timings.
- Measure timing consistency and profile deviations.
- Produce biometric-like feature vector for matching.

Possible features:
- Inter-onset intervals
- Relative tempo scaling
- Note hold durations
- Rhythm variance profile

### 6.3 Key Generation Module
Responsibilities:
- Combine symbolic melody and normalized timing features.
- Produce deterministic cryptographic seed/material.
- Feed secure KDF pipeline to derive AES key.

Recommended cryptographic approach:
- Canonical encoding of features
- Salt + KDF (e.g., PBKDF2, scrypt, Argon2id depending on stack constraints)
- Output key sized for AES-256 where possible

### 6.4 Encryption Module
Responsibilities:
- Encrypt file contents with AES.
- Prefer authenticated encryption mode (e.g., AES-GCM).
- Manage nonce/IV and auth tags safely.

### 6.5 Storage Module
Responsibilities:
- Store only encrypted artifact + metadata required for decryption workflow.
- Never store plaintext file content after encryption flow completes.
- Never store raw user melody capture as recoverable secret material.

### 6.6 Authentication Module
Responsibilities:
- Compare new performance against expected melody and timing profile.
- Apply tolerance thresholds to avoid excessive false rejection.
- Output decision: Accept or Deny.

## 7. Security Model and Uniqueness

### Strengths
- Multi-factor-like behavior from one interaction channel:
  - Something known: note sequence
  - Something done: rhythm/behavior
- Resistant to classic typed-password keylogging.
- Reduced risk from password sharing alone.
- Dynamic key generation reduces static key exposure.
- More memorable than random passwords for many users.

### Why this is distinct
Melodic Vault is not just a musical password. It incorporates behavioral dynamics, making replay by mere note knowledge insufficient in stricter configurations.

## 8. Known Limitations and Risks
- Users may forget melody details over long periods.
- Strict matching may cause false rejections due to natural timing drift.
- Too-loose matching may increase false acceptance risk.
- Requires careful calibration and adaptive tolerance strategy.
- Accessibility concern: not ideal for users uncomfortable with musical input.
- Potential shoulder-surfing/replay concerns if melody is observed/recorded (mitigate with liveness/randomization techniques in advanced versions).

## 9. Practical Design Requirements
- Introduce enrollment phase with multiple samples to build stable timing profile.
- Normalize tempo to separate identity from speed fluctuations.
- Use robust error-tolerant matching (e.g., weighted distance thresholds).
- Keep cryptographic material derivation deterministic but secure.
- Use authenticated encryption and secure metadata handling.
- Implement lockout/rate-limiting policies for repeated failed attempts.
- Maintain privacy-by-design: minimize storage of biometric raw data.

## 10. Potential Use Cases
- Personal secure file vaults
- Sensitive document protection
- Confidential/offline secure storage environments
- Defense/research contexts requiring stronger local authentication semantics

## 11. Relation to Existing Research Threads
Melodic Vault conceptually fuses insights from:
- Musical password systems (memorability, pattern-based entry)
- Keystroke dynamics (behavioral timing biometrics)
- ML-supported behavioral authentication research (robustness of performance signatures)

Combined outcome:
- A hybrid authentication + encryption model centered on human-performed musical behavior.

## 12. Suggested AI Context Prompt (Reusable)
If another AI needs to continue this project, provide this summary:

"Melodic Vault is a secure file encryption system that uses melody + rhythm as authentication input. During lock/unlock, the system captures note sequence and timing behavior from piano input, derives cryptographic key material dynamically, and performs AES-based file encryption/decryption. The design goal is to replace static passwords with a more memorable yet behavior-sensitive mechanism. Key priorities are secure KDF design, authenticated encryption, robust tolerance calibration to balance false reject/accept rates, and privacy-preserving storage that avoids plaintext and raw key retention."

## 13. Two-Line Pitch
Melodic Vault is a secure file protection system that replaces traditional passwords with melody and rhythm-based behavioral authentication.

By deriving encryption keys from both what the user plays and how they play it, it improves memorability while adding biometric-style security.
