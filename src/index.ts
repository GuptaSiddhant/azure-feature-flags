/* c8 ignore start */

import {
  deleteFeatureFlag,
  getFeatureFlagByKey,
  getFeatureFlagsList,
  getFeatureFlagsRecord,
  setFeatureFlag,
} from "./service.js";
import type {
  AppConfigurationClient,
  FeatureFlagServiceOptions,
} from "./utils/app-config.js";
import { invariantAppConfigurationClient } from "./utils/app-config.js";
import { validateFeatureFlag } from "./validate.js";
import type {
  FeatureFlag,
  FeatureFlagVariant,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagWithVariantsValidateOptions,
  FeatureFlagsRecord,
} from "./types.js";
import { AppConfigurationClientLite } from "./client.js";

/**
 * @module
 * This module exports the FeatureFlagService class which creates
 * an service instance. It can be used to query, set, delete flags.
 * Also it can be used to validate the flags.
 */

export type { FeatureFlagServiceOptions } from "./utils/app-config.js";
export type {
  FeatureFlag,
  FeatureFlagsRecord,
  FeatureFlagVariant,
  FeatureFlagVariantName,
  FeatureFlagWithFiltersValidateOptions,
  FeatureFlagWithVariantsValidateOptions,
} from "./types.js";

/**
 * Class based service for all Azure FeatureFlag.
 *
 * @example
 * ```ts
 * import { AppConfigurationClientLite } from "azure-feature-flags/client";
 * import { FeatureFlagService } from "azure-feature-flags"
 *
 * const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
 * const client = new AppConfigurationClientLite(connectionString);
 * const service = new FeatureFlagService(client);
 *
 * const created = await service.set({ id: "flag-id", enabled: true });
 * const featureFlagsRecord = await service.getAllAsRecord();
 * const featureFlagsList = await service.getAllAsList();
 * const featureFlag = await service.getByKey("flag-id");
 * const enabledOrVariant = await service.getByKeyAndValidate("flag-id", { groups: ["admin"] });
 * const deleted = await service.delete("flag-id")
 * ```
 */
export class FeatureFlagService {
  #client: AppConfigurationClient | AppConfigurationClientLite;
  constructor(client: AppConfigurationClientLite | AppConfigurationClient) {
    if (client instanceof AppConfigurationClientLite) {
      this.#client = client;
    } else {
      invariantAppConfigurationClient(client, "listConfigurationSettings");
      this.#client = client;
    }
  }

  async getAllAsRecord(
    options?: FeatureFlagServiceOptions
  ): Promise<FeatureFlagsRecord> {
    return await getFeatureFlagsRecord(this.#client, options);
  }

  async getAllAsList(
    options?: FeatureFlagServiceOptions
  ): Promise<FeatureFlag[]> {
    return await getFeatureFlagsList(this.#client, options);
  }

  async getByKey(
    key: string,
    options?: FeatureFlagServiceOptions
  ): Promise<FeatureFlag | null> {
    return await getFeatureFlagByKey(this.#client, key, options);
  }

  async set(
    featureFlag: FeatureFlag,
    options?: FeatureFlagServiceOptions
  ): Promise<boolean> {
    return await setFeatureFlag(this.#client, featureFlag, options);
  }

  async delete(key: string, label?: string): Promise<boolean> {
    return await deleteFeatureFlag(this.#client, key, label);
  }

  async getByKeyAndValidate(
    key: string,
    options:
      | FeatureFlagWithFiltersValidateOptions
      | FeatureFlagWithVariantsValidateOptions
  ): Promise<boolean | FeatureFlagVariant> {
    const featureFlag = await this.getByKey(key);

    return await validateFeatureFlag(featureFlag, options);
  }
}
