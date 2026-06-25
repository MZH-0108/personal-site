# P4 · 简历 Resume — 任务清单

> **依赖**：F3、F2、F5(`getSkills`) + `public/resume.pdf` · **对应**：FR-RESUME-01..04 · detail-design §4-P4 · **路由** `/resume`
> **输入契约**：经历数据（education/experience 数组）、技能、证书；PDF 直链

## 最小任务
- [x] **P4-T1** `data/resume.ts`：education/experience 数组 + 类型
- [x] **P4-T2** `ResumeTimeline` 组件（教育/工作时间线）。测试时间顺序
- [x] **P4-T3** `SkillMatrix`（`getSkills`）。测试
- [x] **P4-T4** `DownloadPdfButton`：链接 `public/resume.pdf`，**缺失则禁用并提示**。测试
- [x] **P4-T5** `@media print` 打印友好样式（隐藏 nav/footer）。打印快照测试
- [x] **P4-T6** `pages/resume.astro` 组装 + SEO + axe

## 完成标准（DoD）
- [x] 时间线/技能正确，PDF 可下载
- [x] 打印样式可用，axe 0 violations，可独立测试
