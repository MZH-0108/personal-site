# Personal Site

A dark minimal personal website inspired by the visual style of https://mldangelo.com/, rebuilt with original placeholder content and assets.

## Live site

- GitHub Pages: https://mzh-0108.github.io/personal-site/
- EdgeOne Pages preview: generated from the EdgeOne console or CLI. The `edgeone.cool` preview/project URL may require a temporary `eo_token` link and is not a stable public China-mainland URL without a custom domain/ICP setup.
- Repository: https://github.com/MZH-0108/personal-site

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

## Personalize

Edit `src/data/site.ts` first:

- `Your Name`
- `YN`
- `[占位]` copy
- email and social links
- `public/images/avatar.png`

## Deployment

GitHub Pages is configured in `.github/workflows/deploy-github-pages.yml`.

For the second free deployment target, see `DEPLOYMENT.md`.
