import { useEffect, useState } from "react";
import {
  type FeatureFlag,
  getFeatureFlagByKey,
  getFeatureFlagsList,
} from "../../src";
import { NEW_FLAG_HASH } from "../constants";
import { useAzureClientContext } from "../contexts";

export function useFeatureFlag(flagId: string | undefined, seed?: number) {
  const client = useAzureClientContext();
  const [featureFlag, setFeatureFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    if (!flagId || flagId === NEW_FLAG_HASH) {
      setFeatureFlag(null);
      return;
    }

    const controller = new AbortController();

    getFeatureFlagByKey(client, flagId, {
      abortSignal: controller.signal,
    }).then(setFeatureFlag);

    return () => {
      controller.abort();
    };
  }, [client, flagId, seed]);

  return featureFlag;
}

export function useFeatureFlags(seed?: number) {
  const client = useAzureClientContext();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getFeatureFlagsList(client, {
      abortSignal: controller.signal,
    }).then(setFeatureFlags);

    return () => {
      controller.abort();
    };
  }, [client, seed]);

  return featureFlags;
}
