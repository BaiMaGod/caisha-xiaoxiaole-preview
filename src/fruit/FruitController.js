export class FruitController {
  constructor(element, fruitManager, grid, { onRelease = null } = {}) {
    this.element = element;
    this.fruitManager = fruitManager;
    this.grid = grid;
    this.onRelease = onRelease;
    this.dragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.fastDropActive = false;

    element.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.fastDropActive = false;

      element.setPointerCapture?.(event.pointerId);
      this.updatePointer(event);
    });

    element.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;

      this.updatePointer(event);
      this.updateFastDropGesture(event);
    });

    const release = (event) => {
      if (!this.dragging) return;

      this.updatePointer(event);
      this.dragging = false;

      if (this.fastDropActive) {
        this.fruitManager.stopFastDrop();
        this.fastDropActive = false;
      }

      const released = this.fruitManager.releaseCurrent();

      if (released) {
        this.onRelease?.();
      }
    };

    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
  }

  updateFastDropGesture(event) {
    if (this.fastDropActive) return;

    const rect = this.element.getBoundingClientRect();
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;

    // Scale the threshold slightly with screen height while keeping the
    // gesture easy to trigger on typical phones.
    const threshold = Math.max(
      18,
      Math.min(32, rect.height * 0.035)
    );

    // Require a clearly downward gesture so horizontal positioning does not
    // accidentally trigger fast drop.
    if (dy < threshold || dy < Math.abs(dx) * 0.6) {
      return;
    }

    const result = this.fruitManager.startFastDrop();

    if (!result.active) return;

    this.fastDropActive = true;

    // A downward swipe can commit a controlled fruit into FALLING before the
    // finger is lifted. Count it as the same successful drop for the tutorial.
    if (result.released) {
      this.onRelease?.();
    }
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
