export class Viewport {
  constructor(parent = document.body, width = 2000, height = 200) {
    this.parent = parent;
    this.root = document.createElement('div');
    this.root.className = 'viewport';
    this.root.style.overflow = 'hidden';
    this.root.style.touchAction = 'none';
    parent.appendChild(this.root);

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.transform = 'translateX(0px)';
    this.root.appendChild(this.canvas);

    this.offsetX = 0;
  }

  setOffset(x) {
    this.offsetX = x;
    this.canvas.style.transform = `translateX(${x}px)`;
  }

  panBy(dx) {
    this.setOffset(this.offsetX + dx);
  }
}
