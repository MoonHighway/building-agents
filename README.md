# Building AI Agents 🌲🤖

**CascadiaJS 2026 · Friday, June 5 · with Eve Porcello**

Today we go from "the model can talk" to "the model can *act*." We'll build agents
with the **Vercel AI SDK (v6)** and **AI Gateway**: tool calling, the agent loop,
multi-step tasks, and production patterns that keep agents safe and debuggable.
Then we turn it up with a fun creative agent that generates and restyles real images.

You should be comfy with TypeScript and `async/await`. Did Day 2? Great, this
builds right on it. Didn't? You'll still be fine; we recap the essentials.

---

## ⚙️ Setup

```bash
npm install
cp .env.example .env       # paste your AI Gateway key
npm run tool               # smoke test, your first tool-calling agent
```

Get a key at [vercel.com/dashboard](https://vercel.com/dashboard) → AI Gateway →
API Keys. One key, every model, swap the string in `src/config.ts`.

---

## 🗺️ The day

### Morning, agent foundations
| # | Lesson | Run |
|---|--------|-----|
| 00 | [Setup & what *is* an agent?](./notes/00-setup.md) | `npm run tool` |
| 01 | [Tool calling fundamentals](./notes/01-tool-calling.md) | `npm run tool` |
| 02 | [Agent architecture: the loop](./notes/02-agent-architecture.md) | `npm run loop` · `npm run assistant` |

### Afternoon, advanced agents (plus fun stuff)
| # | Lesson | Run |
|---|--------|-----|
| 03 | [Multi-step agents](./notes/03-multi-step.md) | `npm run multistep` |
| 04 | [Agents in production](./notes/04-production-patterns.md) | `npm run approval` · `npm run guardrails` · `npm run ralph` · `npm run observe` |
| 05 | [Creative agent projects](./notes/05-creative-agents.md) | `npm run image` |

## 🧪 Labs (your build time)

The lessons show; the labs are where *you* build. Open-ended briefs in [`labs/`](./labs/):

| # | Lab | When |
|---|-----|------|
| 01 | [Build an agent that does real work](./labs/01-morning-agent-lab.md) | morning |
| 02 | [Build an image stylizing agent](./labs/02-afternoon-image-agent-lab.md) | afternoon |
| 03 | [Capstone: data-analysis dashboard agent](./labs/03-capstone-data-dashboard.md) | optional / stretch |

## 🏃 All the scripts

| Command | What it shows |
|---------|---------------|
| `npm run tool` | a single tool call (`generateText` + `tool`) |
| `npm run loop` | the agent loop with `ToolLoopAgent` |
| `npm run assistant` | a custom assistant with tools over state |
| `npm run multistep` | a code-gen agent writing files (sandboxed) |
| `npm run approval` | human-in-the-loop approval gate |
| `npm run guardrails` | step caps, allowlists, cost ceilings |
| `npm run ralph` | the "Ralph Wiggum loop", run till done |
| `npm run observe` | step-by-step tracing with `onStepFinish` |
| `npm run image` | an image agent that generates + restyles real images |

> ⚠️ `multistep` writes into a sandboxed `./output/` folder (gitignored). The file
> tools are locked to that directory on purpose, your first real guardrail.

### Fun project prompts to try

- `npm run image -- "a foggy Seattle skyline at dawn"` (then watch it synthwave-ify)
- "Restyle this headshot as a Studio Ghibli watercolor."
- "Turn a plain coffee-mug photo into a neon cyberpunk product shot."

Let's build something that *does* things. ✨
