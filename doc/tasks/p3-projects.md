# P3 · 项目 Projects — 任务清单

> **依赖**：F3、F2、F5、`ProjectLayout` · **对应**：FR-PROJ-01..05 · detail-design §4-P3
> **路由**：`/projects`、`/projects/[...slug]`
> **输入契约**：列表 `getProjects()` + `getProjectCategories()`；详情 `getStaticPaths` 基于 `getProjects()` + `getProjectBySlug(slug)`

## 最小任务
- [ ] **P3-T1** `ProjectGrid`（F2 `Card`：封面/标题/简述/技术标签）。测试渲染
- [ ] **P3-T2** `ProjectFilter` 岛屿：按 category/tag 过滤，**URL query 同步**，空结果态。组件测试 + E2E
- [ ] **P3-T3** `pages/projects/index.astro`：`getProjects` + `getProjectCategories` 组装
- [ ] **P3-T4** `pages/projects/[...slug].astro`：`getStaticPaths`（来自 `getProjects`）+ `getProjectBySlug`；不存在 → 404。`getStaticPaths` 单测
- [ ] **P3-T5** `ProjectLayout` 内容：技术栈、repo/demo（**缺失则不渲染按钮**）、正文 Prose、截图。测试
- [ ] **P3-T6** axe；E2E：筛选 → 进入详情

## 完成标准（DoD）
- [ ] 筛选/排序/置顶正确，空态优雅
- [ ] 详情页缺字段安全降级，axe 0 violations
- [ ] mock DAL 可独立测试，无横向依赖
