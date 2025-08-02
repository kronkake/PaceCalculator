import { PaceCalcUnits, PaceFormat } from "../types/types";
import { convertPaceToSeconds } from "./paceConversation";

export const fancyTimeFormat = (duration: number) => {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  return {
    minutes: mins.toString().padStart(2, "0"),
    seconds: secs.toString().padStart(2, "0"),
    hours: hrs.toString().padStart(2, "0"),
  };
};

export const joinStrings = (
  strings: Array<string | undefined>,
  delimiter: string
) => {
  return strings.filter(Boolean).join(delimiter);
};

export const formatTime = (paceFormat: PaceFormat) => {
  if (convertPaceToSeconds(paceFormat) === 0) return "";
  return joinStrings(
    [
      paceFormat.hours === "00" ? undefined : paceFormat.hours,
      paceFormat.minutes === "00" ? undefined : paceFormat.minutes,
      paceFormat.seconds,
    ],
    ":"
  );
};

export const formatPaceTime = (minutes: number, seconds: number) => {
  // Convert excess seconds to minutes
  const totalSeconds = minutes * 60 + seconds;
  const finalMinutes = Math.floor(totalSeconds / 60);
  const finalSeconds = totalSeconds % 60;

  // Cap at 60:00
  if (finalMinutes >= 60) {
    return "60:00";
  }

  return `${finalMinutes.toString().padStart(2, "0")}:${finalSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const unitFormater: Record<PaceCalcUnits, (newValue: string) => string> =
  {
    km: (value: string) => {
      const km = Number(value);
      if (km < 0) {
        return "0.00";
      }
      return km.toFixed(2);
    },
    seconds: (value: string) => {
      const seconds = Number(value);
      if (seconds > 59) {
        return "59";
      } else if (seconds < 0) {
        return "0";
      }
      return value.padStart(2, "0");
    },
    minutes: (value: string) => {
      const minutes = Number(value);
      if (minutes > 59) {
        return "59";
      } else if (minutes < 0) {
        return "0";
      }
      return value.padStart(2, "0");
    },
    hours: (value: string) => {
      const hours = Number(value);
      if (hours > 23) {
        return "23";
      } else if (hours < 0) {
        return "00";
      }
      return value.padStart(2, "0");
    },
    distance: (value: string) => {
      return value;
    },
  };
