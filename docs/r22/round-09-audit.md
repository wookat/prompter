# R22 第 9 轮审查（无障碍专项）— PromptCue

日期：2026-08-14 · 审查员
方法：axe-core 4.10.2 三页面实测（首页/提词器运行态/pSEO 页）+ 纯键盘走查 + SR 语义检查（生产环境，bundle index-CM-fgx2D.js）

## 本轮验证通过的基线（不列为问题）

- axe：pSEO 页 0 违规；首页/提词器仅 2 项（见 I3），无 serious/critical，色彩对比全过 ✔
- FAQ 用原生 details/summary（键盘/SR 免费获得）✔ 滑杆原生 range ✔ 文本色按钮有 aria-pressed ✔
- 提词器全键盘可操作（Space/箭头/M/V/R/Esc），Esc 可靠退出 ✔ 焦点有可见 outline ✔

## 发现清单

### I1【P1·功能/无障碍】控制栏隐藏后仍可 Tab 进入，焦点落在不可见按钮上
复现：启动提词器 → 等 3.5s 控制栏淡出（opacity:0 + pointer-events-none）→ 按 Tab。实测焦点落到不可见的 Pause 按钮（aria-label:"Pause", controlsOpacity:0），且控制栏不因获得焦点而重新显示——键盘用户面对全黑屏幕操作隐形控件。
建议：控制栏容器加 `onFocus={showControls}`（focusin 冒泡，一行）；这比 `visibility:hidden`/`inert` 更好——键盘用户 Tab 即唤出控制栏，与鼠标移动唤出对称。思辨：完全移除 tab 可达性（inert）会让键盘用户失去点按控件的途径，唤出式才是对的。

### I2【P2·无障碍】提词器内零 aria-live，状态变化对读屏用户静默
实测提词器 DOM 中 aria-live 区域数量为 0：倒计时 3-2-1、Paused/Finished 提示、镜像 pill、语音失败回退，读屏用户全部感知不到。
建议：给「paused hint」与镜像/语音 pill 容器加 `aria-live="polite"`（已有的条件渲染文本天然成为播报内容，几乎零成本）；倒计时数字加 `role="timer" aria-live="polite"`。不必新增隐藏播报节点——现有可见文本就是最好的播报源。

### I3【P2·无障碍·轻】axe 仅存的 2 项违规
- `empty-table-header`（minor）：对比表首列 th 为空。建议 `<th><span class="sr-only">Feature</span></th>` 或 scope 调整。
- `landmark-complementary-is-top-level`（moderate）：设置面板 `<aside>` 嵌在 main 内。它语义上不是补充内容而是核心控制区，建议改 `<section aria-label="Prompter settings">`（降语义比挪位置更符合实际）。

### I4【P2·无障碍·轻】无 skip link，首 Tab 落在 logo
页面结构短（header 5 项），成本低收益小；但编辑器是页面主体，加一个 "Skip to editor" 的 sr-only skip link 是标准做法（focus 时可见）。优先级最低，可与 I3 同批处理。

### 主动否决（记录思辨，不立项）
- `role="application"`：提词器全屏态用它是合理的（自定义键盘模型，SR 直通按键），不改。
- prefers-reduced-motion 停滚动：滚动是产品核心功能而非装饰动画，用户主动点 Start，豁免合理；countdown 的 animate-pulse 属装饰但影响极小。

## 修复优先级建议

本轮修：I1（一行，价值最高）、I2、I3、I4 · 全部为小改动，建议一次清完

---

## 第 9 轮线上复验 verdict（2026-08-14，生产环境实测，bundle index-CF91vZAB.js）

- I1 PASS — 控制栏淡出（opacity:0）后按 Tab：控制栏立即重现（opacity:1），焦点为可见 Pause 按钮。
- I2 PASS — 运行态 2 个 polite live region（提示条+状态 pill 常挂载），倒计时实测 `role=timer aria-live=polite text:"2"`。修改员对「常挂载容器才可靠播报」的修正是对的。注：验证的是属性正确性，真机读屏朗读未测（环境无 NVDA/VoiceOver），如实挂账。
- I3 PASS — axe-core 首页 0 违规（原 2 项全清）。
- I4 PASS — 首 Tab 出现 "Skip to script editor"，回车跳 #editor。

结论：4/4 PASS，第 9 轮关闭。遗留：H2 其余 6 页扩充、真机读屏抽查（可选）、cron rollup 首跑确认、AE token 更换（需老板）。
