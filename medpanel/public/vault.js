// Opt-in encrypted history, stored only on this device.
// AES-256-GCM with a key derived from the user's passphrase (PBKDF2-SHA256).
// The passphrase and key never leave the browser; the server never sees history.

const ITERATIONS = 310000;
const STORAGE_KEY = "medpanel.vault.v1";
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = (buf) => {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
};
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(passphrase, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJSON(obj, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
  return { v: 1, alg: "AES-256-GCM/PBKDF2-SHA256", iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}

export async function decryptJSON(blob, passphrase) {
  if (blob?.v !== 1) throw new Error("Unknown vault format");
  const key = await deriveKey(passphrase, unb64(blob.salt));
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(blob.iv) }, key, unb64(blob.ct));
    return JSON.parse(dec.decode(pt));
  } catch {
    throw new Error("Wrong passphrase or corrupted vault");
  }
}

/** Keep only what trend charts need; drops free-text model output. */
export function slimReport(r) {
  return {
    id: r.id,
    date: r.report_date || r.generated_at.slice(0, 10),
    analytes: r.analytes
      .filter((a) => a.key && a.canonical_value != null)
      .map((a) => ({ key: a.key, label: a.label, value: a.canonical_value, unit: a.canonical_unit, flag: a.flag })),
  };
}

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export const vault = {
  exists() {
    return Boolean(storage()?.getItem(STORAGE_KEY));
  },
  async load(passphrase) {
    const raw = storage()?.getItem(STORAGE_KEY);
    return raw ? decryptJSON(JSON.parse(raw), passphrase) : [];
  },
  async save(reports, passphrase) {
    const blob = await encryptJSON(reports, passphrase);
    storage()?.setItem(STORAGE_KEY, JSON.stringify(blob));
    return blob;
  },
  exportBlob() {
    return storage()?.getItem(STORAGE_KEY) ?? null;
  },
  importBlob(text) {
    const blob = JSON.parse(text);
    if (blob?.v !== 1 || !blob.ct) throw new Error("Not a MedPanel vault file");
    storage()?.setItem(STORAGE_KEY, JSON.stringify(blob));
  },
  wipe() {
    storage()?.removeItem(STORAGE_KEY);
  },
};
