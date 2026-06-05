# 🏔️ Capstone Lab (optional) · Build a data-analysis dashboard agent

> Open-ended · the "combine everything" build · for fast finishers or a final stretch

The two earlier labs each exercised one slice. This one makes you assemble the
**whole toolkit** into a single agent: tools over real data, multi-step work,
sandboxed file output, a safety gate, a quality loop, and a trace — plus a
deliberate model choice. It's the closest thing to shipping a real agent feature.

## The data

You're given a real-ish dataset at [`data/coffee-sales.json`](../data/coffee-sales.json):
**1,092 records** of a PNW coffee co-op's weekly sales — 6 cities × 7 products ×
26 weeks (2026). Each record:

```json
{ "week": "2026-W01", "city": "Seattle", "product": "Cold Brew",
  "category": "Cold", "unitsSold": 283, "revenueUsd": 1513,
  "returns": 2, "avgRating": 4.5, "newCustomers": 29 }
```

There are real patterns hiding in it (seasonal swings, city differences, product
mix, return rates). Your agent's job is to find them and present them.

## The mission

**Build an agent that analyzes the dataset and writes a self-contained
`dashboard.html` to `./output` — then defends its numbers.**

A "dashboard" = one HTML file a human can open: a few headline metrics, at least
one ranked table, at least one chart, and a short written "what this means"
summary. The agent decides what's worth showing.

## The shape (you assemble it)

The pieces are all things you've done — the capstone is wiring them together:

```ts
// Read-only data tool (a guardrail: the agent can query but not mutate the source)
loadData()                  // returns the records (or a summary of them)
queryData({ groupBy, metric, filter })   // aggregate: sum/avg by city/product/week
// Sandboxed write (copy safePath from src/04-multi-step.ts)
writeDashboard({ html })    // writes ./output/dashboard.html, locked to ./output
```

A chart can be plain inline SVG bars, or a `<script>` tag pulling a CDN chart
library — your call. No image API needed (though generating a hero image with
`generateImage` from lesson 05 is a fun bonus).

## Must-haves (the capstone rubric)

This lab is where you prove you can do *all* of it:

- [ ] **3+ tools**, including a read-only data tool and a sandboxed write tool
- [ ] **multi-step**: the agent explores, computes, then writes — not one shot
- [ ] **a safety control**: data tools are read-only + writes are sandboxed to `./output`
- [ ] **an approval gate**: confirm `y/n` before the final `writeDashboard`
      (copy `confirm()` from `src/05-human-in-loop.ts`)
- [ ] **a Ralph loop**: an *objective* checker (e.g. the HTML contains a `<table>`,
      at least 3 numeric insights, and every revenue figure it cites actually
      matches a recomputation from the raw data) — retry with feedback until it passes
- [ ] **observability**: `onStepFinish` trace of tools + tokens
- [ ] **model comparison**: run it on 2+ Gateway models and note what differs

## The hard part (lean in here)

The interesting failure mode is **the agent making up numbers.** An LLM will
happily "summarize" $2.1M in revenue that doesn't exist. Your Ralph checker is
the defense: recompute the key figures from `data/coffee-sales.json` in *code*
and reject the dashboard if the agent's claims don't match. That's the whole
lesson of the day — *objective checks beat model confidence* — made concrete.

## Analysis prompts to aim the agent at

- Which city + product combo drives the most revenue? The least?
- How does the Cold category trend across the 26 weeks vs Brewed?
- Where are return rates highest, and is that correlated with low ratings?
- If we cut one product line, which city gets hurt most?

## Stretch goals

- **Drill-down**: a `compareCities` or `trendFor(product)` tool the agent calls on demand.
- **Hero image**: generate a banner for the dashboard with `generateImage` (lesson 05).
- **Cost ceiling**: add the token-budget `stopWhen` from `src/06-guardrails.ts`.
- **Bring your own data**: swap in a different JSON file and see if the agent adapts.
