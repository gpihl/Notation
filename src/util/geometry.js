// geometry utilities
import {MIDI_NOTE_NAMES} from '../constants.js';

const PITCH_BASE = 84; // MIDI note for top reference (C6)
const PITCH_STEP_PX = 10; // pixels per semitone
const TIME_STEP_PX = 40; // pixels per score index step

export function pointToPitch(y) {
  return PITCH_BASE - Math.round(y / PITCH_STEP_PX);
}

export function pointToInsertIndex(x) {
  return Math.max(0, Math.floor(x / TIME_STEP_PX));
}

export function snapPitch(pitch, key = 'C') {
  const root = MIDI_NOTE_NAMES.indexOf(key);
  if (root === -1) return pitch;
  const scale = [0, 2, 4, 5, 7, 9, 11].map(n => (n + root) % 12);
  let best = pitch;
  let bestDiff = Infinity;
  for (const pc of scale) {
    const base = pitch - (pitch % 12) + pc;
    for (const candidate of [base - 12, base, base + 12]) {
      const diff = Math.abs(candidate - pitch);
      if (diff < bestDiff || (diff === bestDiff && candidate > best)) {
        bestDiff = diff;
        best = candidate;
      }
    }
  }
  return best;
}
