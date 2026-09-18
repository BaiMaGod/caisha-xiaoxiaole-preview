export class FruitController {
  constructor(element, fruitManager, grid) {
    this.element = element;
    this.fruitManager = fruitManager;
    this.grid = grid;
    this.dragging = false;

    element.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      element.setPointerCapture?.(event.pointerId);
      this.updatePointer(event);
    });

    element.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      this.updatePointer(event);
    });

    const release = (event) => {
      if (!this.dragging) return;
      this.updatePointer(event);
      this.dragging = false;
      this.fruitManager.releaseCurrent();
    };

    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
  }

  updatePointer(event) {
    const rect = this.element.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width;
    const gridX = normalizedX * this.grid.width;
    this.fruitManager.setPointerX(gridX);
  }
}
