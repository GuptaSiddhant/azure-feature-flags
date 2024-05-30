import {
  type AppConfigurationClient,
  featureFlagPrefix,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { FeatureFlag, GetFeatureFlagsOptions } from "../types.js";

export function invariantAppConfigurationClient(
  client: unknown,
  method: keyof AppConfigurationClient
): client is AppConfigurationClient {
  if (!client || typeof client !== "object" || !(method in client)) {
    throw new Error("'client' is not valid Azure AppConfigurationClient");
  }

  return true;
}

export async function iterateAppConfigurationFeatureFlags(
  client: AppConfigurationClient,
  options: GetFeatureFlagsOptions = {},
  onFound: (flag: FeatureFlag) => void
): Promise<void> {
  Object.assign(options, { keyFilter: `${featureFlagPrefix}*` });
  const iterator = client.listConfigurationSettings(options);

  for await (const entry of iterator) {
    try {
      const featureFlag = parseFeatureFlag(entry).value;
      if (featureFlag?.id) {
        onFound(featureFlag as FeatureFlag);
      }
    } catch {}
  }
}
