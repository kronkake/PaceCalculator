export type PaceCalcUnits = "hours" | "minutes" | "seconds" | "km" | "distance";
export type DistanceToPaceUnits = Exclude<PaceCalcUnits, "km">;
export type PaceToDistanceUnits = Exclude<PaceCalcUnits, "hours" | "distance">;

export type PaceFormat = {
  hours?: string;
  minutes?: string;
  seconds?: string;
};
