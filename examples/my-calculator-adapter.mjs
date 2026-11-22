// Template for testing your own calculator. Read the case's request (birth date and time,
// calendar, time zone, coordinates, options) and return the four pillars as stem-branch pairs,
// for example { pillars: { year: "庚辰", month: "己卯", day: "壬申", hour: "丙午" } }.
// Return hour: "" when the birth time is unknown. Optional fields (utc_offset, dst, chart_local,
// true_solar_correction_minutes) are checked only if you return them.
export default async function calculate(request) {
  const { birth, options } = request;
  throw new Error(`Not implemented: compute the chart for ${JSON.stringify(birth)} with ${JSON.stringify(options)}`);
}
