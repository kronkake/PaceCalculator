import { PaceCalcUnits } from "../types/types";

export const fancyTimeFormat = (duration: number) => {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  return `${finalMinutes.toString().padStart(2, "0")}:${finalSeconds.toString().padStart(2, "0")}`;
};

export const unitFormater: Record<PaceCalcUnits, (newValue: string) => string> = {
  km: (value: string) => {
    return value;
  },
  pace: (value: string) => {
    // Remove any non-digit and non-colon characters
    const cleaned = value.replace(/[^\d:]/g, "");

    if (!cleaned) return "";

    // Handle MM:SS format
    if (cleaned.includes(":")) {
      const parts = cleaned.split(":");
      if (parts.length === 2) {
        const minutes = parseInt(parts[0] || "0", 10);
        const seconds = parseInt(parts[1] || "0", 10);
        return formatPaceTime(minutes, seconds);
      }
    }

    // Handle digit-only input
    if (/^\d+$/.test(cleaned)) {
      const num = parseInt(cleaned, 10);

      if (num < 60) {
        // Less than 60, treat as minutes
        return formatPaceTime(num, 0);
      } else {
        // 60 or above, treat as seconds and convert to MM:SS
        const minutes = Math.floor(num / 60);
        const seconds = num % 60;
        return formatPaceTime(minutes, seconds);
      }
    }
    return value;
  },
};
