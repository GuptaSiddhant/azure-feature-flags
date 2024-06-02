import { ListConfigurationSettingsOptions } from "@azure/app-configuration";

export type FeatureFlagsRecord = Record<string, FeatureFlag>;

/**
 * Feature Flag based Azure App configuration.
 */
export type FeatureFlag = FeatureFlagWithFilters | FeatureFlagWithVariants;

export type FeatureFlagWithFilters = {
  description?: string;
  displayName?: string;
  enabled: boolean;
  id: string;
  conditions: {
    client_filters?: Array<FeatureFlagClientFilter>;
    requirement_type?: "All" | "Any";
  };
};

export type FeatureFlagWithVariants = {
  description?: string;
  displayName?: string;
  enabled: boolean;
  id: string;
  allocation: FeatureFlagAllocation;
  variants: Array<FeatureFlagVariant>;
  telemetry?: { enabled: boolean };
};

export type FeatureFlagVariant = {
  name: string;
  configuration_value: JsonValue;
};

export type FeatureFlagAllocation = {
  percentile: Array<FeatureFlagAllocationPercentile>;
  group?: Array<FeatureFlagAllocationGroup>;
  user?: Array<FeatureFlagAllocationUser>;
  seed?: number;
  default_when_enabled: string;
  default_when_disabled: string;
};

export type FeatureFlagAllocationPercentile = {
  variant: string;
  from: number;
  to: number;
};

export type FeatureFlagAllocationGroup = {
  variant: string;
  groups: Array<string>;
};

export type FeatureFlagAllocationUser = {
  variant: string;
  users: Array<string>;
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
 * Options for validating a Feature flag with filters.
 */
export type FeatureFlagWithFiltersValidateOptions = {
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

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | Array<JsonValue>
  | { [key: string]: JsonValue };

/**
 * Options for validating a Feature flag with variants.
 */
export type FeatureFlagWithVariantsValidateOptions = {
  /** Groups to validate the feature flag against */
  groups?: Array<string>;
  /** User ID to validate the feature flag against */
  users?: Array<string>;
  /**
   * Function to handle allocation.
   * By default, it returns the variant with most allocation.
   */
  handleAllocate?: FeatureFlagHandleVariantAllocation;
};

/**
 * Function type for defining a handler for variant allocation.
 */
export type FeatureFlagHandleVariantAllocation = (
  percentiles: FeatureFlagAllocationPercentile[],
  seed?: number
) => string;
