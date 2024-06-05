import * as React from "react";
import { FeatureFlag, FeatureFlagService } from "../../src";
import { AppConfigurationClientLite } from "../../src/client";

const flag: FeatureFlag = {
  id: "test-flag",
  enabled: false,
  conditions: {
    client_filters: [
      {
        name: "Microsoft.Targeting",
        parameters: {
          Audience: { DefaultRolloutPercentage: 50 },
        },
      },
    ],
  },
};

export default function useFeatureFlagServiceActionState() {
  return React.useActionState(async (_prev: unknown, formData: FormData) => {
    const connectionString = formData.get("connectionString")?.toString();
    if (!connectionString) {
      return "No connectionString provided.";
    }

    if (
      !connectionString.includes("Endpoint=") ||
      !connectionString.includes("Secret=") ||
      !connectionString.includes("Id=")
    ) {
      return "The connectionString is not in correct format";
    }

    try {
      const client = new AppConfigurationClientLite(connectionString);

      return new FeatureFlagService(client);
    } catch (error) {
      console.error(error);
      return "An error occurred while connecting! Try again.";
    }
  }, undefined);
}
