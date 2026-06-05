// 🔧 Tool calling, the atom of every agent.
// Run it:  npm run tool
//
// A "tool" is a function you describe to the model. The model decides WHEN to
// call it and with WHAT arguments; YOUR code runs it and returns the result.
// That's the whole trick, the model can now DO things, not just talk.

import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

// Define a tool: description (so the model knows when to use it),
// inputSchema (Zod, validates the args the model produces), and execute.
const getWeather = tool({
  description: 'Get the current weather for a city.',
  inputSchema: z.object({
    city: z.string().describe('The city name, e.g. "Seattle"'),
  }),
  execute: async ({ city }) => {
    // Pretend this calls a real weather API. Returns plain data.
    const fakeTemps: Record<string, number> = { seattle: 54, portland: 58, vancouver: 51 };
    const temp = fakeTemps[city.toLowerCase()] ?? 60;
    return { city, tempF: temp, conditions: 'drizzle, because PNW 🌧️' };
  },
});

const result = await generateText({
  model: MODEL,
  // stopWhen lets the model call the tool, get the result, and then answer.
  // Without it, you'd stop at the tool call and never get a final sentence.
  stopWhen: stepCountIs(5),
  tools: { getWeather },
  prompt: 'What should I wear in Seattle today?',
});

console.log('\n🤖 Final answer:\n' + result.text + '\n');

// Inspect what happened under the hood:
console.log('🔧 Tool calls made:');
for (const step of result.steps) {
  for (const call of step.toolCalls) {
    console.log(`   → ${call.toolName}(${JSON.stringify(call.input)})`);
  }
}
