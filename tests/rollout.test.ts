import { describe, it, expect } from "vitest";
import {
  handleRolloutWithHash,
  handleRolloutWithIncrement,
} from "../src/rollout";

const flagId = "test-flag";

describe(handleRolloutWithHash, { concurrent: true }, () => {
  it("should return true if groupName: undefined, percentage: 50", () => {
    expect(handleRolloutWithHash(flagId, 50)).true;
  });
  it("should return true if groupName: undefined, percentage: 75", () => {
    expect(handleRolloutWithHash(flagId, 75)).true;
  });

  it("should return true if groupName: fi-fi, percentage: 50", () => {
    expect(handleRolloutWithHash(flagId, 50, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 75", () => {
    expect(handleRolloutWithHash(flagId, 75, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 1", () => {
    expect(handleRolloutWithHash(flagId, 1, "fi-fi")).false;
  });

  it("should return true if percentage: 100", () => {
    expect(handleRolloutWithHash(flagId, 100)).true;
    expect(handleRolloutWithHash(flagId, 100)).true;
  });
  it("should return false if percentage: 0", () => {
    expect(handleRolloutWithHash(flagId, 0)).false;
    expect(handleRolloutWithHash(flagId, 0)).false;
  });
});

describe("handleRolloutWithIncrement", { concurrent: true }, () => {
  testIncrementRollout(0, [false], true);
  testIncrementRollout(10, [true, ...Array(9).fill(false)]);
  testIncrementRollout(25, [true, false, false, false]);
  testIncrementRollout(30, [true, true, true, ...Array(7).fill(false)]);
  testIncrementRollout(50, [true, false]);
  testIncrementRollout(60, [true, true, true, false, false]);
  testIncrementRollout(75, [true, true, true, false]);
  testIncrementRollout(80, [true, true, true, true, false]);
  testIncrementRollout(100, [true]);
});

function testIncrementRollout(
  rolloutPercentage: number,
  results: boolean[],
  skipLastTrue = false
) {
  it(`should distribute evenly for ${rolloutPercentage}%`, () => {
    for (const value of results) {
      expect(handleRolloutWithIncrement(flagId, rolloutPercentage)).toBe(value);
    }
    // Try again
    for (const value of results) {
      expect(handleRolloutWithIncrement(flagId, rolloutPercentage)).toBe(value);
    }
    if (!skipLastTrue) {
      // Should start again
      expect(handleRolloutWithIncrement(flagId, rolloutPercentage)).true;
    }
  });
}
