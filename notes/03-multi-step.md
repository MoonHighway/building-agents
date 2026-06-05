# 03 · Multi-step agents

`npm run multistep`

When a task takes several actions in sequence, write a file, check it, write the
next, verify, you've got a **multi-step agent**. Same loop, bigger jobs.

## A code-generation agent

[`src/04-multi-step.ts`](../src/04-multi-step.ts) builds a tiny Node project by
calling `writeFile`, `readFile`, and `listFiles` over multiple steps. Run it:

```bash
npm run multistep
ls output/        # see what it built
```

Watch `result.steps.length`, one prompt, many steps. It plans, writes
`package.json`, writes `index.js`, reads it back to verify, then reports. That's
the agent loop doing real work.

## The sandbox (your first serious guardrail) 🛡️

A code-gen agent writes to your filesystem. That should make you a *little*
nervous, good. Every file tool here is locked to `./output`:

```ts
function safePath(relative: string): string {
  const full = resolve(SANDBOX, relative);
  if (!full.startsWith(SANDBOX)) throw new Error(`Path escapes sandbox: ${relative}`);
  return full;
}
```

The agent literally cannot write outside the box, even if it tries (or is tricked
into trying). **Capability is power; constraints make power safe.** We'll go
deeper on guardrails next lesson.

## Chain-of-thought & ordering

For multi-step work, nudge the model to think in order via `instructions`:

> *"Plan the files first, then write them one at a time, then verify each."*

You're not writing the steps, you're giving it a strategy and letting it adapt.
When it gets the order wrong, tighten the instruction rather than hard-coding.

## Handling uncertainty & retries

Real tasks fail mid-way: a file read misses, an API hiccups. Two habits:
- **Return errors as data** so the agent can read "that didn't work" and adapt.
- **Cap the loop** (`stopWhen: stepCountIs(15)`) so a confused agent stops instead
  of thrashing forever.

Because tools return `{ error }` instead of throwing, the agent often *self-
corrects*, reads the error, tries a different path. That resilience is mostly a
product of good tool design.

## 🛠️ Hands-on, extend the code-gen agent

Add a tool that "runs" the project (e.g. a `runNode` tool that executes
`output/index.js` in a child process and returns stdout, still sandboxed!). Then
ask the agent to build something *and confirm it runs*. Now it's checking its own
work, which is the perfect setup for the next lesson.

➡️ Next: [04 · Agents in production](./04-production-patterns.md)
