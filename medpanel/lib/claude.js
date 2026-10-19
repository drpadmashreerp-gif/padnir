import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.MEDPANEL_MODEL || "claude-opus-5-5";

let client;
const getClient = () => (client ??= new Anthropic());

export class ModelError extends Error {}

/**
 * One structured-output call. `system` is an array of text blocks; the first
 * (the shared MedPanel prompt) is cached so parallel specialists reuse it.
 */
export async function callJSON({ system, content, schema, effort = "medium", maxTokens = 16000 }) {
  let res;
  try {
    res = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content }],
      output_config: { effort, format: { type: "json_schema", schema } },
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ModelError("Claude API key missing or invalid.");
    if (err instanceof Anthropic.RateLimitError) throw new ModelError("Claude API rate limit reached; try again shortly.");
    if (err instanceof Anthropic.BadRequestError) throw new ModelError(`Claude API rejected the request: ${err.message}`);
    if (err instanceof Anthropic.APIError) throw new ModelError(`Claude API error ${err.status ?? ""}`.trim());
    throw err;
  }
  if (res.stop_reason === "refusal") throw new ModelError("The model declined this request.");
  if (res.stop_reason === "max_tokens") throw new ModelError("Model output was truncated.");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    return JSON.parse(text);
  } catch {
    throw new ModelError("Model returned malformed JSON.");
  }
}

export const cachedSystem = (prompt, extra) => [
  { type: "text", text: prompt, cache_control: { type: "ephemeral" } },
  ...(extra ? [{ type: "text", text: extra }] : []),
];
