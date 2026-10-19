import { test } from "node:test";
import assert from "node:assert/strict";
import { redactText } from "../lib/redact.js";
import { encryptJSON, decryptJSON } from "../public/vault.js";

test("redaction removes identifiers but keeps results", () => {
  const out = redactText("Patient Name: Asha Rao   Age: 42 Sex: F\nUHID: KA12345678\nPhone: +91 98450 12345\nmail a.rao@example.com\nHemoglobin 11.2 g/dL 12.0 - 15.5\nPlatelets 150000 - 450000");
  assert.ok(!out.includes("Asha"));
  assert.ok(!out.includes("KA12345678"));
  assert.ok(!out.includes("98450"));
  assert.ok(!out.includes("example.com"));
  assert.ok(out.includes("Hemoglobin 11.2 g/dL 12.0 - 15.5"));
  assert.ok(out.includes("150000 - 450000"));
});

test("vault round-trips and rejects a wrong passphrase", async () => {
  const blob = await encryptJSON([{ id: "1", analytes: [] }], "correct horse battery");
  assert.ok(!JSON.stringify(blob).includes("analytes"));
  assert.deepEqual(await decryptJSON(blob, "correct horse battery"), [{ id: "1", analytes: [] }]);
  await assert.rejects(decryptJSON(blob, "wrong passphrase!"), /Wrong passphrase/);
});
