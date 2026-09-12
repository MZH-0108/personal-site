# 马志昊的个人网站

一个以真实项目与经历为中心的 Astro 静态个人网站。采用暖白 / 墨色双主题、彩色肖像和编辑式排版，让初次访问者快速了解背景，也让面试交流有可以深入讨论的案例。

## 主要内容与功能

- 首页：彩色肖像、30 秒面试速览入口、代表作品、能力方向切换、成长时间线。
- 项目：5 个独立案例，支持分类与关键词组合搜索；“馬哥小馆儿”含本地点餐交互演示。
- 经历与关于：工作 / 教育时间线、能力证据、荣誉与校园责任，目录锚点与滚动高亮。
- 简历：专用 A4 打印样式，可通过浏览器打印对话框保存为 PDF。
- 笔记：3 篇完整方法笔记，独立地址、文章目录与阅读字号切换。
- 联系：复制邮箱、项目上下文入口、邮件草稿生成；由访客在自己的邮件应用中确认发送。
- 全站：Ctrl / ⌘ K 搜索、深浅色主题、手机菜单、阅读进度、返回顶部、中文 404、SEO 元数据。

## 内容与隐私边界

- 经历事实来自已有公开简历摘要，见 `src/data/site.ts`，未虚构业务指标。
- 项目扩展内容在 `src/data/case-studies.ts`；笔记在 `src/data/notes.ts`。
- 点餐模块使用示例数据，仅在当前页面运行，不产生真实订单，刷新后清除。
- 项目封面为场景示意，不是生产截图；尚未公开的小程序码与源码不生成假链接。
- 联系表单不上传、不保存信息；主题偏好只保存在访客自己的浏览器。
- 手机号与原始 PDF 简历不公开。打印的是网站上的公开简历摘要。

## 本地开发

```sh
npm ci
npm run dev
```

## 验证

```sh
npm test
npm run check
npm run build
node scripts/verify-build.mjs /
```

构建审计会检查生成页面、图片与 CSS 资源、重复 ID、站内链接及锚点。
本次交互与响应式验收记录见 [2026 年 9 月升级验收](docs/portfolio-upgrade-2026-09.md)。

## 发布

- [GitHub Pages](https://mzh-0108.github.io/personal-site/)
- [源代码仓库](https://github.com/MZH-0108/personal-site)
- GitHub Actions 的 `DEPLOY_TARGET=github-pages` 自动使用 `/personal-site/` 路径与正确站点域名。
- 其他托管平台不设置 `DEPLOY_TARGET`，使用根路径构建。设置 `SITE_URL` 为实际 HTTPS 公开域名后，会生成 canonical、分享卡片绝对地址与 sitemap。
- 不配置 `SITE_URL` 的本地 / 通用预览不会生成假域名 canonical 或 sitemap 条目。
- EdgeOne 的项目 / 临时预览域名不视为已确认的稳定自定义域名。既有部署说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。

本次修改不自动提交或发布，确认内容后可沿用现有发布流程。
