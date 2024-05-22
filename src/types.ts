export type FeatureFlagsRecord = Record<string, FeatureFlag>;

export type FeatureFlag = {
  conditions: {
    client_filters: Array<
      FeatureFlagTargetingFilter | FeatureFlagTimeWindowFilter
    >;
    requirement_type?: "All";
  };
  description?: string;
  displayName?: string;
  enabled: boolean;
  id: string;
};

export type FeatureFlagTargetingFilter = {
  name: "Microsoft.Targeting";
  parameters: {
    Audience: {
      DefaultRolloutPercentage: number;
      Exclusion?: { Groups?: Array<string>; Users?: Array<string> };
      Groups?: Array<{ Name: string; RolloutPercentage: number }>;
      Users?: Array<string>;
    };
  };
};

export type FeatureFlagTimeWindowFilter = {
  name: "Microsoft.TimeWindow";
  parameters: {
    End?: string | null;
    Start?: string | null;
  };
};
