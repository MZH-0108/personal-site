# 99 · 部署上线（Deploy）— 任务清单

> **依赖**：全部模块完成 + 质量门禁通过 · **对应**：proposal §9、detail-design §9 · **平台**：Cloudflare Pages
> **前置**：各模块 DoD 已勾选（单测/组件/axe），关键页 Lighthouse 达 proposal §2.2 阈值

## 最小任务
- [ ] **D-T1** 代码推送到 GitHub 仓库（`main` 为生产分支）
- [ ] **D-T2** Cloudflare Pages 连接仓库：构建命令 `npm run build`、输出目录 `dist`、Node ≥ 20、框架预设 Astro
- [ ] **D-T3** 配置环境变量：`PUBLIC_SITE_URL`、`PUBLIC_WEB3FORMS_KEY`、`PUBLIC_TURNSTILE_SITEKEY`（Pages 项目设置，不入库）
- [ ] **D-T4** `public/_headers`：安全响应头（CSP/HSTS/X-Content-Type-Options/Referrer-Policy）；`public/_redirects`（如需）
- [ ] **D-T5** 首次部署验证：生产 URL 可访问、全站 HTTPS
- [ ] **D-T6** 绑定自定义域名（可选，强烈建议）+ 证书校验（提升稳定性、规避 `*.pages.dev` 污染）
- [ ] **D-T7** 提一个 PR 验证**预览部署**自动生成
- [ ] **D-T8** 接入 Cloudflare Web Analytics（无 Cookie）+ UptimeRobot 可用性监控（可选）
- [ ] **D-T9** 生产环境跑 Lighthouse，四项达 proposal §2.2 阈值（Perf/A11y/BP/SEO ≥ 90/95/95/95）
- [ ] **D-T10** 演练回滚（Cloudflare Pages 历史部署一键回滚）

## 完成标准（DoD）
- [ ] 公网可访问、HTTPS 生效
- [ ] push 自动部署、PR 预览生效
- [ ] 监控/回滚预案就绪，Lighthouse 达标
- [ ] （如绑定）自定义域名解析与证书正常
