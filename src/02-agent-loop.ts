// 🔁 The agent loop, let the model use tools in a loop until it's done.
// Run it:  npm run loop
//
// `ToolLoopAgent` wraps the observe → decide → act → observe loop for you.
// Give it tools + instructions, then call .generate(). It keeps going (calling
// tools, reading results, deciding next steps) until it can answer, or until a
// stop condition trips.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You are a helpful math + time assistant. Use tools for any real computation or facts. Show your final answer clearly.',
  stopWhen: stepCountIs(10), // safety rail: never loop forever
  tools: {
    add: tool({
      description: 'Add two numbers.',
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => ({ sum: a + b }),
    }),
    multiply: tool({
      description: 'Multiply two numbers.',
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async ({ a, b }) => ({ product: a * b }),
    }),
    currentTime: tool({
      description: 'Get the current date and time.',
      inputSchema: z.object({}),
      execute: async () => ({ now: new Date().toISOString() }),
    }),
  },
});

// A prompt that needs MULTIPLE tool calls in sequence:
const result = await agent.generate({
  prompt: 'What is (12 + 8) multiplied by 3? Also, what time is it right now?',
});

console.log('\n🤖 Answer:\n' + result.text + '\n');
console.log(`🔁 The agent took ${result.steps.length} step(s):`);
result.steps.forEach((step, i) => {
  const calls = step.toolCalls.map((c) => `${c.toolName}(${JSON.stringify(c.input)})`);
  if (calls.length) console.log(`   step ${i + 1}: ${calls.join(', ')}`);
});
