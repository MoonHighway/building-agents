// 🙋 Human-in-the-loop, pause for approval before a risky action.
// Run it:  npm run approval
//
// Some tool calls shouldn't happen without a human saying "yes", sending email,
// spending money, deleting things. The pattern: the tool doesn't DO the action,
// it asks YOU first, and only proceeds on approval.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import * as readline from 'node:readline/promises';
import { MODEL } from './config.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function confirm(question: string): Promise<boolean> {
  const answer = await rl.question(`\n🙋 APPROVAL NEEDED, ${question} (y/n) `);
  return answer.trim().toLowerCase().startsWith('y');
}

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You are an assistant that can send emails. Always use the sendEmail tool; never claim to have sent an email without it.',
  stopWhen: stepCountIs(8),
  tools: {
    sendEmail: tool({
      description: 'Send an email to a recipient.',
      inputSchema: z.object({
        to: z.string().describe('recipient email'),
        subject: z.string(),
        body: z.string(),
      }),
      // The human gate lives INSIDE execute. The model proposes; the human disposes.
      execute: async ({ to, subject, body }) => {
        console.log(`\n   ✉️  To: ${to}\n   Subject: ${subject}\n   Body: ${body}`);
        const ok = await confirm(`Send this email to ${to}?`);
        if (!ok) return { sent: false, reason: 'User declined to send.' };
        // (Pretend we actually send it here.)
        return { sent: true, to };
      },
    }),
  },
});

const result = await agent.generate({
  prompt: 'Email alex@example.com to remind them the CascadiaJS workshop starts at 9am.',
});

console.log('\n🤖 ' + result.text);
rl.close();
