/**
 * @module
 * This module contains functions to query and mutate
 * Azure App Configuration for feature flags.
 */

import {
  featureFlagContentType,
  featureFlagPrefix,
  parseFeatureFlag,
} from "@azure/app-configuration";
import type {
  AddConfigurationSettingParam,
  AppConfigurationClient,
  ConfigurationSettingParam,
} from "@azure/app-configuration";
import {
  invariantAppConfigurationClient,
  iterateAppConfigurationFeatureFlags,
} from "./utils/app-config.js";
import type {
  FeatureFlag,
  FeatureFlagsRecord,
  GetFeatureFlagsOptions,
} from "./types.js";

// Getters

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

export async function getFeatureFlagByKey(
  client: AppConfigurationClient,
  key: string,
  label?: string
): Promise<FeatureFlag | null> {
  invariantAppConfigurationClient(client, "getConfigurationSetting");

  if (!key) {
    throw new Error("Feature flag key is missing");
  }
  if (!key.startsWith(featureFlagPrefix)) {
    key = `${featureFlagPrefix}${key}`;
  }

  try {
    const setting = await client.getConfigurationSetting({ key, label });

    return parseFeatureFlag(setting).value as FeatureFlag;
  } catch (error) {
    return null;
  }
}

// Setter

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
