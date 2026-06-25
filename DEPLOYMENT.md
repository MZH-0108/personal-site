# Deployment Plan

This project is static Astro output and can be deployed for free on multiple hosts.

## Primary free site: GitHub Pages

- Repository target: `MZH-0108/personal-site`
- Live URL: `https://mzh-0108.github.io/personal-site/`
- Build command: `npm run build`
- Output directory: `dist`
- Workflow: `.github/workflows/deploy-github-pages.yml`
- Astro deployment reference: https://docs.astro.build/en/guides/deploy/github/

## Second free site candidates

## Second free site: EdgeOne Pages

- Project ID: `makers-cfgd83de0uhb`
- Live URL: `https://personal-site-p3qcklv4.edgeone.cool/`
- Deployment command used:

```bash
npx edgeone makers deploy ./dist -n personal-site -e production -a global
```

## Other free site candidates

If a third mirror is needed:

1. Cloudflare Pages — excellent global free static hosting, but mainland China stability is not guaranteed without enterprise/China-network arrangements. Astro deployment reference: https://docs.astro.build/en/guides/deploy/cloudflare/
2. Vercel Hobby — very convenient free deployment, but no guarantee of mainland China stability. Astro deployment reference: https://docs.astro.build/en/guides/deploy/vercel/

## Mainland China stability note

Free global hosts can be usable from China, but none can guarantee consistently fast domestic access. If the free dual-site setup is not stable enough, upgrade path is:

1. Buy a custom domain.
2. Complete ICP filing if hosting/CDN is inside mainland China.
3. Use a mainland-friendly CDN/edge provider such as Tencent EdgeOne with the filed domain.

## Personalization checklist before public launch

- Replace `Your Name` and `YN` in `src/data/site.ts`.
- Replace `[占位]` copy in `src/data/site.ts` and page files.
- Replace `public/images/avatar.png` with a real avatar if desired.
- Update `site.sourceUrl`, social links, and email.
- If deploying somewhere other than GitHub Pages, keep `DEPLOY_TARGET` unset so Astro uses root-relative paths.
