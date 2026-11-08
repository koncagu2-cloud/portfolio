/** Build a small responsive source set without asking Astro to upscale an asset. */
export function imageWidths(naturalWidth: number) {
  return [...new Set([320, 640, 960, naturalWidth].filter(width => width <= naturalWidth))]
    .sort((a, b) => a - b);
}
