# R22 第 3 轮审查（性能专项）— PromptCue

日期：2026-08-14 · 审查员
方法：Lighthouse 13.4（mobile, perf preset）实测 + curl 延迟采样 ×5 + 真浏览器 rAF 帧间隔/longtask 采样 + bundle 内容分析

## 实测基线

- Lighthouse mobile（/）：**perf 0.83**；FCP 2.1s · LCP 2.1s · TBT 0ms · **CLS 0.287** · SI 2.0s
- 滚动运行时性能（3600 词长稿）：帧间隔 p50/p95/max = 16.7/16.8/16.8ms（满 60fps），longtask 0 —— 核心提词滚动性能优秀，无需改动 ✔
- API：/api/health ~70ms；/api/stats 冷 0.40s → 缓存后 ~0.10s（第 1 轮修复生效）✔；/api/track 0.32-0.43s（客户端 fire-and-forget，不阻塞 UI）
- 资产：JS 314KB（gzip ~103KB）+ CSS 7.9KB；og.png 37KB ✔

## 发现清单

### C1【P1·性能】带 hash 的静态资产没有长缓存：每次回访重新下载全部 JS/CSS
实测：`curl -I /assets/index-D9AaJ6YQ.js` → `cache-control: public, max-age=0, must-revalidate`。文件名已含内容 hash（改动即换名），却强制每次 revalidate；回访/多页浏览都要重复 304 往返甚至重传 ~110KB。
建议：`public/_headers` 增加 `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`（第 2 轮 A9 已建立 _headers 机制，顺手即可）。HTML 保持 must-revalidate 正确。思辨：Workers 静态资产默认策略偏保守，hash 命名正是为 immutable 设计的，这是标准做法无争议。

### C2【P1·性能】首页是空 SPA 壳 + 阻塞的 Google Fonts：FCP/LCP 2.1s、CLS 0.287 全由此而来
实测：`/` 的 HTML 4.6KB，不含任何正文（grep "Read your script" = 0）；无 `preconnect` 到 fonts.googleapis.com；Lighthouse render-blocking：fonts CSS 浪费 ~1348ms、主 CSS ~722ms；CLS 唯一来源是编辑器区块 `div.mt-10` 挂载时的整段位移。
讽刺点：`scripts/build-seo.mjs` 已经会为 8 个 pSEO 页预渲染静态 HTML，唯独首页（流量最大页）是空壳。
建议（按性价比排序）：① `index.html` 加 `<link rel="preconnect" href="https://fonts.googleapis.com">` + `fonts.gstatic.com`（一行，立收几百 ms）；② 把 fonts CSS 改为非阻塞加载（media=print onload 或自托管 woff2）；③ 用 build-seo.mjs 同样机制预渲染首页 hero+编辑器骨架，消除 CLS 与白屏。思辨：是否上 SSR 框架？否——现有构建期静态化已够用，勿增实体。

### C3【P2·性能】8 个 pSEO 页的全部文案打进主 bundle，首页访客也要下载
实测：主 bundle 中检出 wedding/podcast/sermon 等 pSEO 文案；Lighthouse unused-javascript 估 46KiB。`useCases.ts` 的长文案 + UseCase 页组件与首页同 chunk。
建议：`React.lazy(() => import('@/pages/UseCase'))` 路由级分包，文案随组件走。收益中等，改动小、风险低。

### C4【P2·观察】track 写入 0.3-0.4s 源于 KV get→put 两次往返（与 A5 竞态同根）
不影响用户（keepalive fire-and-forget），单独不值得修；建议与 A5 一起处理：迁移到 Durable Object counter 或接受近似计数并在代码注释声明（A5 第 1 轮已挂账）。避免为它单开工程。

## 修复优先级建议

本轮修：C1、C2（至少 ①②）· 建议带上：C3、遗留 B5 · 下轮或挂账：C2③、C4/A5、A10、A11

---

## Verdict（线上复验 2026-08-14，bundle index-TOgINB0e.js）

- **C1: PASS** — `/assets/index-TOgINB0e.js` 返回 `cache-control: public, max-age=31536000, immutable`。
- **C2①②: PASS** — 首页与 pSEO 页均含 fonts preconnect ×2 + `media="print"` 非阻塞字体加载，阻塞 @import 已移除。复测 Lighthouse mobile：FCP 2.1→2.0s，perf 仍 0.83 —— 剩余瓶颈即挂账的 C2③（SPA 空壳 + CLS 0.287），符合预期，下轮跟踪。
- **C3: PASS** — 主 bundle 99.7KB gzip（原 103KB），grep 无 pSEO 长文案；/teleprompter-for-podcast 按需加载独立 chunk 且正常渲染。
- **B5: PASS** — 超长首行在完整词边界截断并加「…」（实测标题 'alpha … india…'）。
- C4：按共识与 A5 合并挂账，不判分。

结论：4/4 PASS。挂账：C2③（首页预渲染/CLS）、A5+C4、A10、A11。
