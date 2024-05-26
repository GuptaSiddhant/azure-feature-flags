/* c8 ignore start */

export {
  getFeatureFlagByKey,
  getFeatureFlagsRecord,
  getFeatureFlagsList,
  setFeatureFlag,
  deleteFeatureFlag,
} from "./service.js";

export { validateFeatureFlag } from "./validate.js";

export {
  handleRolloutWithHash,
  handleRolloutWithIncrement,
} from "./rollout.js";

export type {
  FeatureFlag,
  FeatureFlagsRecord,
  FeatureFlagCustomFilter,
  FeatureFlagCustomFilterValidator,
  FeatureFlagCustomFilterValidators,
  FeatureFlagValidateOptions,
} from "./types.js";
