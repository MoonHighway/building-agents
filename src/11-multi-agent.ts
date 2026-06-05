// 🤝 Multi-agent orchestration — specialist agents as tools.
// Run it:  npm run agents
//          npm run agents -- "Tokyo"
//
// The key insight: an "agent" is just a function. That means one agent can
// call another as a tool — the orchestrator delegates to specialists, each
// doing one job well.
//
// Architecture:
//   user → orchestrator
//              ↓             ↓
//         attractions      food
//           agent          agent
//              ↓             ↓
//          orchestrator synthesizes → final brief
//
// The orchestrator doesn't hard-code the order — it decides which tools to
// call (and when) just like any other tool-using agent.

import { ToolLoopAgent, generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

// --- Specialist agents -------------------------------------------------
// Each is a plain async function wrapping a focused generateText call.
// They know nothing about each other or the orchestrator.

async function attractionsAgent(city: string): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    system:
      'You are a travel expert. Return exactly 3 must-see attractions for the city, one sentence each. Be specific and vivid.',
    prompt: `City: ${city}`,
  });
  return text;
}

async function foodAgent(city: string): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    system:
      'You are a food critic. Return exactly 3 iconic local dishes or restaurants for the city, one sentence each. Be specific and enticing.',
    prompt: `City: ${city}`,
  });
  return text;
}

// --- Orchestrator -------------------------------------------------------
// Has the two specialists wired up as tools. It decides what to call, in
// what order, and synthesizes the results into a final answer.

const orchestrator = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You are a friendly travel planner. Use your tools to gather attractions AND food recommendations for the requested city, then write a short trip brief (4–6 sentences) that weaves both together naturally.',
  stopWhen: stepCountIs(6),
  tools: {
    getAttractions: tool({
      description: 'Get 3 must-see attractions for a city.',
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => {
        console.log(`  → attractions agent: researching ${city} …`);
        return attractionsAgent(city);
      },
    }),
    getFoodRecommendations: tool({
      description: 'Get 3 iconic food recommendations for a city.',
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => {
        console.log(`  → food agent: researching ${city} …`);
        return foodAgent(city);
      },
    }),
  },
});

// --- Run ----------------------------------------------------------------

const city = process.argv[2] ?? 'Portland, Oregon';
console.log(`\n✈️  Planning a trip to ${city} …\n`);

const result = await orchestrator.generate({ prompt: `Plan a trip to ${city}.` });

console.log('\n📋 Trip brief:\n');
console.log(result.text);
console.log(
  `\n🤝 Done in ${result.steps.length} orchestrator step(s). Each tool call spawned a specialist agent.`,
);
