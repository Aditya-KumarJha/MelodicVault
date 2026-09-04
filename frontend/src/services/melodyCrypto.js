
const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const MAX_NOTES = 20;
export const QUANTIZATION_MS = 250;

export const getNoteName = (midiNote) => {
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[midiNote % 12]}${octave}`;
};

/*
 * Python's round() uses "banker's rounding".
 * We keep the same behaviour as the original recorder.
 */
const pythonRound = (value) => {
  const floor = Math.floor(value);
  const fraction = value - floor;

  if (fraction > 0.5) {
    return floor + 1;
  }

  if (fraction < 0.5) {
    return floor;
  }

  return floor % 2 === 0 ? floor : floor + 1;
};

const quantizeInterval = (milliseconds) => {
  const units = pythonRound(
    milliseconds / QUANTIZATION_MS
  );

  return units * QUANTIZATION_MS;
};

export const buildSignature = (notes) => {
  const noteNumbers = notes.map(
    (note) => note.note
  );

  const intervals = notes.slice(1).map(
    (note, index) => {
      const difference =
        note.timestamp -
        notes[index].timestamp;

      return quantizeInterval(difference);
    }
  );

  return `Notes:[${noteNumbers.join(', ')}]|Intervals:[${intervals.join(', ')}]`;
};

export const bufferToHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) =>
      byte.toString(16).padStart(2, '0')
    )
    .join('');
};

export const deriveMelodyHash = async (signature) => {
  const data = new TextEncoder().encode(signature);

  return crypto.subtle.digest(
    'SHA-256',
    data
  );
};

export const deriveMelodyKey = async (signature) => {
  const hash = await deriveMelodyHash(signature);

  return crypto.subtle.importKey(
    'raw',
    hash,
    {
      name: 'AES-GCM',
    },
    false,
    ['wrapKey', 'unwrapKey']
  );
};

export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);

  let binary = '';

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk = bytes.subarray(
      i,
      Math.min(i + chunkSize, bytes.length)
    );

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

export const base64ToUint8Array = (base64) => {
  const binary = atob(base64);

  const bytes = new Uint8Array(
    binary.length
  );

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

export const normalizeNotes = (notes) => {
  if (!notes.length) {
    return [];
  }

  const sorted = [...notes].sort(
    (a, b) =>
      a.timestamp - b.timestamp
  );

  const firstTimestamp =
    sorted[0].timestamp;

  return sorted
    .slice(0, MAX_NOTES)
    .map((note) => ({
      note: note.note,
      timestamp:
        note.timestamp -
        firstTimestamp,
    }));
};