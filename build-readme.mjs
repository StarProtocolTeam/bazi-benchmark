// Regenerates the case table in README.md from cases.json: node build-readme.mjs
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const benchmark = JSON.parse(fs.readFileSync(path.join(here, "cases.json"), "utf8"));
const date = (birth) => (typeof birth.date === "string" ? birth.date : `lunar ${birth.date.year}-${String(birth.date.month).padStart(2, "0")}-${String(birth.date.day).padStart(2, "0")}${birth.date.is_leap_month ? " (leap month)" : ""}`);
const cell = (value) => String(value).replaceAll("|", "\\|");
const rows = benchmark.cases.map((c) => {
  const b = c.request.birth;
  const p = c.expected.pillars;
  const pillars = [p.year, p.month, p.day, p.hour || "—"].join(" ");
  const others = c.different_rules.map((r) => (r.pillars ? `${r.description}: ${Object.entries(r.pillars).map(([k, v]) => `${k} ${v}`).join(", ")}` : r.description)).join("<br>");
  return `| \`${c.id}\` | ${cell(c.title)} | ${date(b)} ${b.time ?? "(time unknown)"} | ${cell(b.place?.name ?? b.tz)} | ${pillars} | ${c.expected.chart_local ?? "—"} | ${cell(c.checks)}${others ? `<br>*Other conventions:* ${cell(others)}` : ""} |`;
});
const table = ["| ID | Case | Birth (local clock) | Place | Expected pillars (Y M D H) | Chart time | What it checks |", "| --- | --- | --- | --- | --- | --- | --- |", ...rows].join("\n");
const readmePath = path.join(here, "README.md");
const readme = fs.readFileSync(readmePath, "utf8");
const updated = readme.replace(/<!-- cases:start -->[\s\S]*<!-- cases:end -->/, `<!-- cases:start -->\n${table}\n<!-- cases:end -->`);
fs.writeFileSync(readmePath, updated);
console.log(`Wrote ${rows.length} cases to README.md`);
