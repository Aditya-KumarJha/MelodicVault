import { useEffect, useRef, useState } from 'react';
import { Music2, CircleStop, Play, Trash2, KeyRound, Upload, FileMusic } from 'lucide-react';
import { Midi } from '@tonejs/midi';

import { MAX_NOTES, QUANTIZATION_MS, buildSignature, bufferToHex, deriveMelodyHash, getNoteName } from '../../../services/melodyCrypto';

const STORAGE_KEY = 'melodic-vault-keys';

const loadSavedKeys = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const MidiKeyRecorder = () => {
  const [midiAccess, setMidiAccess] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [selectedInputId, setSelectedInputId] = useState('');

  const [recording, setRecording] = useState(false);
  const [notes, setNotes] = useState([]);

  const [keyName, setKeyName] = useState('');
  const [savedKeys, setSavedKeys] = useState(loadSavedKeys);

  const [status, setStatus] = useState(
    'Connect your MIDI keyboard and enable MIDI access.'
  );

  const [error, setError] = useState('');

  const notesRef = useRef([]);
  const startTimeRef = useRef(null);
  const inputRef = useRef(null);

  const refreshInputs = (access) => {
    const availableInputs = Array.from(
      access.inputs.values()
    );

    setInputs(availableInputs);

    if (
      availableInputs.length > 0 &&
      !availableInputs.some(
        (input) => input.id === selectedInputId
      )
    ) {
      setSelectedInputId(availableInputs[0].id);
    }
  };

  const requestMidiAccess = async () => {
    setError('');

    if (!navigator.requestMIDIAccess) {
      setError(
        'Web MIDI is not available in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    try {
      const access = await navigator.requestMIDIAccess();

      setMidiAccess(access);
      refreshInputs(access);

      access.onstatechange = () => {
        refreshInputs(access);
      };

      setStatus('MIDI ready. Select your keyboard and press Record.');
    } catch (err) {
      console.error('MIDI access failed:', err);

      setError(
        'MIDI access was denied or your browser does not support Web MIDI.'
      );
    }
  };

  useEffect(() => {
    requestMidiAccess();

    return () => {
      if (midiAccess) {
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
      }
    };
  }, []);

  const handleMidiMessage = (event) => {
    if (!recording) {
      return;
    }

    const [statusByte, noteNumber, velocity] = event.data;

    const messageType = statusByte & 0xf0;

    const isNoteOn =
      messageType === 0x90 && velocity > 0;

    if (!isNoteOn) {
      return;
    }

    if (notesRef.current.length >= MAX_NOTES) {
      return;
    }

    const now = performance.now();

    if (startTimeRef.current === null) {
      startTimeRef.current = now;
    }

    const timestamp = now - startTimeRef.current;

    const nextNote = {
      note: noteNumber,
      timestamp,
      velocity,
    };

    notesRef.current = [
      ...notesRef.current,
      nextNote,
    ];

    setNotes([...notesRef.current]);

    if (notesRef.current.length >= MAX_NOTES) {
      stopRecording();
    }
  };
  const handleMidiFile = async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  setError('');
  setStatus('Reading MIDI file...');

  try {
    if (!file.name.toLowerCase().endsWith('.mid') &&
        !file.name.toLowerCase().endsWith('.midi')) {
      throw new Error('Please select a .mid or .midi file.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const importedNotes = [];

    /*
     * MIDI time is measured in seconds.
     * Convert it to milliseconds so it uses
     * the same format as the live recorder.
     */
    for (const track of midi.tracks) {
      for (const note of track.notes) {
        if (importedNotes.length >= MAX_NOTES) {
          break;
        }

        importedNotes.push({
          note: note.midi,
          timestamp: note.time * 1000,
          velocity: note.velocity,
        });
      }

      if (importedNotes.length >= MAX_NOTES) {
        break;
      }
    }

    if (importedNotes.length === 0) {
      throw new Error('No playable notes were found in this MIDI file.');
    }

    /*
     * Multiple MIDI tracks can contain notes.
     * Sort everything chronologically so the melody
     * is interpreted in the same way as live recording.
     */
    importedNotes.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    const limitedNotes = importedNotes.slice(
      0,
      MAX_NOTES
    );

    /*
     * Make the first note timestamp zero.
     */
    const firstTimestamp = limitedNotes[0].timestamp;

    const normalizedNotes = limitedNotes.map((note) => ({
      ...note,
      timestamp: note.timestamp - firstTimestamp,
    }));

    notesRef.current = normalizedNotes;
    startTimeRef.current = null;

    setNotes(normalizedNotes);
    setKeyName('');

    setStatus(
      `Imported ${normalizedNotes.length} note${
        normalizedNotes.length === 1 ? '' : 's'
      } from ${file.name}.`
    );
  } catch (err) {
    console.error('MIDI import failed:', err);

    setNotes([]);
    notesRef.current = [];

    setError(
      err.message || 'Could not read the MIDI file.'
    );

    setStatus('MIDI import failed.');
  }

  /*
   * Allows selecting the same file again later.
   */
  event.target.value = '';
  };
  const startRecording = () => {
    if (!selectedInputId) {
      setError('Select a MIDI input first.');
      return;
    }

    const input = midiAccess?.inputs.get(selectedInputId);

    if (!input) {
      setError('The selected MIDI device is no longer available.');
      return;
    }

    inputRef.current = input;

    notesRef.current = [];
    startTimeRef.current = performance.now();

    setNotes([]);
    setError('');
    setRecording(true);

    input.onmidimessage = handleMidiMessage;

    setStatus(
      `Recording... play your melody (${MAX_NOTES} notes maximum).`
    );
  };

  const stopRecording = () => {
    setRecording(false);

    if (inputRef.current) {
      inputRef.current.onmidimessage = null;
    }

    inputRef.current = null;

    if (notesRef.current.length === 0) {
      setStatus('No notes recorded.');
      return;
    }

    setStatus(
      `Recorded ${notesRef.current.length} note${
        notesRef.current.length === 1 ? '' : 's'
      }.`
    );
  };

  const clearRecording = () => {
    stopRecording();

    notesRef.current = [];
    startTimeRef.current = null;

    setNotes([]);
    setKeyName('');
    setError('');
    setStatus('Recording cleared. Ready for another melody.');
  };

  const saveKey = async () => {
    if (notes.length === 0) {
      setError('Record a melody before creating a key.');
      return;
    }

    const trimmedName = keyName.trim();

    if (!trimmedName) {
      setError('Give this key a name first.');
      return;
    }

    try {
      setError('');

      const signature = buildSignature(notes);
      const keyHash = bufferToHex(await deriveMelodyHash(signature));

      const newKey = {
        id: crypto.randomUUID(),
        name: trimmedName,
        noteCount: notes.length,
        createdAt: new Date().toISOString(),

        // Stored so the same melody can reproduce the same key.
        signature,

        // This is the SHA-256 derived key.
        keyHash,
      };

      const updatedKeys = [
        ...savedKeys,
        newKey,
      ];

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedKeys)
      );

      setSavedKeys(updatedKeys);
      setKeyName('');

      setStatus(
        `"${trimmedName}" has been created and saved on this device.`
      );
    } catch (err) {
      console.error('Key creation failed:', err);

      setError('Could not create the key.');
    }
  };

  const deleteKey = (id) => {
    const updatedKeys = savedKeys.filter(
      (key) => key.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedKeys)
    );

    setSavedKeys(updatedKeys);
  };

  return (
    <section className="space-y-6">
      {/* Recorder */}
      <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-[#FFD600] shadow-[3px_3px_0_#0F172A]">
            <Music2 size={22} strokeWidth={3} />
          </span>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">
              Step 02
            </p>

            <h2 className="mt-1 text-2xl font-black uppercase italic">
              Record Melody
            </h2>

            <p className="mt-2 text-sm font-bold leading-6 text-black/65">
              Play a short melody on your MIDI keyboard.
              The first {MAX_NOTES} notes will be used to
              create your vault key.
            </p>
          </div>
        </div>

        {/* MIDI device */}
        <div className="mt-6 rounded-xl border-[3px] border-black bg-[#FDFBF7] p-5">
          <label className="text-xs font-black uppercase tracking-[0.12em]">
            MIDI Input
          </label>

          <select
            value={selectedInputId}
            onChange={(event) =>
              setSelectedInputId(event.target.value)
            }
            disabled={recording}
            className="mt-2 h-12 w-full rounded-xl border-[3px] border-black bg-white px-3 text-sm font-black outline-none"
          >
            {inputs.length === 0 ? (
              <option value="">
                No MIDI devices detected
              </option>
            ) : (
              inputs.map((input) => (
                <option key={input.id} value={input.id}>
                  {input.name || 'Unnamed MIDI device'}
                </option>
              ))
            )}
          </select>

          <div className="mt-4 flex flex-wrap gap-3">
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={!selectedInputId}
                className="inline-flex h-12 items-center gap-2 rounded-xl border-[3px] border-black bg-[#00E676] px-5 text-sm font-black uppercase italic shadow-[4px_4px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={18} strokeWidth={3} />
                Record
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex h-12 items-center gap-2 rounded-xl border-[3px] border-black bg-red-400 px-5 text-sm font-black uppercase italic shadow-[4px_4px_0_#0F172A]"
              >
                <CircleStop size={18} strokeWidth={3} />
                Stop
              </button>
            )}

            <button
              type="button"
              onClick={clearRecording}
              disabled={recording || notes.length === 0}
              className="inline-flex h-12 items-center gap-2 rounded-xl border-[3px] border-black bg-white px-5 text-sm font-black uppercase italic shadow-[4px_4px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={18} strokeWidth={3} />
              Clear
            </button>
          </div>

          <p className="mt-4 text-sm font-black">
            {status}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border-[3px] border-black bg-red-400 p-4 text-sm font-black">
              {error}
            </div>
          )}
        </div>
          <div className="mt-5 border-t-[3px] border-black pt-5">
  <div className="flex items-center gap-2">
    <FileMusic size={18} strokeWidth={3} />

    <p className="text-xs font-black uppercase tracking-[0.12em]">
      Or Import MIDI
    </p>
  </div>

  <p className="mt-2 text-sm font-bold text-black/60">
    Already have a MIDI recording? Upload the .mid file
    and use its melody to create a key.
  </p>

  <label
    htmlFor="midi-file"
    className="mt-4 inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border-[3px] border-black bg-[#1E6BFF] px-5 text-sm font-black uppercase italic text-white shadow-[4px_4px_0_#0F172A] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#0F172A]"
  >
    <Upload size={18} strokeWidth={3} />
    Choose .MID File
  </label>

  <input
    id="midi-file"
    type="file"
    accept=".mid,.midi,audio/midi,audio/x-midi"
    onChange={handleMidiFile}
    disabled={recording}
    className="hidden"
  />
</div>
        {/* Melody */}
        {notes.length > 0 && (
          <div className="mt-5 rounded-xl border-[3px] border-black bg-[#EAF1FF] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.12em]">
                Melody
              </p>

              <p className="text-xs font-black">
                {notes.length}/{MAX_NOTES}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {notes.map((note, index) => (
                <div
                  key={`${note.timestamp}-${index}`}
                  className="rounded-lg border-2 border-black bg-white px-3 py-2 text-center shadow-[2px_2px_0_#0F172A]"
                >
                  <p className="text-sm font-black">
                    {getNoteName(note.note)}
                  </p>

                  <p className="text-[10px] font-bold text-black/50">
                    {note.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create key */}
      {notes.length > 0 && !recording && (
        <div className="rounded-2xl border-4 border-black bg-[#FFD600] p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-black bg-white shadow-[3px_3px_0_#0F172A]">
              <KeyRound size={22} strokeWidth={3} />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Step 03
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase italic">
                Name Your Key
              </h2>

              <p className="mt-2 text-sm font-bold leading-6">
                This melody will be converted into a SHA-256
                key. Give it a name so you can select it later
                when encrypting a file.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={keyName}
              onChange={(event) =>
                setKeyName(event.target.value)
              }
              placeholder="e.g. My Main Melody"
              maxLength={50}
              className="h-12 min-w-0 flex-1 rounded-xl border-[3px] border-black bg-white px-4 text-sm font-black outline-none"
            />

            <button
              type="button"
              onClick={saveKey}
              disabled={!keyName.trim()}
              className="h-12 rounded-xl border-[3px] border-black bg-[#1E6BFF] px-6 text-sm font-black uppercase italic text-white shadow-[4px_4px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create Key
            </button>
          </div>
        </div>
      )}

      {/* Saved keys */}
      <div className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">
            Your Keys
          </p>

          <h2 className="mt-1 text-2xl font-black uppercase italic">
            Melody Keychain
          </h2>
        </div>

        {savedKeys.length === 0 ? (
          <div className="mt-5 rounded-xl border-[3px] border-dashed border-black p-6 text-center">
            <p className="text-sm font-black">
              No melody keys created yet.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {savedKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-4 rounded-xl border-[3px] border-black bg-[#FDFBF7] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-lg font-black">
                    {key.name}
                  </p>

                  <p className="mt-1 text-xs font-bold text-black/55">
                    {key.noteCount} notes · Created{' '}
                    {new Date(
                      key.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteKey(key.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-black bg-red-300 px-4 text-xs font-black uppercase shadow-[2px_2px_0_#0F172A]"
                >
                  <Trash2 size={15} strokeWidth={3} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MidiKeyRecorder;