import { describe, expect, it } from "vitest";
import { calculateVdot, predictTime, predictTimeVdot } from "./vdot";

describe("calculateVdot", () => {
  it("matches the published tables (5k in 20:00 is roughly VDOT 49.8)", () => {
    expect(calculateVdot(5000, 20 * 60)).toBeCloseTo(49.8, 1);
  });

  it("gives a higher VDOT for a faster time", () => {
    expect(calculateVdot(5000, 19 * 60)).toBeGreaterThan(
      calculateVdot(5000, 20 * 60)
    );
  });

  it("returns 0 for non-positive input", () => {
    expect(calculateVdot(0, 1200)).toBe(0);
    expect(calculateVdot(5000, 0)).toBe(0);
    expect(calculateVdot(-5000, 1200)).toBe(0);
  });
});

describe("predictTime", () => {
  it("round-trips with calculateVdot for the same distance", () => {
    const vdot = calculateVdot(10000, 45 * 60);
    expect(predictTime(vdot, 10000)).toBeCloseTo(45 * 60, 0);
  });

  it("predicts a 10k around 41:30 from a 20:00 5k", () => {
    const vdot = calculateVdot(5000, 20 * 60);
    const tenK = predictTime(vdot, 10000);
    expect(tenK).toBeGreaterThan(41 * 60);
    expect(tenK).toBeLessThan(42 * 60);
  });

  // Daniels' table: VDOT 50 predicts a 3:10:49 marathon.
  it("predicts a marathon around 3:11 from a 20:00 5k", () => {
    const vdot = calculateVdot(5000, 20 * 60);
    const marathon = predictTime(vdot, 42195);
    expect(marathon).toBeGreaterThan(3.1 * 3600);
    expect(marathon).toBeLessThan(3.25 * 3600);
  });

  it("returns 0 for non-positive input", () => {
    expect(predictTime(0, 5000)).toBe(0);
    expect(predictTime(50, 0)).toBe(0);
  });
});

describe("predictTimeVdot", () => {
  it("returns the base time for the base distance", () => {
    expect(predictTimeVdot(5000, 1200, 5000)).toBeCloseTo(1200, 0);
  });
});
