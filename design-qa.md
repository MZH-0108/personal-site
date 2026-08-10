# Design QA — Homepage option 2

## Scope and evidence

- Visual source: `docs/design-references/local/homepage-option-2-mage-xiaoguan.png` (1536×1024).
- Final desktop capture: `.design-evidence/implementation/home-option-2-desktop-final.png` (1425×1013 visible viewport capture; browser viewport configured at 1440×1024, DPR 1).
- Final mobile capture: `.design-evidence/implementation/home-option-2-mobile-final.png` (375×811 visible viewport capture; browser viewport configured at 390×844, DPR 1).
- Full-view comparison: `.design-evidence/implementation/compare-home-desktop-final.png`.
- Focused hero comparison: `.design-evidence/implementation/compare-home-hero-final.png`.
- State: light theme, homepage at the top of the document.

The reference and final desktop capture were placed side by side in one comparison image before the final judgment. The focused comparison isolates the navigation and hero, where typography, portrait crop, CTA placement, and spacing carry most of the visual identity.

## Required fidelity surfaces

- Typography: passed. The oversized Chinese name, strong role line, blue statement, restrained body copy, and compact navigation preserve the selected editorial hierarchy.
- Spacing and layout rhythm: passed. The split hero, portrait baseline, CTA row, divider, project panel, and recent-writing panel align with the reference's proportions at desktop and collapse cleanly on mobile.
- Colors and tokens: passed. Warm ivory background, near-black type, cobalt accents, pale dividers, and outlined secondary actions are consistent across the page.
- Image quality: passed. The homepage portrait is a real color raster asset on an ivory background, and the featured project uses a purpose-built raster image based on the actual mini-program ordering interface.
- Copy and content: passed. The page uses the user's real identity and positioning; the representative work is exactly `馬哥小馆儿`, identified as a WeChat mini program.

## Interaction and implementation checks

- Primary CTA destinations are present in the production output: `关于我` → `/about`, `查看简历` → `/resume`.
- Featured-project and writing links resolve to their corresponding routes in the generated HTML.
- The mobile navigation button is wired with `aria-controls`, `aria-expanded`, and a script that synchronizes the open state. A final automated click attempt was blocked by the in-app browser security policy; no policy bypass was attempted.
- Mobile visual check passed at 390×844 with no horizontal overflow in the captured state.
- `astro check`: passed with 0 errors, 0 warnings, 0 hints.
- `vitest run`: passed, 2 files and 6 tests.
- `astro build`: passed, 8 static pages generated.

## Comparison history

- Pass 1: P2 — the portrait had a dark circular background and the title scale was too small relative to the selected source.
- Fix: generated an ivory-background color portrait, enlarged the title, and adjusted portrait width/crop and vertical alignment.
- Pass 2: no actionable P0, P1, or P2 findings remained.

## Follow-up polish

- P3: the generated reference includes a small dotted decoration that was omitted because it does not affect hierarchy or usability.
- P3: the portrait's ivory field is slightly more visible than the page background at some display settings.
- P3: article dates and descriptions use real project content instead of the exploratory mock's placeholder content.

final result: passed
