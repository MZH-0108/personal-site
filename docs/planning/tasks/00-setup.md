# 00 · 脚手架搭建（Setup）— 任务清单

> **依赖**：无（最先执行） · **对应**：proposal §7/§10-M1、detail-design §2.4/§9.1
> **产物**：可运行的 Astro 空站 + 工程化骨架
> **完成后**：F 层基础模块方可开工

## 最小任务
- [x] **S-T1** 用 `npm create astro@latest`（空模板、TypeScript `strict`）初始化项目
- [x] **S-T2** 接入 Tailwind v4（`astro add tailwind` 或 `@tailwindcss/vite`），创建 `src/styles/global.css` 并 `@import "tailwindcss"`
- [x] **S-T3** 安装集成：`@astrojs/sitemap`、`@astrojs/rss`、`@astrojs/mdx`、`@astrojs/preact`、`pagefind`、`sharp`（图片）
- [x] **S-T4** 配置 `astro.config.mjs`：`site` URL、集成列表、静态输出（`output: 'static'`）
- [x] **S-T5** 建目录骨架：`src/{components/ui,components/features,layouts,pages,content,data,lib/dal,lib/utils,styles,i18n}`、`test/{fixtures,unit,component,e2e,a11y}`、`public/`
- [x] **S-T6** 配置 `tsconfig.json`（strict + 路径别名 `@/*` → `src/*`）
- [x] **S-T7** 配置 ESLint + Prettier，并加 `import/no-restricted-paths` 规则：禁止 `pages/**`、`components/features/*/**` 互相 import（detail-design §8.6）
- [x] **S-T8** 配置测试：Vitest + Astro Container API、Playwright（多浏览器 project）、axe-core；各放一个示例测试跑通
- [x] **S-T9** 配置 `package.json` scripts：`dev/build/postbuild(pagefind --site dist)/preview/check/test/test:e2e/lint/format`
- [x] **S-T10** 创建 `.gitignore`、`.env.example`（PUBLIC_SITE_URL/PUBLIC_WEB3FORMS_KEY/PUBLIC_TURNSTILE_SITEKEY）、`.nvmrc`、`README.md`、`CLAUDE.md`（可用 `/init`）
- [x] **S-T11** `git init` 首次提交；确认 `npm run dev`、`npm run check`、`npm test` 均可运行

## 完成标准（DoD）
- [x] `npm run dev` 正常启动，页面可访问
- [x] `lint` / `check` / `test` 脚手架可运行且示例通过
- [x] 目录结构与依赖边界规则（ESLint）就位
