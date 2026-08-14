# R22 第 4 轮审查（移动端专项）— PromptCue

日期：2026-08-14 · 审查员
方法：真浏览器 320/375/667(横屏) 走查 + 截图（r4-*.png）+ 触控目标尺寸实测 + 代码核对（Prompter.tsx / index.css）

## 本轮验证通过的基线（不列为问题）

- 320/375/横屏均无横向溢出 ✔；375 默认 32px 断行合理（上轮 B4 生效）✔
- 提词控制栏按钮全部 40×40 且带 aria-label ✔；tap 暂停/拖拽 seek/长稿滚动均正常 ✔
- `fixed inset-0` 布局避开 iOS 100vh 工具栏坑 ✔；语音不可用时降级提示正常 ✔

## 发现清单

### D1【P1·功能】无 Screen Wake Lock：读稿中途手机熄屏
提词器的主场景是「手机架在相机旁，几分钟不碰屏幕照着读」。代码全文无 `wakeLock`（grep Prompter.tsx/全仓库=0）；系统默认 30-60s 熄屏会直接打断录制。这是移动端最核心的功能缺口。
建议：播放时 `navigator.wakeLock.request('screen')`，暂停/退出时 release，`visibilitychange` 后重新获取；不支持的浏览器静默跳过。约 20 行，无 UI。思辨：用「静音视频循环」hack 兼容老 iOS？否——Safari 16.4+ 已支持 wakeLock，hack 维护成本大于收益。

### D2【P2·文案】触屏设备上提示全是键盘指令
实测截图 r4-prompter-landscape.png / r2v-finished.png：控制栏下方常驻「Space play/pause · ↑↓ speed · ←→ text size · M/V mirror · R restart · Esc exit」；读完提示「Finished — press R to restart · Esc to exit」。触屏用户没有这些键，尤其结束态给出的两个动作在手机上都无法执行（控制栏此时还自动隐藏了）。
建议：以 `matchMedia('(pointer: coarse)')` 或 `maxTouchPoints` 区分：触屏显示「Tap to pause · drag to seek」/「Finished — tap ↻ to restart」，并在结束态强制显示控制栏。思辨：做两套完整文案系统？不必——只有 2 处字符串，条件表达式即可。

### D3【P2·视觉·轻】设置区滑杆命中区仅 16px 高
375 下 Speed/Text size/Countdown 三个 range 输入渲染高度 16px，低于 44px 触控推荐值；拇指易点空。建议：加大内边距或用 CSS 把可点区域扩到 ≥32px（thumb 视觉可不变）。

## 遗留跟踪

- C2③（首页 SPA 空壳 + CLS 0.287，Lighthouse mobile perf 0.83 的剩余瓶颈）——性质上也是移动端体验项，提醒修改员论证后尽早排期。
- A5+C4（KV 竞态）、A10（CJK 估时）、A11（镜像提示）继续挂账。

## 修复优先级建议

本轮修：D1（核心）、D2 · 顺手：D3 · 论证排期：C2③
