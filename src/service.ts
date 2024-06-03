/**
 * @module
 * This module contains functions to query and mutate
 * Azure App Configuration for feature flags.
 */

import {
  featureFlagContentType,
  featureFlagPrefix,
} from "@azure/app-configuration";
import type {
  AddConfigurationSettingParam,
  AppConfigurationClient,
  ConfigurationSettingParam,
  GetConfigurationSettingOptions,
} from "@azure/app-configuration";
import {
  type GetFeatureFlagsOptions,
  extractFeatureFlagFromSetting,
  invariantAppConfigurationClient,
  iterateAppConfigurationFeatureFlags,
} from "./utils/app-config.js";
import type { FeatureFlag, FeatureFlagsRecord } from "./types.js";

// Getters

/**
 * Fetch all feature flags related settings from Azure App Configuration
 * and parse them to a record/object.
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
 */
export async function getFeatureFlagByKey(
  client: AppConfigurationClient,
  key: string,
  options?: GetConfigurationSettingOptions & { label?: string }
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

// Setter

/**
 * Add new or update existing feature flags related settings
 * to Azure App Configuration.
 */
export async function setFeatureFlag(
  client: AppConfigurationClient,
  featureFlag: FeatureFlag,
  options: Omit<ConfigurationSettingParam, "key" | "value" | "contentType"> = {}
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

// Delete-er

/**
 * Delete existing feature flags related settings
 * from Azure App Configuration.
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
