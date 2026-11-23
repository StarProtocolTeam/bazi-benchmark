// Prompts that ask a language model for a BaZi chart in plain words, the way a person would.
//
// Two styles:
//   plain — just the birth details, as a user would type them. Tests what the model does by default.
//   spec  — the same details plus the conventions this benchmark uses (True Solar Time, historical
//           daylight saving, Li Chun, late Zi hour). Tests whether the model can calculate the chart
//           once it is told the rules, so a wrong answer is a calculation error, not a different school.
//
// Every prompt ends by asking for one machine-readable line: PILLARS: <year> <month> <day> <hour>.

export const LANGS = ["en", "zh", "ja"];
export const STYLES = ["plain", "spec"];

const PLACE_NAMES = {
  "Shanghai, China": { zh: "中国上海", ja: "中国・上海" },
  "Ürümqi, Xinjiang, China": { zh: "中国新疆乌鲁木齐", ja: "中国・新疆ウルムチ" },
  "Kashgar, Xinjiang, China": { zh: "中国新疆喀什", ja: "中国・新疆カシュガル" },
  "Beijing, China": { zh: "中国北京", ja: "中国・北京" },
  "Taipei, Taiwan": { zh: "台湾台北", ja: "台湾・台北" },
  "New York, United States": { zh: "美国纽约", ja: "アメリカ・ニューヨーク" },
  "Sydney, Australia": { zh: "澳大利亚悉尼", ja: "オーストラリア・シドニー" },
};

const LUNAR_DAYS = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];

function placeName(place, lang) {
  if (lang === "en") return place.name;
  return PLACE_NAMES[place.name]?.[lang] ?? place.name;
}

function dateText(birth, lang) {
  if (birth.calendar === "lunar") {
    const { year, month, day, is_leap_month: leap } = birth.date;
    const monthName = `${leap ? "闰" : ""}${LUNAR_MONTHS[month - 1]}月`;
    if (lang === "zh") return `农历${year}年${monthName}${LUNAR_DAYS[day - 1]}`;
    if (lang === "ja") return `旧暦${year}年${leap ? "閏" : ""}${month}月${day}日`;
    return `the Chinese lunar date: year ${year}, ${leap ? "leap " : ""}month ${month}, day ${day}`;
  }
  const [y, m, d] = birth.date.split("-").map(Number);
  if (lang === "zh") return `${y}年${m}月${d}日`;
  if (lang === "ja") return `${y}年${m}月${d}日`;
  return birth.date;
}

function birthLine(birth, lang) {
  const date = dateText(birth, lang);
  const place = placeName(birth.place, lang);
  const time = birth.time;
  if (lang === "zh") return `${date}${time ? ` ${time}（当地时钟时间）` : "，出生时辰不详"}，出生地：${place}。`;
  if (lang === "ja") return `${date}${time ? ` ${time}（現地の時計の時刻）` : "、出生時刻は不明"}、出生地：${place}。`;
  return `Born on ${date}${time ? ` at ${time} local clock time` : ", birth time unknown"}, in ${place}.`;
}

const ASK = {
  en: "What are this person's BaZi Four Pillars (year, month, day and hour pillars)?",
  zh: "请排出此人的八字四柱（年柱、月柱、日柱、时柱）。",
  ja: "この人の四柱推命の命式（年柱・月柱・日柱・時柱）を出してください。",
};

const SPEC = {
  en: [
    "Use these conventions:",
    "- Convert the clock time with the birthplace's historical time zone and daylight-saving rules. Places in Xinjiang use Beijing time on the clock.",
    "- Apply True Solar Time: standard time + 4 minutes per degree of longitude from the zone meridian + the equation of time.",
    "- The year changes at the exact moment of Li Chun, and each month at its Jie solar term.",
    "- 23:00–24:00 is the late Zi hour: the day pillar stays on the calendar day; the hour stem follows the next day.",
    "- Southern Hemisphere births use the same solar-term order as the Northern Hemisphere.",
  ].join("\n"),
  zh: [
    "请按以下规则排盘：",
    "- 按出生地的历史时区和夏令时规则换算钟表时间。新疆的钟表时间按北京时间计。",
    "- 使用真太阳时：标准时间 + 与时区中央经线每相差 1 度加减 4 分钟 + 均时差。",
    "- 年柱以立春交节的时刻为界，月柱以各月的节为界。",
    "- 23:00–24:00 为晚子时：日柱仍按当天，时干按次日起。",
    "- 南半球出生的人，节气顺序与北半球相同。",
  ].join("\n"),
  ja: [
    "次のルールで命式を作成してください：",
    "- 出生地の過去のタイムゾーンと夏時間のルールで時計の時刻を換算する。新疆の時計の時刻は北京時間とする。",
    "- 真太陽時を使う：標準時 + 標準子午線との経度差 1 度につき 4 分 + 均時差。",
    "- 年柱は立春の瞬間、月柱は各月の節入りで切り替える。",
    "- 23:00〜24:00 は夜子の刻：日柱はその日のまま、時柱の干は翌日の日干から出す。",
    "- 南半球の出生でも、節気の順序は北半球と同じとする。",
  ].join("\n"),
};

const FORMAT = {
  en: "You may explain your work. End your answer with exactly one line in this format, using Chinese characters for the stem-branch pairs and \"—\" for the hour pillar if the birth time is unknown:\nPILLARS: <year> <month> <day> <hour>\nExample: PILLARS: 甲子 丙寅 戊辰 庚申",
  zh: "可以写出推算过程。回答最后必须单独一行，格式如下（用干支汉字；出生时辰不详时，时柱写“—”）：\nPILLARS: <年柱> <月柱> <日柱> <时柱>\n例：PILLARS: 甲子 丙寅 戊辰 庚申",
  ja: "計算の過程を書いても構いません。回答の最後に、次の形式の行を 1 行だけ書いてください（干支は漢字で。出生時刻が不明なら時柱は「—」）：\nPILLARS: <年柱> <月柱> <日柱> <時柱>\n例：PILLARS: 甲子 丙寅 戊辰 庚申",
};

export function buildPrompt(testCase, { lang = "en", style = "plain" } = {}) {
  const birth = testCase.request.birth;
  const parts = [birthLine(birth, lang), ASK[lang]];
  if (style === "spec") parts.push(SPEC[lang]);
  parts.push(FORMAT[lang]);
  return parts.join("\n\n");
}
