import { describe, it, expect } from "vitest";
import {
  handleRolloutWithHash,
  handleRolloutWithIncrement,
} from "../src/rollout";

const flagKey = "test-flag";

describe.concurrent(handleRolloutWithHash, () => {
  it("should return true if groupName: undefined, percentage: 50", () => {
    expect(handleRolloutWithHash(flagKey, 50)).true;
  });
  it("should return true if groupName: undefined, percentage: 75", () => {
    expect(handleRolloutWithHash(flagKey, 75)).true;
  });

  it("should return true if groupName: fi-fi, percentage: 50", () => {
    expect(handleRolloutWithHash(flagKey, 50, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 75", () => {
    expect(handleRolloutWithHash(flagKey, 75, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 1", () => {
    expect(handleRolloutWithHash(flagKey, 1, "fi-fi")).false;
  });
});

describe.concurrent(handleRolloutWithIncrement, () => {
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
      expect(handleRolloutWithIncrement(flagKey, rolloutPercentage)).toBe(
        value
      );
    }
    // Try again
    for (const value of results) {
      expect(handleRolloutWithIncrement(flagKey, rolloutPercentage)).toBe(
        value
      );
    }
    if (!skipLastTrue) {
      // Should start again
      expect(handleRolloutWithIncrement(flagKey, rolloutPercentage)).true;
    }
  });
}
