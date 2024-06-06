import type { FeatureFlagHandleRollout } from "../types.js";
import { createRatioFromFraction } from "../utils/math.js";

/**
 * Handle rollout using controlled increment.
 */
export const handleRolloutWithIncrement: FeatureFlagHandleRollout =
  generateHandleRolloutWithIncrement();

function generateHandleRolloutWithIncrement(): FeatureFlagHandleRollout {
  const infoMap = new Map<string, { ratio: number; total: number }>();
  const countMap = new Map<string, number>();

  return function handleRolloutWithIncrement(
    key,
    rolloutPercentage,
    groupName = "default"
  ) {
    const mapKey = `${key}-.-${groupName}-.-${rolloutPercentage}`;
    if (!infoMap.has(mapKey)) {
      const result = createRatioFromFraction(rolloutPercentage / 100);
      infoMap.set(mapKey, result);
    }

    const { ratio, total } = infoMap.get(mapKey)!;

    let count = countMap.get(mapKey) ?? 0;
    if (count === total) {
      count = 0;
    }

    countMap.set(mapKey, count + 1);

    return count < ratio;
  };
}
