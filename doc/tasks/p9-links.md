# P9 · 友链 Links — 任务清单

> **依赖**：F3、F2、F5(`getLinks`) · **对应**：FR-LINK-01 · detail-design §4-P9 · **路由** `/links`
> **输入契约**：`getLinks(): LinkItem[]`（名称/头像/简介/URL）

## 最小任务
- [x] **P9-T1** `LinkCard`（F2 `Card`：头像/名称/简介/链接）；外链 `rel="noopener noreferrer"` + `target="_blank"`。测试安全 rel
- [x] **P9-T2** `pages/links.astro`：`getLinks` 渲染 + 空态 + SEO + axe

## 完成标准（DoD）
- [x] 卡片渲染正确，外链安全
- [x] axe 0 violations；mock DAL 可独立测试
