# 00 · Setup & what *is* an agent?

## Setup

```bash
npm install
cp .env.example .env     # paste your AI Gateway key
npm run tool             # should print weather advice + the tool call it made
```

If you see a final answer *and* a `→ getWeather(...)` line, you're ready. 🎉

## So what's an agent, really?

Strip away the hype and an agent is just:

> **A model in a loop, with tools, working toward a goal.**

That's it. Three parts:

1. **A model** that decides what to do next.
2. **Tools**: functions it can call to affect the world (read a DB, send an
   email, run code, search).
3. **A loop** that lets it call a tool, see the result, and decide again, until
   the task is done.

```
        ┌──────────────────────────────────────┐
        │                                        │
        ▼                                        │
   ┌─────────┐   wants to    ┌──────────┐  result │
   │  Model  │ ────────────► │   Tool   │ ────────┘
   │ decides │   call tool   │  (your   │
   └─────────┘               │  code)   │
        │                    └──────────┘
        │ has enough to answer
        ▼
     Final answer
```

You saw the model *talk* on Day 2. Today you give it *hands*.

## The spectrum (don't over-build)

| Pattern | When |
|---------|------|
| Single call | the model just needs to answer |
| Single tool call | one lookup/action, then answer |
| **Agent loop** | needs several tools, in an order it decides |
| Multi-step / multi-agent | complex tasks, planning, delegation |

Most "agents" people need are closer to the top than the bottom. Reach for the
simplest thing that works: then add capability.

## Today's arc

- **Morning:** tool calling → the agent loop → a custom assistant.
- **Afternoon:** multi-step agents, then the production patterns that matter, 
  human approval, guardrails, the Ralph Wiggum loop, and observability.

Everything's a runnable script. Run it, read the steps it took, then tinker. 🛠️

➡️ Next: [01 · Tool calling fundamentals](./01-tool-calling.md)
