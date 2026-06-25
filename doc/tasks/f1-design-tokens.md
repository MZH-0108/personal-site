# F1 · 设计系统 / Design Tokens — 任务清单

> **依赖**：00-setup · **对应**：proposal §6.3–6.5、NFR-MAINT-01 · detail-design §3-F1
> **产物**：`src/styles/global.css`
> **契约**：CSS 变量 token 名（颜色/字体/间距/圆角/阴影/动效）；暗黑用 `.dark` class 策略

## 最小任务
- [x] **F1-T1** `@theme` 定义颜色 token（浅色）：`--color-bg/surface/text/text-muted/primary/primary-hover/border` 及语义色 success/warn/danger
- [x] **F1-T2** 配置 `@custom-variant dark (&:where(.dark, .dark *))`；`.dark{}` 覆盖同名颜色变量（暗色）
- [x] **F1-T3** 定义字体 token：`--font-sans`（中文栈 PingFang/雅黑/Noto）、`--font-mono`；字号阶梯（H1–H4/正文/小字）与行高
- [x] **F1-T4** 定义间距（4px 基：4/8/12/16/24/32/48/64/96）、圆角、阴影、动效缓动 token
- [x] **F1-T5** 加全局 `@media (prefers-reduced-motion: reduce)` 禁用动画/过渡
- [x] **F1-T6** 建开发用「Token 展示页」`src/pages/dev/tokens.astro`（列出色板/字阶/间距，供视觉回归）
- [x] **F1-T7** 测试：自动对比度校验 `text/bg`、`primary/bg` ≥ 4.5:1（明暗两套）
- [x] **F1-T8** 测试：Playwright 截取 Token 展示页明/暗两版，建立视觉回归基线

## 完成标准（DoD）
- [x] token 体系可用，`.dark` 切换令所有变量级联更新
- [x] 对比度满足 WCAG 2.2 AA
- [x] 视觉回归基线建立；本模块**不依赖**除自身外任何业务代码
