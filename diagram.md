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

## 2. Class Diagram (Detailed)

```mermaid
classDiagram

%% =========================
%% Core Orchestration Layer
%% =========================
class VaultApplication {
  +encryptFile(request: EncryptionRequest): EncryptionResponse
  +decryptFile(request: DecryptionRequest): DecryptionResponse
  +enrollUserProfile(request: EnrollmentRequest): EnrollmentResponse
  +verifyAccess(request: AccessRequest): AccessDecision
  +validateRequest(request: BaseRequest): ValidationResult
}

class UseCaseCoordinator {
  +handleEncryptionFlow(ctx: EncryptionContext): EncryptionResult
  +handleDecryptionFlow(ctx: DecryptionContext): DecryptionResult
  +handleEnrollmentFlow(ctx: EnrollmentContext): EnrollmentResult
  +buildExecutionTrace(correlationId: String): ExecutionTrace
}

class SessionContext {
  +sessionId: String
  +userId: String
  +deviceId: String
  +correlationId: String
  +startedAt: DateTime
  +riskLevel: RiskLevel
  +isTrustedDevice(): bool
}

%% =========================
%% Input and Capture Layer
%% =========================
class PianoInputController {
  +startCapture(mode: CaptureMode): CaptureSession
  +stopCapture(sessionId: String): RawPerformance
  +validateInputDevice(deviceId: String): DeviceValidationResult
  +setInputSource(source: InputSource): void
}

class RawPerformance {
  +performanceId: String
  +capturedAt: DateTime
  +source: InputSource
  +events: List~NoteEvent~
  +durationMs: int
  +tempoEstimateBpm: float
  +isComplete: bool
}

class NoteEvent {
  +eventId: String
  +note: String
  +pitchClass: int
  +octave: int
  +velocity: int
  +pressedAtMs: long
  +releasedAtMs: long
  +holdDurationMs: long
}

class InputSanitizer {
  +sanitize(raw: RawPerformance): SanitizedPerformance
  +removeNoise(events: List~NoteEvent~): List~NoteEvent~
  +normalizeTimestamps(raw: RawPerformance): RawPerformance
}

class SanitizedPerformance {
  +performanceId: String
  +events: List~NoteEvent~
  +interOnsetIntervals: List~int~
  +holdDurations: List~int~
  +validityScore: float
}

%% =========================
%% Behavioral Biometrics
%% =========================
class RhythmFeatureExtractor {
  +extract(perf: SanitizedPerformance): RhythmFeatureVector
  +computeIOI(events: List~NoteEvent~): List~int~
  +computeTempoInvariantRatios(ioi: List~int~): List~float~
  +computeStabilityScore(features: RhythmFeatureVector): float
}

class RhythmFeatureVector {
  +vectorId: String
  +ioiRatios: List~float~
  +holdRatios: List~float~
  +timingVariance: float
  +accentProfile: List~float~
  +tempoBand: String
}

class MelodyEncoder {
  +encodeSequence(perf: SanitizedPerformance): MelodyToken
  +canonicalizeNotes(notes: List~String~): String
  +computeNGramFingerprint(encoded: String): String
}

class MelodyToken {
  +tokenId: String
  +canonicalSequence: String
  +fingerprint: String
  +noteCount: int
  +rangeSemitones: int
}

class BiometricTemplateBuilder {
  +buildTemplate(samples: List~RhythmFeatureVector~): BehavioralTemplate
  +computeMeanVector(samples: List~RhythmFeatureVector~): List~float~
  +computeCovariance(samples: List~RhythmFeatureVector~): Matrix
}

class BehavioralTemplate {
  +templateId: String
  +userId: String
  +meanVector: List~float~
  +covarianceRef: String
  +acceptanceThreshold: float
  +createdAt: DateTime
}

class MatcherEngine {
  +compare(melody: MelodyToken, rhythm: RhythmFeatureVector, profile: AuthProfile): MatchResult
  +melodyDistance(a: MelodyToken, b: MelodyToken): float
  +rhythmDistance(a: RhythmFeatureVector, t: BehavioralTemplate): float
  +combinedScore(melodyScore: float, rhythmScore: float): float
}

class MatchResult {
  +melodyScore: float
  +rhythmScore: float
  +combinedScore: float
  +accepted: bool
  +failureReason: String
}

%% =========================
%% Key Derivation and Crypto
%% =========================
class KeyMaterialComposer {
  +compose(melody: MelodyToken, rhythm: RhythmFeatureVector, context: KeyContext): DerivedSeed
  +canonicalSerialize(...): String
  +bindContext(serialized: String, ctx: KeyContext): String
}

class KeyContext {
  +fileId: String
  +userId: String
  +vaultVersion: String
  +kdfSaltRef: String
  +pepperId: String
}

class DerivedSeed {
  +seedDigest: String
  +entropyEstimate: float
  +version: String
}

class KDFService {
  +deriveKey(seed: DerivedSeed, params: KDFParameters): SymmetricKey
  +verifyParameters(params: KDFParameters): bool
}

class KDFParameters {
  +algorithm: String
  +iterations: int
  +memoryKiB: int
  +parallelism: int
  +salt: String
  +outputLength: int
}

class SymmetricKey {
  +keyId: String
  +bytesRef: SecureHandle
  +algorithm: String
  +lengthBits: int
  +destroy(): void
}

class EncryptionService {
  +encrypt(plain: BinaryBlob, key: SymmetricKey, aad: String): CipherPackage
  +decrypt(pkg: CipherPackage, key: SymmetricKey, aad: String): BinaryBlob
  +generateNonce(): String
}

class CipherPackage {
  +ciphertext: BinaryBlob
  +nonce: String
  +authTag: String
  +aadHash: String
  +cryptoVersion: String
}

%% =========================
%% Persistence and Metadata
%% =========================
class SecureStorageManager {
  +storeEncryptedArtifact(record: EncryptedArtifactRecord): String
  +fetchEncryptedArtifact(artifactId: String): EncryptedArtifactRecord
  +deleteArtifact(artifactId: String): void
}

class EncryptedArtifactRecord {
  +artifactId: String
  +ownerUserId: String
  +fileName: String
  +mimeType: String
  +cipherPackageRef: String
  +metadataRef: String
  +createdAt: DateTime
}

class MetadataRepository {
  +saveMeta(meta: VaultMetadata): String
  +getMeta(artifactId: String): VaultMetadata
  +updateAccessState(state: AccessState): void
}

class VaultMetadata {
  +artifactId: String
  +melodyFingerprint: String
  +templateRef: String
  +kdfParamRef: String
  +allowedDriftMs: int
  +maxAttempts: int
  +lockoutWindowSec: int
  +version: String
}

class ProfileRepository {
  +saveAuthProfile(profile: AuthProfile): String
  +loadAuthProfile(userId: String, artifactId: String): AuthProfile
  +rotateProfile(profileId: String): void
}

class AuthProfile {
  +profileId: String
  +userId: String
  +melodyToken: MelodyToken
  +behavioralTemplate: BehavioralTemplate
  +policy: AuthPolicy
}

class AuthPolicy {
  +maxAttempts: int
  +lockoutSeconds: int
  +minConfidence: float
  +deviceBindingRequired: bool
}

%% =========================
%% Security and Governance
%% =========================
class AccessControlService {
  +authorize(userId: String, artifactId: String): AuthorizationResult
  +checkDeviceBinding(ctx: SessionContext): bool
  +isWithinPolicy(state: AttemptState, policy: AuthPolicy): bool
}

class AttemptTracker {
  +registerAttempt(userId: String, artifactId: String, success: bool): AttemptState
  +isLockedOut(userId: String, artifactId: String): bool
  +resetOnSuccess(userId: String, artifactId: String): void
}

class AttemptState {
  +failedAttempts: int
  +lockedUntil: DateTime
  +lastAttemptAt: DateTime
}

class IntegrityService {
  +verifyCipherPackage(pkg: CipherPackage): bool
  +verifyMetadataSignature(meta: VaultMetadata): bool
  +computeDigest(blob: BinaryBlob): String
}

class AuditLogger {
  +logSecurityEvent(event: SecurityEvent): void
  +logOperationalEvent(event: OperationalEvent): void
  +queryByCorrelationId(id: String): List~AuditRecord~
}

class SecurityEvent {
  +eventType: String
  +userId: String
  +artifactId: String
  +severity: String
  +timestamp: DateTime
  +details: Map
}

class NotificationService {
  +notifyFailure(userId: String, reason: String): void
  +notifyLockout(userId: String, until: DateTime): void
  +notifySuccess(userId: String, artifactId: String): void
}

%% =========================
%% DTOs
%% =========================
class EncryptionRequest
class EncryptionResponse
class DecryptionRequest
class DecryptionResponse
class EnrollmentRequest
class EnrollmentResponse
class AccessRequest
class AccessDecision
class EncryptionContext
class DecryptionContext
class EnrollmentContext
class EncryptionResult
class DecryptionResult
class EnrollmentResult

%% =========================
%% Relationships
%% =========================
VaultApplication --> UseCaseCoordinator
VaultApplication --> AccessControlService
VaultApplication --> AuditLogger

UseCaseCoordinator --> PianoInputController
UseCaseCoordinator --> InputSanitizer
UseCaseCoordinator --> MelodyEncoder
UseCaseCoordinator --> RhythmFeatureExtractor
UseCaseCoordinator --> MatcherEngine
UseCaseCoordinator --> KeyMaterialComposer
UseCaseCoordinator --> KDFService
UseCaseCoordinator --> EncryptionService
UseCaseCoordinator --> SecureStorageManager
UseCaseCoordinator --> MetadataRepository
UseCaseCoordinator --> ProfileRepository
UseCaseCoordinator --> AttemptTracker
UseCaseCoordinator --> IntegrityService
UseCaseCoordinator --> NotificationService

PianoInputController --> RawPerformance
RawPerformance --> NoteEvent
InputSanitizer --> SanitizedPerformance
RhythmFeatureExtractor --> RhythmFeatureVector
MelodyEncoder --> MelodyToken
BiometricTemplateBuilder --> BehavioralTemplate
MatcherEngine --> MatchResult

KeyMaterialComposer --> DerivedSeed
KeyMaterialComposer --> KeyContext
KDFService --> KDFParameters
KDFService --> SymmetricKey
EncryptionService --> CipherPackage

SecureStorageManager --> EncryptedArtifactRecord
MetadataRepository --> VaultMetadata
ProfileRepository --> AuthProfile
AuthProfile --> MelodyToken
AuthProfile --> BehavioralTemplate
AuthProfile --> AuthPolicy

AttemptTracker --> AttemptState
AuditLogger --> SecurityEvent

EncryptionRequest ..> EncryptionContext
DecryptionRequest ..> DecryptionContext
EnrollmentRequest ..> EnrollmentContext
```

---

## 3. Sequence Diagram (Detailed End-to-End)

```mermaid
sequenceDiagram
autonumber

actor U as User
participant UI as Client UI / Piano Interface
participant API as VaultApplication API
participant ACS as AccessControlService
participant AT as AttemptTracker
participant PIC as PianoInputController
participant IS as InputSanitizer
participant ME as MelodyEncoder
participant RFE as RhythmFeatureExtractor
participant PR as ProfileRepository
participant MM as MatcherEngine
participant KMC as KeyMaterialComposer
participant KDF as KDFService
participant ENC as EncryptionService
participant SS as SecureStorageManager
participant MR as MetadataRepository
participant INT as IntegrityService
participant AUD as AuditLogger
participant NOTI as NotificationService

rect rgb(235, 245, 255)
Note over U,UI: ENROLLMENT / REGISTRATION (one-time per profile)
U->>UI: Start Enrollment
UI->>API: enrollUserProfile(userId, samples=3..N)
API->>AUD: logOperationalEvent(ENROLLMENT_STARTED)
loop Capture each sample
  API->>PIC: startCapture(ENROLL)
  U->>UI: Play melody sample
  UI->>PIC: stream note events
  API->>PIC: stopCapture(sessionId)
  PIC-->>API: RawPerformance
  API->>IS: sanitize(raw)
  IS-->>API: SanitizedPerformance
  API->>ME: encodeSequence(perf)
  ME-->>API: MelodyToken
  API->>RFE: extract(perf)
  RFE-->>API: RhythmFeatureVector
end
API->>PR: saveAuthProfile(melody + behavioralTemplate + policy)
PR-->>API: profileId
API->>AUD: logSecurityEvent(ENROLLMENT_COMPLETED)
API-->>UI: EnrollmentResponse(success, profileId)
end

rect rgb(240, 255, 240)
Note over U,UI: FILE ENCRYPTION FLOW (Lock)
U->>UI: Select file + request encrypt
UI->>API: encryptFile(file, userId, artifactMeta)
API->>ACS: authorize(userId, encrypt)
ACS-->>API: allow
API->>PIC: startCapture(ENCRYPT)
U->>UI: Play melody + rhythm
UI->>PIC: stream events
API->>PIC: stopCapture(sessionId)
PIC-->>API: RawPerformance

API->>IS: sanitize(raw)
IS-->>API: SanitizedPerformance
API->>ME: encodeSequence(perf)
ME-->>API: MelodyToken
API->>RFE: extract(perf)
RFE-->>API: RhythmFeatureVector

API->>KMC: compose(melody, rhythm, keyContext)
KMC-->>API: DerivedSeed
API->>KDF: deriveKey(seed, kdfParams)
KDF-->>API: SymmetricKey

API->>ENC: encrypt(fileBytes, key, aad)
ENC-->>API: CipherPackage
API->>INT: verifyCipherPackage(pkg)
INT-->>API: valid

API->>SS: storeEncryptedArtifact(cipherPackage)
SS-->>API: artifactId
API->>MR: saveMeta(artifactId, melodyFingerprint, policy, kdfRef)
MR-->>API: metadataSaved
API->>AUD: logSecurityEvent(ENCRYPT_SUCCESS)
API->>NOTI: notifySuccess(userId, artifactId)
API-->>UI: EncryptionResponse(success, artifactId)
end

rect rgb(255, 248, 240)
Note over U,UI: FILE DECRYPTION FLOW (Unlock)
U->>UI: Request file access (artifactId)
UI->>API: decryptFile(artifactId, userId)

API->>ACS: authorize(userId, artifactId)
ACS-->>API: allow/deny
alt Authorization denied
  API->>AUD: logSecurityEvent(ACCESS_DENIED_POLICY)
  API-->>UI: DecryptionResponse(denied)
else Authorization allowed
  API->>AT: isLockedOut(userId, artifactId)
  AT-->>API: true/false
  alt Locked out
    API->>AUD: logSecurityEvent(LOCKOUT_ACTIVE)
    API->>NOTI: notifyLockout(userId, lockedUntil)
    API-->>UI: DecryptionResponse(locked)
  else Not locked
    API->>PR: loadAuthProfile(userId, artifactId)
    PR-->>API: AuthProfile
    API->>PIC: startCapture(DECRYPT)
    U->>UI: Replay melody + rhythm
    UI->>PIC: stream events
    API->>PIC: stopCapture(sessionId)
    PIC-->>API: RawPerformance

    API->>IS: sanitize(raw)
    IS-->>API: SanitizedPerformance
    API->>ME: encodeSequence(perf)
    ME-->>API: MelodyToken
    API->>RFE: extract(perf)
    RFE-->>API: RhythmFeatureVector

    API->>MM: compare(melody, rhythm, profile)
    MM-->>API: MatchResult

    alt Match failed
      API->>AT: registerAttempt(userId, artifactId, false)
      AT-->>API: AttemptState
      API->>AUD: logSecurityEvent(AUTH_MATCH_FAILED)
      API->>NOTI: notifyFailure(userId, reason)
      API-->>UI: DecryptionResponse(denied, remainingAttempts)
    else Match passed
      API->>KMC: compose(melody, rhythm, keyContext)
      KMC-->>API: DerivedSeed
      API->>KDF: deriveKey(seed, kdfParams)
      KDF-->>API: SymmetricKey

      API->>SS: fetchEncryptedArtifact(artifactId)
      SS-->>API: EncryptedArtifactRecord
      API->>INT: verifyCipherPackage(pkg)
      INT-->>API: valid/invalid

      alt Integrity invalid
        API->>AUD: logSecurityEvent(INTEGRITY_FAILURE)
        API-->>UI: DecryptionResponse(error_integrity)
      else Integrity valid
        API->>ENC: decrypt(cipherPackage, key, aad)
        ENC-->>API: plaintext
        API->>AT: registerAttempt(userId, artifactId, true)
        API->>AT: resetOnSuccess(userId, artifactId)
        API->>AUD: logSecurityEvent(DECRYPT_SUCCESS)
        API-->>UI: DecryptionResponse(success, plaintext)
      end
    end
  end
end
end
```

---

## 4. DFD Level 0 (Context Diagram)

```mermaid
flowchart LR

U[External Entity: User] -->|Melody input, file upload, access request| P0((P0 Melodic Vault System))
P0 -->|Encrypted file, access status, alerts| U

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
