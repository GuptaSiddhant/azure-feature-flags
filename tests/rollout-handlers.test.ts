import { describe, it, expect } from "vitest";
import { handleRolloutWithHash } from "../src/rollout-handlers";

const flagKey = "test-flag";

describe(handleRolloutWithHash, () => {
  it("should return true if groupName: undefined, percentage: 50", async () => {
    expect(await handleRolloutWithHash(flagKey, 50)).true;
  });
  it("should return true if groupName: undefined, percentage: 75", async () => {
    expect(await handleRolloutWithHash(flagKey, 75)).true;
  });

  it("should return true if groupName: fi-fi, percentage: 50", async () => {
    expect(await handleRolloutWithHash(flagKey, 50, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 75", async () => {
    expect(await handleRolloutWithHash(flagKey, 75, "fi-fi")).true;
  });
  it("should return true if groupName: fi-fi, percentage: 1", async () => {
    expect(await handleRolloutWithHash(flagKey, 1, "fi-fi")).false;
  });
});
