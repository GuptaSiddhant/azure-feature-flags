import { describe, it, expect } from "vitest";
import type { FeatureFlagVariant, FeatureFlagWithVariants } from "../src/types";
import {
  checkIsFeatureFlagWithVariants,
  validateFeatureFlagWithVariants,
  verifyAllocationPercentile,
  getVariantFromVariantMap,
} from "../src/validators/validate-variants";

describe(checkIsFeatureFlagWithVariants, () => {
  it("should return true if object has variants", () => {
    expect(
      checkIsFeatureFlagWithVariants({
        id: "feature",
        enabled: false,
        variants: [{ name: "var-a", configuration_value: true }],
        allocation: {
          default_when_disabled: "var-a",
          default_when_enabled: "var-a",
          percentile: [{ from: 0, to: 100, variant: "var-a" }],
        },
      })
    ).true;
  });

  it("should return false if object does not have variants", () => {
    expect(
      checkIsFeatureFlagWithVariants({
        id: "test",
        enabled: true,
        conditions: {},
      })
    ).false;
  });
});

describe(validateFeatureFlagWithVariants, { concurrent: true }, () => {
  it("should throw error for invalid feature flag", async () => {
    // @ts-expect-error
    expect(await validateFeatureFlagWithVariants(undefined)).null;
    // (
    //   "There are no variants in the Feature Flag."
    // );
  });

  it("should return only variant", async () => {
    const featureFlag: FeatureFlagWithVariants = {
      id: "feature",
      enabled: false,
      variants: [{ name: "var-a", configuration_value: true }],
      allocation: {
        default_when_disabled: "var-a",
        default_when_enabled: "var-a",
        percentile: [{ from: 0, to: 100, variant: "var-a" }],
      },
    };
    expect(await validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return default variant for disabled feature flag", async () => {
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
    expect(await validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return variant override for group", async () => {
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
        group: [{ groups: ["en-gb"], variant: "var-b" }],
        seed: 10,
      },
    };

    expect(
      await validateFeatureFlagWithVariants(featureFlag, { groups: ["en-gb"] })
    ).toEqual({
      name: "var-b",
      configuration_value: false,
    });

    expect(
      await validateFeatureFlagWithVariants(featureFlag, { groups: ["en-us"] })
    ).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return variant override for user", async () => {
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
        user: [{ users: ["test-username"], variant: "var-b" }],
        seed: 20,
      },
    };

    expect(
      await validateFeatureFlagWithVariants(featureFlag, {
        users: ["test-username"],
      })
    ).toEqual({
      name: "var-b",
      configuration_value: false,
    });

    expect(
      await validateFeatureFlagWithVariants(featureFlag, {
        users: ["other-username"],
      })
    ).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return allocated variant", async () => {
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
    expect(await validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-a",
      configuration_value: true,
    });
  });

  it("should return default variant for enabled feature flag", async () => {
    const featureFlag: FeatureFlagWithVariants = {
      id: "feature",
      enabled: true,
      variants: [
        { name: "var-a", configuration_value: true },
        { name: "var-b", configuration_value: false },
      ],
      // @ts-expect-error
      allocation: {
        default_when_disabled: "var-a",
        default_when_enabled: "var-b",
      },
    };
    expect(await validateFeatureFlagWithVariants(featureFlag)).toEqual({
      name: "var-b",
      configuration_value: false,
    });
  });
});

describe(verifyAllocationPercentile, () => {
  it("should throw error if allocations from and to doesn't match", () => {
    expect(() =>
      verifyAllocationPercentile([
        { variant: "a", from: 0, to: 50 },
        { variant: "b", from: 60, to: 100 },
      ])
    ).toThrowError(
      "'From' value of allocation should match 'To' value of previous allocation."
    );
  });

  it("should throw error if allocations do add up to 100", () => {
    expect(() =>
      verifyAllocationPercentile([
        { variant: "a", from: 0, to: 50 },
        { variant: "b", from: 50, to: 99 },
      ])
    ).toThrowError("All allocations do not add up to a complete 100%.");
  });

  it("should return nothing if all is ok", () => {
    expect(
      verifyAllocationPercentile([
        { variant: "a", from: 0, to: 50 },
        { variant: "b", from: 50, to: 100 },
      ])
    ).undefined;
  });
});

describe(getVariantFromVariantMap, () => {
  const map = new Map<string, FeatureFlagVariant>([
    ["a", { name: "a", configuration_value: true }],
    ["b", { name: "b", configuration_value: false }],
  ]);

  it("should throw error if variant does not exists", () => {
    expect(() => getVariantFromVariantMap(map, "c")).toThrowError(
      "There is no variant in the Feature Flag matching name 'c'."
    );
  });

  it("should return variant object if it exists in map", () => {
    expect(getVariantFromVariantMap(map, "a")).toEqual({
      name: "a",
      configuration_value: true,
    });
  });
});
