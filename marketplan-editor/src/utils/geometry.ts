import type { PlanObject } from '../types/editor';

export const cm2ToM2 = (cm2: number): number => cm2 / 10_000;
export const cm3ToM3 = (cm3: number): number => cm3 / 1_000_000;

export const objectAreaCm2 = (obj: PlanObject): number => obj.widthCm * obj.depthCm;
export const objectVolumeCm3 = (obj: PlanObject): number => obj.widthCm * obj.depthCm * obj.heightCm;

export const getObjectBounds = (obj: PlanObject) => ({
  left: obj.xCm,
  top: obj.yCm,
  right: obj.xCm + obj.widthCm,
  bottom: obj.yCm + obj.depthCm,
});

export const isColliding = (a: PlanObject, b: PlanObject): boolean => {
  const aa = getObjectBounds(a);
  const bb = getObjectBounds(b);
  return aa.left < bb.right && aa.right > bb.left && aa.top < bb.bottom && aa.bottom > bb.top;
};

export const minDistanceCm = (a: PlanObject, b: PlanObject): number => {
  const aa = getObjectBounds(a);
  const bb = getObjectBounds(b);
  const dx = Math.max(0, Math.max(bb.left - aa.right, aa.left - bb.right));
  const dy = Math.max(0, Math.max(bb.top - aa.bottom, aa.top - bb.bottom));
  return Math.hypot(dx, dy);
};

export const clampToFloor = (obj: PlanObject, floorWidthCm: number, floorHeightCm: number): PlanObject => ({
  ...obj,
  xCm: Math.min(Math.max(0, obj.xCm), Math.max(0, floorWidthCm - obj.widthCm)),
  yCm: Math.min(Math.max(0, obj.yCm), Math.max(0, floorHeightCm - obj.depthCm)),
});
