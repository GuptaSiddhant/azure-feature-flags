import type {
  FeatureFlag,
  FeatureFlagTargetingFilter,
  FeatureFlagTimeWindowFilter,
  ValidateFeatureFlagOptions,
} from "./types.ts";

/**
 * Validate the feature-flag object with filters and rollout.
 *
 * @param featureFlag Azure Feature Flag config object
 * @param options
 * @returns if the feature flag should be enabled of not with given filters
 */
export function validateFeatureFlag(
  featureFlag: FeatureFlag | null | undefined,
  options: ValidateFeatureFlagOptions = {}
): boolean {
  if (!featureFlag?.enabled) {
    return false;
  }

  const filters = featureFlag.conditions.client_filters;
  if (!filters || filters.length === 0) {
    return featureFlag.enabled;
  }

  let validFilters = 0;
  filterLoop: for (const filter of filters) {
    if (filter.name === "Microsoft.TimeWindow") {
      if (validateFeatureFlagTimeWindowFilter(filter)) {
        validFilters += 1;
      }
      continue;
    }

    const groups =
      options.groups?.filter((g): g is string => g !== undefined) ?? [];
    const users = options.user ? [options.user] : [];

    if (filter.name === "Microsoft.Targeting") {
      if (validateFeatureFlagTargetingFilter(filter, groups, users)) {
        validFilters += 1;
      }
      continue;
    }

    // Custom filters
    for (const [name, validator] of Object.entries(
      options.customFilters ?? {}
    )) {
      if (filter.name === name) {
        if (validator(filter.parameters, groups, users)) {
          validFilters += 1;
        }

        continue filterLoop;
      }
    }

    throw new Error(
      "Custom validator is not implemented for: " + JSON.stringify(filter)
    );
  }

  const requireAllFilters = featureFlag.conditions.requirement_type === "All";

  if (requireAllFilters) {
    return validFilters === filters.length;
  }
  return validFilters > 0;
}

function validateFeatureFlagTimeWindowFilter(
  filter: FeatureFlagTimeWindowFilter
): boolean {
  const { End, Start } = filter.parameters;
  const now = Date.now();
  if (Start && new Date(Start).valueOf() > now) {
    return false;
  }
  if (End && now > new Date(End).valueOf()) {
    return false;
  }
  return true;
}

function validateFeatureFlagTargetingFilter(
  filter: FeatureFlagTargetingFilter,
  groups: Array<string>,
  users: Array<string>
): boolean {
  // The options is currently tested against both included and excluded audiences.
  // In future, more options can be added which are tested against either audiences.
  return validateFeatureFlagTargetingFilterParsed(filter, {
    excludedGroups: groups,
    excludedUsers: users,
    includedGroups: groups,
    includedUsers: users,
  });
}

function validateFeatureFlagTargetingFilterParsed(
  filter: FeatureFlagTargetingFilter,
  options: {
    excludedGroups: string[];
    excludedUsers: string[];
    includedGroups: string[];
    includedUsers: string[];
  }
): boolean {
  const { excludedGroups, excludedUsers, includedGroups, includedUsers } =
    options;
  const { DefaultRolloutPercentage, Exclusion, Groups, Users } =
    filter.parameters.Audience;
  // 1. If user is excluded, return false.
  if (
    excludedUsers.length > 0 &&
    checkTargetingFilterInput(Exclusion?.Users, excludedUsers)
  ) {
    return false;
  }
  // 2. If group is excluded, return false
  if (
    excludedGroups.length > 0 &&
    checkTargetingFilterInput(Exclusion?.Groups, excludedGroups)
  ) {
    return false;
  }
  // 3. If user is included, return true.
  if (includedUsers.length > 0 && Users && Users.length > 0) {
    return checkTargetingFilterInput(Users, includedUsers);
  }
  // 4. If group is included, return true (partial rollout not implemented).
  if (includedGroups.length > 0 && Groups && Groups.length > 0) {
    return checkTargetingFilterInput(
      Groups.map((group) => group.Name),
      includedGroups
    );
  }
  // 5 If default rollout is valid, return true (partial rollout not implemented).
  return DefaultRolloutPercentage > 0;
}

function checkTargetingFilterInput(
  audiences: string[] | undefined,
  inputs: string[]
): boolean {
  if (!audiences || audiences.length === 0) {
    return false;
  }
  return audiences.some((audience) => inputs.includes(audience));
}
