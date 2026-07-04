// Jack Daniels & Jimmy Gilbert's "Oxygen Power" running formulas, used to
// estimate a runner's VDOT from a race result and predict equivalent race
// times for other distances.

// Oxygen cost (ml/kg/min) of running at a velocity in meters per minute.
const oxygenCost = (velocity: number) =>
  -4.6 + 0.182258 * velocity + 0.000104 * velocity ** 2;

// Fraction of VO2max a runner can sustain for a race of the given duration.
const fractionOfVo2Max = (minutes: number) =>
  0.8 +
  0.1894393 * Math.exp(-0.012778 * minutes) +
  0.2989558 * Math.exp(-0.1932605 * minutes);

export const calculateVdot = (meters: number, seconds: number) => {
  if (meters <= 0 || seconds <= 0) {
    return 0;
  }
  const minutes = seconds / 60;
  return oxygenCost(meters / minutes) / fractionOfVo2Max(minutes);
};

// Predicted race time in seconds for a distance, given a VDOT. The equation
// has no closed form for time, so bisect on it: for a fixed distance the
// achievable VDOT decreases as the race time grows.
export const predictTime = (vdot: number, meters: number) => {
  if (vdot <= 0 || meters <= 0) {
    return 0;
  }

  let fastestMinutes = 0.5;
  let slowestMinutes = 600;
  for (let i = 0; i < 50; i++) {
    const midpoint = (fastestMinutes + slowestMinutes) / 2;
    const achievableVdot =
      oxygenCost(meters / midpoint) / fractionOfVo2Max(midpoint);
    if (achievableVdot > vdot) {
      fastestMinutes = midpoint;
    } else {
      slowestMinutes = midpoint;
    }
  }

  return ((fastestMinutes + slowestMinutes) / 2) * 60;
};

// Same signature as the formulas in racePredictions.ts, so callers can treat
// all prediction formulas uniformly.
export const predictTimeVdot = (
  baseMeters: number,
  baseSeconds: number,
  targetMeters: number,
) => predictTime(calculateVdot(baseMeters, baseSeconds), targetMeters);
