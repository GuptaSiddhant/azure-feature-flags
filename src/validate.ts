/* c8 ignore start */
/**
 * @module
 * This module contains the validate function to check
 * if the feature flag is enabled or disabled for the
 * given filters and groups/users.
 */

export type {
  FeatureFlag,
  // Filter
  FeatureFlagWithFilters,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagClientFilter,
  FeatureFlagTimeWindowFilter,
  FeatureFlagTargetingFilter,
  FeatureFlagHandleRollout,
  FeatureFlagCustomFilter,
  FeatureFlagCustomFilterValidators,
  FeatureFlagCustomFilterValidator,
  FeatureFlagCustomFilterValidatorOptions,
  // Variants
  FeatureFlagWithVariants,
  FeatureFlagWithVariantsValidateOptions,
  FeatureFlagVariant,
  FeatureFlagVariantName,
  FeatureFlagAllocation,
  FeatureFlagAllocationGroup,
  FeatureFlagAllocationPercentile,
  FeatureFlagAllocationUser,
  FeatureFlagHandleVariantAllocation,
  JsonValue,
} from "./types.js";
export { validateFeatureFlag } from "./validators/validate-all.js";
export {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "./validators/validate-filters.js";
export {
  checkIsFeatureFlagWithVariants,
  validateFeatureFlagWithVariants,
} from "./validators/validate-variants.js";
