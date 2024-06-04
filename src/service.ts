/**
 * @module
 * This module contains functions to query and mutate
 * Azure App Configuration for feature flags.
 */

import type {
  AddConfigurationSettingParam,
  AppConfigurationClient,
} from "@azure/app-configuration";
import {
  extractFeatureFlagFromSetting,
  invariantAppConfigurationClient,
  iterateAppConfigurationFeatureFlags,
  featureFlagContentType,
  featureFlagPrefix,
} from "./utils/app-config.js";
import type {
  GetFeatureFlagsOptions,
  SetFeatureFlagOptions,
  GetFeatureFlagByKeyOptions,
} from "./utils/app-config.js";
import type { FeatureFlag, FeatureFlagsRecord } from "./types.js";

export type { FeatureFlag, FeatureFlagsRecord } from "./types.js";
export type {
  GetFeatureFlagsOptions,
  GetFeatureFlagByKeyOptions,
  SetFeatureFlagOptions,
} from "./utils/app-config.js";

/**
 * Fetch all feature flags related settings from Azure App Configuration
 * and parse them to a record/object.
 *
 * @example
 * ```ts
 * const featureFlags = await getFeatureFlagsRecord(client);
 * ```
 */
export async function getFeatureFlagsRecord(
  client: AppConfigurationClient,
  options: GetFeatureFlagsOptions = {}
): Promise<FeatureFlagsRecord> {
  invariantAppConfigurationClient(client, "listConfigurationSettings");

  const record: FeatureFlagsRecord = {};
  await iterateAppConfigurationFeatureFlags(client, options, (featureFlag) => {
    record[featureFlag.id] = featureFlag;
  });

  return record;
}

/**
 * Fetch all feature flags related settings from Azure App Configuration
 * and parse them to a list/array.
 *
 * @example
 * ```ts
 * const featureFlags = await getFeatureFlagsList(client);
 * ```
 */
export async function getFeatureFlagsList(
  client: AppConfigurationClient,
  options: GetFeatureFlagsOptions = {}
): Promise<FeatureFlag[]> {
  invariantAppConfigurationClient(client, "listConfigurationSettings");

  const list: FeatureFlag[] = [];
  await iterateAppConfigurationFeatureFlags(client, options, (featureFlag) =>
    list.push(featureFlag)
  );

  return list;
}

/**
 * Fetch single feature flag related setting from Azure App Configuration
 * by its key/id and parse it.
 *
 * @example
 * ```ts
 * const featureFlagKey = "your-feature-flag-key";
 * const featureFlag = await getFeatureFlagByKey(client, featureFlagKey);
 * ```
 */
export async function getFeatureFlagByKey(
  client: AppConfigurationClient,
  key: string,
  options?: GetFeatureFlagByKeyOptions
): Promise<FeatureFlag | null> {
  invariantAppConfigurationClient(client, "getConfigurationSetting");

  if (!key) {
    throw new Error("Feature flag key is missing");
  }
  if (!key.startsWith(featureFlagPrefix)) {
    key = `${featureFlagPrefix}${key}`;
  }

  try {
    const setting = await client.getConfigurationSetting(
      { key, label: options?.label },
      options
    );

    return extractFeatureFlagFromSetting(setting);
  } catch (error) {
    return null;
  }
}

/**
 * Add new or update existing feature flags related settings
 * to Azure App Configuration.
 *
 * @example
 * ```ts
 * const featureFlag: FeatureFlag = {
 *   id: "your-feature-flag-id",
 *   enabled: true,
 *   conditions: { client_filters: [] },
 * };
 * const success: boolean = await setFeatureFlag(client, featureFlag);
 * ```
 */
export async function setFeatureFlag(
  client: AppConfigurationClient,
  featureFlag: FeatureFlag,
  options?: SetFeatureFlagOptions
): Promise<boolean> {
  invariantAppConfigurationClient(client, "addConfigurationSetting");
  invariantAppConfigurationClient(client, "setConfigurationSetting");

  const key = `${featureFlagPrefix}${featureFlag.id}`;
  try {
    const setting = await client.getConfigurationSetting({ key });
    Object.assign(setting, options);
    setting.value = JSON.stringify(featureFlag);
    await client.setConfigurationSetting(setting);

    return true;
  } catch {
    try {
      const setting: AddConfigurationSettingParam = {
        ...options,
        key,
        value: JSON.stringify(featureFlag),
        contentType: featureFlagContentType,
      };
      await client.addConfigurationSetting(setting);

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Delete existing feature flags related settings
 * from Azure App Configuration.
 *  * @example
 * ```ts
 * const featureFlagKey = "your-feature-flag-key";
 * const success: boolean = await deleteFeatureFlag(client, featureFlagKey);
 * ```
 */
export async function deleteFeatureFlag(
  client: AppConfigurationClient,
  key: string,
  label?: string
): Promise<boolean> {
  invariantAppConfigurationClient(client, "deleteConfigurationSetting");

  if (!key.startsWith(featureFlagPrefix)) {
    key = `${featureFlagPrefix}${key}`;
  }

  try {
    await client.deleteConfigurationSetting({ key, label });

    return true;
  } catch {
    return false;
  }
}
