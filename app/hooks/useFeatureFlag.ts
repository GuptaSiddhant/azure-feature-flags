import { useEffect, useState } from "react";
import { type FeatureFlag } from "../../src";
import { useFeatureFlagService } from "../contexts";
import { NEW_FLAG_HASH } from "../constants";

export function useFeatureFlag(flagId: string | undefined, seed?: number) {
  const service = useFeatureFlagService();
  const [featureFlag, setFeatureFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    if (!flagId || flagId === NEW_FLAG_HASH) {
      setFeatureFlag(null);
      return;
    }

    const controller = new AbortController();

    service
      .getByKey(flagId, { abortSignal: controller.signal })
      .then(setFeatureFlag);

    return () => {
      controller.abort();
    };
  }, [service, flagId, seed]);

  return featureFlag;
}

export function useFeatureFlags(seed?: number) {
  const service = useFeatureFlagService();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    service
      .getAllAsList({ abortSignal: controller.signal })
      .then(setFeatureFlags);

    return () => {
      controller.abort();
    };
  }, [service, seed]);

  return featureFlags;
}
