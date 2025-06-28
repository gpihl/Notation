import assert from 'node:assert/strict';
import {StateManager, Tools} from '../src/model/state-manager.js';
import {Durations} from '../src/constants.js';

const sm = new StateManager();
let events = 0;
sm.onChange(() => events++);

sm.setTool(Tools.NOTE);
assert.equal(sm.currentTool, Tools.NOTE);

sm.beginSymbolCreation({id: 'n1', midi: 60, duration: Durations.QUARTER, index: 0});
assert.equal(sm.activeSymbolId, 'n1');
assert.equal(sm.score.measures[0].symbols.length, 1);

sm.updateActiveSymbol(0, 2);
assert.equal(sm.score.measures[0].symbols[0].midi, 62);

sm.commitActiveSymbol();
assert.equal(sm.activeSymbolId, null);

sm.deleteSymbol('n1');
assert.equal(sm.score.measures[0].symbols.length, 0);

assert.ok(events >= 5);
console.log('state-manager tests passed');
