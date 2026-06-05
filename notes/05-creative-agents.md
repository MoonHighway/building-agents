# 05 · Creative agent projects

`npm run image`

You have the whole toolkit now: the agent loop, multi-step orchestration,
production controls, and observability. Time for the creative payoff — an agent
that generates and restyles **real images**, all on your one AI Gateway key.

## The one new piece: `generateImage`

Everything so far returned text. `generateImage` returns pixels:

```ts
import { generateImage } from 'ai';

// text → image
const { image } = await generateImage({
  model: 'openai/gpt-image-1',         // routes through the AI Gateway
  prompt: 'a cozy PNW coffee shop on a rainy morning',
});
await writeFile('./output/cafe.png', image.uint8Array);

// image → image (the stylize trick): pass an input image AND a style
const source = await readFile('./output/cafe.png');
const { image: styled } = await generateImage({
  model: 'openai/gpt-image-1',
  prompt: { images: [source], text: 'restyle as a 1980s synthwave poster' },
});
```

That `prompt: { images, text }` shape is image-to-image: hand it a picture, get a
restyled one back.

## The demo agent

[`src/09-image-agent.ts`](../src/09-image-agent.ts) wraps both moves as tools and
lets the agent orchestrate: it creates a base image, then feeds that image back
into `stylizeImage` — one prompt, multiple steps, real files in `./output`.

```bash
npm run image
npm run image -- "a foggy Seattle skyline at dawn"
open output/        # macOS: see what it made
```

Notice the familiar bones: the agent BRAIN is a text model (`MODEL`); image
generation happens inside the tools (`IMAGE_MODEL`). File writes are sandboxed
with `safePath`, the loop is capped with `stopWhen`, and `onStepFinish` traces
every step. Same production rigor — visual output.

## Model choice is a real lever 🔀

All on the Gateway, one key — swap and compare:

- `openai/gpt-image-1` — solid default
- `openai/gpt-image-1-mini` — faster / cheaper
- `google/gemini-2.5-flash-image` ("Nano Banana") — a *language* model that
  returns images (call via `generateText`, read `result.files`) — fun contrast

## 🛠️ Build it: the afternoon lab

Now make it yours:

➡️ [🌇 Afternoon lab · Build an image stylizing agent](../labs/02-afternoon-image-agent-lab.md)

Upload your own photo, add tools, gate the spend, and ship a before → after.
