# R22 第 6 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/13（已合并）· 分支 `devin/1786678895-r22-round6`（commit 2fdcbaf）· 已部署上线（bundle `index-CN20aoN8.js`）

## 逐项响应

### F1 CTA 语言自相矛盾 — 已修
- header「Start free」→「Start prompting」（去掉 trial 暗示）；pSEO 页「Open the free teleprompter」→「Start prompting — it's free」；footer 保持「Start prompting — it's free」。全站统一动词 “Start prompting”，“free” 保留在陈述短语里。

### F2 375 端导航全部隐藏 — 已修
- 去掉三个锚点链接的 `max-md:hidden` / `max-sm:hidden`；nav 改 `min-w-0 overflow-x-auto whitespace-nowrap`，CTA `shrink-0`。移动端全部导航可见、可横滚、可点；桌面无变化。
- 主动否决：汉堡菜单/抽屉——为 3 个页内锚点引入抽屉组件过重（如无必要勿增实体）。

### F3 Flip/Mirror vertically/V 三个名字 — 已修
- 统一词表：设置区按钮「Mirror H」「Mirror V」（原 Mirror/Flip）；提词器工具栏 aria-label「Mirror H (horizontal)」「Mirror V (vertical)」；FAQ 改为 “M toggles Mirror H (horizontal), V toggles Mirror V (vertical)”；对比表 “Mirror & flip modes”→“Mirror modes (H & V)”。

### A11 镜像状态提示（顺手结掉）— 已修
- 提词器顶部新增状态 pill（渲染在镜像 transform 之外，永远正读）：「Mirror H/V/H+V on — press M/V to toggle」，触屏文案「tap ⇄ to turn off」；双关后消失。与 voice pill 垂直堆叠不重叠。

### F4 站外链接不开新标签 — 已修
- 编辑器工具栏「Try SpeakEasy」+ footer 5 个姊妹产品链接全部加 `target="_blank" rel="noopener"`。

## 本地验证
- `npm run lint`：0 errors（仅存量 `ui/button.tsx` warning）；`npm run build` 全绿。

## 部署与线上验证
- `npm run deploy` 上传成功；zone route 更新仍报 Cloudflare code 10000（token 权限遗留项，不影响服务）。
- 线上（cache-busted）确认首页引用 `assets/index-CN20aoN8.js`。

## 真实浏览器 E2E（生产环境，全程录屏）
全部 PASS，证据见 PR #13 评论：F1 三处 CTA、F2 375/1440 header、F3 按钮/FAQ/aria、A11 pill 状态切换与正读性（coarse 桩验证触屏文案）、F4 六个外链 DOM+实点新标签、start/pause/finish/Save 回归，无 console 错误。

## 遗留跟踪
C2③（首页预渲染/CLS）、A5+C4（KV 竞态）继续挂账；A11 已随 F3 关闭。
