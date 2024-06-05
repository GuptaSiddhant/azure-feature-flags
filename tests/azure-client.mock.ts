import {
  AppConfigurationClient,
  ConfigurationSetting,
  featureFlagContentType,
  featureFlagPrefix,
} from "../src/utils/app-config";
import {
  FeatureFlag,
  FeatureFlagWithFilters,
  FeatureFlagWithVariants,
} from "../src/types";

export { featureFlagPrefix, featureFlagContentType };

export const dummyFeatureFlag: FeatureFlagWithFilters = {
  id: "feature",
  enabled: true,
  conditions: { client_filters: [] },
};

export const featureFlagWithVariants: FeatureFlagWithVariants = {
  id: "feature",
  enabled: false,
  variants: [
    { name: "var-a", configuration_value: true },
    { name: "var-b", configuration_value: false },
  ],
  allocation: {
    default_when_disabled: "var-a",
    default_when_enabled: "var-b",
    percentile: [
      { from: 0, to: 50, variant: "var-a" },
      { from: 50, to: 100, variant: "var-b" },
    ],
  },
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
          yield settingResponse(settings[index]!);
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

    async setConfigurationSetting(setting) {
      const index = settings.findIndex((s) => s.key === setting.key);
      if (index < 0) {
        if (typeof setting.value !== "string") throw new Error();
        if (typeof JSON.parse(setting.value) !== "object") throw new Error();
        settings.push(setting);
        return setting;
      }
      settings.splice(index, 1, setting);
      return setting;
    },

    async deleteConfigurationSetting(setting) {
      const index = settings.findIndex((s) => s.key === setting.key);
      if (index < 0) throw new Error();
      settings.splice(index, 1);
      return {};
    },
  } as AppConfigurationClient;
}

export function wrapFeatureFlagInSetting(
  flag: FeatureFlag
): ConfigurationSetting {
  return {
    key: `${featureFlagPrefix}${flag.id}`,
    isReadOnly: false,
    contentType: featureFlagContentType,
    value: JSON.stringify(flag),
  };
}

function settingResponse(setting: ConfigurationSetting) {
  return {
    statusCode: 200,
    _response: {},
    ...setting,
  };
}
