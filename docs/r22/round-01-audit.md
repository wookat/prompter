# R22 第 1 轮审查（全局体检）— PromptCue

日期：2026-08-14 · 审查员（UX + QA + 架构三合一）
方法：线上真浏览器走查（1440×900 / 375×667，截图见 docs/r22/shots/r1-*.png）+ API curl 实测 + 全量源码阅读（src/ 1898 行 + worker/）

## 实测基线

- 全路由 200：`/`、8 个 pSEO 页、sitemap/robots、/api/health；404 页有 noindex + 独立 title ✔
- /api/track 白名单校验正确（未知事件 400）✔；/api/stats 返回真实计数 ✔
- 首页 TTFB ~150ms；/api/stats ~850ms
- 视觉整体：1440 与 375 均无溢出/错位，排版一致性良好；pSEO 页结构清晰

## 发现清单

### A1【P1·功能】点「Start teleprompter」后并不开始滚动，还要再按一次空格
复现：首页点 Start → 全屏后显示「Tap or press Space to start」，倒计时并未触发（截图 r1-prompter-countdown.png，点击后 0.5s 与 4.5s 均静止）。
问题：按钮文案是 Start，README/FAQ 也承诺「press Start and the text scrolls」，实际是「Start → 再 tap/space → 倒计时 → 滚动」，多一步无意义确认，是首次使用的转化断点；倒计时功能（settings.countdown 默认 3s）本身就是为「准备时间」设计的，再加一步确认属重复实体。
建议：打开提词器即自动走倒计时→滚动（Prompter mount 时调用 startPlaying）。思辨：是否有用户想先预览再开始？有——但暂停/seek 能力已覆盖该需求，自动开始 + 3s 倒计时是更优默认。

### A2【P2·功能】倒计时无法取消
代码：`togglePlay` 在 `countdown !== null` 时直接 return（Prompter.tsx:124）。倒计时一旦开始，tap/空格均无响应，只能等它数完或 Esc 退出全屏。建议：倒计时中 tap/空格 = 取消倒计时回到暂停态。

### A3【P1·视觉】暂停提示气泡与正文重叠，可读性差
截图 r1-prompter-scrolling.png / countdown.png：「Tap or press Space to start」气泡（bottom-22vh）恰好压在首屏正文「…read out loud.」上，黑底半透明+小字号，两层文字互相干扰。375 下同样重叠（r1-prompter-375.png）。建议：提高气泡不透明度/加边框，或移到 25vh 视线引导线附近的空白区。

### A4【P2·逻辑】语速校准把 80vh 尾部 padding 计入滚动距离，实际 wpm 低于标称
代码：Prompter.tsx:225-231 `pps = max/baseSecs*pace`，而 `max = scrollHeight - 25vh`，scrollHeight 含 paddingTop 25vh + paddingBottom 80vh，即滚动距离 = 正文高度 + 80vh。稿件越短误差越大（如 40s 稿在 900px 屏上实际慢 ~15-20%）。建议：用正文净高（scrollHeight - paddingTop - paddingBottom + 视窗留量）做校准分母，与「≈140 wpm」标称自洽。

### A5【P2·架构】/api/track KV 读-改-写竞态，计数会丢
worker/index.ts:29-34：`get → +1 → put` 非原子，并发请求互相覆盖（KV 本身最终一致，同 key 1 写/秒限制）。当前量级（page_view 52）无感，但这是「计数器」实体选错了存储原语。思辨：是否值得上 Durable Objects？现阶段不值——建议轻量方案：每请求写一条唯一 key（`hit:{event}:{ts}:{rand}`，带 TTL），stats 侧聚合，或直接接受误差并在代码注释里写明权衡；不必为此增加实体。

### A6【P2·性能】/api/stats 串行 7 次 KV 读，~850ms
worker/index.ts:38-44 for-of 逐个 await。建议 `Promise.all` 并行，顺手加 `cache-control`（内部统计页可 60s）。

### A7【P2·SEO】og:image / twitter:image 缺失
首页与 pSEO 页均只有 `twitter:card summary` 无图，社交分享无视觉卡片。建议：加一张静态 1200×630 OG 图（构建期生成一次即可，8 页可共用带 use-case 标题的变体或先共用一张）。

### A8【P2·架构】8 个 pSEO 页零埋点，获客漏斗盲区
track('page_view') 只在 Home 挂载时发（Home.tsx:180-182），UseCase.tsx 不发任何事件。pSEO 页是主要获客入口，却无法知道各页流量与「pSEO→首页→Start」转化。建议：加 `usecase_view` 事件（或 page_view 带 path 维度，注意保持无 PII）。

### A9【P2·安全】安全响应头缺失
线上响应无 HSTS、X-Frame-Options/frame-ancestors、X-Content-Type-Options。纯静态+匿名计数风险低，但 clickjacking（iframe 嵌套盗流量+诱导操作）无成本可防。建议 worker 统一加：HSTS、`X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、精简 CSP。

### A10【P2·逻辑】CJK 估时与 wpm 标称沿用 140，偏离中文实际语速
store.ts:116-125 中文按字符计数后仍用 BASE_WPM=140（词/分）估时。中文口播常速 ~200-260 字/分，中文稿估时偏长 ~40%+，连带 A4 的校准滚速也偏慢。建议：countWords 返回 {cjk, latin}，估时用混合速率（如 cjk/220 + latin/140）。

### A11【P2·视觉】镜像状态跨会话静默持久化
settings.mirrorX 存 localStorage，上次开过镜像的用户下次打开提词器直接是反字（本轮 375 截图即复现此状态）。首页虽有 Mirror 按钮高亮，但全屏后无任何「镜像已开」提示。建议：进入提词器时若镜像开启，短暂显示「Mirror on — press M」toast。

## 总体思辨

核心链路「粘贴→Start→读完」在桌面与移动端都能走通，R20 的语速校准方向正确，但 A1+A2+A3 组合意味着「按下 Start 之后」这一最关键时刻的体验仍有摩擦——这轮应优先把开始时刻做顺。架构上前端单体（Home 678 行）目前可接受，不建议为拆而拆；worker 侧计数器实体（A5/A6）值得一次性理顺但不必引入新存储。

## 修复优先级建议

P1：A1、A3 · 本轮一并修：A2、A4、A6、A8 · 可下轮：A5、A7、A9、A10、A11
