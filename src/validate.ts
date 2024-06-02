/* c8 ignore start */
/**
 * @module
 * This module contains the validate function to check
 * if the feature flag is enabled or disabled for the
 * given filters and groups/users.
 */

import type {
  FeatureFlag,
  FeatureFlagWithFiltersValidateOptions,
} from "./types.js";
import { checkIsFeatureFlagWithVariants } from "./validate.ts";
import {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "./validators/validate-filters.js";

export type {
  FeatureFlag,
  FeatureFlagWithFiltersValidateOptions,
} from "./types.ts";
export {
  checkIsFeatureFlagWithFilters,
  validateFeatureFlagWithFilters,
} from "./validators/validate-filters.js";
export {
  checkIsFeatureFlagWithVariants,
  validateFeatureFlagWithVariants,
} from "./validators/validate-variants.js";

/**
 * Validate the feature-flag object with filters and rollout.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns if the feature flag should be enabled or not with given filters
 * @throws when a validator is not implemented to handle a custom filter.
 * @deprecated
 * Use `validateFeatureFlagWithFilters` for validating Flags with filters, and `validateFeatureFlagWithVariants` for validating flags with variants.
 *
 * @see `validateFeatureFlagWithFilters`
 * @see `validateFeatureFlagWithVariants`
 */
export function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options?: FeatureFlagWithFiltersValidateOptions
): boolean {
  if (!featureFlag) {
    return false;
  }

  if (checkIsFeatureFlagWithFilters(featureFlag)) {
    return validateFeatureFlagWithFilters(featureFlag, options);
  }

  if (checkIsFeatureFlagWithVariants(featureFlag)) {
    throw new Error(
      "This validator does not support the Feature Flags with variants. Use 'validateFeatureFlagWithVariants' to validate them."
    );
  }

  throw new Error(
    "Unsupported: The Feature Flag is not of type Filters or Variants. Contact Author for supporting this type of Azure Feature Flag: " +
      JSON.stringify(featureFlag)
  );
}
