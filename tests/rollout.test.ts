import { describe, it, expect } from "vitest";
import { handleRolloutWithHash } from "../src/rollout";

const flagKey = "test-flag";

describe(handleRolloutWithHash, () => {
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
