export function NoiseOverlay() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-40 size-full opacity-[0.04]"
      aria-hidden="true"
    >
      <filter id="aquasentry-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#aquasentry-noise)" />
    </svg>
  )
}
