# R22 第 3 轮 fix 报告 — PromptCue（性能专项）

- 代码分支：`devin/1786673755-r22-round3`
- PR：https://github.com/wookat/prompter/pull/10（base=main；平台拦截自动合并，留待老板，部署已从该分支执行）
- 部署：`npm run deploy` 成功上传 Worker + assets；wrangler 更新 zone route 仍报 Authentication error [code: 10000]（token 缺 routes 权限，custom domain 不受影响，线上已验证新 bundle 生效）
- 线上验证时间：2026-08-14 02:2x UTC

## 逐项响应

### C1（P1 性能）hash 资产缺少 immutable 长缓存 — 已修
- 修法：`public/_headers` 追加
  ```
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```
- 理由：Vite 产物文件名含 content hash，内容变化必然换名，永久缓存是业界标准做法；HTML 入口保持 revalidation 不变。
- 线上实测：`curl -I /assets/index-TOgINB0e.js` → `cache-control: public, max-age=31536000, immutable`。

### C2（P1 性能）字体阻塞渲染 + 首屏空壳 — ①② 已修，③ 挂账
- ①② 修法：
  - 删除 `src/index.css` 首行的阻塞式 `@import url(fonts.googleapis.com/...)`（Lighthouse 归因约 1348ms）。
  - `index.html` 与 pSEO 页模板（`scripts/build-seo.mjs`）统一加入 `preconnect`（googleapis + gstatic）与非阻塞加载：`<link rel="stylesheet" media="print" onload="this.media='all'">` + `<noscript>` 回退。首屏立即用系统回退字体渲染，`display=swap` 完成换字。
- 主动否决：自托管字体（新增 woff2 资产与 @font-face 维护成本，Google Fonts CDN + preconnect 已可消除阻塞路径，如无必要勿增实体）；SSR/预渲染首页（C2③，改动面大，属架构级变更，单独论证后再做）。
- 线上实测：`/` 与 `/teleprompter-for-wedding-speech` HTML 均含 preconnect 与 `media="print"` 非阻塞字体链接。

### C3（P2 性能）pSEO 长文案打进主 bundle — 已修
- 修法（一次治本，不打补丁）：
  - 新增轻量 `src/lib/useCaseLinks.ts`（slug/path/name/blurb，导航与首页卡片所需的全部数据）。
  - `useCases.ts` 保留长文案（`CONTENT`），与 links 按 slug 合并导出 `USE_CASES`，仍是单一事实源；构建脚本 `build-seo.mjs` 继续从它取数。
  - `App.tsx` 路由改 `lazy(() => import('@/pages/UseCase'))`，`Home`/`Layout` 只依赖 links。
  - `build-seo.mjs` 明确选 `index-*.js`/`index-*.css`（现在有多个 chunk）。
- 结果：主 bundle 305.9KB（原 ~314KB），pSEO 文案全部进入独立 `UseCase-*.js`（10.6KB，gzip 4.3KB）按需加载；grep 验证主 bundle 不再含长文案。
- 首页卡片原来显示 `intro` 前 3 行，现改为每个 use case 一句 `blurb`（轻量、更适合卡片摘要）。

### B5（P2 遗留）标题 60 字符硬截断 — 已修
- 修法：首行 ≤60 字符原样使用；超长时回退到最后一个完整单词边界截断并加 `…`（单个超长 token 无空格时回退 59 字符硬切 + `…`）。
- 主动否决：可配置标题长度、按语言分词——过度设计。

## 挂账项（下轮或单独论证）
- C2③ 首页预渲染/CLS 0.287：属架构级（需构建期渲染或静态骨架），本轮不冒进。
- C4/A5（KV get→put 竞态）、A10（CJK 语速）、A11（镜像提示）：按审计原文继续挂账。

## 本地验证
- `npm run lint`：0 errors（1 个既有 warning：`ui/button.tsx react-refresh/only-export-components`，非本轮引入）。
- `npm run build`（tsc -b + vite build + build-seo）：全绿；8 个 pSEO 页 + sitemap/robots 正常生成，引用正确的 entry chunk。

## 线上验证
- `/` 引用新 bundle `assets/index-TOgINB0e.js`；hash 资产返回 immutable 长缓存头。
- 主 bundle 无 pSEO 长文案；use-case 页按需加载独立 chunk。
- 首页与 pSEO 页均含字体 preconnect 与非阻塞加载。
- E2E 回归（真实浏览器）证据将追加在 PR #10 评论。
