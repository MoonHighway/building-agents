# 01 · Tool calling fundamentals

 `npm run tool`

Tool calling is the atom of every agent. Get this right and the rest is
composition.

## What a tool is

A tool is a function you *describe* to the model. The model decides **when** to
call it and with **what arguments**; **your code** runs it and hands back a result.

```ts
import { tool } from 'ai';
import { z } from 'zod';

const getWeather = tool({
  description: 'Get the current weather for a city.',   // ← when to use it
  inputSchema: z.object({ city: z.string() }),          // ← validates the args
  execute: async ({ city }) => ({ city, tempF: 54 }),   // ← your code runs
});
```

Three parts, each load-bearing:
- **`description`**: how the model knows this tool is relevant. Write it like a
  helpful docstring. Vague description → tool never gets used (or used wrong).
- **`inputSchema`**: a Zod schema. The model's arguments are validated against it
  before `execute` runs. `.describe()` your fields!
- **`execute`**: your actual logic. Return plain data (objects are great).

## Hooking tools to a model

```ts
const result = await generateText({
  model: MODEL,
  tools: { getWeather },
  stopWhen: stepCountIs(5),   // ← let it call the tool AND then answer
  prompt: 'What should I wear in Seattle today?',
});
```

> ⚠️ **The `stopWhen` gotcha.** Without a stop condition, generation halts the
> moment the model emits a tool call: you'd get the call but no final sentence.
> `stopWhen: stepCountIs(n)` lets the loop continue: call tool → read result →
> answer. You'll set this on basically every agent.

## Seeing what happened

`result.steps` is your X-ray. Each step records the tool calls and results:

```ts
for (const step of result.steps) {
  for (const call of step.toolCalls) {
    console.log(call.toolName, call.input);
  }
}
```

Run [`src/01-tool-calling.ts`](../src/01-tool-calling.ts) and read the trace.

## Designing tools the model can actually use

| ✅ Do | ❌ Don't |
|------|---------|
| One clear job per tool | one mega-tool with a `mode` arg |
| Describe it like you're onboarding a junior | `description: 'weather'` |
| `.describe()` every field | bare `z.string()` for ambiguous inputs |
| Return errors as data (`{ error: '...' }`) | throw on expected failures |
| Keep results small & relevant | dump 10KB of JSON into context |

Returning errors as **data** is a pro move, the model can read the error and
recover (retry, ask the user, try another approach) instead of the whole run
crashing.

## 🛠️ Hands-on, build an agent with tools

In `src/01-tool-calling.ts`, add a second tool, e.g. `getForecast(city, days)` or
`convertTemp(tempF)`. Give it a crisp description and schema, then ask a question
that needs both tools. Read `result.steps` to confirm it used them.

➡️ Next: [02 · Agent architecture: the loop](./02-agent-architecture.md)
