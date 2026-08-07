# R16 自审差距与优化 Backlog — prompter 线（PromptCue）

日期：2026-08-07 · 执行：project-lead · 方法：逐页扫查 + Lighthouse/SEO/a11y/375px 实测 + 对照 `r16-competitor-advantages.md` 逐条打分

## 1. 站点清单

**页面（10 个路由，全部实测 200）**：`/`（Home）+ 8 个 use-case 页（wedding-speech / presentations / video-recording / podcast / sermon / lyrics / online-classes / interviews）+ `sitemap.xml` / `robots.txt`。

**组件（9 个）**：SiteHeader、SiteFooter（Layout.tsx）、Prompter（全屏提词器）、Home（hero/编辑器/控制面板/How-it-works/Features/Comparison/Use-cases/FAQ）、UseCase 模板、ui/button、ui/input、ui/label、ui/textarea。

## 2. 技术审计实测（2026-08-07，线上）

| 项 | 结果 |
| - | - |
| Lighthouse Performance | **0.98**（FCP 1.7s / LCP 1.7s / TBT 80ms / CLS 0.059） |
| Lighthouse Accessibility | **1.00** |
| Lighthouse Best Practices | **1.00** |
| Lighthouse SEO | **1.00** |
| 全路由状态码 | 10/10 全 200 |
| 375px 移动端 | 单列正常折叠，编辑器/控制面板可用（self-home-375*.png） |

结论：技术地基（R14/R15 成果）已达标，**主要矛盾不在性能/SEO 技术面，而在核心功能差距**。

## 3. 对照优点清单逐条打分（我们 0–5 分）

| 竞品优点（编号对应 advantages 文档） | 我们现状 | 得分 | 伤害面 |
| --- | --- | - | --- |
| 1 语音跟随滚动 | 完全没有；固定速度滚动 | **0** | 转化+留存（头部 4 家的第一卖点） |
| 2 脚本框即首屏主角 | 已具备（R14） | 5 | — |
| 3 文字颜色/黄字黑底主题 | 只有白字 | **1** | 留存（专业用户习惯） |
| 4 脚本文件导入 | 只能粘贴 | **1** | 转化（移动端长文粘贴痛） |
| 5 信任/社会证明 | 仅口号，无数字（不造假） | 2 | 转化 |
| 6 演示视频/动态预览 | 无动态演示 | 2 | 转化 |
| 7 AI 写稿入口 | 仅 footer/tip 有 SpeakEasy 链接 | 3 | 获客 |
| 8 pSEO 内链+结构化数据 | 8 页 pSEO 有；FAQ/Breadcrumb schema 缺 | 3 | 收录 |
| 9 快捷键/双屏说明 | FAQ+底部提示已有 | 4 | — |
| 10 会议悬浮场景 | interviews 页有教程雏形 | 3 | — |
| 11 提词+录像一体 | 无 | 0 | 留存（中期） |
| 12 PWA/移动引导 | 无 | 1 | 留存（中期） |

## 4. 按主要矛盾排序的 Backlog

矛盾论排序依据：哪个差距最直接伤「新访客→开始使用」转化与「用过→再来」留存。

### P0（本轮必做，直接伤转化/留存）
- **P0-1 语音跟随滚动（voice-follow）**：Web Speech API 浏览器内识别（不上传音频，契合隐私卖点）；提词器内新增 Voice 模式，文字随朗读前进，停顿即停。头部 4 家的第一卖点，我们为 0 分——最大主要矛盾。降级：不支持的浏览器隐藏入口并提示。
- **P0-2 脚本文件导入（.txt/.md）**：编辑器头部 Import 按钮，FileReader 本地读取；移动端粘贴痛点直接消除。

### P1（本轮做，成本低收益明确）
- **P1-1 文字颜色主题**（白/经典黄/薄荷）：控制面板+提词器内切换，localStorage 持久化。
- **P1-2 结构化数据补全**：首页 FAQPage JSON-LD；use-case 页 BreadcrumbList JSON-LD（build-seo.mjs 生成）。
- **P1-3 AI 写稿入口前置**：编辑器附近加 "Need a script? Try SpeakEasy" 文案（现有 footer 入口太深）。

### P2（下轮候选）
- 提词+录像一体（getUserMedia + MediaRecorder，纯前端）
- How-it-works 加 CSS 动态滚动预览
- PWA（manifest + Add to Home Screen 指引）
- 真实用户数/评价积累后再上社会证明数字（不造假）
- 遥控/双屏（BroadcastChannel 或 QR 配对）

## 5. 否定之否定

- **被否定的上一版判断**：R14「先形似——复刻头部 landing 形态 + 固定速度提词即可上线」。
- **否定依据（实践数据）**：R16 实测 11 家竞品，Teleprompter.com / Speakflow / PromptSmart / TelepromptMirror 均以语音跟随为第一卖点（截图为证）；我们 Lighthouse 四项 0.98–1.00 说明技术面已不是矛盾，功能差距才是。
- **合题（本轮方案）**：保留 R14 的 landing 骨架与隐私定位，补上 P0/P1 功能差距，上线后由使用数据（prompter_start / voice_on 埋点）再检验。

## 6. 本轮实施结果（部署后复验）

- 已实现并上线：P0-1 语音跟随（Web Speech API，浏览器内识别、不上传音频，含麦克风失败降级为定速滚动）、P0-2 本地 .txt/.md 导入（FileReader）、P1-1 文字颜色三主题（白/黄/薄荷，localStorage 持久化）、P1-2 首页 FAQPage + WebApplication JSON-LD 与 use-case 页 BreadcrumbList JSON-LD、P1-3 编辑器底部 "Need a script? Try SpeakEasy" 入口。
- 埋点新增：`voice_on`、`script_import`（worker 白名单同步）。
- 线上验证：全部 12 条路由（含 sitemap/robots/api/health）HTTP 200；首页含 FAQPage、use-case 页含 BreadcrumbList。
- Lighthouse（线上，部署后）：accessibility 1.0 / best-practices 1.0 / SEO 1.0 / performance 0.79–0.80（波动主要来自 LCP 2.4s 与首页 hero CLS，列入下轮）。
- 截图：`docs/benchmark-r16/after-home-1440.png`、`after-prompter-yellow-1440.png`、`after-home-375.png`、`after-home-375-controls.png`（对照 `self-home-*` 前置截图）。
