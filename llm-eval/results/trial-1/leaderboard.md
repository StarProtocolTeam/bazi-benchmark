# LLM results: trial-1

Benchmark version 1.0.0. A chart counts as correct only when all four pillars match (three when the birth time is unknown). "Matched another convention" means the answer equals the chart under a known alternative rule from cases.json, such as ignoring daylight saving or True Solar Time.

| Model | Prompt | Lang | Charts fully correct | Pillars correct | Same result every run | Matched another convention | Unparsed / errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| deepseek-v4-pro | spec | zh | 100% | 100% | 4/4 | — | 0 / 0 |
| gpt-6.2-sol | spec | zh | 100% | 100% | 4/4 | — | 0 / 0 |
| claude-sonnet-5.5 | spec | zh | 75% | 81.3% | 4/4 | — | 0 / 0 |
| claude-sonnet-5.5 | plain | zh | 75% | 87.5% | 4/4 | — | 0 / 0 |
| gpt-6.2-sol | plain | zh | 75% | 93.8% | 4/4 | noTrueSolarTime ×1 | 0 / 0 |
| deepseek-v4-pro | plain | zh | 50% | 81.3% | 4/4 | noDst ×1 | 0 / 0 |

## Correct answers per case

| Model | Prompt | Lang | baseline | urumqi-true-solar-time | china-dst-1988 | lunar-leap-month |
| --- | --- | --- | --- | --- | --- | --- |
| deepseek-v4-pro | spec | zh | 1/1 | 1/1 | 1/1 | 1/1 |
| gpt-6.2-sol | spec | zh | 1/1 | 1/1 | 1/1 | 1/1 |
| claude-sonnet-5.5 | spec | zh | 1/1 | 1/1 | 1/1 | 0/1 |
| claude-sonnet-5.5 | plain | zh | 1/1 | 1/1 | 1/1 | 0/1 |
| gpt-6.2-sol | plain | zh | 1/1 | 0/1 | 1/1 | 1/1 |
| deepseek-v4-pro | plain | zh | 1/1 | 1/1 | 0/1 | 0/1 |
