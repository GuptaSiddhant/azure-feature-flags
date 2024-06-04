import type {
  FeatureFlag,
  FeatureFlagClientFilter,
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagWithFilters,
} from "../types.js";
import {
  checkIsTargetingClientFilter,
  validateFeatureFlagTargetingFilter,
} from "./validate-filter-targeting.js";
import {
  checkIsTimeWindowClientFilter,
  validateFeatureFlagTimeWindowFilter,
} from "./validate-filter-time-window.js";

/**
 * Check if the Feature flag is of type with-filters.
 */
export function checkIsFeatureFlagWithFilters(
  featureFlag: FeatureFlag
): featureFlag is FeatureFlagWithFilters {
  return "conditions" in featureFlag;
}

/**
 * Validate the feature-flag object with filters and rollout.
 *
 * @param featureFlag Azure Feature Flag with Filters
 * @param options Options for validation
 * @returns if the feature flag should be enabled or not with given filters
 * @throws when a validator is not implemented to handle a custom filter.
 */
export function validateFeatureFlagWithFilters(
  featureFlag: FeatureFlagWithFilters | undefined | null,
  options?: FeatureFlagWithFiltersValidateOptions
): boolean {
  if (!featureFlag?.enabled) {
    return false;
  }

  const filters = featureFlag.conditions.client_filters;
  if (!filters || filters.length === 0) {
    return featureFlag.enabled;
  }

  let validFilters = 0;
  for (const filter of filters) {
    if (validateClientFilter(filter, options, featureFlag)) {
      validFilters += 1;
    }
  }

  const requireAllFilters = featureFlag.conditions.requirement_type === "All";

  if (requireAllFilters) {
    return validFilters === filters.length;
  }

  return validFilters > 0;
}

function validateClientFilter(
  filter: FeatureFlagClientFilter,
  options: FeatureFlagWithFiltersValidateOptions = {},
  featureFlag: FeatureFlag
): boolean {
  if (checkIsTimeWindowClientFilter(filter)) {
    return validateFeatureFlagTimeWindowFilter(filter);
  }

  const filterOptions: FeatureFlagCustomFilterValidatorOptions = {
    groups: options.groups ?? [],
    key: featureFlag.id,
    users: options.users ?? [],
  };

  if (checkIsTargetingClientFilter(filter)) {
    return validateFeatureFlagTargetingFilter(
      filter,
      filterOptions,
      options.handleRollout
    );
  }

  const customFilterValidator = options.customFilterValidators?.[filter.name];
  if (customFilterValidator) {
    return customFilterValidator(filter, filterOptions);
  }

  throw new Error(
    `Custom filter validator is not implemented for: '${filter.name}'`
  );
}
