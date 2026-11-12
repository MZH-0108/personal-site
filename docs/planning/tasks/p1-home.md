# P1 · 首页 Home — 任务清单

> **依赖**：F3、F2、F5 · **对应**：FR-HOME-01..05 · detail-design §4-P1 · **路由** `/`
> **输入契约**：`getFeaturedProjects(6)`、`getPosts()[0..3]`、`getSiteConfig()`
> **独立测试**：`vi.mock('@/lib/dal')` 注入假数据，无需真实内容即可渲染断言

## 最小任务
- [ ] **P1-T1** `components/features/home/Hero.astro`：头像/姓名/头衔/一句话定位 + 主 CTA（查看项目/下载简历/联系我）。测试渲染与 CTA 链接
- [ ] **P1-T2** `FeaturedProjects` 区：`getFeaturedProjects(6)` 用 F2 `Card` 网格；**无数据则隐藏**。测试 mock 0/6
- [ ] **P1-T3** `LatestPosts` 区：`getPosts()` 取前 3；**无数据则隐藏**。测试 mock 0/3
- [ ] **P1-T4** `SkillsStrip`（可选）：技术栈徽标墙
- [ ] **P1-T5** `pages/index.astro` 组装 + `BaseLayout`（Person JSON-LD）
- [ ] **P1-T6** 性能/可访问性：Hero 图 `fetchpriority="high"`、CTA 为真链接、遵守 reduced-motion；axe
- [ ] **P1-T7** E2E：首屏 CTA 点击跳转正确

## 完成标准（DoD）
- [ ] 区块按数据有无正确显隐
- [ ] 首屏性能达标，axe 0 violations
- [ ] 仅依赖 F 层，mock DAL 可独立测试
