# R22 第 10 轮审查（安全与滥用专项）— PromptCue

日期：2026-08-14 · 审查员
方法：API 滥用实测（超大 body/畸形 JSON/超长 slug/跨域/方法探测）+ 安全头核查 + npm audit + 源码 XSS/秘密扫描（生产环境）

## 本轮验证通过的基线（不列为问题）

- 安全头齐全：HSTS/X-Frame-Options DENY/nosniff/referrer-policy/permissions-policy ✔（无 CSP 有 worker 注释论证，接受）
- 输入校验稳健：200KB body→400、畸形 JSON→400、非法事件→400、500 字符 slug 被 SLUG_RE 拒收（不入库）、GET /api/track→404 ✔
- 跨域防护：无 ACAO 头 + JSON content-type 强制 preflight（OPTIONS→405），浏览器侧跨站写计数被阻断 ✔
- 无 dangerouslySetInnerHTML/innerHTML，脚本内容全走 React 转义渲染（含导入文件与标题）✔
- git 历史与源码无秘密泄露（token 全走 wrangler secret / 环境变量）✔
- 攻击面本质极小：无账号、无 PII、脚本不上服务器——「Private by design」在架构层是真的 ✔

## 发现清单

### J1【P2·安全/滥用】/api/track 无速率限制，计数指标可被脚本污染
浏览器侧跨站已被 preflight 挡住，但 curl/bot 直连可无限刷计数（实测连发无任何限流），污染产品决策数据并消耗 AE 写入额度。
建议：Cloudflare WAF Rate Limiting 规则（免费档含 1 条）：`/api/track` 按 IP 限 ~30 req/min。平台现成能力，零代码。思辨：要不要签名 token/PoW？为匿名计数器上验证体系属过度设计——数据仅内部参考，限流足矣。

### J2【P2·信息暴露·轻】/api/stats 对公网完全公开
任何人（含竞品）可实时读取全部使用指标。当前数据量小无实害，但这是产品经营数据。
建议：加个简单 query token（`?key=<secret>`，wrangler secret 校验）或直接下线公开端点、改由 AE dashboard 查看。思辨：也可选择「公开透明」作为营销姿态（open metrics），这是产品决策——请修改员与老板确认后择一，不要默认公开。

### J3【P2·依赖】hono ≤4.12.33 有 4 个 moderate 公告
npm audit：ReDoS(CORS middleware)/memo() 跨请求泄露/Proxy 头透传/Language middleware DoS。本项目未使用这些中间件，**当前不可利用**（如实区分），但升级零成本。
建议：`npm audit fix` 升级 hono；dev 链上的 nanoid/undici 公告不入生产 bundle，可一并 fix 但不紧急。

### 主动否决（记录思辨，不立项）
- CSP：worker 注释已论证（hash 脚本+无内联需求低收益），且本站无用户生成内容渲染面，维持现状。
- Turnstile/验证码：对无账号工具站是体验自杀，否决。
- API 鉴权体系：无账号产品无从鉴权，J1 限流 + J2 token 已覆盖。

## 修复优先级建议

本轮修：J1（WAF 规则，零代码）、J3（npm audit fix）· J2 需老板拍板公开与否，修改员先给出建议方案
