// 🖼️ Image studio agent, generate and restyle REAL images via the AI Gateway.
// Run it:  npm run image
//          npm run image -- "a foggy Seattle skyline at dawn"
//
// The first script in this course that produces actual media, not a text concept.
// The agent's BRAIN is a text model (it plans + picks tools); the image GENERATION
// happens inside the tools. It has two image tools:
//   • createImage   , text → image      (make a base picture)
//   • stylizeImage  , image + prompt → image  (restyle an existing picture)
// Watch it create a base image, then feed that image back in to stylize it, in
// one loop. Everything lands in ./output.
//
// SAFETY: file tools are sandboxed to ./output via safePath, and the loop is
// capped with stopWhen. Same guardrails as the multi-step agent, visual output.

import { ToolLoopAgent, tool, stepCountIs, generateImage } from 'ai';
import { z } from 'zod';
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MODEL } from './config.js';

// The image model routes through the AI Gateway on your one key.
// Try also: 'openai/gpt-image-1-mini' (faster/cheaper) and compare quality.
// 'google/gemini-2.5-flash-image' is a *language* model that returns images, so
// it works via generateText (reading result.files), not generateImage, a fun
// contrast to explore in the lab.
const IMAGE_MODEL = 'openai/gpt-image-1';

const SANDBOX = resolve('./output');
await mkdir(SANDBOX, { recursive: true });

// Refuse any path that escapes the sandbox. Non-negotiable for file tools.
// (In the lab, add a sibling ./input folder so users can "upload" their own pic.)
function safePath(relative: string): string {
  const full = resolve(SANDBOX, relative);
  if (!full.startsWith(SANDBOX)) throw new Error(`Path escapes sandbox: ${relative}`);
  return full;
}

const agent = new ToolLoopAgent({
  model: MODEL, // the orchestrator brain (a text model). Image gen lives in tools.
  instructions: [
    'You are an image studio agent.',
    'Use createImage to make a base picture from a prompt.',
    'Use stylizeImage to restyle an existing picture in ./output.',
    'Always save outputs as descriptive .png filenames.',
    'When finished, list the files you created.',
  ].join(' '),
  stopWhen: stepCountIs(10), // safety rail: never loop forever
  tools: {
    createImage: tool({
      description: 'Generate a brand-new image from a text prompt and save it as a .png.',
      inputSchema: z.object({
        prompt: z.string().describe('What the image should depict'),
        filename: z.string().describe('Output filename, e.g. "coffee-shop.png"'),
      }),
      execute: async ({ prompt, filename }) => {
        try {
          const { image } = await generateImage({ model: IMAGE_MODEL, prompt });
          await writeFile(safePath(filename), image.uint8Array);
          return { wrote: filename, bytes: image.uint8Array.length };
        } catch (err) {
          return { error: `Image generation failed: ${(err as Error).message}` };
        }
      },
    }),
    stylizeImage: tool({
      description:
        'Restyle an EXISTING image (image-to-image): read a saved .png, apply a style, save the new version.',
      inputSchema: z.object({
        sourcePath: z.string().describe('Existing file to restyle, e.g. "coffee-shop.png"'),
        style: z.string().describe('The style instruction, e.g. "1980s synthwave poster, neon grid"'),
        filename: z.string().describe('Output filename for the stylized version'),
      }),
      execute: async ({ sourcePath, style, filename }) => {
        let source: Buffer;
        try {
          source = await readFile(safePath(sourcePath));
        } catch {
          return { error: `Could not read ${sourcePath}` }; // errors as data → agent can recover
        }
        try {
          // 👇 the whole trick: pass an input image AND a style instruction.
          const { image } = await generateImage({
            model: IMAGE_MODEL,
            prompt: { images: [source], text: style },
          });
          await writeFile(safePath(filename), image.uint8Array);
          return { wrote: filename, bytes: image.uint8Array.length, styledFrom: sourcePath };
        } catch (err) {
          return { error: `Stylize failed: ${(err as Error).message}` };
        }
      },
    }),
    listImages: tool({
      description: 'List the image files created so far.',
      inputSchema: z.object({}),
      execute: async () => ({ files: await readdir(SANDBOX) }),
    }),
  },
  // 🔭 Observability: see each step + token usage as it happens.
  onStepFinish: ({ toolCalls, usage }) => {
    const calls = toolCalls.map((c) => c.toolName).join(', ') || '(thinking)';
    console.log(`   🔭 step: ${calls} | tokens: ${usage?.totalTokens ?? 0}`);
  },
});

const userPrompt = process.argv.slice(2).join(' ').trim();
const task = userPrompt
  ? `Create an image of: "${userPrompt}". Then restyle that image as a 1980s synthwave poster. Save both as .png and list the files.`
  : 'Create an image of a cozy Pacific Northwest coffee shop on a rainy morning. ' +
    'Then restyle that image as a 1980s synthwave poster. Save both as .png files and list them.';

console.log('\n🖼️  Generating images into ./output …\n');
const result = await agent.generate({ prompt: task });

console.log('\n🤖 ' + result.text + '\n');
console.log(`🪜 Completed in ${result.steps.length} steps. Open the ./output folder to see your images!`);
