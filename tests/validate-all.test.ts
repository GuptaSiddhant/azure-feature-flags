import { describe, it, expect } from "vitest";
import { validateFeatureFlag } from "../src/validators/validate-all";
import { dummyFeatureFlag, featureFlagWithVariants } from "./azure-client.mock";

describe(validateFeatureFlag, () => {
  it("null", async () => {
    expect(await validateFeatureFlag(null)).false;
  });

  it("filters", async () => {
    expect(await validateFeatureFlag(dummyFeatureFlag)).true;
  });

  it("variants", async () => {
    expect(await validateFeatureFlag(featureFlagWithVariants)).toEqual({
      configuration_value: true,
      name: "var-a",
    });
  });

  it("should return null if type of flag is unsupported", async () => {
    // @ts-expect-error
    expect(await validateFeatureFlag({ id: "test", enabled: true })).null;
  });
});
