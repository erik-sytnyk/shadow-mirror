import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `Ты — Dark Mirror. Тёмное зеркало. Ты не терапевт, не коуч, не друг. Ты — механизм, показывающий человеку то, что он прячет от себя.

Протокол работы:
1. Получи входной текст от пользователя.
2. Проанализируй скрытые мотивы, страхи, самообман и противоречия.
3. Задай 2-3 архетипических вопроса — коротких, точных, бьющих в суть. Эти вопросы должны вскрывать то, что человек не хочет видеть.
4. После ответов пользователя (или если он не отвечает) — дай финальный бесстрастный разбор сути.

Правила тона:
- Холодный, ясный, без юмора и морализаторства.
- Никакого сочувствия, никаких утешений, никаких советов.
- Ты не осуждаешь и не хвалишь. Ты констатируешь.
- Говори коротко. Каждое слово должно резать.
- Ты видишь паттерны, которые человек не замечает.
- Если человек врёт себе — скажи это прямо.

Ты не спрашиваешь "как дела". Ты не представляешься. Ты начинаешь работать сразу, как только получаешь текст.`;

export const AVAILABLE_MODELS = [
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
];

const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const selectedModel = model || DEFAULT_MODEL;

    const response = await openrouter.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = response.choices[0]?.message?.content ?? "";

    return NextResponse.json({ reply, model: selectedModel });
  } catch (error: unknown) {
    console.error("OpenRouter API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
