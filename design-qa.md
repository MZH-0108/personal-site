# Editorial scroll v2 QA

final result: passed

This is the implementation and visual regression gate, not user acceptance of smoothness. Formal visual approval remains pending. No production deployment or merge performed.

## Evidence and comparison

- Source: `public/images/portrait-editorial-approved.png` (406×392), existing approved homepage screenshot `docs/scroll-preview/portrait-approved-preview.jpg`, and `docs/scroll-v2/storyboard.md`.
- Browser captures: `docs/scroll-v2/hero.jpg`, `transition.jpg`, `feature.jpg`, `stack.jpg`, `responsive.jpg`, `dark.jpg`; sequential overview `sequence.jpg`.
- Desktop screenshot 1348×926 pixels; CSS viewport1363×936 with devicePixelRatio1. Source artwork is capped at406px. No high-resolution claim.
- Combined comparison: `comparison.jpg`; focused 1:1 artwork comparison: `portrait-comparison.jpg`. The overview reduces the whole page for hierarchy review, while focused comparison retains original dimensions.
- Same homepage/light state compared; portrait identity, full paper composition, location, vertical type and signature remain intact. Full-page composition is intentionally unchanged except smaller native-size portrait. Motion states are tested separately from static fidelity.

## Findings and fixes

- Existing low-amplitude parallax and long .6/.7 second animation follow were replaced by larger relative travel and a shared .25 second follow. Image expansion, image movement, and copy reveal now have separate narrative roles.
- Existing480px portrait display exceeded the406px source. Capped display at406px; no artificial upscaling or layer fabrication.
- Keyboard focus could leave project content behind foreground cards. Whole stack switches to normal flow while focused. Browser verified all three cards become relative-positioned after tabbing to a project link.
- No actionable P0/P1/P2 visual regressions identified in captured states. Overall polish and motion intensity are awaiting the user's review.

## Required surfaces

- Typography: existing Chinese font stack, weights and two-line hero retained; narrow headings and buttons remain readable.
- Layout: same two-column desktop and single-column mobile hierarchy. Native portrait sizing is intentional. Short320px sticky travel; no full-screen pin trap. Tablet/short windows retain flow.
- Color: warm light background and blue accent retained; dark theme checked. Artwork retains its light paper background in dark mode deliberately.
- Image fidelity: supplied artwork unchanged, no crop of face/signature, no synthetic replacements. Restaurant image uses existing responsive assets, deliberate image-scale crop confined to its frame.
- Content: all facts, links and sections retained. No invented achievements or additional marketing copy.

## Verified

- Desktop wheel scrolling through hero, handoff, featured image and practice; fast2300px down/up scroll returns to top.
- At y460 hero and portrait have opposite relative transforms. At y930 feature stage top≈101px, image scale≈1.021; after260px more travel stage starts leaving and image is≈1.001. These are DOM samples, not FPS measurements.
- Research chapter anchor settles to aria-current=location; research detail opens and browser Back restores homepage anchor.
- Keyboard focus restores cards to normal flow.
- Manual reduced-motion button activated by keyboard; root becomes reduced and feature position relative; reload retains aria-pressed=true. Re-enabled successfully.
- Light/dark toggled and captured.
- Chromium iframe320×820,390×820,834×820: client widths305/375/819, scroll widths equal, no document overflow; sticky disabled. Tablet resized to1024×600: sticky disabled. These are frames, not physical devices or touch emulation.
-390px mobile menu opens/closes.
- Console inspected: no observed site-origin errors; extension metadata errors excluded.
- `npm run check`:0 errors/warnings/hints; `npm test`:15 passing tests; GitHub Pages build16 pages; verifier639 links,110 anchors,113 resources, no failures.

## Remaining coverage and visual review

- Physical iOS/Android, Safari, coarse-input emulation, OS-level reduced-motion switching and actual JavaScript-disabled browser mode were not exercised this round. Source review confirms content is visible by default and sticky rules require JS-set full-motion state.
- No measured FPS, memory, layout-shift score or performance guarantee. Only transform properties animate; no added video/network dependency. Homepage script gzip46.91kB.
- The preview runs from this branch; temporary viewport harness was removed before commit. Earlier QA is archived in `docs/scroll-v2/previous-qa.md`.

## Checklist

- [x] Storyboard before implementation
- [x] Original artwork and content retained
- [x] Browser desktop and responsive review
- [x] Build/check/test/link gates
- [x] Key-state evidence
- [ ] User visual acceptance
- [ ] Physical-device performance review
