import { useEffect, useState } from 'react';
import {
  Upload,
  KeyRound,
  LockKeyhole,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

import { wordlist } from '@scure/bip39/wordlists/english.js';
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { createVaultRecord } from '../../../services/vaultAPI.js';

const STORAGE_KEY = 'melodic-vault-keys';

const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256;

const loadSavedKeys = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const hexToBytes = (hex) => {
  if (!hex || hex.length % 2 !== 0) {
    throw new Error('Invalid key material.');
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(
      hex.slice(i * 2, i * 2 + 2),
      16
    );
  }

  return bytes;
};

const deriveMelodyKey = async (signature) => {
  if (!signature) {
    throw new Error('Selected melody has no signature.');
  }

  const data = new TextEncoder().encode(signature);

  const hash = await crypto.subtle.digest(
    'SHA-256',
    data
  );

  return crypto.subtle.importKey(
    'raw',
    hash,
    {
      name: AES_ALGORITHM,
    },
    false,
    ['wrapKey']
  );
};

const deriveRecoveryKey = async (mnemonic) => {
  /*
   * BIP-39 gives us deterministic seed material from
   * the 12-word recovery phrase.
   *
   * We hash the seed and use the resulting 256 bits
   * as the AES key used to wrap the file key.
   */
  const seed = mnemonicToSeedSync(
    mnemonic
  );

  const hash = await crypto.subtle.digest(
    'SHA-256',
    seed
  );

  return crypto.subtle.importKey(
    'raw',
    hash,
    {
      name: AES_ALGORITHM,
    },
    false,
    ['wrapKey']
  );
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);

  let binary = '';

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(i + chunkSize, bytes.length)
      )
    );
  }

  return btoa(binary);
};

const buildVault = async ({
  file,
  melodyKey,
  mnemonic,
}) => {
  /*
   * Generate a completely random file encryption key.
   *
   * The melody key and recovery key never directly
   * encrypt the user's file.
   */
  const fileKey = await crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );

  /*
   * AES-GCM requires a unique IV.
   */
  const iv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const plaintext = await file.arrayBuffer();

  /*
   * Encrypt the actual file.
   */
  const encryptedFile = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv,
    },
    fileKey,
    plaintext
  );

  /*
   * Generate independent recovery key.
   */
  const recoveryKey =
    await deriveRecoveryKey(mnemonic);

  /*
   * Generate independent IVs for wrapping the file key.
   */
  const melodyWrapIv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  const recoveryWrapIv = crypto.getRandomValues(
    new Uint8Array(12)
  );

  /*
   * Wrap the random file key with the melody-derived key.
   */
  const melodyWrappedKey =
    await crypto.subtle.wrapKey(
      'raw',
      fileKey,
      melodyKey,
      {
        name: AES_ALGORITHM,
        iv: melodyWrapIv,
      }
    );

  /*
   * Wrap the same file key with the recovery key.
   */
  const recoveryWrappedKey =
    await crypto.subtle.wrapKey(
      'raw',
      fileKey,
      recoveryKey,
      {
        name: AES_ALGORITHM,
        iv: recoveryWrapIv,
      }
    );

  /*
   * Package the vault.
   *
   * The actual encrypted file is stored as base64
   * for this prototype.
   */
  return {
    format: 'melodic-vault',
    version: 1,

    file: {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    },

    encryption: {
      algorithm: 'AES-256-GCM',

      fileIv: arrayBufferToBase64(iv),

      melodyWrappedKey:
        arrayBufferToBase64(melodyWrappedKey),

      melodyWrapIv:
        arrayBufferToBase64(melodyWrapIv),

      recoveryWrappedKey:
        arrayBufferToBase64(recoveryWrappedKey),

      recoveryWrapIv:
        arrayBufferToBase64(recoveryWrapIv),
    },

    createdAt: new Date().toISOString(),

    encryptedData:
      arrayBufferToBase64(encryptedFile),
  };
};

const downloadVault = (vault, fileName) => {
  const vaultBlob = new Blob(
    [JSON.stringify(vault)],
    {
      type: 'application/json',
    }
  );

  const url = URL.createObjectURL(vaultBlob);

  const anchor = document.createElement('a');

  anchor.href = url;

  anchor.download =
    `${fileName}.vault`;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
};

const VaultUpload = () => {
  const [file, setFile] = useState(null);

  const [savedKeys, setSavedKeys] = useState([]);

  const [selectedKeyId, setSelectedKeyId] =
    useState('');

  const [encrypting, setEncrypting] =
    useState(false);

  const [encrypted, setEncrypted] =
    useState(false);

  const [recoveryPhrase, setRecoveryPhrase] =
    useState('');

  const [phraseCopied, setPhraseCopied] =
    useState(false);

  const [vault, setVault] =
    useState(null);

  const [error, setError] =
    useState('');

  const [status, setStatus] =
    useState(
      'Select a file to begin.'
    );

  useEffect(() => {
    setSavedKeys(loadSavedKeys());
  }, []);

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);
    setEncrypted(false);
    setVault(null);
    setRecoveryPhrase('');
    setError('');

    if (selectedFile) {
      setStatus(
        'File selected. Choose a melody key.'
      );
    } else {
      setStatus(
        'Select a file to begin.'
      );
    }

    event.target.value = '';
  };

  const handleEncrypt = async () => {
    setError('');
    setEncrypted(false);
    setVault(null);
    setRecoveryPhrase('');

    if (!file) {
      setError(
        'Please select a file first.'
      );
      return;
    }

    if (!selectedKeyId) {
      setError(
        'Please select a melody key.'
      );
      return;
    }

    const selectedKey =
      savedKeys.find(
        (key) =>
          key.id === selectedKeyId
      );

    if (!selectedKey) {
      setError(
        'The selected melody key could not be found.'
      );
      return;
    }

    try {
      setEncrypting(true);

      setStatus(
        'Generating recovery phrase...'
      );

      /*
       * 128 bits of cryptographic entropy =
       * 12-word BIP-39 mnemonic.
       */
      const mnemonic =
        generateMnemonic(wordlist, 128);

      setStatus(
        'Deriving melody encryption key...'
      );

      /*
       * We use the stored canonical melody signature,
       * NOT the stored keyHash.
       *
       * This means the raw SHA-256 key does not need
       * to be read from storage.
       */
      const melodyKey =
        await deriveMelodyKey(
          selectedKey.signature
        );

      setStatus(
        'Encrypting file with AES-256-GCM...'
      );

      const generatedVault =
        await buildVault({
          file,
          melodyKey,
          mnemonic,
        });

      await createVaultRecord({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        algorithm: 'AES-256-GCM',
        melodyLength: selectedKey.noteCount,
        hasRecoveryPhrase: true,
      });

      setVault(generatedVault);

      setRecoveryPhrase(mnemonic);

      setEncrypted(true);

      setStatus(
        'Encryption complete. Save your recovery phrase before downloading the vault.'
      );
    } catch (err) {
      console.error(
        'Vault encryption failed:',
        err
      );

      setError(
        err.message ||
        'Encryption failed.'
      );

      setStatus(
        'Encryption failed.'
      );
    } finally {
      setEncrypting(false);
    }
  };

  const handleDownload = () => {
    if (!vault || !file) {
      return;
    }

    downloadVault(
      vault,
      file.name
        .replace(/\.[^/.]+$/, '')
    );
  };

  const handleCopyRecoveryPhrase = async () => {
    await navigator.clipboard.writeText(recoveryPhrase);
    setPhraseCopied(true);
    window.setTimeout(() => setPhraseCopied(false), 2000);
  };

  const handleDownloadRecoveryPhrase = () => {
    const phraseBlob = new Blob([`${recoveryPhrase}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(phraseBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${file?.name.replace(/\.[^/.]+$/, '') || 'melodic-vault'}-recovery.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">

      {/* STEP 01 */}
      <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">

        <div className="flex items-start gap-4">

          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-[#FFD600] shadow-[3px_3px_0_#0F172A]">
            <Upload
              size={22}
              strokeWidth={3}
            />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">
              Step 01
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase italic">
              Choose File
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-black/65">
              Select the file you want to
              encrypt inside your Melodic Vault.
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-xl border-[3px] border-dashed border-black bg-[#FDFBF7] p-6">

          <label
            htmlFor="vault-file"
            className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border-[3px] border-black bg-[#1E6BFF] px-5 text-sm font-black uppercase italic text-white shadow-[4px_4px_0_#0F172A]"
          >
            <Upload
              size={18}
              strokeWidth={3}
            />

            Choose File
          </label>

          <input
            id="vault-file"
            type="file"
            onChange={handleFileChange}
            disabled={encrypting}
            className="hidden"
          />

          {file && (
            <div className="mt-4 rounded-xl border-[3px] border-black bg-[#EAF1FF] p-4">

              <p className="text-xs font-black uppercase tracking-[0.12em] text-black/60">
                Selected file
              </p>

              <p className="mt-1 break-all text-sm font-black">
                {file.name}
              </p>

              <p className="mt-1 text-xs font-bold text-black/60">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

            </div>
          )}

        </div>
      </div>

      {/* STEP 02 */}
      {file && (
        <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">

          <div className="flex items-start gap-4">

            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-[#FFD600] shadow-[3px_3px_0_#0F172A]">
              <KeyRound
                size={22}
                strokeWidth={3}
              />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">
                Step 02
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase italic">
                Choose Encryption Key
              </h2>

              <p className="mt-2 text-sm font-bold leading-6 text-black/65">
                Select one of your saved melody
                keys to protect this file.
              </p>
            </div>

          </div>

          {savedKeys.length === 0 ? (
            <div className="mt-6 rounded-xl border-[3px] border-black bg-red-300 p-5">

              <p className="text-sm font-black">
                No melody keys found.
              </p>

              <p className="mt-2 text-xs font-bold">
                Go to Melody Capture and create
                a melody key first.
              </p>

            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {savedKeys.map((key) => {
                const selected =
                  selectedKeyId === key.id;

                return (
                  <button
                    key={key.id}
                    type="button"
                    disabled={encrypting}
                    onClick={() =>
                      setSelectedKeyId(key.id)
                    }
                    className={`flex w-full items-center gap-4 rounded-xl border-[3px] border-black p-4 text-left shadow-[3px_3px_0_#0F172A] transition-transform ${
                      selected
                        ? 'bg-[#00E676]'
                        : 'bg-[#FDFBF7]'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >

                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-[3px] border-black bg-white">

                      {selected && (
                        <span className="h-3 w-3 rounded-full bg-black" />
                      )}

                    </span>

                    <span className="min-w-0 flex-1">

                      <span className="block text-base font-black">
                        {key.name}
                      </span>

                      <span className="mt-1 block text-xs font-bold text-black/55">
                        {key.noteCount} notes
                      </span>

                    </span>

                    {selected && (
                      <CheckCircle2
                        size={22}
                        strokeWidth={3}
                      />
                    )}

                  </button>
                );
              })}

            </div>
          )}

          {savedKeys.length > 0 && (
            <button
              type="button"
              onClick={handleEncrypt}
              disabled={
                !selectedKeyId ||
                encrypting
              }
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl border-[3px] border-black bg-[#00E676] px-6 text-sm font-black uppercase italic shadow-[4px_4px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <LockKeyhole
                size={18}
                strokeWidth={3}
              />

              {encrypting
                ? 'Encrypting...'
                : 'Encrypt File'}
            </button>
          )}

        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border-[3px] border-black bg-red-400 p-4 text-sm font-black">
          {error}
        </div>
      )}

      {/* STATUS */}
      {file && !error && (
        <p className="px-1 text-sm font-black">
          {status}
        </p>
      )}

      {/* STEP 03 */}
      {encrypted && recoveryPhrase && (
        <div className="rounded-2xl border-4 border-black bg-[#FFD600] p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">

          <div className="flex items-start gap-4">

            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#0F172A]">
              <ShieldCheck
                size={22}
                strokeWidth={3}
              />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Step 03
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase italic">
                Recovery Phrase
              </h2>

              <p className="mt-2 text-sm font-bold leading-6">
                This is your backup method for
                recovering the encrypted file.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-xl border-[3px] border-black bg-white p-5 shadow-[4px_4px_0_#0F172A]">

            <p className="text-xs font-black uppercase tracking-[0.12em] text-red-600">
              Save this before continuing
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

              {recoveryPhrase
                .split(' ')
                .map((word, index) => (
                  <div
                    key={`${word}-${index}`}
                    className="rounded-lg border-2 border-black bg-[#FDFBF7] p-3"
                  >

                    <p className="text-[10px] font-black text-black/40">
                      {index + 1}
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {word}
                    </p>

                  </div>
                ))}

            </div>

            <p className="mt-5 text-xs font-black leading-5 text-red-600">
              Anyone with this phrase may be able
              to recover your vault. Do not share it.
              Melodic Vault does not store this phrase.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyRecoveryPhrase}
                className="inline-flex h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-[#00E676] px-4 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A]"
              >
                <Copy size={16} strokeWidth={3} />
                {phraseCopied ? 'Copied' : 'Copy phrase'}
              </button>
              <button
                type="button"
                onClick={handleDownloadRecoveryPhrase}
                className="inline-flex h-11 items-center gap-2 rounded-xl border-[3px] border-black bg-white px-4 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A]"
              >
                <Download size={16} strokeWidth={3} />
                Download phrase
              </button>
            </div>

          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl border-[3px] border-black bg-[#1E6BFF] px-6 text-sm font-black uppercase italic text-white shadow-[4px_4px_0_#0F172A]"
          >
            <Download
              size={18}
              strokeWidth={3}
            />

            Download .vault
          </button>

        </div>
      )}

    </section>
  );
};

export default VaultUpload;