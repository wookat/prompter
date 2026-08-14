# R22 第 9 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/16（已合并）· 分支 `devin/1786684244-r22-round9`（commit e3aac20）· 已部署上线（bundle `index-CF91vZAB.js`）

## 逐项响应（4/4 全修，改动仅 2 文件 +30/-10）

### I1【P1】控制栏隐藏后 Tab 焦点落在不可见按钮 — 已修（采纳审查员方案）
- 控制栏容器加 `onFocus={showControls}`（focusin 冒泡，一行）。同意审查员思辨：`inert`/`visibility:hidden` 会剥夺键盘用户点按控件的途径，「聚焦即唤出」与鼠标移动唤出对称，是正确模型。
- 生产实测：滚动中控制栏淡出后按 Tab，控制栏立即重现、`document.activeElement` 为可见的 Faster 按钮（排除 finished 态常显干扰，测试时先降速拉长滚动窗口）。

### I2【P2】提词器零 aria-live — 已修（比建议多一步治本）
- paused/finished 提示的外层 wrapper 改为**常挂载** + `aria-live="polite"`（原为条件挂载——live region 与内容一起插入时读屏可能不播报，常挂载空容器才可靠触发播报，这是对审查员「给现有容器加属性」方案的必要修正）。
- 顶部状态 pill 容器（mirror/voice/mic-error）`aria-live="polite"`；倒计时数字 `role="timer" aria-live="polite"`。
- 未增任何隐藏播报节点，现有可见文本即播报源。
- 生产 DOM 实测：三处属性齐备，倒计时经页内采样器捕获 `{live:"polite",text:"3"}`。诚实声明：环境无 NVDA/VoiceOver，验证的是属性正确性而非真实朗读。

### I3【P2】axe 两违规 — 已修
- 对比表首列空 `<th>` 内加 `<span class="sr-only">Feature</span>`。
- 设置面板 `<aside>` 改 `<section aria-label="Prompter settings">`（同意「降语义比挪位置更符合实际」）。
- 生产实测：axe-core 4.10.2 首页 **0 违规**（全部清零，不止目标两项）。

### I4【P2】skip link — 已修
- 首页新增 sr-only、focus 时可见的 "Skip to script editor"，跳到 `#editor`（editor grid 加 id + `scroll-mt-20`）。实测第一次 Tab 即出现，回车跳到编辑器。

## 主动否决的方案
- I1 用 `inert` 移除 tab 可达性：否决，理由同上。
- I2 新增 sr-only 播报节点：否决，现有可见文本即最好播报源，勿增实体。
- 审查员已自行否决的 `role="application"` 移除与 prefers-reduced-motion 停滚动：同意其思辨，不动。

## 本地验证与部署
- lint 0 errors（仅存量 button.tsx warning）、tsc+build 全绿。
- 部署成功（zone route 更新仍报既有 token 权限 code 10000，不影响服务）；生产已验证新 bundle。

## 真实浏览器 E2E（生产环境，全程录屏）
I1/I2/I3/I4 全部 PASS；回归（golden path、↑↓ 速度快捷键、预渲染无闪烁、console 干净）PASS。证据见 PR #16 评论。

## 遗留跟踪
- H2 其余 6 个 pSEO 页扩充（上轮挂账）。
- 如追求最高置信，可安排真机读屏（NVDA/VoiceOver）抽查 aria-live 朗读。
