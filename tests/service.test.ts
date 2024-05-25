import { describe, it, expect } from "vitest";
import {
  getFeatureFlagByKey,
  getFeatureFlagsList,
  getFeatureFlagsRecord,
} from "../src/service";
import { generateDummyClient } from "./azure-client.mock";

const flagObject = {
  id: "testFlag",
  description: "",
  enabled: true,
  conditions: { clientFilters: undefined },
  displayName: undefined,
};

describe.concurrent(getFeatureFlagByKey, () => {
  it("should throw error if client is incorrect", async () => {
    await expect(() =>
      // @ts-expect-error
      getFeatureFlagByKey({}, flagObject.id)
    ).rejects.toThrow("'client' is not valid Azure AppConfigurationClient");
  });

  it("should throw error if key is missing", async () => {
    const client = generateDummyClient(flagObject);
    await expect(() => getFeatureFlagByKey(client, "")).rejects.toThrow(
      "Feature flag key is missing"
    );
  });

  it("should return null if flag does not exits", async () => {
    const client = generateDummyClient(flagObject);
    expect(await getFeatureFlagByKey(client, "otherKey")).null;
  });

  it("should return null if object is error", async () => {
    // @ts-expect-error
    const client = generateDummyClient("");
    expect(await getFeatureFlagByKey(client, "w")).null;
  });

  it("should return null something goes wrong while fetching", async () => {
    const client = generateDummyClient(flagObject, true);
    expect(await getFeatureFlagByKey(client, flagObject.id)).null;
  });

  it("should fetch a flag with key", async () => {
    const client = generateDummyClient(flagObject);
    const flag = await getFeatureFlagByKey(client, flagObject.id);

    expect(flag).toEqual(flagObject);
  });
});

describe.concurrent(getFeatureFlagsList, () => {
  it("should throw error if client is incorrect", async () => {
    // @ts-expect-error
    await expect(() => getFeatureFlagsList({})).rejects.toThrow(
      "'client' is not valid Azure AppConfigurationClient"
    );
  });

  it("should fetch all flags", async () => {
    const client = generateDummyClient(flagObject);
    const flags = await getFeatureFlagsList(client);

    expect(flags).toEqual([flagObject]);
  });

  it("should return null something goes wrong while fetching", async () => {
    // @ts-expect-error
    const client = generateDummyClient("", true);

    expect(await getFeatureFlagsList(client)).toEqual([]);
  });
});

describe.concurrent(getFeatureFlagsRecord, () => {
  it("should throw error if client is incorrect", async () => {
    // @ts-expect-error
    await expect(() => getFeatureFlagsRecord({})).rejects.toThrow(
      "'client' is not valid Azure AppConfigurationClient"
    );
  });

  it("should fetch all flags", async () => {
    const client = generateDummyClient(flagObject);
    const flags = await getFeatureFlagsRecord(client);

    expect(flags).toEqual({ [flagObject.id]: flagObject });
  });

  it("should return null something goes wrong while fetching", async () => {
    // @ts-expect-error
    const client = generateDummyClient("", true);

    expect(await getFeatureFlagsRecord(client)).toEqual({});
  });
});
