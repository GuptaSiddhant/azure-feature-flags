import type {
  AddConfigurationSettingResponse,
  AppConfigurationClient,
  ConfigurationSetting,
  DeleteConfigurationSettingResponse,
  GetConfigurationSettingResponse,
  SetConfigurationSettingResponse,
} from "@azure/app-configuration";
import { featureFlagPrefix } from "@azure/app-configuration";
import { FeatureFlag } from "../src/types";

export const dummyFeatureFlag: FeatureFlag = {
  id: "feature",
  enabled: true,
  conditions: { client_filters: [] },
};

export function generateDummyClient(
  flagObject?: FeatureFlag
): AppConfigurationClient {
  let settings: ConfigurationSetting[] = flagObject
    ? [wrapFeatureFlagInSetting(flagObject)]
    : [];

  return {
    listConfigurationSettings() {
      async function* gen() {
        let index = 0;
        while (index < settings.length) {
          yield settingResponse(settings[index]);
          index++;
        }
      }

      return gen() as unknown as ReturnType<
        AppConfigurationClient["listConfigurationSettings"]
      >;
    },

    async getConfigurationSetting({ key }) {
      // if (throwError) throw new Error();
      const setting = settings.find((s) => s.key === key);
      if (!setting) throw new Error();
      return settingResponse(setting);
    },

    async addConfigurationSetting(setting) {
      if (typeof setting.value !== "string") throw new Error();
      if (typeof JSON.parse(setting.value) !== "object") throw new Error();
      // @ts-expect-error
      settings.push(setting);
      return setting as AddConfigurationSettingResponse;
    },

    async setConfigurationSetting(setting) {
      const index = settings.findIndex((s) => s.key === setting.key);
      if (index < 0) throw new Error();

      settings.splice(index, 1, setting as ConfigurationSetting);
      return setting as SetConfigurationSettingResponse;
    },

    async deleteConfigurationSetting(setting) {
      const index = settings.findIndex((s) => s.key === setting.key);
      if (index < 0) throw new Error();
      settings.splice(index, 1);
      return {} as DeleteConfigurationSettingResponse;
    },
  } as AppConfigurationClient;
}

export function wrapFeatureFlagInSetting(
  flag: FeatureFlag
): ConfigurationSetting {
  return {
    key: `${featureFlagPrefix}${flag.id}`,
    isReadOnly: false,
    contentType: "application/vnd.microsoft.appconfig.ff+json;charset=utf-8",
    value: JSON.stringify(flag),
  };
}

function settingResponse(setting: ConfigurationSetting) {
  return {
    statusCode: 200,
    _response: {} as GetConfigurationSettingResponse["_response"],
    ...setting,
  } satisfies GetConfigurationSettingResponse;
}
