# R22 第 1 轮修复响应 — PromptCue

修改员 · 2026-08-14 · PR: https://github.com/wookat/prompter/pull/8（已合并入 main）· 已部署上线（线上 bundle index-Bt6nbyeS.js，实查确认）

## 逐项响应

### A1【修复】Start 后自动开始
认同：Start 按钮语义即「开始」，再要求一次 tap 是重复确认实体。修法：Prompter mount effect 内调用 `startPlaying()`，走既有「倒计时→滚动」路径，不新增状态。预览需求由暂停/seek 已覆盖，未加"预览模式"开关（否决：加设置项属无必要增实体）。

### A2【修复】倒计时可取消
根因：倒计时用匿名 setTimeout 链且 togglePlay 对 countdown!==null 直接 return。修法：timeout id 存 `countdownTimerRef`，倒计时中 tap/空格 = 取消回暂停态；restart 与 unmount 也统一清理该 timer（一次治本，不留悬挂 timer）。

### A3【修复】暂停提示气泡可读性
改为实底 `bg-neutral-900` + `border-white/25` + shadow，文字全白。未搬动位置（否决：移到 25vh 视线线附近会遮挡正在读的行，bottom-22vh 配实底已可读且不抢焦点）。

### A4【修复】语速校准分母改为正文净高
认同审查员分析：原分母 max = scrollHeight−25vh 含 80vh 尾部 padding。修法：校准距离改用正文净高 `scrollHeight − 1.05×innerHeight`（扣除 25vh 顶部 + 80vh 底部 padding），与 ≈wpm 标称自洽；textHeight≤0 或稿件过短时仍回退 speedToPxPerSecond。

### A6【修复】/api/stats 并行化
`Promise.all` 并行读全部 total key，加 `cache-control: public, max-age=60`。

### A8【修复】pSEO 埋点
新增白名单事件 `usecase_view`，track() 支持可选 slug（worker 侧 `^[a-z0-9-]{1,40}$` 校验，防任意 key 注入），写 `count:usecase_view:{slug}:total` 每页维度 + 事件级 total/day；/api/stats 用 KV.list 前缀聚合输出各 slug 计数。无 PII、无脚本内容。

## 未修项及理由（按审查员建议留待下轮）

- A5（KV 计数竞态）：同意审查员"现阶段不值得上 DO"的思辨；当前量级误差无感，留待下轮与 A9 一并处理 worker 侧（若届时采纳"接受误差+注释说明"方案则零代码）。
- A7（OG 图）：需产一张 1200×630 静态图并接入构建，下轮做。
- A9（安全头）：下轮 worker 统一中间件加 HSTS/XFO/nosniff/CSP。
- A10（CJK 估时）：涉及 countWords/estimateSeconds/speedToWpm 标称联动（A4 修好后中文稿滚速=估时，估时偏差会直接传导），下轮系统性处理，不打散修。
- A11（镜像持久化提示）：下轮与 toast 形态一并斟酌（考虑复用 voice status 区域，不新增 toast 实体）。

## 验证

- 本地 lint 0 错（1 处既有 react-refresh warning 为存量，非本次引入）、tsc+build 全绿。
- 线上实查：新 bundle 已生效；测试代理正在跑端到端回归（自动开始/取消倒计时/暂停气泡/滚速校准/快捷键回归），结果如有异常将追加。
