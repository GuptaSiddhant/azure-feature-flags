import type { FeatureFlagHandleRollout } from "../types.js";
import { sha256 } from "../utils/hash-sha256.js";

/**
 * Handle rollout using hash.
 *
 * The method is JS-implementation of Azure's method used in DonNet FeatureManagement SDK
 * @see https://github.com/microsoft/FeatureManagement-Dotnet/blob/5c26df69b6f318cbf68d7c1050cb3e9f705c0ec8/src/Microsoft.FeatureManagement/Targeting/ContextualTargetingFilter.cs#L142
 */
export const handleRolloutWithHash: FeatureFlagHandleRollout = async (
  rolloutId,
  rolloutPercentage
) => {
  const contextPercentage = await calcContextPercentage(rolloutId);

  return contextPercentage < rolloutPercentage;
};

export async function calcContextPercentage(rolloutId: string) {
  const hex = await sha256(rolloutId, "hex");
  const value = Number.parseInt(hex.substring(0, 15), 16);

  return Math.round((value / 0xfffffffffffffff) * 100);
}
