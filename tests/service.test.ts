import { describe, it, expect } from "vitest";
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags, fetchFeatureFlagByKey } from "../src/service";

describe.skip("fetchFeatureFlags", () => {
  it("should fetch all flags", async () => {
    const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
    if (!connectionString)
      throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

    const client = new AppConfigurationClient(connectionString);
    const flags = await fetchFeatureFlags(client);
    console.log(flags);

    expect(flags).not.toEqual({});
  });
});

describe.skip("fetchFeatureFlagByKey", () => {
  it("should fetch a flag with key", async () => {
    const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
    if (!connectionString)
      throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

    const key = ".appconfig.featureflag/testFlag2";
    const client = new AppConfigurationClient(connectionString);
    const flag = await fetchFeatureFlagByKey(client, key);
    console.log(flag);

    expect(flag).not.toEqual({});
  });
});
