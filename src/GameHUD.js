export class GameHUD {
  constructor(container = document.body) {
    this.score = 0;
    this.combo = 0;
    this.restartHandler = null;
    this.container = container;

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

    this.panel.append(this.title, this.finalScore, this.restartButton);
    this.overlay.appendChild(this.panel);

    this.container.append(this.root, this.overlay);
    this.render();
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
