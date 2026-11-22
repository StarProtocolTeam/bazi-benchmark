#!/usr/bin/env node
// Runs every case in cases.json against a BaZi calculator and compares the four pillars
// (and, where the calculator reports them, the UTC offset, DST flag, corrected chart time and
// True Solar Time correction). No dependencies; Node 18 or later.
//
//   node check.mjs                          # FateSign's public calculator
//   node check.mjs --adapter ./my-adapter.mjs
//
// An adapter is an ES module whose default export takes a case's `request` object and returns
// { pillars: { year, month, day, hour }, utc_offset?, dst?, chart_local?, true_solar_correction_minutes? }.
// See examples/fatesign-adapter.mjs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname);
const benchmark = JSON.parse(fs.readFileSync(path.join(here, "cases.json"), "utf8"));
const adapterArg = process.argv.indexOf("--adapter");
const adapterPath = adapterArg > -1 ? path.resolve(process.argv[adapterArg + 1]) : path.join(here, "examples", "fatesign-adapter.mjs");
const calculate = (await import(pathToFileURL(adapterPath).href)).default;
const delayMs = Number(process.env.DELAY_MS ?? 1500);

let failed = 0;
for (const testCase of benchmark.cases) {
  const { expected } = testCase;
  const problems = [];
  try {
    const result = await calculate(testCase.request);
    for (const key of ["year", "month", "day", "hour"]) {
      const want = expected.pillars[key] ?? "";
      const got = result.pillars?.[key] ?? "";
      if (want !== got) problems.push(`${key} pillar ${got || "(none)"}, expected ${want || "(none)"}`);
    }
    if (result.utc_offset !== undefined && result.utc_offset !== expected.utc_offset) problems.push(`UTC offset ${result.utc_offset}, expected ${expected.utc_offset}`);
    if (result.dst !== undefined && result.dst !== expected.dst) problems.push(`DST ${result.dst}, expected ${expected.dst}`);
    if (result.chart_local !== undefined && (result.chart_local ?? null) !== expected.chart_local) problems.push(`chart time ${result.chart_local}, expected ${expected.chart_local}`);
    const correction = result.true_solar_correction_minutes;
    if (correction !== undefined && expected.true_solar_correction_minutes !== null && Math.abs(correction - expected.true_solar_correction_minutes) > 0.15) {
      problems.push(`True Solar Time correction ${correction} min, expected ${expected.true_solar_correction_minutes}`);
    }
  } catch (error) {
    problems.push(`request failed: ${error.message}`);
  }
  if (problems.length) failed += 1;
  console.log(`${problems.length ? "✗" : "✓"} ${testCase.id}${problems.length ? ` — ${problems.join("; ")}` : ""}`);
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
}

console.log(`\n${benchmark.cases.length - failed}/${benchmark.cases.length} cases match.`);
process.exit(failed ? 1 : 0);
