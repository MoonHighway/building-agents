# 🌇 Afternoon Lab · Build an image stylizing agent

> Open-ended build · real generated images, one Gateway key

This morning you built an agent that *does* things. This afternoon you've added
the production toolkit — approval gates, guardrails, the Ralph loop, and
observability — and now you get the creative payoff: **an agent that takes an
image you give it and restyles it from a prompt.**

Everything here runs on your single `AI_GATEWAY_API_KEY`. No new accounts.

## The mission

**Build an agent that takes an input image + a natural-language style request and
produces a stylized image, saved to `./output`.**

> "Turn this photo into a 1980s synthwave poster."
> "Make my headshot look like a Studio Ghibli watercolor."
> "Restyle this product shot as a clean blueprint sketch."

The agent decides when to call its image tool, validates what it's given, and
(optionally) asks before it saves. The model in a loop, with tools — now the
tool makes pictures.

## The core technique: `generateImage`

You saw this in the demo ([`src/09-image-agent.ts`](../src/09-image-agent.ts)) —
here's the verified, one-key path again so it's right in front of you:

```ts
import { generateImage } from 'ai';
import { readFile, writeFile } from 'node:fs/promises';

const input = await readFile('./input/photo.png');     // the "uploaded" image

const { image } = await generateImage({
  model: 'openai/gpt-image-1',                          // routes via the Gateway
  prompt: {
    images: [input],                                    // 👈 image-to-image
    text: 'Restyle as a 1980s synthwave poster: neon grid, sunset, chrome',
  },
});

await writeFile('./output/stylized.png', image.uint8Array);
```

That `prompt: { images, text }` shape is the whole trick — pass an image **and** a
style instruction, get a new image back. ("Upload" in a CLI = drop a file in
`./input/` or pass its path as `process.argv`.)

## Must-haves (your rubric)

- [ ] a `ToolLoopAgent` with a **`stylizeImage`** tool that wraps `generateImage`
      with `prompt: { images, text }` and writes the result to `./output`
- [ ] **input validation** as a guardrail: the tool checks the file exists and is
      an allowed image type (`.png`/`.jpg`/`.webp`) — and uses a `safePath`-style
      sandbox so it can only read/write inside approved folders
      (copy `safePath` from `src/04-multi-step.ts`)
- [ ] a `stopWhen: stepCountIs(n)` cap
- [ ] an `onStepFinish` trace so you can see tools + tokens per step
- [ ] you can run it on an image and get a real stylized file out

## Need a concept? Pick one

| Image agent | What it does |
|-------------|--------------|
| 🎨 Style presets | offer named styles (Ghibli, synthwave, pixel-art, claymation) the agent maps to prompts |
| 🧑‍💻 Profile-pic studio | restyle a headshot for a conference badge or team page |
| 📦 Product restyler | turn a plain product photo into a themed marketing shot |
| 🗺️ PNW-ify | drop any photo into a misty Pacific-Northwest aesthetic |
| 🧩 Meme-ifier | add a vibe/era to an image from a one-line prompt |
| 📐 Blueprint mode | convert a photo into a technical-sketch / schematic look |

## Stretch goals

- **Add an approval gate.** Before the final save, show the style prompt and ask
  the human `y/n` (copy `confirm()` from `src/05-human-in-loop.ts`). Restyling
  costs money — gate it.
- **Make the agent see first.** Add a `describeImage` tool using a vision model
  (`generateText` with the image as input on `google/gemini-2.5-pro`) so the
  agent can read what's in the photo and *suggest* a style before applying it.
- **Swap the image model and compare.** All on the Gateway:
  - `openai/gpt-image-1` — solid default
  - `openai/gpt-image-1-mini` — faster / cheaper, compare quality
  - `google/gemini-2.5-flash-image` ("Nano Banana") — note: this is a *language*
    model that returns images, so you call it via `generateText` and read
    `result.files`, not `generateImage`.
- **Add a Ralph loop.** Write an objective check (output file exists, non-zero
  bytes, correct dimensions) and retry with feedback if a generation comes back
  empty or wrong-sized.
- **Batch styles.** One input image → four styles in parallel → a contact sheet.
