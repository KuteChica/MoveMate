import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { askAiAssistant } from "../../services/transitApi";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const suggestedQuestions = [
  "Where is the nearest active shuttle?",
  "What routes are available?",
  "What stops are available?",
  "Which shuttles are active?",
];

function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I can help with MoveMate shuttle information using the current MoveMate data. Ask about routes, stops, active shuttles, or shuttle status.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await askAiAssistant(trimmed);
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: response.message,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant could not answer that question right now.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSend(input);
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Student support</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">MoveMate AI</h1>
        </div>
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-900" to="/dashboard">
          ← Dashboard
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-slate-700">Transport helper</p>
        </div>

        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto p-4 sm:p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {message.text}
            </div>
          ))}

          {loading && (
            <div className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              MoveMate AI is thinking...
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-4 sm:px-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                onClick={() => setInput(question)}
              >
                {question}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about shuttle status, routes, or stops..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AIAssistant;
