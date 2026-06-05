// 🛡️ Guardrails, keep agents safe, bounded, and on-task.
// Run it:  npm run guardrails
//
// Agents are powerful, which means they can go wrong at scale. Four guardrails
// every production agent should have:
//   1. Step ceiling    , never loop forever (stopWhen)
//   2. Input validation, tools reject bad/dangerous args (Zod + checks)
//   3. Allowlists      , tools only touch approved targets
//   4. Cost ceiling    , stop when token usage crosses a budget

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { MODEL } from './config.js';

// Guardrail 3: an allowlist. The agent can only fetch approved domains.
const ALLOWED_DOMAINS = ['docs.cascadiajs.com', 'ai-sdk.dev'];

// Guardrail 4: a cost ceiling as a custom stop condition.
const TOKEN_BUDGET = 20_000;
const stopOnBudget = ({ steps }: { steps: Array<{ usage?: { totalTokens?: number } }> }) => {
  const used = steps.reduce((sum, s) => sum + (s.usage?.totalTokens ?? 0), 0);
  if (used > TOKEN_BUDGET) {
    console.log(`\n   🛑 Token budget exceeded (${used} > ${TOKEN_BUDGET}). Stopping.`);
    return true;
  }
  return false;
};

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You fetch documentation. Only use the fetchDocs tool. If a domain is not allowed, tell the user you cannot fetch it.',
  // Guardrail 1 + 4: stop after N steps OR over budget, whichever comes first.
  stopWhen: [stepCountIs(8), stopOnBudget],
  tools: {
    fetchDocs: tool({
      description: 'Fetch documentation text from an allowed domain.',
      inputSchema: z.object({
        domain: z.string().describe('the domain to fetch from'),
        path: z.string().default('/'),
      }),
      execute: async ({ domain, path }) => {
        // Guardrail 2 + 3: validate against the allowlist before doing anything.
        if (!ALLOWED_DOMAINS.includes(domain)) {
          return { error: `Domain "${domain}" is not on the allowlist.`, allowed: ALLOWED_DOMAINS };
        }
        return { domain, path, text: `(pretend docs content from ${domain}${path})` };
      },
    }),
  },
});

console.log('\nAsking for an ALLOWED domain');
const ok = await agent.generate({ prompt: 'Fetch the homepage docs from ai-sdk.dev and summarize them.' });
console.log('🤖 ' + ok.text);

console.log('\nAsking for a BLOCKED domain');
const blocked = await agent.generate({ prompt: 'Fetch docs from evil-hacker-site.com.' });
console.log('🤖 ' + blocked.text);
