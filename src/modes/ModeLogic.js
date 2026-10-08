import { CONFIG } from '../config.js';

export const GAME_MODES = Object.freeze({
  ENDLESS: 'endless',
  ART: 'sandArt',
  LEVEL: 'level'
});

export const ART_COLORS = Object.freeze([1, 2, 3, 4, 5, 6, 7]);
export const ART_TOOLS = Object.freeze(['flow', 'fixed', 'shape', 'erase']);
export const MODE_SETTINGS = Object.freeze({
  endless: Object.freeze({ elimination: true, scoring: true, line: 'failure' }),
  sandArt: Object.freeze({ elimination: false, scoring: false, line: 'finish' }),
  level: Object.freeze({ elimination: true, scoring: true, line: 'failure' })
});

export function countSand(grid) {
  let count = 0;
  for (const value of grid.cells) if (value > 0) count++;
  return count;
}

// Only grains physically supported by the bottom-connected sand mass can
// finish the artwork. Passing the line while falling never completes a painting.
export function touchesSupportedFinishLine(grid, lineY = CONFIG.DEATH_LINE_Y) {
  const w = grid.width, h = grid.height;
  const limit = Math.max(0, Math.min(h - 1, Math.floor(lineY)));
  const sources = [];
  // Fast path: almost every art frame has no grain at the completion line.
  // Avoid flooding the entire bottom mound on those frames.
  for (let y = 0; y <= limit; y++) {
    for (let x = 0; x < w; x++) {
      const index = y * w + x;
      if (grid.cells[index]) sources.push(index);
    }
  }
  if (!sources.length) return false;
  const seen = new Uint8Array(grid.cells.length);
  const queue = new Int32Array(grid.cells.length);
  let head = 0, tail = 0;
  for (const index of sources) {
    seen[index] = 1;
    queue[tail++] = index;
  }
  while (head < tail) {
    const index = queue[head++], y = Math.floor(index / w), x = index % w;
    if (y === h - 1) return true;
    for (let yy = Math.max(0, y - 1); yy <= Math.min(h - 1, y + 1); yy++) {
      for (let xx = Math.max(0, x - 1); xx <= Math.min(w - 1, x + 1); xx++) {
        const next = yy * w + xx;
        if (!seen[next] && grid.cells[next]) {
          seen[next] = 1;
          queue[tail++] = next;
        }
      }
    }
  }
  return false;
}

// Compact, versioned RLE for local gallery snapshots. No browser APIs.
export function encodeArtwork(cells, fixed) {
  const runs = [];
  for (let i = 0; i < cells.length;) {
    const v = cells[i] | (fixed?.[i] ? 8 : 0);
    let len = 1;
    while (i + len < cells.length && len < 65535 &&
      (cells[i + len] | (fixed?.[i + len] ? 8 : 0)) === v) len++;
    runs.push(len, v);
    i += len;
  }
  return runs;
}

export function decodeArtwork(runs, size) {
  if (!Array.isArray(runs) || runs.length % 2) throw new Error('Invalid artwork runs');
  const cells = new Uint8Array(size), fixed = new Uint8Array(size);
  let offset = 0;
  for (let i = 0; i < runs.length; i += 2) {
    const n = runs[i], v = runs[i + 1];
    if (!Number.isInteger(n) || n < 1 || n > 65535 ||
      !Number.isInteger(v) || v < 0 || v > 15 || offset + n > size)
      throw new Error('Corrupt artwork snapshot');
    cells.fill(v & 7, offset, offset + n);
    if (v & 8) fixed.fill(1, offset, offset + n);
    offset += n;
  }
  if (offset !== size) throw new Error('Incomplete artwork snapshot');
  return { cells, fixed };
}

export class ModeProgress {
  constructor(storage = null) {
    this.storage = storage ?? (typeof localStorage === 'undefined' ? null : localStorage);
    this.key = 'qicai-modes-progress-v1';
    try {
      const parsed = JSON.parse(this.storage?.getItem(this.key) || '{}');
      this.unlockedLevel = Math.min(12, Math.max(1, Number(parsed.unlockedLevel) || 1));
      this.levelRecords = parsed.levelRecords && typeof parsed.levelRecords === 'object'
        ? parsed.levelRecords : {};
      this.artworks = Array.isArray(parsed.artworks) ? parsed.artworks.slice(0, 10) : [];
      this.draft = parsed.draft ?? null;
    } catch {
      this.unlockedLevel = 1;
      this.levelRecords = {};
      this.artworks = [];
      this.draft = null;
    }
  }

  persist() {
    try {
      this.storage?.setItem(this.key, JSON.stringify({
        unlockedLevel: this.unlockedLevel,
        levelRecords: this.levelRecords,
        artworks: this.artworks,
        draft: this.draft
      }));
      return true;
    } catch { return false; }
  }

  winLevel(level, drops, referenceDrops = 1) {
    if (!Number.isInteger(level) || level < 1 || level > 12) return;
    const stars = drops <= referenceDrops ? 3 : drops <= referenceDrops + 2 ? 2 : 1;
    const old = this.levelRecords[level] || {};
    this.levelRecords[level] = {
      stars: Math.max(stars, old.stars || 0),
      bestDrops: Math.min(drops, old.bestDrops ?? Infinity)
    };
    this.unlockedLevel = Math.max(this.unlockedLevel, Math.min(12, level + 1));
    this.persist();
    return stars;
  }

  saveDraft(grid, fixed) {
    this.draft = {
      version: 1, date: new Date().toISOString(),
      width: grid.width, height: grid.height,
      runs: encodeArtwork(grid.cells, fixed)
    };
    return this.persist();
  }

  readDraft(width, height) {
    const d = this.draft;
    if (!d || d.version !== 1 || d.width !== width || d.height !== height)
      return null;
    try { return decodeArtwork(d.runs, width * height); }
    catch { return null; }
  }

  clearDraft() {
    if (!this.draft) return;
    this.draft = null;
    this.persist();
  }

  saveArtwork(grid, fixed, completed = true) {
    const work = { id: Date.now(), completed, date: new Date().toISOString(),
      width: grid.width, height: grid.height, runs: encodeArtwork(grid.cells, fixed) };
    this.artworks.unshift(work);
    this.artworks.length = Math.min(10, this.artworks.length);
    this.persist();
    return work;
  }
}
