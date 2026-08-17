# R24 Round 3 — 匿名盲评 · 迭代 · 部署 · 复测

日期：2026-08-16/17 · 分支：r24-loop · 线上：https://prompter.zalize.com

## 1. 匿名盲评设置

- 竞品：CuePrompter（公开核心流程）、Speakflow（登录墙，仅用公开首页/guide 页，未绕过）。
- 证据：三方首页 1440px/375px 截图；A 另含功能区块/工作流/录制态截图；C 含工作流截图。全部遮蔽 logo/域名/品牌字样。原图与匿名图见 `round-03-materials/`。
- 本轮重新随机映射（评审不知情）：**A = PromptCue（我方）、B = Speakflow、C = CuePrompter**。
- 独立评审子会话（不知我方身份）：https://app.devin.ai/sessions/b7c2cbbe5d50495bb2a678caefb2c130
- 评审原文：`round-03-materials/blind-review.md`；评审 prompt：`round-03-materials/judge-prompt-r3.txt`。

## 2. 性能实测（同环境同日，公开首页）

| 产品 | TTFB | DCL | Load | 请求数 |
|---|---:|---:|---:|---:|
| PromptCue (A) | 40ms | 145ms | 149ms | 7 |
| Speakflow (B) | 286ms | 1051ms | 4434ms | 111 |
| CuePrompter (C) | 5ms | 72ms | 163ms | 19 |

## 3. 盲评结果（揭盲后）

| 维度 | PromptCue (A) | Speakflow (B) | CuePrompter (C) | 胜者 |
|---|---:|---:|---:|---|
| 视觉设计 | 9 | 7 | 5 | 我方 |
| 信息层级 | 9 | 7 | 5 | 我方 |
| 交互与流程顺滑度 | 9 | 6 | 7 | 我方 |
| 功能完整度 | 9 | 8 | 6 | 我方 |
| 性能实测 | 9 | 3 | 9 | 我方/CuePrompter 并列 |
| 文案与信任感 | 9 | 7 | 6 | 我方 |
| **合计** | **54** | **38** | **38** | **我方** |

关键结论：R2 唯一输掉的视觉设计（7 vs Speakflow 8）本轮反超（9 vs 7），原创场景图+配色体系被评审列为最强项。我方五维单独胜、性能与 CuePrompter 并列。

分数曲线：R1 52 → R2 53 → R3 54（满分 60，均为总分第一）。

## 4. 差距 → 改进项

评审对我方仅剩两处扣分/持平：

- P1 视觉「首屏右侧设置面板略密」→ 控制面板重排：滑杆 → Start 按钮上移 → 分组「Display」（镜像/对齐/引导线/语音/文字色）→ 保存。
- P1 性能与 CuePrompter 并列（对方 DCL 更快）→ Prompter 组件代码分割（lazy chunk ~16KB，初始 JS 313→298KB），页面加载 2s 后预载，Start 体验不受影响。
- P0（复测中发现）：Start 点击的 pointerup 泄漏进新挂载的全屏提词器，可能取消倒计时（开屏即暂停）→ 挂载后 400ms 内忽略背景 tap。

不复制竞品任何代码/文案/图片/logo，仅学习模式。

## 5. PR 与部署

- PR #24（代码分割 + 面板重排）：https://github.com/wookat/prompter/pull/24 — 已合并
- PR #25（tap-guard 修复）：https://github.com/wookat/prompter/pull/25 — 已合并
- 本地验证：`npm run lint` + `npm run build` 全绿（仅 1 个既有 warning）。
- 部署（均从 r24-loop）：PR24 → 版本 `fc37d90c-eaf7-4f85-ba6c-63299ba603c8`；PR25 → 版本 `518fb35e-75d3-4e36-aae7-706671acaa47`。

## 6. 线上复测（375px + 1440px，硬刷新）

第一轮（PR24 部署后，含录屏）全部通过：

- 代码分割生效：初始仅 `index-*.js`（98.4KB，原 103KB），`Prompter-*.js`（6.6KB）约 2.5s 后预载；加载前/后点 Start 均即时进入。
- 面板新顺序在 1440px/375px 均无裁切溢出（375px `scrollWidth == 375`）。
- 回归：倒计时→滚动、鼠标移动唤出控制条、录制开始/停止并下载 `promptcue-take-*.mp4`、场景图区块双端正常。
- 发现 P0：一次进入时 Start 点击泄漏取消倒计时（开屏即暂停）→ 即修（PR #25）。

第二轮（PR25 部署后）：3 次进入倒计时均跑满并开始滚动，未再出现开屏暂停；>0.5s 后 tap 暂停/恢复与拖拽定位均正常。

截图证据：`round-03-materials/live/`。录屏（本地归档）：`/home/ubuntu/screencasts/rec-552e4da9-5b00-44ee-9b41-a20aec98694a/rec-552e4da9-5b00-44ee-9b41-a20aec98694a-edited.mp4`。

## 7. 限制与遗留

- Speakflow 核心工作流在登录墙后，其交互/功能两维按公开证据保守评分（评审已注明可能低估）。
- 摄像头拒绝授权的降级路径仍未实测（假媒体自动授权）。
- 开屏暂停异常本身是间歇性（R3 复测 1/3 次），修复后 3 次全干净 + 代码层 guard 一致，但非绝对证明。
- 评审指出的品牌上限差距（缺真实用户背书/进阶生态如桌面端、跨设备）为长期项，本轮未动。

下一步：R4 最终盲评（重新采证+重新随机）+ 六维曲线 + SOP-04 总结。
