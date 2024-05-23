// @ts-nocheck

/**
 * Gets a uint32 from string in big-endian order order
 */
function s2i(str: string, pos: number) {
  return (
    (str.charCodeAt(pos) << 24) ^
    (str.charCodeAt(pos + 1) << 16) ^
    (str.charCodeAt(pos + 2) << 8) ^
    str.charCodeAt(pos + 3)
  );
}

/**
 * Returns a uint32 as a string in big-endian order order
 */
function i2s(data: number) {
  return (
    String.fromCharCode((data >> 24) & 0xff) +
    String.fromCharCode((data >> 16) & 0xff) +
    String.fromCharCode((data >> 8) & 0xff) +
    String.fromCharCode(data & 0xff)
  );
}

/**
 * Returns a uint32 as a hex-string in big-endian order order
 */
function i2h(data: number = 0) {
  return `00000000${data.toString(16)}`.slice(-8);
}

/**
 * Creates new SHA-1 state
 */
function init(h?: Uint32Array): Uint32Array {
  if (!h) h = new Uint32Array(5);

  // SHA-1 state contains five 32-bit integers
  h[0] = 0x67452301;
  h[1] = 0xefcdab89;
  h[2] = 0x98badcfe;
  h[3] = 0x10325476;
  h[4] = 0xc3d2e1f0;

  return h;
}

/** Array to use to store round words. */
const words = new Uint32Array(80);

/**
 * Perform round function
 */
function round(state: Uint32Array, data: Uint32Array) {
  let i = 0;
  let t = 0;
  let f = 0;

  // initialize hash value for this chunk
  let a = state[0];
  let b = state[1];
  let c = state[2];
  let d = state[3];
  let e = state[4];

  // round 1
  for (i = 0; i < 16; i += 1) {
    words[i] = data[i];

    f = d ^ (b & (c ^ d));
    t = ((a << 5) | (a >>> 27)) + f + e + 0x5a827999 + words[i];
    e = d;
    d = c;
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  for (; i < 20; i += 1) {
    t = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
    t = (t << 1) | (t >>> 31);
    words[i] = t;

    f = d ^ (b & (c ^ d));
    t = ((a << 5) | (a >>> 27)) + f + e + 0x5a827999 + t;
    e = d;
    d = c;
    // `>>> 0` necessary to avoid iOS/Safari 10 optimization bug
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  // round 2
  for (; i < 32; i += 1) {
    t = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
    t = (t << 1) | (t >>> 31);
    words[i] = t;
    f = b ^ c ^ d;
    t = ((a << 5) | (a >>> 27)) + f + e + 0x6ed9eba1 + t;
    e = d;
    d = c;
    // `>>> 0` necessary to avoid iOS/Safari 10 optimization bug
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  for (; i < 40; i += 1) {
    t = words[i - 6] ^ words[i - 16] ^ words[i - 28] ^ words[i - 32];
    t = (t << 2) | (t >>> 30);
    words[i] = t;
    f = b ^ c ^ d;
    t = ((a << 5) | (a >>> 27)) + f + e + 0x6ed9eba1 + t;
    e = d;
    d = c;
    // `>>> 0` necessary to avoid iOS/Safari 10 optimization bug
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  // round 3
  for (; i < 60; i += 1) {
    t = words[i - 6] ^ words[i - 16] ^ words[i - 28] ^ words[i - 32];
    t = (t << 2) | (t >>> 30);
    words[i] = t;
    f = (b & c) | (d & (b ^ c));
    t = ((a << 5) | (a >>> 27)) + f + e + 0x8f1bbcdc + t;
    e = d;
    d = c;
    // `>>> 0` necessary to avoid iOS/Safari 10 optimization bug
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  // round 4
  for (; i < 80; i += 1) {
    t = words[i - 6] ^ words[i - 16] ^ words[i - 28] ^ words[i - 32];
    t = (t << 2) | (t >>> 30);
    words[i] = t;
    f = b ^ c ^ d;
    t = ((a << 5) | (a >>> 27)) + f + e + 0xca62c1d6 + t;
    e = d;
    d = c;
    // `>>> 0` necessary to avoid iOS/Safari 10 optimization bug
    c = ((b << 30) | (b >>> 2)) >>> 0;
    b = a;
    a = t;
  }

  // update hash state
  state[0] += a;
  state[1] += b;
  state[2] += c;
  state[3] += d;
  state[4] += e;
}

/**
 * Pre-processing round buffer for string input
 */
function preprocess(
  str: string,
  buf: Uint32Array,
  state: Uint32Array,
  offset: number = 0
) {
  while (str.length >= 64) {
    for (let i = offset; i < 16; i++) buf[i] = s2i(str, i * 4);
    str = str.slice(64 - offset * 4);
    offset = 0;

    round(state, buf);
  }

  return str;
}

/**
 * Repeatable part
 */
function finish(
  len: number,
  buf: Uint32Array,
  state: Uint32Array,
  offset: number = 0
) {
  const len64hi = (len / 0x100000000) >>> 0;
  const len64lo = len >>> 0;

  for (let i = offset + 1; i < buf.length; i++) buf[i] = 0;

  if (offset >= 14) {
    round(state, buf);
    for (let i = 0; i < buf.length; i++) buf[i] = 0;
  }

  buf[14] = (len64hi << 3) + (((len64lo << 3) / 0x100000000) >>> 0);
  buf[15] = len64lo << 3;

  round(state, buf);
}

/**
 * Adds padding to message
 */
function finalizestr(
  chunk: string,
  len: number,
  buf: Uint32Array,
  state: Uint32Array,
  offset: number = 0
) {
  for (; chunk.length >= 4; offset++) {
    buf[offset] = s2i(chunk, 0);
    chunk = chunk.slice(4);
  }

  if (offset >= 16) {
    round(state, buf);
    offset = 0;
  }

  buf[offset] = s2i(`${chunk}\x80\x00\x00\x00`, 0);
  finish(len, buf, state, offset);
}

/**
 * Output depending on format
 */
function out(state: Uint32Array) {
  return (
    i2h(state[0]) +
    i2h(state[1]) +
    i2h(state[2]) +
    i2h(state[3]) +
    i2h(state[4])
  );
}

/**
 * Hash as single function
 */
export function sha1(message: string): string {
  const buf = new Uint32Array(16);
  const state = init();
  finalizestr(preprocess(message, buf, state), message.length, buf, state);

  return out(state);
}
