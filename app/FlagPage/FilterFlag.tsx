import { FeatureFlagWithFilters } from "../../src/types";
import { validateFeatureFlagWithFilters } from "../../src/validate";

export function FilterFlagHeader({
  featureFlag,
}: {
  featureFlag: FeatureFlagWithFilters;
}) {
  return (
    <span className="font-bold">
      [Filters] {featureFlag.displayName ?? featureFlag.id}
    </span>
  );
}

export function FilterFlagFooter({
  featureFlag,
}: {
  featureFlag: FeatureFlagWithFilters;
}) {
  const isEnabled = validateFeatureFlagWithFilters(featureFlag);

  return (
    <p>
      Enabled:{" "}
      <code className={isEnabled ? "text-green-500" : "text-red-500"}>
        {isEnabled ? "True" : "False"}
      </code>
    </p>
  );
}
