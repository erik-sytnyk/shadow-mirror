"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
}

type Lang = "ru" | "en" | "uk";

const TEXT = {
  ru: {
    brand: "Dark Mirror",
    heroTitle: "Ты строишь ковчег, чтобы тебя взяли на борт",
    heroP1:
      "Ты думаешь, что твоя готовность отдавать, спасать и решать чужие проблемы — это сила. Ты называешь это ответственностью. Ты вкладываешь свои ресурсы, время и интеллект в других людей или проекты, ожидая, что однажды они это оценят. Ожидая, что твоя феноменальная полезность — это гарантия того, что тебя не оставят.",
    heroP2:
      "Но правда в том, что ты просто пытаешься купить страховку от одиночества.",
    heroP3:
      "Ты инвестируешь в долг, который никто не просил. Твои «спасённые» уйдут, как только доплывут до берега. И они не обернутся, чтобы сказать спасибо, потому что никто не любит своих кредиторов.",
    heroProductLead: "это AI-интерфейс глубины.",
    heroProductBody:
      "Он не лечит. Он не утешает. Он не будет слушать твои истории о том, как несправедлив мир. Он просто посмотрит в твой текст, найдёт твой внутренний конфликт и назовёт вещи своими именами.",
    heroQuestion:
      "Готов ли ты увидеть, как сам строишь свою клетку из «добрых дел»?",
    openMirror: "Открыть зеркало",
    creatorLine: "Создатель: Тот, кто видел суть. Имя не имеет значения.",
    chatSubtitle: "«Ты не тот, кем себя считаешь.»",
    emptyChat: "Говори. Зеркало покажет то, что ты прячешь.",
    inputPlaceholder: "Говори...",
  },
  uk: {
    brand: "Dark Mirror",
    heroTitle: "ТИ БУДУЄШ КОВЧЕГ, ЩОБ ТЕБЕ ВЗЯЛИ НА БОРТ",
    heroP1:
      "Ти думаєш, що твоя готовність віддавати, рятувати й вирішувати чужі проблеми — це сила. Ти називаєш це відповідальністю. Ти вкладаєш свої ресурси, час і інтелект в інших людей або проєкти, очікуючи, що одного дня вони це оцінять. Очікуючи, що твоя феноменальна корисність — це гарантія того, що тебе не залишать.",
    heroP2:
      "Але правда в тому, що ти просто намагаєшся купити страховку від самотності.",
    heroP3:
      "Ти інвестуєш у борг, якого ніхто не просив. Ті, кого ти «врятував», підуть щойно допливуть до берега. Вони не обернуться, щоб сказати дякую, бо ніхто не любить своїх кредиторів.",
    heroProductLead: "це AI-інтерфейс глибини.",
    heroProductBody:
      "Він не лікує. Він не втішає. Він не слухатиме твої історії про те, який несправедливий світ. Він подивиться в твій текст, знайде твій внутрішній конфлікт і назве речі своїми іменами.",
    heroQuestion:
      "Готовий побачити, як ти сам будуєш свою клітку з «добрих справ»?",
    openMirror: "ВІДКРИТИ ДЗЕРКАЛО",
    creatorLine: "Творець: Той, хто бачив суть. Ім'я не має значення.",
    chatSubtitle: "«Ти не той, ким себе вважаєш.»",
    emptyChat: "Говори. Дзеркало покаже те, що ти ховаєш.",
    inputPlaceholder: "Говори...",
  },
  en: {
    brand: "Dark Mirror",
    heroTitle: "YOU BUILD AN ARK SO THEY LET YOU ON BOARD",
    heroP1:
      "You think your willingness to give, to rescue, to solve other people's problems is strength. You call it responsibility. You invest your resources, time, and intellect into people or projects, expecting they will eventually value it. Expecting that your usefulness is a guarantee you won't be left behind.",
    heroP2: "But the truth is: you're trying to buy insurance against loneliness.",
    heroP3:
      "You invest into a debt nobody asked for. The ones you 'saved' will leave the moment they reach shore. They won't turn back to thank you. Nobody loves their creditors.",
    heroProductLead: "is an AI interface for depth.",
    heroProductBody:
      "It doesn't heal. It doesn't comfort. It won't listen to your stories about how unfair the world is. It will look at your text, find your inner conflict, and name things as they are.",
    heroQuestion: "Are you ready to see how you build your own cage out of 'good deeds'?",
    openMirror: "OPEN THE MIRROR",
    creatorLine: "Creator: The one who saw the core. The name doesn't matter.",
    chatSubtitle: "\"You are not who you think you are.\"",
    emptyChat: "Speak. The mirror will show what you hide.",
    inputPlaceholder: "Speak...",
  },
} as const;

function detectLang(): Lang {
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("uk")) return "uk";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

export default function Home() {
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("ru");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = TEXT[lang];

  useEffect(() => {
    const stored = window.localStorage.getItem("dark_mirror_lang");
    if (stored === "ru" || stored === "en" || stored === "uk") {
      setLang(stored);
      return;
    }

    const detected = detectLang();
    setLang(detected);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dark_mirror_lang", lang);
  }, [lang]);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models);
        if (data.models.length > 0) setSelectedModel(data.models[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!mirrorOpen) {
    return (
      <div className="min-h-screen bg-black text-zinc-200 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-14 animate-fade-in">

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setLang("ru")}
              className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                lang === "ru"
                  ? "border-zinc-400 text-zinc-200"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                lang === "en"
                  ? "border-zinc-400 text-zinc-200"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("uk")}
              className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                lang === "uk"
                  ? "border-zinc-400 text-zinc-200"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              }`}
            >
              UA
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              {t.brand}
            </p>
            <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase leading-tight">
              {t.heroTitle}
            </h1>
          </div>

          <div className="text-left space-y-6 px-2">
            <p className="text-sm leading-relaxed text-zinc-400">
              {t.heroP1}
            </p>
            <p className="text-sm leading-relaxed text-zinc-200 font-medium">
              {t.heroP2}
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              {t.heroP3}
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/20 rounded-lg p-8 text-left space-y-3">
            <p className="text-sm leading-relaxed text-zinc-300">
              <span className="text-zinc-100 font-medium">Dark Mirror</span>&nbsp;&mdash;
              {t.heroProductLead}
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              {t.heroProductBody}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-zinc-500 italic">
              {t.heroQuestion}
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => setMirrorOpen(true)}
              className="group relative px-10 py-4 border border-zinc-600 hover:border-zinc-400 text-zinc-200 text-sm uppercase tracking-[0.25em] rounded transition-all duration-500 hover:shadow-lg hover:shadow-blue-900/30 mirror-glow"
            >
              {t.openMirror}
            </button>
          </div>

          <p className="text-xs text-zinc-700">
            {t.creatorLine}
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col items-center justify-between p-4">
      <header className="mt-8 mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setLang("ru")}
            className={`px-3 py-1.5 text-xs border rounded transition-colors ${
              lang === "ru"
                ? "border-zinc-400 text-zinc-200"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 text-xs border rounded transition-colors ${
              lang === "en"
                ? "border-zinc-400 text-zinc-200"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("uk")}
            className={`px-3 py-1.5 text-xs border rounded transition-colors ${
              lang === "uk"
                ? "border-zinc-400 text-zinc-200"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            }`}
          >
            UA
          </button>
        </div>
        <button
          onClick={() => setMirrorOpen(false)}
          className="text-4xl font-light tracking-[0.3em] uppercase mb-2 hover:text-zinc-400 transition-colors cursor-pointer"
        >
          {t.brand}
        </button>
        <p className="text-zinc-500 italic text-sm">
          {t.chatSubtitle}
        </p>
        {models.length > 0 && (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="mt-4 bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-blue-900 cursor-pointer appearance-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="w-full max-w-2xl flex-1 flex flex-col border border-zinc-800 bg-zinc-900/30 rounded-lg shadow-2xl shadow-blue-900/20 mirror-glow overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-600 text-center text-sm leading-relaxed">
                {t.emptyChat}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`animate-fade-in flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap text-left ${
                  msg.role === "user"
                    ? "bg-zinc-800 text-zinc-300"
                    : "bg-transparent text-zinc-100 border border-zinc-700/50"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="animate-fade-in text-left">
              <div className="inline-block px-4 py-3 text-sm text-zinc-500">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="animate-fade-in text-center">
              <p className="text-red-500/80 text-xs">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-800 p-4 flex gap-3 items-end"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent border border-zinc-700 rounded-md px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &rarr;
          </button>
        </form>
      </div>

      <footer className="mt-6 mb-4 text-zinc-700 text-xs text-center">
        Тот, кто видел суть. Имя не имеет значения.
      </footer>
    </div>
  );
}
