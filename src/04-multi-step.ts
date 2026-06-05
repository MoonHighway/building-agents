// 🪜 Multi-step agent, chaining tools to complete a real task.
// Run it:  npm run multistep
//
// A "code generation agent": it plans, then writes multiple files into a
// sandboxed ./output directory. Watch it take several steps, write a file,
// check its work, write the next, before declaring done.
//
// SAFETY: every file tool is locked to ./output. The agent literally cannot
// write outside the sandbox (see `safePath`). This is your first guardrail.

import { ToolLoopAgent, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { MODEL } from './config.js';

const SANDBOX = resolve('./output');
await mkdir(SANDBOX, { recursive: true });

// Refuse any path that escapes the sandbox. Non-negotiable for write tools.
function safePath(relative: string): string {
  const full = resolve(SANDBOX, relative);
  if (!full.startsWith(SANDBOX)) throw new Error(`Path escapes sandbox: ${relative}`);
  return full;
}

const agent = new ToolLoopAgent({
  model: MODEL,
  instructions:
    'You are a coding agent. Build what is asked by writing files into the project. Keep files small. When finished, list the files you created and how to run the project.',
  stopWhen: stepCountIs(15),
  tools: {
    writeFile: tool({
      description: 'Write a file (path relative to the project root).',
      inputSchema: z.object({ path: z.string(), content: z.string() }),
      execute: async ({ path, content }) => {
        const full = safePath(path);
        await mkdir(join(full, '..'), { recursive: true });
        await writeFile(full, content, 'utf8');
        return { wrote: path, bytes: content.length };
      },
    }),
    readFile: tool({
      description: 'Read a file you previously wrote.',
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        try {
          return { content: await readFile(safePath(path), 'utf8') };
        } catch {
          return { error: `Could not read ${path}` };
        }
      },
    }),
    listFiles: tool({
      description: 'List files in the project.',
      inputSchema: z.object({}),
      execute: async () => ({ files: await readdir(SANDBOX) }),
    }),
  },
});

console.log('\n🛠️  Building into ./output …\n');
const result = await agent.generate({
  prompt:
    'Create a tiny Node project: a package.json (type module) and an index.js that prints a cheerful CascadiaJS greeting. Then verify index.js looks right.',
});

console.log('🤖 ' + result.text + '\n');
console.log(`🪜 Completed in ${result.steps.length} steps. Check the ./output folder!`);
