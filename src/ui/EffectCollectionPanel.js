import {
  CLEAR_EFFECTS,
  getClearEffectDefinition
} from '../clear-effects/ClearEffectRegistry.js';

function createButton(label) {
  const button = document.createElement('button');
  button.textContent = label;
  button.style.border = '0';
  button.style.borderRadius = '999px';
  button.style.padding = '9px 13px';
  button.style.font = '800 12px/1 system-ui, sans-serif';
  button.style.cursor = 'pointer';
  button.style.touchAction = 'manipulation';
  return button;
}

function describeUnlock(effect, snapshot) {
  const unlock = effect.unlock ?? {};

  if (unlock.type === 'default') return '默认拥有';
  if (unlock.type === 'ad') return `观看 ${unlock.value} 次激励广告`;
  if (unlock.type === 'score') {
    return `最高分达到 ${unlock.value.toLocaleString()}`;
  }
  if (unlock.type === 'total_clear') {
    return `累计消除 ${unlock.value.toLocaleString()} 粒`;
  }
  if (unlock.type === 'single_clear') {
    return `单次消除 ${unlock.value.toLocaleString()} 粒`;
  }

  return '达成特殊成就';
}

function getProgressText(effect, snapshot) {
  const unlock = effect.unlock ?? {};

  if (unlock.type === 'score') {
    return `${Math.min(snapshot.stats.bestScore, unlock.value).toLocaleString()} / ${unlock.value.toLocaleString()}`;
  }

  if (unlock.type === 'total_clear') {
    return `${Math.min(snapshot.stats.totalClearedParticles, unlock.value).toLocaleString()} / ${unlock.value.toLocaleString()}`;
  }

  if (unlock.type === 'ad') {
    const value = snapshot.adUnlockProgress[effect.id] ?? 0;
    return `${Math.min(value, unlock.value)} / ${unlock.value}`;
  }

  return '';
}

export class EffectCollectionPanel {
  constructor(container, { progress, unlockManager } = {}) {
    this.container = container;
    this.progress = progress;
    this.unlockManager = unlockManager;
    this.opened = false;

    this.entryButton = createButton('✨ 特效');
    this.entryButton.style.position = 'absolute';
    this.entryButton.style.top = '14px';
    this.entryButton.style.right = '14px';
    this.entryButton.style.zIndex = '13';
    this.entryButton.style.color = '#72513a';
    this.entryButton.style.background = 'rgba(255,255,255,0.9)';
    this.entryButton.style.boxShadow = '0 5px 16px rgba(91,65,42,0.10)';
    this.entryButton.style.backdropFilter = 'blur(8px)';

    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.inset = '0';
    this.overlay.style.zIndex = '40';
    this.overlay.style.display = 'none';
    this.overlay.style.padding = '18px 14px';
    this.overlay.style.background = 'rgba(55,40,28,0.34)';
    this.overlay.style.backdropFilter = 'blur(5px)';
    this.overlay.style.overflow = 'hidden';
    this.overlay.style.touchAction = 'pan-y';

    this.sheet = document.createElement('div');
    this.sheet.style.height = '100%';
    this.sheet.style.display = 'flex';
    this.sheet.style.flexDirection = 'column';
    this.sheet.style.borderRadius = '24px';
    this.sheet.style.padding = '18px';
    this.sheet.style.background = 'rgba(255,251,244,0.98)';
    this.sheet.style.boxShadow = '0 22px 60px rgba(70,43,20,0.24)';
    this.sheet.style.color = '#5d4632';
    this.sheet.style.fontFamily = 'system-ui, sans-serif';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '12px';

    this.title = document.createElement('div');
    this.title.style.font = '900 23px/1.1 system-ui, sans-serif';
    this.title.textContent = '消除特效';

    this.closeButton = createButton('关闭');
    this.closeButton.style.color = '#72513a';
    this.closeButton.style.background = '#f2e8dc';

    this.summary = document.createElement('div');
    this.summary.style.marginTop = '8px';
    this.summary.style.font = '700 11px/1.45 system-ui, sans-serif';
    this.summary.style.color = 'rgba(93,70,50,0.66)';

    this.list = document.createElement('div');
    this.list.style.marginTop = '14px';
    this.list.style.display = 'grid';
    this.list.style.gap = '10px';
    this.list.style.overflowY = 'auto';
    this.list.style.paddingRight = '2px';
    this.list.style.paddingBottom = '12px';

    header.append(this.title, this.closeButton);
    this.sheet.append(header, this.summary, this.list);
    this.overlay.appendChild(this.sheet);
    this.container.append(this.entryButton, this.overlay);

    this.entryButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.close());

    this.unsubscribe = this.progress?.subscribe(() => this.render());
    this.render();
  }

  isOpen() {
    return this.opened;
  }

  open() {
    this.opened = true;
    this.overlay.style.display = 'block';
    this.render();
  }

  close() {
    this.opened = false;
    this.overlay.style.display = 'none';
  }

  render() {
    if (!this.progress) return;

    const snapshot = this.progress.getSnapshot();
    const selected = getClearEffectDefinition(snapshot.selectedClearEffect);

    this.summary.textContent =
      `当前：${selected.name} · 最高分 ${snapshot.stats.bestScore.toLocaleString()} · 累计消除 ${snapshot.stats.totalClearedParticles.toLocaleString()} 粒`;

    this.list.replaceChildren();

    for (const effect of CLEAR_EFFECTS) {
      const unlocked = snapshot.unlockedClearEffects.includes(effect.id);
      const selectedNow = snapshot.selectedClearEffect === effect.id;
      const isNew = snapshot.newClearEffects.includes(effect.id);

      const card = document.createElement('div');
      card.style.padding = '14px';
      card.style.borderRadius = '18px';
      card.style.border = selectedNow
        ? '2px solid rgba(255,128,87,0.62)'
        : '1px solid rgba(122,92,65,0.12)';
      card.style.background = selectedNow
        ? 'linear-gradient(135deg, rgba(255,239,223,.95), rgba(255,255,255,.96))'
        : '#fff';
      card.style.boxShadow = '0 7px 18px rgba(91,65,42,0.07)';

      const top = document.createElement('div');
      top.style.display = 'flex';
      top.style.alignItems = 'center';
      top.style.gap = '10px';

      const icon = document.createElement('div');
      icon.textContent = effect.icon;
      icon.style.width = '42px';
      icon.style.height = '42px';
      icon.style.display = 'grid';
      icon.style.placeItems = 'center';
      icon.style.flex = '0 0 auto';
      icon.style.borderRadius = '14px';
      icon.style.fontSize = '22px';
      icon.style.background =
        effect.id === 'wind_dissolve'
          ? 'linear-gradient(135deg,#dff7ff,#effff7)'
          : 'linear-gradient(135deg,#fff0dc,#fff9ec)';

      const text = document.createElement('div');
      text.style.minWidth = '0';
      text.style.flex = '1';

      const name = document.createElement('div');
      name.style.font = '900 15px/1.25 system-ui, sans-serif';
      name.textContent =
        effect.name +
        (isNew ? ' · NEW' : '') +
        (!effect.implemented ? ' · 敬请期待' : '');

      const rarity = document.createElement('div');
      rarity.style.marginTop = '2px';
      rarity.style.font = '800 10px/1.2 system-ui, sans-serif';
      rarity.style.color = '#b07149';
      rarity.textContent = effect.rarity;

      text.append(name, rarity);
      top.append(icon, text);

      const description = document.createElement('div');
      description.style.marginTop = '9px';
      description.style.font = '650 11px/1.5 system-ui, sans-serif';
      description.style.color = 'rgba(93,70,50,0.72)';
      description.textContent = effect.description;

      const unlockText = document.createElement('div');
      unlockText.style.marginTop = '8px';
      unlockText.style.font = '750 10px/1.4 system-ui, sans-serif';
      unlockText.style.color = unlocked ? '#4e9b70' : '#9a7254';
      unlockText.textContent = unlocked
        ? '✓ 已解锁'
        : `${describeUnlock(effect, snapshot)} ${getProgressText(effect, snapshot)}`;

      const actions = document.createElement('div');
      actions.style.marginTop = '10px';
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      actions.style.flexWrap = 'wrap';

      if (selectedNow) {
        const equipped = createButton('已装备');
        equipped.disabled = true;
        equipped.style.color = '#fff';
        equipped.style.background = '#ff8057';
        actions.appendChild(equipped);
      } else if (unlocked && effect.implemented) {
        const equip = createButton('装备');
        equip.style.color = '#fff';
        equip.style.background = '#ff8057';
        equip.addEventListener('click', () => {
          this.progress.selectEffect(effect.id);
          this.render();
        });
        actions.appendChild(equip);
      } else if (
        !unlocked &&
        effect.implemented &&
        effect.unlock?.type === 'ad'
      ) {
        const ad = createButton('模拟广告解锁');
        ad.style.color = '#fff';
        ad.style.background = '#4d9bd8';
        ad.addEventListener('click', () => {
          this.unlockManager?.completeAd(effect.id);
          this.progress.markSeen(effect.id);
          this.render();
        });
        actions.appendChild(ad);
      }

      if (unlocked && isNew) {
        const seen = createButton('标记已查看');
        seen.style.color = '#72513a';
        seen.style.background = '#f2e8dc';
        seen.addEventListener('click', () => {
          this.progress.markSeen(effect.id);
          this.render();
        });
        actions.appendChild(seen);
      }

      card.append(top, description, unlockText, actions);
      this.list.appendChild(card);
    }
  }
}
