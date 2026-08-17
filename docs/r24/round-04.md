# R24 Round 4 — 最终盲评 + 四轮对比总结

日期：2026-08-16/17 · 分支基线：`r24-loop` · 线上：https://prompter.zalize.com

## 1. 匿名盲评设置

- 竞品：Speakflow（www.speakflow.com）、CuePrompter（cueprompter.com）。
- 全部截图重新采集（1440×900 桌面 + 375×812 移动），logo/域名/品牌字样遮蔽，标签重新随机：**A = Speakflow，B = CuePrompter，C = PromptCue（我方）**。
- 证据：各产品首页（双端）+ 核心工作流（B/C 实拍工作流；A 因登录墙使用公开 guide 页替代，未绕过）+ C 的功能区块与录制态。共 16 张，见 `round-04-materials/`。
- 性能同环境同日实测（`perf.py`，首页冷加载）。
- 评审：独立子会话（https://app.devin.ai/sessions/a0aab2271e9c4917b5503f6c0fa1f956 ），不知道任何身份映射，prompt 见 `round-04-materials/judge-prompt-r4.txt`，评审原文 `round-04-materials/blind-review.md`。

## 2. 性能实测（揭盲前提供给评审）

| 匿名 | 产品 | TTFB | DCL | Load | 请求数 |
|---|---|---:|---:|---:|---:|
| A | Speakflow | 279ms | 894ms | 4108ms | 113 |
| B | CuePrompter | 2ms | 73ms | 153ms | 23 |
| C | **PromptCue** | 34ms | 136ms | 144ms | 7 |

## 3. 盲评结果（揭盲后）

| 维度 | Speakflow (A) | CuePrompter (B) | **PromptCue (C)** | 本维胜者 |
|---|---:|---:|---:|---|
| 视觉设计 | 8 | 5 | **8.5** | PromptCue |
| 信息层级 | 7.5 | 5.5 | **9** | PromptCue |
| 交互与流程顺滑度 | 6.5 | 7 | **9** | PromptCue |
| 功能完整度 | **8.5** | 6 | 8 | Speakflow（宣传口径，证据受限） |
| 性能实测 | 3 | 8.5 | **9.5** | PromptCue |
| 文案与信任感 | 7.5 | 6 | **8.5** | PromptCue |
| **合计（60）** | 41 | 38 | **52.5** | **PromptCue** |

评审注明：A 核心流程在登录墙后未实证，其交互/功能两维置信度低；「若只计实证功能，则 C 胜」功能维。

## 4. 差距分析 → 改进项

- **功能完整度（唯一输掉，8 vs 8.5）**：输给 Speakflow 的宣传功能面（语音跟随滚动、远程遥控）。其中语音跟随我方已实装（Voice follow，线上有 "listening" 实证 pill）——本轮盲评证据未演示导致被低估，属证据缺口而非产品缺口，已在本台账注明并在线上复测中补充实证截图。远程遥控为真实差距，超出本轮小批量范围，列为遗留（见 §8）。
- **文案与信任感扣分点（P1，已修）**：评审指出「"Free forever" 缺乏商业模式解释，长期可持续性存疑」。新增 FAQ「How can it stay free forever?」解释本地优先架构近零成本 + 无广告不卖数据。

## 5. 实现与验证

- PR **#27**（feature branch → `r24-loop`，已合并）：homeContent.ts 新增一条 FAQ。本地 `npm run lint` + `npm run build` 全绿。
- 部署：`r24-loop` → `npm run deploy`，版本 **7126e874-d6af-4599-a245-3a2bb3277f76**。

## 6. 线上复测（testing agent，硬刷新确认新 bundle）

全部通过，录屏 + 截图存 `round-04-materials/live/`：

- 1440px / 375px 新 FAQ 条目渲染、可展开、无横向溢出（375 无破版）。
- 核心流程回归：脚本 → Start → 倒计时 → 滚动 → tap 暂停/恢复 → 速度 233→257wpm / 字号 48→52px / Mirror H → Esc 退出。
- Voice follow 实证：mic 开启后出现 "Voice follow — listening (audio stays in your browser)" pill（fake media）。
- 性能：10 请求 / 209KB，Prompter 懒加载 chunk（6.6KB）完好，无回归。

## 7. 四轮比分曲线（PromptCue 总分，60 满分）

| 轮 | PromptCue | 竞品阵容（得分） | 我方输掉的维度 |
|---|---:|---|---|
| R1 | 52 | Teleprompter.com、CuePrompter | 性能（vs CuePrompter）、功能并列 |
| R2 | 53 | Speakflow (46)、CuePrompter (37) | 视觉设计（vs Speakflow） |
| R3 | 54 | Speakflow (38)、CuePrompter (38) | 无（性能与 CuePrompter 并列） |
| R4 | 52.5 | Speakflow (41)、CuePrompter (38) | 功能完整度（vs Speakflow 宣传口径） |

注：每轮为不同的独立评审，绝对分不跨轮直接可比；每轮内相对排名一致——**PromptCue 四轮总分全部第一**。R2 输掉的视觉在 R3/R4 反超；R1 输掉的性能自 R3 起持平/领先。

## 8. 剩余差距与理由

1. **远程遥控 / 跨设备控制**（Speakflow 宣传功能）：需要配对信令通道，与「零账号、脚本不出设备」的隐私定位有张力，且 Speakflow 该功能未实证；未在 4 轮内实现。
2. **桌面 App / 录制叠层（Overlay）**：Speakflow 有桌面下载版；我方定位纯浏览器免安装，属定位差异而非欠账。
3. **主体背书**（定价页/公司信息）：免费产品无定价页；本轮已用 FAQ 解释可持续性缓解。
4. 未测项：真实摄像头拒绝授权路径（fake media 自动授权无法覆盖）、真实语音识别准确度（fake media 无真实语音）。

## 9. 材料清单

`round-04-materials/`：16 张匿名截图、`judge-prompt-r4.txt`、`blind-review.md`（评审原文）、`live/`（线上复测截图）。录屏由会话附件交付。
