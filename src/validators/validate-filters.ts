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
 */
export async function validateFeatureFlagWithFilters(
  featureFlag: FeatureFlagWithFilters | undefined | null,
  options?: FeatureFlagWithFiltersValidateOptions
): Promise<boolean> {
  try {
    if (!featureFlag?.enabled) {
      throw new Error("No feature flag or it is disabled.");
    }

    const filters = featureFlag.conditions.client_filters;
    if (!filters || filters.length === 0) {
      return featureFlag.enabled;
    }

    let validFilters = 0;
    for (const filter of filters) {
      if (await validateClientFilter(filter, options, featureFlag)) {
        validFilters += 1;
      }
    }

    const requireAllFilters = featureFlag.conditions.requirement_type === "All";

    if (requireAllFilters) {
      return validFilters === filters.length;
    }

    return validFilters > 0;
  } catch (error) {
    if (error instanceof Error) {
      options?.onError?.(error);
    }
    return false;
  }
}

async function validateClientFilter(
  filter: FeatureFlagClientFilter,
  options: FeatureFlagWithFiltersValidateOptions = {},
  featureFlag: FeatureFlag
): Promise<boolean> {
  if (checkIsTimeWindowClientFilter(filter)) {
    return validateFeatureFlagTimeWindowFilter(filter);
  }

  const filterOptions: FeatureFlagCustomFilterValidatorOptions = {
    ignoreCase: options.ignoreCase ?? false,
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
