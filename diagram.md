# Melodic Vault - Detailed Architecture Diagrams

## 1. Scope and Modeling Notes
This document provides three complete architecture views for Melodic Vault:
1. Class Diagram (detailed static design)
2. Sequence Diagram (end-to-end runtime behavior)
3. Data Flow Diagrams (DFD Level 0, Level 1, Level 2)

### Modeling conventions used
- Cryptography baseline: AES-256-GCM + KDF-derived key material.
- Authentication style: melody (knowledge) + rhythm dynamics (behavior).
- Security controls included: lockout, rate-limit, audit log, integrity validation.
- Storage policy: encrypted artifacts only, no plaintext file persistence.
- Timing matching: tolerance-based comparison with enrollment profile.

---

## 2. Class Diagram (Core Features)

```mermaid
classDiagram

class VaultApplication {
  +encryptFile(file, userId)
  +decryptFile(artifactId, userId)
  +enrollProfile(userId)
}

class PianoInputController {
  +startCapture(mode)
  +stopCapture(sessionId)
}

class MelodyEncoder {
  +encode(performance)
}

class RhythmFeatureExtractor {
  +extract(performance)
}

class MatcherEngine {
  +compare(melody, rhythm, profile)
}

class KDFService {
  +deriveKey(seed, params)
}

class EncryptionService {
  +encrypt(bytes, key)
  +decrypt(cipherPackage, key)
}

class ProfileRepository {
  +saveProfile(profile)
  +loadProfile(userId, artifactId)
}

class SecureStorageManager {
  +storeEncryptedArtifact(cipherPackage)
  +fetchEncryptedArtifact(artifactId)
}

class MetadataRepository {
  +saveMeta(meta)
  +getMeta(artifactId)
}

class AttemptTracker {
  +isLockedOut(userId, artifactId)
  +registerAttempt(userId, artifactId, success)
}

class AuditLogger {
  +logSecurityEvent(event)
}

VaultApplication --> PianoInputController
VaultApplication --> MelodyEncoder
VaultApplication --> RhythmFeatureExtractor
VaultApplication --> MatcherEngine
VaultApplication --> KDFService
VaultApplication --> EncryptionService
VaultApplication --> ProfileRepository
VaultApplication --> SecureStorageManager
VaultApplication --> MetadataRepository
VaultApplication --> AttemptTracker
VaultApplication --> AuditLogger
```

---

## 3. Runtime Diagrams (Core Features)

### 3.1 Activity Diagram (Core Features)

```mermaid
flowchart TD

A[Start] --> B[Select operation]
B --> C{Encrypt or Decrypt}

C -->|Encrypt| E1[Select file]
E1 --> E2[Capture melody and rhythm]
E2 --> E3[Extract melody and rhythm features]
E3 --> E4[Derive key using KDF]
E4 --> E5[Encrypt file using AES]
E5 --> E6[Store encrypted artifact and metadata]
E6 --> Z[End]

C -->|Decrypt| D1[Request artifact]
D1 --> D2[Check lockout and policy]
D2 --> D3[Capture melody and rhythm]
D3 --> D4[Compare against stored profile]
D4 --> D5{Match result}
D5 -->|No| D6[Deny access and update attempts]
D6 --> Z
D5 -->|Yes| D7[Derive key using KDF]
D7 --> D8[Fetch and decrypt artifact]
D8 --> D9[Return plaintext and reset attempts]
D9 --> Z
```

### 3.2 Sequence Diagram (Core Features)

```mermaid
sequenceDiagram
autonumber

actor U as User
participant API as VaultApplication
participant IN as PianoInputController
participant FE as Melody and Rhythm Processing
participant AU as Matcher and AttemptTracker
participant CR as KDF and EncryptionService
participant ST as Profile and Storage Repos

rect rgb(240, 255, 240)
Note over U,ST: Encrypt Flow
U->>API: encryptFile(file, userId)
API->>IN: capturePerformance(ENCRYPT)
IN-->>API: performance
API->>FE: extractFeatures(performance)
FE-->>API: melody and rhythm
API->>CR: deriveKey(melody, rhythm)
CR-->>API: key
API->>CR: encrypt(file, key)
CR-->>API: cipherPackage
API->>ST: saveEncryptedArtifact(cipherPackage, metadata)
ST-->>API: artifactId
API-->>U: encryptionSuccess(artifactId)
end

rect rgb(255, 248, 240)
Note over U,ST: Decrypt Flow
U->>API: decryptFile(artifactId, userId)
API->>AU: checkLockout(userId, artifactId)
AU-->>API: allowed
API->>IN: capturePerformance(DECRYPT)
IN-->>API: performance
API->>FE: extractFeatures(performance)
FE-->>API: melody and rhythm
API->>ST: loadProfile(userId, artifactId)
ST-->>API: profile
API->>AU: compare(melody, rhythm, profile)
AU-->>API: match or reject
alt reject
  API->>AU: registerFailedAttempt()
  API-->>U: accessDenied
else match
  API->>CR: deriveKey(melody, rhythm)
  CR-->>API: key
  API->>ST: fetchEncryptedArtifact(artifactId)
  ST-->>API: cipherPackage
  API->>CR: decrypt(cipherPackage, key)
  CR-->>API: plaintext
  API->>AU: resetAttempts()
  API-->>U: decryptionSuccess(plaintext)
end
end
```

---

## 4. DFD Level 0 (Context Diagram)

```mermaid
flowchart LR

U[External Entity: User<br/>Primary Actor] -->|Melody input, file upload, access request| P0((P0 Melodic Vault System))
P0 -->|Encrypted file, access status| U
U -->|Login request, auth attempt| P0
P0 -->|Authentication status, lockout guidance| U
U -->|Rhythm profile recalibration request| P0
P0 -->|Recalibration result, tolerance update status| U

ADM[External Entity: Security Admin] -->|Policy configuration, audit queries| P0
P0 -->|Audit reports, security events| ADM

P0 -->|Optional notifications| NS[External Service: Notification Channel]
NS -->|Delivery status| P0
```

### Level 0 explanation
- Entire platform modeled as one process: P0 Melodic Vault System.
- User and Security Admin are external entities.
- Data stores are intentionally omitted at Level 0 context view (industry DFD convention).

---

## 5. DFD Level 1 (Major Process Decomposition)

```mermaid
flowchart TB

%% External Entities
U[User]
ADM[Security Admin]
NS[Notification Service]

%% Processes
P1((1.0 Capture and Validate Input))
P2((2.0 Build Features and Profile Data))
P3((3.0 Authenticate Performance))
P4((4.0 Derive Key and Encrypt/Decrypt))
P5((5.0 Store/Retrieve Secure Artifacts))
P6((6.0 Governance: Policy, Attempts, Audit))

%% Data Stores
D1[(D1 Encrypted Artifact Store)]
D2[(D2 Metadata Store)]
D3[(D3 Auth Profile Store)]
D4[(D4 Attempt State Store)]
D5[(D5 Audit Log Store)]
D6[(D6 KDF/Config Parameter Store)]

%% User Flows
U -->|File, melody performance, action| P1
P1 -->|Sanitized events| P2
P2 -->|Melody token + rhythm vector| P3
P3 -->|Auth decision + confidence| P6

%% Governance controls
ADM -->|Policy updates, threshold config| P6
P6 -->|Policy context| P3
P6 -->|KDF policy + crypto constraints| P4
P6 -->|Notification trigger| NS
NS -->|Delivery status| P6

%% Auth profile dependencies
P2 -->|Enrollment profile write| D3
D3 -->|Stored profile/template| P3

%% Attempt/audit state
P3 -->|Failed/success attempts| D4
D4 -->|Lockout status, counters| P3
P3 -->|Security event| D5
P4 -->|Crypto event| D5
P5 -->|Storage access event| D5
P6 -->|Governance events| D5
D5 -->|Audit query results| ADM

%% Crypto path
P3 -->|Authorized operation request| P4
D6 -->|KDF parameters, versioning| P4
P4 -->|Cipher package or plaintext| P5

%% Persistence path
P5 -->|Write encrypted artifact| D1
P5 -->|Write metadata| D2
P5 -->|Read encrypted artifact| D1
P5 -->|Read metadata| D2
P5 -->|Operation outcome| U

%% Auxiliary readbacks
D2 -->|Melody fingerprint, policy refs| P3
D2 -->|AAD/version refs| P4
```

### Level 1 explanation
- Process 1.0 handles raw capture and basic validation.
- Process 2.0 transforms input into melody/rhythm features and enrollment profile data.
- Process 3.0 authenticates with tolerance and lockout awareness.
- Process 4.0 handles deterministic key derivation and AES operations.
- Process 5.0 isolates persistence of encrypted artifact + metadata.
- Process 6.0 centralizes policy, attempts, lockout, audit, notifications.

---

## 6. DFD Level 2 (Detailed Decomposition)

Level 2 is shown in three detailed sub-diagrams covering the most critical Level 1 processes.

### 6.1 DFD Level 2 for Process 1.0 + 2.0 (Capture, Sanitize, Feature Build)

```mermaid
flowchart TB

U[User]

P11((1.1 Initialize Capture Session))
P12((1.2 Collect Note Events))
P13((1.3 Validate Device and Session Integrity))
P14((1.4 Sanitize and Normalize Event Stream))
P21((2.1 Encode Canonical Melody Sequence))
P22((2.2 Extract Rhythm and Timing Features))
P23((2.3 Compute Quality and Confidence Metrics))
P24((2.4 Build Enrollment Template - when required))

D3[(D3 Auth Profile Store)]
D5[(D5 Audit Log Store)]

U -->|Start action + performance| P11
P11 -->|session token| P12
P12 -->|raw event stream| P13
P13 -->|validated stream| P14
P14 -->|clean event stream| P21
P14 -->|clean event stream| P22
P21 -->|melody token| P23
P22 -->|rhythm vector| P23
P23 -->|feature package + quality score| P24

P24 -->|template profile write enroll path| D3
P23 -->|capture quality events| D5
P13 -->|device/session anomaly events| D5
P24 -->|enrollment completion event| D5
```

### 6.2 DFD Level 2 for Process 3.0 (Authentication and Decisioning)

```mermaid
flowchart TB

P31((3.1 Load Applicable Policy and Profile))
P32((3.2 Check Attempt Counters and Lockout))
P33((3.3 Melody Similarity Evaluation))
P34((3.4 Rhythm Behavioral Distance Evaluation))
P35((3.5 Weighted Score Fusion and Thresholding))
P36((3.6 Decision: Accept or Reject))
P37((3.7 Update Attempts and Trigger Controls))

D2[(D2 Metadata Store)]
D3[(D3 Auth Profile Store)]
D4[(D4 Attempt State Store)]
D5[(D5 Audit Log Store)]

D2 -->|policy refs, allowed drift, thresholds| P31
D3 -->|melody baseline + behavioral template| P31
P31 -->|context| P32
D4 -->|attempt count, lockout state| P32

P32 -->|if allowed| P33
P32 -->|if locked| P36

P33 -->|melody score| P35
P34 -->|rhythm score| P35
P31 -->|rhythm template context| P34

P35 -->|combined confidence| P36
P36 -->|accept/reject result| P37

P37 -->|attempt state update| D4
P36 -->|decision event| D5
P37 -->|lockout/failure/success event| D5
```

### 6.3 DFD Level 2 for Process 4.0 + 5.0 + 6.0 (Key Derivation, Crypto, Storage, Governance)

```mermaid
flowchart TB

P41((4.1 Canonical Key Material Composition))
P42((4.2 KDF Execution and Key Lifecycle Handling))
P43((4.3 AES-GCM Encrypt/Decrypt Operation))
P44((4.4 Integrity and AAD Validation))
P51((5.1 Persist Encrypted Artifact))
P52((5.2 Persist/Retrieve Metadata))
P61((6.1 Apply Security Policy Controls))
P62((6.2 Generate Audit and Compliance Records))
P63((6.3 Notify User/Admin on Critical Events))

U[User]
ADM[Security Admin]
NS[Notification Service]

D1[(D1 Encrypted Artifact Store)]
D2[(D2 Metadata Store)]
D5[(D5 Audit Log Store)]
D6[(D6 KDF/Config Parameter Store)]

U -->|authorized encrypt/decrypt request| P61
P61 -->|approved operation| P41
D6 -->|salt strategy, KDF params, crypto version| P41
P41 -->|derived seed payload| P42
P42 -->|symmetric key handle| P43
P43 -->|cipher package or plaintext| P44

P44 -->|valid package for persistence| P51
P44 -->|metadata bindings aad hash version| P52
P51 -->|artifact write/read| D1
P52 -->|metadata write/read| D2

P61 -->|policy enforcement events| P62
P44 -->|integrity pass/fail events| P62
P51 -->|storage access events| P62
P52 -->|metadata access events| P62
P62 -->|audit records| D5
D5 -->|audit reports| ADM

P62 -->|critical alert trigger| P63
P63 -->|notification message| NS
NS -->|delivery status| P63

P51 -->|operation outcome| U
P63 -->|optional user alert| U
```

---

## 7. Industry-Standard Coverage Checklist

The diagrams explicitly cover:
- Enrollment lifecycle for behavioral template creation.
- Encryption and decryption lifecycle, including decision branches.
- Separation of concerns: capture, feature extraction, auth, crypto, storage, governance.
- Key derivation path with configuration store and deterministic composition.
- Data stores segmented by artifact, metadata, profile, attempts, audit, and KDF config.
- Security controls: lockout, policy gates, integrity verification, audit logging, notification.
- Failure handling branches (auth fail, lockout active, integrity fail, policy denial).

## 8. Suggested Usage
- Use Class Diagram for implementation planning and object design.
- Use Sequence Diagram for API orchestration and testing scenarios.
- Use DFD Levels 0/1/2 for thesis/report/system-design sections, threat modeling, and compliance discussion.
