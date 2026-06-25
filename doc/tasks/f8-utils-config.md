# F8 · 工具与配置 — 任务清单

> **依赖**：无（最底层纯函数）· **对应**：跨模块复用 · detail-design §3-F8
> **产物**：`src/data/site.ts`、`src/lib/utils/{date,reading-time,slug}.ts`
> **契约**：`SiteConfig` 类型、`formatDate/readingMinutes/slugify` 纯函数

## 最小任务
- [x] **F8-T1** `data/site.ts`：`SiteConfig { name; title; description; url; author; email; defaultOgImage; locale:'zh-CN' }` + 类型导出
- [x] **F8-T2** `lib/utils/date.ts`：`formatDate(date, locale='zh-CN')`，处理时区。单测多用例
- [x] **F8-T3** `lib/utils/reading-time.ts`：`readingMinutes(text)`，兼顾中文字数与英文词数估算。单测（空串/纯中文/中英混排）
- [x] **F8-T4** `lib/utils/slug.ts`：`slugify(s)`（小写 kebab，处理中文/空格/符号）。单测
- [x] **F8-T5** 验证路径别名 `@/*` 在源码与测试中可用

## 完成标准（DoD）
- [x] 纯函数，无副作用、无外部依赖
- [x] 单元测试覆盖率 ≥ 90%（含边界）
- [x] 被 F5/F6 及各页面安全复用
