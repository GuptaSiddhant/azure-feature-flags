/* c8 ignore start */

/**
 * @module
 * This module contains all the functions exported by the package.
 *
 * It is recommended to import functions from their respective modules
 * for better tree-shaking and smaller bundle size.
 */

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
  FeatureFlagWithFiltersValidateOptions as FeatureFlagValidateOptions,
  FeatureFlagClientFilter,
  FeatureFlagCustomFilterValidatorOptions,
  FeatureFlagHandleRollout,
  FeatureFlagTargetingFilter,
  FeatureFlagTimeWindowFilter,
} from "./types.js";
