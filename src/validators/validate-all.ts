import type {
  FeatureFlag,
  FeatureFlagWithFilters,
  FeatureFlagWithVariants,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagWithVariantsValidateOptions,
  FeatureFlagVariant,
} from "../types.js";
import {
  checkIsFeatureFlagWithVariants,
  validateFeatureFlagWithVariants,
} from "./validate-variants.ts";
import {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "./validate-filters.js";

/**
 * Validate the feature-flag object with variants.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns the variant that is allocated for given allocations
 */
export function validateFeatureFlag(
  featureFlag: FeatureFlagWithVariants,
  options?: FeatureFlagWithVariantsValidateOptions
): FeatureFlagVariant;

/**
 * Validate the feature-flag object with filters.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns if the feature flag should be enabled with given filters
 */
export function validateFeatureFlag(
  featureFlag: FeatureFlagWithFilters | null | undefined,
  options?: FeatureFlagWithFiltersValidateOptions
): boolean;

// implementation
export function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options?: FeatureFlagWithFiltersValidateOptions
): boolean | FeatureFlagVariant {
  if (
    !featureFlag ||
    typeof featureFlag !== "object" ||
    !("id" in featureFlag) ||
    !("enabled" in featureFlag)
  ) {
    return false;
  }

  if (checkIsFeatureFlagWithFilters(featureFlag)) {
    return validateFeatureFlagWithFilters(featureFlag, options);
  }

  if (checkIsFeatureFlagWithVariants(featureFlag)) {
    return validateFeatureFlagWithVariants(featureFlag, options);
  }

  // @ts-expect-error
  return featureFlag.enabled;
}
