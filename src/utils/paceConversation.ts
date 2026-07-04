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
  distance: number,
) => {
  const secondsForOneKm = convertPaceToSeconds(pace);
  if (!secondsForOneKm || distance <= 0) {
    return { minutes: "0", seconds: "0", hours: "0" };
  }
  return fancyTimeFormat(secondsForOneKm * distance);
};

export const convertPaceToKm = (
  pace: PaceFormat = { hours: "0", minutes: "0", seconds: "0" },
) => {
  const secondsForOneKm = convertPaceToSeconds(pace);
  if (secondsForOneKm <= 0) {
    return "";
  }
  return (secondsInOneHour / secondsForOneKm).toFixed(2);
};

export const convertKmToPace = (km: string) => {
  const kmNumber = parseFloat(km);
  if (!kmNumber || kmNumber <= 0) {
    return { minutes: "", seconds: "", hours: "" };
  }

  return fancyTimeFormat(secondsInOneHour / kmNumber);
};

export const calculateRequiredSpeed = (
  distance: number,
  time: PaceFormat = { hours: "0", minutes: "0", seconds: "0" },
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

const kmToMiles = (km: number) => km * 0.621371;

export const convertKmHToMph = (kmh: string) => {
  if (!kmh) {
    return "0.00";
  }
  return (parseFloat(kmh) * 0.621371).toFixed(2);
};

export const convertKmHToMilesPace = (kmh: string) => {
  if (!kmh || parseFloat(kmh) <= 0) {
    return { minutes: "00", seconds: "00", hours: "00" };
  }

  const mph = parseFloat(kmh) * 0.621371;
  const secondsPerMile = secondsInOneHour / mph;

  return fancyTimeFormat(secondsPerMile);
};
