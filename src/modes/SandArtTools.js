import { CONFIG } from '../config.js';
import { ART_COLORS, ART_TOOLS, touchesSupportedFinishLine } from './ModeLogic.js';

export class SandArtTools {
  constructor(grid, simulation) {
    this.grid = grid;
    this.simulation = simulation;
    this.fixed = new Uint8Array(grid.cells.length);
    this.simulation.fixedMask = this.fixed;
    this.color = ART_COLORS[0];
    this.tool = 'flow';
    this.radius = 2;
    this.undoStack = [];
    this.redoStack = [];
    this.active = false;
    this.stroking = false;
    this.last = null;
    this.changed = false;
    this.pourElapsed = 0;
  }

  reset() {
    this.fixed.fill(0);
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.active = true;
    this.stroking = false;
    this.last = null;
    this.changed = false;
    this.pourElapsed = 0;
  }

  stop() {
    this.active = false;
    this.stroking = false;
    this.last = null;
  }

  setTool(tool) {
    if (ART_TOOLS.includes(tool)) this.tool = tool;
  }

  setColor(color) {
    if (ART_COLORS.includes(Number(color))) this.color = Number(color);
  }

  setRadius(radius) {
    this.radius = Math.max(1, Math.min(5, Math.round(radius)));
  }

  snapshot() {
    return { cells: this.grid.cells.slice(), fixed: this.fixed.slice() };
  }

  beginStroke(x, y) {
    if (!this.active || this.tool === 'shape') return false;
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 20) this.undoStack.shift();
    this.redoStack.length = 0;
    this.stroking = true;
    this.pourElapsed = 0;
    this.changed = false;
    this.last = null;
    this.strokeTo(x, y);
    return true;
  }

  strokeTo(x, y) {
    if (!this.active || !this.stroking) return;
    const nx = Math.round(x), ny = Math.round(y);
    const last = this.last ?? { x: nx, y: ny };
    const steps = Math.min(150, Math.max(1, Math.ceil(Math.hypot(nx - last.x, ny - last.y))));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.paint(Math.round(last.x + (nx - last.x) * t),
        Math.round(last.y + (ny - last.y) * t));
    }
    this.last = { x: nx, y: ny };
  }

  update(deltaMs) {
    if (!this.active || !this.stroking || this.tool !== 'flow' || !this.last) return;
    this.pourElapsed += deltaMs;
    while (this.pourElapsed >= 45) {
      this.pourElapsed -= 45;
      this.paint(this.last.x, this.last.y);
    }
  }

  endStroke() {
    if (!this.stroking) return;
    this.stroking = false;
    this.last = null;
    if (!this.changed) this.undoStack.pop();
  }

  paint(x, y) {
    if (!this.active || this.tool === 'shape') return;
    // Keep the tools away from the preview/spawn strip. Only the grounded
    // sand, not a floating brush dab, can reach the finish condition.
    const radius = this.radius;
    y = Math.max(CONFIG.DEATH_LINE_Y + radius, Math.min(this.grid.height - 1 - radius, y));
    x = Math.max(radius, Math.min(this.grid.width - 1 - radius, x));
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy > radius * radius) continue;
        const px = x + dx; let py = y + dy;
        let i = this.grid.index(px, py);
        if (this.tool === 'flow') {
          // Pour into the first vacant cell above the local mound. A held
          // nozzle keeps supplying sand instead of painting only once.
          while (py > 0 && this.grid.cells[i]) {
            py--;
            i = this.grid.index(px, py);
          }
        }
        if (this.tool === 'erase') {
          if (!this.grid.cells[i]) continue;
          this.fixed[i] = 0;
          this.grid.set(px, py, 0);
        } else {
          if (this.grid.cells[i]) continue;
          this.grid.set(px, py, this.color);
          this.fixed[i] = this.tool === 'fixed' ? 1 : 0;
        }
        this.changed = true;
      }
    }
    if (this.changed) this.simulation.activateRect(x - radius - 3, 0,
      x + radius + 3, this.grid.height - 1);
  }

  restore(snapshot) {
    this.grid.cells.set(snapshot.cells);
    this.fixed.set(snapshot.fixed);
    this.grid.revision++;
    this.simulation.reset();
    this.stroking = false;
    this.last = null;
  }

  undo() {
    if (!this.active || !this.undoStack.length) return false;
    this.redoStack.push(this.snapshot());
    this.restore(this.undoStack.pop());
    return true;
  }

  redo() {
    if (!this.active || !this.redoStack.length) return false;
    this.undoStack.push(this.snapshot());
    this.restore(this.redoStack.pop());
    return true;
  }

  clear() {
    if (!this.active) return;
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 20) this.undoStack.shift();
    this.redoStack.length = 0;
    this.grid.clear();
    this.fixed.fill(0);
    this.simulation.reset();
  }

  isComplete() {
    return this.active && touchesSupportedFinishLine(this.grid);
  }
}
