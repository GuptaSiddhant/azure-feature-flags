// @ts-check

import "dotenv/config";
import { AppConfigurationClient } from "@azure/app-configuration";
import {
  getFeatureFlagsList,
  getFeatureFlagsRecord,
  getFeatureFlagByKey,
  setFeatureFlag,
  deleteFeatureFlag,
} from "../esm/service.js";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
if (!connectionString)
  throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

const client = new AppConfigurationClient(connectionString);

/** @type {import("../esm/types.js").FeatureFlag} */
const flag = {
  id: "test-flag",
  enabled: false,
  conditions: {
    client_filters: [
      {
        name: "Microsoft.Targeting",
        parameters: {
          Audience: { DefaultRolloutPercentage: 50 },
        },
      },
    ],
  },
};

const operations = {
  setFeatureFlag: () => setFeatureFlag(client, flag),
  getFeatureFlagsList: () => getFeatureFlagsList(client),
  getFeatureFlagsRecord: () => getFeatureFlagsRecord(client),
  getFeatureFlagByKey: () => getFeatureFlagByKey(client, flag.id),
  deleteFeatureFlag: () => deleteFeatureFlag(client, flag.id),
};

const keys = Object.keys(operations);
const maxLength = keys.reduce((length, key) => Math.max(length, key.length), 0);

for (const key of keys) {
  const name = `\x1b[33m${key.padEnd(maxLength, " ")}\x1b[0m :`;
  console.log(name, JSON.stringify(await operations[key](), null, 0));
}
