export type PaceCalcUnits =
  | "hours"
  | "minutes"
  | "seconds"
  | "km"
  | "distance"
  | "mph"
  | "mileMinutes"
  | "mileSeconds"
  | "miles";
export type DistanceToPaceUnits = Exclude<
  PaceCalcUnits,
  "km" | "mph" | "mileMinutes" | "mileSeconds"
>;
export type PaceToDistanceUnits = Exclude<
  PaceCalcUnits,
  "hours" | "distance" | "miles"
>;

export type PaceFormat = {
  hours?: string;
  minutes?: string;
  seconds?: string;
};
