import { describe, expect, it } from "vitest";
import { sha1 } from "../src/utils/hash-sha-1";

describe(sha1, () => {
  it("should match snapshots", () => {
    expect(sha1("test")).toMatchInlineSnapshot(
      `"a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"`
    );
    expect(sha1("flag-.-group")).toMatchInlineSnapshot(
      `"76162787155f23d6cbf1a6ff4b742c8be38eb9b7"`
    );
  });
});
