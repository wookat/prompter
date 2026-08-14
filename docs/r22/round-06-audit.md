# R22 第 6 轮审查（信息架构与文案专项）— PromptCue

日期：2026-08-14 · 审查员
方法：1440/375 全页走查截图（r6-*.png）+ 标题层级/导航/元信息提取 + 文案与产品行为逐条对照

## 本轮验证通过的基线（不列为问题）

- 首页 IA 结构清晰：hero=编辑器（首屏即产品）→ 三步 → 特性 → 对比表 → use cases → FAQ → CTA ✔
- H1-H3 层级正确、每页唯一 H1 ✔；FAQ 快捷键答案与实际行为逐条一致 ✔
- 隐私文案与实现一致：实测 0 cookie，只有匿名聚合计数 ✔；title/description 质量好 ✔

## 发现清单

### F1【P2·文案】「Start free」CTA 与「无需注册」定位自相矛盾
产品核心卖点是 No signup / 100% free no paid tier，但 header CTA 用 SaaS 注册语言「Start free」，暗示存在付费版；页尾又是「Start prompting — it's free」，pSEO 页是「Open the free teleprompter」——同一动作三种说法。
建议：统一动作语言，header 用「Open teleprompter」或「Start prompting」。思辨：「free」字样对转化有利，可保留在动词短语里（Start prompting — free），但不要用「Start free」这种 trial 暗示。

### F2【P2·信息架构】375 端导航项全部隐藏且无替代入口
实测：How it works / Use cases / FAQ 在 375 宽度 `hidden`（截图 r6-header-375.png），无汉堡菜单；移动用户想看 FAQ/用例只能盲滚到 footer。移动流量对这类工具站通常过半。
建议：三个都是页内锚点，最轻做法是让 nav 在移动端可横向滚动（overflow-x-auto），或只保留「FAQ」一项。思辨：加汉堡菜单？为 3 个锚点上抽屉组件过重，横滚即可。

### F3【P2·文案】同一功能三个名字：Flip = Mirror vertically = V
设置区按钮叫「Flip」，提词器按钮 aria 是「Mirror vertically」，快捷键提示是「V」，FAQ 说「V toggles vertical mirror」。用户在设置区开了「Flip」，进提词器后找不到对应概念。
建议：统一为「Flip (vertical)」或都叫 Mirror V；设置区按钮与提词器按钮用同一词根。

### F4【P2·体验·轻】站外链接不开新标签
「Try SpeakEasy」（编辑器工具栏）、footer 的 4 个姊妹产品链接均在当前标签打开——用户正在写稿时点击会直接离开编辑器（autosave 能兜底，但心流断了）。
建议：站外链接加 `target="_blank" rel="noopener"`。

## 遗留跟踪

C2③（首页预渲染/CLS）、A5+C4（KV 竞态）、A11（镜像提示——F3 若统一命名，建议此时一并做掉 A11 的「进提词器时提示镜像已开」）。

## 修复优先级建议

本轮修：F1、F2、F3（+A11 顺手）、F4 · 均为小改动，建议一次性清完
