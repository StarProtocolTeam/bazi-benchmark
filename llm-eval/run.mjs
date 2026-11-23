#!/usr/bin/env node
// Asks language models for the BaZi chart of every benchmark case, without tools, through any
// OpenAI-compatible chat completions API, and saves every raw answer for scoring (score.mjs).
// No dependencies; Node 18 or later.
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
//   --max-tokens N      answer length limit (default 8000; reasoning models need room)
//   --token-param NAME  max_tokens (default) or max_completion_tokens
//   --temperature T     sent only when given; otherwise the model's default is used
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
const maxTokens = Number(option("max-tokens", 8000));
const tokenParam = option("token-param", "max_tokens");
const temperature = option("temperature") === undefined ? undefined : Number(option("temperature"));
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

const baseUrl = process.env.LLM_BASE_URL?.replace(/\/+$/, "");
const keyFile = process.env.LLM_API_KEY_FILE ?? path.join(os.homedir(), ".config", "bazi-benchmark", "llm-api-key");
const apiKey = process.env.LLM_API_KEY || (fs.existsSync(keyFile) ? fs.readFileSync(keyFile, "utf8").trim() : "");
if (!baseUrl || !apiKey) throw new Error("Set LLM_BASE_URL (ending in /v1 or similar), and LLM_API_KEY or a key file (LLM_API_KEY_FILE).");

if (option("list-models", false) === true) {
  const response = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error(`GET /models failed: HTTP ${response.status}`);
  const payload = await response.json();
  for (const id of (payload.data ?? []).map((m) => m.id).sort()) console.log(id);
  process.exit(0);
}
if (!models.length) throw new Error("Give --models, e.g. --models gpt-x,claude-y");

const outDir = path.join(here, "results", outName);
fs.mkdirSync(outDir, { recursive: true });
const rawPath = path.join(outDir, "raw.jsonl");
const keyOf = (r) => [r.model, r.lang, r.style, r.case_id, r.run].join("|");
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
  const task = { model, lang, style, case_id: testCase.id, run, prompt: buildPrompt(testCase, { lang, style }) };
  if (!done.has(keyOf(task))) tasks.push(task);
}
console.log(`${tasks.length} requests to send (${done.size} already saved) → ${path.relative(process.cwd(), rawPath)}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ask(task) {
  const body = { model: task.model, messages: [{ role: "user", content: task.prompt }], [tokenParam]: maxTokens };
  if (temperature !== undefined) body.temperature = temperature;
  let lastError = "";
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await response.text();
      if (response.status === 429 || response.status >= 500) {
        lastError = `HTTP ${response.status}: ${text.slice(0, 300)}`;
        await sleep(Math.min(60000, 2000 * 2 ** attempt));
        continue;
      }
      if (!response.ok) return { error: `HTTP ${response.status}: ${text.slice(0, 500)}`, latency_ms: Date.now() - started };
      const payload = JSON.parse(text);
      const choice = payload.choices?.[0] ?? {};
      const message = choice.message ?? {};
      return {
        answer: typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? ""),
        reasoning: message.reasoning_content ?? message.reasoning ?? null,
        finish_reason: choice.finish_reason ?? null,
        returned_model: payload.model ?? null,
        usage: payload.usage ?? null,
        latency_ms: Date.now() - started,
      };
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
