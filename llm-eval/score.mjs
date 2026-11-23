#!/usr/bin/env node
// Scores the answers saved by run.mjs: node llm-eval/score.mjs <results folder name>
//
// For each answer it reads the final "PILLARS:" line (or, failing that, the last stem-branch pairs
// in the text), compares the four pillars with the expected chart, and, when they differ, checks
// whether they match a known alternative convention in cases.json (no True Solar Time, no daylight
// saving, day changing at 23:00, year changing at Lunar New Year, leap month ignored). That tells
// a different convention apart from a plain calculation error.
//
// Writes scored.jsonl, summary.json and leaderboard.md next to raw.jsonl and prints the table.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const benchmark = JSON.parse(fs.readFileSync(path.join(here, "..", "cases.json"), "utf8"));
const casesById = Object.fromEntries(benchmark.cases.map((c) => [c.id, c]));
const name = process.argv[2];
if (!name) throw new Error("Usage: node llm-eval/score.mjs <results folder name>");
const dir = path.join(here, "results", name);
const rawPath = path.join(dir, "raw.jsonl");

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const isGanzhi = (pair) => pair.length === 2 && STEMS.includes(pair[0]) && BRANCHES.includes(pair[1]) && STEMS.indexOf(pair[0]) % 2 === BRANCHES.indexOf(pair[1]) % 2;
const PAIR_RE = new RegExp(`[${STEMS}][${BRANCHES}]`, "g");
const UNKNOWN_RE = /^(—|–|-|－|―|unknown|none|n\/a|null|不详|未知|无|不明|\?|？)$/i;
const KEYS = ["year", "month", "day", "hour"];

// Returns { pillars, method } or null. hourKnown=false means the case has no hour pillar, so the
// fallback takes the last three pairs instead of four.
function parsePillars(answer, hourKnown = true) {
  const lines = String(answer ?? "").split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const match = /PILLARS?\s*[:：]\s*(.+)$/i.exec(lines[i].replace(/[*`_]/g, ""));
    if (!match) continue;
    const tokens = match[1].trim().split(/[\s,，、|/]+/).filter(Boolean);
    if (tokens.length < 3) continue;
    const values = tokens.slice(0, 4).map((token) => (isGanzhi(token) ? token : UNKNOWN_RE.test(token) ? "" : null));
    if (values.slice(0, 3).some((value) => !value)) continue;
    return { pillars: { year: values[0], month: values[1], day: values[2], hour: values[3] ?? "" }, method: "line" };
  }
  const pairs = (String(answer ?? "").match(PAIR_RE) ?? []).filter(isGanzhi);
  const count = hourKnown ? 4 : 3;
  if (pairs.length >= count) {
    const [year, month, day, hour = ""] = pairs.slice(-count);
    return { pillars: { year, month, day, hour }, method: "fallback" };
  }
  return null;
}

function alternatives(testCase) {
  return testCase.different_rules
    .filter((rule) => rule.pillars)
    .map((rule) => ({ rule: rule.rule, pillars: { ...testCase.expected.pillars, ...rule.pillars } }));
}
const same = (a, b) => KEYS.every((key) => (a[key] ?? "") === (b[key] ?? ""));

// Keep the latest successful answer for each model/lang/style/case/run.
const latest = new Map();
for (const line of fs.readFileSync(rawPath, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const record = JSON.parse(line);
  const key = [record.model, record.lang, record.style, record.case_id, record.run].join("|");
  if (!record.error || !latest.has(key)) latest.set(key, record);
}

const scored = [];
for (const record of latest.values()) {
  const testCase = casesById[record.case_id];
  const expected = { ...testCase.expected.pillars, hour: testCase.expected.pillars.hour ?? "" };
  const row = { provider: record.provider ?? "openai", model: record.model, returned_model: record.returned_model ?? null, lang: record.lang, style: record.style, case_id: record.case_id, run: record.run };
  if (record.error) {
    scored.push({ ...row, status: "error", error: record.error });
    continue;
  }
  if (record.finish_reason === "refusal") {
    scored.push({ ...row, status: "refusal" });
    continue;
  }
  const parsed = parsePillars(record.answer, Boolean(testCase.expected.pillars.hour));
  if (!parsed) {
    // An answer cut off at the token limit before the PILLARS line is "truncated", not "unparsed".
    const truncated = record.finish_reason === "length" || record.finish_reason === "max_tokens";
    scored.push({ ...row, status: truncated ? "truncated" : "unparsed" });
    continue;
  }
  const pillarsRight = Object.fromEntries(KEYS.map((key) => [key, (parsed.pillars[key] ?? "") === (expected[key] ?? "")]));
  const correct = KEYS.every((key) => pillarsRight[key]);
  const convention = correct ? null : alternatives(testCase).find((alt) => same(parsed.pillars, alt.pillars))?.rule ?? null;
  scored.push({ ...row, status: correct ? "correct" : "wrong", parse: parsed.method, got: parsed.pillars, expected, pillars_right: pillarsRight, convention, tokens: record.usage?.completion_tokens ?? null, latency_ms: record.latency_ms ?? null });
}
fs.writeFileSync(path.join(dir, "scored.jsonl"), scored.map((row) => JSON.stringify(row)).join("\n") + "\n");

// ---------- Summary per model × style × language ----------
const groups = new Map();
for (const row of scored) {
  const key = [row.model, row.style, row.lang].join("|");
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}
const pct = (n, d) => (d ? Math.round((1000 * n) / d) / 10 : null);
const summary = [];
for (const [key, rows] of groups) {
  const [model, style, lang] = key.split("|");
  const answered = rows.filter((r) => r.status === "correct" || r.status === "wrong");
  const pillarChecks = answered.flatMap((r) => KEYS.filter((k) => !(k === "hour" && !casesById[r.case_id].expected.pillars.hour)).map((k) => r.pillars_right[k]));
  const byCase = {};
  for (const r of rows) {
    byCase[r.case_id] ??= { correct: 0, total: 0, conventions: {} };
    byCase[r.case_id].total += 1;
    if (r.status === "correct") byCase[r.case_id].correct += 1;
    if (r.convention) byCase[r.case_id].conventions[r.convention] = (byCase[r.case_id].conventions[r.convention] ?? 0) + 1;
  }
  const conventions = {};
  for (const r of rows) if (r.convention) conventions[r.convention] = (conventions[r.convention] ?? 0) + 1;
  const tokens = answered.map((r) => r.tokens).filter((t) => Number.isFinite(t));
  summary.push({
    model,
    returned_models: [...new Set(rows.map((r) => r.returned_model).filter(Boolean))],
    style,
    lang,
    answers: rows.length,
    chart_accuracy: pct(rows.filter((r) => r.status === "correct").length, rows.length),
    // Same, leaving out answers cut off at the token limit.
    finished_accuracy: pct(rows.filter((r) => r.status === "correct").length, rows.filter((r) => r.status !== "truncated").length),
    truncated: rows.filter((r) => r.status === "truncated").length,
    pillar_accuracy: pct(pillarChecks.filter(Boolean).length, pillarChecks.length),
    consistent_cases: Object.values(byCase).filter((c) => c.correct === c.total || c.correct === 0).length,
    cases: Object.keys(byCase).length,
    other_convention: conventions,
    unparsed: rows.filter((r) => r.status === "unparsed").length,
    refusals: rows.filter((r) => r.status === "refusal").length,
    errors: rows.filter((r) => r.status === "error").length,
    median_tokens: tokens.length ? tokens.sort((a, b) => a - b)[Math.floor(tokens.length / 2)] : null,
    by_case: byCase,
  });
}
summary.sort((a, b) => (b.chart_accuracy ?? -1) - (a.chart_accuracy ?? -1) || a.model.localeCompare(b.model));

// ---------- Markdown ----------
// One row per model: plain and spec prompts, all languages and runs together.
const byModel = new Map();
for (const row of scored) {
  if (!byModel.has(row.model)) byModel.set(row.model, { plain: [], spec: [] });
  byModel.get(row.model)[row.style]?.push(row);
}
const share = (rows, filter = () => true) => {
  const pool = rows.filter(filter);
  return pool.length ? Math.round((1000 * pool.filter((r) => r.status === "correct").length) / pool.length) / 10 : null;
};
const overview = [...byModel].map(([model, g]) => ({
  model,
  plain: share(g.plain),
  spec: share(g.spec),
  spec_finished: share(g.spec, (r) => r.status !== "truncated"),
  spec_finished_n: g.spec.filter((r) => r.status !== "truncated").length,
  truncated: g.plain.concat(g.spec).filter((r) => r.status === "truncated").length,
  answers: g.plain.length + g.spec.length,
})).sort((a, b) => (b.spec ?? -1) - (a.spec ?? -1) || (b.plain ?? -1) - (a.plain ?? -1));
const overviewTable = [
  "| Model | Plain prompt | Prompt with rules | Rules, finished answers only (count) | Hit token limit |",
  "| --- | --- | --- | --- | --- |",
  ...overview.map((o) => `| ${o.model} | ${o.plain ?? "—"}% | ${o.spec ?? "—"}% | ${o.spec_finished ?? "—"}% (${o.spec_finished_n}) | ${o.truncated}/${o.answers} |`),
];
fs.writeFileSync(path.join(dir, "summary.json"), JSON.stringify({ benchmark_version: benchmark.version, overview, results: summary }, null, 2) + "\n");

const caseIds = benchmark.cases.map((c) => c.id).filter((id) => summary.some((s) => s.by_case[id]));
const table = [
  "| Model | Prompt | Lang | Charts fully correct | Correct among finished answers | Pillars correct | Same result every run | Matched another convention | Hit token limit | Unparsed / refused / errors |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...summary.map((s) => `| ${s.model} | ${s.style} | ${s.lang} | ${s.chart_accuracy ?? "—"}% | ${s.finished_accuracy ?? "—"}% | ${s.pillar_accuracy ?? "—"}% | ${s.consistent_cases}/${s.cases} | ${Object.entries(s.other_convention).map(([k, v]) => `${k} ×${v}`).join(", ") || "—"} | ${s.truncated} | ${s.unparsed} / ${s.refusals} / ${s.errors} |`),
];
const caseTable = [
  `| Model | Prompt | Lang | ${caseIds.join(" | ")} |`,
  `| --- | --- | --- | ${caseIds.map(() => "---").join(" | ")} |`,
  ...summary.map((s) => `| ${s.model} | ${s.style} | ${s.lang} | ${caseIds.map((id) => (s.by_case[id] ? `${s.by_case[id].correct}/${s.by_case[id].total}` : "—")).join(" | ")} |`),
];
const markdown = `# LLM results: ${name}\n\nBenchmark version ${benchmark.version}. A chart counts as correct only when all four pillars match (three when the birth time is unknown). Refused answers count as wrong. "Matched another convention" means the answer equals the chart under a known alternative rule from cases.json, such as ignoring daylight saving or True Solar Time.\n\n## Overview\n\nShare of charts fully correct, English and Chinese prompts and all runs together.\n\n${overviewTable.join("\n")}\n\n## By language\n\n${table.join("\n")}\n\n## Correct answers per case\n\n${caseTable.join("\n")}\n`;
fs.writeFileSync(path.join(dir, "leaderboard.md"), markdown);
console.log(markdown);
