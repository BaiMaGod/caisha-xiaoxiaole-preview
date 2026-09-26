import { CONFIG } from './config.js';

export class GameHUD {
  constructor(container = document.body) {
    this.score = 0;
    this.combo = 0;
    this.restartHandler = null;
    this.homeHandler = null;
    this.container = container;
    this.dropHintCount = 0;
    this.gameVisible = true;

    this.root = document.createElement('div');
    this.root.style.position = 'absolute';
    this.root.style.left = '14px';
    this.root.style.top = '14px';
    this.root.style.zIndex = '10';
    this.root.style.minWidth = '74px';
    this.root.style.padding = '9px 12px';
    this.root.style.borderRadius = '14px';
    this.root.style.background = 'rgba(255,255,255,0.9)';
    this.root.style.boxShadow = '0 5px 16px rgba(91, 65, 42, 0.09)';
    this.root.style.backdropFilter = 'blur(8px)';
    this.root.style.font = '700 13px/1.35 system-ui, sans-serif';
    this.root.style.color = '#5d4632';
    this.root.style.pointerEvents = 'none';
    this.root.style.userSelect = 'none';

    this.tip = document.createElement('div');
    this.tip.textContent = '左右拖动 · 松手下落 · 下滑×2';
    this.tip.style.position = 'absolute';
    this.tip.style.left = '50%';
    this.tip.style.top =
      `calc(${((CONFIG.DEATH_LINE_Y + 6) / CONFIG.HEIGHT) * 100}% + 4px)`;
    this.tip.style.transform = 'translateX(-50%)';
    this.tip.style.zIndex = '12';
    this.tip.style.padding = '6px 10px';
    this.tip.style.borderRadius = '999px';
    this.tip.style.background = 'rgba(255,255,255,0.84)';
    this.tip.style.boxShadow = '0 4px 14px rgba(91,65,42,0.08)';
    this.tip.style.backdropFilter = 'blur(7px)';
    this.tip.style.color = 'rgba(92,73,57,0.76)';
    this.tip.style.font = '700 11px/1 system-ui, sans-serif';
    this.tip.style.whiteSpace = 'nowrap';
    this.tip.style.pointerEvents = 'none';
    this.tip.style.userSelect = 'none';
    this.tip.style.transition = 'opacity 180ms ease, transform 180ms ease';

    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.inset = '0';
    this.overlay.style.zIndex = '20';
    this.overlay.style.display = 'none';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.padding = '24px';
    this.overlay.style.background = 'rgba(54, 38, 26, 0.32)';
    this.overlay.style.backdropFilter = 'blur(3px)';

    this.panel = document.createElement('div');
    this.panel.style.width = 'min(100%, 270px)';
    this.panel.style.padding = '26px 24px 24px';
    this.panel.style.borderRadius = '24px';
    this.panel.style.background = 'rgba(255,255,255,0.97)';
    this.panel.style.boxShadow = '0 18px 50px rgba(75, 45, 20, 0.2)';
    this.panel.style.textAlign = 'center';
    this.panel.style.color = '#5d4632';
    this.panel.style.fontFamily = 'system-ui, sans-serif';

    this.title = document.createElement('div');
    this.title.textContent = '游戏结束';
    this.title.style.fontSize = '28px';
    this.title.style.fontWeight = '850';

    this.finalScore = document.createElement('div');
    this.finalScore.style.marginTop = '9px';
    this.finalScore.style.fontSize = '15px';
    this.finalScore.style.fontWeight = '650';

    this.restartButton = document.createElement('button');
    this.restartButton.textContent = '再来一局';
    this.restartButton.style.marginTop = '20px';
    this.restartButton.style.border = '0';
    this.restartButton.style.borderRadius = '999px';
    this.restartButton.style.padding = '12px 30px';
    this.restartButton.style.fontSize = '16px';
    this.restartButton.style.fontWeight = '750';
    this.restartButton.style.color = '#fff';
    this.restartButton.style.background = '#ff8057';
    this.restartButton.style.boxShadow = '0 8px 18px rgba(255, 128, 87, 0.28)';
    this.restartButton.style.cursor = 'pointer';

    this.restartButton.addEventListener('click', () => {
      this.restartHandler?.();
    });

    this.restartButton.style.marginTop = '0';

    this.homeButton = document.createElement('button');
    this.homeButton.textContent = '返回首页';
    this.homeButton.style.border = '1px solid rgba(114,81,58,0.14)';
    this.homeButton.style.borderRadius = '999px';
    this.homeButton.style.padding = '12px 22px';
    this.homeButton.style.fontSize = '15px';
    this.homeButton.style.fontWeight = '750';
    this.homeButton.style.color = '#72513a';
    this.homeButton.style.background = '#f6ede3';
    this.homeButton.style.cursor = 'pointer';

    this.homeButton.addEventListener('click', () => {
      this.homeHandler?.();
    });

    this.actions = document.createElement('div');
    this.actions.style.marginTop = '20px';
    this.actions.style.display = 'flex';
    this.actions.style.justifyContent = 'center';
    this.actions.style.gap = '9px';
    this.actions.append(this.homeButton, this.restartButton);

    this.panel.append(this.title, this.finalScore, this.actions);
    this.overlay.appendChild(this.panel);

    this.container.append(this.root, this.tip, this.overlay);
    this.render();
  }

  notifyDropReleased() {
    this.dropHintCount += 1;

    if (this.dropHintCount >= 3) {
      this.tip.style.opacity = '0';
      this.tip.style.transform = 'translate(-50%, -4px)';

      clearTimeout(this.tipHideTimer);
      this.tipHideTimer = setTimeout(() => {
        this.tip.style.display = 'none';
      }, 190);
    }
  }

  setGameVisible(visible) {
    this.gameVisible = Boolean(visible);
    this.root.style.display = this.gameVisible ? 'block' : 'none';

    if (!this.gameVisible) {
      this.tip.style.display = 'none';
      return;
    }

    if (this.dropHintCount < 3) {
      this.tip.style.display = 'block';
      this.tip.style.opacity = '1';
      this.tip.style.transform = 'translateX(-50%)';
    }
  }

  resetHint() {
    clearTimeout(this.tipHideTimer);
    this.dropHintCount = 0;
    this.tip.style.opacity = '1';
    this.tip.style.transform = 'translateX(-50%)';
    this.tip.style.display = this.gameVisible ? 'block' : 'none';
  }

  setScore(score) {
    this.score = score;
    this.render();
  }

  showCombo(combo) {
    this.combo = combo;
    this.render();

    clearTimeout(this.comboTimer);

    this.comboTimer = setTimeout(() => {
      this.combo = 0;
      this.render();
    }, 900);
  }

  setRestartHandler(handler) {
    this.restartHandler = handler;
  }

  setHomeHandler(handler) {
    this.homeHandler = handler;
  }

  showGameOver(score) {
    clearTimeout(this.comboTimer);
    this.combo = 0;
    this.finalScore.textContent = `最终得分：${score}`;
    this.overlay.style.display = 'flex';
    this.render();
  }

  hideGameOver() {
    this.overlay.style.display = 'none';
  }

  reset() {
    clearTimeout(this.comboTimer);
    this.score = 0;
    this.combo = 0;
    this.hideGameOver();
    this.resetHint();
    this.render();
  }

  render() {
    const comboText =
      this.combo > 1
        ? `<div style="margin-top:3px;color:#ff6f45;font-size:14px">Combo × ${this.combo}</div>`
        : '';

    this.root.innerHTML =
      `<div style="font-size:10px;opacity:.58;font-weight:700">SCORE</div>` +
      `<div style="font-size:18px;line-height:1.1;margin-top:1px">${this.score}</div>` +
      comboText;
  }
}
