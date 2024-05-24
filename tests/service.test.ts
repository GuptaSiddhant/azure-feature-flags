import { describe, it, expect, vi } from "vitest";
import {
  featureFlagPrefix,
  type AppConfigurationClient,
  type GetConfigurationSettingResponse,
} from "@azure/app-configuration";
import { fetchFeatureFlags, fetchFeatureFlagByKey } from "../src/service";
import { FeatureFlag } from "../src/types";

const flagObject = {
  id: "testFlag",
  description: "",
  enabled: true,
  conditions: { clientFilters: undefined },
  displayName: undefined,
};

describe(fetchFeatureFlagByKey, () => {
  it("should throw error if client is incorrect", async () => {
    await expect(() =>
      // @ts-expect-error
      fetchFeatureFlagByKey({}, flagObject.id)
    ).rejects.toThrow("'client' is not valid Azure AppConfigurationClient");
  });

  it("should throw error if key is missing", async () => {
    const client = generateDummyClient(flagObject);
    await expect(() => fetchFeatureFlagByKey(client, "")).rejects.toThrow(
      "Feature flag key is missing"
    );
  });

  it("should return null if flag does not exits", async () => {
    const client = generateDummyClient(flagObject);
    expect(await fetchFeatureFlagByKey(client, "otherKey")).null;
  });

  it("should return null if object is error", async () => {
    // @ts-expect-error
    const client = generateDummyClient("");
    expect(await fetchFeatureFlagByKey(client, "w")).null;
  });

  it("should return null something goes wrong while fetching", async () => {
    const client = generateDummyClient(flagObject, true);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    expect(await fetchFeatureFlagByKey(client, flagObject.id)).null;
    expect(errorSpy).toHaveBeenCalled();
  });

  it("should fetch a flag with key", async () => {
    const client = generateDummyClient(flagObject);
    const flag = await fetchFeatureFlagByKey(client, flagObject.id);

    expect(flag).toEqual(flagObject);
  });
});

describe(fetchFeatureFlags, () => {
  it("should throw error if client is incorrect", async () => {
    // @ts-expect-error
    await expect(() => fetchFeatureFlags({})).rejects.toThrow(
      "'client' is not valid Azure AppConfigurationClient"
    );
  });

  it("should fetch all flags", async () => {
    const client = generateDummyClient(flagObject);
    const flags = await fetchFeatureFlags(client);

    expect(flags).toEqual({ [flagObject.id]: flagObject });
  });

  it("should return null something goes wrong while fetching", async () => {
    // @ts-expect-error
    const client = generateDummyClient("", true);

    expect(await fetchFeatureFlags(client)).toEqual({});
  });
});

function generateDummyClient(
  flagObject: FeatureFlag,
  throwError = false
): AppConfigurationClient {
  const flagResponse = (key: string) =>
    ({
      key,
      value:
        key === `${featureFlagPrefix}${flagObject.id}`
          ? JSON.stringify(flagObject)
          : "",
      syncToken: "zAJw6V16=MTM6MTkjMzg3ODg4MjQ=;sn=38788824",
      contentType: "application/vnd.microsoft.appconfig.ff+json;charset=utf-8",
      lastModified: new Date("2024-05-22T13:48:52.000Z"),
      tags: {},
      isReadOnly: false,
      statusCode: 200,
      _response: {} as GetConfigurationSettingResponse["_response"],
    } satisfies GetConfigurationSettingResponse);

  return {
    listConfigurationSettings() {
      async function* gen() {
        let index = 0;
        while (index < 1) {
          yield flagResponse(`${featureFlagPrefix}${flagObject.id}`);
          index++;
        }
      }

      return gen() as unknown as ReturnType<
        AppConfigurationClient["listConfigurationSettings"]
      >;
    },

    async getConfigurationSetting({ key }) {
      if (throwError) throw new Error();
      return flagResponse(key);
    },
  } as AppConfigurationClient;
}
