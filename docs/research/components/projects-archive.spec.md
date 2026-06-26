# Projects Archive Specification

## Overview

- **Target files:** `src/pages/projects.astro`, `src/components/ProjectCard.astro`, `src/styles/global.css`
- **Reference screenshots:**
  - `docs/design-references/mldangelo/projects-desktop.png`
  - `docs/design-references/mldangelo/projects-mobile-dark.png`
  - `docs/design-references/local/projects-desktop-final.png`
  - `docs/design-references/local/projects-mobile-final.png`
- **Interaction model:** static card grid with hover/focus states; responsive grid; inherited sticky header and theme toggle.

## DOM Structure

```text
BaseLayout
  archive hero
    h1 Archive
    p lead
  archive sections
    archive group
      group heading
      project grid
        ProjectCard
          visual image/generated panel
          content
            h2 title
            p subtitle
            p description
            tag row
            year
```

## Key style rules

- `.archive-hero`: centered, compact top spacing, uses the global page title style.
- `.archive-group-heading h2`: uppercase, small, heavy, muted text.
- `.project-grid`: 2 columns on desktop, 1 column below 860px.
- `.project-card`: rounded 14px, dark panel, blue-tinted border, subtle shadow.
- `.project-visual`: 220px visual area, image or generated gradient.
- `.project-content`: large padding, title/subtitle/description/tags/year hierarchy.
- `.tag`: blue pill with border and soft fill.

## Resume content mapping

- `orderToZhu 家庭点餐本微信小程序` and `采购平台与招标小程序` → Products & Platforms.
- `隧道病害图像识别与标注`, `阿里外卖平台训练项目`, and `机器人与少儿编程课程` → Research & Training.

## Known deviations from source

- Original project images are not copied.
- User content replaces all original text.
- The page keeps this site's existing Chinese typography fallback and dark default.
