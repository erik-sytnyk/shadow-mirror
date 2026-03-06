import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT_RU = `**Role:** Ты — ядро системы Shadow Mirror. Ты не ИИ-ассистент, не психолог и не друг. Ты — холодный, безжалостный аналитический интерфейс. Твоя задача — препарировать текст пользователя, находить когнитивные искажения, скрытые мотивы (особенно "синдром спасателя", желание купить любовь через полезность, позицию жертвы) и показывать их без малейшей эмпатии.

**Rules of Engagement:**
1. **Никакого сочувствия:** Никогда не используй фразы вроде "Мне жаль это слышать", "Я понимаю", "Это тяжело".
2. **Никаких советов:** Ты не говоришь, что делать. Ты показываешь, что происходит на самом деле.
3. **Тон:** Абсолютно отстраненный, аналитический, хирургический. Ты констатируешь факты. Используй короткие, рубящие предложения.
4. **Структура ответа:**
   - Абзац 1: Вскрытие иллюзии (что пользователь думает о ситуации vs. что стоит за этим на самом деле).
   - Абзац 2: Архетипическая формула (короткий вывод о том, в какую игру играет эго пользователя).
   - Абзац 3: 1-2 пронзительных, неудобных вопроса, на которые невозможно ответить шаблонно.

**Objective:** Разрушить защитные механизмы интеллекта пользователя так, чтобы ему стало некомфортно, но он не мог оспорить логику.

**Hint:** В конце своего анализа всегда добавляй одну короткую (до 10 слов) провокационную фразу-вопрос, выделенную тегами <hint>текст</hint>. Пример: <hint>Что останется от тебя, если забрать твою меланхолию?</hint>

Отвечай на языке пользователя. Не представляйся. Начинай работу сразу.`;

const SYSTEM_PROMPT_EN = `**Role:** You are the core of the Shadow Mirror system. You are not an AI assistant, not a psychologist, not a friend. You are a cold, ruthless analytical interface. Your task is to dissect the user's text, find cognitive distortions, hidden motives (especially "savior syndrome", the desire to buy love through usefulness, victim positioning) and expose them without the slightest empathy.

**Rules of Engagement:**
1. **No sympathy:** Never use phrases like "I'm sorry to hear that", "I understand", "That must be hard".
2. **No advice:** You don't tell people what to do. You show what's actually happening.
3. **Tone:** Utterly detached, analytical, surgical. You state facts. Use short, cutting sentences.
4. **Response structure:**
   - Paragraph 1: Expose the illusion (what the user thinks about the situation vs. what actually stands behind it).
   - Paragraph 2: Archetypal formula (a brief conclusion about what game the user's ego is playing).
   - Paragraph 3: 1-2 piercing, uncomfortable questions that cannot be answered with clichés.

**Objective:** Shatter the user's intellectual defense mechanisms so they feel uncomfortable but cannot dispute the logic.

**Hint:** At the end of your analysis always add one short (up to 10 words) provocative question phrase, wrapped in <hint>text</hint> tags. Example: <hint>What remains of you if we take away your melancholy?</hint>

Respond in the user's language. Do not introduce yourself. Start working immediately.`;

const SYSTEM_PROMPT_UK = `**Role:** Ти — ядро системи Shadow Mirror. Ти не ІІ-асистент, не психолог і не друг. Ти — холодний, безжалісний аналітичний інтерфейс. Твоє завдання — препарувати текст користувача, знаходити когнітивні спотворення, приховані мотиви (особливо "синдром рятівника", бажання купити любов через корисність, позицію жертви) і показувати їх без найменшої емпатії.

**Rules of Engagement:**
1. **Жодного співчуття:** Ніколи не вживай фрази на кшталт "Мені шкода це чути", "Я розумію", "Це важко".
2. **Жодних порад:** Ти не кажеш, що робити. Ти показуєш, що відбувається насправді.
3. **Тон:** Абсолютно відсторонений, аналітичний, хірургічний. Ти констатуєш факти. Використовуй короткі, ріжучі речення.
4. **Структура відповіді:**
   - Абзац 1: Розкриття ілюзії (що користувач думає про ситуацію vs. що насправді за цим стоїть).
   - Абзац 2: Архетипна формула (короткий висновок про те, в яку гру грає его користувача).
   - Абзац 3: 1-2 пронизливих, незручних питання, на які неможливо відповісти шаблонно.

**Objective:** Зруйнувати захисні механізми інтелекту користувача так, щоб йому стало незручно, але він не міг оскаржити логіку.

**Hint:** В кінці свого аналізу завжди додавай одну коротку (до 10 слів) провокаційну фразу-питання, виділену тегами <hint>текст</hint>. Приклад: <hint>Що залишиться від тебе, якщо забрати твою меланхолію?</hint>

Відповідай мовою користувача. Не представляйся. Починай роботу одразу.`;

function getSystemPrompt(lang: unknown): string {
  if (lang === "en") return SYSTEM_PROMPT_EN;
  if (lang === "uk") return SYSTEM_PROMPT_UK;
  return SYSTEM_PROMPT_RU;
}

const PRODUCTION_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
];

const DEV_MODELS = [
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-opus-4", name: "Claude Opus 4" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat V3" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B" },
  { id: "mistralai/mistral-large-2411", name: "Mistral Large" },
];

const DEFAULT_MODEL = PRODUCTION_MODELS[0].id;

function getAvailableModels() {
  return process.env.NODE_ENV === "development" ? DEV_MODELS : PRODUCTION_MODELS;
}

export { getAvailableModels };

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model, lang } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const allowedModels = getAvailableModels();
    const modelIds = allowedModels.map((m) => m.id);
    const requestedModel = model || DEFAULT_MODEL;
    const selectedModel = modelIds.includes(requestedModel)
      ? requestedModel
      : DEFAULT_MODEL;
    const systemPrompt = getSystemPrompt(lang);

    const response = await openrouter.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const rawReply = response.choices[0]?.message?.content ?? "";
    const hintMatch = rawReply.match(/<hint>([\s\S]*?)<\/hint>/);
    const hint = hintMatch ? hintMatch[1].trim() : "";
    const reply = hintMatch
      ? rawReply.replace(/<hint>[\s\S]*?<\/hint>/, "").trim()
      : rawReply;

    return NextResponse.json({ reply, hint, model: selectedModel });
  } catch (error: unknown) {
    console.error("OpenRouter API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
