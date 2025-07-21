import { fancyTimeFormat } from "./paceFormats";

export const convertPaceToSeconds = (pace: string) => {
  const [minutes, seconds] = pace.split(":");
  return parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
};

export const convertDistanceToTimeBasedOnPace = (pace: string, distance: number) => {
  if (!pace || !distance) {
    return "";
  }
  const secondsForOneKm = convertPaceToSeconds(pace);
  return fancyTimeFormat(secondsForOneKm * distance);
};

export const convertPaceToKm = (pace: string) => {
  const secondsInOneHour = 3600;
  const secondsForOneKm = convertPaceToSeconds(pace);
  return (secondsInOneHour / secondsForOneKm).toFixed(2) ?? "0.00";
};

export const convertKmToPace = (km: string) => {
  if (!km) {
    return "0:00";
  }
  const secondsInOneHour = 3600;
  return fancyTimeFormat(secondsInOneHour / parseInt(km, 10));
};
