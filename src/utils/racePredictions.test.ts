import { describe, expect, it } from "vitest";
import { predictTimeCameron, predictTimeRiegel } from "./racePredictions";

describe("predictTimeRiegel", () => {
  it("returns the base time for the base distance", () => {
    expect(predictTimeRiegel(5000, 1200, 5000)).toBe(1200);
  });

  it("predicts a 10k around 41:42 from a 20:00 5k", () => {
    const tenK = predictTimeRiegel(5000, 20 * 60, 10000);
    expect(tenK).toBeGreaterThan(41.5 * 60);
    expect(tenK).toBeLessThan(42 * 60);
  });

  it("predicts a marathon around 3:12 from a 20:00 5k", () => {
    const marathon = predictTimeRiegel(5000, 20 * 60, 42195);
    expect(marathon).toBeGreaterThan(3.15 * 3600);
    expect(marathon).toBeLessThan(3.25 * 3600);
  });

  it("supports a custom exponent", () => {
    const recreational = predictTimeRiegel(5000, 20 * 60, 10000, 1.08);
    expect(recreational).toBeGreaterThan(predictTimeRiegel(5000, 20 * 60, 10000));
  });

  it("returns 0 for non-positive input", () => {
    expect(predictTimeRiegel(0, 1200, 10000)).toBe(0);
    expect(predictTimeRiegel(5000, 0, 10000)).toBe(0);
    expect(predictTimeRiegel(5000, 1200, 0)).toBe(0);
  });
});

describe("predictTimeCameron", () => {
  it("returns the base time for the base distance", () => {
    expect(predictTimeCameron(5000, 1200, 5000)).toBeCloseTo(1200, 8);
  });

  it("predicts a 10k around 41:40 from a 20:00 5k", () => {
    const tenK = predictTimeCameron(5000, 20 * 60, 10000);
    expect(tenK).toBeGreaterThan(41 * 60);
    expect(tenK).toBeLessThan(42 * 60);
  });

  it("predicts a marathon around 3:15 from a 20:00 5k", () => {
    const marathon = predictTimeCameron(5000, 20 * 60, 42195);
    expect(marathon).toBeGreaterThan(3.15 * 3600);
    expect(marathon).toBeLessThan(3.3 * 3600);
  });

  it("returns 0 for non-positive input", () => {
    expect(predictTimeCameron(0, 1200, 10000)).toBe(0);
    expect(predictTimeCameron(5000, 0, 10000)).toBe(0);
    expect(predictTimeCameron(5000, 1200, 0)).toBe(0);
  });
});
