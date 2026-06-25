# P5 · 博客 Blog — 任务清单

> **依赖**：F3、F2(Pagination/Toc/Prose/Tag)、F5、`PostLayout`、F4(代码复制) · **对应**：FR-BLOG-01..07 · detail-design §4-P5
> **路由**：`/blog`、`/blog/[...slug]`、`/blog/tags/[tag]`、`/rss.xml`
> **输入契约**：`getPosts()`（分页）、`getPostBySlug`（含 headings）、`getAdjacentPosts`、`getTags`

## 最小任务
- [ ] **P5-T1** `PostCard`（标题/日期/摘要/标签/阅读时长）。测试
- [ ] **P5-T2** `pages/blog/index.astro`：`getPosts` 分页 + F2 `Pagination`。测试分页边界
- [ ] **P5-T3** `pages/blog/[...slug].astro` + `PostLayout`：`Toc`(by headings) + `Prose` + 上一/下一篇(`getAdjacentPosts`)。`getStaticPaths` 单测
- [ ] **P5-T4** `CodeBlock` 复制按钮岛屿（代码块「复制」）。组件测试
- [ ] **P5-T5** `pages/blog/tags/[tag].astro`：`getTags` + `getPosts({tag})`；空标签 → 404。测试
- [ ] **P5-T6** `pages/rss.xml.ts`：`@astrojs/rss` 读 `getPosts()`，含 title/link/pubDate/description。单测 XML 字段（FR-BLOG-04）
- [ ] **P5-T7** `Callout` MDX 组件（提示块，可选）
- [ ] **P5-T8** `Comments`（Giscus）岛屿（**可选，默认关闭**）
- [ ] **P5-T9** 草稿不出现在生产（依赖 F5 过滤，加回归测试）；axe；E2E 文章导航

## 完成标准（DoD）
- [ ] 列表/详情/标签/RSS/TOC 全可用
- [ ] 草稿过滤、分页、上下篇正确
- [ ] axe 0 violations；mock DAL 可独立测试
