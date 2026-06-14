# Accessibility

The interface targets WCAG 2.2 Level AA for the static practice surface.
Automated checks are useful evidence, not a blanket certification.

## Themes And Contrast

- `Auto` follows `prefers-color-scheme`.
- `Light` and `Dark` are persistent manual overrides.
- Normal-size text tokens are tested at 4.5:1 or better against primary
  backgrounds.
- borders and focus indicators are tested at 3:1 or better.
- dark mode uses elevated charcoal-green surfaces rather than near-black.

The checks implement the WCAG relative-luminance formula in
`tests/accessibility.test.mjs`.

## Interaction

- all navigation and answers use native buttons or selects
- track controls have explicit text labels
- keyboard focus uses a 3px high-contrast outline
- answer targets are at least 40px high; compact controls are at least 36px
- correctness uses text markers, borders, and color
- wrong choices are disabled after selection
- status changes are announced through an assertive live region
- typing supports keyboard input, Tab insertion, and Escape reset

## Motion, Audio, And Network

The site contains no sound, vibration, autoplay, analytics, or runtime network
requests. It does not rely on animation to communicate state.

## Language

Visible instructional prose is intentionally sparse. Compact English labels
remain where symbols alone were ambiguous, and fuller English labels remain for
assistive technology.

## References

- WCAG 2.2 contrast minimum:
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 non-text contrast:
  https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WCAG 2.2 focus appearance:
  https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- WCAG 2.2 target size:
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Media Queries `prefers-color-scheme`:
  https://www.w3.org/TR/mediaqueries-5/#prefers-color-scheme
