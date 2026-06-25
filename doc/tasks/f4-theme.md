# F4 · 主题（暗黑模式）— 任务清单

> **依赖**：F1 · **对应**：FR-GLOBAL-01、NFR-A11Y-03 · detail-design §3-F4
> **产物**：`src/lib/theme.ts`、`src/components/ThemeToggle.ts`（Web Component）、BaseLayout `<head>` 内联脚本
> **契约（DOM）**：`localStorage['theme'] ∈ {light,dark,system}`；切换 `<html>.dark`；派发 `themechange` CustomEvent

## 最小任务
- [x] **F4-T1** `lib/theme.ts` 纯逻辑：`resolveTheme(stored, systemPrefersDark) → 'light'|'dark'`、`cycleTheme(current)`。单元测试覆盖三态全组合
- [x] **F4-T2** `<head>` 内联同步脚本：首帧前读存储/系统偏好并打 `.dark`，**防 FOUC**
- [x] **F4-T3** `<theme-toggle>` Web Component：点击循环切换、写 localStorage、切类、派发 `themechange`；`aria-label` + `aria-pressed`。组件测试
- [x] **F4-T4** E2E：切换后刷新保持；模拟 `prefers-color-scheme: dark`；首屏无闪烁（首帧截图比对）

## 完成标准（DoD）
- [x] 三态切换 + 持久化 + 系统偏好跟随
- [x] 首屏无主题闪烁（FOUC）
- [x] 切换可访问；仅依赖 F1，全站任意页可独立挂载
