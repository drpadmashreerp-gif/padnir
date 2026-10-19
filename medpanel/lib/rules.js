// Deterministic, code-enforced flagging. The LLM never decides whether a value
// is critical: these rules run before and after the agents, and their output
// is rendered verbatim regardless of what the model says.
import { ANALYTES, resolveAnalyte, toCanonical } from "./analytes.js";

export const FLAGS = ["critical_low", "critical_high", "implausible", "low", "high", "normal", "unknown"];

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Normalise and flag one extracted analyte.
 * @param {{name:string,value:number|null,value_text?:string,unit?:string,ref_low?:number|null,ref_high?:number|null}} raw
 */
export function evaluateAnalyte(raw) {
  const key = resolveAnalyte(raw.name);
  const value = num(raw.value);
  const out = {
    name: raw.name,
    key,
    label: key ? ANALYTES[key].label : raw.name,
    value,
    value_text: raw.value_text ?? (value === null ? "" : String(value)),
    unit: raw.unit ?? "",
    ref_low: num(raw.ref_low),
    ref_high: num(raw.ref_high),
    canonical_value: null,
    canonical_unit: key ? ANALYTES[key].unit : null,
    group: key ? ANALYTES[key].group : "other",
    flag: "unknown",
    critical: false,
    reason: "",
  };
  if (value === null) {
    out.reason = "Non-numeric result";
    return out;
  }

  if (key) {
    const def = ANALYTES[key];
    const canon = toCanonical(key, value, raw.unit);
    out.canonical_value = canon === null ? null : round(canon);

    if (canon !== null) {
      const [pmin, pmax] = def.plausible ?? [-Infinity, Infinity];
      if (canon < pmin || canon > pmax) {
        out.flag = "implausible";
        out.reason = `Outside physiologically plausible range (${pmin}–${pmax} ${def.unit}); likely an OCR or unit error — verify against the original report.`;
        return out;
      }
      const c = def.critical ?? {};
      if (c.low != null && canon < c.low) {
        return { ...out, flag: "critical_low", critical: true, reason: `Below critical limit ${c.low} ${def.unit}` };
      }
      if (c.high != null && canon > c.high) {
        return { ...out, flag: "critical_high", critical: true, reason: `Above critical limit ${c.high} ${def.unit}` };
      }
    } else if (raw.unit) {
      out.reason = `Unrecognised unit "${raw.unit}" — critical rules could not be applied.`;
    }
  }

  // Prefer the lab's own reference interval (same units as the printed value).
  let lo = out.ref_low, hi = out.ref_high, v = value, source = "lab";
  if (lo === null && hi === null && key && out.canonical_value !== null) {
    [lo, hi] = ANALYTES[key].ref;
    v = out.canonical_value;
    source = "default";
  }
  if (lo === null && hi === null) return out;
  if (lo !== null && v < lo) out.flag = "low";
  else if (hi !== null && v > hi) out.flag = "high";
  else out.flag = "normal";
  if (source === "default") out.reason = (out.reason ? out.reason + " " : "") + "Flagged against default adult range.";
  return out;
}

export function evaluatePanel(analytes) {
  const evaluated = analytes.map(evaluateAnalyte);
  const criticals = evaluated
    .filter((a) => a.critical)
    .map((a) => ({
      key: a.key,
      label: a.label,
      value: a.value,
      unit: a.unit,
      flag: a.flag,
      message: `${a.label} ${a.value_text} ${a.unit} — ${a.reason}`.replace(/\s+/g, " "),
    }));
  const implausible = evaluated.filter((a) => a.flag === "implausible").map((a) => a.label);
  return { analytes: evaluated, criticals, implausible };
}

/**
 * Post-check on the Chief Physician output: every code-detected critical value
 * must be acknowledged. Missing ones are injected and the urgency raised.
 */
export function enforceCriticals(synthesis, criticals) {
  const s = structuredClone(synthesis ?? {});
  s.critical_alerts = Array.isArray(s.critical_alerts) ? s.critical_alerts : [];
  const mentioned = (c) =>
    s.critical_alerts.some((t) => t.toLowerCase().includes(c.label.toLowerCase().split(" ")[0]));
  const injected = [];
  for (const c of criticals) {
    if (!mentioned(c)) {
      s.critical_alerts.unshift(`${c.message}. Contact a clinician or emergency service promptly.`);
      injected.push(c.label);
    }
  }
  if (criticals.length) s.urgency = "urgent";
  s.enforced_by_rules = injected;
  return s;
}

const round = (v) => Math.round(v * 1000) / 1000;
