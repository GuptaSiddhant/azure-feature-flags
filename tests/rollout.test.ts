import { describe, it, expect } from "vitest";
import { handleRolloutWithIncrement } from "../src/handlers/rollout-increment";
import {
  handleRolloutWithHash,
  calcContextPercentage,
} from "../src/handlers/rollout-hash";

const flagId = "test-flag";

describe(handleRolloutWithHash, { concurrent: true }, async () => {
  const rolloutId = `${flagId}=|=fi-fi`;
  const contextPercentage = await calcContextPercentage(rolloutId);

  it(`should return false if rolloutPercentage < contextPercentage (${contextPercentage})`, async () => {
    expect(await handleRolloutWithHash(rolloutId, contextPercentage - 10))
      .false;
  });

  it(`should return true if rolloutPercentage > contextPercentage (${contextPercentage})`, async () => {
    expect(await handleRolloutWithHash(rolloutId, contextPercentage + 10)).true;
  });

  it(`should return false if rolloutPercentage = contextPercentage (${contextPercentage})`, async () => {
    expect(await handleRolloutWithHash(rolloutId, contextPercentage)).false;
  });

  it("should return true if percentage: 100", async () => {
    expect(await handleRolloutWithHash(rolloutId, 100)).true;
  });
  it("should return false if percentage: 0", async () => {
    expect(await handleRolloutWithHash(rolloutId, 0)).false;
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
