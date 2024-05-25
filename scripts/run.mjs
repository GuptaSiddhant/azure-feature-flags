// @ts-check

import "dotenv/config";
import { AppConfigurationClient } from "@azure/app-configuration";
import {
  getFeatureFlagsList,
  getFeatureFlagByKey,
  getFeatureFlagsRecord,
} from "../esm/service.js";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
if (!connectionString)
  throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

const client = new AppConfigurationClient(connectionString);

const flags = await getFeatureFlagsList(client);
console.log(flags);

const flag = await getFeatureFlagByKey(client, flags[0].id);
console.log(flag);

/** @type {import("../esm/types.js").FeatureFlag} */
const newFlag = {
  id: "sad",
  enabled: true,
  conditions: {
    clientFilters: [
      {
        name: "Microsoft.TimeWindow",
        parameters: {},
      },
    ],
  },
};
