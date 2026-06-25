# F7 · 搜索（Pagefind）— 任务清单

> **依赖**：F1、F2（构建期依赖 `dist` 产物，经 `postbuild` 钩子，不污染源码）· **对应**：FR-GLOBAL-02、US-09 · detail-design §3-F7
> **产物**：`postbuild` 脚本、`src/components/Search.tsx`（Preact 岛屿）、`src/pages/search.astro`
> **契约（DOM/岛屿）**：输入框 → Pagefind 运行时 API → 结果列表；键盘 ↑↓ 选择 / Enter 跳转 / Esc 关闭

## 最小任务
- [x] **F7-T1** `package.json` 加 `postbuild: pagefind --site dist`；确认构建产出 `/pagefind/`
- [x] **F7-T2** `Search.tsx`（Preact 岛屿）：输入 → 调 Pagefind API → 渲染结果（标题/摘要/链接）；键盘导航与空结果态。组件测试 mock Pagefind API（含 0 结果）
- [x] **F7-T3** `search.astro` 页 + 导航入口；岛屿 `client:idle` 水合
- [x] **F7-T4** E2E：构建后在预览站搜索真实关键词，校验结果与跳转

## 完成标准（DoD）
- [x] 纯静态全文搜索可用，无后端依赖
- [x] 键盘完全可达，空态优雅
- [x] 岛屿对外 DOM 契约稳定，可独立测试
