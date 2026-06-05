# 04 · Agents in production 

`npm run approval` · `npm run guardrails` · `npm run ralph` · `npm run observe`

Today we keep it fun *and* real: your agent can generate and restyle real
images, and still behave safely in production.

A demo agent and a production agent differ in four words:
**safety, control, persistence, visibility**.

## 1. Human-in-the-loop 

Creative agents are great at drafting. They should not auto-publish without a
person in charge.

```ts
execute: async ({ to, subject, body }) => {
  const ok = await confirm(`Send this email to ${to}?`);   // pause for a human
  if (!ok) return { sent: false, reason: 'User declined.' };
  return { sent: true, to };
}
```

Run [`src/05-human-in-loop.ts`](../src/05-human-in-loop.ts). Approve once, deny
once. The pattern is the point:

- model proposes an action
- human approves side effects
- tool executes only on explicit yes

Use this for publish/send/spend/delete actions every time.

> 🛠️ **Try it (5 min).** In `src/05-human-in-loop.ts`, add a second risky tool,
> e.g. `scheduleSend(to, sendAt)`, that also gates on `confirm()`. Then prompt
> the agent to *both* send a reminder now *and* schedule a follow-up. Watch each
> side effect pause for its own approval. Approve one, deny the other, and read
> the step trace to see how the agent reports a half-completed task.

## 2. Safety guardrails 🛡️

Fun projects still need hard limits. Four guardrails every production agent
wants ([`src/06-guardrails.ts`](../src/06-guardrails.ts)):

| Guardrail | How |
|-----------|-----|
| **Step ceiling** | `stopWhen: stepCountIs(n)`: never loop forever |
| **Input validation** | Zod schema + checks inside `execute` |
| **Allowlists** | tools only touch approved targets (domains, paths, actions) |
| **Cost ceiling** | custom `stopWhen` that stops on token budget |

```ts
stopWhen: [stepCountIs(8), stopOnBudget],   // whichever trips first
```

Run it and watch a blocked domain get refused. The tool returns an error as
data, and the agent explains why it cannot proceed.

> 🔐 Prompt injection still applies to creative agents. Treat tool output as
> data, not instructions. Keep powerful tools behind allowlists + approval.

## 3. The Ralph loop for quality 🔁🧒

Creative outputs are subjective, but your check can still be objective.

```
run agent -> check work (your code) -> pass? done : feedback -> retry
```

[`src/07-ralph-loop.ts`](../src/07-ralph-loop.ts) loops until a checker passes
or the cap trips. Two ingredients:

1. objective done-check in code
2. feedback fed back in each retry

For an image project, checks could be:

- output file exists and is non-zero bytes
- correct dimensions / aspect ratio
- the expected number of variations got produced
- a required style keyword echoed back in the plan

## 4. Observability 🔭

If an agent feels weird, traces explain why. `onStepFinish` gives you per-step
tool calls and usage.

```ts
onStepFinish: ({ toolCalls, usage }) => {
  trace.log({ tools: toolCalls.map((c) => c.toolName), tokens: usage?.totalTokens });
}
```

Run [`src/08-observability.ts`](../src/08-observability.ts) and read each step.
Then open AI Gateway and compare latency + cost across model choices.

## 🎉 Bonus fun script (AI Gateway)

- [`src/09-image-agent.ts`](../src/09-image-agent.ts) via `npm run image`
  - generates a real base image (text → image)
  - restyles it (image → image) from a prompt
  - sandboxed file writes + a per-step token trace

"Creative but safe": real generated media with the same production rigor
(sandbox, stop cap, observability). You'll build on it in the afternoon lab.

## 🛠️ Hands-on: bring it together (the labs)

The open-ended labs are where you combine everything:

- 🌅 [Morning lab](../labs/01-morning-agent-lab.md) — build an agent that does real work
- 🌇 [Afternoon lab](../labs/02-afternoon-image-agent-lab.md) — an image-stylizing agent
- 🏔️ [Capstone lab (optional)](../labs/03-capstone-data-dashboard.md) — a data-analysis dashboard agent

Whatever you build, hold the production line:

1. At least 2 well-described tools.
2. Approval gate on any publish/send/spend step.
3. Step cap + input validation (and an allowlist or cost ceiling where it fits).
4. `onStepFinish` traces for debugging and cost visibility.
5. Bonus Ralph loop: retry until your quality checker passes.

Tune instructions, rerun, compare traces. Keep it fun. Keep it safe.

➡️ Next: [05 · Creative agent projects](./05-creative-agents.md)
