# Deployment Plan

This project is static Astro output and can be deployed for free on multiple hosts.

## Primary free site: GitHub Pages

- Repository target: `MZH-0108/personal-site`
- Expected URL after successful workflow: `https://mzh-0108.github.io/personal-site/`
- Build command: `npm run build`
- Output directory: `dist`
- Workflow: `.github/workflows/deploy-github-pages.yml`
- Astro deployment reference: https://docs.astro.build/en/guides/deploy/github/

## Second free site candidates

The best second-host choice depends on which account is logged in:

1. EdgeOne Pages — preferred for mainland China testing because Tencent's edge network may perform better domestically. Astro lists EdgeOne Pages as an official deployment target: https://docs.astro.build/en/guides/deploy/edgeone-pages/
2. Cloudflare Pages — excellent global free static hosting, but mainland China stability is not guaranteed without enterprise/China-network arrangements. Astro deployment reference: https://docs.astro.build/en/guides/deploy/cloudflare/
3. Vercel Hobby — very convenient free deployment, but no guarantee of mainland China stability. Astro deployment reference: https://docs.astro.build/en/guides/deploy/vercel/

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
