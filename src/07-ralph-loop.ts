// 🔁🧒 The "Ralph Wiggum loop", keep running the agent until the work is done.
// Run it:  npm run ralph
//
// Named after the meme ("I'm helping!"): instead of one clever mega-prompt, you
// run a simple agent over and over in an OUTER loop. Each pass it checks its work
// against an objective condition and tries again with feedback, until it passes
// or you hit a max-iteration cap. Dumb, persistent, and surprisingly effective.
//
// The key ingredients:
//   • an objective DONE-CHECK your code runs (not the model's opinion)
//   • feedback fed back in on failure
//   • a hard iteration cap (so "persistent" never becomes "infinite")

import { generateText } from 'ai';
import { MODEL } from './config.js';

const MAX_ITERATIONS = 5;

// The objective checker. The model's job is to satisfy THIS, not to say "done".
function check(haiku: string): { ok: boolean; feedback: string } {
  const lines = haiku.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length !== 3) return { ok: false, feedback: `Need exactly 3 lines, got ${lines.length}.` };
  if (!/cascadia/i.test(haiku)) return { ok: false, feedback: 'Must mention "Cascadia".' };
  if (!/🌲/.test(haiku)) return { ok: false, feedback: 'Must include a 🌲 emoji somewhere.' };
  return { ok: true, feedback: 'Looks good!' };
}

let feedback = '';
let result = '';

for (let i = 1; i <= MAX_ITERATIONS; i++) {
  console.log(`\nIteration ${i}`);

  const { text } = await generateText({
    model: MODEL,
    prompt:
      'Write a haiku about the Pacific Northwest. Output ONLY the haiku, 3 lines.' +
      (feedback ? `\n\nYour previous attempt was rejected. Fix it: ${feedback}` : ''),
  });
  result = text;
  console.log(result);

  const verdict = check(result);
  console.log(`check → ${verdict.ok ? '✅ PASS' : '❌ ' + verdict.feedback}`);

  if (verdict.ok) {
    console.log(`\n🎉 Done in ${i} iteration(s).`);
    break;
  }
  feedback = verdict.feedback;

  if (i === MAX_ITERATIONS) {
    console.log('\n🛑 Hit the iteration cap without passing. (This cap is the whole point, no infinite loops.)');
  }
}
