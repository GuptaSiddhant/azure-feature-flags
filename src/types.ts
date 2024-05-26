import { ListConfigurationSettingsOptions } from "@azure/app-configuration";

export type FeatureFlagsRecord = Record<string, FeatureFlag>;

/**
 * Feature Flag based Azure App configuration.
 */
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

/**
 * Union of all available filter types
 */
export type FeatureFlagClientFilter =
  | FeatureFlagTargetingFilter
  | FeatureFlagTimeWindowFilter
  | FeatureFlagCustomFilter;

/**
 * Filter for targeting (including/excluding) audiences and controlled rollout.
 */
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

/**
 * Filter for enabling/disabling feature flag according to timestamp.
 */
export type FeatureFlagTimeWindowFilter = {
  name: "Microsoft.TimeWindow";
  parameters:
    | { End: string; Start: null }
    | { End: null; Start: string }
    | { End: string; Start: string };
};

/**
 * Custom or user-defined filter. All parameters have `string` value.
 */
export type FeatureFlagCustomFilter = {
  name: string;
  parameters: Record<string, string>;
};

/**
 * Function type for defining a validator for a custom-filter.
 */
export type FeatureFlagCustomFilterValidator = (
  filter: FeatureFlagCustomFilter,
  options: FeatureFlagCustomFilterValidatorOptions
) => boolean;

/**
 * Options that are available to a validator for a custom-filter.
 */
export type FeatureFlagCustomFilterValidatorOptions = {
  groups: Array<string>;
  key: string;
  users: Array<string>;
};

/**
 * Record of all validators for custom-filters.
 */
export type FeatureFlagCustomFilterValidators = Record<
  string,
  FeatureFlagCustomFilterValidator
>;

/**
 * Options for validating a Feature flag.
 */
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

/**
 * Function type for defining a handler for rollout mechanism.
 */
export type FeatureFlagHandleRollout = (
  flagKey: string,
  rolloutPercentage: number,
  groupName?: string
) => boolean;

export type GetFeatureFlagsOptions = Omit<
  ListConfigurationSettingsOptions,
  "keyFilter"
>;
