import { describe, it, expect } from "vitest";
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags, fetchFeatureFlagByKey } from "../src/service";

describe.skip("fetchFeatureFlags", () => {
  it("should fetch", async () => {
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
  it("should fetch", async () => {
    const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
    if (!connectionString)
      throw new Error("AZURE_CONFIG_ACCESS_STRING env missing");

    const client = new AppConfigurationClient(connectionString);
    const flag = await fetchFeatureFlagByKey(
      client,
      ".appconfig.featureflag/testFlag2"
    );
    console.log(flag);

    expect(flag).not.toEqual({});
  });
});
