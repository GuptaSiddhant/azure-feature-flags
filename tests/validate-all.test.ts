import { describe, it, expect } from "vitest";
import { validateFeatureFlag } from "../src/validators/validate-all";
import { dummyFeatureFlag, featureFlagWithVariants } from "./azure-client.mock";

describe(validateFeatureFlag, () => {
  it("null", () => {
    expect(validateFeatureFlag(null)).false;
  });

  it("filters", () => {
    expect(validateFeatureFlag(dummyFeatureFlag)).true;
  });

  it("variants", () => {
    expect(validateFeatureFlag(featureFlagWithVariants)).toEqual({
      configuration_value: true,
      name: "var-a",
    });
  });

  it("should throw error if type of flag is unsupported", () => {
    // @ts-expect-error
    expect(validateFeatureFlag({ id: "test", enabled: true })).true;
  });
});
