# R24 Round 01 — 匿名盲评 + 差距分析 + 迭代台账

日期：2026-08-16 · 分支：`r24-loop` · 产品：PromptCue（prompter.zalize.com）

## 1. 匿名盲评

- 参评：A/B/C 三方，匿名化截图（遮 logo/域名/品牌字样），随机标签。
- 材料：`round-01-materials/`（首页/核心工作流 × 1440 桌面 / 375 移动端）+ 评审指令 `judge-prompt-r1.txt`。
- 评审：独立子会话（不知哪个是我方），会话 `7acc6ae91077486a9655368d8ef958e4`。
- 评审原文：`round-01-materials/blind-review.md`（原样存档）。
- 性能实测（同一浏览器环境，公开页）：

| 匿名 | TTFB | DCL | Load | 请求数 |
|---|---:|---:|---:|---:|
| A | 8ms | 52ms | 74ms | 15 |
| B | 31ms | 137ms | 147ms | 5 |
| C | 60ms | 331ms | 754ms | 47 |

### 六维评分（每维 1-10）

| 维度 | A | B | C | 胜者 |
|---|---:|---:|---:|---|
| 视觉设计 | 5 | 9 | 8 | B |
| 信息层级 | 5 | 9 | 7 | B |
| 交互与流程 | 7 | 9 | 5* | B |
| 功能完整度 | 7 | 8 | 8* | B/C 平 |
| 性能实测 | 9 | 8 | 5 | A |
| 文案与信任感 | 6 | 9 | 7 | B |
| **合计** | **39** | **52** | **40** | **B** |

\* C 的工作流在登录墙后，按公开页证据评估（未绕过）。

## 2. 揭盲

- A = CuePrompter（cueprompter.com）
- **B = PromptCue（我方，prompter.zalize.com）**
- C = Teleprompter.com

我方总分第一（52/60），四维胜出；输掉「性能实测」（vs CuePrompter 极简静态页），「功能完整度」与 Teleprompter.com 持平（对方有录制/云端脚本，我方无录制）。

## 3. 差距分析 → 改进项

| 优先级 | 差距（评审原话要点） | 改进项 | 超越点（不是抄） |
|---|---|---|---|
| P0 | 功能：竞品有录制，我方无 | Prompter 内加摄像头+麦克风本地录制（MediaRecorder），停止即存到设备 | 竞品录制多为云端上传/付费；我方**纯本地、零上传、无水印**，与隐私定位一致 |
| P0 | 移动端编辑器裁切/双滚动 | 375px 下隐藏「Your script」标签防溢出、textarea 移动端禁 resize、min-h 调整 | — |
| P1 | 信任感可再加真实用量证明 | `/api/pulse` 公开匿名聚合（prompter_start 总数），首页 ≥500 才展示 | 真实实时计数，非编造 testimonial；无 PII |
| P1 | 性能 vs A | 保持 5 请求轻量；本轮不加重（录制代码随主 bundle，+~2KB gzip） | — |

## 4. 实现（本轮变更）

- `src/lib/recorder.ts`（新增）：`useRecorder` — getUserMedia 仅在用户点击后请求；MediaRecorder 本地录制；停止后 Blob 直接下载到设备；不上传任何媒体；权限拒绝/不支持时优雅降级。
- `src/components/Prompter.tsx`：控制栏加录制按钮（Video/VideoOff）、录制中红点提示 +「saves to your device」说明、右下角摄像头自视预览；仅埋匿名事件 `record_on`。
- `src/pages/Home.tsx`：移动端编辑器修复（标签 `max-sm:hidden`、`max-sm:resize-none`、`whitespace-nowrap`）；`/api/pulse` 社会证明行（向下取整到百位，≥500 才显示）。
- `src/lib/homeContent.ts`：FEATURES 加「Record yourself」、FAQ 加录制条目、对比表加「Camera recording (local, private)」行。
- `src/lib/track.ts`：事件类型加 `record_on`。
- `worker/index.ts`：事件白名单加 `record_on`；Permissions-Policy 允许同源 camera/microphone；新增 `GET /api/pulse`（KV 汇总 + AE 实时增量，仅返回 `{starts}`，无任何个体数据）。

## 5. 验证

- 本地：`npm run lint` 0 错误（仅 1 条既有 button.tsx fast-refresh 警告）；`npm run build`（含 tsc）通过。
- PR：[#20](https://github.com/wookat/prompter/pull/20)（已合并）+ [#21](https://github.com/wookat/prompter/pull/21)（`public/_headers` 覆盖了 worker 的 Permissions-Policy 导致线上摄像头被禁；一行修复，已合并）。
- 部署：Cloudflare Workers，Version `78f030ca`，https://prompter.zalize.com 。
- 线上复测（E2E，含录屏，见 PR #20 评论）：录制按钮→授权→红点提示+自视预览→停止即下载 .mp4（本地+线上均通过）；375px 编辑器无裁切/无双滚动；1440px 布局完好；`/api/pulse` 返回 `{"starts":61}`（<500，社会证明行正确不显示）；Permissions-Policy 线上已为 `camera=(self), microphone=(self)`。
- 遗留（非本轮回归）：dev 模式 StrictMode 下倒计时卡在 3（生产无此问题）；控制栏靠滚轮/按键/点按唤出而非鼠标移动。R2 处理。

## 6. 下一轮

R2 重新匿名盲评（含新录制功能截图），重点追性能维度与功能维度反超。
