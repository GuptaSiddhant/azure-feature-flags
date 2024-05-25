import type {
  AppConfigurationClient,
  GetConfigurationSettingResponse,
} from "@azure/app-configuration";
import { featureFlagPrefix } from "@azure/app-configuration";
import { FeatureFlag } from "../src/types";

export function generateDummyClient(
  flagObject: FeatureFlag,
  throwError = false
): AppConfigurationClient {
  const entries = [];

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
