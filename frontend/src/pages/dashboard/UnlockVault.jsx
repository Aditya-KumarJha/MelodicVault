import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AlertTriangle,
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

import {
  MAX_NOTES,
  buildSignature,
  getNoteName,
  normalizeNotes,
  deriveMelodyKey,
  base64ToUint8Array,
} from '../../services/melodyCrypto.js';


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

  const [status, setStatus] =
    useState('');

  const [error, setError] =
    useState('');

  const [unlocking, setUnlocking] =
    useState(false);

  const [unlocked, setUnlocked] =
    useState(false);


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

    if (!signature) {
      setError(
        'Play the melody or upload the original .mid file first.'
      );

      return;
    }

    setUnlocking(true);

    try {
      /*
       * The important part:
       *
       * We derive the key ONLY from the newly
       * supplied melody.
       *
       * Nothing is read from localStorage.
       */

      const melodyKey =
        await deriveMelodyKey(
          signature
        );

      const wrappedKey =
        base64ToUint8Array(
          vault.encryption
            .melodyWrappedKey
        );

      const wrapIv =
        base64ToUint8Array(
          vault.encryption
            .melodyWrapIv
        );

      let fileKey;

      try {
        fileKey =
          await crypto.subtle.unwrapKey(
            'raw',
            wrappedKey,
            melodyKey,
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
          'The melody does not match this vault.'
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
          'The melody does not match this vault, or the vault is corrupted.'
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
    <div className="space-y-6">

      {/* Header */}

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <KeyRound
              size={21}
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Unlock Vault
            </h1>

            <p className="text-sm text-slate-500">
              Reproduce the original melody to decrypt your file.
            </p>
          </div>
        </div>
      </div>


      {/* Security notice */}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">

          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="font-medium text-amber-900">
              Your saved melody is not used here
            </p>

            <p className="mt-1 text-sm text-amber-800">
              Unlocking requires a fresh melody
              played through MIDI or the original
              MIDI file. The stored melody keys in
              localStorage are never read.
            </p>
          </div>

        </div>
      </div>


      {/* Step 1 */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            01
          </span>

          <div>
            <h2 className="font-semibold text-slate-900">
              Select Vault
            </h2>

            <p className="text-sm text-slate-500">
              Choose the encrypted .vault file.
            </p>
          </div>

        </div>


        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center transition hover:border-slate-500">

          <FileArchive
            size={30}
            className="mb-3 text-slate-500"
          />

          <span className="font-medium text-slate-800">
            Choose .vault file
          </span>

          <span className="mt-1 text-sm text-slate-500">
            The file is processed locally.
          </span>

          <input
            type="file"
            accept=".vault,application/json"
            onChange={handleVaultFile}
            className="hidden"
          />

        </label>


        {vault && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">

            <p className="font-medium text-slate-900">
              {vault.file.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {formatBytes(vault.file.size)}
            </p>

          </div>
        )}

      </section>


      {/* Step 2 */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            02
          </span>

          <div>
            <h2 className="font-semibold text-slate-900">
              Reproduce Melody
            </h2>

            <p className="text-sm text-slate-500">
              Play it live or provide the original MIDI recording.
            </p>
          </div>

        </div>


        <div className="grid gap-4 md:grid-cols-2">

          {/* Live MIDI */}

          <div className="rounded-xl border border-slate-200 p-5">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Play
                  size={19}
                />
              </div>

              <div>
                <h3 className="font-medium text-slate-900">
                  Play Melody
                </h3>

                <p className="text-xs text-slate-500">
                  Use your MIDI keyboard.
                </p>
              </div>

            </div>


            <button
              type="button"
              onClick={
                requestMidiAccess
              }
              className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Detect MIDI Devices
            </button>


            {inputs.length > 0 && (
              <select
                value={selectedInputId}
                onChange={(event) =>
                  setSelectedInputId(
                    event.target.value
                  )
                }
                className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >

                {inputs.map(
                  (input) => (
                    <option
                      key={input.id}
                      value={input.id}
                    >
                      {input.name ||
                        'MIDI Input'}
                    </option>
                  )
                )}

              </select>
            )}


            {recording ? (

              <button
                type="button"
                onClick={
                  stopRecording
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <CircleStop
                  size={18}
                />
                Stop Recording
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  startRecording
                }
                disabled={
                  !midiAccess ||
                  !selectedInputId ||
                  !vault
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play
                  size={18}
                />
                Start Recording
              </button>

            )}

          </div>


          {/* MIDI file */}

          <div className="rounded-xl border border-slate-200 p-5">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <FileMusic
                  size={19}
                />
              </div>

              <div>
                <h3 className="font-medium text-slate-900">
                  Upload MIDI
                </h3>

                <p className="text-xs text-slate-500">
                  Use the original .mid file.
                </p>
              </div>

            </div>


            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">

              <Upload
                size={17}
              />

              Choose .mid file

              <input
                type="file"
                accept=".mid,.midi,audio/midi"
                onChange={
                  handleMidiFile
                }
                className="hidden"
              />

            </label>


            {midiFile && (
              <div className="mt-4 rounded-lg bg-slate-50 p-3">

                <p className="truncate text-sm font-medium text-slate-800">
                  {midiFile.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {notes.length} notes detected
                </p>

              </div>
            )}

          </div>

        </div>


        {/* Captured notes */}

        {notes.length > 0 && (
          <div className="mt-5 rounded-xl border border-slate-200 p-4">

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-800">
                Melody
              </span>

              <span className="text-xs text-slate-500">
                {notes.length}/{MAX_NOTES} notes
              </span>

            </div>


            <div className="flex flex-wrap gap-2">

              {notes.map(
                (note, index) => (
                  <span
                    key={`${note.note}-${index}`}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {getNoteName(
                      note.note
                    )}
                  </span>
                )
              )}

            </div>

          </div>
        )}

      </section>


      {/* Step 3 */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            03
          </span>

          <div>
            <h2 className="font-semibold text-slate-900">
              Unlock
            </h2>

            <p className="text-sm text-slate-500">
              The melody is used to recover the encryption key.
            </p>
          </div>

        </div>


        <button
          type="button"
          onClick={
            unlockVault
          }
          disabled={
            !vault ||
            !signature ||
            unlocking
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >

          {unlocking ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Unlocking...
            </>
          ) : (
            <>
              <Unlock
                size={19}
              />
              Unlock & Download
            </>
          )}

        </button>


        {unlocked && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">

            <Download
              size={20}
              className="text-green-600"
            />

            <p className="text-sm font-medium text-green-800">
              File successfully decrypted and downloaded.
            </p>

          </div>
        )}

      </section>


      {/* Messages */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {status && !error && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {status}
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