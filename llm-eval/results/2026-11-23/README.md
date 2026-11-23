# Run of 2026-11-23

Thirteen models were asked for the BaZi Four Pillars of the 12 benchmark cases, with no tools. Each model saw every case in English and Chinese, in both prompt styles (`plain` and `spec`, see `../../prompts.mjs`), three times: 144 answers per model, 1,872 in total. All requests were sent on 2026-11-23 between 05:04 and 07:02 UTC.

Results: [leaderboard.md](leaderboard.md). Every prompt and raw answer: `raw.jsonl`. Per-answer scores: `scored.jsonl`.

## How each model was called

| Models | API | Answer length limit |
| --- | --- | --- |
| claude-fable-5-2, claude-opus-5-5, claude-sonnet-5-5, claude-haiku-5-5 | Anthropic Messages API, called directly (API version 2026-10-21) | 16,000 tokens (`max_tokens`, thinking included) |
| gpt-6.2-astra, gpt-6.2-sol, GPT-6 Luna, deepseek-v4-pro, DeepSeek-V4.1-Flash, qwen4-max, glm-5.3, minimax-m3, dola-seed-2.0-pro | An OpenAI-compatible relay (basicrouter.ai) | 8,000 tokens (`max_tokens`) |

- Each model ran at its default settings: no temperature, effort or thinking options were sent.
- The model name returned with every answer matches the model requested.
- Claude was not called through the relay: in a trial, the relay added about 350 tokens of its own prompt to every Claude request, while the other models' prompt token counts matched what was sent.

## Read with care

- **Token limits differ.** 283 relay answers stopped at the 8,000-token limit before giving the pillars: glm-5.3 128, DeepSeek-V4.1-Flash 63, minimax-m3 62, deepseek-v4-pro 30. They count as wrong in "Charts fully correct". The column "Rules, finished answers only" leaves them out. For glm-5.3 that leaves only 8 answers, too few to judge. No Claude answer reached its 16,000-token limit.
- **The plain prompt does not state the rules.** In the plain style, an answer that follows another accepted convention counts as wrong: day changing at 23:00, no True Solar Time, or daylight saving ignored. These answers are listed under "Matched another convention", so a different school can be told apart from a miscalculation. The spec style states the rules, so a wrong answer there is a calculation error.
- **Missing models.** Gemini models were not available on the relay on the test date. kimi-k3 was started but left out because of its cost: about 0.09 credits per answer, against 0.001–0.016 for the others. Its 34 answers are not in these files.
- **One qwen4-max answer** wrote out an imaginary "Tool Call: bash" transcript instead of an answer. It counts as unparsed. No answer in this run came from an actual tool.

## Reproduce

```bash
node llm-eval/run.mjs --models "gpt-6.2-astra,gpt-6.2-sol,GPT-6 Luna,deepseek-v4-pro,DeepSeek-V4.1-Flash,qwen4-max,glm-5.3,minimax-m3,dola-seed-2.0-pro" --lang en,zh --style plain,spec --runs 3 --max-tokens 8000
node llm-eval/run.mjs --provider anthropic --models claude-fable-5-2,claude-opus-5-5,claude-sonnet-5-5,claude-haiku-5-5 --lang en,zh --style plain,spec --runs 3
node llm-eval/score.mjs <results folder>
```

Model answers vary between runs, so a rerun will not match these numbers exactly.
