# P8 · 时间线 Timeline — 任务清单

> **依赖**：F3、F2、F5(`getTimeline`) · **对应**：FR-TIME-01 · detail-design §4-P8 · **路由** `/timeline`
> **输入契约**：`getTimeline(): TimelineItem[]`（按日期倒序）

## 最小任务
- [x] **P8-T1** `TimelineItem` 组件 + `TimelineList`：语义化 `<ol>` + `<time>`；按日期倒序。测试顺序与语义
- [x] **P8-T2** 空态；按年份分组（可选）
- [x] **P8-T3** `pages/timeline.astro` 组装 + SEO + axe

## 完成标准（DoD）
- [x] 时间顺序与语义结构正确，空态优雅
- [x] axe 0 violations；mock DAL 可独立测试
