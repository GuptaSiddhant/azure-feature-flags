import { vi, describe, it, expect } from "vitest";
import type {
  FeatureFlag,
  FeatureFlagClientFilter,
  FeatureFlagCustomFilter,
} from "../src/types";
import { validateFeatureFlag } from "../src/validate";

vi.useFakeTimers();

// write jest test for validateFeatureFlag
describe("validateFeatureFlag", () => {
  it("should return false for invalid feature flag", () => {
    expect(validateFeatureFlag(undefined)).toBe(false);
  });

  it("should return false for disabled feature flag", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: false,
      conditions: { client_filters: [] },
    };

    expect(validateFeatureFlag(featureFlag)).toBe(false);
  });

  it("should return true for valid and enabled feature flag with no filters", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: { client_filters: [] },
    };

    expect(validateFeatureFlag(featureFlag)).toBe(true);
  });

  it("throw error if a custom/unsupported filter is found", () => {
    const customFilter = { name: "my-filter", parameters: { foo: "bar" } };
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: { client_filters: [customFilter] },
    };

    expect(() => validateFeatureFlag(featureFlag)).toThrowError(
      `Custom validator is not implemented for: ${JSON.stringify(customFilter)}`
    );
  });

  describe("Targeting by locale filter", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        clientFilters: [
          {
            name: "Microsoft.Targeting",
            parameters: {
              Audience: {
                Exclusion: {
                  Groups: ["de-de", "fr-fr", "desktop"],
                  Users: ["test-user-3", "test-user-4"],
                },
                Groups: [
                  { Name: "en-au", RolloutPercentage: 100 },
                  { Name: "en-eu", RolloutPercentage: 100 },
                  { Name: "mobile", RolloutPercentage: 100 },
                ],
                Users: ["test-user-1", "test-user-2"],
                DefaultRolloutPercentage: 50,
              },
            },
          },
        ],
      },
    };

    // Groups
    it("should return false where included locale group is missing", () => {
      expect(validateFeatureFlag(featureFlag, { groups: ["en-us"] })).toBe(
        false
      );
    });
    it("should return true where included locale group is matching", () => {
      expect(validateFeatureFlag(featureFlag, { groups: ["en-au"] })).toBe(
        true
      );
    });
    it("should return false where excluded locale group is matching", () => {
      expect(validateFeatureFlag(featureFlag, { groups: ["de-de"] })).toBe(
        false
      );
    });

    it("should return true where isMobile group is matching", () => {
      expect(validateFeatureFlag(featureFlag, { groups: ["mobile"] })).toBe(
        true
      );
    });
    it("should return true where isMobile group is excluded", () => {
      expect(validateFeatureFlag(featureFlag, { groups: ["desktop"] })).toBe(
        false
      );
    });

    // Users
    it("should return false where included user is missing", () => {
      expect(validateFeatureFlag(featureFlag, { user: "test-user-5" })).toBe(
        false
      );
    });
    it("should return true where included user is matching", () => {
      expect(validateFeatureFlag(featureFlag, { user: "test-user-1" })).toBe(
        true
      );
    });
    it("should return false where excluded user is matching", () => {
      expect(validateFeatureFlag(featureFlag, { user: "test-user-3" })).toBe(
        false
      );
    });

    // Default
    it("should return true if no options are provided and DefaultRollout > 0", () => {
      expect(validateFeatureFlag(featureFlag, {})).toBe(true);
    });
  });

  describe("Time window filter", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        client_filters: [
          {
            name: "Microsoft.TimeWindow",
            parameters: {
              Start: "Thu, 09 May 2024 23:00:00 GMT",
              End: "Thu, 16 May 2024 23:00:00 GMT",
            },
          },
        ],
      },
    };

    it("should return false before Start date", () => {
      vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag)).toBe(false);
    });
    it("should return false after End date", () => {
      vi.setSystemTime(new Date("Thu, 18 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag)).toBe(false);
    });
    it("should return true between Start and End date", () => {
      vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag)).toBe(true);
    });

    it("should throw error if both Start and End are missing (treat as custom filter)", () => {
      const filter: FeatureFlagClientFilter = {
        name: "Microsoft.TimeWindow",
        parameters: {},
      };
      const customFlag: FeatureFlag = {
        ...featureFlag,
        conditions: { client_filters: [filter] },
      };
      expect(() => validateFeatureFlag(customFlag)).toThrowError(
        `Custom validator is not implemented for: ${JSON.stringify(filter)}`
      );
    });

    it("should throw error if Start or End are not string", () => {
      const filter: FeatureFlagClientFilter = {
        name: "Microsoft.TimeWindow",
        // @ts-expect-error
        parameters: { End: { foo: "bar" } },
      };
      const customFlag: FeatureFlag = {
        ...featureFlag,
        conditions: { client_filters: [filter] },
      };
      expect(() => validateFeatureFlag(customFlag)).toThrowError(
        `Custom validator is not implemented for: ${JSON.stringify(filter)}`
      );
    });
  });

  describe("Custom filter", () => {
    const customFilter = { name: "my-filter", parameters: { foo: "bar" } };
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: { client_filters: [customFilter] },
    };

    it("should return false when custom filter does not validate", () => {
      expect(
        validateFeatureFlag(featureFlag, {
          customFilters: { "my-filter": (params) => params["foo"] === "abc" },
        })
      ).toBe(false);
    });

    it("should return true when custom filter does correctly validate", () => {
      expect(
        validateFeatureFlag(featureFlag, {
          customFilters: { "my-filter": (params) => params["foo"] === "bar" },
        })
      ).toBe(true);
    });
  });

  describe("Multiple filters (OR)", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        client_filters: [
          {
            name: "Microsoft.Targeting",
            parameters: {
              Audience: {
                Groups: [{ Name: "en-au", RolloutPercentage: 100 }],
                DefaultRolloutPercentage: 50,
              },
            },
          },
          {
            name: "Microsoft.TimeWindow",
            parameters: {
              Start: "Thu, 09 May 2024 23:00:00 GMT",
              End: "Thu, 16 May 2024 23:00:00 GMT",
            },
          },
        ],
      },
    };

    it("should return true if any filter is valid (OR)", () => {
      vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-au"] })).toBe(
        true
      );

      vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-us"] })).toBe(
        true
      );
    });
    it("should return false if all filters are invalid (OR)", () => {
      vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-us"] })).toBe(
        false
      );
    });
  });
  describe("Multiple filters (AND)", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        requirement_type: "All",
        client_filters: [
          {
            name: "Microsoft.Targeting",
            parameters: {
              Audience: {
                Groups: [{ Name: "en-au", RolloutPercentage: 100 }],
                DefaultRolloutPercentage: 50,
              },
            },
          },
          {
            name: "Microsoft.TimeWindow",
            parameters: {
              Start: "Thu, 09 May 2024 23:00:00 GMT",
              End: "Thu, 16 May 2024 23:00:00 GMT",
            },
          },
        ],
      },
    };

    it("should return true if all filters are valid (AND)", () => {
      vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-au"] })).toBe(
        true
      );
    });
    it("should return false if any filter is invalid (AND)", () => {
      vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-au"] })).toBe(
        false
      );

      vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
      expect(validateFeatureFlag(featureFlag, { groups: ["en-us"] })).toBe(
        false
      );
    });
  });
});
