# Azure Feature Flags

Fetch and validate feature flags from Azure Configuration.

This package depends on `@azure/app-configuration` to generate the `AppConfigurationClient`.

> Note: This library does not manage rollout functionality yet. Thus, currently any rollout set to `> 0` will validate to `true`.

## Usage

### `fn`: `fetchFeatureFlags`

Fetch all feature flags from Azure App Config and return them as a record.

```ts
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags } from "azure-feature-flags";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
const client = new AppConfigurationClient(connectionString);

const featureFlags: FeatureFlagsRecord = await fetchFeatureFlags(client);
```

### `fn`: `fetchFeatureFlagByKey`

Fetch feature flag data for specific key.

```ts
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags } from "azure-feature-flags";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
const client = new AppConfigurationClient(connectionString);
const featureFlagKey = "your-feature-flag-key";

const featureFlag: FeatureFlag | null = await fetchFeatureFlagByKey(
  client,
  featureFlagKey
);
```

### `fn`: `validateFeatureFlag`

Validate a feature-flag object against filters/conditions.

#### - Default and TimeWindow filter

If filters are not set on the flag, the validation returns the value set in `featureFlag.enabled`. Otherwise, the `TimeWindow` filter is also tested against current time.

```ts
import { validateFeatureFlag } from "azure-feature-flags";

const isValid: boolean = validateFeatureFlag(featureFlag);
```

#### - Targeting Audience filter With Groups/User

When a group(s) or user is provided, the value is matched against the targeted audiences (both included and excluded) set in the Azure App Config.

```ts
import { validateFeatureFlag } from "azure-feature-flags";

const isValid: boolean = validateFeatureFlag(featureFlag, {
  groups: ["editor"],
  user: "user-id",
});
```

#### - With custom filters

Azure allows for custom filters and they need to be manually tested against. The function accepts an object of custom filters to test against.

The validator function received the `parameters` object set in Azure Config as first argument, and groups & users are 2nd and 3rd params respectively.

```ts
import { validateFeatureFlag } from "azure-feature-flags";
import type { CustomFilterValidator } from "azure-feature-flags";

const myFilterValidator: CustomFilterValidator = (parameters) => {
  return parameters["foo"] === "bar";
};

const isValid: boolean = validateFeatureFlag(featureFlag, {
  customFilters: {
    "my-filter-name": myFilterValidator,
  },
});
```
