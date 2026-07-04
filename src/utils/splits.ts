export interface Split {
  km: number;
  seconds: number;
  isFinish: boolean;
}

// Cumulative passing times at even pace for a race of the given distance.
// Splits fall on every kilometer, or every 200m for short races, with the
// finish line always as the last entry.
export const calculateSplits = (
  distanceKm: number,
  totalSeconds: number,
): Split[] => {
  if (distanceKm <= 0 || totalSeconds <= 0) {
    return [];
  }

  const stepKm = distanceKm < 2 ? 0.2 : 1;
  const splits: Split[] = [];
  // Multiply instead of accumulating so float drift can't skip a step, and
  // stop just short of the full distance so the finish isn't duplicated.
  for (let i = 1; i * stepKm < distanceKm - 1e-9; i++) {
    const km = i * stepKm;
    splits.push({
      km,
      seconds: (km / distanceKm) * totalSeconds,
      isFinish: false,
    });
  }
  splits.push({ km: distanceKm, seconds: totalSeconds, isFinish: true });

  return splits;
};
