import assert from 'node:assert/strict';
import {Durations, MIDI_NOTE_NAMES, COLORS} from '../src/constants.js';

assert.ok(Object.isFrozen(Durations));
assert.ok(Object.isFrozen(MIDI_NOTE_NAMES));
assert.ok(Object.isFrozen(COLORS));

assert.equal(Durations.WHOLE, 1);
assert.equal(Durations.QUARTER, 4);
assert.equal(MIDI_NOTE_NAMES[0], 'C');
assert.equal(MIDI_NOTE_NAMES[11], 'B');
assert.equal(COLORS.HIGHLIGHT, '#FFD54F');

console.log('constants tests passed');
