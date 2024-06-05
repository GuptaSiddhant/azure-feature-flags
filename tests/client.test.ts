import { describe, it, expect } from "vitest";
import { AppConfigurationClientLite } from "../src/client";
import { dummyFeatureFlag } from "./azure-client.mock";

it.skip("test", async () => {
  const connectionString = process.env.VITE_AZURE_CONNECTION_STRING!;
  const client = new AppConfigurationClientLite(connectionString);
  const flags = await client.set({
    key: ".appconfig.featureflag/feature",
    isReadOnly: false,
    value: JSON.stringify(dummyFeatureFlag),
  });
  console.log(flags);
  return;
});
