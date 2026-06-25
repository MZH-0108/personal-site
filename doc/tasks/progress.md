# 总体进度 Progress

> 个人网站「从零到上线」总进度看板。勾选代表该模块**全部子任务 + DoD 完成**。
> 各模块明细见同目录对应 `.md`。来源：[proposal.md](../proposal.md) · [detail-design.md](../detail-design.md)

## 进度统计
- 基础设施：**1 / 1**（setup）✅
- 基础模块：**8 / 8**（F1–F8）✅
- 功能模块：**6 / 11**（P1–P11）
- 上线：**0 / 1**（deploy）
- **总计：15 / 21**

## 推荐执行顺序（依赖关系）
```
00-setup
  └─ F8 → F1 → F2 → F4 → F6 → F5 ─┐         （基础设施，按序）
                F3（依赖 F1/F2/F4/F5/F6）─┤
                F7（依赖 F1/F2 + 构建产物）─┘
                          │
         F5 就绪后 ↓ P1–P11 可并行开发（各自 mock DAL 独立测试）
  P1 P2 P3 P4 P5 P6 P7 P8 P9 P10 P11
                          │
                       99-deploy（全部完成 + 质量门禁后）
```

## 基础设施
- [x] **00 · 脚手架搭建** → [00-setup.md](./00-setup.md)

## 基础模块 Foundation
- [x] **F1 · 设计系统 / Tokens** → [f1-design-tokens.md](./f1-design-tokens.md)　_(T6 展示页 / T8 视觉回归延后 backlog)_
- [x] **F2 · UI 原语库** → [f2-ui-primitives.md](./f2-ui-primitives.md)　_(axe 0 violations 在 P 层 E2E 验证)_
- [x] **F3 · 布局与导航** → [f3-layout-nav.md](./f3-layout-nav.md)　_(移动菜单/焦点 E2E 走 Playwright)_
- [x] **F4 · 主题（暗黑模式）** → [f4-theme.md](./f4-theme.md)　_(E2E 持久化/防闪 走 Playwright)_
- [x] **F5 · 内容与数据访问层 DAL** → [f5-content-dal.md](./f5-content-dal.md)
- [x] **F6 · SEO / Meta** → [f6-seo.md](./f6-seo.md)
- [x] **F7 · 搜索（Pagefind）** → [f7-search.md](./f7-search.md)　_(真实索引搜索 E2E 走 Playwright)_
- [x] **F8 · 工具与配置** → [f8-utils-config.md](./f8-utils-config.md)

## 功能模块 Feature
- [ ] **P1 · 首页 Home** → [p1-home.md](./p1-home.md)
- [x] **P2 · 关于 About** → [p2-about.md](./p2-about.md)
- [ ] **P3 · 项目 Projects** → [p3-projects.md](./p3-projects.md)
- [x] **P4 · 简历 Resume** → [p4-resume.md](./p4-resume.md)　_(public/resume.pdf 资产待补)_
- [ ] **P5 · 博客 Blog** → [p5-blog.md](./p5-blog.md)
- [ ] **P6 · 摄影 Photos** → [p6-photos.md](./p6-photos.md)
- [x] **P7 · Now** → [p7-now.md](./p7-now.md)
- [x] **P8 · 时间线 Timeline** → [p8-timeline.md](./p8-timeline.md)
- [x] **P9 · 友链 Links** → [p9-links.md](./p9-links.md)
- [ ] **P10 · 联系 Contact** → [p10-contact.md](./p10-contact.md)
- [x] **P11 · 错误页 404** → [p11-404.md](./p11-404.md)

## 上线
- [ ] **99 · 部署上线** → [99-deploy.md](./99-deploy.md)

## 质量门禁（每模块合并前）
- [ ] 单元/组件测试通过　- [ ] axe 0 violations　- [ ] ESLint 依赖边界通过（无跨功能模块 import）
- [ ] 关键页 Lighthouse 达 proposal §2.2 阈值（上线前统一复核）

---
> 用法：完成某模块全部子任务与 DoD 后，将对应 `- [ ]` 改为 `- [x]` 并更新「进度统计」。
