import type { FeatureFlagWithVariants } from "../../src/types";
import { validateFeatureFlagWithVariants } from "../../src/validate";

export function VariantFlagHeader({
  featureFlag,
}: {
  featureFlag: FeatureFlagWithVariants;
}) {
  return (
    <span className="font-bold">
      [Variant] {featureFlag.displayName ?? featureFlag.id}
    </span>
  );
}

export function VariantFlagFooter({
  featureFlag,
}: {
  featureFlag: FeatureFlagWithVariants;
}) {
  try {
    const variant = validateFeatureFlagWithVariants(featureFlag);

    return (
      <>
        <p>
          Variant name: <span className="font-bold">{variant.name}</span>
        </p>
        <p>
          Variant value:{" "}
          <span className="font-bold">
            {JSON.stringify(variant.configuration_value)}
          </span>
        </p>
      </>
    );
  } catch (error) {
    return (
      <p className="text-red-500">
        {error instanceof Error ? error.message : String(error)}
      </p>
    );
  }
}
