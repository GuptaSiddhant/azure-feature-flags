import type { FeatureFlagHandleRollout } from "../types.js";

const map = new Map<string, { a: number; b: number }>();
const defaultState = { a: 0, b: 0 };

const increment = (key: string, value: boolean) => {
  const state = map.get(key) ?? defaultState;
  const newState = {
    a: state.a + (value ? 1 : 0),
    b: state.b + (value ? 0 : 1),
  };
  map.set(key, newState);

  return value;
};

/**
 * Handle rollout using controlled increment.
 */
export const handleRolloutWithIncrement: FeatureFlagHandleRollout = (
  key,
  rolloutPercentage,
  groupName = "default"
) => {
  const mapKey = `${key}-.-${groupName}-.-${rolloutPercentage}`;
  if (rolloutPercentage === 100) {
    return true;
  }
  if (rolloutPercentage === 0) {
    return false;
  }

  const limit = doFraction(rolloutPercentage / 100);
  const total = limit.a + limit.b;

  const { a, b } = map.get(mapKey) ?? defaultState;

  if (a + b === total) {
    map.set(mapKey, defaultState); // reset counting
  }

  if (a === 0 && limit.a > 0) {
    return increment(mapKey, true);
  }

  if (a % limit.a === 0) {
    if (b === 0) {
      return increment(mapKey, false);
    }

    if (b % limit.b === 0) {
      return increment(mapKey, true);
    }

    return increment(mapKey, false);
  }

  return increment(mapKey, true);
};

function doFraction(fraction: number) {
  const len = fraction.toString().length - 2;
  const denominator = Math.pow(10, len);
  const numerator = fraction * denominator;
  const divisor = gcd(numerator, denominator);
  const a = Math.floor(numerator / divisor);
  const b = Math.floor(denominator / divisor);

  return { a, b: b - a };
}

function gcd(a: number, b: number) {
  if (b < 0.0000001) return a;

  return gcd(b, a % b);
}
