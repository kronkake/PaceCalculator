import { describe, expect, it } from "vitest";
import {
  KM_PER_MILE,
  calculateRequiredSpeed,
  convertDistanceToTimeBasedOnPace,
  convertKmHToMilesPace,
  convertKmHToMph,
  convertKmToMiles,
  convertKmToPace,
  convertMilesPaceToKmH,
  convertMilesToKm,
  convertMphToKmH,
  convertPaceToKm,
  convertPaceToSeconds,
} from "./paceConversation";

describe("convertPaceToSeconds", () => {
  it("converts hours, minutes and seconds to total seconds", () => {
    expect(
      convertPaceToSeconds({ hours: "1", minutes: "30", seconds: "15" })
    ).toBe(5415);
  });

  it("treats missing fields as zero", () => {
    expect(convertPaceToSeconds({ minutes: "5" })).toBe(300);
    expect(convertPaceToSeconds({})).toBe(0);
  });

  it("treats empty strings as zero", () => {
    expect(convertPaceToSeconds({ hours: "", minutes: "", seconds: "30" })).toBe(
      30
    );
  });
});

describe("convertDistanceToTimeBasedOnPace", () => {
  it("multiplies the pace with the distance", () => {
    expect(
      convertDistanceToTimeBasedOnPace({ minutes: "5", seconds: "0" }, 10)
    ).toEqual({ hours: "00", minutes: "50", seconds: "00" });
  });

  it("rolls over into hours", () => {
    expect(
      convertDistanceToTimeBasedOnPace({ minutes: "5", seconds: "0" }, 42.195)
    ).toEqual({ hours: "03", minutes: "30", seconds: "58" });
  });

  it("returns zero time for a zero pace", () => {
    expect(convertDistanceToTimeBasedOnPace({}, 10)).toEqual({
      hours: "0",
      minutes: "0",
      seconds: "0",
    });
  });

  it("returns zero time for a non-positive distance", () => {
    expect(
      convertDistanceToTimeBasedOnPace({ minutes: "5" }, 0)
    ).toEqual({ hours: "0", minutes: "0", seconds: "0" });
    expect(
      convertDistanceToTimeBasedOnPace({ minutes: "5" }, -3)
    ).toEqual({ hours: "0", minutes: "0", seconds: "0" });
  });
});

describe("convertPaceToKm", () => {
  it("converts a pace per km to km/h", () => {
    expect(convertPaceToKm({ minutes: "5", seconds: "0" })).toBe("12.00");
    expect(convertPaceToKm({ minutes: "4", seconds: "30" })).toBe("13.33");
  });

  it("handles paces above one hour", () => {
    expect(convertPaceToKm({ hours: "1", minutes: "0", seconds: "0" })).toBe(
      "1.00"
    );
  });

  it("returns an empty string for a zero pace instead of Infinity", () => {
    expect(convertPaceToKm({})).toBe("");
    expect(convertPaceToKm({ minutes: "0", seconds: "0" })).toBe("");
  });
});

describe("convertKmToPace", () => {
  it("converts km/h to a pace per km", () => {
    expect(convertKmToPace("12")).toEqual({
      hours: "00",
      minutes: "05",
      seconds: "00",
    });
    expect(convertKmToPace("10.5")).toEqual({
      hours: "00",
      minutes: "05",
      seconds: "42",
    });
  });

  it("returns an empty pace for empty or non-positive values", () => {
    const emptyPace = { hours: "", minutes: "", seconds: "" };
    expect(convertKmToPace("")).toEqual(emptyPace);
    expect(convertKmToPace("0")).toEqual(emptyPace);
    expect(convertKmToPace("-4")).toEqual(emptyPace);
  });
});

describe("calculateRequiredSpeed", () => {
  it("calculates the km/h needed to cover a distance in a given time", () => {
    expect(calculateRequiredSpeed(10, { minutes: "50" })).toBe("12.00");
    expect(
      calculateRequiredSpeed(42.195, { hours: "3", minutes: "30" })
    ).toBe("12.06");
  });

  it("returns 0.00 for a non-positive distance", () => {
    expect(calculateRequiredSpeed(0, { minutes: "50" })).toBe("0.00");
    expect(calculateRequiredSpeed(-5, { minutes: "50" })).toBe("0.00");
  });

  it("returns 0.00 for a zero time", () => {
    expect(calculateRequiredSpeed(10, {})).toBe("0.00");
    expect(calculateRequiredSpeed(10)).toBe("0.00");
  });
});

describe("convertKmHToMph", () => {
  it("converts km/h to mph", () => {
    expect(convertKmHToMph("10")).toBe("6.21");
    expect(convertKmHToMph("16.09")).toBe("10.00");
  });

  it("returns 0.00 for an empty value", () => {
    expect(convertKmHToMph("")).toBe("0.00");
  });
});

describe("convertKmHToMilesPace", () => {
  it("converts km/h to a pace per mile", () => {
    expect(convertKmHToMilesPace("10")).toEqual({
      hours: "00",
      minutes: "09",
      seconds: "39",
    });
  });

  it("returns zero pace for empty or non-positive values", () => {
    expect(convertKmHToMilesPace("")).toEqual({
      hours: "00",
      minutes: "00",
      seconds: "00",
    });
    expect(convertKmHToMilesPace("0")).toEqual({
      hours: "00",
      minutes: "00",
      seconds: "00",
    });
    expect(convertKmHToMilesPace("-4")).toEqual({
      hours: "00",
      minutes: "00",
      seconds: "00",
    });
  });
});

describe("convertMphToKmH", () => {
  it("converts mph to km/h", () => {
    expect(convertMphToKmH("10")).toBe("16.09");
    expect(convertMphToKmH("6.21")).toBe("9.99");
  });

  it("returns an empty string for empty or non-positive values", () => {
    expect(convertMphToKmH("")).toBe("");
    expect(convertMphToKmH("0")).toBe("");
    expect(convertMphToKmH("-4")).toBe("");
  });
});

describe("convertMilesPaceToKmH", () => {
  it("converts a pace per mile to km/h", () => {
    // 09:39 per mile is ~10 km/h (convertKmHToMilesPace("10") rounded to
    // whole seconds, so the round trip lands one hundredth off).
    expect(convertMilesPaceToKmH({ minutes: "9", seconds: "39" })).toBe(
      "10.01"
    );
  });

  it("returns an empty string for a zero pace", () => {
    expect(convertMilesPaceToKmH({ minutes: "", seconds: "" })).toBe("");
  });
});

describe("km/miles distance conversions", () => {
  it("converts between km and miles", () => {
    expect(convertKmToMiles(KM_PER_MILE)).toBe(1);
    expect(convertMilesToKm(1)).toBe(KM_PER_MILE);
    expect(convertKmToMiles(42.195)).toBeCloseTo(26.219, 3);
  });
});
