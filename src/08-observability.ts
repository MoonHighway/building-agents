// 🔭 Observability, see what your agent is actually doing.
// Run it:  npm run observe
//
// Agents fail in ways single calls don't: they loop, pick the wrong tool, or
// burn tokens. You can't debug what you can't see. `onStepFinish` gives you a
// hook into every step, log it, trace it, count the cost.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

let totalTokens = 0;

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions: 'You are a travel helper. Use tools to look up distances and convert units.',
  stopWhen: stepCountIs(10),
  tools: {
    distanceKm: tool({
      description: 'Distance in km between two PNW cities.',
      inputSchema: z.object({ from: z.string(), to: z.string() }),
      execute: async ({ from, to }) => {
        const table: Record<string, number> = { 'seattle-portland': 280, 'seattle-vancouver': 230 };
        const key = `${from.toLowerCase()}-${to.toLowerCase()}`;
        return { km: table[key] ?? 300 };
      },
    }),
    kmToMiles: tool({
      description: 'Convert kilometers to miles.',
      inputSchema: z.object({ km: z.number() }),
      execute: async ({ km }) => ({ miles: Math.round(km * 0.621371) }),
    }),
  },
  // 🔭 The observability hook, fires after each step of the loop.
  onStepFinish: ({ text, toolCalls, usage }) => {
    totalTokens += usage?.totalTokens ?? 0;
    const calls = toolCalls.map((c) => `${c.toolName}(${JSON.stringify(c.input)})`).join(', ');
    console.log(
      `   🔭 step: ${calls || '(model thinking/answering)'}` +
        (text ? ` | said: "${text.slice(0, 50)}${text.length > 50 ? '…' : ''}"` : '') +
        ` | tokens so far: ${totalTokens}`,
    );
  },
});

console.log('\n🔭 Tracing every step:\n');
const result = await agent.generate({
  prompt: 'How far is Seattle from Portland in miles?',
});

console.log('\n🤖 Answer: ' + result.text);
console.log(`\n📊 Trace summary: ${result.steps.length} steps, ${totalTokens} total tokens.`);
console.log('In production, send these traces to your observability platform (or the AI Gateway dashboard).');
