# R22 第 8 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/15（已合并）· 分支 `devin/1786682510-r22-round8`（commit 400adb7）· 已部署上线（bundle `index-CM-fgx2D.js`）

## 逐项响应

### H1 首页预渲染正文 0 字节 / CLS 0.287（C2③）— 已修（采纳审查员方案，但做法更系统）
- 未走「build-seo 里手写字符串模板」路线：那会让首页 HTML 和 Home.tsx 各存一份、必然漂移（第 6 轮 404 文案漂移就是前车之鉴）。改为新增 `scripts/prerender.tsx`（约 20 行）：build 期用 **React 官方 `renderToString` 渲染真实页面组件**（`MemoryRouter` + Home/UseCase），esbuild 打包为 Node 可执行（`--packages=external`），build-seo 调用后注入 `dist/client/index.html` 的 `#root`。单一事实来源，零文案复制。
- 顺带把 8 个 pSEO 页也从 `<noscript>` 摘要升级为全量预渲染正文（同一管线，消除「同站两种做法」）。
- store.ts 的 loader 本就 try/catch 安全可在 Node 跑；补一个 `window`/`webkitSpeechRecognition` 桩使预渲染标记与 Chrome 客户端渲染一致（含 Voice 按钮），React mount 重渲染为视觉无操作。
- 未加骨架占位：预渲染即真实内容，无需占位实体。
- 实测：首页预渲染正文 **1161 词**（原 0）；生产实测 **CLS = 0.0000**（原 0.287，观测器经合成位移校验有效）；接管无闪烁，console 无 hydration/React 错误；回访用户 localStorage 状态（已存文本/列表）mount 后正确接管、无样本残留。
- 思辨（同意审查员）：不上 SSR/Astro/Next——内容纯静态，React 自带的 build 期 renderToString 已是「用平台现成能力」，为一页迁框架属无必要增实体。

### H2 pSEO 薄内容 — 已修（按建议做 2 页试点）
- `UseCase` 增加可选 `sections`（h2+段落）与页内 `faq`；wedding-speech、video-recording 各扩 2 个 guide sections + 3 条 FAQ（预渲染正文 ~750 词/页，内容为场景专属：婚礼 3-5 分钟/400-700 词/110-130wpm/倒计时 5s+；视频 10° 镜头轴/小字号窄窗/beam-splitter 镜像/R 重拍工作流），FAQPage JSON-LD 仅在定义了 faq 的页面输出。
- 其余 6 页留待下轮按同一数据结构逐页扩充（纯 useCases.ts 数据，无架构改动）。

### H3 静态 404 旧 CTA — 已修
- `CTA_START_FREE` 常量入 `useCaseLinks.ts`，Home CTA band、UseCase 页、静态 404 三处共用；实测 404 页已显示新文案。

### H4 sitemap lastmod 恒为部署日 — 已修
- `lastmodOf(...files)` 取各页内容源文件（Home.tsx/homeContent.ts；useCases/useCaseLinks/UseCase.tsx）`git log -1 --format=%cs` 的最大值。本次因内容源今日刚提交仍显示 2026-08-14，属正确行为；后续无关部署不会再刷新。

## 主动否决的方案
- build-seo 手写首页 HTML 字符串：双份文案必漂移，否决（见 H1）。
- hydrateRoot 真水合：回访用户 localStorage 状态与预渲染必不一致，会产生 hydration mismatch 警告与整树重建，收益为零，维持 createRoot。
- SSR 框架迁移：否决（见 H1 思辨）。

## 本地验证与部署
- lint 0 errors（仅存量 button.tsx warning）、tsc+build 全绿；vite preview 实测预渲染生效。
- 部署上传成功；zone route 更新仍报既有 token 权限 code 10000（不影响服务，生产已验证出新 bundle）。

## 真实浏览器 E2E（生产环境，全程录屏）
H1（CLS=0、无闪烁、console 干净、回访状态接管）/H2（两页 sections+FAQ、375px 无破版、podcast 无 sections 回归）/H3 全部 PASS；golden path 与保存/删除回归 PASS。H4 由 curl 验证。证据见 PR #15 评论。

## 遗留跟踪
- H2 其余 6 个 pSEO 页逐页扩充 300+ 词（数据结构已就绪）。
- C2③ 正式关闭（待审查员复验 verdict）。
