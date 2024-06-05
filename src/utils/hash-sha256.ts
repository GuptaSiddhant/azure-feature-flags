declare global {
  const Deno: unknown;
}

export async function sha256Hmac(key: string, data: string): Promise<string> {
  if (typeof window == "undefined" && typeof Deno === "undefined") {
    const { createHmac } = await import("crypto");
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

export async function sha256(content: string | Uint8Array): Promise<string> {
  //   Node
  if (typeof window == "undefined" && typeof Deno === "undefined") {
    const { createHash } = await import("crypto");
    return createHash("SHA256").update(content).digest("base64");
  }
  // Browser
  const crypto = globalThis.crypto || (globalThis as any).msCrypto;
  const subtle = crypto.subtle || (crypto as any).webkitSubtle;
  const buf = typeof content === "string" ? strToBuf(content) : content;
  const hash = await subtle.digest({ name: "sha-256" }, buf);

  return uint8ArrayToString(new Uint8Array(hash));
}

function strToBuf(str: string): Uint8Array {
  const len = str.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
}

function uint8ArrayToString(array: Uint8Array): string {
  return btoa([...array].map((x) => String.fromCharCode(x)).join(""));
}

export function base64ToUint8Array(value: string): Uint8Array {
  return new Uint8Array([...atob(value)].map((x) => x.charCodeAt(0)));
}
