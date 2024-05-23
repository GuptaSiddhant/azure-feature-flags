export type FeatureFlagsRecord = Record<string, FeatureFlag>;

export type FeatureFlag = {
  conditions: {
    clientFilters?: Array<FeatureFlagClientFilter>;
    client_filters?: Array<FeatureFlagClientFilter>;
    requirement_type?: "All" | "Any";
  };
  description?: string;
  displayName?: string;
  enabled: boolean;
  id: string;
};

export type FeatureFlagClientFilter =
  | FeatureFlagTargetingFilter
  | FeatureFlagTimeWindowFilter
  | FeatureFlagCustomFilter;

export type FeatureFlagTargetingFilter = {
  name: "Microsoft.Targeting";
  parameters: {
    Audience: {
      DefaultRolloutPercentage: number;
      Exclusion?: { Groups?: Array<string>; Users?: Array<string> };
      Groups?: Array<{ Name: string; RolloutPercentage: number }>;
      Users?: Array<string>;
    };
  };
};

export type FeatureFlagTimeWindowFilter = {
  name: "Microsoft.TimeWindow";
  parameters:
    | { End: string; Start: null }
    | { End: null; Start: string }
    | { End: string; Start: string };
};

export type FeatureFlagCustomFilter = {
  name: string;
  parameters: Record<string, string>;
};

export type FeatureFlagCustomFilterValidator = (
  filter: FeatureFlagCustomFilter,
  options: FeatureFlagCustomFilterValidatorOptions
) => boolean;

export type FeatureFlagCustomFilterValidatorOptions = {
  groups: Array<string>;
  key: string;
  users: Array<string>;
};

export type FeatureFlagCustomFilterValidators = Record<
  string,
  FeatureFlagCustomFilterValidator
>;

export type FeatureFlagValidateOptions = {
  /** Groups to validate the feature flag against */
  groups?: Array<string>;
  /** User ID to validate the feature flag against */
  users?: Array<string>;
  /** Handle and validate custom filters */
  customFilterValidators?: FeatureFlagCustomFilterValidators;
  /**
   * Function to handle partial rollout.
   * By default, it only checks if rolloutPercentage > 0.
   */
  handleRollout?: FeatureFlagHandleRollout;
};

export type FeatureFlagHandleRollout = (
  flagKey: string,
  rolloutPercentage: number,
  groupName: string | undefined
) => boolean;
