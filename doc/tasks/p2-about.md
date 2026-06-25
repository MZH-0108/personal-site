# P2 · 关于 About — 任务清单

> **依赖**：F3、F2、F5(`getSkills`) + 关于正文内容 · **对应**：FR-ABOUT-01..04 · detail-design §4-P2 · **路由** `/about`
> **输入契约**：关于正文（Markdown）、`getSkills(): SkillGroup[]`、可选 services/testimonials 数据

## 最小任务
- [x] **P2-T1** 关于正文内容（Markdown）+ `Bio`（F2 `Prose` 渲染）
- [x] **P2-T2** `WhatIDo` 服务卡片网格（可选数据；空则隐藏）。测试
- [x] **P2-T3** `Skills` 分组与熟练度可视化（`getSkills`；空则隐藏）。测试 mock 空/多组
- [x] **P2-T4** `Testimonials` / 合作 Logo 墙（可选）
- [x] **P2-T5** `pages/about.astro` 组装 + `BaseLayout`（SEO）+ axe

## 完成标准（DoD）
- [x] 正文与技能正确渲染，空数据优雅降级
- [x] axe 0 violations；mock DAL 可独立测试
