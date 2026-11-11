# AI / Pattern-Based Recommendations

The app does not generate personalised recommendation messages ("you usually drink less on Fridays") or call an LLM to produce hydration advice.

## Why this is out of scope

The statistics screen already surfaces the underlying facts (trend vs previous period, best day, averages) via `stores/statistics.ts`. Turning those into advice adds a rules engine or an LLM dependency (network, cost, privacy of sending intake data to a third party) and puts the app in the position of giving health guidance, for little extra value over the existing statistics.

## Prior requests

- #55: "Rekomendacje AI bazowane na wzorcach użytkownika"
