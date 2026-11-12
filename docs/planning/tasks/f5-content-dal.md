# F5 · 内容与数据访问层（DAL）— 任务清单

> **依赖**：F8 · **对应**：FR-CMS-*、各内容 FR · detail-design §3-F5、§5
> **产物**：`src/content/config.ts`、`src/data/*`、`src/lib/dal/*`
> **契约**：Collections schema + DTO + DAL 函数签名（见 detail-design §5）。**此模块是页面唯一取数入口，是模块独立性的核心解耦缝**

## 最小任务
- [x] **F5-T1** `content/config.ts`：定义 `blog`/`projects`/`photos` 三个 collection 的 Zod schema（字段见 detail-design §5.1）
- [x] **F5-T2** 站点数据文件 `data/{site,nav,socials,skills,timeline,links}.ts` + `data/now.md`，并定义类型（§5.2）
- [x] **F5-T3** DAL 站点数据函数：`getSiteConfig/getNav/getSocials/getSkills/getTimeline/getLinks`（同步）+ 单测
- [x] **F5-T4** DAL 项目：`getProjects(opt?)`（按 `featured`/`order`/`date` 排序）、`getFeaturedProjects(limit)`、`getProjectBySlug`、`getProjectCategories`，返回 `ProjectDTO`。单测排序/空集/缺字段
- [x] **F5-T5** DAL 博客：`getPosts(opt?)`（**默认过滤 draft**、按日期倒序、支持分页/tag）、`getPostBySlug`（含 headings）、`getAdjacentPosts`、`getTags`，返回 `PostDTO`。单测草稿过滤/排序/边界
- [x] **F5-T6** DAL 摄影：`getPhotos(album?)` → `PhotoDTO`。单测
- [x] **F5-T7** 测试 fixtures：假 blog/projects/photos/站点数据放 `test/fixtures/`（供所有功能模块 mock 复用）
- [x] **F5-T8** 契约快照测试：DTO 字段与类型稳定（防破坏性变更）

## 完成标准（DoD）
- [x] DAL 为页面唯一取数入口，封装排序/过滤/草稿逻辑
- [x] DTO 稳定，纯逻辑覆盖率 ≥ 90%
- [x] 可被 `vi.mock('@/lib/dal')` 注入假数据，支撑各页面独立测试
