# R22 第 5 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/12（已合并）· 分支 `devin/1786677053-r22-round5`（commit 531eea6）· 已部署上线（bundle `index-YEuYiHML.js`）

## 逐项响应

### E1 存储写入失败假成功 — 已修
- `store.ts` 的 `saveScripts` 改为返回 `boolean`（catch 时返回 false），不新增任何状态实体。
- `Home.tsx` 的 `saveScript` 在写入失败时不进入 Saved 态、不更新内存列表，改为显示红色错误条 “Couldn't save — device storage is full or unavailable.”，复用第 2 轮导入错误条（`importError` 状态改名为 `editorError`，同一渲染路径同一样式）。
- 主动否决：IndexedDB 迁移（如无必要勿增实体，先把失败显性化）；也否决了给自动保存 `saveCurrentText` 弹条——每次击键都可能触发，噪音大于价值，保持静默降级，用户主动点 Save 时才需要明确反馈。

### E2 非拉丁非 CJK 计数≈0（含 A10）— 已修
- 新增私有 `countUnits(text)`：用 `Intl.Segmenter(undefined,{granularity:'word'})` 统计——非 CJK 的 isWordLike 段计词，CJK（含日文假名/扩展区）按字符计；老浏览器回退原 regex。Segmenter 实例惰性创建并缓存。
- `estimateSeconds = words/140wpm + cjkChars/260cpm`（新增 `CJK_CPM = 260`，一并结掉 A10）。
- `Prompter` 滚速校准从 `countWords/BASE_WPM` 改为直接用 `estimateSeconds(text)`，估时显示与滚速共用同一函数，混合文种也一致。
- 主动否决：引入分词库（平台原生 API 已够，零依赖）。

### E3 200k 词稿 Start 后数秒白屏无反馈 — 已修（感知优化路线）
- `Prompter` 新增 `ready` 态：`text.length >= 100_000` 时首帧只渲染黑底脉动 “Preparing your script…” 覆盖层，双 rAF 后再 tokenize+渲染段落并自动开始（倒计时→滚动）。tokenizeScript 也延后到 ready，避免阻塞首帧。
- 短稿 `ready` 初始即 true，路径零变化、无 Preparing 闪现。
- 主动否决：文本虚拟化（收益只覆盖极端场景，复杂度不成比例；若未来出现真实用户长稿卡顿再论证）。

### E4 超长估时格式 — 已修
- `formatDuration` 超过 60 分钟换算为 “23h 48m” 格式，一行改动。

## 本地验证
- `npm run lint`：0 errors（仅存量 `ui/button.tsx` react-refresh warning）。
- `npm run build`（tsc + vite + build-seo）：全绿。

## 部署与线上验证
- `npm run deploy` 上传成功；zone route 更新仍报 Cloudflare Authentication error [code:10000]（token 缺 zone workers/routes 权限，遗留已知项，不影响 custom domain 服务新 bundle）。
- 线上确认：首页引用 `assets/index-YEuYiHML.js`，bundle 内含 `Preparing your script` 与 `Segmenter`。

## 真实浏览器 E2E（生产环境，全程录屏）
全部 PASS，证据（截图+说明）见 PR #12 评论：
- E1 存储满→红条无 Saved、列表不新增；恢复后正常 ✓ Saved。
- E2 阿语 10 词句 “10 words · ≈4s”（旧 3 words·≈1s）；250 汉字 “250 words · ≈58s”；英文 94 词不变；speed 6 实测滚完 40.05s vs 估时 ≈40s。
- E3 20 万词注入→Start 立即出 Preparing→倒计时→滚动；短稿无闪现。
- E4 “≈ 23h 48m spoken”。
- 回归：暂停/恢复/结束、wake lock 获取/释放/重获、二进制导入拒绝与正常导入，均无回归，无 console 错误。

## 遗留跟踪
C2③（首页预渲染/CLS）、A5+C4（KV 竞态）、A11（镜像提示）继续挂账；A10 已随 E2 关闭。
