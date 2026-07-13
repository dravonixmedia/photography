/** Clamps `t` into [0, 1]. */
export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Remaps `value` from [inMin, inMax] into [outMin, outMax], clamped.
 * Used throughout the intro to carve independent 0–1 sub-progress windows
 * out of the single overall scroll progress value.
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1
): number {
  const t = inMax === inMin ? 0 : (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, clamp01(t));
}

/** Smoothstep easing — gentler starts/ends than linear for camera moves. */
export function easeInOut(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Deterministic pseudo-random generator so particle fields don't reshuffle on every render. */
export function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
