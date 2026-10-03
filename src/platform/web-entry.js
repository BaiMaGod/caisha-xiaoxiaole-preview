import { CanvasGame } from '../runtime/CanvasGame.js';
import { createWebPlatform } from './web.js';

const game = new CanvasGame(createWebPlatform(document.getElementById('game-canvas')));
if (import.meta.env.DEV) globalThis.__canvasGame = game;
