# R22 第 2 轮审查（核心工作流深挖）— PromptCue

日期：2026-08-14 · 审查员
方法：线上真浏览器全链路走查（粘贴→设置→Start→读→读完→保存/重载/导入，1440 与 375），Playwright 实测 + 截图（docs/r22/shots/r2-*.png）

## 本轮验证通过的基线（不列为问题）

- 空文本时 Start / Save 均正确禁用；autosave 刷新后恢复 ✔
- 保存→列表→点击重载→删除 全链路可用 ✔；.txt 导入正常 ✔
- 2400 词长稿：估时 17min9s，滚动流畅，播放中 ↑↓/←→ 实时生效（≈187wpm 显示同步）✔
- 滚轮 seek、R 重置（回顶部、进度归零）✔
- 语音跟随降级路径：无麦克风 → 琥珀色提示 + 回退定速滚动 ✔
- 移动端 tap 暂停、拖拽 seek ✔；速度/字号设置跨刷新持久化 ✔

## 发现清单

### B1【P1·功能+逻辑】读完后是「黑屏死局」：屏上无字、提示误导、空格失效
复现：任意稿件滚到末尾（截图 r2-finished.png）——最后一行早已滚出视线区，屏幕全黑，气泡却显示「Paused — tap or press Space to resume」；按空格 togglePlay 置 playing 后下一帧又立即停（offset≥max），等于无响应。
两个子问题：
1. **完成点定义错误**：max = 正文高 + 80vh（Prompter.tsx maxOffset），末行经过视线线（阅读实际结束）之后还要继续滚 ~80vh 的空白（第 1 轮实测 94 词稿多滚 ~19s）。读者读完最后一个词后盯着黑屏等它「放完」。
2. **结束态无语义**：finished 与 paused 共用一个提示文案，且给出无效指令（resume）。
建议：完成点改为「末行到达视线线」（offset_max ≈ scrollHeight − paddingBottom − 25vh），到达即停并显示「Finished — R to restart · Esc to exit」；这同时消除 A4 修复后残留的收尾空滚。思辨：是否有人想把字全部滚出屏（录屏收尾）？极少数需求，可用手动滚轮完成，不值得为其保留默认行为。

### B2【P2·功能】保存无反馈 + 重复保存产生完全相同的副本
复现：同一文本连点两次 Save script → 列表出现两条同名条目（截图 r2-saved-scripts.png）；按钮无任何成功反馈，用户自然会再点。
建议：①保存后短暂反馈（按钮变「Saved ✓」1.5s 即可，勿加 toast 实体）；②与最近一条内容相同时不新增，仅置顶刷新 updatedAt。

### B3【P2·功能+边界】导入静默覆盖当前稿 + 二进制文件可灌入乱码
复现：①编辑器有未保存文本时点 Import 选文件 → 直接覆盖，无任何确认，数据丢失；②文件选择器切「All Files」选 PNG → NUL/乱码字节整段进入编辑器（实测复现）。
建议：①导入前若当前文本非空且非样稿，自动把当前文本压入 saved scripts（零打扰且不丢数据，优于弹确认框）；②读入内容含 NUL 或不可打印字符占比过高时拒绝并提示「不是文本文件」。

### B4【P2·视觉】375 下默认 48px 每行仅 1-3 词，首屏只能看到 ~6 行
截图 r2-mobile-playing.png：默认字号在小屏下断行极碎，读感差；桌面与移动共用同一默认值。思辨：提词器场景手机常离脸 30-50cm，48px 未必错，但「每行 1-3 词」明显超出合理断行。建议：小屏（<480px）默认字号降至 ~32-36px（仅默认值按视口初始化，用户设置仍持久化）。

### B5【P2·逻辑】保存标题=首行前 60 字符，无智能截断
首行超长时标题在词中间硬切（60 字符）。小事：截到最后一个完整词 + …。与 B2 一并处理即可。

## 上轮遗留（fix 侧 backlog，非本轮新发现，仅提醒）

A5（KV 竞态注释/方案）、A7（OG 图）、A9（安全头）、A10（CJK 估时）、A11（镜像提示）。建议本轮 fix 至少消化 A7+A9（低风险高确定性）。

## 修复优先级建议

P1：B1 · 本轮一并修：B2、B3、B4（+遗留 A7、A9）· 可下轮：B5、A5、A10、A11

---

## Verdict（线上复验 2026-08-14，bundle index-D9AaJ6YQ.js）

- **B1: PASS** — 滚动在末行到达视线线处停止，屏上有字（截图 r2v-finished.png：word88-93 可见），提示「Finished — press R to restart · Esc to exit」，progress 100%，按空格无位移（translateY 不变）。
- **B2: PASS** — 点击后按钮显「✓ Saved」；相同文本二次保存不新增（localStorage 条目数 1）。
- **B3: PASS** — 二进制文件被拒且编辑器内容不变，红色错误条「That file doesn't look like a text script (.txt / .md).」（截图 r2v-binary-reject.png）；有未保存文本时导入弹确认，取消保留原稿、确认后导入。
- **B4: PASS** — 375px 无持久化设置时默认 32px，1440px 仍 48px；实测 localStorage 已有设置不被覆盖。
- **A7: PASS** — `/og.png` 200 (image/png)，首页含 og:image/width/height + twitter:card=summary_large_image。pSEO 页实测（/teleprompter-for-podcast）含 og:image + twitter:image + summary_large_image。（审查员先前用错误路径 /for/podcast 误报差异，已更正。）
- **A9: PASS** — `/` 与 `/api/health` 均带 HSTS / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy。

结论：6/6 全部 PASS。遗留 backlog：B5、A5、A10、A11。
