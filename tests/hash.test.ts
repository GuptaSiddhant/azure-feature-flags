import { describe, expect, it } from "vitest";
import { sha256 } from "../src/utils/hash-sha256";

describe(sha256, () => {
  it("should match snapshots", async () => {
    expect(await sha256("test")).toMatchInlineSnapshot(
      `"n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg="`
    );
    expect(await sha256("flag-.-group")).toMatchInlineSnapshot(
      `"lVWcBYmF05jGiZkRaLT6rds7yDRPZCapqMBI9cFw3hQ="`
    );
  });
});
