# Azure Feature Flags

**Fetch and validate feature flags from Azure Configuration.**

This package depends on `@azure/app-configuration` to generate the Azure `AppConfigurationClient`.

> Note: This package does not manage rollout functionality yet. Thus, currently any rollout set to `> 0` will be truthy.

## Install

```sh
npm i azure-feature-flags
```

```sh
yarn add azure-feature-flags
```

```sh
bun add azure-feature-flags
```

## Usage

### `fetchFeatureFlags`

Fetch all feature flags from Azure App Config and return them as a record.

```ts
import { AppConfigurationClient } from "@azure/app-configuration";
import { fetchFeatureFlags } from "azure-feature-flags";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
const client = new AppConfigurationClient(connectionString);

const featureFlags: FeatureFlagsRecord = await fetchFeatureFlags(client);
```

### `fetchFeatureFlagByKey`

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

### `validateFeatureFlag`

Validate a feature-flag object against filters/conditions.

> Note: The function will `throw` if a custom filter is encountered without a validator. Hence, it is recommended to wrap the function call in try-catch for handling unsupported custom filters.

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
  users: ["user-id"],
});
```

#### - With custom filters

Azure allows for custom filters and they need to be manually tested against. The function accepts an object of custom filters to test against.

The validator function received the `filter` object set in Azure Config as first argument, and groups & users are 2nd param.

```ts
import { validateFeatureFlag } from "azure-feature-flags";
import type { FeatureFlagCustomFilterValidator } from "azure-feature-flags";

const myFilterValidator: FeatureFlagCustomFilterValidator = (
  filter,
  options
) => {
  return (
    filter.parameters["foo"] === "bar" && filter.parameters["abc"] !== "def"
  );
};

const isValid: boolean = validateFeatureFlag(featureFlag, {
  customFilterValidators: { "my-filter-name": myFilterValidator },
});
```

## License

MIT

---

© 2024 Siddhant Gupta (GuptaSiddhant)
