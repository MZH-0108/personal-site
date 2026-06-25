# F2 · UI 原语库 — 任务清单

> **依赖**：F1 · **对应**：proposal §6.6 · detail-design §3-F2
> **产物**：`src/components/ui/*.astro`
> **契约**：各组件 props（见下）；**无业务逻辑、不依赖 DAL**，仅用 F1 token
> **测试范式**：每个组件用 Astro Container API 渲染各状态 + axe 扫描

## 最小任务（每条 = 实现 + 组件测试 + axe）
- [x] **F2-T1** `Button.astro`：`variant: primary|secondary|ghost`、`href?`、`type?`、`disabled?`；有 `href` 渲染 `<a>` 否则 `<button>`。测试三 variant + disabled + 键盘可聚焦
- [x] **F2-T2** `Card.astro`：`as?`、`href?`、`padding?`、`<slot/>`
- [x] **F2-T3** `Tag.astro`：`label`、`href?`、`active?`
- [x] **F2-T4** `Badge.astro`：`label`、`variant?`
- [x] **F2-T5** `Input.astro`：`name/type/label/required?/error?`；`<label>` 与控件关联，错误态 `aria-invalid`+`aria-describedby`
- [x] **F2-T6** `Textarea.astro`：同 Input 契约
- [x] **F2-T7** `Prose.astro`：包裹 Markdown 渲染统一排版（标题/列表/代码/引用/表格）；排版快照测试
- [x] **F2-T8** `Icon.astro`：`name/size?/label?`；Lucide 内联 SVG，装饰性图标 `aria-hidden`，含 `label` 时加 `role=img`+`aria-label`
- [x] **F2-T9** `Avatar.astro`：`src/alt/size?`
- [x] **F2-T10** `Pagination.astro`：`current/total/base`；测试首页/末页边界（禁用上一/下一）
- [x] **F2-T11** `Toc.astro`：`headings[]`（depth/slug/text）→ 嵌套目录

## 完成标准（DoD）
- [x] 所有原语多状态可用，axe 0 violations
- [x] 仅依赖 F1 token，无横向/业务依赖
- [x] 每个组件均有隔离渲染测试
