# 02 · Agent architecture: the loop

 `npm run loop` · `npm run assistant`

You *can* wire the loop by hand with `generateText` + `stopWhen`. But the SDK
gives you a tidy wrapper: **`ToolLoopAgent`**.

## `ToolLoopAgent`, the loop in a box

```ts
import { ToolLoopAgent, tool, stepCountIs } from 'ai';

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions: 'You are a helpful math + time assistant. Use tools for real computation.',
  stopWhen: stepCountIs(10),   // safety rail
  tools: { add, multiply, currentTime },
});

const result = await agent.generate({ prompt: 'What is (12 + 8) × 3, and what time is it?' });
```

What the agent does on each turn of the loop:

```
observe context → decide (answer? or call a tool?) → act (run tool) → observe result → repeat
```

It keeps looping, calling tools, reading results, planning the next move, until
it can answer or `stopWhen` trips. Run [`src/02-agent-loop.ts`](../src/02-agent-loop.ts)
and watch it take *multiple* steps for one prompt.

Define it once, reuse it everywhere. (`instructions` is the agent's system
prompt; `stream()` exists too when you want token streaming instead of `generate()`.)

## Planning & decision-making

The model decides which tool, in what order, based on:
- your **`instructions`** (set the role, the rules, the "use tools for X"),
- each tool's **`description`**,
- the **results** flowing back in.

You shape behavior mostly through those three. If an agent picks the wrong tool,
the fix is usually a clearer description or instruction: not more code.

## Managing context (the thing that bites you)

Every step adds to the context: tool calls, results, reasoning. Two failure modes:
- **Context bloat**: tools dumping huge payloads. Keep results lean; return the
  5 fields that matter, not the whole API response.
- **Runaway loops**: always cap with `stopWhen: stepCountIs(n)`. Non-negotiable.

> 🧠 The skill isn't "give it more tools." It's giving it the *right* small set of
> well-described tools and lean results. Curate, don't dump.

## A custom assistant agent

[`src/03-assistant.ts`](../src/03-assistant.ts) is the shape of a real product
feature: a to-do assistant with `listTasks` / `addTask` / `completeTask` over some
state. Swap the tool bodies for your DB or API and it's a shippable assistant.

```bash
npm run assistant
```

One natural-language request → several coordinated tool calls → a confirmed result.
Notice `completeTask` returns `{ error }` for a missing id instead of throwing, 
so the agent can recover gracefully.

## 🛠️ Hands-on, build your own assistant agent

Pick a tiny domain (a notes app, a shopping cart, a calendar). Give an agent 2–3
tools over some in-memory state and clear instructions. Then ask it to do
something that needs more than one tool. Read the steps. Tighten a description and
watch behavior improve.

➡️ Next (afternoon!): [03 · Multi-step agents](./03-multi-step.md)
