import {
  type ConfigurationSetting,
  type FeatureFlagServiceWithKeyOptions,
  type FeatureFlagServiceOptions,
  featureFlagContentType,
  featureFlagPrefix,
} from "./utils/app-config.js";
import { sha256, sha256Hmac } from "./utils/hash-sha256.js";

const ConnectionStringRegex = /Endpoint=(.*);Id=(.*);Secret=(.*)/;

export type {
  ConfigurationSetting,
  FeatureFlagServiceOptions,
  FeatureFlagServiceWithKeyOptions,
} from "./utils/app-config.js";

/**
 * A lightweight alternative to Azure's AppConfigurationClient to generate
 * a client for working with Feature Flags.
 *
 * > [Note] This `lite` alternative should NOT be used outside the scope of this library.
 *
 * @example
 * ```ts
 * import { AppConfigurationClientLite } from "azure-feature-flags/client";
 * const connectionString = process.env.AZURE_CONFIG_ACCESS_STRING;
 * const client = new AppConfigurationClientLite(connectionString);
 * //    ^ use this client anywhere in this library's services.
 * ```
 */
export class AppConfigurationClientLite {
  #endpoint: string;
  #credential: string;
  #secret: string;

  constructor(connectionString: string) {
    if (!connectionString) {
      throw new Error("connectionString is required.");
    }

    const match = connectionString.match(ConnectionStringRegex);
    if (!match) {
      throw new TypeError(
        `Invalid connection string. Valid connection strings should match the regex '${ConnectionStringRegex.source}'.`
      );
    }

    this.#endpoint = match[1]!;
    this.#credential = match[2]!;
    this.#secret = match[3]!;
  }

  async list(
    options: FeatureFlagServiceOptions = {}
  ): Promise<Array<ConfigurationSetting>> {
    try {
      const { items } = await this.#makeRequest<{
        items: ConfigurationSetting[];
      }>(
        "",
        { ...options, keyFilter: this.#prependFeatureFlagPrefix("*") },
        "GET",
        undefined,
        (json) => "items" in json && Array.isArray(json.items)
      );

      return items;
    } catch {
      return [];
    }
  }

  async get({
    keyFilter,
    ...options
  }: FeatureFlagServiceWithKeyOptions): Promise<ConfigurationSetting | null> {
    try {
      const setting = await this.#makeRequest<ConfigurationSetting>(
        this.#prependFeatureFlagPrefix(keyFilter),
        options,
        "GET"
      );
      setting.contentType = featureFlagContentType;
      return setting;
    } catch {
      return null;
    }
  }

  async delete({
    keyFilter,
    ...options
  }: FeatureFlagServiceWithKeyOptions): Promise<ConfigurationSetting | null> {
    try {
      return await this.#makeRequest<ConfigurationSetting>(
        this.#prependFeatureFlagPrefix(keyFilter),
        options,
        "DELETE"
      );
    } catch {
      return null;
    }
  }

  async set(
    setting: ConfigurationSetting,
    options: FeatureFlagServiceOptions = {}
  ): Promise<ConfigurationSetting | null> {
    try {
      return await this.#makeRequest<ConfigurationSetting>(
        this.#prependFeatureFlagPrefix(setting.key),
        options,
        "PUT",
        JSON.stringify(setting)
      );
    } catch {
      return null;
    }
  }

  async #makeRequest<T = unknown>(
    path: string,
    options: Partial<FeatureFlagServiceWithKeyOptions>,
    method?: "GET" | "DELETE" | "PUT",
    body?: BodyInit,
    validateResponse?: (json: object) => boolean
  ): Promise<T> {
    const { abortSignal, acceptDateTime, labelFilter, keyFilter } = options;

    const searchParams = new URLSearchParams();
    searchParams.set("api-version", "2023-10-01");
    if (keyFilter) {
      searchParams.set("key", this.#prependFeatureFlagPrefix(keyFilter));
    }
    if (labelFilter) {
      searchParams.set("label", labelFilter);
    }

    const headers = new Headers();
    headers.set(
      "Accept",
      `${featureFlagContentType}, application/problem+json`
    );
    headers.set("Content-Type", "application/vnd.microsoft.appconfig.kv+json");
    if (acceptDateTime) {
      headers.set("Accept-Datetime", acceptDateTime.toISOString());
    }

    const url = `${this.#endpoint}/kv/${encodeURIComponent(
      path
    )}?${searchParams.toString()}`;

    const request = await this.#addAuthHeaders(
      new Request(url, {
        method: method ?? "GET",
        headers,
        signal: abortSignal,
        body,
      }),
      body
    );

    const response = await fetch(request);
    if (!response.ok) throw new Error("not ok");
    const json: T = await response.json();

    if (
      !json ||
      typeof json !== "object" ||
      (validateResponse && !validateResponse(json))
    ) {
      throw new TypeError("Response is invalid");
    }
    return json;
  }

  async #addAuthHeaders(request: Request, body?: BodyInit): Promise<Request> {
    const verb = request.method;
    const utcNow = new Date().toUTCString();

    const content =
      (body === null || body === void 0 ? void 0 : body.toString()) || "";
    const contentHash = await sha256(content);

    const signedHeaders = "x-ms-date;host;x-ms-content-sha256";
    const url = new URL(request.url);
    const query = url.search;
    const urlPathAndQuery = query ? `${url.pathname}${query}` : url.pathname;
    const stringToSign = `${verb}\n${urlPathAndQuery}\n${utcNow};${url.host};${contentHash}`;
    const signature = await sha256Hmac(this.#secret, stringToSign);
    request.headers.set("x-ms-date", utcNow);
    request.headers.set("x-ms-content-sha256", contentHash);
    request.headers.set(
      "Authorization",
      `HMAC-SHA256 Credential=${
        this.#credential
      }&SignedHeaders=${signedHeaders}&Signature=${signature}`
    );

    return request;
  }

  #prependFeatureFlagPrefix(input: string): string {
    return input.startsWith(featureFlagPrefix)
      ? input
      : `${featureFlagPrefix}${input}`;
  }
}
