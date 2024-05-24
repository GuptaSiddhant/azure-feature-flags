import type {
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlagClientFilter,
  FeatureFlagTargetingFilter,
  FeatureFlagHandleRollout,
} from "./types.js";

export function checkIsTargetingClientFilter(
  filter: FeatureFlagClientFilter
): filter is FeatureFlagTargetingFilter {
  const Audience =
    filter?.name === "Microsoft.Targeting" &&
    filter.parameters &&
    filter.parameters["Audience"];

  return typeof Audience === "object";
}

const defaultHandleRollout: FeatureFlagHandleRollout = (_, percentage) => {
  return percentage > 0;
};

export function validateFeatureFlagTargetingFilter(
  filter: FeatureFlagTargetingFilter,
  options: FeatureFlagCustomFilterValidatorOptions,
  handleRollout: FeatureFlagHandleRollout = defaultHandleRollout
): boolean {
  // The options is currently tested against both included and excluded audiences.
  // In future, more options can be added which are tested against either audiences.
  const { groups, users } = options;
  const { DefaultRolloutPercentage, Exclusion, Groups, Users } =
    filter.parameters.Audience;

  // 1. If user is excluded, return false.
  if (users.length > 0 && checkTargetingFilterInput(Exclusion?.Users, users)) {
    return false;
  }
  // 2. If group is excluded, return false
  if (
    groups.length > 0 &&
    checkTargetingFilterInput(Exclusion?.Groups, groups)
  ) {
    return false;
  }
  // 3. If user is included, return true.
  if (users.length > 0 && Users && Users.length > 0) {
    return checkTargetingFilterInput(Users, users);
  }
  // 4. If group is included, return true (partial rollout not implemented).
  if (groups.length > 0 && Groups && Groups.length > 0) {
    for (const Group of Groups) {
      if (groups.includes(Group.Name)) {
        return handleRollout(options.key, Group.RolloutPercentage, Group.Name);
      }
    }
    return false;
  }
  // 5 If default rollout is valid, return true (partial rollout not implemented).
  return handleRollout(options.key, DefaultRolloutPercentage, undefined);
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
