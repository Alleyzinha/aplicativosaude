import { CATEGORIES } from '../constants/imcCategories';

const VALUE_BREAKPOINTS = [10, 18.5, 25, 30, 40, 50];
const ANGLE_BREAKPOINTS = [-180, -144, -108, -72, -36, 0];

export function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (Math.PI / 180) * angleDeg;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function valueToAngle(bmi) {
  const v = Math.min(Math.max(bmi, 10), 50);
  for (let i = 0; i < VALUE_BREAKPOINTS.length - 1; i++) {
    const v0 = VALUE_BREAKPOINTS[i];
    const v1 = VALUE_BREAKPOINTS[i + 1];
    if (v >= v0 && v <= v1) {
      const a0 = ANGLE_BREAKPOINTS[i];
      const a1 = ANGLE_BREAKPOINTS[i + 1];
      const t = (v - v0) / (v1 - v0);
      return a0 + t * (a1 - a0);
    }
  }
  return 0;
}

export function getCategory(bmi) {
  return CATEGORIES.find((c) => bmi <= c.max) || CATEGORIES[CATEGORIES.length - 1];
}
