Below is the implementation‑planning document that your autonomous code‑writing agents should check into the repository as SPECIFICATION.md.
It contains (A) a concise product overview, (B) the technical stack decisions, (C) a file‑and‑class level breakdown, and (D) a task board whose tickets can be assigned independently.

A. Product overview (v 1)
Item	Scope
Platform	Mobile‑first web app (portrait iPhone ≈ 390 × 844 CSS px) that also works, unmodified, on desktop browsers.
Purpose	Let the user jot down single‑voice melodies in a single key and single time signature (user‑selectable at score creation).
Core interaction	A floating “tool dial” opens a sheet‑music icon palette (notes / rests in common durations, dotted toggle, hand‑selector, eraser).
 • With a note/rest tool active: touch‑and‑drag creates the symbol, changes its pitch chromatically (vertical motion) and its sequential position (horizontal motion), updating the score in real time.
 • With the hand tool: drag an existing symbol to edit it, or drag on blank space to pan the score horizontally.
 • The symbol under edit is highlighted yellow.
Rendering rules	The music is redrawn on every model change; bar‑lines are auto‑inserted to match time signature. Pitch changes automatically add/remove accidentals relative to the score’s key.
Out of scope (v1)	Audio playback, persistence, ornaments, multi‑selection, undo/redo, zooming, multi‑finger gestures.

B. Technical decisions
Area	Decision	Rationale
Notation rendering	VexFlow 4 (MIT) loaded from CDN.	Mature, mobile‑friendly, SMuFL‑compliant; avoids weeks of manual SVG work.
Glyph font	Bravura (OFL, bundled with VexFlow).	Complete SMuFL coverage; no Font Awesome gaps.
General icons	Font Awesome Free (hand, trash, menu, etc.).	Familiar look, permissive license.
Language	Plain ES Modules (no TypeScript, no bundler).	Aligns with instruction to stay “plain and simple”.
Styling	One vanilla styles.css; mobile‑first; CSS variables for colours.
Minimum browsers	iOS Safari 16+, Chrome/Edge/Firefox last 2 versions.
Testing	Manual smoke tests only in v1 (agents provide test-instructions.md).

C. Code‑base layout (top‑level files)
pgsql
Copy
/public
  index.html
  styles.css
  libs/
    vexflow.min.js       (CDN copy, for offline demos)
    fontawesome.min.css  (CSS only)
  icons/…                (FA webfonts)

 /src
  main.js                ← bootstrap & high‑level wiring
  constants.js           ← enums & magic numbers
  model/
    score.js             ← Score, Measure, Note, Rest classes
    state-manager.js     ← holds current score + current tool
  renderer/
    renderer.js          ← VexFlow wrapper
  ui/
    toolbar.js           ← floating palette component
    gesture-handler.js   ← low‑level pointer/touch translation
    viewport.js          ← scroll/pan container
  util/
    geometry.js          ← helpers for hit‑testing & snapping
1. model/score.js
js
Copy
export class Note {
  constructor({id, midi, duration, dotted=false}) { … }
  get vfDuration() { … }     // e.g. '8', 'q', 'hd'
}

export class Rest { … }

export class Measure {
  beats;                  // e.g. 4 for 4/4
  beatValue;              // e.g. 4
  symbols = [];           // Note | Rest in order
  get remainingBeats() { … }
}

export class Score {
  constructor({key='C', timeSig=[4,4]}) { … }
  measures = [new Measure()];
  /** Insert symbol at globalIndex (0 = first symbol in score). */
  insertSymbol(symbol, globalIndex) { … }
  /** Remove symbol by id. */
  deleteSymbol(id) { … }
}
2. model/state-manager.js
js
Copy
import {Score} from './score.js';
export const Tools = Object.freeze({ NOTE:'note', REST:'rest', HAND:'hand', ERASE:'erase' });

export class StateManager {
  score = new Score({});
  currentTool = Tools.HAND;
  activeSymbolId = null;        // id being edited
  listeners = new Set();

  /** Subscribe to state changes. */
  onChange(cb) { this.listeners.add(cb); }
  /** Mutation helpers used by gesture‑handler. */
  beginSymbolCreation(opts) { … }
  updateActiveSymbol(deltaX, deltaY) { … }
  commitActiveSymbol() { … }
  moveExistingSymbol(id, deltaX, deltaY) { … }
  deleteSymbol(id) { … }
  setTool(newTool) { … }
}
3. renderer/renderer.js
js
Copy
import {StateManager} from '../model/state-manager.js';
export class Renderer {
  constructor(canvasEl, stateMgr) { … }
  /** Call whenever state changes. **/
  redraw() { … }
  /** Convert model pitch (MIDI int) to VexFlow key string. */
  midiToVfKey(midi) { return 'c/4'; }
}
Highlights the stateMgr.activeSymbolId in yellow by applying a custom VexFlow modifier style.

4. ui/toolbar.js
Renders a FAB (“floating action button”) that toggles an arc‑shaped palette.
Exposes onToolSelected(cb) for other modules.

5. ui/gesture-handler.js
Attaches pointerdown/move/up on the score viewport.
Decides whether the event means create, drag‑edit, or pan based on stateMgr.currentTool and hit‑testing helpers from util/geometry.js.

6. ui/viewport.js
A div with overflow:hidden (no scrollbars). Horizontal panning implemented by translating the inner <canvas> X position.

D. Task board (create as GitHub Issues)
#	Title	Description / Acceptance criteria	Depends on
T01	Repo skeleton	Commit /public and /src folders, add CDN links in index.html, empty JS/CSS files, and this SPECIFICATION.md.	—
T02	Constants module	Implement constants.js (durations enum, MIDI note names, colour variables). Unit‑tested via Node (simple assert).	T01
T03	Domain model	Implement classes in model/score.js with insert/delete logic and beat overflow checks; 90 % branch coverage in node test.	T01, T02
T04	State manager	Implement state-manager.js; add event emitter pattern; include a minimal demo script that logs mutations.	T03
T05	Geometry utils	Functions pointToPitch(y), pointToInsertIndex(x), snapPitch(pitch,key); tested with hard‑coded cases.	T02
T06	Renderer wrapper	Implement renderer.js; render first empty staff; redraw on every state change; highlight active symbol.	T03, T04
T07	Toolbar UI	Build floating action button + palette (ui/toolbar.js, CSS). Emits toolSelected events. Uses Font Awesome icons.	T01
T08	Gesture handler	Implement drag logic per tool; interact with stateMgr; update activeSymbolId; throttle redraw ≤ 60 fps.	T04, T05
T09	Viewport & panning	Implement ui/viewport.js; pan by modifying canvas translateX; gesture‑handler sends pan events.	T08
T10	Main bootstrap	Wire toolbar↔state manager↔renderer↔gesture handler; initialise score based on modal dialog (key/time).	T06, T07, T08, T09
T11	Styling polish	Final CSS for mobile layout; ensure “thumb‑friendly” controls (≥ 44 px).	T10
T12	Manual test plan	Document use‑cases in test-instructions.md; include GIFs or steps; must pass on iOS Safari 16 and Chrome Desktop.	T10

Agents should work strictly inside their tickets, respecting public APIs of completed tasks.
Where two tasks may run in parallel (e.g. T06 and T07), they must stub/mock the dependent modules until merged.

End of specification