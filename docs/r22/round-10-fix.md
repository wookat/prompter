# R22 第 10 轮修复报告 — PromptCue（修改员）

日期：2026-08-14 · PR：https://github.com/wookat/prompter/pull/17（已合并）· 分支 `devin/1786685471-r22-round10`（commit 9c58016）· 已部署上线（worker 侧改动，前端 bundle 无变化）

## 逐项响应（3/3 全修）

### J1【P2】/api/track 无速率限制 — 已修（方案与建议不同，理由如下）
- 审查员建议 WAF Rate Limiting 规则，但部署 token 无 zone 级权限（与 routes 同为 code 10000，实测 `/zones/.../rulesets/phases/http_ratelimit` 亦 403）。改用**平台原生等价物**：Workers Rate Limiting binding（wrangler `unsafe.bindings ratelimit`，30 req/60s，按 `cf-connecting-ip` 键控），超限返回 429。零外部基础设施、随 Worker 一起部署、无需 zone 权限。
- 同意审查员否决签名 token/PoW：匿名计数器不值得上验证体系。
- 生产实测：40 并发 POST 出现 200/429 混合（per-colo 近似限流，预期行为）；正常浏览的 page_view/usecase_view 均 200 不受影响。
- 备选：老板若愿意给 token 加 zone WAF 权限，可再叠加边缘层规则（当前 Worker 层已够用）。

### J2【P2】/api/stats 公开 — 已修（按 CHARTER「提议即默认方案」先行收紧）
- 加 `?key=<STATS_KEY>`（wrangler secret，已写入）校验，无 key 或错 key 返回 404；secret 未设时 fail-closed。前端不消费该端点（已 grep 确认），无 UI 影响。
- 老板若倾向「open metrics」营销姿态，回退只需删 3 行——留待老板拍板，默认先不公开经营数据。
- 生产实测：无 key 404，带 key 200 返回完整 JSON。

### J3【P2】依赖公告 — 已修
- `npm audit fix`：hono 升级（4 个 moderate，均为未使用中间件，如实区分为「当前不可利用但零成本升级」）+ nanoid/undici dev 链 → **0 vulnerabilities**。

## 主动否决的方案
- 签名 token/PoW/Turnstile：同意审查员，对无账号工具站过度设计。
- CSP：维持 worker 注释论证，不动。

## 本地验证与部署
- lint 0 errors（仅存量 warning）、tsc+build 全绿；部署成功（route 更新仍报既有权限 code 10000，不影响服务）。

## 真实浏览器 E2E（生产环境，录屏）
正常 tracking 200 不误伤、golden path 无回归、console 干净 — PASS。429/stats 门禁由 curl 验证。证据见 PR #17 评论。

## 遗留跟踪
- STATS_KEY 值已交存（如老板需要查看 stats，向修改员索取或 `wrangler secret` 重置）。
- H2 其余 6 个 pSEO 页扩充（挂账）。
