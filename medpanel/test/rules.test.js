import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateAnalyte, evaluatePanel, enforceCriticals } from "../lib/rules.js";

test("critical potassium is flagged by code regardless of lab range", () => {
  const a = evaluateAnalyte({ name: "Serum Potassium", value: 6.8, unit: "mmol/L", ref_low: 3.5, ref_high: 7.5 });
  assert.equal(a.flag, "critical_high");
  assert.equal(a.critical, true);
});

test("unit conversion: glucose mmol/L and platelets in lakh/cumm", () => {
  assert.equal(evaluateAnalyte({ name: "Fasting Blood Sugar", value: 2.0, unit: "mmol/L" }).flag, "critical_low");
  assert.equal(evaluateAnalyte({ name: "Platelet Count", value: 0.15, unit: "lakh/cumm" }).flag, "critical_low");
  assert.equal(evaluateAnalyte({ name: "Platelet Count", value: 2.5, unit: "lakh/cumm", ref_low: 1.5, ref_high: 4.5 }).flag, "normal");
  assert.equal(evaluateAnalyte({ name: "WBC", value: 7500, unit: "/cumm" }).canonical_value, 7.5);
});

test("implausible values are not interpreted", () => {
  const a = evaluateAnalyte({ name: "Potassium", value: 45, unit: "mmol/L" });
  assert.equal(a.flag, "implausible");
  assert.equal(a.critical, false);
});

test("lab range preferred, default range as fallback, unknown analytes kept", () => {
  assert.equal(evaluateAnalyte({ name: "Hemoglobin", value: 12.5, unit: "g/dL", ref_low: 13, ref_high: 17 }).flag, "low");
  assert.equal(evaluateAnalyte({ name: "LDL Cholesterol", value: 160, unit: "mg/dL" }).flag, "high");
  assert.equal(evaluateAnalyte({ name: "Mystery marker", value: 3, unit: "x" }).flag, "unknown");
});

test("enforceCriticals injects alerts the model omitted and forces urgency", () => {
  const panel = evaluatePanel([{ name: "Sodium", value: 115, unit: "mmol/L" }]);
  const s = enforceCriticals({ urgency: "routine", critical_alerts: [] }, panel.criticals);
  assert.equal(s.urgency, "urgent");
  assert.equal(s.critical_alerts.length, 1);
  assert.deepEqual(s.enforced_by_rules, ["Sodium"]);
  const ok = enforceCriticals({ urgency: "urgent", critical_alerts: ["Sodium is dangerously low"] }, panel.criticals);
  assert.deepEqual(ok.enforced_by_rules, []);
});
