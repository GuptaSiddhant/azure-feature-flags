import { vi, describe, it, expect } from "vitest";
import type {
  FeatureFlagWithFilters,
  FeatureFlagClientFilter,
  FeatureFlagHandleRollout,
} from "../src/types";
import {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "../src/validators/validate-filters";
import { dummyFeatureFlag } from "./azure-client.mock";

vi.useFakeTimers();

describe(checkIsFeatureFlagWithFilters, () => {
  it("should return true if object has conditions", () => {
    expect(checkIsFeatureFlagWithFilters(dummyFeatureFlag)).true;
  });
  it("should return false if object does not have conditions", () => {
    expect(
      // @ts-expect-error
      checkIsFeatureFlagWithFilters({
        id: "",
        enabled: false,
      })
    ).false;
  });
});

describe("Without filters", { concurrent: true }, () => {
  it("should return false for invalid feature flag", async () => {
    expect(await validateFeatureFlagWithFilters(undefined)).false;
  });

  it("should return false for disabled feature flag", async () => {
    const featureFlag: FeatureFlagWithFilters = {
      id: "feature",
      enabled: false,
      conditions: { client_filters: [] },
    };

    expect(await validateFeatureFlagWithFilters(featureFlag)).false;
  });

  it("should return true for valid and enabled feature flag with no filters", async () => {
    const featureFlag: FeatureFlagWithFilters = {
      id: "feature",
      enabled: true,
      conditions: { client_filters: [] },
    };

    expect(await validateFeatureFlagWithFilters(featureFlag)).true;
  });
});

describe("Targeting filter", { concurrent: true }, () => {
  const featureFlag: FeatureFlagWithFilters = {
    id: "feature",
    enabled: true,
    conditions: {
      client_filters: [
        {
          name: "Microsoft.Targeting",
          parameters: {
            Audience: {
              Exclusion: {
                Groups: ["de-de", "fr-fr"],
                Users: ["test-user-3", "test-user-4"],
              },
              Groups: [
                { Name: "sv-se", RolloutPercentage: 50 },
                { Name: "en-gb", RolloutPercentage: 100 },
                { Name: "fi-fi", RolloutPercentage: 0 },
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
  it("should return true where included locale group is matching (ignore case)", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        groups: ["en-GB"],
        ignoreCase: true,
      })
    ).true;
  });
  it("should return false where excluded locale group is matching", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["de-de"] })
    ).false;
  });
  it("should return false where included locale group is matching with RolloutPercentage=0", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["fi-fi"] })
    ).false;
  });

  // Users
  it("should return false where included user is missing", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        users: ["test-user-5"],
      })
    ).false;
  });
  it("should return true where included user is matching", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        users: ["test-user-1"],
      })
    ).true;
  });
  it("should return false where excluded user is matching", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        users: ["test-user-3"],
      })
    ).false;
  });

  it("should use custom handleRollout callback", async () => {
    const handleRollout: FeatureFlagHandleRollout = (_key, percentage) => {
      return percentage > 50;
    };

    expect(await validateFeatureFlagWithFilters(featureFlag, { handleRollout }))
      .false;

    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        groups: ["sv-se"],
        handleRollout,
      })
    ).false;

    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        groups: ["en-gb"],
        handleRollout,
      })
    ).true;
  });

  // Default
  it("should return true if no options are provided and DefaultRollout > 0", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        handleRollout: (_, rollout) => rollout >= 0,
      })
    ).true;
  });

  // This test should be at the end of block because it modifies the feature flag object
  it(
    "should return false if no options are provided and DefaultRollout = 0",
    { sequential: true },
    async () => {
      featureFlag.conditions.client_filters![0].parameters[
        "Audience"
      ].DefaultRolloutPercentage = 0;
      expect(await validateFeatureFlagWithFilters(featureFlag, {})).false;
    }
  );
});

describe("Time window filter", { concurrent: true }, () => {
  const featureFlag: FeatureFlagWithFilters = {
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

  it("should return false before Start date", async () => {
    vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
    expect(await validateFeatureFlagWithFilters(featureFlag)).false;
  });
  it("should return false after End date", async () => {
    vi.setSystemTime(new Date("Thu, 18 May 2024 22:59:59 GMT"));
    expect(await validateFeatureFlagWithFilters(featureFlag)).false;
  });
  it("should return true between Start and End date", async () => {
    vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
    expect(await validateFeatureFlagWithFilters(featureFlag)).true;
  });

  it("should return false (and error) if both Start and End are missing (treat as custom filter)", async () => {
    const filter: FeatureFlagClientFilter = {
      name: "Microsoft.TimeWindow",
      parameters: {},
    };
    const customFlag: FeatureFlagWithFilters = {
      ...featureFlag,
      conditions: { client_filters: [filter] },
    };

    const errorFn = vi.fn();
    expect(
      await validateFeatureFlagWithFilters(customFlag, { onError: errorFn })
    ).false;
    expect(errorFn).toBeCalledWith(
      Error(`Custom filter validator is not implemented for: '${filter.name}'`)
    );
  });
  it("should return false (and error) if Start or End are not string (treat as custom filter)", async () => {
    const filter: FeatureFlagClientFilter = {
      name: "Microsoft.TimeWindow",
      // @ts-expect-error
      parameters: { End: { foo: "bar" } },
    };
    const customFlag: FeatureFlagWithFilters = {
      ...featureFlag,
      conditions: { client_filters: [filter] },
    };

    const errorFn = vi.fn();
    expect(
      await validateFeatureFlagWithFilters(customFlag, { onError: errorFn })
    ).false;
    expect(errorFn).toBeCalledWith(
      Error(`Custom filter validator is not implemented for: '${filter.name}'`)
    );
  });
});

describe("Custom filter", { concurrent: true }, async () => {
  const customFilter = { name: "my-filter", parameters: { foo: "bar" } };
  const featureFlag: FeatureFlagWithFilters = {
    id: "feature",
    enabled: true,
    conditions: { client_filters: [customFilter] },
  };

  const errorFn = vi.fn();
  it("should return false (and error) if a custom filter is found and not handled", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { onError: errorFn })
    );
    expect(errorFn).toBeCalledWith(
      Error(
        `Custom filter validator is not implemented for: '${customFilter.name}'`
      )
    );
  });

  it("should return false when custom filter does not validate", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        customFilterValidators: {
          "my-filter": (filter) => filter.parameters["foo"] === "abc",
        },
      })
    ).false;
  });

  it("should return true when custom filter does correctly validate", async () => {
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        customFilterValidators: {
          "my-filter": (filter) => filter.parameters["foo"] === "bar",
        },
      })
    ).true;
  });
});

describe("Multiple filters (OR)", async () => {
  const featureFlag: FeatureFlagWithFilters = {
    id: "feature",
    enabled: true,
    conditions: {
      client_filters: [
        {
          name: "Microsoft.Targeting",
          parameters: {
            Audience: {
              Groups: [{ Name: "en-gb", RolloutPercentage: 100 }],
              DefaultRolloutPercentage: 50,
              Exclusion: { Groups: ["en-us"] },
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

  it("should return true if any filter is valid", async () => {
    vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["en-gb"] })
    ).true;

    vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["en-us"] })
    ).true;
  });
  it("should return false if all filters are invalid", async () => {
    vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["en-us"] })
    ).false;
  });
});

describe("Multiple filters (AND)", () => {
  const featureFlag: FeatureFlagWithFilters = {
    id: "feature",
    enabled: true,
    conditions: {
      requirement_type: "All",
      client_filters: [
        {
          name: "Microsoft.Targeting",
          parameters: {
            Audience: {
              Groups: [{ Name: "en-gb", RolloutPercentage: 100 }],
              DefaultRolloutPercentage: 50,
              Exclusion: { Groups: ["en-us"] },
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

  it("should return true if all filters are valid", async () => {
    vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, {
        groups: ["en-gb"],
      })
    ).true;
  });

  it("should return false if any filter is invalid", async () => {
    vi.setSystemTime(new Date("Thu, 08 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["en-gb"] })
    ).false;

    vi.setSystemTime(new Date("Thu, 12 May 2024 22:59:59 GMT"));
    expect(
      await validateFeatureFlagWithFilters(featureFlag, { groups: ["en-us"] })
    ).false;
  });
});
