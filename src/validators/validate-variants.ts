import type {
  FeatureFlag,
  FeatureFlagAllocationPercentile,
  FeatureFlagVariant,
  FeatureFlagWithVariants,
  FeatureFlagWithVariantsValidateOptions,
} from "../types";

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
 * @throws if feature flag is invalid or does not
 */
export function validateFeatureFlagWithVariants(
  featureFlag: FeatureFlagWithVariants,
  options?: FeatureFlagWithVariantsValidateOptions
): FeatureFlagVariant {
  if (!featureFlag || featureFlag.variants.length < 1) {
    throw new ReferenceError("There are no variants in the Feature Flag.");
  }

  const { allocation, enabled, variants } = featureFlag;

  if (variants.length === 1) {
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
      options?.handleAllocate ??
      ((ps: FeatureFlagAllocationPercentile[]) => {
        let current: { variant: string; gap: number } | undefined = undefined;
        for (const p of ps) {
          const gap = p.to - p.from;
          if (!current || gap > current.gap) {
            current = { variant: p.variant, gap };
          }
        }
        return current!.variant;
      });

    const variantName = handleAllocate(allocation.percentile, allocation.seed);

    return getVariantFromVariantMap(variantMap, variantName);
  }

  return getVariantFromVariantMap(variantMap, allocation.default_when_enabled);
}

function getVariantFromVariantMap(
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

function verifyAllocationPercentile(
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

/**
    "percentile": [
      {
        "variant": "Off",
        "from": 0,
        "to": 50
      },
      {
        "variant": "On",
        "from": 50,
        "to": 90
      },
      {
        "variant": "Maybe",
        "from": 90,
        "to": 100
      }
    ],
 */
