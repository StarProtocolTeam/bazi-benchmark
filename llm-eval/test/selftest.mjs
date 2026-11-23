#!/usr/bin/env node
// Checks run.mjs and score.mjs against a fake OpenAI-compatible server, without any real API:
//   node llm-eval/test/selftest.mjs
// Fake OpenAI-compatible models: mock-good (always right), mock-nodst (ignores daylight saving),
// mock-messy (no PILLARS line, pairs in prose), mock-bad (HTTP 400). The first request gets a 429 to
// test retries. Fake Anthropic models (/v1/messages): claude-good (right, with an empty thinking
// block) and claude-refuse (stop_reason "refusal").
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.join(here, "..");
const benchmark = JSON.parse(fs.readFileSync(path.join(root, "..", "cases.json"), "utf8"));

function caseFromPrompt(prompt) {
  // Prompts are built from the case; find the case whose birth line appears in the prompt.
  return benchmark.cases.find((c) => {
    const b = c.request.birth;
    const date = typeof b.date === "string" ? b.date : `year ${b.date.year}, leap month ${b.date.month}, day ${b.date.day}`;
    return prompt.includes(date) && prompt.includes(b.time ? `at ${b.time}` : "birth time unknown") && prompt.includes(b.place.name);
  });
}
const line = (p) => `PILLARS: ${p.year} ${p.month} ${p.day} ${p.hour || "—"}`;

let first = true;
const server = http.createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const request = JSON.parse(body);
  if (req.url === "/v1/messages") {
    assert.equal(req.headers["x-api-key"], "anthropic-test-key");
    assert.equal(req.headers["anthropic-version"], "2026-10-21");
    assert.equal(req.headers.authorization, undefined);
    assert.equal(request.temperature, undefined);
    assert.equal(request.thinking, undefined, "thinking left at the model default");
    assert.equal(request.max_tokens, 16000);
    const testCase = caseFromPrompt(request.messages[0].content);
    const refuse = request.model === "claude-refuse";
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({
      type: "message",
      model: request.model,
      content: refuse ? [] : [{ type: "thinking", thinking: "", signature: "x" }, { type: "text", text: `Done.\n${line(testCase.expected.pillars)}` }],
      stop_reason: refuse ? "refusal" : "end_turn",
      stop_details: refuse ? { type: "refusal", category: null, explanation: "test" } : null,
      usage: { input_tokens: 300, output_tokens: 77 },
    }));
    return;
  }
  assert.equal(req.headers.authorization, "Bearer test-key");
  if (first) {
    first = false;
    res.writeHead(429).end("slow down");
    return;
  }
  if (request.model === "mock-bad") {
    res.writeHead(400, { "Content-Type": "application/json" }).end('{"error":"no such model"}');
    return;
  }
  const testCase = caseFromPrompt(request.messages[0].content);
  let pillars = testCase.expected.pillars;
  if (request.model === "mock-nodst") {
    const noDst = testCase.different_rules.find((r) => r.rule === "noDst");
    if (noDst) pillars = { ...pillars, ...noDst.pillars };
  }
  const answer = request.model === "mock-messy"
    ? `Year ${pillars.year}, month ${pillars.month}, day ${pillars.day}, hour ${pillars.hour || "unknown"}.`
    : `Working it out...\n\n**${line(pillars)}**`;
  res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({
    model: `${request.model}-2026`,
    choices: [{ message: { content: answer }, finish_reason: "stop" }],
    usage: { completion_tokens: 42 },
  }));
});
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();

const out = "selftest";
const outDir = path.join(root, "results", out);
fs.rmSync(outDir, { recursive: true, force: true });
const env = { ...process.env, LLM_BASE_URL: `http://127.0.0.1:${port}/v1`, LLM_API_KEY: "test-key" };
const run = (args, runEnv = env) => new Promise((resolve, reject) => {
  // Run asynchronously so this process can keep serving the fake API.
  import("node:child_process").then(({ execFile }) => execFile(process.execPath, [path.join(root, "run.mjs"), ...args], { env: runEnv }, (error, stdout, stderr) => (error ? reject(new Error(stderr || error.message)) : resolve(stdout))));
});

try {
  const args = ["--models", "mock-good,mock-nodst,mock-messy,mock-bad", "--runs", "2", "--lang", "en", "--style", "plain", "--out", out, "--concurrency", "3"];
  await run(args);
  const firstCount = fs.readFileSync(path.join(outDir, "raw.jsonl"), "utf8").trim().split("\n").length;
  assert.equal(firstCount, 4 * 12 * 2);
  // Resume: only the failed mock-bad answers are sent again.
  const second = await run(args);
  assert.match(second, /24 requests to send \(72 already saved\)/);

  const anthropicEnv = { ...process.env, ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}/v1`, ANTHROPIC_API_KEY: "anthropic-test-key" };
  await run(["--provider", "anthropic", "--models", "claude-good,claude-refuse", "--runs", "2", "--lang", "en", "--style", "plain", "--out", out], anthropicEnv);
  await assert.rejects(run(["--provider", "anthropic", "--models", "claude-good", "--temperature", "0", "--out", out], anthropicEnv), /temperature/);

  execFileSync(process.execPath, [path.join(root, "score.mjs"), out], { stdio: "ignore" });
  const { results } = JSON.parse(fs.readFileSync(path.join(outDir, "summary.json"), "utf8"));
  const get = (model) => results.find((r) => r.model === model);
  assert.equal(get("mock-good").chart_accuracy, 100);
  assert.deepEqual(get("mock-good").returned_models, ["mock-good-2026"]);
  assert.equal(get("mock-messy").chart_accuracy, 100, "fallback parsing of pairs in prose");
  const nodst = get("mock-nodst");
  assert.equal(nodst.other_convention.noDst, 8, "4 DST cases × 2 runs matched the no-DST convention");
  assert.equal(nodst.chart_accuracy, Math.round((1000 * 16) / 24) / 10);
  assert.equal(get("mock-bad").errors, 24);
  assert.equal(get("claude-good").chart_accuracy, 100);
  assert.equal(get("claude-good").median_tokens, 77, "Anthropic output_tokens read as completion tokens");
  assert.equal(get("claude-refuse").refusals, 24);
  assert.equal(get("claude-refuse").chart_accuracy, 0);
  console.log("selftest passed");
} finally {
  server.close();
  fs.rmSync(outDir, { recursive: true, force: true });
}
