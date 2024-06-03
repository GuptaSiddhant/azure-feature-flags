/* c8 ignore start */
/**
 * @module
 * This module contains the validate function to check
 * if the feature flag is enabled or disabled for the
 * given filters and groups/users.
 */

export type {
  FeatureFlag,
  FeatureFlagVariant,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagWithVariantsValidateOptions,
} from "./types.ts";
export { validateFeatureFlag } from "./validators/validate-all.js";
export {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "./validators/validate-filters.js";
export {
  checkIsFeatureFlagWithVariants,
  validateFeatureFlagWithVariants,
} from "./validators/validate-variants.js";
