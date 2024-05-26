/**
 * @module
 * This module contains the validate function to check
 * if the feature flag is enabled or disabled for the
 * given filters and groups/users.
 */

import type {
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlag,
  FeatureFlagValidateOptions,
} from "./types.js";
import {
  checkIsTargetingClientFilter,
  validateFeatureFlagTargetingFilter,
} from "./validators/validate-targeting.js";
import {
  checkIsTimeWindowClientFilter,
  validateFeatureFlagTimeWindowFilter,
} from "./validators/validate-time-window.js";

export type { FeatureFlagValidateOptions, FeatureFlag };

/**
 * Validate the feature-flag object with filters and rollout.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options Options for validation
 * @returns if the feature flag should be enabled or not with given filters
 * @throws when a validator is not implemented to handle a custom filter.
 */
export function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options?: FeatureFlagValidateOptions
): boolean {
  if (!featureFlag?.enabled) {
    return false;
  }

  const filters =
    featureFlag.conditions.client_filters ||
    featureFlag.conditions.clientFilters;
  if (!filters || filters.length === 0) {
    return featureFlag.enabled;
  }

  let validFilters = 0;
  for (const filter of filters) {
    if (checkIsTimeWindowClientFilter(filter)) {
      if (validateFeatureFlagTimeWindowFilter(filter)) {
        validFilters += 1;
      }
      continue;
    }

    const filterOptions: FeatureFlagCustomFilterValidatorOptions = {
      groups: options?.groups ?? [],
      key: featureFlag.id,
      users: options?.users ?? [],
    };

    if (checkIsTargetingClientFilter(filter)) {
      if (
        validateFeatureFlagTargetingFilter(
          filter,
          filterOptions,
          options?.handleRollout
        )
      ) {
        validFilters += 1;
      }
      continue;
    }

    const customFilterValidator =
      options?.customFilterValidators?.[filter.name];
    if (customFilterValidator) {
      if (customFilterValidator(filter, filterOptions)) {
        validFilters += 1;
      }
      continue;
    }

    throw new Error(
      `Custom filter validator is not implemented for: '${filter.name}'`
    );
  }

  const requireAllFilters = featureFlag.conditions.requirement_type === "All";

  if (requireAllFilters) {
    return validFilters === filters.length;
  }
  return validFilters > 0;
}
