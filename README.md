# Personal Site

A dark minimal personal website inspired by the visual style of https://mldangelo.com/, rebuilt as 马志昊的个人主页.

## Live site

- GitHub Pages: https://mzh-0108.github.io/personal-site/
- EdgeOne Pages preview: generated from the EdgeOne console or CLI. The `edgeone.cool` preview/project URL may require a temporary `eo_token` link and is not a stable public China-mainland URL without a custom domain/ICP setup.
- Repository: https://github.com/MZH-0108/personal-site

## Current content

- Resume content: extracted and summarized from the provided PDF resume.
- Featured project: `E:\APP\orderToZhu` is included as the first project, `orderToZhu 家庭点餐本微信小程序`.
- Privacy: phone number and the original PDF resume are not committed or published.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm test
npm run check
npm run build
```

## Personalize later

Edit `src/data/site.ts` for name, tagline, projects, experience, education, skills, email, social links, and avatar path.

## Deployment

GitHub Pages is configured in `.github/workflows/deploy-github-pages.yml`.

For the second free deployment target, see `DEPLOYMENT.md`.
