# R22 第 7 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/14（已合并）· 分支 `devin/1786680365-r22-round7`（commit a3550ef）· 已部署上线（bundle `index-BCMEuMVU.js`）

## 逐项响应

### G1 + G6 KV 计数器竞态与串行往返 — 已修（采纳方案 2 + 补强）
- `/api/track` 改为写一条 Analytics Engine 原子数据点（`AE.writeDataPoint({blobs:[event, slug], indexes:[event]})`），非阻塞：无 read-modify-write 竞态、无响应内 KV 往返。实测生产 track 延迟从 0.3-0.4s 降到 **27ms/0.09s**。
- 审查员方案 2 有一个未提及的缺口：**AE 只保留 ~90 天**，all-time 总数会随时间流失。补强：每日 cron（`17 3 * * *`）把 AE 计数折算进现有 KV `count:*:total`（单写者，无竞态）；`/api/stats` = KV 总数 + 上次 rollup 以来的 AE 计数。历史 KV 数据无缝保留（实测 script_import 4→5、page_view 113→114）。
- G6 随之消解：usecase 的 `list + N get` 只剩 60s 缓存后的冷路径，且不再增长（新数据全在 AE）。
- 删代码：不再写 `count:event:YYYY-MM-DD` 日键（AE 原生带时间序列）。
- 配置：AE dataset `prompter_events`、`ACCOUNT_ID` var、`AE_SQL_TOKEN` secret（已 `wrangler secret put`）。**注意**：当前 secret 复用了现有 DNS token（所有可用 token 都能查 AE SQL，选了权限面最小的一个）；建议老板后续在 dash 创建仅 “Account Analytics: Read” 的专用 token 替换。

### G2 三份 CJK 定义 — 已修
- `store.ts` 导出唯一 `CJK_CHAR`（含假名/扩展A/兼容表意/半角片假名），Segmenter 回退分支与 `voice.ts` 的 `tokenizeSpeech` 均改引用它。实测日文样本 "こんにちは、世界。これはテストです。" 计数 15 words（旧窄 regex 为 7）。

### G3 Home.tsx 数据与逻辑耦合 — 已修（仅做数据外置，如审查员建议）
- SAMPLE/FAQ/FEATURES/STEPS/COMPARISON（~110 行纯数据）抽到 `src/lib/homeContent.ts`，与 `lib/useCases.ts` 同一模式，消除“同仓库两种做法”。未拆 Editor 组件（审查员标注可选，741→626 行后单文件仍可维护，避免为拆而拆）。
- 连带：数据外置后 React Compiler purity lint 开始分析 `saveScript` 并标错 `Date.now()`；把纯列表构建逻辑移到 `store.ts` 的 `upsertScript(scripts, text)`（行为不变：首行标题/词边界截断/内容去重/上限 50），Home 只剩存储+反馈，内聚性反而更好。

### G4 deleteScript 忽略返回值 — 已修
- 与 saveScript 契约一致：失败显示红条 “Couldn't delete — device storage is unavailable.”，列表不变；恢复后删除正常。实测通过（QuotaExceededError 桩）。

### G5 wheel deltaMode — 已修
- `e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY`。实测合成事件 deltaMode:1/deltaY:3 位移 120px（×40），deltaMode:0 为 3px。

## 主动否决的方案
- 方案 1（waitUntil 包 KV put）：只治延迟不治竞态，弃用。
- Durable Objects 计数器：原子但为 8 个匿名计数器引入新实体+迁移，AE 是平台专为此场景的现成能力，更符合「不造轮子」。
- 拆分 Editor 组件：本轮不做（见 G3）。

## 本地验证与部署
- `npm run lint` 0 errors（仅存量 ui/button.tsx warning）、`npm run build` 全绿。
- `npm run deploy` 上传成功；zone route 更新仍报 code 10000（token 权限遗留项，不影响服务，custom domain 正常出新 bundle）。

## 真实浏览器 E2E（生产环境，全程录屏）
G1/G2/G3/G4/G5 全部 PASS + golden path/save/mirror pill 回归 PASS，无 console 错误。证据见 PR #14 评论。

## 新发现（列入下轮）
- 静态 404 页 CTA 仍是 "Open the free teleprompter"——硬编码在 `scripts/build-seo.mjs:134`，第 6 轮文案统一漏网。下轮顺手修。

## 遗留跟踪
- C2③（首页预渲染/CLS）：同意审查员建议，与第 8 轮 SEO 专项合并处理。
- cron rollup 首跑在明日 03:17 UTC，届时 `ae:rollup_ts` 写入即为验证；逻辑已 code-review + stats 路径同函数实测。
