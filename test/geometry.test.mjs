import assert from 'node:assert/strict';
import {pointToPitch, pointToInsertIndex, snapPitch} from '../src/util/geometry.js';

// pointToPitch
assert.equal(pointToPitch(0), 84);
assert.equal(pointToPitch(10), 83);
assert.equal(pointToPitch(15), 82);

// pointToInsertIndex
assert.equal(pointToInsertIndex(0), 0);
assert.equal(pointToInsertIndex(39), 0);
assert.equal(pointToInsertIndex(40), 1);
assert.equal(pointToInsertIndex(81), 2);

// snapPitch
assert.equal(snapPitch(61, 'C'), 62); // C# -> D in C major
assert.equal(snapPitch(60, 'G'), 60); // already in scale
assert.equal(snapPitch(66, 'F'), 67); // F# -> G in F major

console.log('geometry tests passed');
