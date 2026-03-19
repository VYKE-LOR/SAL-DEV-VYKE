export const snapValue = (value: number, gridSize: number, enabled: boolean): number => {
  if (!enabled) {
    return value;
  }
  return Math.round(value / gridSize) * gridSize;
};
