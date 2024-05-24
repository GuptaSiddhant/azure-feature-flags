import type {
  FeatureFlagClientFilter,
  FeatureFlagTimeWindowFilter,
} from "../types.js";

export function checkIsTimeWindowClientFilter(
  filter: FeatureFlagClientFilter
): filter is FeatureFlagTimeWindowFilter {
  const parameters =
    filter?.name === "Microsoft.TimeWindow" && filter.parameters;
  if (typeof parameters !== "object") return false;

  const { Start, End } = parameters;
  if (!Start && !End) return false;

  if (
    (Start && typeof Start === "string") ||
    (End && typeof End === "string")
  ) {
    return true;
  }

  return false;
}

export function validateFeatureFlagTimeWindowFilter(
  filter: FeatureFlagTimeWindowFilter
): boolean {
  const { End, Start } = filter.parameters;
  const now = Date.now();
  if (
    (End && new Date(End).valueOf() < now) ||
    (Start && new Date(Start).valueOf() > now)
  ) {
    return false;
  }

  return true;
}
