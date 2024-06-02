import useHashChange from "../hooks/useHashChange";
import Card from "../ui/Card";
import { useFeatureFlag } from "../hooks/useFeatureFlag";
import { useReducer } from "react";
import {
  checkIsFeatureFlagWithFilters,
  checkIsFeatureFlagWithVariants,
} from "../../src/validate";
import { FilterFlagFooter, FilterFlagHeader } from "./FilterFlag";
import { VariantFlagFooter, VariantFlagHeader } from "./VariantFlag";

export default function FlagPage() {
  const flagId = useHashChange();
  const [seed, refresh] = useReducer((prev) => prev + 1, 0);
  const featureFlag = useFeatureFlag(flagId, seed);

  if (!featureFlag) {
    return (
      <Card className="md:row-[1_/_-1] md:col-[2]">
        <p className="font-bold">No flag selected</p>
        <p>Select a feature flag from the sidebar.</p>
      </Card>
    );
  }

  const isFilterFlag = checkIsFeatureFlagWithFilters(featureFlag);
  const isVariantFlag = checkIsFeatureFlagWithVariants(featureFlag);

  return (
    <>
      <Card className="md:row-[1] md:col-[2] flex-row justify-between">
        {isFilterFlag ? (
          <FilterFlagHeader featureFlag={featureFlag} />
        ) : isVariantFlag ? (
          <VariantFlagHeader featureFlag={featureFlag} />
        ) : (
          <span>[Unknown] {flagId}</span>
        )}

        {!flagId ? null : (
          <div className="flex gap-4 justify-end">
            <button type="button" className="cursor-pointer" onClick={refresh}>
              Refresh
            </button>
          </div>
        )}
      </Card>

      <Card className="md:row-[2] md:col-[2] h-full overflow-y-scroll">
        {featureFlag ? (
          <pre className="text-sm">{JSON.stringify(featureFlag, null, 2)}</pre>
        ) : (
          <span className="text-gray-500">
            JSON representation of the Feature Flag
          </span>
        )}
      </Card>

      <Card className="md:row-[3] md:col-[2] justify-center">
        {isFilterFlag ? (
          <FilterFlagFooter featureFlag={featureFlag} />
        ) : isVariantFlag ? (
          <VariantFlagFooter featureFlag={featureFlag} />
        ) : null}
      </Card>
    </>
  );
}
