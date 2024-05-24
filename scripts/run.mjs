import "dotenv/config";
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags, fetchFeatureFlagByKey } from "../esm/service.js";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
if (!connectionString)
  throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

const client = new AppConfigurationClient(connectionString);

const flags = await fetchFeatureFlags(client);
console.log(flags);

const keys = Object.keys(flags);
const flag = await fetchFeatureFlagByKey(client, keys[0]);
console.log(flag);
