import {Tools} from '../model/state-manager.js';
import {Durations} from '../constants.js';
import {pointToPitch, pointToInsertIndex, snapPitch} from '../util/geometry.js';

/**
 * Basic gesture handler attaching pointer listeners to a canvas element.
 * It translates pointer movements into state-manager mutations. Rendering is
 * indirectly triggered via state change events. Calls to the state manager are
 * throttled using requestAnimationFrame to keep redraws below 60fps.
 */
export class GestureHandler {
  /**
   * @param {HTMLElement} target canvas element or container
   * @param {StateManager} stateMgr application state manager
   * @param {{onPan?: function(number):void}} [opts]
   */
  constructor(target, stateMgr, opts = {}) {
    this.target = target;
    this.stateMgr = stateMgr;
    this.onPan = opts.onPan || (() => {});

    this._bindMethods();
    this.reset();

    target.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  _bindMethods() {
    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this._flush = this._flush.bind(this);
  }

  reset() {
    this.mode = null; // 'create' | 'edit' | 'pan'
    this.startX = 0;
    this.startY = 0;
    this.lastIndex = 0;
    this.lastPitch = 0;
    this.editId = null;
    this._dx = 0;
    this._dy = 0;
    this._raf = null;
  }

  destroy() {
    this.target.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
  }

  onDown(e) {
    const x = e.offsetX ?? e.clientX;
    const y = e.offsetY ?? e.clientY;
    this.startX = x;
    this.startY = y;
    this.lastIndex = pointToInsertIndex(x);
    this.lastPitch = pointToPitch(y);

    const tool = this.stateMgr.currentTool;
    if (tool === Tools.NOTE || tool === Tools.REST) {
      this.mode = 'create';
      const id = 's' + Date.now().toString(36);
      const index = this.lastIndex;
      if (tool === Tools.NOTE) {
        const pitch = snapPitch(this.lastPitch, this.stateMgr.score.key);
        this.stateMgr.beginSymbolCreation({
          id,
          midi: pitch,
          duration: Durations.QUARTER,
          index
        });
      } else {
        this.stateMgr.beginSymbolCreation({
          id,
          duration: Durations.QUARTER,
          index
        });
      }
      this.editId = id;
    } else if (tool === Tools.HAND) {
      const sym = this._symbolAtIndex(this.lastIndex);
      if (sym) {
        this.mode = 'edit';
        this.editId = sym.id;
        this.stateMgr.activeSymbolId = sym.id;
      } else {
        this.mode = 'pan';
      }
    } else if (tool === Tools.ERASE) {
      const sym = this._symbolAtIndex(this.lastIndex);
      if (sym) this.stateMgr.deleteSymbol(sym.id);
    }
  }

  onMove(e) {
    if (!this.mode) return;
    const x = e.offsetX ?? e.clientX;
    const y = e.offsetY ?? e.clientY;

    if (this.mode === 'pan') {
      const dx = x - this.startX;
      this.startX = x;
      if (dx) this.onPan(dx);
      return;
    }

    const index = pointToInsertIndex(x);
    const pitch = pointToPitch(y);

    this._dx += index - this.lastIndex;
    this._dy += pitch - this.lastPitch;
    this.lastIndex = index;
    this.lastPitch = pitch;

    if (!this._raf) {
      this._raf = requestAnimationFrame(this._flush);
    }
  }

  onUp() {
    if (this.mode === 'create' || this.mode === 'edit') {
      this._flush();
      this.stateMgr.commitActiveSymbol();
    }
    this.reset();
  }

  _flush() {
    this._raf = null;
    if (!this._dx && !this._dy) return;
    this.stateMgr.updateActiveSymbol(this._dx, this._dy);
    this._dx = 0;
    this._dy = 0;
  }

  _symbolAtIndex(idx) {
    let i = idx;
    for (const m of this.stateMgr.score.measures) {
      if (i < m.symbols.length) return m.symbols[i];
      i -= m.symbols.length;
    }
    return null;
  }
}

