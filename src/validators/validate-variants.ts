import type {
  FeatureFlagVariant,
  FeatureFlagWithVariants,
  FeatureFlagWithVariantsValidateOptions,
} from "../types";

/**
 * Validate the feature-flag object with variants and allocations.
 *
 * @param featureFlag Azure Feature Flag with Variants
 * @param options Options for validation
 * @returns the allocated variant
 * @throws if feature flag is invalid or does not
 */
export default function validateFeatureFlagWithVariants(
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

/**

  "allocation": {
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

    "default_when_enabled": "Maybe",
    "default_when_disabled": "Maybe"
  },
 */
