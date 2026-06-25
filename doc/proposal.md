# 个人网站需求文档（Proposal）

> 一份从「零」到「上线」的完整需求规格说明。本文件为后续**设计文档（Design Doc）**、开发与验收的唯一权威依据（Single Source of Truth）。

---

## 0. 文档信息

| 项 | 内容 |
|---|---|
| 文档名称 | 个人网站需求文档 / Personal Website Proposal |
| 版本 | v1.0 |
| 状态 | 待评审（Draft for Review） |
| 创建日期 | 2026-06-24 |
| 作者 | 站主本人 + Claude Code 协作 |
| 适用范围 | 个人品牌网站，从零搭建到公网上线全流程 |
| 关联文档 | `design.md`（待产出，由本文件推导）、`README.md`、`CLAUDE.md` |

### 0.1 修订记录

| 版本 | 日期 | 修改人 | 说明 |
|---|---|---|---|
| v1.0 | 2026-06-24 | — | 初版，确定技术栈（Astro）、内容范围（完整个人站）、部署平台（Cloudflare Pages） |

### 0.2 关键决策摘要（已确认）

| 决策项 | 结论 | 备注 |
|---|---|---|
| 文档与网站语言 | **中文**（界面 i18n-ready，预留英文扩展） | — |
| 技术栈 | **Astro**（静态优先 + 按需岛屿） | 可复用 React 组件 |
| 内容范围 | **完整个人站**（作品集 + 博客 + 摄影 + 兴趣/Now + 时间线 + 友链 + 联系） | — |
| 部署平台 | **Cloudflare Pages**（主）；Vercel / GitHub Pages 为备选 | 免费、无限流量、全球 CDN |
| 成本 | **全程 0 元**（域名为可选自费项） | — |

---

## 1. 项目概述

### 1.1 背景与动机
个人需要一个**可被任何人在浏览器中访问**的个人网站，用于统一承载自我介绍、项目作品、简历、技术博客、摄影作品等内容，建立个人品牌、便于求职/合作方了解，并作为长期可维护的内容沉淀平台。

### 1.2 项目愿景与定位
- **定位**：一个现代、快速、可访问、长期可维护的「完整个人站」。
- **愿景**：访客在 3 秒内理解「我是谁、我做过什么、如何联系我」；内容更新像写一篇 Markdown 一样简单；网站全球访问稳定且免费托管。
- **设计基调**：简洁、专业、有个人特色；内容优先、性能优先、无障碍优先。

### 1.3 项目范围

**纳入范围（In Scope）**
- 站点信息架构与全部页面（见 §4）。
- UI/UX 设计系统（见 §6）。
- 基于 Markdown/MDX 的内容管理（博客、项目、摄影、时间线等）。
- 暗黑模式、响应式、SEO、RSS、站内搜索、可访问性。
- 免费托管上线、自定义域名（可选）、CI/CD 自动部署、基础监控。

**不纳入范围（Out of Scope，本期）**
- 后端数据库、用户登录/注册、后台管理 CMS（采用 Git + Markdown 工作流替代）。
- 评论系统服务端（如需，采用第三方免费方案：Giscus/Waline，列为可选增强）。
- 电商、支付、付费会员等商业功能（免费托管层通常禁止商用）。
- 中国大陆 ICP 备案与境内加速（属付费/合规范畴，见 §9.5）。
- 多语言完整翻译（架构上预留 i18n，但本期仅交付中文内容）。

### 1.4 术语表

| 术语 | 含义 |
|---|---|
| SSG | 静态站点生成（Static Site Generation） |
| 岛屿架构 / Islands | Astro 仅对交互组件加载 JS，其余为纯 HTML |
| Content Collections | Astro 的类型化内容集合（带 frontmatter schema 校验） |
| CWV | Core Web Vitals（LCP/INP/CLS） |
| a11y | 可访问性（Accessibility） |
| Design Token | 设计变量（颜色/间距/字号等），以 CSS 变量落地 |
| CI/CD | 持续集成 / 持续部署 |

---

## 2. 项目目标与成功标准

### 2.1 业务目标
1. **可达**：任何人通过公网 URL 即可访问，全球访问稳定。
2. **专业**：第一屏即传达个人身份与核心价值。
3. **易更新**：新增一篇博客 = 新建一个 Markdown 文件并推送。
4. **零成本**：托管、CDN、HTTPS、CI/CD 全部使用免费额度。
5. **可演进**：未来可平滑增加页面、英文版、评论等。

### 2.2 可量化成功标准（验收 KPI）

| 维度 | 指标 | 目标值 | 测量工具 |
|---|---|---|---|
| 性能 | Lighthouse Performance | ≥ 90 | Lighthouse / PageSpeed Insights |
| 性能 | LCP（最大内容绘制） | < 2.5s（移动 4G） | CWV / Lighthouse |
| 性能 | INP（交互到下一次绘制） | < 200ms | CWV |
| 性能 | CLS（累积布局偏移） | < 0.1 | CWV |
| 性能 | 首屏阻塞 JS（gzip） | < 100 KB | 构建产物分析 |
| 可访问性 | Lighthouse Accessibility | ≥ 95 | Lighthouse |
| 可访问性 | 合规等级 | WCAG 2.2 AA | axe / 手动测试 |
| SEO | Lighthouse SEO | ≥ 95 | Lighthouse |
| 最佳实践 | Lighthouse Best Practices | ≥ 95 | Lighthouse |
| 可用性 | 站点可用率 | ≥ 99.9%（依平台 SLA） | 平台/监控 |
| 构建 | 构建时长 | < 2 min | Cloudflare Pages |
| 兼容 | 主流浏览器最近 2 个版本无致命问题 | 100% | 手动/BrowserStack |

### 2.3 非目标（Non-Goals）
- 不追求复杂动效炫技而牺牲性能与可访问性。
- 不追求"功能大而全"，以内容质量与加载速度为先。

---

## 3. 目标用户与使用场景

### 3.1 用户画像

| 画像 | 诉求 | 关注页面 |
|---|---|---|
| 招聘方 / HR | 快速判断能力与经历，获取简历与联系方式 | 首页、关于、简历、项目 |
| 技术同行 / 社区 | 阅读文章、查看项目源码与技术栈 | 博客、项目、友链 |
| 潜在合作方 / 客户 | 评估专业度与作品，建立联系 | 项目、关于、联系 |
| 普通访客 / 朋友 | 了解近况、浏览摄影与兴趣 | Now、摄影、时间线 |

### 3.2 用户故事（节选，格式：作为…我希望…以便…）
- **US-01** 作为招聘方，我希望在首页一眼看到姓名/头衔/一句话简介与简历入口，以便快速判断是否匹配。
- **US-02** 作为招聘方，我希望能下载 PDF 简历，以便离线归档与转发。
- **US-03** 作为同行，我希望按标签筛选博客文章，以便找到我关心的主题。
- **US-04** 作为同行，我希望订阅 RSS，以便持续追踪更新。
- **US-05** 作为访客，我希望在手机上浏览体验流畅、字号可读，以便随时查看。
- **US-06** 作为访客，我希望切换暗黑模式，以便在夜间舒适阅读。
- **US-07** 作为视障用户，我希望用键盘与读屏软件完整浏览，以便无障碍获取信息。
- **US-08** 作为合作方，我希望通过联系表单或社交链接找到站主，以便发起沟通。
- **US-09** 作为访客，我希望站内搜索文章/项目，以便快速定位内容。

### 3.3 关键用户旅程
1. 搜索引擎/社交分享 → 落地首页 → 浏览项目/博客 → 进入简历 → 通过联系入口建立联系。
2. RSS/书签回访 → 直达博客最新文章 → 标签延伸阅读 → 订阅。

---

## 4. 功能需求

> 优先级采用 MoSCoW：**M**（必须）/ **S**（应当）/ **C**（可选）/ **W**（暂不做）。每条需求带唯一 ID，便于设计与验收追溯。

### 4.1 信息架构（站点地图）

```
/                     首页 Home（Hero + 概览导流）
├── /about            关于 About（个人简介 / 我在做什么 / 技能）
├── /projects         项目列表 Projects（可筛选网格）
│   └── /projects/[slug]   项目详情
├── /resume           简历 Resume（时间线 + 技能 + PDF 下载）
├── /blog             博客列表 Blog
│   ├── /blog/[slug]       文章详情
│   └── /blog/tags/[tag]   标签归档
├── /photos           摄影相册 Photography（瀑布流 + 灯箱）
├── /now              Now / 当前在做（近况）
├── /timeline         时间线 Timeline（人生/职业里程碑）
├── /links            友链 Links（朋友 / 推荐资源）
├── /contact          联系 Contact（表单 + 社交）
├── /search           站内搜索
├── /404              错误页
├── /rss.xml          RSS 订阅源
└── /sitemap-index.xml 站点地图（自动生成）
```

**全局导航（FR-NAV）**
- **FR-NAV-01 (M)**：顶部导航含主要入口（首页/关于/项目/简历/博客/摄影/更多）；移动端折叠为汉堡菜单。
- **FR-NAV-02 (M)**：页脚含社交图标、版权、RSS、回到顶部、站点地图链接。
- **FR-NAV-03 (S)**：当前页高亮；滚动时导航栏行为（吸顶/收起）一致且不遮挡焦点。
- **FR-NAV-04 (S)**：面包屑（详情页）。

### 4.2 页面与模块需求

#### 4.2.1 首页 Home（FR-HOME）
- **FR-HOME-01 (M)**：Hero 区——头像/姓名/头衔/一句话定位 + 主 CTA（查看项目 / 下载简历 / 联系我）。
- **FR-HOME-02 (M)**：精选项目（3-6 个）卡片导流至项目页。
- **FR-HOME-03 (S)**：最新博客（3 篇）摘要导流。
- **FR-HOME-04 (C)**：技能/技术栈徽标墙、社交链接、简短"关于我"。
- **FR-HOME-05 (C)**：动态打字/渐显等轻动效（遵守 `prefers-reduced-motion`）。

#### 4.2.2 关于 About（FR-ABOUT）
- **FR-ABOUT-01 (M)**：个人简介正文（Markdown 维护）。
- **FR-ABOUT-02 (S)**："我在做什么 / 服务"卡片区（参考 vCard 的 What I'm doing）。
- **FR-ABOUT-03 (S)**：技能分类与熟练度（可视化条/标签）。
- **FR-ABOUT-04 (C)**：推荐语 / Testimonials、合作过的组织 Logo 墙。

#### 4.2.3 项目 / 作品 Projects（FR-PROJ）
- **FR-PROJ-01 (M)**：项目以**内容集合**维护，列表页网格展示（封面图 + 标题 + 简述 + 技术标签）。
- **FR-PROJ-02 (M)**：按标签/类别**筛选**与排序（时间/置顶）。
- **FR-PROJ-03 (S)**：项目**详情页**（背景、角色、技术栈、亮点、截图/演示、源码与在线链接）。
- **FR-PROJ-04 (S)**：置顶/精选标记（`featured`）。
- **FR-PROJ-05 (C)**：外部数据（如 GitHub Star 数）——静态构建期抓取，避免运行时依赖。

#### 4.2.4 简历 Resume（FR-RESUME）
- **FR-RESUME-01 (M)**：教育与工作经历**时间线**。
- **FR-RESUME-02 (M)**：技能、证书、语言能力。
- **FR-RESUME-03 (M)**：**PDF 简历下载**（放置于 `public/`，按钮直链）。
- **FR-RESUME-04 (C)**：打印友好样式（`@media print`）。

#### 4.2.5 博客 Blog（FR-BLOG）
- **FR-BLOG-01 (M)**：文章以 Markdown/MDX + frontmatter 维护，列表页分页展示（标题/日期/摘要/标签/阅读时长）。
- **FR-BLOG-02 (M)**：文章详情页——目录（TOC）、代码高亮、图片优化、上一篇/下一篇。
- **FR-BLOG-03 (M)**：标签/分类归档页。
- **FR-BLOG-04 (M)**：**RSS 订阅**（`@astrojs/rss`）。
- **FR-BLOG-05 (S)**：阅读时长、发布/更新时间、草稿（`draft: true` 不发布）。
- **FR-BLOG-06 (C)**：评论（Giscus / Waline，免费第三方，可选增强）。
- **FR-BLOG-07 (C)**：文章内代码块"复制"按钮、Callout/提示块（MDX 组件）。

#### 4.2.6 摄影相册 Photography（FR-PHOTO）
- **FR-PHOTO-01 (M)**：图片以集合维护，瀑布流/网格展示，缩略图懒加载 + 模糊占位。
- **FR-PHOTO-02 (S)**：点击放大**灯箱**（键盘可操作、ESC 关闭、焦点管理）。
- **FR-PHOTO-03 (S)**：EXIF/拍摄说明（可选 frontmatter 字段）、相册分组。
- **FR-PHOTO-04 (M)**：响应式图片（`astro:assets`，AVIF/WebP 多尺寸）。

#### 4.2.7 Now / 当前（FR-NOW）
- **FR-NOW-01 (S)**：单页 Markdown，展示"我现在在做什么/在读/在学"，含更新日期（参考 nownownow.com 风格）。

#### 4.2.8 时间线 Timeline（FR-TIME）
- **FR-TIME-01 (S)**：以数据文件维护人生/职业里程碑，纵向时间线展示。

#### 4.2.9 友链 Links（FR-LINK）
- **FR-LINK-01 (C)**：朋友/推荐资源卡片（头像/名称/简介/链接），数据文件维护。

#### 4.2.10 联系 Contact（FR-CONTACT）
- **FR-CONTACT-01 (M)**：社交与邮箱直链（邮箱做反爬处理）。
- **FR-CONTACT-02 (S)**：**联系表单**——使用免费无后端方案（Formspree / Web3Forms / Cloudflare Pages Functions），含校验、防垃圾（蜜罐/Turnstile）、提交反馈。
- **FR-CONTACT-03 (C)**：地理位置/地图（隐私考虑，默认不放精确位置）。

#### 4.2.11 全局功能（FR-GLOBAL）
- **FR-GLOBAL-01 (M)**：**暗黑模式**切换，记忆用户选择（localStorage），尊重系统偏好，避免首屏闪烁（FOUC）。
- **FR-GLOBAL-02 (M)**：**站内搜索**（Pagefind 或 Fuse.js，构建期索引，纯静态可用）。
- **FR-GLOBAL-03 (M)**：自定义 **404** 页。
- **FR-GLOBAL-04 (M)**：每页 SEO meta（title/description/canonical/OG/Twitter Card）。
- **FR-GLOBAL-05 (M)**：`sitemap.xml`（`@astrojs/sitemap`）、`robots.txt`、`favicon`/PWA 图标。
- **FR-GLOBAL-06 (S)**：i18n 架构预留（语言路由/文案抽离），本期仅中文。
- **FR-GLOBAL-07 (C)**：阅读进度条、回到顶部、页面间 View Transitions 过渡。

### 4.3 内容管理需求（FR-CMS）
- **FR-CMS-01 (M)**：所有可变内容（博客/项目/摄影/时间线/友链/Now）以 **Markdown/MDX + 类型化集合** 或 **数据文件（JSON/YAML/TS）** 维护，**无需改动代码**即可增删内容。
- **FR-CMS-02 (M)**：frontmatter 经 schema 校验（缺字段/类型错误时构建失败并报错）。
- **FR-CMS-03 (S)**：草稿与定时发布（按日期过滤）。
- **FR-CMS-04 (C)**：可选接入轻量可视化编辑（Decap CMS / Pages CMS），非本期必须。

---

## 5. 非功能需求（NFR）

| ID | 类别 | 需求 | 验收方式 |
|---|---|---|---|
| NFR-PERF-01 | 性能 | 满足 §2.2 全部 CWV 与 Lighthouse 目标 | Lighthouse CI |
| NFR-PERF-02 | 性能 | 图片全部经优化（AVIF/WebP、响应式 `srcset`、懒加载、尺寸占位防 CLS） | 手动 + 构建检查 |
| NFR-PERF-03 | 性能 | 字体子集化 + `font-display: swap`，避免阻塞渲染 | 网络面板 |
| NFR-PERF-04 | 性能 | 默认零/极少客户端 JS（岛屿按需） | 产物分析 |
| NFR-A11Y-01 | 可访问性 | 符合 **WCAG 2.2 AA**：语义标签、ARIA、焦点可见、对比度 ≥ 4.5:1、可点击目标 ≥ 24×24px | axe + 手动 |
| NFR-A11Y-02 | 可访问性 | 全站键盘可达、跳转到主内容（skip link）、读屏友好 | 手动 |
| NFR-A11Y-03 | 可访问性 | 尊重 `prefers-reduced-motion`、`prefers-color-scheme` | 手动 |
| NFR-RWD-01 | 响应式 | 移动优先，断点见 §6.5，320px–2560px 全适配 | 多设备测试 |
| NFR-SEO-01 | SEO | 语义化结构、唯一 title/description、canonical、OG/Twitter、结构化数据（JSON-LD：Person/Article/BreadcrumbList） | Lighthouse + Rich Results Test |
| NFR-SEO-02 | SEO | sitemap、robots、规范的 URL（短、语义、kebab-case） | 手动 |
| NFR-COMPAT-01 | 兼容 | Chrome/Edge/Firefox/Safari 最近 2 版本；移动 Safari/Chrome | 手动/BrowserStack |
| NFR-SEC-01 | 安全 | 全站 HTTPS、安全响应头（CSP/HSTS/X-Content-Type-Options/Referrer-Policy） | securityheaders.com |
| NFR-SEC-02 | 安全 | 无密钥泄漏（`.env` 不入库）；表单防垃圾（Turnstile/蜜罐） | 代码审查 |
| NFR-PRIV-01 | 隐私 | 默认不收集个人数据；如用分析，采用隐私友好方案（Cloudflare Web Analytics / Plausible，无 Cookie） | 审查 |
| NFR-MAINT-01 | 可维护 | 组件化、Design Token 化、ESLint/Prettier 统一、TypeScript 类型约束 | 代码审查 |
| NFR-MAINT-02 | 可维护 | 内容与代码分离，新增内容零代码改动 | 演示 |
| NFR-SCALE-01 | 可扩展 | 新增页面/集合/语言成本低，架构预留 i18n | 设计评审 |
| NFR-OBS-01 | 可观测 | 部署状态可见，可选接入访问分析与可用性监控 | 配置检查 |
| NFR-I18N-01 | 国际化 | 文案与 UI 字符串抽离，便于未来翻译 | 代码审查 |

---

## 6. UI/UX 设计需求

> 本章是产出**设计文档/设计稿**的直接输入。提供的具体数值为**起点建议**，可在设计阶段微调，但需保持 token 化与一致性。

### 6.1 设计原则
1. **内容优先**：排版与留白服务于阅读，去除无意义装饰。
2. **性能即设计**：动效、图片、字体都不得损害 CWV。
3. **一致性**：所有视觉决策来源于 Design Token，组件复用。
4. **无障碍内建**：对比度、焦点态、可点击区域在设计阶段即满足 AA。
5. **响应式优先**：移动端为第一设计目标。

### 6.2 品牌与基调
- 关键词：简洁 / 专业 / 现代 / 一点个性。
- 情绪板方向（Moodboard）：大留白、清晰层级、克制的强调色、圆角与轻阴影、细腻的微交互。
- 参考观感：mldangelo（信息密度与简历呈现）、vCard-portfolio（名片式布局与卡片）、Astro 官方主题 AstroPaper/Astrofy（排版与暗色）。

### 6.3 配色系统（Design Tokens，浅色 / 深色双主题）
以 CSS 自定义变量落地，语义命名而非具体色名：

| Token | 浅色（建议） | 深色（建议） | 用途 |
|---|---|---|---|
| `--color-bg` | `#ffffff` | `#0d1117` | 页面背景 |
| `--color-surface` | `#f6f8fa` | `#161b22` | 卡片/面板 |
| `--color-text` | `#1f2328` | `#e6edf3` | 正文 |
| `--color-text-muted` | `#57606a` | `#9198a1` | 次要文字 |
| `--color-primary` | `#2f6feb` | `#4493f8` | 主强调/链接 |
| `--color-primary-hover` | `#1a5fd0` | `#69a8ff` | 交互态 |
| `--color-border` | `#d0d7de` | `#30363d` | 分隔线/边框 |
| `--color-success/warn/danger` | 语义色 | 语义色 | 状态提示 |

- **对比度**：正文与背景 ≥ 4.5:1，大字 ≥ 3:1（满足 NFR-A11Y-01）。
- 强调色仅作为点缀（链接、按钮、标签），避免大面积高饱和。

### 6.4 字体排印
- **中文字体栈**（系统字体优先，零额外加载）：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`。
- **英文/数字**：`Inter, -apple-system, "Segoe UI", Roboto, sans-serif`。
- **等宽（代码）**：`"JetBrains Mono", "Cascadia Code", Consolas, monospace`。
- **可选品牌标题字**：若引入 Web Font，须子集化 + `font-display: swap` + 预加载，受 NFR-PERF-03 约束。
- **字号阶梯（建议，rem，1rem=16px）**：H1 2.5 / H2 2.0 / H3 1.5 / H4 1.25 / 正文 1.0 / 小字 0.875；行高正文 1.6–1.75，标题 1.2–1.3。
- **可读性**：正文行宽 60–80 字符（中文约 30–40 字），段距充足。

### 6.5 间距、栅格与断点
- **间距刻度（4px 基准）**：4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。
- **内容最大宽度**：正文容器约 720–800px；宽内容（项目/摄影网格）约 1080–1280px。
- **断点（移动优先）**：

| 名称 | 宽度 | 典型布局 |
|---|---|---|
| base | < 640px | 单列、汉堡菜单 |
| sm | ≥ 640px | 单列加宽 |
| md | ≥ 768px | 双列网格、显示侧栏 |
| lg | ≥ 1024px | 多列、完整导航 |
| xl | ≥ 1280px | 宽屏内容容器 |

### 6.6 组件清单（设计 + 实现的最小集合）
导航栏、移动端抽屉菜单、页脚、主题切换开关、按钮（主/次/文本）、链接、标签/徽章、卡片（项目/文章/友链）、面包屑、分页、目录 TOC、代码块（含复制按钮）、Callout 提示块、头像、技能条、时间线条目、图片灯箱、表单（输入/文本域/校验/提交态）、Toast/反馈、Skip-link、回到顶部、加载/骨架、空状态、404 插画。

### 6.7 暗黑模式
- 跟随系统 + 手动切换三态（system/light/dark）或二态切换；持久化到 localStorage。
- 通过在 `<html>` 上设置 `data-theme` 或 `.dark` 类驱动 token 切换。
- **防闪烁**：在 `<head>` 内联一段极小脚本，于首帧前应用主题。

### 6.8 动效与交互
- 默认轻量：淡入、位移 ≤ 8px、时长 150–300ms、缓动自然。
- 页面切换可用 Astro **View Transitions**。
- **强约束**：`prefers-reduced-motion: reduce` 时禁用非必要动画。
- 悬停/聚焦态清晰；焦点环不可被遮挡（WCAG 2.2 Focus Not Obscured）。

### 6.9 图标、插画与图片规范
- 图标：统一图标库（如 Lucide / Tabler，SVG，按需内联）。
- 图片：统一裁切比例与圆角；提供 alt；首屏图 `loading="eager"`+`fetchpriority="high"`，其余懒加载；导出 AVIF/WebP 多尺寸。
- OG 分享图：每页/每文可生成（可用构建期 Satori/`astro-og-canvas`）。

### 6.10 设计交付物（设计文档需包含）
1. Design Tokens 全量表（颜色/字号/间距/圆角/阴影/动效）。
2. 组件库视觉规范（各组件多状态：默认/悬停/聚焦/禁用/暗色）。
3. 关键页面高保真稿（首页/关于/项目列表+详情/博客列表+详情/摄影/联系/404）——桌面 + 移动。
4. 交互说明（导航、主题切换、灯箱、表单、搜索、过渡）。
5. 可访问性标注（对比度、焦点顺序、ARIA）。

---

## 7. 技术架构

### 7.1 技术选型与理由

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | **Astro（最新稳定版）** | 静态优先、岛屿架构、默认零 JS，契合内容型个人站，性能/SEO 天然优秀 |
| UI 组件 | Astro 组件 + 按需 React 岛屿 | 交互处（搜索、灯箱、主题切换、表单）用 React/原生，其余纯静态 |
| 样式 | Tailwind CSS（或原生 CSS + 变量），统一 Design Token | 快速、一致、可维护；二选一在设计文档定稿 |
| 内容 | Astro **Content Collections**（Markdown/MDX + Zod schema） | 类型安全、构建期校验、内容与代码解耦 |
| 图片 | `astro:assets` | 自动响应式/格式转换/懒加载 |
| 搜索 | **Pagefind**（构建期索引，纯静态） | 无需后端、性能好；备选 Fuse.js |
| RSS/Sitemap | `@astrojs/rss` + `@astrojs/sitemap` | 官方集成 |
| 语言 | TypeScript | 类型安全、可维护 |
| 包管理 | pnpm（或 npm） | 快、省盘 |
| 代码质量 | ESLint + Prettier + （可选）Astro Check | 统一风格、类型校验 |
| 表单 | Web3Forms / Formspree / Pages Functions | 免费、无需自建后端 |
| 分析（可选） | Cloudflare Web Analytics | 免费、无 Cookie、隐私友好 |

### 7.2 系统架构（文字描述）
纯静态站点：源码 + Markdown 内容存于 GitHub 仓库 → 推送触发 Cloudflare Pages 构建（`astro build` 产出 `dist/` 静态资源）→ 经 Cloudflare 全球 CDN 分发 → 浏览器访问。联系表单等动态能力通过第三方无服务或 Pages Functions 处理；搜索索引在构建期生成，运行时纯前端检索。**无需自建服务器与数据库。**

### 7.3 目录结构（建议）

```
personalWebsite/
├── doc/
│   ├── proposal.md          # 本需求文档
│   └── design.md            # 设计文档（后续产出）
├── public/                  # 静态资源（favicon、resume.pdf、robots.txt、OG 图）
├── src/
│   ├── components/          # UI 组件（Nav、Footer、Card、ThemeToggle、Lightbox…）
│   ├── layouts/             # 布局（BaseLayout、PostLayout、ProjectLayout）
│   ├── pages/               # 路由（index、about、projects、blog、photos…）
│   │   ├── projects/[...slug].astro
│   │   ├── blog/[...slug].astro
│   │   └── blog/tags/[tag].astro
│   ├── content/             # 内容集合
│   │   ├── config.ts        # 集合 schema 定义
│   │   ├── blog/            # 博客 Markdown/MDX
│   │   ├── projects/        # 项目
│   │   └── photos/          # 摄影
│   ├── data/                # 站点配置/导航/时间线/友链/技能（TS/JSON/YAML）
│   ├── styles/              # 全局样式与 Design Token（CSS 变量）
│   ├── lib/                 # 工具函数（日期、阅读时长、SEO helper）
│   └── i18n/                # 文案字典（预留）
├── astro.config.mjs         # Astro 配置与集成
├── tailwind.config.* / tsconfig.json / package.json
├── .eslintrc / .prettierrc
├── .gitignore / .env.example
├── CLAUDE.md                # 给 AI 协作者的项目说明（可用 /init 生成）
└── README.md
```

### 7.4 内容数据模型（Content Collections Schema 示例）

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    summary: z.string(),
    cover: image(),
    tech: z.array(z.string()),
    category: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    date: z.date(),
  }),
});

const photos = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    title: z.string(),
    src: image(),
    album: z.string().optional(),
    takenAt: z.date().optional(),
    location: z.string().optional(),
    caption: z.string().optional(),
  }),
});

export const collections = { blog, projects, photos };
```

> 站点级数据（导航、社交、技能、时间线、友链、Now）放 `src/data/*`，同样建议用 TS + 类型约束。

### 7.5 依赖与版本策略
- 锁定 `package-lock`/`pnpm-lock`；指定 Node LTS（≥ 20）。
- 依赖最小化；定期（如每季度）升级并回归测试；使用 Renovate/Dependabot（可选）。

### 7.6 配置与环境变量
- 公开配置（站点名、URL、社交）放 `src/data/site.ts`。
- 敏感项（表单密钥、分析 ID）放 `.env`（不入库），`.env.example` 提供模板；在 Cloudflare Pages 项目设置中配置同名变量。

---

## 8. 内容资源需求（上线前必须备齐）

| 资源 | 说明 | 状态/负责人 |
|---|---|---|
| 个人信息 | 姓名、头衔、一句话简介、长简介 | 待提供 |
| 头像 / Logo | 高清头像（≥ 512px）、favicon 源图 | 待提供 |
| 简历 PDF | 中文简历（必要时英文版） | 待提供 |
| 项目清单 | 每个项目：标题/简述/技术栈/封面/截图/链接/正文 | 待提供 |
| 博客首发文 | ≥ 3 篇，避免上线即空站 | 待撰写 |
| 摄影作品 | ≥ 10 张精选（含说明/可选 EXIF） | 待提供 |
| 时间线 | 关键里程碑列表 | 待提供 |
| 友链 | 朋友/资源列表（可选） | 待提供 |
| 社交链接 | GitHub / 邮箱 / 其他平台 | 待提供 |
| 文案润色 | 各页面中文文案定稿 | 待定稿 |
| 法务 | 版权声明、隐私说明（如启用分析/表单） | 待定稿 |

> **风险提示**：内容缺失是个人站最常见的延期原因。建议在开发并行期同步备内容（见 §10 里程碑）。

---

## 9. 部署与运维

### 9.1 平台选型矩阵

| 维度 | **Cloudflare Pages（推荐）** | Vercel | GitHub Pages |
|---|---|---|---|
| 价格 | 免费 | 免费（Hobby） | 免费 |
| 流量 | **无限** | 100 GB/月 | ~100 GB/月（软限） |
| 构建额度 | 500 次/月 | 充足 | 10 次/小时（软限） |
| CDN | 全球，最快之一 | 全球 | Fastly |
| 商用 | **允许** | Hobby **禁止商用** | **禁止商用** |
| 自定义域名 + HTTPS | ✅ 免费 | ✅ 免费 | ✅ 免费 |
| Astro 支持 | ✅（静态/SSR 适配器） | ✅（集成最顺滑） | ✅（静态） |
| 无服务函数 | ✅ Pages Functions | ✅ | ❌ |
| 适合度 | **内容型静态站最佳综合** | DX 最佳 | 最省心 |

**结论**：选 **Cloudflare Pages**——免费且无限流量、全球最快 CDN 之一、允许个人/商用、原生支持 Astro，并提供 Pages Functions 处理表单等轻动态。

### 9.2 CI/CD 流程
1. 源码托管 GitHub（`main` 为生产分支，功能分支开发）。
2. Cloudflare Pages 连接仓库：构建命令 `npm run build`，输出目录 `dist`，框架预设 Astro，Node 版本 ≥ 20。
3. **推送 `main` → 自动构建并发布生产**；**Pull Request → 自动生成预览部署 URL**（评审用）。
4. （可选）GitHub Actions 跑 lint / `astro check` / **Lighthouse CI**，未达 §2.2 阈值则 PR 失败。

### 9.3 域名与 HTTPS
- 默认提供 `*.pages.dev` 子域，开箱即用。
- **强烈建议绑定自定义域名**（自费购买，约 ¥30–80/年）：提升专业度与稳定性，规避 `*.pages.dev` 在部分网络被污染/限制的风险。
- HTTPS 由平台自动签发与续期（Let's Encrypt / Cloudflare）。

### 9.4 稳定性、监控与回滚
- **稳定性**：纯静态 + 全球 CDN，天然高可用，无服务器单点。
- **监控（可选免费）**：Cloudflare Web Analytics（访问量）、UptimeRobot（可用性探测，免费 50 监控）。
- **回滚**：Cloudflare Pages 保留历史部署，可一键回滚到任意先前版本。
- **备份**：源码与内容皆在 Git，天然多副本；重要图片建议原图另存。

### 9.5 中国大陆访问权衡（重要说明）
- 免费层的 `*.pages.dev`、`*.vercel.app`、`*.github.io` 在中国大陆均可能遭遇 **DNS 污染、限速或不稳定**，无法保证大陆高速访问。
- **缓解措施**：绑定自定义域名（显著改善被污染问题）、图片/字体走 CDN、控制首屏体积。
- **彻底解决**需 **ICP 备案 + 境内 CDN/服务器**（涉及实名、付费、合规审核），**超出本期"免费 + 简单"范围**，列为未来可选项。
- **决策建议**：若主要受众在海外或可接受大陆中等速度，Cloudflare Pages + 自定义域名为当前最优免费方案。

### 9.6 成本核算
| 项 | 费用 |
|---|---|
| 托管 / CDN / HTTPS / CI-CD | ¥0（Cloudflare Pages 免费层） |
| 表单 / 搜索 / 分析 | ¥0（免费方案） |
| 自定义域名（可选） | 约 ¥30–80 / 年 |
| **合计** | **¥0（不绑域名）/ ≈¥30–80 年（绑域名）** |

---

## 10. 开发计划与里程碑（从零到上线）

> 每阶段含**交付物**与**退出标准（DoD）**；并标注可借助的 Claude Code 工具链（详见附录 B）。

| 阶段 | 目标 | 交付物 | 退出标准 | 工具链 |
|---|---|---|---|---|
| **M0 设计定稿** | 据本文件产出 `design.md` 与高保真稿 | 设计文档、Design Token、关键页面稿 | 设计评审通过，token 确定 | `Plan` 子代理、设计评审 |
| **M1 环境与脚手架** | 初始化 Astro 项目与工程化 | 可运行的空站、目录结构、ESLint/Prettier/TS、`CLAUDE.md` | `npm run dev` 正常，CI 通过 | `run` skill、`/init` |
| **M2 设计系统落地** | 实现 Design Token、基础组件、布局、暗黑模式 | 组件库、BaseLayout、主题切换 | 组件多状态符合设计、无 FOUC | Claude Preview MCP（预览+截图） |
| **M3 核心页面** | 首页 / 关于 / 项目（列表+详情）/ 简历 | 4 大页面 + 内容集合 schema | 内容可驱动、响应式达标 | 前端子代理、`verify` skill |
| **M4 内容模块** | 博客（RSS/标签/TOC）/ 摄影 / 时间线 / Now / 友链 / 联系 | 全部页面 + 表单 + 搜索 | 功能符合 FR、搜索/RSS 可用 | Claude-in-Chrome MCP（交互测试） |
| **M5 质量打磨** | 性能 / 可访问性 / SEO / 兼容性 | 优化后的站点、Lighthouse 报告 | 达 §2.2 全部 KPI、WCAG 2.2 AA | Lighthouse、`code-review`、`security-review` |
| **M6 部署上线** | 接入 Cloudflare Pages、域名、监控 | 公网可访问站点、回滚预案 | 生产可访问、HTTPS、预览部署生效 | Cloudflare Pages |
| **M7 迭代运维** | 持续写作与优化 | 内容更新流程文档 | 新增内容零代码、流程跑通 | `skill-creator`（固化发文流程，可选） |

> 内容采集（§8）应在 M3–M5 并行进行，避免上线即空站。

---

## 11. 验收标准（上线 Checklist）

**功能**
- [ ] 站点地图所列页面全部可访问、互相导航正确（FR-NAV/各 FR）。
- [ ] 项目可筛选、详情完整；博客有列表/详情/标签/RSS；摄影灯箱可用；联系表单可提交并有反馈。
- [ ] 暗黑模式切换正常且无闪烁；站内搜索可用；404 自定义。
- [ ] 简历 PDF 可下载；社交链接正确。
- [ ] 新增一篇博客/一个项目，仅通过新增内容文件即可发布（FR-CMS）。

**非功能**
- [ ] Lighthouse 四项（Perf/A11y/BP/SEO）均达 §2.2 目标。
- [ ] CWV：LCP < 2.5s、INP < 200ms、CLS < 0.1。
- [ ] WCAG 2.2 AA：键盘可达、对比度、焦点可见、目标尺寸、reduced-motion。
- [ ] 主流浏览器最近两版无致命问题；移动端适配良好。
- [ ] HTTPS + 安全响应头通过检测；无密钥泄漏。
- [ ] sitemap/robots/OG/结构化数据齐备。

**部署运维**
- [ ] 推送 `main` 自动部署、PR 生成预览。
- [ ] （如启用）自定义域名解析正确、证书有效。
- [ ] 监控/回滚预案就绪。

**文档可推导性（本需求的元验收）**
- [ ] 本文件覆盖「从零到上线」全流程（设计→开发→测试→部署→运维）。
- [ ] 据本文件 §6 可直接产出设计文档；据 §4/§7 可直接产出技术设计与任务拆分。

---

## 12. 风险与对策

| 风险 | 概率 | 影响 | 对策 |
|---|---|---|---|
| 中国大陆访问慢/被污染 | 高 | 中 | 绑定自定义域名；控首屏体积；必要时未来备案+境内 CDN（§9.5） |
| 内容缺失致延期 | 高 | 高 | 内容与开发并行；先准备 ≥3 篇博客与核心文案（§8） |
| 范围蔓延（功能过多） | 中 | 中 | MoSCoW 严格执行；C/W 项延后至迭代期 |
| 性能不达标（图/字/JS） | 中 | 中 | astro:assets、字体子集、岛屿按需、Lighthouse CI 守门 |
| 可访问性遗漏 | 中 | 中 | 设计阶段内建 a11y；axe + 手动测试纳入验收 |
| 平台免费政策变动 | 低 | 中 | 纯静态可移植，保留 Vercel/GitHub Pages 备选；源码在 Git |
| 依赖升级破坏 | 低 | 中 | 锁版本、定期回归、预览部署先验证 |
| 表单被滥用/垃圾提交 | 中 | 低 | Turnstile/蜜罐、第三方免费服务自带反垃圾 |

---

## 13. 附录

### 附录 A：参考项目
| 项目 | 链接 | 借鉴点 |
|---|---|---|
| mldangelo/personal-site | https://github.com/mldangelo/personal-site · https://mldangelo.com/projects | 信息架构、简历呈现、Markdown 博客 + RSS、暗黑模式、静态导出 |
| codewithsadee/vcard-personal-portfolio | https://github.com/codewithsadee/vcard-personal-portfolio | vCard 名片式布局、卡片与可筛选作品网格、联系表单 UI |
| WinterChenS/my-site | https://github.com/WinterChenS/my-site | 功能广度（摄影相册、文章归档、评论）——以静态方案等价实现 |
| Astro 官方主题 | https://astro.build/themes/ | AstroPaper/Astrofy 等排版与暗色实现参考 |

### 附录 B：工具链（skills / MCP / subagents）

> 以下多为**当前环境已内置**的能力，建站时直接调用；需新建/安装的项会**单独征得确认**后进行。

**MCP 服务**
| 名称 | 用途 | 状态 |
|---|---|---|
| Claude Preview MCP | 启动本地 dev server、截图、DOM 求值，开发期可视化验证 | 内置 |
| Claude-in-Chrome MCP | 真浏览器导航/点击/填表/改尺寸，做交互与响应式测试 | 内置 |

**Skills（斜杠技能）**
| 名称 | 用途 |
|---|---|
| `run` | 启动并预览 Astro 应用 |
| `verify` | 在浏览器中验证改动是否真正生效 |
| `code-review` | 评审改动，抓正确性与可简化项 |
| `security-review` | 上线前安全走查 |
| `init` | 生成项目 `CLAUDE.md` |
| `skill-creator` | （可选）把「发布新文章」等流程固化为自定义 skill |

**Subagents（子代理）**
| 名称 | 用途 |
|---|---|
| `Plan` | M0 架构与实现规划 |
| `Explore` | 检索代码/资源/命名 |
| `general-purpose` | 复杂调研与多步任务 |
| 自定义「前端实现」子代理（建议新建） | 批量实现页面/组件 |
| 自定义「设计走查」子代理（可选） | 对照 §6 规范核查 UI/a11y |

> **安装/创建说明**：MCP 与上述 skills 已可用；自定义 subagents 通过在 `.claude/agents/*.md` 新建定义文件实现；如需安装额外 MCP/skill，会在执行前确认。MCP 注册表暂无第三方部署/设计类连接器，故采用内置能力。

### 附录 C：命名与代码规范（建议）
- URL/文件 slug：小写 kebab-case；目录按集合归类。
- 组件：PascalCase；变量/函数：camelCase；常量：UPPER_SNAKE。
- 提交信息：约定式提交（`feat:`/`fix:`/`docs:`/`style:`/`refactor:`/`chore:`）。
- 分支：`main`（生产）+ `feat/*`、`fix/*`。
- 统一 Prettier + ESLint + `astro check`。

### 附录 D：参考链接
- Astro 文档与主题：https://astro.build/ · https://astro.build/themes/
- 部署对比：https://danubedata.ro/blog/cloudflare-pages-vs-netlify-vs-vercel-static-hosting-2026
- Vercel 中国访问说明：https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china
- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- WCAG 2.2：https://www.w3.org/TR/WCAG22/
- Core Web Vitals：https://web.dev/articles/vitals
- Pagefind（静态搜索）：https://pagefind.app/

### 附录 E：与设计文档（design.md）的衔接
本需求文档为设计文档的直接输入。`design.md` 应据此细化：
1. **视觉设计**：据 §6 输出完整 Design Token 表、组件视觉规范、关键页面高保真稿（桌面+移动）。
2. **技术设计**：据 §4/§7 输出组件树、路由表、内容 schema 定稿、数据流、SEO/性能实现方案。
3. **任务拆分**：据 §4 的 FR-ID 与 §10 里程碑，拆为可执行的开发任务（含优先级与依赖）。
4. **测试方案**：据 §2.2/§5/§11 制定性能、可访问性、兼容性、功能验收测试用例。

---

> **文档结束**。如需据本文件产出 `design.md`（设计文档）或开始 M1 脚手架搭建，请告知。
