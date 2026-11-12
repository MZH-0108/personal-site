# P10 · 联系 Contact — 任务清单

> **依赖**：F3、F2(Input/Textarea/Button)、F5(`getSocials`)、`ContactForm` 岛屿、Web3Forms、Turnstile · **对应**：FR-CONTACT-01..03 · detail-design §4-P10 · **路由** `/contact`
> **输入/输出契约**：社交 `getSocials()` 直链；表单字段 `{name,email,message,honeypot,turnstile}` → `POST api.web3forms.com/submit`；状态 idle/submitting/success/error

## 最小任务
- [ ] **P10-T1** 社交直链 + 邮箱反爬（JS 拼装/图片）。测试
- [ ] **P10-T2** `ContactForm` 岛屿：字段 + 前端校验（必填、邮箱格式）+ 状态机（idle→submitting→success|error）+ 蜜罐字段。组件测试：校验/蜜罐拦截/状态机，**mock fetch** 测 success/error 分支
- [ ] **P10-T3** Cloudflare Turnstile 集成（`PUBLIC_TURNSTILE_SITEKEY`）
- [ ] **P10-T4** `pages/contact.astro` 组装；端点 key 经 `import.meta.env.PUBLIC_WEB3FORMS_KEY` 注入
- [ ] **P10-T5** E2E：用 mock 端点走完整提交流程；axe（label 关联 + 错误 `aria-live`）

## 完成标准（DoD）
- [ ] 表单校验、防垃圾、提交态完整，失败可重试
- [ ] 端点可注入/mock，**不依赖真实网络即可独立测试**
- [ ] axe 0 violations
