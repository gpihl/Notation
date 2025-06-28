export class Note {
  constructor({id, midi, duration, dotted = false}) {
    this.id = id;
    this.midi = midi;
    this.duration = duration;
    this.dotted = dotted;
  }

  get vfDuration() {
    const base = {
      1: 'w',
      2: 'h',
      4: 'q',
      8: '8',
      16: '16'
    }[this.duration] || 'q';
    return base + (this.dotted ? 'd' : '');
  }
}

export class Rest {
  constructor({id, duration, dotted = false}) {
    this.id = id;
    this.duration = duration;
    this.dotted = dotted;
  }

  get vfDuration() {
    const base = {
      1: 'w',
      2: 'h',
      4: 'q',
      8: '8',
      16: '16'
    }[this.duration] || 'q';
    return base + (this.dotted ? 'd' : '') + 'r';
  }
}

function beatsFor(symbol, beatValue) {
  const base = beatValue / symbol.duration;
  return base * (symbol.dotted ? 1.5 : 1);
}

export class Measure {
  constructor(beats = 4, beatValue = 4) {
    this.beats = beats;
    this.beatValue = beatValue;
    this.symbols = [];
  }

  get remainingBeats() {
    const used = this.symbols.reduce(
      (sum, s) => sum + beatsFor(s, this.beatValue),
      0
    );
    return this.beats - used;
  }
}

export class Score {
  constructor({ key = 'C', timeSig = [4, 4] } = {}) {
    this.key = key;
    this.timeSig = timeSig;
    this.measures = [new Measure(timeSig[0], timeSig[1])];
  }

  insertSymbol(symbol, globalIndex) {
    let idx = globalIndex;
    for (let m = 0; m < this.measures.length; m++) {
      const measure = this.measures[m];
      if (idx <= measure.symbols.length) {
        const beats = beatsFor(symbol, measure.beatValue);
        if (beats > measure.remainingBeats) {
          if (idx < measure.symbols.length) {
            throw new Error('Not enough beats in measure');
          }
          while (beats > this.measures[this.measures.length - 1].remainingBeats) {
            this.measures.push(new Measure(this.timeSig[0], this.timeSig[1]));
          }
          this.measures[this.measures.length - 1].symbols.push(symbol);
        } else {
          measure.symbols.splice(idx, 0, symbol);
        }
        return;
      }
      idx -= measure.symbols.length;
    }
    // append at end
    const last = this.measures[this.measures.length - 1];
    const beats = beatsFor(symbol, last.beatValue);
    if (beats > last.remainingBeats) {
      while (beats > this.measures[this.measures.length - 1].remainingBeats) {
        this.measures.push(new Measure(this.timeSig[0], this.timeSig[1]));
      }
      this.measures[this.measures.length - 1].symbols.push(symbol);
    } else {
      last.symbols.push(symbol);
    }
  }

  deleteSymbol(id) {
    for (let i = 0; i < this.measures.length; i++) {
      const measure = this.measures[i];
      const idx = measure.symbols.findIndex(s => s.id === id);
      if (idx !== -1) {
        measure.symbols.splice(idx, 1);
        while (
          this.measures.length > 1 &&
          this.measures[this.measures.length - 1].symbols.length === 0
        ) {
          this.measures.pop();
        }
        return true;
      }
    }
    return false;
  }
}
