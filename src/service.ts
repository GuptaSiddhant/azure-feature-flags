import {
  AppConfigurationClient,
  featureFlagPrefix,
  parseFeatureFlag,
} from "@azure/app-configuration";
import type { FeatureFlag, FeatureFlagsRecord } from "./types.js";

export async function fetchFeatureFlags(
  client: AppConfigurationClient
): Promise<FeatureFlagsRecord> {
  if (!(client instanceof AppConfigurationClient)) {
    throw new Error("'client' is not valid Azure AppConfigurationClient");
  }

  const iterator = client.listConfigurationSettings({
    keyFilter: `${featureFlagPrefix}*`,
  });

  const record: FeatureFlagsRecord = {};

  let done = false;
  while (!done) {
    const entry = await iterator.next();
    if (entry.done) {
      done = true;
      break;
    }
    try {
      const featureFlag = parseFeatureFlag(entry.value).value as FeatureFlag;
      record[featureFlag.id] = featureFlag;
    } catch {}
  }

  return record;
}

export async function fetchFeatureFlagByKey(
  client: AppConfigurationClient,
  key: string
): Promise<FeatureFlag | null> {
  if (!(client instanceof AppConfigurationClient)) {
    throw new Error("'client' is not valid Azure AppConfigurationClient");
  }
  if (!key) {
    throw new Error("Feature flag 'key' is missing");
  }
  if (!key.startsWith(featureFlagPrefix)) {
    key = `${featureFlagPrefix}${key}`;
  }

  try {
    const response = await client.getConfigurationSetting({ key });
    if (response && typeof response === "object" && response.value) {
      return JSON.parse(response.value);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    return null;
  }
}
