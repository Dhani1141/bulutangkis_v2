/**
 * Hidden SVG filter definitions for the "liquid glass" effect.
 * Referenced from CSS via `filter: url(#container-glass)` / `url(#btn-glass)`
 * on the ::after pseudo-element of glass surfaces (see index.css).
 *
 * The turbulence noise is fed into a displacement map, which warps whatever
 * the backdrop-filter captured behind the element -> refraction-like look.
 * Works best in Chromium browsers; others gracefully fall back to plain glass.
 */
export default function GlassFilters() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      <defs>
        {/* Large surfaces (cards, panels, modals) */}
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Small surfaces (buttons, pills, inputs) */}
        <filter id="btn-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="40" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
