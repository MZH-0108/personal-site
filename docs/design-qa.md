# Design QA — 创意空间

## Scope and evidence

- Date: 2026-11-12. Local-only implementation; no deployment or Git push.
- Route: `http://127.0.0.1:4323/creative`.
- Approved direction: option 2, metallic MZH particle typography; page name `创意空间`, navigation label `创意`.
- Source visual truth: `C:/Users/28655/.codex/generated_images/019fea6b-4f04-71d1-8745-c43607db0836/exec-5980ec84-f1f9-4cb4-b59d-70065e7d147b.png`.
- Source pixels: 1487 × 1058. Browser CSS viewport: 1487 × 1058, deviceScaleFactor 1; implementation screenshot pixels: 1487 × 1058. No density normalization or browser frame is required.
- Evidence directory: `E:/猪崽崽/.site-qa/creative-2026-11-12/`.
- Full-view comparison: `comparison-full.png`, source left, actual resting state right. Interaction-state comparison: `comparison-hover.png`, source left, actual hover near the H right. The source is a generated visual concept, not a deterministic simulation frame; particle positions and cursor rendering are not compared pixel-for-pixel.
- Focused typography comparison: `comparison-type.png`, source and actual crop x35/y115/w500/h355.
- Previous homepage QA is preserved in `design-qa-homepage-option-2.md`.

## Findings and comparison history

1. P1 — desktop H clipping and light-grey ground. The first renderer cropped the right H and reflected a bright environment across the floor. Fixed framing/scale and replaced the ground surface with a matte dark deck. Post-fix evidence: `creative-scene-revised.png`.
2. P1 — portrait clipping. The 390 × 844 and 768 × 1024 versions clipped outer letters and the deck hid the letter bottoms. Fixed camera fitting from real model bounds, retained horizontal margins, and lowered the portrait deck. Post-fix evidence: `creative-scene-phone.png`, `creative-scene-tablet.png`.
3. P2 — optical size of secondary desktop text. Eyebrow, description, hint, buttons and footer were too small against the reference. Increased their desktop sizes to 15/18/14/16/13 px while retaining small-screen layout. Post-fix evidence: `creative-desktop-type-polished.png` and updated `comparison-type.png`.
4. P2 — material depth and optical noise. Initial metallic letters looked like a thin, regular grid rather than a volumetric particle sculpture. Fixed with staggered/jittered distribution, limited rear/side depth, varied sphere sizes, a few blue ellipsoids and broad studio reflections. The final side-by-side `comparison-hover.png` shows readable silver/cobalt MZH with smooth highlights and a dark ground; the thin-grid/noisy-room problem is resolved. The model was also lifted and slightly reduced to clear the title.
5. P2 — short landscape composition. At 844 × 390 the word extended behind the control row. Added a short-landscape camera composition placing the sculpture at upper right, with its bottom around y240 above the controls. Post-fix evidence: `creative-844x390.png` and `creative-scene-landscape.png`.
6. P2 — adaptive resolution could fork the animation loop. Added a queued-frame guard. A browser regression check with 185 synthetic 42 ms frames reduced DPR to 0.85 while retaining exactly one pending draw callback.
7. P2 — no-JavaScript state retained a misleading loading message and hid controls without preserving the footer spacing. Hide loading and unavailable controls when noscript content is present, and push the footer below the visual. Final full-page evidence: `creative-no-js.png`; static content is ordered title → MZH visual → footer/explanation.
8. P2 — very small mobile motion/control text. Increased mobile button/hint/footer sizing; 320/390/844 normal and system-static states were rechecked, including the six-character system label. Evidence: `creative-readable-{320|390|844}-{normal|system}.png`; controls remain at least 44 × 44 px and text is not clipped.

Final visual pass: no remaining actionable P0/P1/P2 findings. Full view, focused typography, phone, tablet, short landscape and static fallback were opened and inspected after the fixes; this is not a build-only acceptance.

## Required fidelity surfaces

- Fonts/typography: passed. The native sans-serif stack (`Segoe UI`, `PingFang SC`, `Microsoft YaHei`, Helvetica/Arial), bold two-line display hierarchy, controlled negative tracking and approved copy remain coherent. `comparison-type.png` confirms matching wrapping, prominent display weight and appropriate secondary-text scale. The generated source has no identifiable packaged font; exact glyph outlines are not asserted. Small-screen optical sizing was separately improved and inspected.
- Spacing/layout rhythm: passed. Header intentionally retains the site's existing navigation rather than the concept's simplified header. Left copy, large right/lower field, thin control divider and quiet footer preserve the selected hierarchy without added cards. Portrait model is fully visible; short-landscape sculpture clears controls. Mobile and static fallback retain a readable visual order.
- Colors/tokens: passed. Dark graphite/navy, near-white display type, cobalt primary action and blue/silver particles match the art direction. Broad metal highlights now replace noisy grey reflections; floor stays dark. No warm homepage tokens leak into this route; focus/disabled states remain legible.
- Image/asset quality: the main experience is actual interactive instanced 3D geometry, not a flattened screenshot. A generated 1440 × 720 WebP (~109 KB) is only used for static fallback. No Lusion media, models, music or branding were copied. The fallback is sharp and keeps MZH fully visible.
- Copy/content: approved `创意空间 / TYPE FIELD`, `把想法，推成形。`, `移动指针，让字形重新生长。`, release/regather actions and concise footer are present. No added biography, fabricated metrics or ornamental cards.
- Icons: retain the site's existing icon component and brand; return-home, search and mobile menu remain consistent with the rest of the personal site.

## Interaction and implementation checks

- Unit tests: 8 files, 35 tests passed.
- Astro check: 48 files, 0 errors/warnings/hints.
- Production build: 18 pages; existing shared Three.js chunk is lazy-loaded for interactive routes. No new package dependency.
- Build audit: 778 local page links, 125 anchors, 127 asset references; no missing assets, duplicate IDs or empty links.
- Independent Edge browser suite: hover, pulse, release, regather, keyboard arrows/Enter/Space/Escape, static mode and system reduced-motion all passed.
- Eight viewports: 1440 × 1000, 1101 × 850, 1024 × 768, 901 × 800, 768 × 1024, 390 × 844, 320 × 740, 844 × 390. No horizontal overflow; main control hit areas remain at least 44 px tall.
- Touch: horizontal interaction locks only after intent threshold; vertical pan and pinch remain native; multi-touch, blur and lost capture cancel the gesture.
- No-JavaScript and denied-WebGL states retain the generated static visual and explanatory copy.
- Integration: home entry, navigation, search, return home and existing `/immersive` eight chapters checked; contact footer retained.
- Normal browser suite page errors and console errors: none.
- Final production-base browser pass: passed at `/personal-site/`; release/regather, home link and home entry work. No page errors and no external HTTP requests across these flows.
- Final pointer check: resting, hover and pulse screenshots have distinct model-pixel hashes; both hover deformation and click ripple change the actual H, not only button labels.
- Initialization-failure check: deliberately denying the font-mask 2D context after WebGL creation selects fallback and calls GPU context release exactly once.
- Final build and build audit rerun after the static-layout fix: passed. The build retains the existing shared Three.js size advisory (~134 KB gzip), not an error; it is dynamically imported only on interactive routes.

## Open questions

None regarding name or selected direction. Original site navigation and local-only delivery are intentional. The interactive sculpture is not an offline ray-traced render and does not claim exact pixel identity to the generated concept.

## Implementation checklist

- [x] Independent route, site navigation, search and homepage entry.
- [x] Working MZH particle interaction and motion preferences.
- [x] Static fallback and resource cleanup checks.
- [x] Final lighting/depth and short-landscape refinement.
- [x] Final recapture, same-input comparison and production-base browser verification.

## Follow-up polish and accepted limitations

- P3 / expected: real-time particle geometry, restrained reflection and native-pointer capture differ from the generated offline concept's ray-traced glints and illustrated cursor halo. This is a functional sculpture, not a raster imitation; the approved subject, metallic palette and page hierarchy are retained.
- P3 / test coverage: touch and reduced-motion checks used isolated Edge emulation, not a physical iPhone/Android handset. Real mobile GPU and cellular-network performance can vary. No claim is made that this change removes GitHub Pages' domestic-network limitations.
- Local preview only. Publishing still requires the user's review/approval.

final result: passed
