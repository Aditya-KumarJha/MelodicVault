import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  CircleStop,
  Download,
  FileArchive,
  FileMusic,
  KeyRound,
  Play,
  Upload,
  Unlock,
} from 'lucide-react';

import { Midi } from '@tonejs/midi';
import { mnemonicToSeedSync } from '@scure/bip39';

import {
  MAX_NOTES,
  buildSignature,
  getNoteName,
  normalizeNotes,
  deriveMelodyKey,
  base64ToUint8Array,
} from '../../services/melodyCrypto.js';

const deriveRecoveryKey = async (mnemonic) => {
  const seed = mnemonicToSeedSync(mnemonic.trim());
  const hash = await crypto.subtle.digest('SHA-256', seed);

  return crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['unwrapKey']
  );
};


const UnlockVault = () => {
  const [vaultFile, setVaultFile] =
    useState(null);

  const [vault, setVault] =
    useState(null);

  const [midiFile, setMidiFile] =
    useState(null);

  const [midiAccess, setMidiAccess] =
    useState(null);

  const [inputs, setInputs] =
    useState([]);

  const [selectedInputId, setSelectedInputId] =
    useState('');

  const [recording, setRecording] =
    useState(false);

  const recordingRef =
    useRef(false);

  const recordingStartRef =
    useRef(null);

  const [notes, setNotes] =
    useState([]);

  const [melodySource, setMelodySource] =
    useState(null);

  const [signature, setSignature] =
    useState('');

  const [recoveryWords, setRecoveryWords] =
    useState(() => Array(12).fill(''));

  const recoveryPhrase =
    recoveryWords.join(' ').trim();

  const [status, setStatus] =
    useState('');

  const [error, setError] =
    useState('');

  const [unlocking, setUnlocking] =
    useState(false);

  const [unlocked, setUnlocked] =
    useState(false);

  const updateRecoveryWord = (index, value) => {
    const word = value.trim().split(/\s+/)[0] || '';
    setRecoveryWords((currentWords) =>
      currentWords.map((currentWord, wordIndex) =>
        wordIndex === index ? word : currentWord
      )
    );
  };

  const pasteRecoveryPhrase = (event, index) => {
    const pastedWords = event.clipboardData
      .getData('text')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 12);

    if (pastedWords.length > 1) {
      event.preventDefault();
      setRecoveryWords((currentWords) => currentWords.map((word, wordIndex) =>
        wordIndex >= index && wordIndex < index + pastedWords.length
          ? pastedWords[wordIndex - index]
          : word
      ));
    }
  };


  /*
   * ------------------------------------------------
   * Vault file
   * ------------------------------------------------
   */

  const handleVaultFile = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setStatus('');
    setUnlocked(false);
    setVault(null);
    setVaultFile(file);

    try {
      if (
        !file.name
          .toLowerCase()
          .endsWith('.vault')
      ) {
        throw new Error(
          'Please select a .vault file.'
        );
      }

      const text =
        await file.text();

      const parsed =
        JSON.parse(text);

      validateVault(parsed);

      setVault(parsed);

      setStatus(
        `Vault loaded: ${parsed.file.name}`
      );
    } catch (err) {
      setVault(null);

      setError(
        err.message ||
        'Invalid vault file.'
      );
    }
  };


  const validateVault = (data) => {
    if (
      !data ||
      typeof data !== 'object'
    ) {
      throw new Error(
        'Invalid vault format.'
      );
    }

    if (
      data.format !==
      'melodic-vault'
    ) {
      throw new Error(
        'This is not a Melodic Vault file.'
      );
    }

    if (data.version !== 1) {
      throw new Error(
        'Unsupported vault version.'
      );
    }

    if (
      !data.file ||
      !data.encryption
    ) {
      throw new Error(
        'Vault metadata is incomplete.'
      );
    }

    const requiredEncryptionFields = [
      'algorithm',
      'fileIv',
      'melodyWrappedKey',
      'melodyWrapIv',
    ];

    for (
      const field of
      requiredEncryptionFields
    ) {
      if (
        !data.encryption[field]
      ) {
        throw new Error(
          `Vault is missing ${field}.`
        );
      }
    }

    if (
      !data.encryptedData
    ) {
      throw new Error(
        'Vault contains no encrypted data.'
      );
    }
  };


  /*
   * ------------------------------------------------
   * MIDI access
   * ------------------------------------------------
   */

  const requestMidiAccess = async () => {
    setError('');
    setStatus('');

    if (
      !navigator.requestMIDIAccess
    ) {
      setError(
        'Web MIDI is not supported in this browser. Use Chrome or Edge, or upload a .mid file instead.'
      );

      return;
    }

    try {
      const access =
        await navigator.requestMIDIAccess();

      setMidiAccess(access);

      refreshMidiInputs(access);

      setStatus(
        'MIDI device access granted.'
      );

      access.onstatechange = () => {
        refreshMidiInputs(access);
      };
    } catch (err) {
      console.error(
        'MIDI access failed:',
        err
      );

      setError(
        'Could not access the MIDI device. You can still upload a .mid file.'
      );
    }
  };


  const refreshMidiInputs = (access) => {
    const availableInputs =
      Array.from(
        access.inputs.values()
      );

    setInputs(
      availableInputs
    );

    if (
      availableInputs.length > 0 &&
      !availableInputs.some(
        (input) =>
          input.id ===
          selectedInputId
      )
    ) {
      setSelectedInputId(
        availableInputs[0].id
      );
    }
  };


  /*
   * ------------------------------------------------
   * Live MIDI recording
   * ------------------------------------------------
   */

  const handleMidiMessage = (event) => {
    if (
      !recordingRef.current
    ) {
      return;
    }

    const [
      statusByte,
      note,
      velocity,
    ] = event.data;

    const command =
      statusByte & 0xf0;

    // Note On
    if (
      command !== 0x90 ||
      velocity === 0
    ) {
      return;
    }

    if (
      notes.length >= MAX_NOTES
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      recordingStartRef.current ===
      null
    ) {
      recordingStartRef.current =
        now;
    }

    const timestamp =
      now -
      recordingStartRef.current;

    setNotes((previous) => {
      if (
        previous.length >=
        MAX_NOTES
      ) {
        return previous;
      }

      return [
        ...previous,
        {
          note,
          timestamp,
        },
      ];
    });

    setStatus(
      `Captured ${notes.length + 1}/${MAX_NOTES}: ${getNoteName(note)}`
    );

    if (
      notes.length + 1 >=
      MAX_NOTES
    ) {
      stopRecording();
    }
  };


  const startRecording = () => {
    setError('');
    setStatus('');

    if (!vault) {
      setError(
        'Load a .vault file first.'
      );

      return;
    }

    if (!midiAccess) {
      setError(
        'Connect a MIDI device first.'
      );

      return;
    }

    if (!selectedInputId) {
      setError(
        'Select a MIDI input first.'
      );

      return;
    }

    const input =
      midiAccess.inputs.get(
        selectedInputId
      );

    if (!input) {
      setError(
        'Selected MIDI input is unavailable.'
      );

      return;
    }

    setNotes([]);
    setSignature('');
    setMelodySource(null);
    setUnlocked(false);

    recordingStartRef.current =
      null;

    recordingRef.current =
      true;

    setRecording(true);

    input.onmidimessage =
      handleMidiMessage;

    setStatus(
      'Recording... play your melody.'
    );
  };


  const stopRecording = () => {
    recordingRef.current =
      false;

    setRecording(false);

    recordingStartRef.current =
      null;

    if (midiAccess) {
      for (
        const input of
        midiAccess.inputs.values()
      ) {
        input.onmidimessage =
          null;
      }
    }

    setStatus(
      'Recording stopped.'
    );
  };


  /*
   * ------------------------------------------------
   * MIDI file import
   * ------------------------------------------------
   */

  const handleMidiFile = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setStatus('');
    setUnlocked(false);

    try {
      if (
        !file.name
          .toLowerCase()
          .endsWith('.mid') &&
        !file.name
          .toLowerCase()
          .endsWith('.midi')
      ) {
        throw new Error(
          'Please select a MIDI (.mid) file.'
        );
      }

      const arrayBuffer =
        await file.arrayBuffer();

      const midi =
        new Midi(arrayBuffer);

      const importedNotes = [];

      for (
        const track of
        midi.tracks
      ) {
        for (
          const note of
          track.notes
        ) {
          importedNotes.push({
            note: note.midi,
            timestamp:
              note.time * 1000,
          });
        }
      }

      if (
        importedNotes.length === 0
      ) {
        throw new Error(
          'The MIDI file contains no notes.'
        );
      }

      const normalized =
        normalizeNotes(
          importedNotes
        );

      setNotes(normalized);

      const newSignature =
        buildSignature(
          normalized
        );

      setSignature(
        newSignature
      );

      setMidiFile(file);
      setMelodySource(
        'midi-file'
      );

      setStatus(
        `Loaded ${normalized.length} notes from ${file.name}.`
      );
    } catch (err) {
      console.error(
        'MIDI import failed:',
        err
      );

      setError(
        err.message ||
        'Could not read the MIDI file.'
      );
    }
  };


  /*
   * ------------------------------------------------
   * Build signature after live recording
   * ------------------------------------------------
   */

  useEffect(() => {
    if (
      notes.length === 0
    ) {
      setSignature('');
      return;
    }

    const normalized =
      normalizeNotes(notes);

    const newSignature =
      buildSignature(
        normalized
      );

    setSignature(
      newSignature
    );

    if (
      melodySource !==
      'midi-file'
    ) {
      setMelodySource(
        'live-midi'
      );
    }
  }, [notes]);


  /*
   * ------------------------------------------------
   * Unlock
   * ------------------------------------------------
   */

  const unlockVault = async () => {
    setError('');
    setStatus('');
    setUnlocked(false);

    if (!vault) {
      setError(
        'Load a .vault file first.'
      );

      return;
    }

    if (!signature && !recoveryPhrase) {
      setError(
        'Play the melody, upload the original .mid file, or enter your recovery phrase.'
      );

      return;
    }

    setUnlocking(true);

    try {
      const usingRecoveryPhrase = Boolean(recoveryPhrase);
      const unlockKey = usingRecoveryPhrase
        ? await deriveRecoveryKey(recoveryPhrase)
        : await deriveMelodyKey(signature);

      const wrappedKey =
        base64ToUint8Array(
          vault.encryption[usingRecoveryPhrase ? 'recoveryWrappedKey' : 'melodyWrappedKey']
        );

      const wrapIv =
        base64ToUint8Array(
          vault.encryption[usingRecoveryPhrase ? 'recoveryWrapIv' : 'melodyWrapIv']
        );

      let fileKey;

      try {
        fileKey =
          await crypto.subtle.unwrapKey(
            'raw',
            wrappedKey,
            unlockKey,
            {
              name: 'AES-GCM',
              iv: wrapIv,
            },
            {
              name: 'AES-GCM',
              length: 256,
            },
            false,
            ['decrypt']
          );
      } catch {
        throw new Error(
          usingRecoveryPhrase
            ? 'The recovery phrase does not match this vault.'
            : 'The melody does not match this vault.'
        );
      }

      const encryptedData =
        base64ToUint8Array(
          vault.encryptedData
        );

      const fileIv =
        base64ToUint8Array(
          vault.encryption
            .fileIv
        );

      let plaintext;

      try {
        plaintext =
          await crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: fileIv,
            },
            fileKey,
            encryptedData
          );
      } catch {
        throw new Error(
          usingRecoveryPhrase
            ? 'The recovery phrase does not match this vault, or the vault is corrupted.'
            : 'The melody does not match this vault, or the vault is corrupted.'
        );
      }

      const blob =
        new Blob(
          [plaintext],
          {
            type:
              vault.file.type ||
              'application/octet-stream',
          }
        );

      downloadFile(
        blob,
        vault.file.name
      );

      setUnlocked(true);

      setStatus(
        `Vault unlocked successfully. Downloaded ${vault.file.name}.`
      );
    } catch (err) {
      console.error(
        'Vault unlock failed:',
        err
      );

      setError(
        err.message ||
        'Could not unlock the vault.'
      );
    } finally {
      setUnlocking(false);
    }
  };


  const downloadFile = (
    blob,
    filename
  ) => {
    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(
      anchor
    );

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };


  /*
   * ------------------------------------------------
   * Cleanup
   * ------------------------------------------------
   */

  useEffect(() => {
    return () => {
      recordingRef.current =
        false;

      if (midiAccess) {
        for (
          const input of
          midiAccess.inputs.values()
        ) {
          input.onmidimessage =
            null;
        }
      }
    };
  }, [midiAccess]);


  /*
   * ------------------------------------------------
   * UI
   * ------------------------------------------------
   */

  return (
    <div className="space-y-5">

      {/* Step 1: Select Vault */}
      <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black bg-[#FFD600] text-sm font-black uppercase italic shadow-[3px_3px_0_#0F172A]">
            1
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Unlock Flow</p>
            <h2 className="mt-1 text-lg font-black uppercase italic text-black">Select .vault File</h2>
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-4 border-dashed border-black bg-[#FDFBF7] px-6 py-10 text-center transition hover:bg-[#FFD600]/20">
          <FileArchive size={32} className="mb-3 text-black" strokeWidth={2.5} />
          <span className="font-black uppercase italic text-black">Choose .vault File</span>
          <span className="mt-2 text-xs font-bold uppercase text-black/60">The file is processed locally.</span>
          <input
            type="file"
            accept=".vault,application/json"
            onChange={handleVaultFile}
            className="hidden"
          />
        </label>

        {vault && (
          <div className="mt-4 rounded-xl border-[3px] border-black bg-[#00E676] p-4">
            <p className="font-black uppercase italic text-black">{vault.file.name}</p>
            <p className="mt-1 text-xs font-bold uppercase text-black/65">{formatBytes(vault.file.size)}</p>
          </div>
        )}
      </section>

      {/* Step 2: Reproduce Melody */}
      <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black bg-[#00E676] text-sm font-black uppercase italic shadow-[3px_3px_0_#0F172A]">
            2
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Melody Input</p>
            <h2 className="mt-1 text-lg font-black uppercase italic text-black">Reproduce Melody</h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Live MIDI */}
          <div className="rounded-2xl border-4 border-black bg-[#FFC0CB] p-5 shadow-[6px_6px_0_#0F172A]">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg border-[3px] border-black bg-[#FFD600]">
                <Play size={18} strokeWidth={3} />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase italic text-black">Live MIDI</h3>
                <p className="text-[10px] font-bold uppercase text-black/60">Use your keyboard</p>
              </div>
            </div>

            <button
              type="button"
              onClick={requestMidiAccess}
              className="mb-3 w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A] hover:bg-[#FFD600]"
            >
              Detect MIDI
            </button>

            {inputs.length > 0 && (
              <select
                value={selectedInputId}
                onChange={(event) => setSelectedInputId(event.target.value)}
                className="mb-3 w-full rounded-lg border-[3px] border-black bg-white px-2 py-2 text-xs font-bold uppercase text-black"
              >
                {inputs.map((input) => (
                  <option key={input.id} value={input.id}>
                    {input.name || 'MIDI Input'}
                  </option>
                ))}
              </select>
            )}

            {recording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-red-500 px-3 py-2 text-xs font-black uppercase italic text-white shadow-[3px_3px_0_#0F172A]"
              >
                <CircleStop size={16} strokeWidth={3} />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={!midiAccess || !selectedInputId || !vault}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-[#1E6BFF] px-3 py-2 text-xs font-black uppercase italic text-white shadow-[3px_3px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={16} strokeWidth={3} />
                Play
              </button>
            )}
          </div>

          {/* MIDI File Upload */}
          <div className="rounded-2xl border-4 border-black bg-[#FFC0CB] p-5 shadow-[6px_6px_0_#0F172A]">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg border-[3px] border-black bg-[#FFD600]">
                <FileMusic size={18} strokeWidth={3} />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase italic text-black">Upload MIDI</h3>
                <p className="text-[10px] font-bold uppercase text-black/60">Original .mid file</p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-[3px] border-black bg-white px-3 py-2 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A] hover:bg-[#FFD600]">
              <Upload size={16} strokeWidth={3} />
              Choose .mid
              <input
                type="file"
                accept=".mid,.midi,audio/midi"
                onChange={handleMidiFile}
                className="hidden"
              />
            </label>

            {midiFile && (
              <div className="mt-3 rounded-lg border-[3px] border-black bg-white p-3">
                <p className="truncate text-xs font-black uppercase italic text-black">{midiFile.name}</p>
                <p className="text-[10px] font-bold uppercase text-black/60">{notes.length} notes detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Captured notes */}
        {notes.length > 0 && (
          <div className="mt-5 rounded-xl border-[3px] border-black bg-[#FDFBF7] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-black uppercase italic text-black">Melody Pattern</span>
              <span className="text-[10px] font-black uppercase text-black/60">{notes.length}/{MAX_NOTES}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {notes.map((note, index) => (
                <span
                  key={`${note.note}-${index}`}
                  className="rounded-lg border-[3px] border-black bg-[#00E676] px-3 py-1.5 text-xs font-black uppercase italic text-black shadow-[2px_2px_0_#0F172A]"
                >
                  {getNoteName(note.note)}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Step 3: Recovery Phrase Alternative */}
      <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black bg-[#FFD600] text-sm font-black uppercase italic shadow-[3px_3px_0_#0F172A]">
            +
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Alternative</p>
            <h2 className="mt-1 text-lg font-black uppercase italic text-black">Recovery Phrase</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recoveryWords.map((word, index) => (
            <label key={`recovery-word-${index}`} className="relative">
              <span className="absolute left-2.5 top-2 text-[10px] font-black text-black/40">{index + 1}</span>
              <input
                type="text"
                value={word}
                onChange={(event) => updateRecoveryWord(index, event.target.value)}
                onPaste={(event) => pasteRecoveryPhrase(event, index)}
                autoComplete="off"
                spellCheck="false"
                aria-label={`Recovery word ${index + 1}`}
                className="h-14 w-full rounded-lg border-[3px] border-black bg-white px-2.5 pb-1 pt-5 text-xs font-bold uppercase text-black outline-none focus:bg-[#FFD600]"
              />
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs font-bold uppercase text-black/60">Enter all 12 words in order. Paste the phrase to auto-fill.</p>
      </section>

      {/* Step 4: Unlock */}
      <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black bg-[#00E676] text-sm font-black uppercase italic shadow-[3px_3px_0_#0F172A]">
            3
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Final Step</p>
            <h2 className="mt-1 text-lg font-black uppercase italic text-black">Decrypt & Download</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={unlockVault}
          disabled={!vault || (!signature && !recoveryPhrase) || unlocking}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-black bg-[#00E676] px-5 py-3 text-xs font-black uppercase italic text-black shadow-[5px_5px_0_#0F172A] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {unlocking ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Unlocking...
            </>
          ) : (
            <>
              <Unlock size={18} strokeWidth={3} />
              Unlock Vault
            </>
          )}
        </button>

        {unlocked && (
          <div className="mt-4 rounded-xl border-[3px] border-black bg-[#00E676] p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} strokeWidth={3} className="text-black" />
              <p className="font-black uppercase italic text-black">File unlocked and downloaded!</p>
            </div>
          </div>
        )}
      </section>

      {/* Messages */}
      {error && (
        <div className="rounded-xl border-[3px] border-black bg-[#FFD600] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-black" strokeWidth={3} />
            <p className="text-xs font-black uppercase italic text-black">{error}</p>
          </div>
        </div>
      )}

      {status && !error && (
        <div className="rounded-xl border-[3px] border-black bg-[#FFC0CB] p-4">
          <p className="text-xs font-black uppercase italic text-black">{status}</p>
        </div>
      )}

    </div>
  );
};


/*
 * ------------------------------------------------
 * Helpers
 * ------------------------------------------------
 */

const formatBytes = (bytes) => {
  if (!bytes) {
    return '0 B';
  }

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)} ${
    units[index] || 'TB'
  }`;
};


export default UnlockVault;