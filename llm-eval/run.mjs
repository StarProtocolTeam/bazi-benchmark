#!/usr/bin/env node
// Asks language models for the BaZi chart of every benchmark case, without tools, and saves every
// raw answer for scoring (score.mjs). Two providers:
//   --provider openai     any OpenAI-compatible /chat/completions API (default)
//   --provider anthropic  Anthropic's Messages API, called directly (https://api.anthropic.com/v1)
// No dependencies (plain fetch, so the benchmark stays dependency-free); Node 18 or later.
//
// Anthropic: key from ANTHROPIC_API_KEY or ~/.config/bazi-benchmark/anthropic-api-key (endpoint override:
// BENCH_ANTHROPIC_BASE_URL, not ANTHROPIC_BASE_URL, which other tools set without /v1); model ids such
// as claude-sonnet-5-5. Thinking and effort are left at each model's default (adaptive thinking is
// always on for current models); --effort low|medium|high|xhigh|max overrides it. A safety refusal is
// recorded as stop_reason "refusal" with no answer. No server-side fallback is requested, so every
// answer comes from the model named.
//
//   export LLM_BASE_URL=https://api.example.com/v1   # endpoint that serves /chat/completions
//   export LLM_API_KEY=...                           # never printed or saved
//   (or put the key in a file and set LLM_API_KEY_FILE; ~/.config/bazi-benchmark/llm-api-key is read
//   when neither is set)
//   node llm-eval/run.mjs --models gpt-x,claude-y --runs 3 --lang en,zh --style plain,spec
//
// Options:
//   --models a,b        model names as the API expects them (required)
//   --runs N            answers per case, model, language and style (default 3)
//   --lang en,zh,ja     prompt languages (default en)
//   --style plain,spec  prompt styles, see prompts.mjs (default plain,spec)
//   --cases id,id       only these case ids (default all)
//   --out NAME          results folder under llm-eval/results/ (default today's date)
//   --concurrency N     requests in flight (default 4)
//   --max-tokens N      answer length limit, thinking included (default 8000; 16000 for anthropic)
//   --token-param NAME  max_tokens (default) or max_completion_tokens
//   --temperature T     sent only when given (openai only); otherwise the model's default is used
//   --effort LEVEL      anthropic only: output_config.effort; otherwise the model's default is used
//   --timeout S         seconds per request (default 300)
//   --dry-run           print the prompts and exit
//   --list-models       print the model ids the API offers and exit
//
// Results are appended to llm-eval/results/<NAME>/raw.jsonl. Rerunning the same command skips
// answers that are already saved, so an interrupted run can be resumed.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { LANGS, STYLES, buildPrompt } from "./prompts.mjs";

const here = path.dirname(new URL(import.meta.url).pathname);
const benchmark = JSON.parse(fs.readFileSync(path.join(here, "..", "cases.json"), "utf8"));

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (value === undefined || value.startsWith("--")) return true;
  return value;
}
const list = (value) => String(value).split(",").map((item) => item.trim()).filter(Boolean);

const models = option("models") ? list(option("models")) : [];
const runs = Number(option("runs", 3));
const langs = list(option("lang", "en"));
const styles = list(option("style", "plain,spec"));
const caseIds = option("cases") ? list(option("cases")) : benchmark.cases.map((c) => c.id);
const outName = option("out", new Date().toISOString().slice(0, 10));
const concurrency = Number(option("concurrency", 4));
const provider = option("provider", "openai");
if (provider !== "openai" && provider !== "anthropic") throw new Error("--provider must be openai or anthropic");
const maxTokens = Number(option("max-tokens", provider === "anthropic" ? 16000 : 8000));
const effort = option("effort");
if (effort !== undefined && provider !== "anthropic") throw new Error("--effort is only for --provider anthropic");
const tokenParam = option("token-param", "max_tokens");
const temperature = option("temperature") === undefined ? undefined : Number(option("temperature"));
// API version 2026-10-21 rejects temperature, top_p and top_k on every model.
if (temperature !== undefined && provider === "anthropic") throw new Error("--temperature is not accepted by the Anthropic API version used here");
const timeoutMs = Number(option("timeout", 300)) * 1000;
const dryRun = option("dry-run", false) === true;

for (const lang of langs) if (!LANGS.includes(lang)) throw new Error(`--lang must be from ${LANGS.join(", ")}`);
for (const style of styles) if (!STYLES.includes(style)) throw new Error(`--style must be from ${STYLES.join(", ")}`);
const cases = caseIds.map((id) => benchmark.cases.find((c) => c.id === id) ?? (() => { throw new Error(`Unknown case: ${id}`); })());

if (dryRun) {
  for (const lang of langs) for (const style of styles) for (const testCase of cases) {
    console.log(`===== ${testCase.id} · ${lang} · ${style}\n${buildPrompt(testCase, { lang, style })}\n`);
  }
  process.exit(0);
}

const ANTHROPIC_VERSION = "2026-10-21";
const readKey = (envName, fileEnvName, fileName) => {
  const file = process.env[fileEnvName] ?? path.join(os.homedir(), ".config", "bazi-benchmark", fileName);
  return process.env[envName] || (fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : "");
};
const baseUrl = (provider === "anthropic" ? process.env.BENCH_ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1" : process.env.LLM_BASE_URL)?.replace(/\/+$/, "");
const apiKey = provider === "anthropic"
  ? readKey("ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY_FILE", "anthropic-api-key")
  : readKey("LLM_API_KEY", "LLM_API_KEY_FILE", "llm-api-key");
if (!baseUrl || !apiKey) {
  throw new Error(provider === "anthropic"
    ? "Set ANTHROPIC_API_KEY, or put the key in ~/.config/bazi-benchmark/anthropic-api-key."
    : "Set LLM_BASE_URL (ending in /v1 or similar), and LLM_API_KEY or a key file (LLM_API_KEY_FILE).");
}
const authHeaders = provider === "anthropic"
  ? { "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION }
  : { Authorization: `Bearer ${apiKey}` };

if (option("list-models", false) === true) {
  const response = await fetch(`${baseUrl}/models${provider === "anthropic" ? "?limit=1000" : ""}`, { headers: authHeaders });
  if (!response.ok) throw new Error(`GET /models failed: HTTP ${response.status}`);
  const payload = await response.json();
  for (const id of (payload.data ?? []).map((m) => m.id).sort()) console.log(id);
  process.exit(0);
}
if (!models.length) throw new Error("Give --models, e.g. --models gpt-x,claude-y");

const outDir = path.join(here, "results", outName);
fs.mkdirSync(outDir, { recursive: true });
const rawPath = path.join(outDir, "raw.jsonl");
const keyOf = (r) => [r.provider ?? "openai", r.model, r.lang, r.style, r.case_id, r.run].join("|");
const done = new Set();
if (fs.existsSync(rawPath)) {
  for (const line of fs.readFileSync(rawPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    if (!record.error) done.add(keyOf(record));
  }
}

const tasks = [];
for (const model of models) for (const lang of langs) for (const style of styles) for (const testCase of cases) for (let run = 1; run <= runs; run += 1) {
  const task = { provider, model, lang, style, case_id: testCase.id, run, prompt: buildPrompt(testCase, { lang, style }) };
  if (!done.has(keyOf(task))) tasks.push(task);
}
console.log(`${tasks.length} requests to send (${done.size} already saved) → ${path.relative(process.cwd(), rawPath)}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestFor(task) {
  if (provider === "anthropic") {
    const body = { model: task.model, max_tokens: maxTokens, messages: [{ role: "user", content: task.prompt }] };
    if (effort !== undefined) body.output_config = { effort };
    return { url: `${baseUrl}/messages`, body };
  }
  const body = { model: task.model, messages: [{ role: "user", content: task.prompt }], [tokenParam]: maxTokens };
  if (temperature !== undefined) body.temperature = temperature;
  return { url: `${baseUrl}/chat/completions`, body };
}

// Normalizes either API's response to the fields saved in raw.jsonl.
function readResponse(payload) {
  if (provider === "anthropic") {
    const blocks = payload.content ?? [];
    const thinking = blocks.filter((b) => b.type === "thinking" && b.thinking).map((b) => b.thinking).join("\n\n");
    const usage = payload.usage ?? null;
    return {
      answer: blocks.filter((b) => b.type === "text").map((b) => b.text).join(""),
      reasoning: thinking || null,
      finish_reason: payload.stop_reason ?? null,
      refusal: payload.stop_reason === "refusal" ? payload.stop_details ?? {} : undefined,
      returned_model: payload.model ?? null,
      // completion_tokens / prompt_tokens mirror the OpenAI names so score.mjs reads both the same way.
      usage: usage && { ...usage, prompt_tokens: usage.input_tokens, completion_tokens: usage.output_tokens },
    };
  }
  const choice = payload.choices?.[0] ?? {};
  const message = choice.message ?? {};
  return {
    answer: typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? ""),
    reasoning: message.reasoning_content ?? message.reasoning ?? null,
    finish_reason: choice.finish_reason ?? null,
    returned_model: payload.model ?? null,
    usage: payload.usage ?? null,
  };
}

async function ask(task) {
  const { url, body } = requestFor(task);
  let lastError = "";
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await response.text();
      const retryable = response.headers.get("x-should-retry") === "true" || (response.headers.get("x-should-retry") !== "false" && (response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500));
      if (!response.ok && retryable) {
        lastError = `HTTP ${response.status}: ${text.slice(0, 300)}`;
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : Math.min(60000, 2000 * 2 ** attempt));
        continue;
      }
      if (!response.ok) return { error: `HTTP ${response.status}: ${text.slice(0, 500)}`, latency_ms: Date.now() - started };
      return { ...readResponse(JSON.parse(text)), latency_ms: Date.now() - started };
    } catch (error) {
      lastError = error.name === "TimeoutError" ? `timeout after ${timeoutMs / 1000}s` : error.message;
      await sleep(Math.min(60000, 2000 * 2 ** attempt));
    }
  }
  return { error: lastError };
}

let finished = 0;
let failed = 0;
const out = fs.createWriteStream(rawPath, { flags: "a" });
async function worker() {
  while (tasks.length) {
    const task = tasks.shift();
    const result = await ask(task);
    out.write(`${JSON.stringify({ ...task, ...result, at: new Date().toISOString() })}\n`);
    finished += 1;
    if (result.error) failed += 1;
    console.log(`${result.error ? "✗" : "✓"} ${task.model} ${task.lang}/${task.style} ${task.case_id} #${task.run}${result.error ? ` — ${result.error.slice(0, 160)}` : ` (${(result.latency_ms / 1000).toFixed(1)}s)`}`);
  }
}
await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
await new Promise((resolve) => out.end(resolve));
console.log(`\nDone: ${finished - failed} saved, ${failed} failed (failed ones are retried on the next run). Score with: node llm-eval/score.mjs ${outName}`);
