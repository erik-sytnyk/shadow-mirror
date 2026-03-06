# Shadow Mirror

AI-интерфейс глубины. shadow-mirror.dev

Он не лечит. Он не утешает. Он смотрит в твой текст, находит внутренний конфликт и называет вещи своими именами. Он не лечит. Он не утешает. Он смотрит в твой текст, находит внутренний конфликт и называет вещи своими именами.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** (dark theme)
- **OpenRouter API** (multi-model: Claude, GPT-4o, Gemini, Llama)

## Setup

```bash
npm install
```

Create `.env.local` in the project root:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

Get your API key at [openrouter.ai/keys](https://openrouter.ai/keys).

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
src/app/
  page.tsx              — Hero section + chat UI
  globals.css           — Dark theme, glow animations
  layout.tsx            — Root layout
  api/chat/route.ts     — OpenRouter proxy + system prompt
  api/models/route.ts   — Available models endpoint
```
