/* c8 ignore start */

/**
 * @module
 * This module contains all the functions exported by the package.
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

export type * from "./types.js";
