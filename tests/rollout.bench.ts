import { bench, describe } from "vitest";
import {
  handleRolloutWithHash,
  handleRolloutWithIncrement,
} from "../src/rollout";

const flagKey = "test-flag";
const percentages = [10, 25, 50, 60, 100];

for (const percentage of percentages) {
  describe(`percentage: ${percentage}`, () => {
    bench("handleRolloutWithHash", () => {
      handleRolloutWithHash(flagKey, percentage);
    });
    bench("handleRolloutWithIncrement", () => {
      handleRolloutWithIncrement(flagKey, percentage);
    });
  });
}
