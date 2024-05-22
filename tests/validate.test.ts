import { vi, describe, it, expect } from "vitest";
import type { FeatureFlag } from "../src/types";
import { validateFeatureFlag } from "../src/validate";

vi.useFakeTimers();
const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

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

  it("should do nothing if a custom/unsupported filter is found", () => {
    const customFilter = { name: "CustomFilter", parameters: {} };
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        client_filters: [customFilter],
      },
    };

    validateFeatureFlag(featureFlag);
    expect(spyConsoleError).toHaveBeenCalledWith(
      "Custom filters are not supported yet.",
      customFilter
    );
  });

  describe("Targeting by locale filter", () => {
    const featureFlag: FeatureFlag = {
      id: "feature",
      enabled: true,
      conditions: {
        client_filters: [
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
