# R22 第 5 轮审查（错误路径与边界专项）— PromptCue

日期：2026-08-14 · 审查员
方法：API curl 边界打点（非法 JSON/未知事件/2MB body/错误方法/CORS/超长 slug）+ 真浏览器边界走查（空白稿/200k 词/emoji+RTL/倒计时 0/存储配额）+ store.ts 错误处理代码审查

## 本轮验证通过的基线（不列为问题）

- /api/track：非法 JSON、未知事件均 400；未知 slug 不落 KV 键；POST /api/stats 405 ✔
- 无 CORS 头 → 跨域读取默认被浏览器拦截 ✔
- 纯空白稿 Start/Save 禁用 ✔；countdown=0 立即开滚 ✔
- RTL/emoji/希伯来文渲染正常（截图 r5-rtl.png）✔；localStorage 异常全部有 try/catch 不崩 ✔

## 发现清单

### E1【P2·逻辑】存储写入失败时仍显示「✓ Saved」：假成功
代码：`saveScripts`/`saveCurrentText` catch 后静默忽略（store.ts），而 Home 的保存按钮无条件进入 Saved 态。私密模式/配额满时用户以为已保存，实际丢稿——与「Autosaved locally」的承诺矛盾，属于隐性数据丢失。
建议：`saveScripts` 返回 boolean；失败时按钮显示「Couldn't save — storage full/unavailable」（复用第 2 轮导入错误条样式）。思辨：要不要迁移 IndexedDB 加容量？不必——先把失败显性化，容量问题等真实用户反馈再说。

### E2【P2·逻辑】非拉丁非 CJK 文字的字数≈0：估时与滚速全错
实测：含 ~10 个阿拉伯语/希伯来语词的句子显示「3 words · ≈1s」。`countWords` 只匹配 `[A-Za-z0-9''-]+` 与 CJK 区间，阿拉伯语、西里尔、希伯来、泰语等全部数不到，导致估时、语速显示、滚动校准（baseSecs）三处失真。这是 A10（CJK 挂账）的更普遍形态。
建议：用 `Intl.Segmenter(undefined, {granularity:'word'})`（Baseline 全支持，零依赖）统计 isWordLike 段数，老浏览器回退现有 regex；CJK 语速基线可同时按 260 字/分修正（一并结掉 A10）。思辨：接分词库？否——平台原生 API 已够。

### E3【P2·性能·边界】200k 词极端稿从点击 Start 到可见渲染阻塞数秒且无任何反馈
实测：200k 词（≈1.2MB 文本）点击 Start 后主线程渲染阻塞、约 5-9s 后才出现提词界面，期间无 loading 反馈，用户会重复点击。营销文案承诺「No word limit」。
建议：Start 点击后立即切入带倒计时的黑屏（文本渲染放到 requestIdleCallback/下一帧），或超过阈值（如 50k 词）显示「Preparing your script…」。思辨：虚拟化长文本渲染？收益仅覆盖极端场景，先做感知优化即可，虚拟化列为可选优化不强求。

### E4【P2·文案·轻】超长估时显示「≈ 1428 min 34s」
90 分钟以上应换算小时（≈ 23h 49m）。一行格式化函数。

## 遗留跟踪

C2③（首页预渲染/CLS）、A5+C4（KV 竞态）、A11（镜像提示）；A10 若采纳 E2 方案可一并关闭。

## 修复优先级建议

本轮修：E1、E2（含 A10）· 顺手：E4 · 论证后做：E3（感知优化即可）
