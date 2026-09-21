# Scroll experience design QA

final result: passed

## Scope and visual evidence

User selected all three concepts: layered portrait hero, cinematic featured project, and a sticky chapter rail with stacking cards. These are combined into the existing Astro homepage; existing project details, resume, notes, navigation and contact remain available.

- Source visual truth: `docs/scroll-preview/combined-reference.jpg` (793 × 1983 px concept image).
- Browser evidence: `docs/scroll-preview/hero.jpg`, `cinema.jpg`, `stack.jpg` (each 1348 × 926 px), `responsive.jpg` (1363 × 936 px), `dark.jpg`.
- Full comparison: `docs/scroll-preview/design-comparison.jpg`. The source and three browser states are shown together at a normalized 620 px content width, preserving aspect ratios. The source is an illustrative long-page concept, not a browser screenshot with a known CSS viewport; this is a composition and behavior comparison, not a pixel-identical claim.
- Desktop CSS viewport: 1363 × 936, document client width 1348. Browser screenshots omit the scrollbar. No density upscaling.
- Responsive CSS frames: 390 × 820 and 834 × 820 (375 and 819 px client widths with scrollbars). A 320 px frame was also checked before the session recovery.
- States reviewed: initial hero, featured project after its anchor, featured project while sticky, research chapter while cards overlap, mobile/tablet project cards, light/dark, motion disabled and restored.
- Focused inspection: original-size hero/feature/card screenshots were reviewed for portrait crop, phone visibility, Chinese wrapping, icon alignment, controls and card edges. The montage alone was not used to judge text legibility.

## Findings and fixes

No actionable P0/P1/P2 findings remain.

1. **P2 — tablet project column too narrow.** The first 834 px render retained the desktop two-column practice layout without a sticky rail, leaving unused space. Changed 761–999 px layouts to full-width cards with a horizontal chapter navigation. Final evidence: `responsive.jpg`.
2. **P2 — chapter tracking during overlap.** Sticky cards are unsuitable as intersection anchors. Chapter tracking now measures natural-flow marker positions, scheduled once per animation frame by passive scroll events. Selecting the research anchor produces `aria-current="location"` on Engineering AI; upward navigation is based on the same marker positions.
3. **P2 — motion accessibility.** Motion is progressive: content is visible without JS. OS reduced-motion preference takes precedence; a visible toggle remembers the user's reduced-motion choice. Disabling motion reverts GSAP styles and sticky track height. Reload persistence and re-enabling were tested. OS preference handling was reviewed in code; no OS-level media emulation was available.
4. **P2 — portrait footer alignment.** Accounted for the existing Icon component's wrapper, removed incidental link underlining, and aligned the icon at the end of the footer. Final evidence: `hero.jpg`.
5. **Preview recovery.** A session reset removed the first local checkout. Restored the reviewed source, persisted it on `codex/immersive-portfolio-scroll`, reran check/tests/build/link verification and re-rendered the final screenshots. A previous Vite cache conflict was resolved by starting preview after the production build.

## Required fidelity surfaces

- **Typography:** retains existing Chinese system font stack, heading hierarchy, blue AI accent and letter spacing. Main heading stays on two lines. Card titles wrap naturally on very narrow screens. Compact chapter/metadata text is intentional secondary content.
- **Layout:** ivory editorial hero, portrait layers, full-width featured scene and desktop left rail are retained. The working scroll sequence gives each card reading time rather than showing all cards simultaneously as in the static concept. Native scrolling and short sticky travel avoid a long scroll trap. Tablet/mobile cards use natural flow; short desktop windows also disable sticking.
- **Color:** existing light/dark tokens are reused. Dark ink, pale sage and paper card surfaces distinguish the three practices. Featured white text sits on a dark translucent panel. No gradient artwork was substituted.
- **Images/icons:** existing real portrait and restaurant project image are used, with Astro-generated WebP/srcset variants. The phone remains visible as relevant project context; it was absent from the combined generated concept. Existing Font Awesome icons and the site's MZH wordmark are retained instead of an invented handwritten logo. No replacement face, new illustration or mock asset is required.
- **Copy/content:** real existing biography, projects and factual proof metrics are preserved. No new accomplishments or performance statistics were invented. Existing skills, timeline and notes continue below the three featured design sections.

## Functional and accessibility verification

- Native wheel scroll: feature top holds at 100 px while its image scale advances from approximately 1.055 to 1.041.
- Hero and location note move at different restrained rates; portrait link remains actionable.
- Chapter anchors, active state, research project detail navigation and browser Back restoration work.
- Sticky cards retain visible keyboard focus using `:focus-within`; all content remains in DOM order.
- Existing capability tabs work by click and ArrowRight; the selected tab updates its ARIA state.
- Mobile navigation opens and closes. Homepage layout and cards have no horizontal overflow at 390/834 px; 320 px was checked before recovery.
- Light/dark theme checked visually. Reduced motion toggle tested through reload.
- No-JavaScript frame inspected before recovery: content and project anchors remain available; static navigation remains visible. Added extra anchor margin for the expanded non-JS header.
- Console checked after restoration: no site-origin errors or warnings. Unrelated browser-extension metadata messages are excluded.

## Automated validation

- `npm run check`: 0 errors, 0 warnings, 0 hints (35 files).
- `npm test`: 15 tests passed across 4 files.
- `DEPLOY_TARGET=github-pages npm run build`: 16 pages built.
- `node scripts/verify-build.mjs /personal-site`: passed; 639 local page links, 110 anchors, 115 asset references, 0 empty links, 0 failures.
- Existing deployment workflow and GitHub Pages base path are retained.

## Follow-up limitations

Responsive checks used Chromium frames, not physical iOS/Android/tablet hardware. Safari/touch inertia and device-specific performance still merit a real-device check before release. No measured FPS claim is made. The implementation adds about 47 KB gzip to the homepage script bundle. Native scrolling, responsive images, reduced motion and transform-only scroll animation limit the cost.

## Implementation checklist

- [x] Combine all three selected directions.
- [x] Preserve existing content and real assets.
- [x] Fix responsive and motion-state issues.
- [x] Re-render and compare final screenshots.
- [x] Pass existing test, type, build and link gates.
- [x] Keep an interactive preview open; propose changes on a separate branch.
