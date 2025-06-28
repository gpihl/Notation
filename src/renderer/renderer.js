import {Note, Rest} from '../model/score.js';
import {MIDI_NOTE_NAMES, COLORS} from '../constants.js';

const VF = window.VexFlow || window.VF || (window.Vex && window.Vex.Flow);

export class Renderer {
  constructor(canvasEl, stateMgr) {
    this.canvasEl = canvasEl;
    this.stateMgr = stateMgr;
    this.renderer = new VF.Renderer(canvasEl, VF.Renderer.Backends.CANVAS);
    this.context = this.renderer.getContext();
    this.stateMgr.onChange(() => this.redraw());
    this.redraw();
  }

  redraw() {
    const { context, canvasEl } = this;
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);

    let x = 10;
    const y = 40;
    const width = 180;
    for (let i = 0; i < this.stateMgr.score.measures.length; i++) {
      const measure = this.stateMgr.score.measures[i];
      const stave = new VF.Stave(x, y, width);
      if (i === 0) {
        stave.addClef('treble');
        const [beats, beatValue] = this.stateMgr.score.timeSig;
        stave.addTimeSignature(`${beats}/${beatValue}`);
      }
      stave.setContext(context).draw();

      const voice = new VF.Voice({ num_beats: measure.beats, beat_value: measure.beatValue });
      // Allow rendering even if the measure's duration is not completely filled.
      // VexFlow voices are strict by default and will throw if the note durations
      // do not sum to the expected number of beats. For interactive editing we
      // want to show partial measures without errors.
      voice.setStrict(false);
      const notes = measure.symbols.map(sym => {
        if (sym instanceof Note) {
          return new VF.StaveNote({
            keys: [this.midiToVfKey(sym.midi)],
            duration: sym.vfDuration
          });
        } else if (sym instanceof Rest) {
          return new VF.StaveNote({
            keys: ['b/4'],
            duration: sym.vfDuration
          });
        }
      });

      const active = this.stateMgr.activeSymbolId;
      notes.forEach((n, idx) => {
        const sym = measure.symbols[idx];
        if (sym.id === active) {
          n.setStyle({ fillStyle: COLORS.HIGHLIGHT, strokeStyle: COLORS.HIGHLIGHT });
        }
      });

      if (notes.length > 0) {
        voice.addTickables(notes);
        new VF.Formatter().joinVoices([voice]).format([voice], width - 20);
        voice.draw(context, stave);
      }

      x += width;
    }
  }

  midiToVfKey(midi) {
    const note = MIDI_NOTE_NAMES[midi % 12].toLowerCase();
    const octave = Math.floor(midi / 12) - 1;
    return `${note}/${octave}`;
  }
}
