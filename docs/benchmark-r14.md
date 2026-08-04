# R14 竞品对标拆解 — PromptCue 源码级复刻升级

日期：2026-08-04 · 执行：project-lead · 指令：老板 R14「先复刻再优化」

## 1. 竞品选择

| 竞品 | 定位 | 选择理由 |
| --- | --- | --- |
| **CuePrompter** (cueprompter.com) | 免费在线提词器，长年占据 "free teleprompter" 搜索首位 | 真实头部流量；landing 设计现代（2024 改版），是免费提词器赛道的事实标杆 |
| **Teleprompter.com**（CuePrompter 母公司，BIGVU 同级付费产品） | 付费提词器 App（iOS/Android/Mac/Web），10 万+ 评价 | 设计质感最高的头部产品，其 landing 的排版/配色/组件是本次复刻的主要设计规范来源 |
| TelepromptermMirror.com（参考项） | 老牌免费提词器 | 功能全（语音跟随、富文本）但设计老旧（Apache 静态页），仅作功能参考，不作设计对标 |

实测截图（见 `docs/benchmark/`）：

- `cueprompter-home.png` / `cueprompter-below-fold.png` / `cueprompter-prompter.png`
- `teleprompter-com-hero.png` / `teleprompter-com-video.png` / `teleprompter-com-features.png`
- `telepromptermirror-prompter.png`

## 2. 设计规范拆解

### 2.1 信息架构（CuePrompter / Teleprompter.com 共性）

1. Header：logo + 少量导航 + 双 CTA（App Store 徽章 / Get Started）
2. Hero：超大标题（约 56–72px，两三行断句）+ 一段价值主张 + 主 CTA
3. **脚本框即首屏主角**（CuePrompter）：深色圆角大 textarea 直接放 hero 下方，配「Start」主按钮 —— 工具 3 秒可用
4. "What you get" 特性区：6 项图标卡片
5. 展示/证明区：真人使用图 + 五星评分 + "20,000+ creators" 社会证明
6. FAQ：`<details>` 手风琴
7. Footer：pSEO 内链（Teleprompter for YouTube / Presentations / Podcasts / Zoom）+ 法务链接

### 2.2 布局栅格与排版

- 内容主列 max-width ≈ 1080–1200px，居中；区块垂直节奏 96–128px
- 标题字体：Plus Jakarta Sans / 类 grotesque，**800 粗重 + 紧 tracking**；正文 16–18px，行高 1.6+
- Hero H1 桌面 ≈ 56–64px，移动 ≈ 36–40px
- 卡片：大圆角（16–24px），浅边框或无边框 + 柔和阴影

### 2.3 配色

- 底色：暖白/奶油色（CuePrompter #FFF8EE 系、Teleprompter.com 纯白）
- 主色：**琥珀橙**（CuePrompter #F5A623 / Teleprompter.com #FFB130 系）用于 CTA、强调文字
- 墨色：近黑 #101010 大标题，正文 60–70% 灰
- **提词器区域始终是黑底白字**（工具的"舞台"），与暖色 landing 形成强对比

### 2.4 组件与交互

- 主 CTA：橙底深字、圆角 8–12px、hover 变深；次 CTA 白底描边
- CuePrompter 脚本框：深色（#1F1F1F）、圆角 24px、内边距大、placeholder 灰
- 提词界面（两家一致）：顶部工具条（播放/对齐/双向镜像/颜色/字号/边距/速度滑杆），正文区黑底白字大号无衬线
- 快捷键（TelepromptermMirror）：Space 播放暂停、↑↓ 字号、←→ 速度、Esc 回开头
- FAQ 用原生 `<details>/<summary>`，箭头指示

### 2.5 移动端

- 两家 landing 均单列折叠、CTA 全宽；提词界面控件收进汉堡菜单（TPM）或自适应缩放（CuePrompter）
- CuePrompter footer 声明 "Optimised for smartphone and tablet"

### 2.6 SEO 结构

- 单 H1 含核心词（"#1 Free Online Teleprompter"）
- FAQ 结构化内容 + footer pSEO 内链矩阵（teleprompter-for-*）
- 品牌交叉导流（CuePrompter → Teleprompter.com）

## 3. 差距诊断（我们 vs 竞品，改版前）

| 维度 | 竞品 | PromptCue（改版前） | 差距 |
| --- | --- | --- | --- |
| 视觉气质 | 暖白+琥珀橙、大字重排版、有记忆点 | 通用蓝 + 默认排版，无品牌感 | ★★★ |
| 首屏主角 | 深色脚本框即提词器预览，3 秒可用 | 白色 textarea + 右侧灰面板，工具感弱 | ★★★ |
| 社会证明/信任 | 五星、用户数、真人图 | 无 | ★★ |
| 排版层级 | 56–64px 大标题、明确节奏 | 36–48px，节奏平 | ★★ |
| FAQ | 手风琴交互 | 纯静态列表 | ★ |
| Footer | 多列结构化 | 单列平铺 | ★ |
| 功能（提词本体） | 基本同级 | 已有镜像/倒计时/引导线/进度条/触控 | 持平或领先 |

## 4. 复刻方案（本 PR 落地）

- 设计 token 重做：暖白底、近黑墨色、琥珀主色、大圆角（复刻 2.3）
- Hero 重排：超大 800 字重标题 + 信任 chips（复刻 2.2/2.1）
- 首屏改为**深色提词器风格编辑器**（黑底白字、圆角 24px、内嵌字数/时长状态条），设置改为编辑器下方工具带（复刻 CuePrompter 首屏主角结构）
- 新增 How-it-works 三步区、对比表、CTA 色带
- FAQ 改 `<details>` 手风琴；Footer 改多列（复刻 2.4/2.1）
- Use-case 页同步换肤
- 提词界面保留现有全部功能（已达竞品同级），微调至琥珀色强调

## 5. 比竞品更好的点（复刻后叠加）

1. **零门槛即用**：无 App 下载、无账号，首屏即编辑器（CuePrompter 同级）；且我们**无任何付费墙/交叉导流打断**
2. **隐私**：脚本只存 localStorage，明示"永不上传"（TPM 同级，CuePrompter 未承诺）
3. **提词功能超集**：倒计时、眼线引导、进度条、滚轮/触摸拖动 seek、保存 50 份脚本 —— CuePrompter 旧版无倒计时/引导线/保存
4. **语速估算**：字数 + 预计口播时长实时显示（两家免费版均无）
5. **移动端**：触控暂停/拖动、safe-area 控制条（CuePrompter 移动控件明显弱）
6. **性能**：静态 Workers 边缘分发，首屏 < 1s（telepromptermirror 实测首字节 ~19s）
7. **SEO**：8 个 use-case pSEO 页 + sitemap + IndexNow（对齐并超过 CuePrompter 的 4 个）
