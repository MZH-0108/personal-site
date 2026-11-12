# F6 · SEO / Meta — 任务清单

> **依赖**：F8 · **对应**：NFR-SEO-01/02、FR-GLOBAL-04/05 · detail-design §3-F6
> **产物**：`src/components/Seo.astro`、`src/lib/seo.ts`、`public/robots.txt`、sitemap 集成
> **契约**：`SeoProps { title; description; canonical?; image?; type?; jsonLd?; noindex? }`

## 最小任务
- [x] **F6-T1** `lib/seo.ts`：`buildPersonJsonLd()`、`buildArticleJsonLd(post)`、`buildBreadcrumbJsonLd(items)`。单测输出符合 schema.org 结构
- [x] **F6-T2** `Seo.astro`：渲染 title/description/canonical/OG（type/title/desc/image/url）/Twitter Card/可选 JSON-LD/`noindex`。组件测试断言各 `<meta>` 齐全
- [x] **F6-T3** 配置 `@astrojs/sitemap`；创建 `public/robots.txt`（指向 sitemap）。构建产物存在性测试
- [x] **F6-T4** 默认 OG 图（`public/og-default.png`）或构建期生成方案（`astro-og-canvas`，可选）

## 完成标准（DoD）
- [x] 每页可输出唯一且完整的 meta 与结构化数据
- [x] sitemap/robots 正确产出
- [x] 仅依赖 F8 site config，可独立测试
