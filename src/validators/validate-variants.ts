import { handleAllocateWithIncrement } from "../handlers/increment-allocate.js";
import type {
  FeatureFlag,
  FeatureFlagAllocationPercentile,
  FeatureFlagVariant,
  FeatureFlagWithVariants,
  FeatureFlagWithVariantsValidateOptions,
} from "../types.js";

/**
 * Check if the Feature flag is of type with-variants.
 */
export function checkIsFeatureFlagWithVariants(
  featureFlag: FeatureFlag
): featureFlag is FeatureFlagWithVariants {
  return "variants" in featureFlag;
}

/**
 * Validate the feature-flag object with variants and allocations.
 *
 * @param featureFlag Azure Feature Flag with Variants
 * @param options Options for validation
 * @returns the allocated variant
 */
export async function validateFeatureFlagWithVariants(
  featureFlag: FeatureFlagWithVariants,
  options?: FeatureFlagWithVariantsValidateOptions
): Promise<FeatureFlagVariant | null> {
  try {
    if (
      !featureFlag ||
      !featureFlag.variants ||
      featureFlag.variants.length < 1
    ) {
      throw new ReferenceError("There are no variants in the Feature Flag.");
    }

    const { allocation, enabled, variants } = featureFlag;

    if (variants.length === 1 || !allocation) {
      return variants[0]!;
    }

    const variantMap = new Map<string, FeatureFlagVariant>();
    for (const variant of variants) {
      variantMap.set(variant.name, variant);
    }

    if (!enabled) {
      return getVariantFromVariantMap(
        variantMap,
        allocation.default_when_disabled
      );
    }

    // Overrides - Users
    const users = options?.users ?? [];
    if (users.length > 0 && allocation.user && allocation.user.length > 0) {
      for (const allocUser of allocation.user) {
        if (allocUser.users.some((user) => users.includes(user))) {
          return getVariantFromVariantMap(variantMap, allocUser.variant);
        }
      }
    }

    // Overrides - Groups
    const groups = options?.groups ?? [];
    if (groups.length > 0 && allocation.group && allocation.group.length > 0) {
      for (const allocGroup of allocation.group) {
        if (allocGroup.groups.some((group) => groups.includes(group))) {
          return getVariantFromVariantMap(variantMap, allocGroup.variant);
        }
      }
    }

    // Allocate based on percentile
    if (allocation.percentile && allocation.percentile.length > 0) {
      verifyAllocationPercentile(allocation.percentile);

      const handleAllocate =
        options?.handleAllocate ?? handleAllocateWithIncrement;

      const variantName = await handleAllocate(
        featureFlag.id,
        allocation.percentile,
        allocation.seed
      );

      return getVariantFromVariantMap(variantMap, variantName);
    }

    return getVariantFromVariantMap(
      variantMap,
      allocation.default_when_enabled
    );
  } catch (error) {
    if (error instanceof Error) {
      options?.onError?.(error);
    }

    return null;
  }
}

export function getVariantFromVariantMap(
  variantMap: Map<string, FeatureFlagVariant>,
  name: string
): FeatureFlagVariant {
  const variant = variantMap.get(name);
  if (!variant) {
    throw new ReferenceError(
      `There is no variant in the Feature Flag matching name '${name}'.`
    );
  }

  return variant;
}

export function verifyAllocationPercentile(
  percentiles: FeatureFlagAllocationPercentile[]
): void {
  // Make sure allocations add up to 100
  let previewTo = 0;
  for (const percentile of percentiles) {
    if (percentile.from !== previewTo) {
      throw new RangeError(
        "'From' value of allocation should match 'To' value of previous allocation."
      );
    }
    previewTo = percentile.to;
  }
  if (previewTo !== 100) {
    throw new RangeError("All allocations do not add up to a complete 100%.");
  }
}
