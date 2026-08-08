# 交接上下文（Handoff Context）— PromptCue / prompter

> 每次里程碑或重大变更后更新。换会话/换负责人时整体注入新会话首条消息。

## 项目目标
免费在线提词器（浏览器内、无注册、脚本不上传），已上线运营期（SOP-05 短周期迭代）。当前轮次：R20。

## 代码与数据位置
- 仓库：`https://github.com/wookat/prompter`（默认分支 `main`）
- 本地路径：`/home/ubuntu/repos/prompter`
- 关键位置：`src/components/Prompter.tsx`（全屏提词器）、`src/pages/Home.tsx`（landing+编辑器）、`src/lib/store.ts`（设置/估时/速度模型）、`src/lib/voice.ts`（语音跟随匹配）、`src/lib/useCases.ts`（8 个 pSEO 页单一数据源）、`scripts/build-seo.mjs`（构建期预渲染 pSEO/sitemap/robots/IndexNow）、`worker/`（Hono，/api/track 埋点 → Workers KV）
- 数据：无数据库；匿名聚合计数在 Workers KV（binding `KV`）

## 技术栈
Vite + React 19 + TS + Tailwind 4（shadcn 风格）；Cloudflare Workers（Hono）；无后端存储、无 PII。

## 当前实时服务状态
- 线上：https://prompter.zalize.com（custom domain，wrangler routes）
- 部署：只从 main 执行 `CLOUDFLARE_API_TOKEN=$CLOUDFLARE_WORKERS_API_TOKEN npm run deploy`
- 本地开发：`npm install && npm run dev`（http://localhost:5173，无需任何密钥）

## 当前产品状态（截至 R20，2026-08-08）
- 已上线：定速滚动（R20 起按稿件语速校准：speed 6 = 140 wpm 估时刚好滚完，显示 ≈N wpm）、语音跟随（Web Speech API + 降级）、.txt/.md 导入、三文字主题、水平/垂直镜像（提词器内均可切换，M/V）、倒计时、视线引导、暂停提示气泡、8 pSEO 页 + FAQ/Breadcrumb/WebApplication JSON-LD、SpeakEasy（speech.zalize.com）互链
- Lighthouse mobile（R20 实测）：`/` Perf 85 / 其余 100；pSEO 页 Perf 92
- 埋点事件：page_view / prompter_start / prompter_finish / voice_on / mirror_on / script_import

## 进行中/待办任务（按优先级）
1. 语音跟随**真机验证**（自动化环境无法授权麦克风，只验证了降级路径；需真实麦克风人工跟进）
2. 遥控/双屏（BroadcastChannel 或 QR 配对）——竞品标配缺口
3. 提词+录像一体（getUserMedia + MediaRecorder）
4. PWA / Add to Home Screen
5. 首页 Perf 85（TBT 330ms）优化

## 已知坑与注意事项
- 提词器控制条 3.5s 自动隐藏：自动化点击前先移动鼠标唤出控制条，否则点击会被当作画面 tap 触发播放
- Chrome-for-Testing 无法授权麦克风且缺 Google speech key → 语音跟随在 CI/自动化环境不可测
- pSEO 页真实路径是 `/teleprompter-for-*`（不是 `/for/*`）
- 短稿（估时 <4s）速度模型回退旧 px/s 公式（store.speedToPxPerSecond）

## 资源与凭证索引
- 部署：secret `CLOUDFLARE_WORKERS_API_TOKEN`（Workers Scripts/KV/Routes 权限）
- 无其他外部依赖；产品本身零密钥、零账号

## 迭代记录索引
- R14 landing 重设计：docs/benchmark-r14.md
- R16 语音跟随/导入/主题 + 差距打分：docs/r16-gap-backlog.md、docs/r16-competitor-advantages.md
- R20 语速校准 + 暂停提示 + 垂直镜像：docs/r20-audit.md（PR #5）
