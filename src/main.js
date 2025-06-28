import {StateManager} from './model/state-manager.js';
import {Score} from './model/score.js';
import {Toolbar} from './ui/toolbar.js';
import {Viewport} from './ui/viewport.js';
import {Renderer} from './renderer/renderer.js';
import {GestureHandler} from './ui/gesture-handler.js';

const app = document.getElementById('app');
const viewport = new Viewport(app);
const stateMgr = new StateManager();

// collect initial key and time signature
let key = prompt('Score key (e.g., C, G, F):', 'C') || 'C';
let time = prompt('Time signature (e.g., 4/4):', '4/4') || '4/4';
let [beats, beatValue] = time.split('/').map(n => parseInt(n, 10));
if (!beats || !beatValue) {
  beats = 4;
  beatValue = 4;
}
stateMgr.score = new Score({key, timeSig: [beats, beatValue]});

const renderer = new Renderer(viewport.canvas, stateMgr);

const toolbar = new Toolbar();
toolbar.onToolSelected(tool => stateMgr.setTool(tool));

new GestureHandler(viewport.canvas, stateMgr, {
  onPan: dx => viewport.panBy(dx)
});

renderer.redraw();
