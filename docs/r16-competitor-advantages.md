# R16 竞品优点清单 — prompter 线（PromptCue）

日期：2026-08-07 · 执行：project-lead · 方法：浏览器逐站实测 + 截图（`docs/benchmark-r16/`）

## 实测竞品名单（11 个，均有真实流量/公认口碑）

| # | 竞品 | 类型 | 实测截图 |
| - | --- | --- | --- |
| 1 | CuePrompter (cueprompter.com) | 免费在线提词器，"free teleprompter" 搜索头部 | cueprompter-home(.scrolled).png |
| 2 | Teleprompter.com | 付费 App（iOS/Android/Mac/Web），10 万+ 评价 | teleprompter-com-home(.scrolled).png |
| 3 | TelepromptMirror (telepromptermirror.com) | 老牌免费提词器，语音跟随 | telepromptermirror(.scrolled).png |
| 4 | BIGVU (bigvu.tv) | AI 视频制作+提词器，创作者付费产品 | bigvu(.scrolled).png |
| 5 | Speakflow (speakflow.com) | 浏览器提词器（语音跟随），免费+付费 | speakflow(.scrolled).png / speakflow-tool.png |
| 6 | teleprompt.me（Speakflow 旗下免费工具） | 极简免费在线提词器 | telepromptme(.scrolled).png |
| 7 | PromptSmart (promptsmart.com) | VoicePlus 语音跟随 App，"#1 brand" | promptsmart(.scrolled).png |
| 8 | VODIUM (vodium.com) | 桌面悬浮提词器（视频会议场景） | vodium(.scrolled).png |
| 9 | EasyPrompter (easyprompter.com) | 老牌在线提词器（双屏/离线/遥控） | easyprompter(.scrolled).png / easyprompter-tool.png |
| 10 | Telepromptr (telepromptr.com) | 简洁 iOS 提词器 | descript-tp(.scrolled).png |
| 11 | VEED Teleprompter (veed.io/tools/teleprompter) | 工具站 SEO 标杆（提词+录像一体） | veed-teleprompter(.scrolled).png |

另试 freeteleprompter.org（连接超时）、speechway.com（Cloudflare 盾）、capcut 提词器（404），未纳入。

## 值得学的优点（≥10 条，逐条注明出处/为什么好/适用到我们哪里）

1. **语音跟随滚动（voice-follow）是头部竞品的旗舰功能**
   - 出处：Teleprompter.com 首页 hero（"VoiceGlide™ — the text follows your voice, pauses when you pause"）；Speakflow 首页 H1（"The teleprompter that follows your voice"）；PromptSmart（VoicePlus）；TelepromptMirror（"[Voice Activated]" 直接写进 title）。
   - 为什么好：解决固定速度提词器的核心痛点——语速和滚速不同步、忘词卡壳后文本跑掉。4 家头部产品都把它作为第一卖点，说明是用户决策关键。
   - 适用到我们：提词器界面（Prompter 组件）新增语音跟随模式（Web Speech API，浏览器内识别、不上传录音，与我们隐私卖点契合）。
2. **脚本框即首屏主角，3 秒可用**
   - 出处：CuePrompter 首页——深色大 textarea 直接在 hero 下方 + "Start new prompter" 主按钮。
   - 为什么好：工具站转化核心是"到达即用"，无须滚动或注册。
   - 适用到我们：已具备（R14 复刻）；保持并强化 Start 按钮可达性。
3. **文本颜色/主题可选（经典黄字黑底）**
   - 出处：CuePrompter 特性区（"yellow on black for comfortable reading"）、TelepromptMirror（富文本颜色）、EasyPrompter（颜色设置）。
   - 为什么好：黄字黑底是演播室提词的行业习惯，长时间朗读更舒适；专业用户会找这个选项。
   - 适用到我们：Prompter 设置面板加文字颜色选项（白/黄/薄荷）。
4. **脚本文件导入**
   - 出处：TelepromptMirror（upload text file）、EasyPrompter（import script）、BIGVU（导入文档）。
   - 为什么好：真实脚本多写在 Word/Docs/备忘录里，粘贴长文在手机上很痛苦；导入降低启动摩擦。
   - 适用到我们：首页编辑器头部加"Import file"（.txt/.md），本地 FileReader 读取，不上传。
5. **信任与社会证明区（评分/用户数/媒体 logo）**
   - 出处：Teleprompter.com（"from 100K+ reviews" 五星 + CNN/BBC/Netflix/Amazon logo 墙）；CuePrompter（"Rated five stars by 20,000+ creators"）。
   - 为什么好：显著降低新访客决策成本，头部两家都放在首屏或次屏。
   - 适用到我们：我们暂无真实评价数据，不造假；先用真实可验证的信任信号（开源/无上传/无账号），后续积累真实用户数再上数字。
6. **演示视频/动态预览**
   - 出处：Teleprompter.com（Feature Showcase YouTube 视频）；EasyPrompter（Watch Demo）；VEED（demo 画面）。
   - 为什么好：提词器是"动态"产品，静态截图讲不清滚动体验；视频/动画能秒懂。
   - 适用到我们：hero 或 How-it-works 加一段纯 CSS/JS 的滚动动画预览（免视频托管、零流量成本）。
7. **AI 写稿入口（上游需求打通）**
   - 出处：CuePrompter 首页 hero 下方（"Need help writing your script? Try our AI Script Generator"）；BIGVU（AI script writer 为主卖点之一）。
   - 为什么好：用户到提词器前先要有稿子；打通上游可截获流量并交叉导流。
   - 适用到我们：我们已有姐妹站 SpeakEasy（speech.zalize.com），把入口从 footer 提到编辑器附近（"Need a script? …"）。
8. **场景化 pSEO 内链与页脚矩阵**
   - 出处：Teleprompter.com/CuePrompter footer（Teleprompter for YouTube / Presentations / Podcasts / Zoom …）；VEED tools 目录矩阵。
   - 为什么好：长尾词捕获+权重内循环，是工具站流量主来源。
   - 适用到我们：已有 8 个 use-case 页；补 FAQPage/BreadcrumbList 结构化数据，提高富摘要收录。
9. **键盘/遥控与双屏支持说明前置**
   - 出处：EasyPrompter（Dual Screen / Offline Operation / Remote Control 三大特性卡）；TelepromptMirror（快捷键表）。
   - 为什么好：半专业用户（教会、演播）按设备能力选型，明示能力可留住他们。
   - 适用到我们：FAQ/特性区已列快捷键；把"第二屏/平板使用"写进 use-case 文案（presentations/sermon 页已有）。
10. **会议悬浮窗场景（虚拟讲台）**
    - 出处：VODIUM 整站（"native desktop teleprompter for Zoom, Teams, Meet"）。
    - 为什么好：视频会议提词是增长最快的场景，VODIUM 靠单一场景做成产品。
    - 适用到我们：浏览器无法全局悬浮，但 interviews use-case 页可给出"窄窗口贴摄像头"教程（已有雏形），并支持极慢速度档。
11. **提词+录像一体**
    - 出处：VEED teleprompter（读稿同时录像）；BIGVU（核心工作流）；Speakflow（record in browser）。
    - 为什么好：读稿的最终目的多是录视频，一体化省工具切换。
    - 适用到我们：中期路线图（getUserMedia + MediaRecorder 可纯前端实现）；本轮不做（范围控制），记入 backlog P2。
12. **移动 App 引导（QR 码扫码下载）**
    - 出处：Teleprompter.com 首屏右侧 "Scan to Download" QR。
    - 为什么好：桌面访客→手机使用的转换路径顺畅。
    - 适用到我们：我们是 PWA 化候选（无 App）；本轮不做，P2 记录（Add to Home Screen 指引）。

## 否定之否定（本轮反题结论）

R14 合题（复刻 CuePrompter/Teleprompter.com 的 landing 形态 + 基础提词功能）已被实践检验为可用骨架（全路由 200、Lighthouse 通过）。但 R16 实测证伪了"功能已够用"的判断：**头部 4 家竞品均以语音跟随为第一卖点，我们完全缺失**；文件导入、文字颜色等次级功能也落后。主要矛盾从"形似"转移到"核心功能差距伤转化"。
