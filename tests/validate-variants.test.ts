import { describe, it, expect } from "vitest";
import type { FeatureFlagWithVariants } from "../src/types";
import validateFeatureFlagWithVariants from "../src/validators/validate-variants";

describe("Without filters", { concurrent: true }, () => {
  it("should return false for invalid feature flag", () => {
    // @ts-expect-error
    expect(() => validateFeatureFlagWithVariants(undefined)).toThrowError(
      "There are no variants in the Feature Flag."
    );
  });

  it("should return false for disabled feature flag", () => {
    const featureFlag: FeatureFlagWithVariants = {
      id: "feature",
      enabled: false,
      variants: [
        { name: "var-a", configuration_value: true },
        { name: "var-b", configuration_value: false },
      ],
      allocation: {
        default_when_disabled: "var-a",
        default_when_enabled: "var-b",
        percentile: [
          { from: 0, to: 50, variant: "var-a" },
          { from: 50, to: 100, variant: "var-b" },
        ],
      },
    };
    expect(validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return true for valid and enabled feature flag with no filters", () => {
    const featureFlag: FeatureFlagWithVariants = {
      id: "feature",
      enabled: true,
      variants: [
        { name: "var-a", configuration_value: true },
        { name: "var-b", configuration_value: false },
      ],
      allocation: {
        default_when_disabled: "var-a",
        default_when_enabled: "var-b",
        percentile: [
          { from: 0, to: 50, variant: "var-a" },
          { from: 50, to: 100, variant: "var-b" },
        ],
      },
    };
    expect(validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-b",
      configuration_value: false,
    });
  });
});
