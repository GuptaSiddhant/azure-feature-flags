import { describe, expect, it } from "vitest";
import {
  invariantAppConfigurationClient,
  iterateAppConfigurationFeatureFlags,
  extractFeatureFlagFromSetting,
} from "../src/utils/app-config";
import {
  dummyFeatureFlag,
  generateDummyClient,
  wrapFeatureFlagInSetting,
} from "./azure-client.mock";

describe(invariantAppConfigurationClient, { concurrent: true }, () => {
  const errorMessage = `'client' is not valid Azure AppConfigurationClient`;

  it("should throw error for non-object", () => {
    // @ts-expect-error
    expect(() => invariantAppConfigurationClient("")).toThrowError(
      errorMessage
    );
  });

  it("should throw error for empty object", () => {
    // @ts-expect-error
    expect(() => invariantAppConfigurationClient({})).toThrowError(
      errorMessage
    );
  });

  it("should throw error for object without required method", () => {
    expect(() =>
      invariantAppConfigurationClient({}, "getConfigurationSetting")
    ).toThrowError(errorMessage);
  });

  it("should return true if client has required method", () => {
    expect(
      invariantAppConfigurationClient(
        { getConfigurationSetting: () => {} },
        "getConfigurationSetting"
      )
    ).true;
  });
});

describe(iterateAppConfigurationFeatureFlags, { concurrent: true }, () => {
  it("generates list from app-config iterator", async () => {
    const client = generateDummyClient(dummyFeatureFlag);
    const list: unknown[] = [];
    await iterateAppConfigurationFeatureFlags(client, undefined, (flag) => {
      list.push(flag);
    });
    expect(list).toMatchInlineSnapshot(`
      [
        {
          "conditions": {
            "client_filters": [],
          },
          "enabled": true,
          "id": "feature",
        },
      ]
    `);
  });

  it("generates record from app-config iterator", async () => {
    const client = generateDummyClient(dummyFeatureFlag);
    const record: Record<string, unknown> = {};
    await iterateAppConfigurationFeatureFlags(client, undefined, (flag) => {
      record[flag.id] = flag;
    });

    expect(record).toMatchInlineSnapshot(`
      {
        "feature": {
          "conditions": {
            "client_filters": [],
          },
          "enabled": true,
          "id": "feature",
        },
      }
    `);
  });

  it("ignores the iterator entries which are not feature flag", async () => {
    // @ts-expect-error
    const client = generateDummyClient({ foo: "bar" });
    const list: unknown[] = [];
    await iterateAppConfigurationFeatureFlags(client, undefined, (flag) => {
      list.push(flag);
    });
    expect(list).toMatchInlineSnapshot(`[]`);
  });
});

describe(extractFeatureFlagFromSetting, { concurrent: true }, () => {
  it("should extract flag", () => {
    expect(
      extractFeatureFlagFromSetting(wrapFeatureFlagInSetting(dummyFeatureFlag))
    ).toMatchInlineSnapshot(`
      {
        "conditions": {
          "client_filters": [],
        },
        "enabled": true,
        "id": "feature",
      }
    `);
  });

  it("should throw error if setting is not flag", () => {
    expect(() =>
      extractFeatureFlagFromSetting({
        key: `some-id`,
        isReadOnly: false,
        contentType: "application/json",
        value: JSON.stringify({}),
      })
    ).toThrowError(
      "Setting with key some-id is not a valid FeatureFlag, make sure to have the correct content-type and a valid non-null value."
    );
  });
});
