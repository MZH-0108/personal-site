# P6 · 摄影 Photos — 任务清单

> **依赖**：F3、F2、F5(`getPhotos`)、`astro:assets`、`Lightbox` · **对应**：FR-PHOTO-01..04 · detail-design §4-P6 · **路由** `/photos`
> **输入契约**：`getPhotos(album?) → PhotoDTO[]`；图片经 `astro:assets` 生成响应式多格式

## 最小任务
- [ ] **P6-T1** `PhotoGrid`：瀑布流/网格；`astro:assets` 响应式 AVIF/WebP；懒加载 + 模糊占位 + **固定宽高比防 CLS**。测试 alt 与尺寸属性
- [ ] **P6-T2** `Lightbox` 岛屿：输入图片列表 + 索引；键盘 ←/→ 切换、`Esc` 关闭、**焦点陷阱**。组件测试 + E2E 键盘操作
- [ ] **P6-T3** 相册分组（可选，按 `album` 字段）
- [ ] **P6-T4** `pages/photos.astro` 组装 + SEO + axe

## 完成标准（DoD）
- [ ] 响应式图片 + 懒加载，无 CLS
- [ ] 灯箱键盘完全可达，焦点陷阱正确
- [ ] axe 0 violations；mock DAL 可独立测试
