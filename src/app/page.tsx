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

export default function Home() {
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        body: JSON.stringify({ messages: updatedMessages, model: selectedModel }),
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

          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-600">
              Dark Mirror
            </p>
            <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase leading-tight">
              Ты строишь ковчег, чтобы тебя взяли на борт
            </h1>
          </div>

          <div className="text-left space-y-6 px-2">
            <p className="text-sm leading-relaxed text-zinc-400">
              Ты думаешь, что твоя готовность отдавать, спасать и решать чужие
              проблемы&nbsp;&mdash; это сила. Ты называешь это ответственностью.
              Ты вкладываешь свои ресурсы, время и интеллект в других людей или
              проекты, ожидая, что однажды они это оценят. Ожидая, что твоя
              феноменальная полезность&nbsp;&mdash; это гарантия того, что тебя
              не оставят.
            </p>
            <p className="text-sm leading-relaxed text-zinc-200 font-medium">
              Но правда в том, что ты просто пытаешься купить страховку
              от одиночества.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Ты инвестируешь в долг, который никто не просил. Твои
              &laquo;спасённые&raquo; уйдут, как только доплывут до берега.
              И они не обернутся, чтобы сказать спасибо, потому что никто
              не любит своих кредиторов.
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/20 rounded-lg p-8 text-left space-y-3">
            <p className="text-sm leading-relaxed text-zinc-300">
              <span className="text-zinc-100 font-medium">Dark Mirror</span>&nbsp;&mdash;
              это AI-интерфейс глубины.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Он не лечит. Он не утешает. Он не будет слушать твои истории
              о том, как несправедлив мир. Он просто посмотрит в твой текст,
              найдёт твой внутренний конфликт и назовёт вещи своими именами.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-zinc-500 italic">
              Готов ли ты увидеть, как сам строишь свою клетку
              из &laquo;добрых дел&raquo;?
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => setMirrorOpen(true)}
              className="group relative px-10 py-4 border border-zinc-600 hover:border-zinc-400 text-zinc-200 text-sm uppercase tracking-[0.25em] rounded transition-all duration-500 hover:shadow-lg hover:shadow-blue-900/30 mirror-glow"
            >
              Открыть зеркало
            </button>
          </div>

          <p className="text-xs text-zinc-700">
            Создатель: Тот, кто видел суть. Имя не имеет значения.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex flex-col items-center justify-between p-4">
      <header className="mt-8 mb-6 text-center">
        <button
          onClick={() => setMirrorOpen(false)}
          className="text-4xl font-light tracking-[0.3em] uppercase mb-2 hover:text-zinc-400 transition-colors cursor-pointer"
        >
          Dark Mirror
        </button>
        <p className="text-zinc-500 italic text-sm">
          &ldquo;Ты не тот, кем себя считаешь.&rdquo;
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
                Говори. Зеркало покажет то, что ты прячешь.
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
            placeholder="Говори..."
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
