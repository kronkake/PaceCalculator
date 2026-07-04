import { describe, expect, it } from "vitest";
import { calculateSplits } from "./splits";

describe("calculateSplits", () => {
  it("splits a 5k on every kilometer with even pacing", () => {
    const splits = calculateSplits(5, 1500);
    expect(splits).toHaveLength(5);
    expect(splits[0]).toEqual({ km: 1, seconds: 300, isFinish: false });
    expect(splits[3]).toEqual({ km: 4, seconds: 1200, isFinish: false });
    expect(splits[4]).toEqual({ km: 5, seconds: 1500, isFinish: true });
  });

  it("does not duplicate the finish when the distance is a whole number of steps", () => {
    const splits = calculateSplits(10, 3000);
    expect(splits).toHaveLength(10);
    expect(splits[9]).toEqual({ km: 10, seconds: 3000, isFinish: true });
  });

  it("ends a fractional distance with the exact finish", () => {
    const splits = calculateSplits(42.195, 42195);
    expect(splits).toHaveLength(43);
    expect(splits[41].km).toBe(42);
    expect(splits[42]).toEqual({ km: 42.195, seconds: 42195, isFinish: true });
  });

  it("uses 200m steps for races shorter than 2km", () => {
    const splits = calculateSplits(1.5, 300);
    expect(splits).toHaveLength(8);
    expect(splits[0].km).toBeCloseTo(0.2, 10);
    expect(splits[0].seconds).toBeCloseTo(40, 10);
    expect(splits[7]).toEqual({ km: 1.5, seconds: 300, isFinish: true });

    expect(calculateSplits(0.4, 80)).toHaveLength(2);
  });

  it("returns an empty list for non-positive input", () => {
    expect(calculateSplits(0, 1500)).toEqual([]);
    expect(calculateSplits(5, 0)).toEqual([]);
  });
});
