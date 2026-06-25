# F3 · 布局与导航 — 任务清单

> **依赖**：F1、F2、F4、F5、F6 · **对应**：FR-NAV-*、FR-GLOBAL-04/05 · detail-design §3-F3
> **产物**：`src/layouts/{BaseLayout,PostLayout,ProjectLayout}.astro`、`src/components/{Nav,Footer,Breadcrumb}.astro`
> **契约**：`BaseLayoutProps { title; description; image?; type?; breadcrumb?; noindex? }`；页面经 `<slot/>` 注入内容

## 最小任务
- [x] **F3-T1** `BaseLayout.astro`：注入 `<head>`（F4 主题脚本 + F6 `<Seo>`）、skip-link、`<Nav>`、`<main><slot/></main>`、`<Footer>`。测试含 skip-link/`<main>`/Seo meta
- [x] **F3-T2** `Nav.astro`：数据来自 `getNav()`（不硬编码）；当前路由 `aria-current="page"` 高亮。测试 mock nav
- [x] **F3-T3** 移动端汉堡菜单（Web Component，无框架）：键盘可开关、`Esc` 关闭、焦点管理。E2E 验证
- [x] **F3-T4** `Footer.astro`：`getSocials()` 社交图标、版权、RSS 链接、回到顶部、sitemap 链接
- [x] **F3-T5** `Breadcrumb.astro`：`items[]`，配合 F6 输出 BreadcrumbList JSON-LD
- [x] **F3-T6** `PostLayout.astro`：TOC + Prose + 上一/下一篇 的结构插槽（供 P5 用）
- [x] **F3-T7** `ProjectLayout.astro`：封面/技术栈/repo·demo 链接/正文（供 P3 用）
- [x] **F3-T8** axe 扫描布局；E2E：导航吸顶不遮挡聚焦元素（WCAG 2.2 Focus Not Obscured）

## 完成标准（DoD）
- [x] 布局以 slot 注入，页面无需关心导航/页脚实现
- [x] 导航/页脚数据驱动（getNav/getSocials）
- [x] a11y 通过；移动菜单键盘可用
