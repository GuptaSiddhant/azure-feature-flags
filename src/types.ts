/**
 * @module
 * This module contains all the TypeScript types
 */

/**
 * Record/object representation of all Feature Flags.
 */
export type FeatureFlagsRecord = Record<string, FeatureFlag>;

/**
 * Feature Flag based on Azure App configuration.
 */
export type FeatureFlag = FeatureFlagWithFilters | FeatureFlagWithVariants;

/**
 * Feature Flag based on Azure App configuration.
 * It only represents the Feature Flag configured with Client Filters.
 */
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

/**
 * Feature Flag based on Azure App configuration.
 * It only represents the Feature Flag configured with Variants.
 */
export type FeatureFlagWithVariants = {
  description?: string;
  displayName?: string;
  enabled: boolean;
  id: string;
  allocation: FeatureFlagAllocation;
  telemetry?: { enabled: boolean };
  variants: Array<FeatureFlagVariant>;
};

/**
 * Representation of Feature Flag Variant with name and value.
 * The `configuration_value` can be any valid JSON value.
 */
export type FeatureFlagVariant = {
  name: FeatureFlagVariantName;
  configuration_value: JsonValue;
};

export type FeatureFlagVariantName = string;

/**
 * Representation of Feature Flag Allocation object
 */
export type FeatureFlagAllocation = {
  percentile: Array<FeatureFlagAllocationPercentile>;
  group?: Array<FeatureFlagAllocationGroup>;
  user?: Array<FeatureFlagAllocationUser>;
  seed?: number;
  default_when_enabled: string;
  default_when_disabled: string;
};

/**
 * Representation of Feature Flag Allocation Percentile object
 */
export type FeatureFlagAllocationPercentile = {
  variant: FeatureFlagVariantName;
  from: number;
  to: number;
};

/**
 * Representation of Feature Flag Allocation Group.
 * A variant can be allocated to a list of groups.
 */
export type FeatureFlagAllocationGroup = {
  variant: FeatureFlagVariantName;
  groups: Array<string>;
};

/**
 * Representation of Feature Flag Allocation User.
 * A variant can be allocated to a list of users.
 */
export type FeatureFlagAllocationUser = {
  variant: FeatureFlagVariantName;
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
  parameters: { Audience: FeatureFlagTargetingAudience };
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
 * Audience for targeting filter
 */
export type FeatureFlagTargetingAudience = {
  DefaultRolloutPercentage: number;
  Exclusion?: { Groups?: Array<string>; Users?: Array<string> };
  Groups?: Array<{ Name: string; RolloutPercentage: number }>;
  Users?: Array<string>;
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
  ignoreCase: boolean;
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
  /**
   * Ignore case (case-insensitive) while comparing groups and users.
   * @default false
   */
  ignoreCase?: boolean;
  /** Handle and validate custom filters */
  customFilterValidators?: FeatureFlagCustomFilterValidators;
  /**
   * Function to handle partial rollout.
   * By default, it only checks if rolloutPercentage > 0.
   */
  handleRollout?: FeatureFlagHandleRollout;
  /**
   * Since the library does not implicitly throw error
   * to prevent breaking the app,
   * or log to console to preserve privacy.
   * `onError` can be used to throw or log.
   */
  onError?: (error: Error) => void;
};

/**
 * Function type for defining a handler for rollout mechanism.
 */
export type FeatureFlagHandleRollout = (
  rolloutId: string,
  rolloutPercentage: number
) => boolean | Promise<boolean>;

/**
 * Representation of all valid JSON values.
 */
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
   * Ignore case (case-insensitive) while comparing groups and users.
   * @default false
   */
  ignoreCase?: boolean;
  /**
   * Function to handle allocation.
   * By default, it uses increment-allocation
   */
  handleAllocate?: FeatureFlagHandleVariantAllocation;
  /**
   * Since the library does not implicitly throw error
   * to prevent breaking the app,
   * or log to console to preserve privacy.
   * `onError` can be used to throw or log.
   */
  onError?: (error: Error) => void;
};

/**
 * Function type for defining a handler for variant allocation.
 */
export type FeatureFlagHandleVariantAllocation = (
  flagId: string,
  percentiles: FeatureFlagAllocationPercentile[],
  seed?: number
) => FeatureFlagVariantName | Promise<FeatureFlagVariantName>;
