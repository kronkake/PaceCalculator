// Closed-form race-time equivalence formulas, sharing the same signature as
// predictTimeVdot in vdot.ts: predict the time (in seconds) for a target
// distance from a known result on another distance.

// Riegel's power law (1981). The 1.06 exponent fits well-trained runners;
// recreational runners tend towards 1.07–1.08.
export const predictTimeRiegel = (
  baseMeters: number,
  baseSeconds: number,
  targetMeters: number,
  exponent = 1.06,
) => {
  if (baseMeters <= 0 || baseSeconds <= 0 || targetMeters <= 0) {
    return 0;
  }
  return baseSeconds * Math.pow(targetMeters / baseMeters, exponent);
};

// Cameron's world-record-curve correction factor (1998), in meters.
const cameronFactor = (meters: number) =>
  13.49681 - 0.000030363 * meters + 835.7114 / Math.pow(meters, 0.7905);

export const predictTimeCameron = (
  baseMeters: number,
  baseSeconds: number,
  targetMeters: number,
) => {
  if (baseMeters <= 0 || baseSeconds <= 0 || targetMeters <= 0) {
    return 0;
  }
  return (
    baseSeconds *
    (targetMeters / baseMeters) *
    (cameronFactor(baseMeters) / cameronFactor(targetMeters))
  );
};
