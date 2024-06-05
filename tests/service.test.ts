import { describe, it, expect } from "vitest";
import {
  deleteFeatureFlag,
  getFeatureFlagByKey,
  getFeatureFlagsList,
  getFeatureFlagsRecord,
  setFeatureFlag,
} from "../src/service";
import { dummyFeatureFlag, generateDummyClient } from "./azure-client.mock";
import { FeatureFlag } from "../src/types";

const flagObject = {
  id: "testFlag",
  description: "",
  enabled: true,
  conditions: { client_filters: undefined },
  displayName: undefined,
};

describe(getFeatureFlagByKey, { concurrent: true }, () => {
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
    const client = generateDummyClient();
    expect(await getFeatureFlagByKey(client, "w")).null;
  });

  it("should return null something goes wrong while fetching", async () => {
    const client = generateDummyClient();
    expect(await getFeatureFlagByKey(client, flagObject.id)).null;
  });

  it("should fetch a flag with key", async () => {
    const client = generateDummyClient(flagObject);
    const flag = await getFeatureFlagByKey(client, flagObject.id);

    expect(flag).toEqual(flagObject);
  });

  it("should fetch a flag with key and label", async () => {
    const client = generateDummyClient(flagObject);
    const flag = await getFeatureFlagByKey(client, flagObject.id, {
      labelFilter: "test-label",
    });

    expect(flag).toEqual(flagObject);
  });
});

describe(getFeatureFlagsList, { concurrent: true }, () => {
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

  it("should return empty list something goes wrong while fetching", async () => {
    const client = generateDummyClient();
    expect(await getFeatureFlagsList(client)).toEqual([]);
  });
});

describe(getFeatureFlagsRecord, { concurrent: true }, () => {
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

  it("should return empty record something goes wrong while fetching", async () => {
    const client = generateDummyClient();

    expect(await getFeatureFlagsRecord(client)).toEqual({});
  });
});

describe(setFeatureFlag, { concurrent: true }, () => {
  it("adds new feature flag if it does not exists", async () => {
    const client = generateDummyClient();

    const existingFlag = await getFeatureFlagByKey(client, dummyFeatureFlag.id);
    expect(existingFlag).null;

    expect(await setFeatureFlag(client, dummyFeatureFlag)).true;

    const newFlag = await getFeatureFlagByKey(client, dummyFeatureFlag.id);
    expect(newFlag).toMatchInlineSnapshot(`
      {
        "conditions": {
          "client_filters": [],
        },
        "enabled": true,
        "id": "feature",
      }
    `);
  });

  it("updates existing feature flag if it exists", async () => {
    const client = generateDummyClient(dummyFeatureFlag);

    const existingFlag = await getFeatureFlagByKey(client, dummyFeatureFlag.id);
    expect(existingFlag).not.null;

    const newFeatureFlag: FeatureFlag = {
      ...dummyFeatureFlag,
      enabled: !dummyFeatureFlag.enabled,
    };

    expect(await setFeatureFlag(client, newFeatureFlag)).true;

    expect(await getFeatureFlagByKey(client, newFeatureFlag.id))
      .toMatchInlineSnapshot(`
      {
        "conditions": {
          "client_filters": [],
        },
        "enabled": false,
        "id": "feature",
      }
    `);
  });

  it("returns false if cannot add new feature flag", async () => {
    const client = generateDummyClient();
    // @ts-expect-error
    expect(await setFeatureFlag(client, "foo")).false;
  });
});

describe(deleteFeatureFlag, {}, () => {
  it("deletes existing feature flag if it exists", async () => {
    const client = generateDummyClient(dummyFeatureFlag);

    const existingFlag = await getFeatureFlagByKey(client, dummyFeatureFlag.id);
    expect(existingFlag).not.null;

    expect(await deleteFeatureFlag(client, dummyFeatureFlag.id)).true;

    expect(await getFeatureFlagByKey(client, dummyFeatureFlag.id)).null;
  });

  it("returns false if feature flag does not exits", async () => {
    const client = generateDummyClient();
    expect(await deleteFeatureFlag(client, dummyFeatureFlag.id)).false;
  });
});
