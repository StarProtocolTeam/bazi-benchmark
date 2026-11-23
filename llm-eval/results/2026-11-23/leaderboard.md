# LLM results: 2026-11-23

Benchmark version 1.0.0. A chart counts as correct only when all four pillars match (three when the birth time is unknown). Refused answers count as wrong. "Matched another convention" means the answer equals the chart under a known alternative rule from cases.json, such as ignoring daylight saving or True Solar Time.

## Overview

Share of charts fully correct, English and Chinese prompts and all runs together.

| Model | Plain prompt | Prompt with rules | Rules, finished answers only (count) | Hit token limit |
| --- | --- | --- | --- | --- |
| claude-fable-5-2 | 84.7% | 100% | 100% (72) | 0/144 |
| gpt-6.2-astra | 73.6% | 98.6% | 98.6% (72) | 0/144 |
| gpt-6.2-sol | 79.2% | 97.2% | 97.2% (72) | 0/144 |
| claude-opus-5-5 | 76.4% | 93.1% | 93.1% (72) | 0/144 |
| claude-sonnet-5-5 | 51.4% | 87.5% | 87.5% (72) | 0/144 |
| dola-seed-2.0-pro | 40.3% | 83.3% | 83.3% (72) | 0/144 |
| DeepSeek-V4.1-Flash | 33.3% | 70.8% | 100% (51) | 63/144 |
| GPT-6 Luna | 41.7% | 69.4% | 69.4% (72) | 0/144 |
| deepseek-v4-pro | 38.9% | 66.7% | 81.4% (59) | 30/144 |
| qwen4-max | 38.9% | 54.2% | 54.2% (72) | 0/144 |
| claude-haiku-5-5 | 19.4% | 50% | 50% (72) | 0/144 |
| minimax-m3 | 23.6% | 22.2% | 53.3% (30) | 62/144 |
| glm-5.3 | 9.7% | 9.7% | 87.5% (8) | 128/144 |

## By language

| Model | Prompt | Lang | Charts fully correct | Correct among finished answers | Pillars correct | Same result every run | Matched another convention | Hit token limit | Unparsed / refused / errors |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| claude-fable-5-2 | spec | en | 100% | 100% | 100% | 12/12 | — | 0 | 0 / 0 / 0 |
| claude-fable-5-2 | spec | zh | 100% | 100% | 100% | 12/12 | — | 0 | 0 / 0 / 0 |
| gpt-6.2-astra | spec | zh | 100% | 100% | 100% | 12/12 | — | 0 | 0 / 0 / 0 |
| gpt-6.2-sol | spec | en | 100% | 100% | 100% | 12/12 | — | 0 | 0 / 0 / 0 |
| gpt-6.2-astra | spec | en | 97.2% | 97.2% | 99.3% | 11/12 | — | 0 | 0 / 0 / 0 |
| claude-opus-5-5 | spec | zh | 94.4% | 94.4% | 97.2% | 11/12 | — | 0 | 0 / 0 / 0 |
| gpt-6.2-sol | spec | zh | 94.4% | 94.4% | 98.6% | 10/12 | — | 0 | 0 / 0 / 0 |
| claude-opus-5-5 | spec | en | 91.7% | 91.7% | 97.9% | 10/12 | — | 0 | 0 / 0 / 0 |
| dola-seed-2.0-pro | spec | zh | 91.7% | 91.7% | 95.7% | 9/12 | — | 0 | 0 / 0 / 0 |
| claude-sonnet-5-5 | spec | zh | 88.9% | 88.9% | 94.3% | 9/12 | — | 0 | 0 / 0 / 0 |
| claude-fable-5-2 | plain | en | 86.1% | 86.1% | 96.5% | 11/12 | ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| claude-sonnet-5-5 | spec | en | 86.1% | 86.1% | 95% | 7/12 | — | 0 | 0 / 0 / 0 |
| claude-fable-5-2 | plain | zh | 83.3% | 83.3% | 95.7% | 12/12 | ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| claude-opus-5-5 | plain | zh | 80.6% | 80.6% | 93.6% | 8/12 | ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| gpt-6.2-astra | plain | en | 80.6% | 80.6% | 95% | 11/12 | noTrueSolarTime ×1, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| gpt-6.2-sol | plain | en | 80.6% | 80.6% | 95% | 11/12 | ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| gpt-6.2-sol | plain | zh | 77.8% | 77.8% | 92.9% | 11/12 | noTrueSolarTime ×2, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| DeepSeek-V4.1-Flash | spec | zh | 75% | 100% | 100% | 7/12 | — | 9 | 0 / 0 / 0 |
| dola-seed-2.0-pro | spec | en | 75% | 75% | 92.2% | 6/12 | noDst ×3 | 0 | 0 / 0 / 0 |
| GPT-6 Luna | spec | en | 75% | 75% | 90.1% | 6/12 | — | 0 | 0 / 0 / 0 |
| claude-opus-5-5 | plain | en | 72.2% | 72.2% | 90.1% | 9/12 | ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| deepseek-v4-pro | spec | zh | 72.2% | 78.8% | 90.7% | 6/12 | noDst ×2 | 3 | 0 / 0 / 0 |
| DeepSeek-V4.1-Flash | spec | en | 66.7% | 100% | 100% | 4/12 | — | 12 | 0 / 0 / 0 |
| gpt-6.2-astra | plain | zh | 66.7% | 66.7% | 89.4% | 12/12 | noTrueSolarTime ×6, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| GPT-6 Luna | spec | zh | 63.9% | 63.9% | 86.5% | 4/12 | noDst ×2 | 0 | 0 / 0 / 0 |
| deepseek-v4-pro | spec | en | 61.1% | 84.6% | 94.1% | 7/12 | noDst ×1 | 10 | 0 / 0 / 0 |
| claude-sonnet-5-5 | plain | zh | 55.6% | 55.6% | 88.7% | 5/12 | noTrueSolarTime ×1, noDst ×2, ziStartsNextDay ×2 | 0 | 0 / 0 / 0 |
| qwen4-max | spec | zh | 55.6% | 55.6% | 80.9% | 3/12 | — | 0 | 0 / 0 / 0 |
| claude-haiku-5-5 | spec | zh | 52.8% | 52.8% | 76.6% | 3/12 | — | 0 | 0 / 0 / 0 |
| qwen4-max | spec | en | 52.8% | 52.8% | 81.2% | 5/12 | — | 0 | 2 / 0 / 0 |
| claude-haiku-5-5 | spec | en | 47.2% | 47.2% | 81.6% | 5/12 | noDst ×1 | 0 | 0 / 0 / 0 |
| claude-sonnet-5-5 | plain | en | 47.2% | 47.2% | 80.9% | 7/12 | noTrueSolarTime ×5, noDst ×5, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| qwen4-max | plain | zh | 47.2% | 47.2% | 78.7% | 6/12 | noDst ×2 | 0 | 0 / 0 / 0 |
| deepseek-v4-pro | plain | zh | 44.4% | 44.4% | 83.7% | 3/12 | noTrueSolarTime ×2, noDst ×6, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| dola-seed-2.0-pro | plain | zh | 41.7% | 41.7% | 80.1% | 6/12 | noTrueSolarTime ×3, noDst ×5, ziStartsNextDay ×2 | 0 | 0 / 0 / 0 |
| GPT-6 Luna | plain | en | 41.7% | 41.7% | 82.3% | 8/12 | noDst ×8, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| GPT-6 Luna | plain | zh | 41.7% | 41.7% | 83% | 8/12 | noTrueSolarTime ×5, noDst ×8, ziStartsNextDay ×3 | 0 | 0 / 0 / 0 |
| dola-seed-2.0-pro | plain | en | 38.9% | 38.9% | 78.7% | 9/12 | noDst ×7, ziStartsNextDay ×1 | 0 | 0 / 0 / 0 |
| DeepSeek-V4.1-Flash | plain | zh | 36.1% | 81.3% | 95.1% | 11/12 | ziStartsNextDay ×1 | 20 | 0 / 0 / 0 |
| deepseek-v4-pro | plain | en | 33.3% | 63.2% | 87.8% | 6/12 | noDst ×2, noTrueSolarTime ×1 | 17 | 0 / 0 / 0 |
| DeepSeek-V4.1-Flash | plain | en | 30.6% | 78.6% | 94.4% | 11/12 | noDst ×1, ziStartsNextDay ×1 | 22 | 0 / 0 / 0 |
| qwen4-max | plain | en | 30.6% | 30.6% | 67.4% | 4/12 | — | 0 | 0 / 0 / 0 |
| minimax-m3 | spec | en | 27.8% | 43.5% | 80.9% | 4/12 | — | 13 | 0 / 0 / 0 |
| minimax-m3 | plain | zh | 25% | 32.1% | 75.2% | 8/12 | noDst ×3, noTrueSolarTime ×1, ziStartsNextDay ×1 | 8 | 0 / 0 / 0 |
| claude-haiku-5-5 | plain | zh | 22.2% | 22.2% | 72.3% | 6/12 | noTrueSolarTime ×2, noDst ×2 | 0 | 0 / 0 / 0 |
| minimax-m3 | plain | en | 22.2% | 33.3% | 75.3% | 9/12 | noTrueSolarTime ×2, noDst ×3 | 12 | 0 / 0 / 0 |
| claude-haiku-5-5 | plain | en | 16.7% | 16.7% | 71.6% | 7/12 | noTrueSolarTime ×3, noDst ×4, ziStartsNextDay ×2 | 0 | 0 / 0 / 0 |
| minimax-m3 | spec | zh | 16.7% | 85.7% | 96.4% | 7/12 | — | 29 | 0 / 0 / 0 |
| glm-5.3 | spec | en | 13.9% | 83.3% | 87.5% | 11/12 | — | 30 | 0 / 0 / 0 |
| glm-5.3 | plain | zh | 11.1% | 80% | 84.2% | 9/12 | — | 31 | 0 / 0 / 0 |
| glm-5.3 | plain | en | 8.3% | 100% | 100% | 10/12 | — | 33 | 0 / 0 / 0 |
| glm-5.3 | spec | zh | 5.6% | 100% | 100% | 10/12 | — | 34 | 0 / 0 / 0 |

## Correct answers per case

| Model | Prompt | Lang | baseline | urumqi-true-solar-time | kashgar-day-boundary | china-dst-1988 | taiwan-dst-1979 | late-zi-hour | before-lichun-2024 | after-lichun-2024 | new-york-dst | sydney-southern-hemisphere | unknown-hour | lunar-leap-month |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| claude-fable-5-2 | spec | en | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| claude-fable-5-2 | spec | zh | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-astra | spec | zh | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-sol | spec | en | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-astra | spec | en | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| claude-opus-5-5 | spec | zh | 3/3 | 3/3 | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-sol | spec | zh | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 |
| claude-opus-5-5 | spec | en | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1/3 | 2/3 |
| dola-seed-2.0-pro | spec | zh | 3/3 | 3/3 | 2/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 |
| claude-sonnet-5-5 | spec | zh | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1/3 | 3/3 | 3/3 | 2/3 |
| claude-fable-5-2 | plain | en | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| claude-sonnet-5-5 | spec | en | 3/3 | 2/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 2/3 | 2/3 |
| claude-fable-5-2 | plain | zh | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| claude-opus-5-5 | plain | zh | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 0/3 | 3/3 | 2/3 | 2/3 | 3/3 | 2/3 | 3/3 |
| gpt-6.2-astra | plain | en | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-sol | plain | en | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| gpt-6.2-sol | plain | zh | 3/3 | 3/3 | 1/3 | 3/3 | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| DeepSeek-V4.1-Flash | spec | zh | 3/3 | 3/3 | 2/3 | 2/3 | 0/3 | 2/3 | 3/3 | 3/3 | 3/3 | 1/3 | 2/3 | 3/3 |
| dola-seed-2.0-pro | spec | en | 3/3 | 2/3 | 3/3 | 1/3 | 1/3 | 3/3 | 3/3 | 3/3 | 2/3 | 1/3 | 2/3 | 3/3 |
| GPT-6 Luna | spec | en | 3/3 | 2/3 | 1/3 | 2/3 | 1/3 | 3/3 | 2/3 | 3/3 | 1/3 | 3/3 | 3/3 | 3/3 |
| claude-opus-5-5 | plain | en | 3/3 | 3/3 | 3/3 | 2/3 | 0/3 | 0/3 | 3/3 | 1/3 | 3/3 | 3/3 | 2/3 | 3/3 |
| deepseek-v4-pro | spec | zh | 2/3 | 3/3 | 3/3 | 2/3 | 1/3 | 3/3 | 3/3 | 3/3 | 1/3 | 1/3 | 3/3 | 1/3 |
| DeepSeek-V4.1-Flash | spec | en | 3/3 | 1/3 | 1/3 | 2/3 | 2/3 | 3/3 | 3/3 | 1/3 | 2/3 | 2/3 | 1/3 | 3/3 |
| gpt-6.2-astra | plain | zh | 3/3 | 0/3 | 0/3 | 3/3 | 3/3 | 0/3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| GPT-6 Luna | spec | zh | 3/3 | 2/3 | 2/3 | 1/3 | 0/3 | 3/3 | 2/3 | 2/3 | 2/3 | 1/3 | 2/3 | 3/3 |
| deepseek-v4-pro | spec | en | 3/3 | 3/3 | 2/3 | 1/3 | 0/3 | 2/3 | 0/3 | 3/3 | 1/3 | 1/3 | 3/3 | 3/3 |
| claude-sonnet-5-5 | plain | zh | 2/3 | 1/3 | 1/3 | 2/3 | 1/3 | 0/3 | 3/3 | 0/3 | 2/3 | 2/3 | 3/3 | 3/3 |
| qwen4-max | spec | zh | 3/3 | 1/3 | 0/3 | 2/3 | 1/3 | 2/3 | 2/3 | 3/3 | 1/3 | 2/3 | 2/3 | 1/3 |
| claude-haiku-5-5 | spec | zh | 2/3 | 1/3 | 1/3 | 1/3 | 1/3 | 1/3 | 2/3 | 2/3 | 0/3 | 3/3 | 3/3 | 2/3 |
| qwen4-max | spec | en | 3/3 | 1/3 | 0/3 | 2/3 | 0/3 | 2/3 | 2/3 | 3/3 | 1/3 | 1/3 | 1/3 | 3/3 |
| claude-haiku-5-5 | spec | en | 2/3 | 1/3 | 1/3 | 0/3 | 1/3 | 0/3 | 2/3 | 2/3 | 0/3 | 3/3 | 3/3 | 2/3 |
| claude-sonnet-5-5 | plain | en | 3/3 | 0/3 | 0/3 | 2/3 | 2/3 | 0/3 | 3/3 | 0/3 | 1/3 | 2/3 | 3/3 | 1/3 |
| qwen4-max | plain | zh | 2/3 | 1/3 | 1/3 | 1/3 | 0/3 | 0/3 | 3/3 | 0/3 | 1/3 | 2/3 | 3/3 | 3/3 |
| deepseek-v4-pro | plain | zh | 2/3 | 1/3 | 2/3 | 1/3 | 1/3 | 0/3 | 2/3 | 0/3 | 1/3 | 1/3 | 2/3 | 3/3 |
| dola-seed-2.0-pro | plain | zh | 3/3 | 2/3 | 1/3 | 1/3 | 2/3 | 0/3 | 3/3 | 0/3 | 0/3 | 1/3 | 2/3 | 0/3 |
| GPT-6 Luna | plain | en | 3/3 | 3/3 | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 | 1/3 | 3/3 | 2/3 |
| GPT-6 Luna | plain | zh | 3/3 | 0/3 | 1/3 | 1/3 | 0/3 | 0/3 | 2/3 | 0/3 | 2/3 | 0/3 | 3/3 | 3/3 |
| dola-seed-2.0-pro | plain | en | 3/3 | 1/3 | 2/3 | 0/3 | 0/3 | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 2/3 | 3/3 |
| DeepSeek-V4.1-Flash | plain | zh | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 3/3 | 0/3 | 1/3 | 0/3 | 3/3 | 3/3 |
| deepseek-v4-pro | plain | en | 1/3 | 1/3 | 0/3 | 0/3 | 1/3 | 0/3 | 3/3 | 0/3 | 2/3 | 0/3 | 2/3 | 2/3 |
| DeepSeek-V4.1-Flash | plain | en | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 2/3 | 3/3 |
| qwen4-max | plain | en | 1/3 | 1/3 | 2/3 | 1/3 | 0/3 | 1/3 | 2/3 | 0/3 | 0/3 | 0/3 | 1/3 | 2/3 |
| minimax-m3 | spec | en | 2/3 | 1/3 | 1/3 | 1/3 | 0/3 | 1/3 | 0/3 | 1/3 | 0/3 | 0/3 | 2/3 | 1/3 |
| minimax-m3 | plain | zh | 2/3 | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 | 0/3 | 0/3 | 3/3 | 2/3 |
| claude-haiku-5-5 | plain | zh | 0/3 | 0/3 | 0/3 | 1/3 | 1/3 | 0/3 | 2/3 | 0/3 | 1/3 | 0/3 | 1/3 | 2/3 |
| minimax-m3 | plain | en | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 3/3 | 0/3 | 0/3 | 0/3 | 1/3 | 2/3 |
| claude-haiku-5-5 | plain | en | 1/3 | 0/3 | 0/3 | 1/3 | 1/3 | 0/3 | 2/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 |
| minimax-m3 | spec | zh | 2/3 | 1/3 | 0/3 | 1/3 | 0/3 | 0/3 | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 |
| glm-5.3 | spec | en | 3/3 | 0/3 | 0/3 | 0/3 | 0/3 | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 |
| glm-5.3 | plain | zh | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 |
| glm-5.3 | plain | en | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 |
| glm-5.3 | spec | zh | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 |
