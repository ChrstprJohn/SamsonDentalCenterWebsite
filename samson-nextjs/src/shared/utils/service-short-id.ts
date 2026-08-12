// Lossless, deterministic base62 encoding of UUIDs. No dependencies.
// 36-char uuid (32 hex digits) -> ~22-char short id.

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encodeServiceId(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const n = BigInt('0x' + hex);
  if (n === BigInt(0)) return '0';
  let out = '';
  let value = n;
  while (value > BigInt(0)) {
    out = BASE62[Number(value % BigInt(62))] + out;
    value /= BigInt(62);
  }
  return out;
}

export function decodeServiceId(shortId: string): string {
  if (!shortId) {
    throw new Error('Short id is required');
  }
  let n = BigInt(0);
  for (const ch of shortId) {
    const idx = BASE62.indexOf(ch);
    if (idx === -1) {
      throw new Error(`Invalid base62 character: "${ch}"`);
    }
    n = n * BigInt(62) + BigInt(idx);
  }
  const hex = n.toString(16);
  if (hex.length > 32) {
    throw new Error('Short id out of range for a UUID');
  }
  const padded = hex.padStart(32, '0');
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20)}`;
}
