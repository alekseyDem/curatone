import React from 'react'

/**
 * Concentric hairline rings as an inline SVG (vector) so they stay crisp in
 * the printed PDF — CSS radial gradients get rasterized at low DPI by the
 * browser print engine (spec §4/§5). 42 circles, r = 16…672 step 16, teal,
 * fading out with stroke-opacity = 0.1 × (1 − r/680).
 */
export function CertRings() {
  const circles = []
  for (let r = 16; r <= 672; r += 16) {
    const opacity = (0.1 * (1 - r / 680)).toFixed(3)
    circles.push(
      <circle key={r} cx="700" cy="700" r={r} fill="none" stroke="#0B5C6E" strokeOpacity={opacity} strokeWidth="1" />,
    )
  }
  return (
    <svg className="cert-rings" aria-hidden="true" width="1400" height="1400" viewBox="0 0 1400 1400">
      {circles}
    </svg>
  )
}
