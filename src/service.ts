/**
 * @module
 * This module contains functions to query and mutate
 * Azure App Configuration for feature flags.
 */

import {
  extractFeatureFlagFromSetting,
  invariantAppConfigurationClient,
  iterateAppConfigurationFeatureFlags,
  featureFlagContentType,
  featureFlagPrefix,
} from "./utils/app-config.js";
import type {
  FeatureFlagServiceOptions,
  ConfigurationSetting,
  AppConfigurationClient,
} from "./utils/app-config.js";
import type { FeatureFlag, FeatureFlagsRecord } from "./types.js";
import { AppConfigurationClientLite } from "./client.js";

export type { FeatureFlag, FeatureFlagsRecord } from "./types.js";
export type { FeatureFlagServiceOptions } from "./utils/app-config.js";

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
  client: AppConfigurationClientLite | AppConfigurationClient,
  options: FeatureFlagServiceOptions = {}
): Promise<FeatureFlagsRecord> {
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
  client: AppConfigurationClientLite | AppConfigurationClient,
  options: FeatureFlagServiceOptions = {}
): Promise<FeatureFlag[]> {
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
  client: AppConfigurationClientLite | AppConfigurationClient,
  key: string,
  options?: FeatureFlagServiceOptions
): Promise<FeatureFlag | null> {
  if (!key) {
    throw new Error("Feature flag key is missing");
  }

  if (client instanceof AppConfigurationClientLite) {
    try {
      const setting = await client.get({
        ...options,
        keyFilter: key,
        labelFilter: options?.labelFilter,
      });

      return setting ? extractFeatureFlagFromSetting(setting) : null;
    } catch {
      return null;
    }
  }

  invariantAppConfigurationClient(client, "getConfigurationSetting");

  if (!key.startsWith(featureFlagPrefix)) {
    key = `${featureFlagPrefix}${key}`;
  }

  try {
    const setting = await client.getConfigurationSetting(
      { key, label: options?.labelFilter },
      options
    );

    return extractFeatureFlagFromSetting(setting);
  } catch {
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
  client: AppConfigurationClientLite | AppConfigurationClient,
  featureFlag: FeatureFlag,
  options?: FeatureFlagServiceOptions
): Promise<boolean> {
  if (client instanceof AppConfigurationClientLite) {
    const setting: ConfigurationSetting = await client
      .get({ keyFilter: featureFlag.id })
      .then((setting) => {
        if (!setting) throw new Error();
        return {
          ...setting,
          ...options,
          value: JSON.stringify(featureFlag),
        };
      })
      .catch(() => ({
        ...options,
        key: `${featureFlagPrefix}${featureFlag.id}`,
        value: JSON.stringify(featureFlag),
        contentType: featureFlagContentType,
        isReadOnly: false,
      }));

    try {
      await client.set(setting);
      return true;
    } catch {
      return false;
    }
  }

  invariantAppConfigurationClient(client, "setConfigurationSetting");

  const key = `${featureFlagPrefix}${featureFlag.id}`;

  try {
    const setting: ConfigurationSetting = await client
      .getConfigurationSetting({ key })
      .then((setting) => {
        if (!setting) throw new Error();
        return {
          ...setting,
          ...options,
          value: JSON.stringify(featureFlag),
        };
      })
      .catch(() => ({
        ...options,
        key,
        value: JSON.stringify(featureFlag),
        contentType: featureFlagContentType,
        isReadOnly: false,
      }));

    await client.setConfigurationSetting(setting);

    return true;
  } catch {
    return false;
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
  client: AppConfigurationClientLite | AppConfigurationClient,
  key: string,
  label?: string
): Promise<boolean> {
  if (client instanceof AppConfigurationClientLite) {
    try {
      await client.delete({ keyFilter: key, labelFilter: label });

      return true;
    } catch {
      return false;
    }
  }

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
