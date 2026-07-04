import { describe, expect, it } from "vitest";
import {
  fancyTimeFormat,
  formatPaceTime,
  formatTime,
  joinStrings,
  unitFormater,
} from "./paceFormats";

describe("fancyTimeFormat", () => {
  it("splits a duration in seconds into padded parts", () => {
    expect(fancyTimeFormat(3661)).toEqual({
      hours: "01",
      minutes: "01",
      seconds: "01",
    });
  });

  it("handles durations below one minute", () => {
    expect(fancyTimeFormat(59)).toEqual({
      hours: "00",
      minutes: "00",
      seconds: "59",
    });
  });

  it("handles exact hours", () => {
    expect(fancyTimeFormat(3600)).toEqual({
      hours: "01",
      minutes: "00",
      seconds: "00",
    });
  });

  it("truncates fractional seconds", () => {
    expect(fancyTimeFormat(90.9)).toEqual({
      hours: "00",
      minutes: "01",
      seconds: "30",
    });
  });
});

describe("joinStrings", () => {
  it("joins strings with the delimiter", () => {
    expect(joinStrings(["01", "02", "03"], ":")).toBe("01:02:03");
  });

  it("skips undefined and empty entries", () => {
    expect(joinStrings(["01", undefined, "03", ""], ":")).toBe("01:03");
  });
});

describe("formatTime", () => {
  it("returns an empty string for a zero time", () => {
    expect(formatTime({ hours: "00", minutes: "00", seconds: "00" })).toBe("");
  });

  it("drops the hours when they are zero", () => {
    expect(formatTime({ hours: "00", minutes: "05", seconds: "30" })).toBe(
      "05:30"
    );
  });

  it("includes the hours when set", () => {
    expect(formatTime({ hours: "01", minutes: "05", seconds: "30" })).toBe(
      "01:05:30"
    );
  });

  it("keeps zero minutes when hours are present", () => {
    expect(formatTime({ hours: "01", minutes: "00", seconds: "30" })).toBe(
      "01:00:30"
    );
  });
});

describe("formatPaceTime", () => {
  it("pads minutes and seconds", () => {
    expect(formatPaceTime(4, 30)).toBe("04:30");
  });

  it("rolls excess seconds over into minutes", () => {
    expect(formatPaceTime(3, 90)).toBe("04:30");
  });

  it("caps the result at 60:00", () => {
    expect(formatPaceTime(60, 0)).toBe("60:00");
    expect(formatPaceTime(59, 61)).toBe("60:00");
  });
});

describe("unitFormater", () => {
  it("formats km with two decimals and clamps negatives to zero", () => {
    expect(unitFormater.km("12")).toBe("12.00");
    expect(unitFormater.km("5.678")).toBe("5.68");
    expect(unitFormater.km("-3")).toBe("0.00");
  });

  it("clamps seconds between 0 and 59 and pads them", () => {
    expect(unitFormater.seconds("5")).toBe("05");
    expect(unitFormater.seconds("75")).toBe("59");
    expect(unitFormater.seconds("-1")).toBe("00");
  });

  it("clamps minutes between 0 and 59 and pads them", () => {
    expect(unitFormater.minutes("7")).toBe("07");
    expect(unitFormater.minutes("60")).toBe("59");
    expect(unitFormater.minutes("-1")).toBe("00");
  });

  it("clamps hours between 0 and 23 and pads them", () => {
    expect(unitFormater.hours("5")).toBe("05");
    expect(unitFormater.hours("25")).toBe("23");
    expect(unitFormater.hours("-1")).toBe("00");
  });

  it("passes distance through unchanged", () => {
    expect(unitFormater.distance("42.195")).toBe("42.195");
  });

  it("keeps empty values empty instead of formatting them to zero", () => {
    expect(unitFormater.km("")).toBe("");
    expect(unitFormater.seconds("")).toBe("");
    expect(unitFormater.minutes("")).toBe("");
    expect(unitFormater.hours("")).toBe("");
  });
});
