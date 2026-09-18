export class SandStats {
  constructor(simulation) {
    this.simulation = simulation;
    this.fps = 0;
    this.lastTime = performance.now();
    this.frames = 0;
  }

  update() {
    this.frames++;
    const now = performance.now();

    if (now - this.lastTime >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastTime = now;
      console.log(`FPS:${this.fps} moved:${this.simulation.movedCount}`);
    }
  }
}
