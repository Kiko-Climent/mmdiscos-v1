import { SLIDE_COUNT, SPACING } from "./constants";

export function wrapCarouselOffset(offset, trackWidth) {
  const half = trackWidth / 2;
  return ((((offset + half) % trackWidth) + trackWidth) % trackWidth) - half;
}

export function calcFinalPos(i, scroll, W) {
  const trackWidth = SLIDE_COUNT * SPACING;
  const offset = wrapCarouselOffset(i * SPACING - scroll, trackWidth);
  const absDist = Math.abs(offset);
  const t = Math.min(absDist / (W * 1.1), 1.0);
  const tEased = Math.pow(t, 0.75);
  return {
    x: offset,
    y: -tEased * 140,
    z: -tEased * 900,
    scale: 1.06 - tEased * 0.45,
  };
}
