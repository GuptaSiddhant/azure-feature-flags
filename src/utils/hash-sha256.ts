type Encoding = "base64" | "hex";

export async function sha256Hmac(key: string, data: string): Promise<string> {
  // Node
  if (checkIsNode()) {
    const { createHmac } = await import("node:crypto");
    return createHmac("SHA256", Buffer.from(key, "base64"))
      .update(data)
      .digest("base64");
  }

  // Browser
  const algorithm = { name: "HMAC", hash: { name: "SHA-256" } };
  return await window.crypto.subtle
    .importKey("raw", base64ToUint8Array(key), algorithm, false, ["sign"])
    .then((key) =>
      window.crypto.subtle.sign(algorithm, key, new TextEncoder().encode(data))
    )
    .then((signature) => new Uint8Array(signature))
    .then(uint8ArrayToString);
}

export async function sha256(
  content: string | Uint8Array,
  encoding: Encoding = "base64"
): Promise<string> {
  // Node
  if (checkIsNode()) {
    const { createHash } = await import("node:crypto");
    return createHash("SHA256").update(content).digest(encoding);
  }
  // Browser
  const crypto = globalThis.crypto || (globalThis as any).msCrypto;
  const subtle = crypto.subtle || (crypto as any).webkitSubtle;
  const buf = typeof content === "string" ? strToBuf(content) : content;
  const hash = await subtle.digest({ name: "sha-256" }, buf);

  switch (encoding) {
    case "hex":
      return buf2hex(hash);
    case "base64":
    default:
      return uint8ArrayToString(new Uint8Array(hash));
  }
}

function strToBuf(str: string): Uint8Array {
  const len = str.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function uint8ArrayToString(array: Uint8Array): string {
  return btoa([...array].map((x) => String.fromCharCode(x)).join(""));
}

function base64ToUint8Array(value: string): Uint8Array {
  return new Uint8Array([...atob(value)].map((x) => x.charCodeAt(0)));
}

function checkIsNode(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.versions &&
    !!process.versions.node
  );
}
