export class GameHUD {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.restartHandler = null;

    this.root = document.createElement('div');
    this.root.style.position = 'fixed';
    this.root.style.left = '12px';
    this.root.style.top = '12px';
    this.root.style.zIndex = '10';
    this.root.style.padding = '8px 12px';
    this.root.style.borderRadius = '12px';
    this.root.style.background = 'rgba(255,255,255,0.82)';
    this.root.style.backdropFilter = 'blur(8px)';
    this.root.style.font = '600 14px/1.35 system-ui, sans-serif';
    this.root.style.color = '#5d4632';
    this.root.style.pointerEvents = 'none';
    this.root.style.userSelect = 'none';

    this.overlay = document.createElement('div');
    this.overlay.style.position = 'fixed';
    this.overlay.style.inset = '0';
    this.overlay.style.zIndex = '20';
    this.overlay.style.display = 'none';
    this.overlay.style.alignItems = 'center';
    this.overlay.style.justifyContent = 'center';
    this.overlay.style.background = 'rgba(54, 38, 26, 0.36)';
    this.overlay.style.backdropFilter = 'blur(3px)';

    this.panel = document.createElement('div');
    this.panel.style.minWidth = '220px';
    this.panel.style.padding = '24px 26px';
    this.panel.style.borderRadius = '22px';
    this.panel.style.background = 'rgba(255,255,255,0.96)';
    this.panel.style.boxShadow = '0 16px 50px rgba(75, 45, 20, 0.2)';
    this.panel.style.textAlign = 'center';
    this.panel.style.color = '#5d4632';
    this.panel.style.fontFamily = 'system-ui, sans-serif';

    this.title = document.createElement('div');
    this.title.textContent = '游戏结束';
    this.title.style.fontSize = '28px';
    this.title.style.fontWeight = '800';

    this.finalScore = document.createElement('div');
    this.finalScore.style.marginTop = '8px';
    this.finalScore.style.fontSize = '16px';

    this.restartButton = document.createElement('button');
    this.restartButton.textContent = '再来一局';
    this.restartButton.style.marginTop = '18px';
    this.restartButton.style.border = '0';
    this.restartButton.style.borderRadius = '999px';
    this.restartButton.style.padding = '12px 28px';
    this.restartButton.style.fontSize = '16px';
    this.restartButton.style.fontWeight = '700';
    this.restartButton.style.color = '#fff';
    this.restartButton.style.background = '#ff7f50';
    this.restartButton.style.cursor = 'pointer';

    this.restartButton.addEventListener('click', () => {
      this.restartHandler?.();
    });

    this.panel.append(this.title, this.finalScore, this.restartButton);
    this.overlay.appendChild(this.panel);

    document.body.append(this.root, this.overlay);
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
        ? `<div style="margin-top:2px;font-size:16px">Combo × ${this.combo}</div>`
        : '';

    this.root.innerHTML =
      `<div>分数 ${this.score}</div>${comboText}`;
  }
}
