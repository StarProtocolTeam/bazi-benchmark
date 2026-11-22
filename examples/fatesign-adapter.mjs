// Adapter for FateSign's public calculator (https://fatesign.com/en/tools/bazi-calculator/).
// The request body is the case's `request` object as-is.
export default async function calculate(request) {
  const response = await fetch("https://fatesign.com/api/calc/bazi", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const chart = payload.data ?? payload;
  return {
    pillars: Object.fromEntries(["year", "month", "day", "hour"].map((key) => [key, chart.pillars?.[key]?.gz ?? ""])),
    utc_offset: chart.time?.utc_offset,
    dst: chart.time?.dst,
    chart_local: chart.time?.chart_local ?? null,
    true_solar_correction_minutes: chart.time?.true_solar?.correction_minutes ?? null,
  };
}
