# R22 第 4 轮 fix 报告 — PromptCue（移动端专项）

- 代码分支：`devin/1786675213-r22-round4`（commit d98a273）
- PR：https://github.com/wookat/prompter/pull/11（已合并）
- 部署：`npm run deploy` 成功（wrangler zone route 更新仍报 code 10000 权限错误，custom domain 不受影响）；线上已验证新 bundle `index-Dd_imlnp.js` 含 wakeLock 代码。

## 逐项响应

### D1（P1 功能）Screen Wake Lock — 已修
- 修法：`Prompter.tsx` 新增一个以 `playing` 为依赖的 effect（约 25 行）：播放时 `navigator.wakeLock.request('screen')`，暂停/退出/自然滚完（playing→false）时释放；`visibilitychange` 回到 visible 时重新获取（系统在页面隐藏时会自动丢锁）。异步授予落地时若已停止播放则立即释放（`active` 标志），避免悬挂锁。不支持的浏览器静默跳过。
- 采纳审计思辨结论：不做「静音视频循环」hack——Safari 16.4+ 已原生支持，hack 维护成本大于收益。
- 验证（spy `navigator.wakeLock.request`）：开始滚动 request 1 次、暂停 released=true、恢复重新 request、模拟 hidden→visible 重获（calls 3→4）、Esc 全部释放。

### D2（P2 文案）触屏提示键盘化 — 已修
- 修法：模块级 `coarsePointer()`（`matchMedia('(pointer: coarse)')`，挂载时读一次）。触屏文案：`Tap to start` / `Paused — tap to resume` / `Finished — tap ↻ to restart or ✕ to exit`；桌面保持原键盘文案。结束态控制栏强制常显（`controlsVisible || (progress >= 1 && !playing)`），否则触屏用户在结束态无任何可执行动作。
- 主动否决：完整双文案系统/i18n 抽象——只有 3 处字符串，条件表达式即可（如无必要勿增实体）。
- 验证：三条触屏文案逐一截图确认；结束态控制栏 5s 后仍可见，↻ 重启、✕ 退出可点；桌面文案与行为不回归。注：CDP pointer-coarse 仿真在全屏时会被清除，touch 分支经页内 matchMedia 桩验证，建议真机顺手扫一眼。

### D3（P2 视觉）滑杆命中区 16px — 已修
- 修法：三个 range input 加 `h-8`（32px 命中区，thumb 视觉不变）。
- 验证：computed height 均 32px，390×844 布局无错位，真实拖动 Speed 滑块 wpm 实时变化。

## 挂账项
- C2③（首页预渲染/CLS）：性质为构建期架构变更（需预渲染 Home 或静态骨架进 index.html），将单独论证后排期，不在移动端轮夹带。
- A5+C4、A10、A11：继续挂账。

## 本地验证
- `npm run lint`：0 errors（1 个既有 warning）。
- `npm run build`：tsc + vite + build-seo 全绿。

## 线上验证
- `/` 引用新 bundle `assets/index-Dd_imlnp.js`，bundle 内含 wakeLock 逻辑。
- E2E 真浏览器证据见 PR #11 评论（含录屏与逐项截图）。
