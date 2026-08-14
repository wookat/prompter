# R22 第 8 轮审查（SEO/发现性专项，并入 C2③）— PromptCue

日期：2026-08-14 · 审查员
方法：全路由 curl 源码级检查（canonical/OG/JSON-LD/robots/sitemap/404）+ Lighthouse SEO 实测 + 预渲染内容量统计

## 本轮验证通过的基线（不列为问题）

- Lighthouse SEO 1.0（满分）✔ robots.txt + sitemap.xml（9 URL 全正确）✔
- 每页唯一 canonical、OG/Twitter card 齐全（og.png 1200×630）✔
- 首页 JSON-LD：WebApplication + FAQPage；pSEO 页：WebApplication + Offer + BreadcrumbList ✔
- 未知路径真 404 状态码（很多 SPA 直接 200 软 404，这里做对了）✔
- pSEO 页互链（More use cases）+ 首页/footer 双向链接 ✔

## 发现清单

### H1【P1·性能/SEO】首页预渲染正文为 0 字节（C2③ 正式处理）
实测 `curl /` 去脚本后 body 文本长度 = **0**。爬虫首个 HTML 里没有任何内容（标题/FAQ/特性全靠 JS）；同时这是 CLS 0.287 的根因（壳→整页内容跳入）。pSEO 页已有 build 期静态化管线（build-seo.mjs），首页却例外——同站两种做法。
建议：复用现有管线，把首页静态区块（hero 文案、三步、特性、对比表、FAQ、footer）在 build 期渲染进 index.html，React 水合接管；编辑器区可保留骨架占位（固定高度防 CLS）。思辨：要不要上 SSR/框架（Astro/Next）？不要——内容是纯静态的，build 期字符串渲染即可，为一页上 SSR 属「无必要增实体」。验收标准：curl 首页可见 FAQ 文本 + Lighthouse CLS < 0.1。

### H2【P2·SEO】pSEO 页预渲染正文仅 ~123 词，薄内容/门页风险
8 个 use-case 页结构完全同构（1 段 intro + 4 bullets + 1 tip + CTA），去模板后每页独有内容约 60-80 词。Google 对大量同构薄页有 doorway-page 判定风险，且这样的页面很难赢得该词的排名。
建议：每页扩充为 300+ 词真实有用内容：该场景的准备清单/推荐语速与字号/常见错误（如婚礼致辞建议 130wpm、演讲配倒计时），并加该场景 2-3 条 FAQ（同时输出 FAQPage schema）。内容写进 useCases.ts 数据即可，不改架构。

### H3【P2·文案/SEO】静态 404 页 CTA 仍是第 6 轮的旧文案
`scripts/build-seo.mjs:134` 硬编码 "Open the free teleprompter"（修改员第 7 轮已自查发现，本轮正式立项）。建议：改为 "Start prompting — it's free"；并让 build-seo 的 CTA 文案与 homeContent.ts 共用常量，杜绝再次漏网。

### H4【P2·SEO·轻】sitemap lastmod 恒等于部署日期
9 个 URL 的 lastmod 全是当天（每次 deploy 全量刷新）。内容未变却天天"更新"，爬虫会逐渐忽略该信号。建议：lastmod 取对应内容源文件（useCases.ts/homeContent.ts）的 git 最后提交日期；一行 `git log -1 --format=%cs -- <file>` 即可。

### 主动否决（记录思辨，不立项）
- 每 use-case 独立 og:image：制作成本高、点击率收益无证据，共享 og.png 足够。
- hreflang/多语言：产品当前只有英文内容，无从声明。
- blog/内容营销：超出本轮范围，属增长侧决策，留给老板。

## 修复优先级建议

本轮修：H1（本轮核心，验收 curl 有正文 + CLS<0.1）、H3、H4 · H2 建议至少先做 2 个页面试点（婚礼+视频录制），其余 6 页可下轮跟进

---

## 第 8 轮线上复验 verdict（2026-08-14，生产环境实测，bundle index-CM-fgx2D.js）

- H1 PASS（C2③ 关闭）— curl 首页预渲染正文 1161 词（原 0），FAQ 文本爬虫可见；Lighthouse 实测 CLS = 0（原 0.287）、perf 0.83→0.96、FCP 1.8s；回访用户草稿接管正确、console 零错误、接管后提词器正常滚动。renderToString 单一事实来源方案优于我提的字符串模板，认可。
- H2 PASS（试点 2 页）— wedding-speech 747 词 / video-recording 749 词，均含 FAQPage schema；未扩充页（podcast 308 词、无 FAQPage）符合预期。剩余 6 页挂账下轮。
- H3 PASS — 静态 404 页 CTA 已为 "Start prompting — it's free"，三处共用常量。
- H4 PASS（机制验证）— lastmod 改取内容源文件 git 日期；今日仍为 2026-08-14 属正确（内容源今日有提交），机制上后续空部署不再刷新。

结论：4/4 PASS，第 8 轮关闭，C2③ 正式关闭。遗留：H2 其余 6 页扩充、cron rollup 首跑确认（明日 03:17 UTC）、AE_SQL_TOKEN 换专用只读 token（需老板）。
