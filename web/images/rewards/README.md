# 签到与背包素材

本目录使用 2026-10-23 用户提供的三张 RGBA 原图拆分，不替换原图的标题、配色和彩沙纹理。共 18 张 WebP 切图；`manifest.json` 记录尺寸与字节数。

- `home-*`：首页签到、背包入口，保留原图文字。
- `signin-panel` / `backpack-panel`：原图边框与标题，去除示例卡片、领取状态和数量。
- `signin-day-*`：七天奖励卡片；第 1 天移除了示例绿色勾。日序与奖励数量是已确认的固定表格，领取勾和今日高亮由代码绘制。
- `backpack-*`：道具卡片，保留名称、图标和说明，去除示例库存。
- `prop-*`：游戏道具栏、首次提示动画使用的图标。
- `claim-button` / `claimed-button` / `return-home`：领取、已领取、返回首页按钮，移除卡片外的底色并保留透明边缘。

运行时以原图比例绘制。首页仅预加载两个入口；面板与道具图按需加载。库存来自 `RewardInventory`，不能把示例 `×1` / `×0` 写回数据。图片加载失败时提供 Canvas 文字和控件回退；加载完成后触发重绘。

验证：完整像素解码与 Alpha 通道往返比对；`npm run check:assets`、`npm test`、`npm run test:rewards:browser`。浏览器测试覆盖 Web / TapTap H5 的四种尺寸、领取前后、刷新恢复、较长库存数、资源失败回退；TapTap 原生存档接口在测试中由持久化 SDK 桩提供。
