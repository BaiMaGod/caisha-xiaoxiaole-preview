# 设置 / 音量 UI 素材

本目录为《七彩沙画消除》的设置与音量控制拆分素材。

- setting_gear.png：设置入口齿轮按钮
- close_button.png：设置弹框关闭按钮
- music_icon.png：音乐图标
- sfx_icon.png：音效图标
- slider_track_empty.png：空音量槽
- slider_fill_orange.png：音乐音量动态填充条
- slider_fill_blue.png：音效音量动态填充条
- slider_knob_orange.png：音乐音量滑块圆钮
- slider_knob_blue.png：音效音量滑块圆钮
- percent_badge_bg.png：百分比底板，百分比数值建议由代码动态渲染

推荐组合方式：空槽 + 填充条 + 滑块圆钮，由代码根据音量值控制填充宽度和圆钮位置，实现 0%～100% 连续调节。

固定 70% / 80% 的整条示意图仅用于视觉参考，不作为正式动态 UI 资源提交。