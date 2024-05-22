import { featureFlagPrefix } from "@azure/app-configuration";
import type { AzureAppConfiguration } from "@azure/app-configuration-provider";
import type { TokenCredential } from "@azure/core-auth";
import { load } from "@azure/app-configuration-provider";
import type { FeatureFlagsRecord } from "./types.ts";

export async function fetchFeatureFlags(
  endpoint: URL | string,
  credential: TokenCredential
): Promise<FeatureFlagsRecord>;
export async function fetchFeatureFlags(
  connectionString: string
): Promise<FeatureFlagsRecord>;
export async function fetchFeatureFlags(
  param1: string | URL,
  param2?: TokenCredential
) {
  const options: Parameters<typeof load>["2"] = {
    selectors: [{ keyFilter: `${featureFlagPrefix}*` }],
    trimKeyPrefixes: [featureFlagPrefix],
  };

  let config: AzureAppConfiguration;
  if (!param2) {
    config = await load(param1.toString(), options);
  } else {
    config = await load(param1, param2, options);
  }

  return Object.fromEntries(config.entries());
}
