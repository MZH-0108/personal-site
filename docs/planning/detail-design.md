# 个人网站 详细设计文档（Detailed Design）

> 本文件依据 [需求文档 proposal.md](./proposal.md) 编写，是开发与测试的低层设计（LLD）依据。
> **第一设计原则：模块高内聚、低耦合，每个模块可独立开发、独立测试。**

---

## 0. 文档信息

| 项 | 内容 |
|---|---|
| 文档名称 | 个人网站详细设计文档 / Detailed Design |
| 版本 | v1.0 |
| 状态 | 待评审（Draft for Review） |
| 创建日期 | 2026-06-24 |
| 上游文档 | `doc/proposal.md`（需求） |
| 下游产物 | 源码、测试用例、开发任务拆分 |
| 关键技术决策 | Astro + **Tailwind v4 + CSS 变量 token** + TypeScript + Content Collections + Pagefind + Cloudflare Pages |

### 0.1 修订记录
| 版本 | 日期 | 说明 |
|---|---|---|
| v1.0 | 2026-06-24 | 初版：模块划分、契约、独立测试方案、追溯矩阵 |

---

## 1. 引言与设计目标

### 1.1 目的与范围
将 proposal 的需求转化为**可直接实现与测试**的设计：模块划分、模块契约（接口/数据）、组件结构、交互流程、数据模型、测试方案、构建部署。范围覆盖 proposal §4–§10 的全部功能/非功能/部署需求。

### 1.2 设计原则（按优先级）
1. **模块独立性（首要）**：模块边界清晰，单向依赖，模块间通过**显式契约**通信，任一模块可在隔离环境中渲染与测试。
2. **内容与代码解耦**：内容经数据访问层（DAL）供给，页面不感知存储细节。
3. **性能即设计**：默认零 JS，交互以"岛屿"按需水合。
4. **可访问性与语义内建**：组件层即满足 WCAG 2.2 AA。
5. **可维护可演进**：Design Token 化、TypeScript 类型约束、约定式结构。

### 1.3 与 proposal 的追溯关系
本文每个模块标注其实现的需求 ID（FR-xxx / NFR-xxx）；§10 提供完整 **需求→模块→测试** 追溯矩阵，作为"全面贯穿项目"的核对依据。

---

## 2. 总体架构设计

### 2.1 架构概览（分层）
纯静态站点，构建期生成 HTML/CSS/最小 JS，运行时无服务端依赖。逻辑分四层，依赖**自上而下单向**：

```
┌─────────────────────────────────────────────────────────┐
│  L4 功能模块层 Feature Modules (页面/路由)                  │  ← 互不依赖
│     Home · About · Projects · Resume · Blog · Photos ...   │
├─────────────────────────────────────────────────────────┤
│  L3 组合层 Composition (布局/导航/SEO/主题/搜索)            │
│     BaseLayout · Nav · Footer · Seo · ThemeToggle · Search │
├─────────────────────────────────────────────────────────┤
│  L2 原语层 UI Primitives (无业务的可复用组件)               │
│     Button · Card · Tag · Input · Prose · Icon · Avatar    │
├─────────────────────────────────────────────────────────┤
│  L1 基础层 Foundation                                       │
│     Design Tokens · DAL(数据访问) · Utils · Site Config     │
└─────────────────────────────────────────────────────────┘
            ▲ 依赖只能向下，禁止向上或同层横向（L4 之间）
```

### 2.2 模块地图与依赖关系

**基础模块（Foundation，被复用）**
| ID | 模块 | 主要产物 |
|---|---|---|
| **F1** | 设计系统 / Tokens | `src/styles/global.css`（`@theme`）、Tailwind v4 配置 |
| **F2** | UI 原语库 | `src/components/ui/*` |
| **F3** | 布局与导航 | `src/layouts/*`、`Nav/Footer/Breadcrumb` |
| **F4** | 主题（暗黑模式） | `ThemeToggle`、head 内联脚本、`lib/theme.ts` |
| **F5** | 内容与数据访问层 DAL | `src/content/config.ts`、`src/data/*`、`src/lib/dal/*` |
| **F6** | SEO / Meta | `components/Seo.astro`、`lib/seo.ts`（JSON-LD） |
| **F7** | 搜索 | Pagefind 索引 + `components/Search` 岛屿 |
| **F8** | 工具与配置 | `lib/utils/*`、`data/site.ts` |

**功能模块（Feature，页面，互不依赖）**
| ID | 模块 | 路由 | 需求 |
|---|---|---|---|
| **P1** | 首页 Home | `/` | FR-HOME-* |
| **P2** | 关于 About | `/about` | FR-ABOUT-* |
| **P3** | 项目 Projects | `/projects`, `/projects/[slug]` | FR-PROJ-* |
| **P4** | 简历 Resume | `/resume` | FR-RESUME-* |
| **P5** | 博客 Blog | `/blog`, `/blog/[slug]`, `/blog/tags/[tag]`, `/rss.xml` | FR-BLOG-* |
| **P6** | 摄影 Photos | `/photos` | FR-PHOTO-* |
| **P7** | Now | `/now` | FR-NOW-* |
| **P8** | 时间线 Timeline | `/timeline` | FR-TIME-* |
| **P9** | 友链 Links | `/links` | FR-LINK-* |
| **P10** | 联系 Contact | `/contact` | FR-CONTACT-* |
| **P11** | 错误页 404 | `/404` | FR-GLOBAL-03 |

**依赖规则（强约束，保证独立性）**
- 功能模块 Pn **仅可** 依赖 F1–F8；**严禁** Pn 依赖 Pm（n≠m）。
- 共享内容只通过 **F5 DAL** 获取，不得跨页面 import。
- 共享 UI 只通过 **F2 原语库** 获取。
- 违例由 ESLint `import/no-restricted-paths` 规则在 CI 阻断（见 §8.6）。

### 2.3 模块独立性策略（4 大解耦机制）
1. **数据访问层（DAL）作为唯一数据缝**：页面调用 `getProjects()`/`getPosts()` 等纯函数取**类型化 DTO**；测试时 `vi.mock('@/lib/dal')` 即可注入假数据，无需真实内容即可独立渲染页面。
2. **契约先行**：每个模块声明输入（props/DTO）、输出（渲染的 HTML/路由）、副作用（事件/存储）。契约集中汇总于 §5。
3. **布局以插槽（slot）注入**：`BaseLayout` 通过 `<slot/>` 接收页面内容，页面不关心导航/页脚实现 → 布局与页面互不侵入。
4. **交互岛屿自治**：主题切换、搜索、灯箱、联系表单为独立岛屿，对外暴露稳定的 DOM 契约（`data-*` 属性 / 自定义事件），与页面解耦、可单独测试。

**统一「模块契约模板」**（§3、§4 每个模块均按此描述）：
> 职责 → 对应需求 → 文件位置 → **接口契约**（输入/输出/事件）→ 内部结构 → 依赖（声明只依赖哪些 F）→ 状态与边界 → a11y/性能要点 → **独立测试方案**。

### 2.4 目录结构映射
```
src/
├── styles/
│   └── global.css            # F1 Tokens + Tailwind v4 @theme + 暗黑变体
├── components/
│   ├── ui/                   # F2 原语：Button/Card/Tag/Input/Prose/Icon/Avatar...
│   ├── Nav.astro             # F3
│   ├── Footer.astro          # F3
│   ├── Breadcrumb.astro      # F3
│   ├── ThemeToggle.ts        # F4 (Web Component)
│   ├── Seo.astro             # F6
│   ├── Search.tsx            # F7 (Preact 岛屿)
│   └── features/             # 各功能模块专属、不跨页复用的组件
│       ├── home/  about/  projects/  resume/  blog/  photos/ ...
├── layouts/
│   ├── BaseLayout.astro      # F3 全站骨架（含 head 主题脚本、Seo、Nav、Footer）
│   ├── PostLayout.astro      # P5 文章详情布局
│   └── ProjectLayout.astro   # P3 项目详情布局
├── pages/                    # 功能模块路由（L4）
├── content/
│   ├── config.ts             # F5 Collections schema（契约源）
│   ├── blog/  projects/  photos/
├── data/                     # F5/F8 站点级数据：site.ts/nav.ts/socials.ts/skills.ts/timeline.ts/links.ts/now.md
├── lib/
│   ├── dal/                  # F5 数据访问层（页面唯一取数入口）
│   ├── seo.ts                # F6
│   ├── theme.ts              # F4
│   └── utils/                # F8：date.ts/reading-time.ts/slug.ts
└── test/
    ├── fixtures/             # 各模块假数据
    ├── unit/  component/  e2e/  a11y/
```

### 2.5 技术与样式选型（定稿）
| 关注点 | 方案 |
|---|---|
| 框架 / 语言 | Astro（最新稳定）+ TypeScript（`strict`） |
| 样式 | **Tailwind v4**（CSS-first `@theme`）+ **CSS 变量 token**；暗黑用 class 变体 |
| 岛屿框架 | 优先原生 TS / Web Component；复杂交互用 **Preact**（更轻） |
| 内容 | Astro Content Collections + Zod schema |
| 图片 | `astro:assets`（AVIF/WebP、响应式、懒加载） |
| 搜索 | **Pagefind**（构建期索引，纯静态） |
| 表单 | **Web3Forms**（无后端）+ **Cloudflare Turnstile** 防垃圾 |
| RSS/Sitemap | `@astrojs/rss` + `@astrojs/sitemap` |
| 测试 | Vitest + **Astro Container API**、Playwright、axe-core、Lighthouse CI |
| 部署 | Cloudflare Pages（GitHub 触发自动构建） |

---

## 3. 基础模块详细设计（Foundation F1–F8）

### F1 设计系统 / Design Tokens
- **职责**：以 CSS 变量定义全站设计令牌，供 Tailwind 与组件消费；提供明暗双主题。对应 NFR-MAINT-01、proposal §6.3–6.5。
- **文件**：`src/styles/global.css`。
- **接口契约（对外即 token 名，稳定不变）**：
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));   /* class 策略暗黑 */

@theme {
  /* 颜色（语义命名） */
  --color-bg: #ffffff;        --color-surface: #f6f8fa;
  --color-text: #1f2328;      --color-text-muted: #57606a;
  --color-primary: #2f6feb;   --color-primary-hover: #1a5fd0;
  --color-border: #d0d7de;
  /* 字体 */
  --font-sans: "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif;
  --font-mono: "JetBrains Mono",Consolas,monospace;
  /* 间距/圆角/阴影/动效（节选） */
  --radius-card: 0.75rem;     --shadow-card: 0 1px 3px rgb(0 0 0 / .08);
  --ease-emphasis: cubic-bezier(.2,.8,.2,1);
}
.dark {                       /* 暗色覆盖同名变量 */
  --color-bg:#0d1117; --color-surface:#161b22; --color-text:#e6edf3;
  --color-text-muted:#9198a1; --color-primary:#4493f8; --color-border:#30363d;
}
@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
```
- **依赖**：无（最底层）。
- **独立测试**：①构建期断言关键 token 存在；②视觉回归（Playwright 截取「Design Tokens 展示页」明暗两版）；③自动对比度测试：对 text/bg、primary/bg 计算对比度 ≥ 4.5:1（NFR-A11Y-01）。

### F2 UI 原语库
- **职责**：无业务语义的可复用组件，是功能模块的 UI 积木。对应 proposal §6.6。
- **文件**：`src/components/ui/{Button,Card,Tag,Badge,Input,Textarea,Prose,Icon,Avatar,Pagination,Toc}.astro`。
- **接口契约（props 示例）**：

| 组件 | 关键 props | 说明 |
|---|---|---|
| `Button` | `variant: 'primary'\|'secondary'\|'ghost'`, `href?`, `type?`, `disabled?` | 有 `href` 渲染 `<a>`，否则 `<button>` |
| `Card` | `as?`, `href?`, `padding?` | 通用容器，`<slot/>` 内容 |
| `Tag` | `label`, `href?`, `active?` | 标签/筛选项 |
| `Input` | `name`, `type`, `label`, `required?`, `error?` | 含 `<label>` 关联与错误态 |
| `Prose` | （仅 `<slot/>`） | 包裹 Markdown 渲染，统一排版 |
| `Icon` | `name`, `size?`, `label?` | 内联 SVG（Lucide）；装饰性图标 `aria-hidden` |
| `Pagination` | `current`, `total`, `base` | 列表分页 |

- **依赖**：仅 F1（token）。**不依赖 DAL、不含业务逻辑** → 纯函数式组件，最易独立测试。
- **独立测试**：用 **Astro Container API** 逐组件渲染各 `variant`/状态，断言 HTML/aria；axe 扫描；禁用态、键盘可聚焦性。
```ts
// test/component/button.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from '@/components/ui/Button.astro';
test('primary 渲染为 a 标签', async () => {
  const c = await AstroContainer.create();
  const html = await c.renderToString(Button, { props:{variant:'primary',href:'/x'}, slots:{default:'去项目'} });
  expect(html).toContain('<a'); expect(html).toContain('去项目');
});
```

### F3 布局与导航
- **职责**：全站骨架 `BaseLayout`（注入 `<head>`、Seo、主题脚本、Nav、`<slot/>`、Footer），以及导航、页脚、面包屑。对应 FR-NAV-*、FR-GLOBAL-04/05。
- **文件**：`src/layouts/BaseLayout.astro`、`src/components/{Nav,Footer,Breadcrumb}.astro`、`src/layouts/{PostLayout,ProjectLayout}.astro`。
- **接口契约（BaseLayout props）**：
```ts
interface BaseLayoutProps {
  title: string; description: string;
  image?: string;            // OG 图，缺省用站点默认
  type?: 'website'|'article';
  breadcrumb?: { label:string; href:string }[];
  noindex?: boolean;
}
// 用法：<BaseLayout {...seo}><slot/></BaseLayout>  → 页面只管内容
```
- **导航数据**来自 F5 `getNav()`（不硬编码）→ 导航与页面解耦。
- **依赖**：F1、F2、F4（主题脚本/开关）、F5（nav/socials）、F6（Seo）。
- **状态/边界**：移动端汉堡菜单（`<details>`/Web Component，无框架）；当前路由高亮（对比 `Astro.url.pathname`）；导航吸顶不遮挡焦点（NFR-A11Y，WCAG 2.2 Focus Not Obscured）。
- **独立测试**：Container 渲染 BaseLayout（mock `getNav`），断言含 skip-link、`<main>`、nav `aria-current`；E2E 测移动端菜单展开/键盘关闭；axe 扫描布局。

### F4 主题（暗黑模式）
- **职责**：明暗/跟随系统三态切换、持久化、**首屏防闪烁（FOUC）**。对应 FR-GLOBAL-01、NFR-A11Y-03。
- **文件**：`src/components/ThemeToggle.ts`（Web Component `<theme-toggle>`）、`src/lib/theme.ts`、BaseLayout `<head>` 内联脚本。
- **接口契约（DOM 契约，供任何页面/测试复用）**：
  - 输入：用户点击 `<theme-toggle>`；系统 `prefers-color-scheme`。
  - 输出：在 `<html>` 上增删 `.dark` 类；写入 `localStorage['theme'] ∈ {light,dark,system}`。
  - 事件：派发 `themechange` CustomEvent（`detail:{theme}`），其它岛屿可监听。
- **防 FOUC**：`<head>` 顶部内联同步脚本，读 localStorage/系统偏好，于首帧前打 `.dark`。
- **依赖**：F1（token 切换由 `.dark` 驱动）。**与具体页面无关** → 全站任意页可独立挂载。
- **独立测试**：单测 `theme.ts` 纯逻辑（输入存储/系统态→输出目标类）；E2E：切换后刷新保持、`prefers-color-scheme` 模拟、首屏无闪烁（首帧截图比对）。

### F5 内容与数据访问层（DAL）— 解耦核心
- **职责**：定义内容 schema（契约源），并以**类型化纯函数**对外供数；是功能模块**唯一**取数入口。对应 FR-CMS-*、FR-BLOG/PROJ/PHOTO 等。
- **文件**：`src/content/config.ts`（schema）、`src/data/*`（站点数据）、`src/lib/dal/*`（查询函数）。
- **Schema（契约，详见 §5）**：blog / projects / photos 三个 Collections + 站点数据文件。
- **DAL 接口契约（函数签名 = 功能模块的输入契约）**：
```ts
// src/lib/dal/index.ts — 页面只从此处取数，便于 mock 与独立测试
export interface ProjectDTO { slug:string; title:string; summary:string; cover:ImageMeta;
  tech:string[]; category:string; featured:boolean; order:number; repo?:string; demo?:string; date:Date }
export interface PostDTO { slug:string; title:string; description:string; pubDate:Date;
  updatedDate?:Date; tags:string[]; cover?:ImageMeta; readingMinutes:number; draft:boolean }
export interface PhotoDTO { title:string; src:ImageMeta; album?:string; takenAt?:Date; caption?:string }

export function getSiteConfig(): SiteConfig;
export function getNav(): NavItem[];
export function getSocials(): Social[];
export function getSkills(): SkillGroup[];
export function getTimeline(): TimelineItem[];
export function getLinks(): LinkItem[];

export async function getProjects(opt?:{category?:string}): Promise<ProjectDTO[]>;       // 已按 order/date 排序
export async function getFeaturedProjects(limit?:number): Promise<ProjectDTO[]>;
export async function getProjectBySlug(slug:string): Promise<{ data:ProjectDTO; Content:AstroComponent } | undefined>;
export async function getProjectCategories(): Promise<string[]>;

export async function getPosts(opt?:{tag?:string; includeDrafts?:boolean}): Promise<PostDTO[]>; // 默认排除 draft、按日期倒序
export async function getPostBySlug(slug:string): Promise<{ data:PostDTO; Content:AstroComponent; headings:Heading[] } | undefined>;
export async function getAdjacentPosts(slug:string): Promise<{ prev?:PostDTO; next?:PostDTO }>;
export async function getTags(): Promise<{ tag:string; count:number }[]>;

export async function getPhotos(album?:string): Promise<PhotoDTO[]>;
```
- **设计要点**：①DAL 内部封装 `astro:content` 与排序/过滤/草稿逻辑，页面零业务取数代码；②草稿过滤、阅读时长计算集中于此（单一职责）；③返回 DTO 而非原始 Entry，隔离存储变更。
- **依赖**：F8（utils：reading-time/date）。不依赖任何功能模块。
- **独立测试**：用 fixtures 注入假集合，单测每个函数的排序/过滤/草稿/边界（空集合、缺字段→schema 报错）；契约测试：DTO 字段类型稳定（快照）。

### F6 SEO / Meta
- **职责**：统一生成 title/description/canonical/OG/Twitter + JSON-LD 结构化数据。对应 NFR-SEO-01/02、FR-GLOBAL-04。
- **文件**：`src/components/Seo.astro`、`src/lib/seo.ts`。
- **接口契约**：
```ts
interface SeoProps { title:string; description:string; canonical?:string;
  image?:string; type?:'website'|'article';
  jsonLd?: 'Person'|'Article'|'BreadcrumbList'; article?: { publishedTime:Date; tags:string[] } }
// lib/seo.ts 导出 buildPersonJsonLd()/buildArticleJsonLd()/buildBreadcrumbJsonLd()
```
- **依赖**：F8（site config）。被 BaseLayout 调用，对页面透明。
- **独立测试**：单测 JSON-LD 生成器输出符合 schema.org；Container 渲染断言 `<meta>` 齐全；E2E 用 Rich Results 规则校验（CI 可选）。

### F7 搜索（Pagefind）
- **职责**：构建期对产物建立全文索引，运行时纯前端检索。对应 FR-GLOBAL-02、US-09。
- **文件**：构建脚本（`postbuild` 跑 `pagefind`）、`src/components/Search.tsx`（Preact 岛屿）、`/search` 页。
- **接口契约（DOM/岛屿契约）**：
  - 输入：用户在搜索框输入；Pagefind 静态索引（`/pagefind/`）。
  - 输出：结果列表（标题/摘要/链接）；键盘可达（↑↓ 选择，Enter 跳转，Esc 关闭）。
  - 可独立挂载：组件只依赖 Pagefind 运行时 API，不依赖页面数据。
- **依赖**：F1、F2；构建依赖产物（解耦：通过 `postbuild` 钩子，不污染源码）。
- **独立测试**：组件层 mock Pagefind API 测交互/键盘/空结果态；E2E 在已构建预览上搜真实词。

### F8 工具与配置
- **职责**：站点配置 + 纯函数工具。对应跨模块复用。
- **文件**：`src/data/site.ts`（站名/URL/作者/默认 OG/社交）、`src/lib/utils/{date,reading-time,slug}.ts`。
- **接口契约**：`formatDate(d, locale='zh-CN')`、`readingMinutes(text)`、`slugify(s)`、`SiteConfig` 类型。
- **依赖**：无。**纯函数，最易单测**。
- **独立测试**：纯函数单测（含边界：空串、中文分词阅读时长估算、时区）。

---

## 4. 功能模块详细设计（P1–P11）

> 每个功能模块遵循 §2.3「模块契约模板」。**共性约束**：仅依赖 F1–F8；通过 DAL 取数；页面壳 = `BaseLayout` + 模块专属组件（位于 `components/features/<module>/`）。

### P1 首页 Home
- **需求**：FR-HOME-01..05。**路由**：`/`。
- **依赖**：F3(BaseLayout)、F2、F5(`getSiteConfig/getFeaturedProjects/getPosts`)。**无横向依赖**。
- **输入契约**：`getFeaturedProjects(6)`、`getPosts()[0..3]`、`getSiteConfig()`。
- **组件树**：`index.astro` → `Hero`(features/home) + `FeaturedProjects`(用 F2 Card) + `LatestPosts` + `SkillsStrip?`。
- **状态/边界**：无精选项目时隐藏该区块；无文章时隐藏最新文章区（空态优雅降级）。
- **a11y/性能**：Hero 图 `fetchpriority=high`；CTA 为真链接；轻动效遵守 reduced-motion。
- **独立测试**：`vi.mock('@/lib/dal')` 注入 0/1/6 个项目与 0/3 篇文章 → Container 渲染断言区块显隐与 CTA；axe；E2E 校验首屏 CTA 跳转。

### P2 关于 About
- **需求**：FR-ABOUT-01..04。**路由**：`/about`。
- **依赖**：F3、F2、F5(`getSkills`)、内容（`about` 单文档或 `src/data` + Markdown）。
- **输入契约**：关于正文（Markdown 渲染）、`getSkills(): SkillGroup[]`、可选 services/testimonials 数据。
- **组件树**：`Bio`(Prose) + `WhatIDo`(服务卡片网格) + `Skills`(分组+可视化) + `Testimonials?`。
- **状态/边界**：技能为空隐藏；testimonials 可选。
- **独立测试**：mock skills（空/多组）→ 断言渲染与 aria；Prose 排版快照；axe。

### P3 项目 Projects（列表 + 详情）
- **需求**：FR-PROJ-01..05。**路由**：`/projects`、`/projects/[...slug]`。
- **依赖**：F3、F2、F5(`getProjects/getProjectCategories/getProjectBySlug`)、`ProjectLayout`。
- **输入契约**：列表页 `getProjects()`+`getProjectCategories()`；详情页 `getStaticPaths` 基于 `getProjects()`，`getProjectBySlug(slug)`。
- **组件树**：列表 → `ProjectFilter`(岛屿，按 category/tag 过滤，URL query 同步) + `ProjectGrid`(F2 Card)。详情 → `ProjectLayout`(封面/技术栈/链接/正文 Prose/截图)。
- **状态/边界**：筛选无结果空态；缺 demo/repo 链接时不渲染按钮；置顶 `featured` 与 `order` 排序由 DAL 保证。
- **筛选独立性**：`ProjectFilter` 是自治岛屿，输入为初始项目数组+当前 query，输出过滤后的 DOM；可脱离页面单测。
- **独立测试**：mock `getProjects`（多类目）→ 断言筛选交互、URL 同步、空态；`getStaticPaths` 单测产出正确路径；详情页 mock `getProjectBySlug`（存在/不存在→404）；axe。

### P4 简历 Resume
- **需求**：FR-RESUME-01..04。**路由**：`/resume`。
- **依赖**：F3、F2、F5(`getTimeline` 复用或独立 `resume` 数据、`getSkills`)、`public/resume.pdf`。
- **输入契约**：经历数据（education/experience 数组）、技能、证书；PDF 直链。
- **组件树**：`ResumeTimeline` + `SkillMatrix` + `DownloadPdfButton` + `@media print` 样式。
- **状态/边界**：PDF 缺失时按钮禁用并提示；打印样式隐藏导航/页脚。
- **独立测试**：mock 经历数据渲染时间线顺序；打印样式快照；按钮链接存在性；axe。

### P5 博客 Blog（列表/详情/标签/RSS）
- **需求**：FR-BLOG-01..07。**路由**：`/blog`、`/blog/[...slug]`、`/blog/tags/[tag]`、`/rss.xml`。
- **依赖**：F3、F2(Pagination/Toc/Prose/Tag)、F5(`getPosts/getPostBySlug/getAdjacentPosts/getTags`)、`PostLayout`、F4(代码块复制)。
- **输入契约**：列表 `getPosts()`(分页)；详情 `getPostBySlug`(返回 Content+headings)+`getAdjacentPosts`；标签页 `getTags`+`getPosts({tag})`；RSS 用 `@astrojs/rss` 读 `getPosts()`。
- **组件树**：列表 → `PostCard[]` + `Pagination`。详情 → `PostLayout`(`Toc` + `Prose` + `CodeBlock`(复制按钮) + `PrevNext` + `Comments?`(Giscus 岛屿,可选))。标签 → `TagCloud` + 列表复用。
- **状态/边界**：草稿不出现在生产（DAL 过滤）；空标签 404；无上一篇/下一篇时隐藏；阅读时长由 DAL 计算。
- **渲染管线**：见 §6.4。
- **独立测试**：mock posts（含 draft→不显示、分页边界）；`getStaticPaths` 路径正确；RSS 单测 XML 含必备字段（FR-BLOG-04）；TOC 由 headings 生成；代码复制按钮岛屿单测；axe；E2E 文章导航。

### P6 摄影 Photos
- **需求**：FR-PHOTO-01..04。**路由**：`/photos`。
- **依赖**：F3、F2、F5(`getPhotos`)、`astro:assets`、`Lightbox`(岛屿)。
- **输入契约**：`getPhotos(album?)` → `PhotoDTO[]`；图片经 `astro:assets` 生成响应式多格式。
- **组件树**：`PhotoGrid`(瀑布流/网格, 懒加载+模糊占位) + `Lightbox`(键盘可达/ESC/焦点陷阱)。
- **状态/边界**：相册分组可选；空相册空态；大图懒加载防 CLS（固定宽高比）。
- **Lightbox 独立性**：自治岛屿，输入图片列表+索引，输出放大层；可脱离页面测试。
- **独立测试**：mock photos 渲染网格与 alt；Lightbox 键盘/焦点陷阱/ESC 单测；图片含尺寸属性（防 CLS）；axe。

### P7 Now
- **需求**：FR-NOW-01。**路由**：`/now`。
- **依赖**：F3、F2、内容 `src/data/now.md`。
- **输入契约**：Markdown 正文 + 更新日期 frontmatter。
- **组件树**：`Prose` + 更新时间徽章。
- **独立测试**：渲染断言更新日期显示；Prose 快照。

### P8 时间线 Timeline
- **需求**：FR-TIME-01。**路由**：`/timeline`。
- **依赖**：F3、F2、F5(`getTimeline`)。
- **输入契约**：`getTimeline(): TimelineItem[]`（按日期倒序）。
- **组件树**：`TimelineList` → `TimelineItem[]`。
- **状态/边界**：空数据空态；按年份分组可选。
- **独立测试**：mock 多条目断言时间顺序与语义结构（`<ol>`/`<time>`）；axe。

### P9 友链 Links
- **需求**：FR-LINK-01。**路由**：`/links`。
- **依赖**：F3、F2、F5(`getLinks`)。
- **输入契约**：`getLinks(): LinkItem[]`（名称/头像/简介/URL）。
- **组件树**：`LinkCard[]`(F2 Card)。外链 `rel="noopener noreferrer"`。
- **独立测试**：mock links 渲染卡片与安全 rel；外链可达性；axe。

### P10 联系 Contact
- **需求**：FR-CONTACT-01..03。**路由**：`/contact`。
- **依赖**：F3、F2(Input/Textarea/Button)、F5(`getSocials`)、`ContactForm`(岛屿)、Web3Forms、Turnstile。
- **输入/输出契约**：
  - 社交：`getSocials()` 直链；邮箱做反爬（JS 拼装或图片）。
  - 表单岛屿：输入字段{name,email,message,honeypot,turnstile-token}；提交 `POST https://api.web3forms.com/submit`（access key 由环境变量注入）；输出提交态（idle/submitting/success/error）。
- **校验/防垃圾**：前端必填+邮箱格式校验；蜜罐字段 + Turnstile（NFR-SEC-02）。
- **状态/边界**：网络失败错误态+重试；成功清空并提示；禁用重复提交。
- **表单独立性**：`ContactForm` 自治岛屿，提交端点可注入/mock → 不依赖真实网络即可测。
- **独立测试**：组件单测校验逻辑（空/非法邮箱→错误态）、蜜罐拦截、提交态机；mock fetch 测 success/error 分支；E2E 用 mock 端点走完整流程；axe（label 关联/错误 aria-live）。

### P11 错误页 404
- **需求**：FR-GLOBAL-03。**路由**：`/404`。
- **依赖**：F3、F2。
- **组件树**：插画 + 返回首页/搜索入口。
- **独立测试**：渲染断言状态语义与导航链接；axe。

---

## 5. 数据模型与契约汇总（模块间唯一契约源）

### 5.1 Content Collections Schema
```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({ type:'content', schema: ({image}) => z.object({
  title:z.string(), description:z.string(), pubDate:z.date(), updatedDate:z.date().optional(),
  tags:z.array(z.string()).default([]), cover:image().optional(), draft:z.boolean().default(false) })});
const projects = defineCollection({ type:'content', schema: ({image}) => z.object({
  title:z.string(), summary:z.string(), cover:image(), tech:z.array(z.string()), category:z.string(),
  featured:z.boolean().default(false), order:z.number().default(0),
  repo:z.string().url().optional(), demo:z.string().url().optional(), date:z.date() })});
const photos = defineCollection({ type:'data', schema: ({image}) => z.object({
  title:z.string(), src:image(), album:z.string().optional(), takenAt:z.date().optional(),
  location:z.string().optional(), caption:z.string().optional() })});
export const collections = { blog, projects, photos };
```

### 5.2 站点级数据类型（`src/data/*` + `src/lib/dal` 复用）
```ts
interface SiteConfig { name:string; title:string; description:string; url:string;
  author:string; email:string; defaultOgImage:string; locale:'zh-CN' }
interface NavItem { label:string; href:string; external?:boolean }
interface Social { platform:string; url:string; icon:string }
interface SkillGroup { category:string; items:{ name:string; level?:1|2|3|4|5 }[] }
interface TimelineItem { date:Date; title:string; description?:string; icon?:string }
interface LinkItem { name:string; url:string; avatar?:string; description?:string }
interface Heading { depth:number; slug:string; text:string }
```

### 5.3 契约稳定性约定
- DTO 字段为**对外契约**，变更需升级文档版本并同步测试快照。
- 新增字段保持可选（向后兼容）；删除/改名视为破坏性变更。

---

## 6. 关键交互与流程设计

### 6.1 主题切换（时序）
`用户点击 <theme-toggle>` → 计算下一态(light→dark→system) → 写 localStorage → 切 `<html>.dark` → 派发 `themechange` → CSS 变量级联更新（无重渲染）。首屏由 head 内联脚本先行避免闪烁。

### 6.2 站内搜索（流程）
构建 `astro build` → `postbuild` 跑 `pagefind --site dist` 产出索引 → 运行时用户输入 → Search 岛屿调 Pagefind API → 渲染结果 → Enter 跳转。索引与代码解耦（构建钩子）。

### 6.3 联系表单提交（状态机）
`idle → (submit) submitting → success | error`；error 可回到 idle 重试；蜜罐命中静默丢弃；Turnstile 失败阻止提交。端点经 `import.meta.env.PUBLIC_WEB3FORMS_KEY` 注入。

### 6.4 博客渲染管线
Markdown/MDX → Content Collections 校验 → remark/rehype（GFM、标题锚点、代码高亮 Shiki、阅读时长）→ `PostLayout`（TOC by headings + Prose + PrevNext）→ 静态 HTML。RSS 由 `/rss.xml.ts` 读 `getPosts()` 生成。

### 6.5 图片优化管线
源图 → `astro:assets` → 构建期生成 AVIF/WebP 多尺寸 + `srcset` + 模糊占位 + 显式宽高（防 CLS，NFR-PERF-02）。

### 6.6 构建-部署管线（见 §9）
`git push main` → Cloudflare Pages 拉取 → `npm ci && npm run build`（含 postbuild 索引）→ 发布 `dist` 到全球 CDN；PR → 预览部署。

---

## 7. 跨切面设计（统一规范，所有模块遵循）

| 关注点 | 统一方案 | 对应需求 |
|---|---|---|
| 性能 | 默认零 JS；岛屿 `client:visible/idle` 按需水合；图片/字体优化；首屏 JS 预算 < 100KB | NFR-PERF-01..04 |
| 可访问性 | 语义标签 + skip-link + 焦点可见 + 24px 目标 + 对比度 AA + reduced-motion；axe 纳入 CI | NFR-A11Y-01..03 |
| SEO | 每页唯一 title/description/canonical；OG/Twitter；JSON-LD(Person/Article/Breadcrumb)；sitemap/robots | NFR-SEO-01/02 |
| 安全/隐私 | HTTPS + 安全响应头(CSP/HSTS/X-CTO/Referrer-Policy，经 `public/_headers`)；表单 Turnstile+蜜罐；无 Cookie 分析(Cloudflare Web Analytics) | NFR-SEC/PRIV |
| i18n 预留 | 文案抽离 `src/i18n/`；路由可扩展 `[lang]`；本期仅 `zh-CN` | NFR-I18N-01 |
| 错误/回退 | 自定义 404；空态组件统一；图片 alt 兜底；外链安全 rel | FR-GLOBAL-03 |

---

## 8. 测试策略（保证「可独立测试」落地）

### 8.1 测试金字塔与工具
| 层 | 工具 | 职责 | 范围 |
|---|---|---|---|
| 单元 | Vitest | 纯函数（DAL/utils/seo/theme 逻辑） | F5/F6/F8/F4 |
| 组件 | Vitest + **Astro Container API** / @testing-library(Preact 岛屿) | 隔离渲染组件，mock DAL/端点 | F2/F3 及各 P 的组件 |
| 可访问性 | axe-core（集成进组件/E2E） | 自动 a11y 断言 | 全部 |
| 端到端 | Playwright | 真浏览器跨页流程、响应式、主题、搜索、表单 | 关键路径 |
| 性能 | Lighthouse CI | CWV/Lighthouse 阈值守门 | 全站关键页 |
| 视觉回归 | Playwright 截图 | 明暗/断点快照 | 关键页/组件 |

### 8.2 模块独立测试范式
- **Mock DAL**：`vi.mock('@/lib/dal')` 注入 fixtures → 任一页面模块脱离真实内容独立渲染断言。
- **Container 渲染**：组件级隔离，传 props/slots 直接得 HTML。
- **岛屿契约测试**：主题/搜索/灯箱/表单按其 DOM/事件契约单测，端点可注入。
- **Fixtures**：`test/fixtures/` 提供假项目/文章/图片/技能等，跨测试复用。

### 8.3 各模块独立测试矩阵（摘要）
| 模块 | 单元 | 组件 | a11y | E2E |
|---|---|---|---|---|
| F1 Tokens | 对比度 | — | — | 视觉回归 |
| F2 原语 | — | ✅各变体 | ✅ | — |
| F3 布局 | — | ✅(mock nav) | ✅ | 移动菜单 |
| F4 主题 | ✅逻辑 | ✅开关 | — | 持久化/防闪 |
| F5 DAL | ✅✅核心 | — | — | — |
| F6 SEO | ✅生成器 | ✅meta | — | 富结果(可选) |
| F7 搜索 | — | ✅(mock API) | ✅ | 真实搜索 |
| F8 工具 | ✅✅ | — | — | — |
| P1 Home | — | ✅(mock DAL) | ✅ | CTA 跳转 |
| P3 Projects | ✅paths | ✅筛选/空态 | ✅ | 筛选+详情 |
| P5 Blog | ✅RSS/paths | ✅卡片/TOC/分页 | ✅ | 文章导航 |
| P6 Photos | — | ✅网格/灯箱 | ✅ | 灯箱键盘 |
| P10 Contact | ✅校验/状态机 | ✅表单 | ✅ | mock 端点全流程 |
| P2/P4/P7/P8/P9/P11 | 按需 | ✅渲染/空态 | ✅ | 冒烟 |

### 8.4 覆盖目标
- 纯逻辑（DAL/utils）行覆盖 ≥ 90%；组件关键状态全覆盖；a11y 关键页 0 violations；Lighthouse 达 proposal §2.2 阈值。

### 8.5 测试数据与隔离
- 每模块自带 fixtures，**不共享可变状态**；E2E 用独立构建产物；表单/搜索用 mock 或本地索引，避免外部依赖。

### 8.6 依赖边界守护（强制独立性）
- ESLint `import/no-restricted-paths`：禁止 `pages/**` 或 `components/features/A/**` 互相 import（仅允许 import `components/ui`、`lib`、`layouts`）。CI 失败即阻断，机器级保证模块独立。

---

## 9. 构建与部署设计

### 9.1 脚本（package.json）
```jsonc
{ "scripts": {
  "dev":"astro dev", "build":"astro build", "postbuild":"pagefind --site dist",
  "preview":"astro preview", "check":"astro check && tsc --noEmit",
  "test":"vitest run", "test:e2e":"playwright test", "lint":"eslint .", "format":"prettier -w ." }}
```

### 9.2 Cloudflare Pages 配置
- 连接 GitHub 仓库；构建命令 `npm run build`；输出目录 `dist`；Node ≥ 20；框架预设 Astro。
- 环境变量：`PUBLIC_WEB3FORMS_KEY`、`PUBLIC_TURNSTILE_SITEKEY`、`PUBLIC_SITE_URL`（在 Pages 项目设置注入，不入库）。
- `public/_headers` 配置安全响应头；`public/_redirects` 处理重定向（如旧链）。

### 9.3 CI/CD
- `git push main` → 生产构建发布；PR → 预览部署 URL。
- （可选）GitHub Actions：`check` + `test` + `lighthouse-ci`，未达阈值阻断合并。
- 回滚：Cloudflare Pages 保留历史部署，一键回滚（NFR-OBS/可用性）。

### 9.4 环境与版本
- 锁 `package-lock.json`；Node LTS；`.nvmrc`。本地与 CI 用 `npm ci` 保证一致。

---

## 10. 需求 → 模块 → 测试 追溯矩阵（全面性核对）

### 10.1 功能需求
| 需求(FR) | 模块 | 关键测试 |
|---|---|---|
| FR-NAV-* | F3 | 组件(mock nav)+E2E 移动菜单 |
| FR-HOME-* | P1 | 组件(mock DAL)+E2E CTA |
| FR-ABOUT-* | P2 | 组件+axe |
| FR-PROJ-* | P3,F5 | 筛选/详情/getStaticPaths+E2E |
| FR-RESUME-* | P4 | 时间线/PDF/打印样式 |
| FR-BLOG-* | P5,F5 | 列表/详情/标签/RSS/TOC+E2E |
| FR-PHOTO-* | P6 | 网格/灯箱/响应式图 |
| FR-NOW-* | P7 | 渲染/更新日期 |
| FR-TIME-* | P8 | 时间顺序/语义 |
| FR-LINK-* | P9 | 卡片/安全 rel |
| FR-CONTACT-* | P10 | 校验/状态机/mock 端点 E2E |
| FR-CMS-* | F5 | schema 校验/草稿过滤/零代码新增 |
| FR-GLOBAL-01 主题 | F4 | 逻辑+持久化+防闪 |
| FR-GLOBAL-02 搜索 | F7 | 组件+真实搜索 E2E |
| FR-GLOBAL-03 404 | P11 | 渲染/导航 |
| FR-GLOBAL-04 SEO meta | F6 | 生成器+meta 断言 |
| FR-GLOBAL-05 sitemap/robots | F6/构建 | 产物存在性 |
| FR-GLOBAL-06 i18n 预留 | §7 | 代码审查 |
| FR-GLOBAL-07 过渡/回顶 | F3/F1 | E2E/reduced-motion |

### 10.2 非功能需求
| 需求(NFR) | 落地点 | 验证 |
|---|---|---|
| NFR-PERF-01..04 | §7、F1、astro:assets、岛屿策略 | Lighthouse CI、产物分析 |
| NFR-A11Y-01..03 | F1 对比度、F2/F3 语义、§7 | axe + 手动 + Playwright 键盘 |
| NFR-SEO-01/02 | F6 | Lighthouse SEO + 富结果 |
| NFR-COMPAT-01 | 构建目标 + E2E 多浏览器 | Playwright projects |
| NFR-SEC-01/02 | `_headers`、Turnstile、env | securityheaders + 审查 |
| NFR-PRIV-01 | 无 Cookie 分析 | 审查 |
| NFR-MAINT-01/02 | TS/Token/DAL/ESLint | CI |
| NFR-SCALE-01 | 分层 + i18n 预留 | 设计评审 |
| NFR-OBS-01 | Pages 部署可见 + 监控 | 配置检查 |
| NFR-I18N-01 | `src/i18n` 抽离 | 审查 |

### 10.3 部署需求（proposal §9）
| 需求 | 设计 | 验证 |
|---|---|---|
| 免费稳定部署 | Cloudflare Pages（§9.2） | 上线可访问 |
| CI/CD | push 自动 + PR 预览（§9.3） | 部署记录 |
| 域名/HTTPS | 自定义域名 + 自动证书 | 解析+证书 |
| 监控/回滚 | Web Analytics/UptimeRobot + 历史回滚 | 演练 |

> **核对结论**：proposal 中全部 FR / NFR / 部署需求均已在本设计中落点并配有独立测试 → 满足"详细设计全面贯穿整个项目"。

---

## 11. 风险与设计权衡

| 项 | 权衡 | 决策 |
|---|---|---|
| Tailwind vs Scoped CSS | 全局工具类 vs 强封装 | 选 Tailwind v4 + token；用 `features/` 目录与 ESLint 边界弥补封装性 |
| 岛屿框架 | React 生态 vs 体积 | 简单交互用原生/Web Component，复杂用 Preact，控 JS 预算 |
| 表单后端 | 自建 vs 第三方 | Web3Forms 零后端、易 mock；备 Pages Functions |
| 搜索 | 运行时 vs 构建期 | Pagefind 构建期索引，零后端、可独立测试 |
| 评论 | 隐私/复杂度 | 默认不启用，Giscus 作为可选岛屿（不影响其它模块） |
| 模块独立 vs 复用 | 重复 vs 耦合 | 复用只下沉到 F 层；功能模块宁可少量重复也不横向依赖 |

---

## 12. 附录

### 附录 A：组件 props 速查
见 §F2 表与各模块「输入契约」；完整 props/类型以源码 TS 接口为准（与本文 §5 类型一致）。

### 附录 B：命名与结构规范
- slug/文件 kebab-case；组件 PascalCase；函数 camelCase；常量 UPPER_SNAKE。
- 功能模块专属组件置于 `components/features/<module>/`，**不得**被其它模块 import。
- 约定式提交；分支 `main` + `feat/*`、`fix/*`。

### 附录 C：开发任务拆分衔接
按模块独立性，建议开发顺序（可并行）：
1. **基线**：F8 → F1 → F2 → F3 → F4 → F5 → F6（基础设施，先行）。
2. **并行功能**：F5 就绪后，P1–P11 可由不同人/会话**并行**开发，各自 mock DAL 独立测试。
3. **集成增强**：F7 搜索、P10 表单、可选评论，最后接入真实端点/索引。
4. **质量门禁**：每模块合并需通过 单测 + 组件测 + axe + ESLint 边界；关键页过 Lighthouse CI。

### 附录 D：术语
DAL=数据访问层；DTO=数据传输对象；Container API=Astro 组件隔离渲染测试 API；岛屿=按需水合的交互组件；FOUC=首屏主题闪烁。

### 附录 E：与上游/下游文档关系
- 上游：`proposal.md`（需求，本文逐条追溯）。
- 下游：源码实现、`test/` 用例、CI 配置；如需，可据附录 C 生成逐模块开发任务清单（Issue/看板）。

---

> **文档结束**。可据本文件开始 M1 脚手架与 F 层基础模块实现；功能模块 P1–P11 在 DAL 就绪后即可并行开发与独立测试。
