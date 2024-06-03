import type { FeatureFlagHandleVariantAllocation } from "../types.js";
import { addNumbers, createRatioWithMultipleNumbers } from "../utils/math.js";

/**
 * Handle allocation of variants using controlled increment.
 */
export const handleAllocateWithIncrement: FeatureFlagHandleVariantAllocation =
  generateHandleAllocateWithIncrement();

function generateHandleAllocateWithIncrement(): FeatureFlagHandleVariantAllocation {
  const infoMap = new Map<string, { ratios: number[]; total: number }>();
  const countMap = new Map<string, number>();

  return function handleAllocateWithIncrement(key, percentiles, seed = 0) {
    const mapKey = `${key}-.-${seed}-.-${JSON.stringify(percentiles)}`;

    if (!infoMap.has(mapKey)) {
      const ratios = createRatioWithMultipleNumbers(
        percentiles.map((p) => p.to - p.from)
      );

      infoMap.set(mapKey, { ratios, total: addNumbers(ratios) });
    }

    const { ratios, total } = infoMap.get(mapKey)!;
    let count = countMap.get(mapKey) ?? 0;
    if (count === total) {
      count = 0;
    }

    let pIndex = 0;
    let previousRatio = 0;
    for (let index = 0; index < ratios.length; index++) {
      const ratio = ratios[index]!;
      if (count >= previousRatio && count < ratio + previousRatio) {
        countMap.set(mapKey, count + 1);
        pIndex = index;
        break;
      }

      previousRatio = ratio + previousRatio;
    }

    return percentiles[pIndex]!.variant;
  };
}
