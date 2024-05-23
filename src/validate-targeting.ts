import type {
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlagClientFilter,
  FeatureFlagTargetingFilter,
} from "./types.js";

export function checkIsTargetingClientFilter(
  filter: FeatureFlagClientFilter
): filter is FeatureFlagTargetingFilter {
  const Audience =
    filter?.name == "Microsoft.Targeting" &&
    filter.parameters &&
    filter.parameters["Audience"];

  return typeof Audience === "object";
}

export function validateFeatureFlagTargetingFilter(
  filter: FeatureFlagTargetingFilter,
  { groups, users }: FeatureFlagCustomFilterValidatorOptions
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
