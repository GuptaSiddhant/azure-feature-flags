import type { FeatureFlagHandleRollout } from "../types.js";
import { sha1 } from "../utils/hash-sha-1.js";

/**
 * Handle rollout using crypto-hash.
 *
 * For a given flag-key and groupName, the function generates a static hash.
 * That hash is converted to a number and compare with rolloutPercentage
 *
 * @see https://spacecamp.launchdarkly.com/lesson-3/how-percentage-rollouts-work
 * @see https://github.com/launchdarkly/js-core/tree/main/packages/sdk/server-node
 */
export const handleRolloutWithHash: FeatureFlagHandleRollout =
  generateHandleRolloutWithHash();

function generateHandleRolloutWithHash(): FeatureFlagHandleRollout {
  const bucketMap = new Map<string, number>();

  return function handleRolloutWithHash(
    key,
    rolloutPercentage,
    groupName = "default"
  ) {
    if (rolloutPercentage === 100) {
      return true;
    }
    if (rolloutPercentage === 0) {
      return false;
    }

    const mapKey = `${key}-.-${groupName}`;
    if (!bucketMap.has(mapKey)) {
      const hex = sha1(mapKey);
      const value = Number.parseInt(hex.substring(0, 15), 16);
      const bucket = Math.round((value / 0xfffffffffffffff) * 100);
      bucketMap.set(mapKey, bucket);
    }

    const bucket = bucketMap.get(mapKey)!;
    return bucket > 100 - rolloutPercentage;
  };
}
