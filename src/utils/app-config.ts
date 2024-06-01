import {
  type AppConfigurationClient,
  type ConfigurationSetting,
  featureFlagPrefix,
  isFeatureFlag,
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

  for await (const setting of iterator) {
    try {
      onFound(extractFeatureFlagFromSetting(setting));
    } catch {}
  }
}

export function extractFeatureFlagFromSetting(
  setting: ConfigurationSetting
): FeatureFlag {
  if (!isFeatureFlag(setting)) {
    throw TypeError(
      `Setting with key ${setting.key} is not a valid FeatureFlag, make sure to have the correct content-type and a valid non-null value.`
    );
  }

  const json: unknown = JSON.parse(setting.value);

  if (
    !json ||
    typeof json !== "object" ||
    !("id" in json) ||
    !("enabled" in json)
  ) {
    throw TypeError("Invalid Feature Flag");
  }

  if (setting.key !== `${featureFlagPrefix}${json.id}`) {
    json.id = setting.key.replace(featureFlagPrefix, "");
    (json as any).displayName = json.id;
  }

  return json as FeatureFlag;
}
