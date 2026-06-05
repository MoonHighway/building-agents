// 📱 SMS agent: Claude answers a question and texts the answer to your phone.
// Run it:  npm run sms
//
// Agents don't have to live in a browser. A "tool" is just a function — it can
// call any API, including one that fires off a real text message. The model
// decides WHEN to send the SMS and WHAT to put in it, same pattern as ever.
//
// Setup (≈ 5 min):
//   1. Sign up at https://twilio.com (free trial gives ~$15 credit)
//   2. Grab a phone number from the Twilio console (~$1/month, or use the free trial number)
//   3. In your Twilio console get: Account SID + Auth Token (under Account Info)
//   4. Add the four TWILIO_* vars below to your .env file
//
// Install:  npm install twilio

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import twilio from 'twilio';
import { MODEL } from './config.js';

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_TO } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM || !TWILIO_TO) {
  console.error(
    '\n⚠️  Twilio credentials missing. Add these to your .env:\n' +
      '   TWILIO_ACCOUNT_SID=AC...\n' +
      '   TWILIO_AUTH_TOKEN=...\n' +
      '   TWILIO_FROM=+1...\n' +
      '   TWILIO_TO=+1...\n',
  );
  process.exit(1);
}

const smsClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You are a concise assistant. When you have a final answer, ALWAYS send it as an SMS so the user gets it on their phone. Keep texts under 160 characters.',
  stopWhen: stepCountIs(5),
  tools: {
    sendSms: tool({
      description: 'Send an SMS text message to the user. Call this with your final answer.',
      inputSchema: z.object({
        message: z.string().max(160).describe('The text to send, 160 chars max'),
      }),
      execute: async ({ message }) => {
        const sent = await smsClient.messages.create({
          body: message,
          from: TWILIO_FROM!,
          to: TWILIO_TO!,
        });
        console.log(`📱 SMS sent! SID: ${sent.sid}`);
        return { sent: true, sid: sent.sid };
      },
    }),

    currentTime: tool({
      description: 'Get the current date and time.',
      inputSchema: z.object({}),
      execute: async () => ({ now: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) }),
    }),
  },
});

console.log('\n💬 Asking the agent...\n');

const result = await agent.generate({
  prompt: 'What are two quick things to do in Portland, Oregon? Text me the answer.',
});

console.log('\n🤖 ' + result.text);
console.log(`\n🪜 Completed in ${result.steps.length} step(s)`);
