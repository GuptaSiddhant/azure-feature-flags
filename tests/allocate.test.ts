import { describe, it, expect } from "vitest";
import { handleAllocateWithIncrement } from "../src/allocate";
import { FeatureFlagAllocationPercentile } from "../src/types";

const flagId = "test-flag";

describe(handleAllocateWithIncrement, { concurrent: true }, () => {
  testIncrementAllocate(
    [
      { variant: "var-a", from: 0, to: 50 },
      { variant: "var-b", from: 50, to: 100 },
    ],
    ["var-a", "var-b"]
  );
  testIncrementAllocate(
    [
      { variant: "var-a", from: 0, to: 25 },
      { variant: "var-b", from: 25, to: 100 },
    ],
    ["var-a", "var-b", "var-b", "var-b"]
  );
  testIncrementAllocate(
    [
      { variant: "var-a", from: 0, to: 40 },
      { variant: "var-b", from: 40, to: 80 },
      { variant: "var-c", from: 80, to: 100 },
    ],
    ["var-a", "var-a", "var-b", "var-b", "var-c"]
  );
  testIncrementAllocate(
    [
      { variant: "var-a", from: 0, to: 30 },
      { variant: "var-b", from: 30, to: 50 },
      { variant: "var-c", from: 50, to: 75 },
      { variant: "var-d", from: 75, to: 100 },
    ],
    [
      ...Array(6).fill("var-a"),
      ...Array(4).fill("var-b"),
      ...Array(5).fill("var-c"),
      ...Array(5).fill("var-d"),
    ]
  );
});

function testIncrementAllocate(
  percentiles: FeatureFlagAllocationPercentile[],
  results: string[]
) {
  it(`should distribute for ${percentiles.map((p) => p.to - p.from)}`, () => {
    for (const value of results) {
      expect(handleAllocateWithIncrement(flagId, percentiles)).toBe(value);
    }
    // Try again
    for (const value of results) {
      expect(handleAllocateWithIncrement(flagId, percentiles)).toBe(value);
    }
  });
}
