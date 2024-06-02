import type { FeatureFlagHandleRollout } from "../types.js";

/**
 * Handle rollout using controlled increment.
 */
const handleRolloutWithIncrement: FeatureFlagHandleRollout =
  generateHandleRolloutWithIncrement();

export default handleRolloutWithIncrement;

function generateHandleRolloutWithIncrement(): FeatureFlagHandleRollout {
  const infoMap = new Map<string, { ratio: number; total: number }>();
  const countMap = new Map<string, number>();

  return function handleRolloutWithIncrement(
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

    const mapKey = `${key}-.-${groupName}-.-${rolloutPercentage}`;
    if (!infoMap.has(mapKey)) {
      const result = createRatio(rolloutPercentage / 100);
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

function createRatio(fraction: number) {
  const len = fraction.toString().length - 2;
  const denominator = Math.pow(10, len);
  const numerator = fraction * denominator;
  const divisor = gcd(numerator, denominator);
  const ratio = Math.floor(numerator / divisor);
  const total = Math.floor(denominator / divisor);

  return { ratio, total };
}

function gcd(a: number, b: number) {
  if (b < 0.0000001) return a;

  return gcd(b, a % b);
}
