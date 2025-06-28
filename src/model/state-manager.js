import {Score, Note, Rest} from './score.js';

export const Tools = Object.freeze({
  NOTE: 'note',
  REST: 'rest',
  HAND: 'hand',
  ERASE: 'erase'
});

export class StateManager {
  score = new Score({});
  currentTool = Tools.HAND;
  activeSymbolId = null;
  listeners = new Set();

  onChange(cb) {
    this.listeners.add(cb);
  }

  emitChange() {
    for (const cb of this.listeners) {
      cb(this);
    }
  }

  beginSymbolCreation({id, midi, duration, dotted = false, index = 0}) {
    let symbol;
    if (this.currentTool === Tools.NOTE) {
      symbol = new Note({id, midi, duration, dotted});
    } else if (this.currentTool === Tools.REST) {
      symbol = new Rest({id, duration, dotted});
    } else {
      throw new Error('beginSymbolCreation requires NOTE or REST tool');
    }
    this.score.insertSymbol(symbol, index);
    this.activeSymbolId = id;
    this.emitChange();
  }

  findSymbolById(id) {
    let globalIndex = 0;
    for (const measure of this.score.measures) {
      const idx = measure.symbols.findIndex(s => s.id === id);
      if (idx !== -1) {
        return {symbol: measure.symbols[idx], index: globalIndex + idx};
      }
      globalIndex += measure.symbols.length;
    }
    return null;
  }

  updateActiveSymbol(deltaX = 0, deltaY = 0) {
    if (!this.activeSymbolId) return;
    const res = this.findSymbolById(this.activeSymbolId);
    if (!res) return;
    const {symbol, index} = res;
    if (symbol.midi !== undefined && deltaY) {
      symbol.midi += deltaY;
    }
    if (deltaX) {
      this.score.deleteSymbol(symbol.id);
      const newIndex = Math.max(0, index + deltaX);
      this.score.insertSymbol(symbol, newIndex);
    }
    this.emitChange();
  }

  commitActiveSymbol() {
    if (this.activeSymbolId !== null) {
      this.activeSymbolId = null;
      this.emitChange();
    }
  }

  moveExistingSymbol(id, deltaX = 0, deltaY = 0) {
    this.activeSymbolId = id;
    this.updateActiveSymbol(deltaX, deltaY);
    this.commitActiveSymbol();
  }

  deleteSymbol(id) {
    const removed = this.score.deleteSymbol(id);
    if (removed) {
      if (this.activeSymbolId === id) {
        this.activeSymbolId = null;
      }
      this.emitChange();
    }
    return removed;
  }

  setTool(newTool) {
    if (this.currentTool !== newTool) {
      this.currentTool = newTool;
      this.emitChange();
    }
  }
}
