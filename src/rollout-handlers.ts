import { sha1 } from "./sha-1.js";
import type { FeatureFlagHandleRollout } from "./types.js";

/**
 * Handle rollout using crypto-hash.
 *
 * For a given flag-key and groupName, the function generates a static hash.
 * That hash is converted to a number and compare with rolloutPercentage
 *
 * @see https://spacecamp.launchdarkly.com/lesson-3/how-percentage-rollouts-work
 * @see https://github.com/launchdarkly/js-core/tree/main/packages/sdk/server-node
 */
export const handleRolloutWithHash: FeatureFlagHandleRollout = (
  key,
  rolloutPercentage,
  groupName = "default"
) => {
  const hashKey = `${key}-.-${groupName}`;
  const hex = sha1(hashKey);
  const hashVal = Number.parseInt(hex.substring(0, 15), 16);
  const bucket = Math.round((hashVal / 0xfffffffffffffff) * 100);

  return bucket > 100 - rolloutPercentage;
};
