// @ts-check

import "dotenv/config";
import { AppConfigurationClientLite } from "../esm/client.js";
import { FeatureFlagService } from "../esm/index.js";

const connectionString = process.env.VITE_AZURE_CONNECTION_STRING;
if (!connectionString)
  throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

const client = new AppConfigurationClientLite(connectionString);
const service = new FeatureFlagService(client);

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
  set: () => service.set(flag),
  getList: () => service.getAllAsList(),
  getRecord: () => service.getAllAsRecord(),
  getByKey: () => service.getByKey(flag.id),
  delete: () => service.delete(flag.id),
};

const keys = Object.keys(operations);
const maxLength = keys.reduce((length, key) => Math.max(length, key.length), 0);

for (const key of keys) {
  const name = `\x1b[33m${key.padEnd(maxLength, " ")}\x1b[0m :`;
  console.log(name, JSON.stringify(await operations[key](), null, 0));
}
