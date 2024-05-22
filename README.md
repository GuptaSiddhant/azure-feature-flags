# Azure Feature Flags

Fetch and validate feature flags from Azure Configuration.

> Note: This library does not manage rollout functionality yet. Thus, currently any rollout set to `> 0` will validate to `true`.

## Usage

### `fn`: `fetchFeatureFlags`

#### - With Azure `CONNECTION_STRING` or `ACCESS_STRING`

```ts
import { fetchFeatureFlags } from "azure-feature-flags";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;

const featureFlags = await fetchFeatureFlags(connectionString);
//    ^ All feature flags
```

#### - With Azure `Endpoint` or `Credential`

```ts
import { fetchFeatureFlags } from "azure-feature-flags";

const endpoint = process.env.AZURE_CONFIG_ENDPOINT;
const credential = new DefaultAzureCredential(); // or other method to generate Azure `TokenCredential`.

const featureFlags = await fetchFeatureFlags(endpoint, credential);
//    ^ All feature flags
```

### `fn`: `validateFeatureFlag`

#### - Default and TimeWindow filter

If filters are not set on the flag, the validation returns the value set in `featureFlag.enabled`. Otherwise, the `TimeWindow` filter is also tested against current time.

```ts
import { validateFeatureFlag } from "azure-feature-flags";

const featureFlagKey = "your-feature-flag-id";
const featureFlag = featureFlags[featureFlagKey];

const isValid = validateFeatureFlag(featureFlag);
//    ^ boolean
```

#### - Targeting Audience filter With Groups/User

When a group(s) or user is provided, the value is matched against the targeted audiences (both included and excluded) set in the Azure App Config.

```ts
import { validateFeatureFlag } from "azure-feature-flags";

const featureFlagKey = "your-feature-flag-id";
const featureFlag = featureFlags[featureFlagKey];

const isValid = validateFeatureFlag(featureFlag, {
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

const featureFlagKey = "your-feature-flag-id";
const featureFlag = featureFlags[featureFlagKey];

const myFilterValidator: CustomFilterValidator = (parameters) => {
  return parameters["foo"] === "bar";
};

const isValid = validateFeatureFlag(featureFlag, {
  customFilters: {
    "my-filter-name": myFilterValidator,
  },
});
```
