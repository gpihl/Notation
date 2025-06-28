import assert from 'node:assert/strict';
import {Score, Measure, Note, Rest} from '../src/model/score.js';
import {Durations} from '../src/constants.js';

// constructor defaults
const s = new Score({});
assert.equal(s.key, 'C');
assert.deepEqual(s.timeSig, [4, 4]);
assert.equal(s.measures.length, 1);
assert.equal(s.measures[0].beats, 4);
assert.equal(s.measures[0].beatValue, 4);

// insert within first measure
const n1 = new Note({id: 'n1', midi: 60, duration: Durations.QUARTER});
s.insertSymbol(n1, 0);
assert.equal(s.measures[0].symbols.length, 1);
assert.equal(s.measures[0].remainingBeats, 3);
assert.equal(n1.vfDuration, 'q');

// fill measure then overflow -> new measure
const n2 = new Note({id: 'n2', midi: 62, duration: Durations.HALF});
s.insertSymbol(n2, 1);
assert.equal(s.measures[0].remainingBeats, 1);
const n3 = new Note({id: 'n3', midi: 64, duration: Durations.HALF});
s.insertSymbol(n3, 2);
assert.equal(s.measures.length, 2);
assert.equal(s.measures[1].symbols[0], n3);

// insertion with insufficient space inside measure should throw
const n4 = new Note({id: 'n4', midi: 65, duration: Durations.HALF});
assert.throws(() => s.insertSymbol(n4, 1), /Not enough beats/);

// rest with dot
const r1 = new Rest({id: 'r1', duration: Durations.QUARTER, dotted: true});
s.insertSymbol(r1, 3); // at end of last measure
assert.equal(r1.vfDuration, 'qdr');

// delete
assert.ok(s.deleteSymbol('n1'));
assert.equal(s.measures[0].symbols[0], n2);
assert.ok(s.deleteSymbol('n2'));
assert.ok(s.deleteSymbol('n3')); // removing last measure's symbol
assert.equal(s.measures.length, 2);
assert.ok(s.deleteSymbol("r1"));
assert.equal(s.measures.length, 1);
assert.ok(!s.deleteSymbol('unknown'));

console.log('score tests passed');
