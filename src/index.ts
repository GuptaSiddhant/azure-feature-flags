export { fetchFeatureFlags, fetchFeatureFlagByKey } from "./service.js";
export { validateFeatureFlag } from "./validate.js";

export type {
  FeatureFlag,
  FeatureFlagTargetingFilter,
  FeatureFlagTimeWindowFilter,
  FeatureFlagsRecord,
  CustomFilters,
  CustomFilterValidator,
  ValidateFeatureFlagOptions,
  FeatureFlagClientFilter,
  FeatureFlagCustomFilter,
} from "./types.js";
