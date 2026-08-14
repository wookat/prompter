# R22 第 7 轮审查（代码架构与耦合专项）— PromptCue

日期：2026-08-14 · 审查员
方法：通读 origin/main 全部源码（src 2.1k 行 + worker 90 行）+ 结合前 6 轮实测数据做架构思辨。本轮以代码审查为主，发现均标注文件:行号（基于 main@a1d5e7a）。

## 总体评价（先说好的）

- 体量克制：全站 ~2.2k 行、依赖极少，符合「如无必要勿增实体」✔
- 分层清晰：store（持久化+估时）/ voice（识别+分词）/ track（埋点）/ Prompter（渲染引擎）职责分明 ✔
- rAF 滚动引擎用 ref 而非 state 驱动，避免每帧 re-render，前几轮实测 60fps 零长任务，是正确设计 ✔

## 发现清单

### G1【P1·架构】KV 计数器 read→increment→put 竞态 + 每请求 2~3 次串行往返（承接 A5+C4，正式立项）
`worker/index.ts:53-58`：并发 track 请求各自 get 旧值再 put，互相覆盖导致少计；且 KV 是最终一致存储，本就不适合做计数器。实测 track 延迟 0.3-0.4s（客户端 fire-and-forget，不伤 UX，但少计伤数据可信度）。
更好的设计（按简单度排序）：
1. 最小改：`c.executionCtx.waitUntil(...)` 包住 put，先响应后写，延迟归零；竞态仍在但明示「计数为近似值」。
2. 正解：迁移 Cloudflare Analytics Engine（`writeDataPoint` 原子、免费额度足够、专为此场景设计，符合「用平台现成能力不造轮子」）；/api/stats 改查 AE SQL API。KV 只留历史数据。
建议采纳 2；工作量约半天。

### G2【P2·逻辑/重复实体】「什么是 CJK」有三份不一致的定义
- `src/lib/store.ts:130-131` CJK_CHAR 含日文假名/兼容表意/半角片假名（用于估时）✔
- `src/lib/store.ts:164-166` Segmenter 回退分支只认 \u4e00-\u9fff
- `src/lib/voice.ts:60-62` tokenizeSpeech 也只认 \u4e00-\u9fff
后果：日文稿估时按假名逐字计，但语音跟随对假名整块 normalize 成一个 token，匹配粒度不一致，日文 voice-follow 基本失效。建议：CJK 正则收敛为 store.ts 导出的单一常量，voice.ts 引用之。

### G3【P2·架构】Home.tsx 741 行：营销内容数据与编辑器逻辑耦在一个组件
`src/pages/Home.tsx:47-159` 的 SAMPLE/FAQ/FEATURES/STEPS/COMPARISON 共 ~110 行纯数据与编辑器状态机同文件；改文案要动含 20+ hooks 的组件文件。UseCase 页已把数据抽到 `lib/useCases.ts`，同一仓库两种做法。
建议：抽 `lib/homeContent.ts`（纯数据）+ 可选拆 `components/Editor.tsx`；不强求拆碎，数据外置是低风险高收益的一步。思辨：741 行单文件尚可维护，但「同仓库同类问题两种解法」是真实的一致性债。

### G4【P2·逻辑】deleteScript 忽略 saveScripts 的失败返回值
`src/pages/Home.tsx:260-264`：saveScript 检查了返回值（第 5 轮修复），deleteScript 没检查——存储不可用时 UI 显示已删、刷新后复活。同一契约两种用法，属修复不彻底。建议补齐（删除极少失败，但契约应一致）。

### G5【P2·逻辑】滚轮 seek 假定 deltaY 单位是像素
`src/components/Prompter.tsx:404-408`：直接 `offsetRef += e.deltaY`，未处理 `deltaMode===DOM_DELTA_LINE`（Firefox 行模式下 deltaY≈3，seek 慢 ~15 倍）。建议：`const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY`。

### G6【P2·架构·轻】/api/stats 对 usecase 键做 list + N 次逐键 get
`worker/index.ts:64-77`：8 个 usecase 时 ~10 次 KV 读/请求，有 60s cache 兜底，当前规模无碍。若采纳 G1 方案 2 则此端点整体改写，无需单独修——记录在案防止在 KV 路线上继续加码。

## 遗留跟踪

C2③（首页 SPA 壳/CLS 0.287 预渲染）继续挂账，建议与第 8 轮 SEO 专项合并处理（预渲染同时解决 CLS 与爬虫可见性，一改两得）。

## 修复优先级建议

本轮修：G1（方案 2 优先，至少做方案 1）、G2、G4、G5 · G3 可选（若修请只做数据外置）· G6 随 G1 自然消解

---

## 第 7 轮线上复验 verdict（2026-08-14，生产环境实测，bundle index-BCMEuMVU.js）

- G1 PASS — /api/track 实测 0.070-0.095s（原 0.3-0.4s）；连打 3 次 page_view 后 /api/stats 113→116 正确累计（AE 增量+KV 底数合成生效）；非法事件仍 400。修改员对方案 2 的 90 天保留期补强（每日 cron 折算回 KV total）是审查建议未覆盖的真实缺口，认可。cron 首跑（明日 03:17 UTC）暂未验证，挂账下轮顺手确认 `ae:rollup_ts`。
- G2 PASS — 日文样本 "こんにちは、世界。これはテストです。" 线上计数 15 words（旧值 7）。
- G3 PASS — homeContent.ts 数据外置 + upsertScript 下沉 store.ts；线上首页/保存回归正常。
- G4 PASS — QuotaExceededError 桩下点击 Delete：红条 "Couldn't delete — device storage is unavailable."，条目保留。
- G5 PASS — 合成 wheel(deltaMode:1, deltaY:3) 位移 120px（×40 生效）。
- G6 PASS（随 G1 消解）。

结论：6/6 PASS，第 7 轮关闭。遗留：C2③（预渲染/CLS，并入第 8 轮 SEO）、cron rollup 首跑确认、静态 404 页 CTA 旧文案（build-seo.mjs:134，下轮修）、AE_SQL_TOKEN 建议换专用只读 token（需老板操作）。
