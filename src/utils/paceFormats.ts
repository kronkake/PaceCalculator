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
  delimiter: string,
) => {
  return strings.filter(Boolean).join(delimiter);
};

export const formatTime = (paceFormat: PaceFormat) => {
  if (convertPaceToSeconds(paceFormat) === 0) return "";
  const hours =
    paceFormat.hours && paceFormat.hours !== "00"
      ? paceFormat.hours
      : undefined;
  // Minutes can only be dropped when there are no hours, otherwise
  // 01:00:30 would collapse into 01:30.
  const minutes =
    hours || paceFormat.minutes !== "00" ? paceFormat.minutes : undefined;
  return joinStrings([hours, minutes, paceFormat.seconds], ":");
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

export interface TimeParts {
  hours?: string;
  minutes?: string;
  seconds?: string;
}

// Roll overflow upward instead of clamping it away: 900 seconds becomes
// 15 minutes / 00 seconds. A unit the user left empty stays empty unless
// it receives a carry; the largest unit clamps to its bound since there
// is nothing above it to carry into.
export const carryTimeOverflow = (
  parts: TimeParts,
  withHours: boolean,
): TimeParts => {
  const toNonNegative = (value?: string) => {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : Math.max(0, numeric);
  };
  const pad = (value: number) => String(value).padStart(2, "0");

  let seconds = toNonNegative(parts.seconds);
  let minutes = toNonNegative(parts.minutes);
  let hours = toNonNegative(parts.hours);

  minutes += Math.floor(seconds / 60);
  seconds = seconds % 60;

  if (withHours) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    hours = Math.min(hours, 23);
  } else {
    minutes = Math.min(minutes, 59);
  }

  const result: TimeParts = {
    minutes: parts.minutes || minutes > 0 ? pad(minutes) : "",
    seconds: parts.seconds || seconds > 0 ? pad(seconds) : "",
  };
  if (withHours) {
    result.hours = parts.hours || hours > 0 ? pad(hours) : "";
  }
  return result;
};

// Shared validator for the time units: empty/invalid input stays empty,
// out-of-range values clamp to the unit's bounds, valid values get padded.
const clampTimeUnit = (value: string, max: number) => {
  const numeric = Number(value);
  if (!value || Number.isNaN(numeric)) {
    return "";
  }
  if (numeric > max) {
    return String(max);
  }
  if (numeric < 0) {
    return "00";
  }
  return value.padStart(2, "0");
};

export const unitFormater: Record<PaceCalcUnits, (newValue: string) => string> =
  {
    km: (value: string) => {
      const km = Number(value);
      if (!value || Number.isNaN(km)) {
        return "";
      }
      if (km < 0) {
        return "0.00";
      }
      return km.toFixed(2);
    },
    seconds: (value: string) => clampTimeUnit(value, 59),
    minutes: (value: string) => clampTimeUnit(value, 59),
    hours: (value: string) => clampTimeUnit(value, 23),
    distance: (value: string) => {
      return value;
    },
  };
