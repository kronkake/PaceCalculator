import { PaceFormat } from "../types/types";
import { fancyTimeFormat } from "./paceFormats";

const secondsInOneHour = 3600;

export const convertPaceToSeconds = (pace: PaceFormat) => {
  const { hours, minutes, seconds } = pace;
  return (
    parseInt(hours || "0", 10) * secondsInOneHour +
    parseInt(minutes || "0", 10) * 60 +
    parseInt(seconds || "0", 10)
  );
};

export const convertDistanceToTimeBasedOnPace = (
  pace: PaceFormat,
  distance: number
) => {
  const secondsForOneKm = convertPaceToSeconds(pace);
  if (!secondsForOneKm || distance <= 0) {
    return { minutes: "0", seconds: "0", hours: "0" };
  }
  return fancyTimeFormat(secondsForOneKm * distance);
};

export const convertPaceToKm = (
  pace: PaceFormat = { hours: "0", minutes: "0", seconds: "0" }
) => {
  const secondsForOneKm = convertPaceToSeconds(pace);
  return (secondsInOneHour / secondsForOneKm).toFixed(2) ?? "0.00";
};

export const convertKmToPace = (km: string) => {
  if (!km) {
    return { minutes: "00", seconds: "00", hours: "00" };
  }

  return fancyTimeFormat(secondsInOneHour / parseFloat(km));
};

export const calculateRequiredSpeed = (
  distance: number,
  time: PaceFormat = { hours: "0", minutes: "0", seconds: "0" }
) => {
  if (distance <= 0) {
    return "0.00";
  }

  const totalSeconds = convertPaceToSeconds(time);
  if (totalSeconds <= 0) {
    return "0.00";
  }

  const hours = totalSeconds / secondsInOneHour;
  const kmPerHour = distance / hours;

  return kmPerHour.toFixed(2);
};
