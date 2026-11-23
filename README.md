# BaZi Calculation Benchmark

[![Daily check against FateSign](https://github.com/StarProtocolTeam/bazi-benchmark/actions/workflows/check.yml/badge.svg)](https://github.com/StarProtocolTeam/bazi-benchmark/actions/workflows/check.yml)
[![Data: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-blue.svg)](LICENSE-DATA.md)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)

Twelve BaZi (Four Pillars of Destiny, 八字, 四柱推命, 사주) test cases with full inputs and expected pillars. They target the places where calculators and general-purpose AI models most often go wrong:

- True Solar Time moving the hour or day pillar;
- historical daylight saving (China 1986–1991, Taiwan, the US, Australia);
- the late Zi hour (23:00–24:00);
- the exact Li Chun instant, as opposed to Lunar New Year;
- Southern Hemisphere births;
- lunar leap months;
- an unknown birth time.

Use it to test a BaZi calculator, an AI assistant's answers or your own code. The cases are maintained by [FateSign](https://fatesign.com/en/methodology/benchmark/) and re-checked every day against its production calculator.

## How do language models do?

We asked 13 language models for the four pillars of every case, with no tools, in English and Chinese, three times each (2026-11-23). "Plain" is the question as a user would ask it; "with rules" also states the conventions listed under [Conventions](#conventions), so a wrong answer there is a calculation error.

| Model | Charts fully correct, plain | Charts fully correct, with rules | Note |
| --- | --- | --- | --- |
| claude-fable-5-2 | 84.7% | 100% |  |
| gpt-6.2-astra | 73.6% | 98.6% |  |
| gpt-6.2-sol | 79.2% | 97.2% |  |
| claude-opus-5-5 | 76.4% | 93.1% |  |
| claude-sonnet-5-5 | 51.4% | 87.5% |  |
| dola-seed-2.0-pro | 40.3% | 83.3% |  |
| DeepSeek-V4.1-Flash | 33.3% | 70.8% | 63 of 144 answers hit the 8,000-token limit |
| GPT-6 Luna | 41.7% | 69.4% |  |
| deepseek-v4-pro | 38.9% | 66.7% | 30 of 144 answers hit the 8,000-token limit |
| qwen4-max | 38.9% | 54.2% |  |
| claude-haiku-5-5 | 19.4% | 50% |  |
| minimax-m3 | 23.6% | 22.2% | 62 of 144 answers hit the 8,000-token limit |
| glm-5.3 | 9.7% | 9.7% | 128 of 144 answers hit the 8,000-token limit |

Claude models were called through Anthropic’s API with a 16,000-token limit, the others through an OpenAI-compatible relay with an 8,000-token limit. Prompts, every raw answer, the scoring code and these caveats are in [`llm-eval/`](llm-eval/) ([results and method notes](llm-eval/results/2026-11-23/)).

## Cases

<!-- cases:start -->
| ID | Case | Birth (local clock) | Place | Expected pillars (Y M D H) | Chart time | What it checks |
| --- | --- | --- | --- | --- | --- | --- |
| `baseline` | Baseline | 2000-03-15 12:00 | Shanghai, China | 庚辰 己卯 壬申 丙午 | 2000-03-15T11:56 | No boundary is crossed, so every correct calculator should agree. |
| `urumqi-true-solar-time` | True Solar Time changes the hour | 1995-06-10 13:30 | Ürümqi, Xinjiang, China | 乙亥 壬午 壬申 丙午 | 1995-06-10T11:21 | Ürümqi lies about 32° west of the Beijing time meridian, so local solar time runs about two hours behind the clock.<br>*Other conventions:* Without True Solar Time: hour 丁未<br>If the clock time is Xinjiang time (UTC+6): hour 丁未 |
| `kashgar-day-boundary` | True Solar Time changes the day | 2001-09-20 01:30 | Kashgar, Xinjiang, China | 辛巳 丁酉 乙酉 丁亥 | 2001-09-19T22:40 | In Kashgar a birth shortly after midnight on the clock falls on the previous solar day.<br>*Other conventions:* Without True Solar Time: day 丙戌, hour 己丑<br>If the clock time is Xinjiang time (UTC+6): day 丙戌, hour 戊子 |
| `china-dst-1988` | China's daylight saving (1986–1991) | 1988-07-15 07:30 | Beijing, China | 戊辰 己未 辛未 辛卯 | 1988-07-15T06:09 | Clocks ran one hour ahead in summer; the hour must be taken back to standard time first.<br>*Other conventions:* Without the daylight-saving correction: hour 壬辰 |
| `taiwan-dst-1979` | Taiwan's historical daylight saving | 1979-07-15 07:30 | Taipei, Taiwan | 己未 辛未 癸未 乙卯 | 1979-07-15T06:30 | Taiwan used summer time in several years up to 1979; the time-zone history decides it, not the place alone.<br>*Other conventions:* Without the daylight-saving correction: hour 丙辰 |
| `late-zi-hour` | Late Zi hour (23:00–24:00) | 2010-04-15 23:30 | Shanghai, China | 庚寅 庚辰 乙未 戊子 | 2010-04-15T23:35 | FateSign keeps the day pillar on the calendar day and takes the hour stem from the next day.<br>*Other conventions:* If the day changes at 23:00: day 丙申, hour 戊子 |
| `before-lichun-2024` | Minutes before Li Chun | 2024-02-04 16:00 | Beijing, China | 癸卯 乙丑 戊戌 庚申 | 2024-02-04T15:31 | Li Chun 2024 began at 16:27 Beijing time, so 16:00 still belongs to the previous BaZi year and month. |
| `after-lichun-2024` | After Li Chun, before Lunar New Year | 2024-02-04 17:00 | Beijing, China | 甲辰 丙寅 戊戌 庚申 | 2024-02-04T16:31 | The year pillar changes at Li Chun, not at Lunar New Year (10 February 2024).<br>*Other conventions:* If the year changes at Lunar New Year: year 癸卯 |
| `new-york-dst` | New York in summer time | 1990-07-04 09:30 | New York, United States | 庚午 壬午 庚午 庚辰 | 1990-07-04T08:29 | A birth abroad uses the local time zone and its daylight-saving history, never Beijing time.<br>*Other conventions:* Without the daylight-saving correction: hour 辛巳 |
| `sydney-southern-hemisphere` | Sydney, Southern Hemisphere | 1995-01-15 09:30 | Sydney, Australia | 甲戌 丁丑 丙午 壬辰 | 1995-01-15T08:25 | Summer time is removed and the solar-term order is kept; the month is not flipped by season.<br>*Other conventions:* Without the daylight-saving correction: hour 癸巳<br>Schools that flip seasons in the Southern Hemisphere read the Chou month as a Wei month; FateSign does not. |
| `unknown-hour` | Hour unknown | 1990-05-15 (time unknown) | Beijing, China | 庚午 辛巳 庚辰 — | — | Only three pillars can be calculated; True Solar Time does not apply. |
| `lunar-leap-month` | Lunar leap month | lunar 2023-02-10 (leap month) 10:00 | Beijing, China | 癸卯 乙卯 戊子 丁巳 | 2023-03-31T09:41 | A lunar date in the leap 2nd month of 2023 converts to 31 March, a month after the regular 2nd month.<br>*Other conventions:* If read as the regular 2nd month (1 March 2023): year 癸卯, month 甲寅, day 戊午, hour 丁巳 |
<!-- cases:end -->

Full inputs (time zone, coordinates, options) and expected values are in [`cases.json`](cases.json).

## Conventions

Calculators disagree mostly because they follow different conventions, not because one is broken. These cases use:

1. **Clock time:** converted with the birthplace's historical time-zone and daylight-saving rules (IANA tz data).
2. **Xinjiang:** the clock time is read as Beijing time, China's only legal time; True Solar Time still uses the local longitude.
3. **True Solar Time:** standard time, plus 4 minutes per degree of longitude from the zone meridian, plus the equation of time.
4. **Year and month boundaries:** the year changes at the instant of Li Chun and each month at its Jie solar term, compared to the second. Li Chun 2024 agrees with NASA JPL Horizons to about 2 seconds.
5. **Late Zi hour:** at 23:00–24:00 the day pillar stays on the calendar day.
6. **Southern Hemisphere:** births keep the standard solar-term order.

Where a common alternative convention gives a different pillar, the table and `different_rules` in `cases.json` show the alternative result.

## Run the check

You need Node 18 or later. There are no dependencies.

```bash
node check.mjs
```

This runs all twelve cases against FateSign's public calculator and prints ✓ or ✗ for each.

### Test your own calculator

1. Copy [`examples/my-calculator-adapter.mjs`](examples/my-calculator-adapter.mjs).
2. Make it return the four pillars for a case's `request`.
3. Run:

```bash
node check.mjs --adapter ./examples/my-calculator-adapter.mjs
```

### Test an AI assistant

Give the assistant each case's birth details and ask for the four pillars. Then compare its answer with the table above. A general-purpose model that computes the pillars itself usually misses at least the True Solar Time, daylight-saving and Li Chun cases.

FateSign also runs a public MCP server at `https://fatesign.com/mcp`. Assistants that use it, such as Claude or ChatGPT, get the calculated chart instead of estimating it ([setup guide](https://fatesign.com/en/ai-assistants/)).

## Cite

If you use these cases, please cite them; GitHub's "Cite this repository" button reads [`CITATION.cff`](CITATION.cff).

> FateSign (Hyperflops G.K.). *BaZi Calculation Benchmark*, version 1.0.0, 2026. https://fatesign.com/en/methodology/benchmark/

## Corrections

If you think an expected value is wrong, open an issue with:

- the case ID;
- the value you get;
- the convention or source you used.

Changes are verified independently before the data is updated.

## License

- **Test cases** (`cases.json` and the table above): [CC BY 4.0](LICENSE-DATA.md).
- **Code:** [MIT](LICENSE).

---

## 中文

12 个八字排盘测试用例，附完整输入和标准四柱答案，覆盖排盘工具和通用 AI 最容易算错的情况：真太阳时、历史夏令时、晚子时、立春交节时刻、南半球、农历闰月、时辰不详。运行 `node check.mjs` 即可检验 FateSign 的排盘结果，也可以接入你自己的排盘工具。中文说明见 [FateSign 排盘基准页](https://fatesign.com/zh/methodology/benchmark/)。

## 日本語

四柱推命の命式計算を検証するための 12 件のテストケースです。真太陽時、過去の夏時間、夜子時、立春の節入り時刻、南半球、旧暦の閏月、出生時刻不明など、計算ツールや汎用 AI が間違えやすいケースを、入力と正しい四柱つきで収録しています。詳しくは [FateSign のベンチマークページ](https://fatesign.com/ja/methodology/benchmark/)をご覧ください。

## 한국어

사주 명식 계산을 검증하는 12개 테스트 케이스입니다. 진태양시, 과거 서머타임, 야자시, 입춘 절입 시각, 남반구, 음력 윤달, 출생 시각 미상 등 만세력과 일반 AI가 자주 틀리는 경우를 입력값과 정답 사주로 정리했습니다. 자세한 내용은 [FateSign 벤치마크 페이지](https://fatesign.com/ko/methodology/benchmark/)를 참고하세요.
