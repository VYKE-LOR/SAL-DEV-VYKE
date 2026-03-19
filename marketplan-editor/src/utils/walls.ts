import type { Wall } from '../types/editor';

export interface PointCm {
  x: number;
  y: number;
}

export const wallLengthCm = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.hypot(x2 - x1, y2 - y1);

export const wallAngleDeg = (x1: number, y1: number, x2: number, y2: number): number =>
  (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

export const wallAreaCm2 = (wall: Wall): number => wall.lengthCm * wall.thicknessCm;

export const updateWallMetrics = (wall: Omit<Wall, 'lengthCm' | 'angleDeg'>): Wall => ({
  ...wall,
  lengthCm: wallLengthCm(wall.x1, wall.y1, wall.x2, wall.y2),
  angleDeg: wallAngleDeg(wall.x1, wall.y1, wall.x2, wall.y2),
});

export const pointDistance = (a: PointCm, b: PointCm): number => Math.hypot(a.x - b.x, a.y - b.y);

export const snapToPoints = (point: PointCm, candidates: PointCm[], thresholdCm: number): PointCm => {
  if (!candidates.length) return point;
  let nearest = point;
  let min = thresholdCm;

  for (const candidate of candidates) {
    const dist = pointDistance(point, candidate);
    if (dist <= min) {
      min = dist;
      nearest = candidate;
    }
  }

  return nearest;
};

export const endpointFromLengthAngle = (x1: number, y1: number, lengthCm: number, angleDeg: number): PointCm => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: x1 + Math.cos(rad) * lengthCm,
    y: y1 + Math.sin(rad) * lengthCm,
  };
};
