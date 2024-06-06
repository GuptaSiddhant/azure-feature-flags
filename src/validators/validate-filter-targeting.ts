import { handleRolloutWithHash } from "../handlers/rollout-hash.js";
import type {
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlagClientFilter,
  FeatureFlagTargetingFilter,
  FeatureFlagHandleRollout,
} from "../types.js";

export function checkIsTargetingClientFilter(
  filter: FeatureFlagClientFilter
): filter is FeatureFlagTargetingFilter {
  const Audience =
    filter?.name === "Microsoft.Targeting" &&
    filter.parameters &&
    filter.parameters["Audience"];

  return typeof Audience === "object";
}

export async function validateFeatureFlagTargetingFilter(
  filter: FeatureFlagTargetingFilter,
  options: FeatureFlagCustomFilterValidatorOptions,
  handleRollout: FeatureFlagHandleRollout = handleRolloutWithHash
): Promise<boolean> {
  const { groups, users, ignoreCase } = options;
  const {
    DefaultRolloutPercentage = 0,
    Exclusion,
    Groups,
    Users,
  } = filter.parameters.Audience;

  if (Exclusion) {
    // 1. If user is excluded, return false.
    if (
      users.length > 0 &&
      Exclusion.Users &&
      Exclusion.Users.length > 0 &&
      compareStringLists(Exclusion.Users, users, ignoreCase)
    ) {
      return false;
    }
    // 2. If group is excluded, return false
    if (
      groups.length > 0 &&
      Exclusion.Groups &&
      Exclusion.Groups.length > 0 &&
      compareStringLists(Exclusion.Groups, groups, ignoreCase)
    ) {
      return false;
    }
  }
  // 3. If user is included, return true.
  if (
    users.length > 0 &&
    Users &&
    Users.length > 0 &&
    compareStringLists(Users, users, ignoreCase)
  ) {
    return true;
  }
  // 4. If group is included, return true.
  if (groups.length > 0 && Groups && Groups.length > 0) {
    for (const Group of Groups) {
      if (compareStringLists([Group.Name], groups, ignoreCase)) {
        if (Group.RolloutPercentage === 100) return true;
        if (Group.RolloutPercentage === 0) return false;
        const rolloutId = generateRolloutId(options.key, Group.Name, users);
        return await handleRollout(rolloutId, Group.RolloutPercentage);
      }
    }
  }
  // 5 return result of default rollout
  if (DefaultRolloutPercentage === 100) return true;
  if (DefaultRolloutPercentage === 0) return false;
  const rolloutId = generateRolloutId(options.key, "-Default-", users);
  return await handleRollout(rolloutId, DefaultRolloutPercentage);
}

function generateRolloutId(key: string, groupName: string, users?: string[]) {
  return [key, groupName, users?.join(",")].filter(Boolean).join("=|=");
}

function compareStringLists(
  audiences: string[],
  inputs: string[],
  ignoreCase: boolean
): boolean {
  if (ignoreCase) {
    const lowercaseInputs = inputs.map((input) => input.toLowerCase());
    return audiences.some((audience) =>
      lowercaseInputs.includes(audience.toLowerCase())
    );
  }

  return audiences.some((audience) => inputs.includes(audience));
}
