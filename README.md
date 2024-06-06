# Azure Feature Flags

**Get/set and validate feature flags from Azure App Configuration.**

[View demo app](https://git.guptasiddhant.com/azure-feature-flags/): Use your own Azure App Configuration to see what Feature Flags are available and how they validate.

[![GitHub](https://img.shields.io/github/v/tag/GuptaSiddhant/azure-feature-flags?label=GitHub)](https://github.com/guptasiddhant/azure-feature-flags)
[![NPM](https://img.shields.io/npm/v/azure-feature-flags)](https://www.npmjs.com/package/azure-feature-flags)
[![JSR](https://jsr.io/badges/@gs/azure-feature-flags)](https://jsr.io/badges/@gs/azure-feature-flags)

- [Install](#install)
- [FeatureFlagService](#class-featureflagservice)
- [Service API](#service-api)
  - [Create App configuration client](#create-app-configuration-client)
  - [getFeatureFlagsRecord](#getfeatureflagsrecord)
  - [getFeatureFlagsList](#getfeatureflagslist)
  - [getFeatureFlagByKey](#getFeatureFlagByKey)
  - [setFeatureFlag](#setFeatureFlag)
  - [deleteFeatureFlag](#deleteFeatureFlag)
- [Validation API](#validation-api)
  - [validateFeatureFlag](#validatefeatureflag)
  - [validateFeatureFlagWithFilters](#validatefeatureflagwithfilters)
    - [Default and TimeWindow filter](#default-and-timewindow-filter)
    - [Targeting filter](#targeting-filter)
      - [Handle rollout](#handle-rollout)
        - [Built-in handlers](#built-in-handlers)
        - [Custom handler](#custom-handler)
    - [Custom filter](#custom-filter)
  - [validateFeatureFlagWithVariants](#validatefeatureflagwithvariants)
- [License](#license)

## Install

### NPM

```sh
npm i azure-feature-flags
```

```sh
yarn add azure-feature-flags
```

```sh
bun add azure-feature-flags
```

### JSR

```sh
npx jsr add @gs/azure-feature-flags
```

```sh
deno add @gs/azure-feature-flags
```

> In all the examples below, the imports are done from `azure-feature-flags` package but for Deno, they need to be replaced with either `npm:azure-feature-flags` or `@gs/azure-feature-flags`.

## `class` `FeatureFlagService`

Create and use a singular instance of service. It is wrapper around individually exported functions from [service API](#service-api) and [validation API](#validation-api).

> For better tree-shaking, you can import individual functions from their respective entry-points.

```ts
import { FeatureFlagService } from "azure-feature-flags";

// FeatureFlagService service requires `client` of type
// `AppConfigurationClient` or `AppConfigurationClientLite`
// See Service API section for generating it.
const service = new FeatureFlagService(client);

const created = await service.set({ id: "flag-id", enabled: true });
const featureFlagsRecord = await service.getAllAsRecord();
const featureFlagsList = await service.getAllAsList();
const featureFlag = await service.getByKey("flag-id");
const enabledOrVariant = await service.getByKeyAndValidate("flag-id", {
  groups: ["admin"],
});
const deleted = await service.delete("flag-id");
```

## Service API

The Service API directly interact with Azure App Config. All Service API accepts Azure App Configuration `client` as first parameter.
It can be generated with the `@azure/app-configuration` package or via the internal tool.

> Pros and cons of generating `client` with `@azure/app-configuration` package.
>
> Pros:
>
> - Standard `client` that can be used with other Azure services
> - Maintained by Azure.
> - Decoupled with this library's maintenance.
> - Need to authenticate with Azure CredentialToken.
>
> Cons:
>
> - Additional Bundle size of ~30kB (Gzipped) which is quite big for making couple of API calls
> - The internal tool is well suited/optimised for making Feature Flag specific calls to Azure App Config.

### Create App configuration client

- With internal tool (preferred)

  ```ts
  import { AppConfigurationClientLite } from "azure-feature-flags/client";

  const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
  const client = new AppConfigurationClientLite(connectionString);
  ```

- With `"@azure/app-configuration"` package

  ```ts
  import { AppConfigurationClient } from "@azure/app-configuration";

  const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
  const client = new AppConfigurationClient(connectionString);
  ```

### `getFeatureFlagsRecord`

Get all feature flags from Azure App Config and return them as a record.

```ts
import {
  getFeatureFlagsRecord,
  type FeatureFlagsRecord,
} from "azure-feature-flags/service";

const featureFlags: FeatureFlagsRecord = await getFeatureFlagsRecord(client);
```

### `getFeatureFlagsList`

Get all feature flags from Azure App Config and return them as a list/array.

```ts
import {
  getFeatureFlagsList,
  type FeatureFlag,
} from "azure-feature-flags/service";

const featureFlags: FeatureFlag[] = await getFeatureFlagsList(client);
```

### `getFeatureFlagByKey`

Get feature flag data for specific key.

```ts
import {
  getFeatureFlagByKey,
  type FeatureFlag,
} from "azure-feature-flags/service";

const featureFlagKey = "your-feature-flag-key";

const featureFlag: FeatureFlag | null = await getFeatureFlagByKey(
  client,
  featureFlagKey
);
```

### `setFeatureFlag`

Set a new feature flag data or update existing one

```ts
import { setFeatureFlag, type FeatureFlag } from "azure-feature-flags/service";

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

### `validateFeatureFlag`

Validate both types of Feature Flags - Filters and Variants. The function calls respective validators under the hood to do the heavy lifting.

> Note: If you know which type of Feature Flag you wish to validate, then directly import and use `validateFeatureFlagWithFilters` for filters and `validateFeatureFlagWithVariants` for variants.

```ts
import { validateFeatureFlag } from "azure-feature-flags/validate";

const enabledOrVariant = await validateFeatureFlag(featureFlag);
```

### `validateFeatureFlagWithFilters`

Validate a feature-flag object against filters/conditions.

> Note: The function will `throw` if a custom filter is encountered without a validator. Hence, it is recommended to wrap the function call in try-catch for handling unsupported custom filters.

> Note, all exports can be imported from root package `azure-feature-flags` but for sake of tree-shaking, they are made available from `azure-feature-flags/validate`

#### Default and TimeWindow filter

If filters are not set on the flag, the validation returns the value set in `featureFlag.enabled`. Otherwise, the `TimeWindow` filter is also tested against current time.

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";

const isValid: boolean = await validateFeatureFlagWithFilters(featureFlag);
```

#### Targeting filter

When a group(s) or user(s) are provided, the value is matched against the targeted audiences (both included and excluded) set in the Azure App Config.

```ts
import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";

const isValid: boolean = await validateFeatureFlagWithFilters(featureFlag, {
  groups: ["editor"],
  users: ["user-id"],
});
```

##### Handle rollout

By default, for a given flag-key and groupName, the function generates a static hash.
That hash is converted to a percentage and compare with rolloutPercentage. This is standard rollout method used in Azure's DotNet SDK.

###### Built-in handlers

The package exports some rollout handlers which can be used instead of creating your own.

- `handleRolloutWithIncrement`

  > Note: This handler is used by default.

  The numbers on incremented on both sides (true and false) according to their ratio
  until a limit has reached. Then the increments are reset and it begins again.

  For eg. For a 50% rollout, first run will be true, second be false, and then repeat.
  For a 75% rollout, first 3 runs will be true and then a false, and then repeat.

  ```ts
  import { validateFeatureFlagWithFilters } from "azure-feature-flags/validate";
  import { handleRolloutWithIncrement } from "azure-feature-flags/rollout";

  const isValid: boolean = await validateFeatureFlagWithFilters(featureFlag, {
    groups: ["editor"],
    handleRollout: handleRolloutWithIncrement,
  });
  ```

###### Custom handler

```ts
import {
  validateFeatureFlagWithFilters,
  type FeatureFlagHandleRollout,
} from "azure-feature-flags/validate";

const handleRollout: FeatureFlagHandleRollout = (
  flagKey,
  rolloutPercentage,
  groupName // groupName is `undefined` for `DefaultRolloutPercentage`.
) => {
  // logic to determine if the feature flag should be enabled or not.
  return groupName === "editor" && rolloutPercentage > Math.random() * 100;
};

const isValid: boolean = await validateFeatureFlagWithFilters(featureFlag, {
  groups: ["editor"],
  handleRollout,
});
```

#### Custom filter

Azure allows for custom filters and they need to be manually tested against. The function accepts an object of custom filters to test against.

The validator function received the `filter` object set in Azure Config as first argument, and groups & users are 2nd param.

```ts
import {
  validateFeatureFlagWithFilters,
  type FeatureFlagCustomFilterValidator,
} from "azure-feature-flags/validate";

const myFilterValidator: FeatureFlagCustomFilterValidator = async (
  filter,
  options
) => {
  // logic to determine if the feature flag should be enabled or not.
  return (
    filter.parameters["foo"] === "bar" && filter.parameters["abc"] !== "def"
  );
};

const isValid: boolean = await validateFeatureFlagWithFilters(featureFlag, {
  customFilterValidators: { "my-filter-name": myFilterValidator },
});
```

### `validateFeatureFlagWithVariants`

> This API is experimental and may change as the Variants feature of Azure App Configuration Feature Manager is under Preview.

```ts
import { validateFeatureFlagWithVariants } from "azure-feature-flags/validate";

// featureFlag with variants. It will throw if the flag is of other type (filters)
const variant = await validateFeatureFlagWithVariants(featureFlag, {
  groups: [],
  users: [],
});
```

The options accepts `handleAllocate` function to override the default allocation function. The default allocation function uses simple increments as per ratio between the allocation percentiles.

## License

MIT © 2024 Siddhant Gupta (@GuptaSiddhant)

MIT [License for Azure App Configuration SDK for JS](https://raw.githubusercontent.com/Azure/azure-sdk-for-js/main/sdk/appconfiguration/app-configuration/LICENSE)
