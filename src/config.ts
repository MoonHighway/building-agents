import 'dotenv/config';

// Default agent model. Swap the string to change providers via the AI Gateway.
// Agents do a lot of reasoning, so a strong model pays off, but sonnet is a
// great default for a workshop (fast + capable + affordable).
export const MODEL = 'anthropic/claude-sonnet-4.6';

// Try also:
//   'anthropic/claude-opus-4.8'  , best reasoning for hard multi-step tasks
//   'anthropic/claude-haiku-4.5' , fast/cheap for simple tool routing
//   'openai/gpt-4o'              , compare routing + phrasing vs Claude
//   'google/gemini-2.0-flash'    , fastest option; good for creative output

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error(
    '\n⚠️  No AI_GATEWAY_API_KEY found. Copy .env.example to .env and add your key.\n' +
      '   Get one at https://vercel.com/dashboard → AI Gateway → API Keys\n',
  );
  process.exit(1);
}
