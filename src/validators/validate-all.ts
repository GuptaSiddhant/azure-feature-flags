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
} from "./validate-variants.js";
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
export async function validateFeatureFlag(
  featureFlag: FeatureFlagWithVariants,
  options?: FeatureFlagWithVariantsValidateOptions
): Promise<FeatureFlagVariant | null>;

/**
 * Validate the feature-flag object with filters.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns if the feature flag should be enabled with given filters
 */
export async function validateFeatureFlag(
  featureFlag: FeatureFlagWithFilters | null | undefined,
  options?: FeatureFlagWithFiltersValidateOptions
): Promise<boolean>;

/**
 * Validate the any feature-flag object
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns if the feature flag should be enabled with given filters
 */
export async function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options?:
    | FeatureFlagWithFiltersValidateOptions
    | FeatureFlagWithVariantsValidateOptions
): Promise<boolean>;

// implementation
export async function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options?: FeatureFlagWithFiltersValidateOptions
): Promise<boolean | FeatureFlagVariant | null> {
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

  options?.onError?.(
    new Error(
      "The validator is not setup to validate this featureFlag => " +
        JSON.stringify(featureFlag)
    )
  );

  return null;
}
