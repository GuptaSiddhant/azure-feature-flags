# Azure Feature Flags

**get and validate feature flags from Azure Configuration.**

[![JSR](https://jsr.io/badges/@gs/azure-feature-flags)](https://jsr.io/badges/@gs/azure-feature-flags)

This package depends on `@azure/app-configuration` to generate the Azure `AppConfigurationClient`.

- [Install](#install)
- [Service API](#service-api)
  - [getFeatureFlagsRecord](#getfeatureflagsrecord)
  - [getFeatureFlagsList](#getfeatureflagslist)
  - [getFeatureFlagByKey](#getFeatureFlagByKey)
  - [setFeatureFlag](#setFeatureFlag)
  - [deleteFeatureFlag](#deleteFeatureFlag)
- [Validation API](#validation-api)
  - [`validateFeatureFlagWithFilters`](#validatefeatureflagwithfilters)
    - [Default and TimeWindow filter](#default-and-timewindow-filter)
    - [Targeting filter](#targeting-filter)
      - [Handle rollout](#handle-rollout)
        - [Built-in handlers](#built-in-handlers)
        - [Custom handler](#custom-handler)
    - [Custom filter](#custom-filter)
- [License](#license)

## Install

```sh
npm i azure-feature-flags @azure/app-configuration
```

```sh
yarn add azure-feature-flags @azure/app-configuration
```

```sh
bun add azure-feature-flags @azure/app-configuration
```

## Service API

The Service API directly interact with Azure App Config. All Service API accepts Azure App Configuration `client` as first parameter which must be generated with the `@azure/app-configuration` package.

```ts
import { AppConfigurationClient } from "@azure/app-configuration";

const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
const client = new AppConfigurationClient(connectionString);
```

> Note, all exports can be imported from root package `azure-feature-flags` but for sake of tree-shaking, they are made available from `azure-feature-flags/service`

### `getFeatureFlagsRecord`

Get all feature flags from Azure App Config and return them as a record.

```ts
import { getFeatureFlagsRecord } from "azure-feature-flags/service";
import type { FeatureFlagsRecord } from "azure-feature-flags";

const featureFlags: FeatureFlagsRecord = await getFeatureFlagsRecord(client);
```

### `getFeatureFlagsList`

Get all feature flags from Azure App Config and return them as a list/array.

```ts
import { getFeatureFlagsList } from "azure-feature-flags/service";
import type { FeatureFlag } from "azure-feature-flags";

const featureFlags: FeatureFlag[] = await getFeatureFlagsList(client);
```

### `getFeatureFlagByKey`

Get feature flag data for specific key.

```ts
import { getFeatureFlagByKey } from "azure-feature-flags/service";
import type { FeatureFlag } from "azure-feature-flags";

const featureFlagKey = "your-feature-flag-key";

const featureFlag: FeatureFlag | null = await getFeatureFlagByKey(
  client,
  featureFlagKey
);
```

### `setFeatureFlag`

Set a new feature flag data or update existing one

```ts
import { setFeatureFlag } from "azure-feature-flags/service";
import type { FeatureFlag } from "azure-feature-flags";

const featureFlag: FeatureFlag = {
  id: "your-feature-flag-id",
  enabled: true,
  conditions: { client_filters: [] },
};

const success: boolean = await setFeatureFlag(client, featureFlag);
```

### `deleteFeatureFlag`

Get feature flag data for specific key.

```ts
import { deleteFeatureFlag } from "azure-feature-flags/service";

const featureFlagKey = "your-feature-flag-key";

const deleted: boolean = await deleteFeatureFlag(client, featureFlagKey);
```

## Validation API

### `validateFeatureFlagWithFilters`

Validate a feature-flag object against filters/conditions.

> Note: The function will `throw` if a custom filter is encountered without a validator. Hence, it is recommended to wrap the function call in try-catch for handling unsupported custom filters.

> Note, all exports can be imported from root package `azure-feature-flags` but for sake of tree-shaking, they are made available from `azure-feature-flags/validate`

#### Default and TimeWindow filter

If filters are not set on the flag, the validation returns the value set in `featureFlag.enabled`. Otherwise, the `TimeWindow` filter is also tested against current time.

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";

const isValid: boolean = validateFeatureFlagWithFilters(featureFlag);
```

#### Targeting filter

When a group(s) or user(s) are provided, the value is matched against the targeted audiences (both included and excluded) set in the Azure App Config.

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";

const isValid: boolean = validateFeatureFlagWithFilters(featureFlag, {
  groups: ["editor"],
  users: ["user-id"],
});
```

##### Handle rollout

> Note: By default, any rollout percentage set to `> 0` is considered valid. This behaviour can be overridden by providing a custom `handleRollout` callback in the options.

###### Built-in handlers

The package exports some rollout handlers which can be used instead of creating your own.

- `handleRolloutWithIncrement`

  The numbers on incremented on both sides (true and false) according to their ratio
  until a limit has reached. Then the increments are reset and it begins again.

  For eg. For a 50% rollout, first run will be true, second be false, and then repeat.
  For a 75% rollout, first 3 runs will be true and then a false, and then repeat.

  ```ts
  import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";
  import { handleRolloutWithIncrement } from "azure-feature-flags/rollout";

  const isValid: boolean = validateFeatureFlagWithFilters(featureFlag, {
    groups: ["editor"],
    handleRollout: handleRolloutWithIncrement,
  });
  ```

- `handleRolloutWithHash`

  For a given flag-key and groupName, the function generates a static hash.
  That hash is converted to a number and compare with rolloutPercentage

  ```ts
  import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";
  import { handleRolloutWithHash } from "azure-feature-flags/rollout";

  const isValid: boolean = validateFeatureFlagWithFilters(featureFlag, {
    groups: ["editor"],
    handleRollout: handleRolloutWithHash,
  });
  ```

###### Custom handler

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";
import type { FeatureFlagHandleRollout } from "azure-feature-flags";

const handleRollout: FeatureFlagHandleRollout = (
  flagKey,
  rolloutPercentage,
  groupName // groupName is `undefined` for `DefaultRolloutPercentage`.
) => {
  // logic to determine if the feature flag should be enabled or not.
  return groupName === "editor" && rolloutPercentage > Math.random() * 100;
};

const isValid: boolean = validateFeatureFlagWithFilters(featureFlag, {
  groups: ["editor"],
  handleRollout,
});
```

#### Custom filter

Azure allows for custom filters and they need to be manually tested against. The function accepts an object of custom filters to test against.

The validator function received the `filter` object set in Azure Config as first argument, and groups & users are 2nd param.

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";
import type { FeatureFlagCustomFilterValidator } from "azure-feature-flags";

const myFilterValidator: FeatureFlagCustomFilterValidator = (
  filter,
  options
) => {
  // logic to determine if the feature flag should be enabled or not.
  return (
    filter.parameters["foo"] === "bar" && filter.parameters["abc"] !== "def"
  );
};

const isValid: boolean = validateFeatureFlagWithFilters(featureFlag, {
  customFilterValidators: { "my-filter-name": myFilterValidator },
});
```

### `validateFeatureFlagWithVariants`

> This API is experimental and may change as the Variants feature of Azure App Configuration Feature Manager is under Preview.

```ts
import { validateFeatureFlagWithVariants } from "azure-feature-flags/validate";

const variant = validateFeatureFlagWithVariants(featureFlag);
```

## License

MIT

---

© 2024 Siddhant Gupta (GuptaSiddhant)
