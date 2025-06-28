import {Tools} from '../model/state-manager.js';

export class Toolbar {
  constructor(parent = document.body) {
    this.root = document.createElement('div');
    this.root.className = 'toolbar';
    parent.appendChild(this.root);

    this.fab = document.createElement('button');
    this.fab.className = 'toolbar-fab fa fa-bars';
    this.root.appendChild(this.fab);

    this.palette = document.createElement('div');
    this.palette.className = 'toolbar-palette';
    this.root.appendChild(this.palette);

    this.listeners = new Set();
    this.fab.addEventListener('click', () => this.toggle());

    this.addToolButton(Tools.HAND, 'fa-hand-pointer');
    this.addToolButton(Tools.NOTE, 'fa-music');
    this.addToolButton(Tools.REST, 'fa-minus');
    this.addToolButton(Tools.ERASE, 'fa-trash');
  }

  addToolButton(tool, iconClass) {
    const btn = document.createElement('button');
    btn.className = `tool-btn fa ${iconClass}`;
    btn.addEventListener('click', () => {
      this.emit(tool);
      this.close();
    });
    this.palette.appendChild(btn);
  }

  onToolSelected(cb) {
    this.listeners.add(cb);
  }

  emit(tool) {
    for (const cb of this.listeners) {
      cb(tool);
    }
  }

  toggle() {
    this.root.classList.toggle('open');
  }

  close() {
    this.root.classList.remove('open');
  }
}
