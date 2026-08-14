# R22 Round 2 — Fix Report（修改员）

PR: https://github.com/wookat/prompter/pull/9（已合并 main）
部署：已上线 prompter.zalize.com（bundle `assets/index-D9AaJ6YQ.js`），线上已实测生效。

## 逐项响应

### B1（P1）读完后黑屏死局 — 已修
- 根因确认：`maxOffset = scrollHeight − 25vh` 把 25vh 顶部 + 80vh 底部留白都算进滚动距离，最后一行早已越过视线线后还继续空滚。
- 修法：`maxOffset = scrollHeight − 1.05·vh`（正好扣掉两段留白），滚动在**最后一行到达视线线（25vh）时停止**——屏上始终有字，不再黑屏；总滚动时长与估时一致（94 词样稿 ≈40s，不再有 ~24s 空白尾巴）。
- 结束态提示改为 `Finished — press R to restart · Esc to exit`（progress≥1 时），且结束后按空格为无操作（不再出现「Space to resume 却瞬间弹回」的假恢复）。
- 顺带消除重复：滚速校准原来单独重算 textHeight，现在直接复用 maxOffset（同一定义，单一事实源）。
- 否决方案：新增 `finished` state + 独立结束遮罩层——现有 `progress`/`finishedRef` 已足够表达，勿增实体。

### B2（P2）保存无反馈 + 重复条目 — 已修
- Save 按钮点击后 1.5s 内显示 `✓ Saved`（复用按钮本身，不加 toast 系统）。
- 文本与已有条目完全相同时不再插入新条目，而是刷新该条目（标题/时间）并置顶。
- 否决方案：全局 toast 组件——单点反馈用按钮态即可，避免为一处需求引入通知架构。

### B3（P2）导入覆盖未保存文本 + 接受二进制 — 已修
- 二进制/乱码检测：含 NUL、或前 2000 字符中 U+FFFD/控制字符占比 >5% 即拒绝，编辑器顶部显示红色错误条（4s 自动消失）。
- 覆盖保护：当前文本非空、非示例、非已保存脚本、与导入内容不同时，弹 `window.confirm` 确认；取消则不覆盖。
- 否决方案：自动把被覆盖文本静默存入 Saved scripts——会在用户不知情时制造条目，违背最小惊讶原则。

### B4（P2）移动端默认字号过大 — 已修
- `loadSettings()` 无持久化设置时，视口 <480px 默认 `fontSize: 32`（桌面仍 48）；已有 localStorage 设置一律优先，不被覆盖。
- 否决方案：CSS clamp/vw 动态字号——会让「Text size 48px」的显示值与实际渲染不一致，破坏所见即所得。

### A7（P2）社交预览图 — 已修
- 新增静态 `public/og.png`（1200×630，提词器视觉：滚动文本行+琥珀色视线线+品牌信息）。
- `index.html` 与 8 个 pSEO 页均加 `og:image`/`og:image:width|height`/`twitter:card=summary_large_image`/`twitter:image`。
- 否决方案：按 use-case 动态生成多张 OG 图——收益低、增加构建复杂度，先用单张品牌图。

### A9（P2）安全响应头 — 已修
- Worker 中间件对 API 路由统一加：HSTS、`X-Frame-Options: DENY`、`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy`。
- 关键发现：Workers 静态资产**不经 Worker 直接边缘服务**，仅靠中间件页面头不生效；补 `public/_headers` 使同组头覆盖所有静态页面/资源（线上已验证 `/` 与 `/og.png` 均带全部头）。
- 未加 CSP：Vite 产物为 hash 模块脚本，严格 CSP 需按构建注入 nonce，成本/收益不匹配，留待后续如有需要再做。

## 未修项及理由
- B5（标题截断）/ A5（KV 计数竞态）/ A10（CJK 语速）/ A11（镜像提示）：按本轮 audit 优先级建议留待下轮。

## 验证
- 本地 lint（0 error，1 个既有 warning）/ build 全绿。
- 线上：新 bundle 已服务；`/`、`/og.png`、`/api/health` 响应头齐全；pSEO 页含 og:image。
- E2E 回归（录屏见 PR）：结束态/保存/导入/移动端默认字号/快捷键与倒计时回归。
