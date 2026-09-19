export class FruitController {
  constructor(element, fruitManager, grid, { onRelease = null } = {}) {
    this.element = element;
    this.fruitManager = fruitManager;
    this.grid = grid;
    this.onRelease = onRelease;
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

      const released = this.fruitManager.releaseCurrent();

      if (released) {
        this.onRelease?.();
      }
    };

    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
  }

  updatePointer(event) {
    const rect = this.element.getBoundingClientRect();
    const normalizedX = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );
    const gridX = normalizedX * this.grid.width;
    this.fruitManager.setPointerX(gridX);
  }
}
