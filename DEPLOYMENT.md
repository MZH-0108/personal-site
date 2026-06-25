# Deployment Plan

This project is static Astro output and can be deployed for free on multiple hosts.

## Primary free site: GitHub Pages

- Repository target: `MZH-0108/personal-site`
- Live URL: `https://mzh-0108.github.io/personal-site/`
- Build command: `npm run build`
- Output directory: `dist`
- Workflow: `.github/workflows/deploy-github-pages.yml`
- Astro deployment reference: https://docs.astro.build/en/guides/deploy/github/

## Second free site: EdgeOne Pages

- Project ID: `makers-cfgd83de0uhb`
- Project domain: `https://personal-site-p3qcklv4.edgeone.cool/`
- Important: for the China/global acceleration modes, EdgeOne's `edgeone.cool` project/deployment domain may require a system-generated preview URL with temporary authentication. The temporary preview link is valid for about 3 hours. For a stable public China-mainland URL, bind a custom domain and complete ICP filing if required.
- Deployment command used:

```bash
npx edgeone makers deploy ./dist -n personal-site -e production -a global
```

## Other free site candidates

If a third mirror is needed:

1. Cloudflare Pages: excellent global free static hosting, but mainland China stability is not guaranteed without enterprise/China-network arrangements. Astro deployment reference: https://docs.astro.build/en/guides/deploy/cloudflare/
2. Vercel Hobby: very convenient free deployment, but no guarantee of mainland China stability. Astro deployment reference: https://docs.astro.build/en/guides/deploy/vercel/

## Mainland China stability note

Free global hosts can be usable from China, but none can guarantee consistently fast domestic access. If the free dual-site setup is not stable enough, upgrade path is:

1. Buy a custom domain.
2. Complete ICP filing if hosting/CDN is inside mainland China.
3. Use a mainland-friendly CDN/edge provider such as Tencent EdgeOne with the filed domain.

## Current public-content status

- `src/data/site.ts` now contains 马志昊的公开简历摘要、教育经历、工作经历、技能和精选项目。
- `orderToZhu` is listed as the first featured project.
- Phone number and the source PDF resume are intentionally not published.
- If deploying somewhere other than GitHub Pages, keep `DEPLOY_TARGET` unset so Astro uses root-relative paths.
