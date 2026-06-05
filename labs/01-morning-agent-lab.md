# 🌅 Morning Lab 

> Open-ended build · pick a domain *you* care about

This is your morning to build, not follow along. You've seen tool calling, the
agent loop, a stateful assistant, and a multi-step sandboxed agent. Now wire
those pieces into something of your own.

## The mission

**Build an agent that completes a real, multi-step task in a domain you choose.**
"Real" means: a single natural-language prompt should make your agent call
*several* tools, in an order *it* decides, and come back with a useful result.

That's the whole bar. The domain is up to you.

## What you have to work with

You already have running examples to crib from — copy any of them into a new
file (e.g. `src/my-agent.ts`, add a script to `package.json`) and reshape it:

- `src/02-agent-loop.ts` — the bare `ToolLoopAgent` loop
- `src/03-assistant.ts` — tools that read/write some state
- `src/04-multi-step.ts` — tools that write files inside a `./output` sandbox

## Must-haves 

- [ ] **2+ tools**, each with a sharp `description` and a Zod `inputSchema`
      (`.describe()` the fields the model has to fill in)
- [ ] a `ToolLoopAgent` with a `stopWhen: stepCountIs(n)` cap
- [ ] **one prompt that needs more than one tool call** to answer
- [ ] you can open `result.steps`, read the trace, and *explain out loud* why the
      agent called the tools it did
- [ ] at least one tool that **returns an error as data** (`{ error: '...' }`)
      instead of throwing — then trigger it and watch the agent recover

## Need a domain? Steal one of these

| Idea | Tools it might have |
|------|---------------------|
| 🧳 Trip planner | `findFlights`, `weatherFor`, `packingList`, `addToItinerary` |
| 🍳 Pantry chef | `listPantry`, `findRecipe`, `missingIngredients`, `addToShopping` |
| 📚 Bookshelf agent | `searchBooks`, `addToShelf`, `markRead`, `recommendNext` |
| 🧮 Expense tracker | `listExpenses`, `addExpense`, `categorize`, `monthlyTotal` |
| 🎓 Study buddy | `makeQuiz`, `gradeAnswer`, `trackScore`, `weakestTopic` |
| 🔧 Repo helper | `listFiles`, `writeFile`, `runNode` (sandboxed!), `summarizeProject` |

State can just be an in-memory array (like the to-do list in `03-assistant.ts`).
You don't need a real database to learn the pattern.

## Stretch goals (if you finish early)

- **Swap the model.** In `src/config.ts`, change `MODEL` to a different Gateway
  model and rerun. Does routing change, or just the wording? Try
  `openai/gpt-4o`, `google/gemini-2.0-flash`, or `anthropic/claude-haiku-4.5`.
- **Go multi-step.** Give your agent file tools locked to `./output` (copy
  `safePath` from `04-multi-step.ts`) so it can build something and verify it.
- **Tighten a bad description.** Intentionally write a vague tool description,
  watch the agent misuse it, then fix *only the description* and rerun.
