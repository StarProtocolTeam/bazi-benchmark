# Can language models calculate a BaZi chart?

This folder tests whether large language models get the Four Pillars right when asked in plain words, with no calculator or tools. It uses the same 12 cases as the main benchmark: True Solar Time, historical daylight saving, the Li Chun boundary, the late Zi hour, the Southern Hemisphere, an unknown birth time and a lunar leap month.

Everything needed to reproduce a result is here: the prompts, the raw answers, and the scoring code.

## How it works

1. `run.mjs` asks each model for each case through any OpenAI-compatible `/chat/completions` API and saves every raw answer.
2. `score.mjs` reads the final `PILLARS:` line of each answer and compares it with the expected chart. When the answer is wrong, it checks whether it matches a known alternative convention from `cases.json` (for example ignoring daylight saving or True Solar Time). This separates "used a different rule" from "miscalculated".

There are two prompt styles (see `prompts.mjs`):

| Style | What the model is told | What it tests |
| --- | --- | --- |
| `plain` | Only the birth date, time and place, the way a user would ask | What the model does by default |
| `spec` | The same, plus this benchmark's conventions (time zone and DST rules, True Solar Time, Li Chun, late Zi hour) | Whether the model can calculate once it knows the rules |

Prompts are available in English, Chinese and Japanese.

## Run it

Node 18 or later, no dependencies. The API key is read from the environment and is never printed or saved.

```bash
export LLM_BASE_URL=https://api.example.com/v1
export LLM_API_KEY=your-key
node llm-eval/run.mjs --models model-a,model-b --runs 3 --lang en,zh --style plain,spec --out 2026-11-trial
node llm-eval/score.mjs 2026-11-trial
```

Preview the prompts without calling any API:

```bash
node llm-eval/run.mjs --dry-run --lang zh --style spec
```

Useful options: `--cases id,id` to run a subset, `--concurrency N`, `--max-tokens N` (reasoning models need room; the default is 8000), `--token-param max_completion_tokens` for APIs that require it, and `--temperature T` (the model default is used unless you set it). An interrupted run resumes where it stopped when you repeat the command.

Results are written to `llm-eval/results/<name>/`: `raw.jsonl` (every request and answer, including the model name the API returned), `scored.jsonl`, `summary.json` and `leaderboard.md`.

`node llm-eval/test/selftest.mjs` checks both scripts against a fake API.

## Reading the results

- **Charts fully correct**: all four pillars right (three when the birth time is unknown).
- **Pillars correct**: share of individual pillars that are right.
- **Same result every run**: cases where every run was right or every run was wrong.
- **Matched another convention**: wrong answers that equal the chart under a known alternative rule, such as `noDst` (daylight saving ignored) or `noTrueSolarTime`.

When results are published, the methodology note states which API each model was called through. A model reached through a third-party relay is marked as such, with the model name the relay returned.
