# mldangelo `/projects` behavior notes

Target: <https://mldangelo.com/projects>

Captured references:

- Desktop: `docs/design-references/mldangelo/projects-desktop.png`
- Mobile dark: `docs/design-references/mldangelo/projects-mobile-dark.png`
- Local desktop QA: `docs/design-references/local/projects-desktop-final.png`
- Local mobile QA: `docs/design-references/local/projects-mobile-final.png`

## Interaction model

- Header navigation is sticky at the top of the viewport.
- Active nav item is a taller highlighted tab with a blue underline/accent.
- Theme button toggles light/dark mode; the site follows a simple global theme model.
- Mobile navigation collapses behind a hamburger button.
- Project cards are mostly static link cards.
- Project cards have subtle hover/focus behavior: link affordance, border/shadow/visual lift.

## Responsive behavior

- Desktop around 1440px: centered page content, two-column project grid, large card visual area.
- Mobile around 390px: one-column project grid, compact header, stacked footer.
- The page keeps the same section order at every width: hero → grouped project cards → footer.

## Visual tokens observed

- Page background: dark charcoal in dark mode, pale gray/white in light mode.
- Primary accent: saturated blue used for active nav, links, and technology pills.
- Typography: heavy rounded headings, bold nav labels, readable sans body copy.
- Cards: rounded rectangle, subtle border, large top visual image, generous internal padding.
