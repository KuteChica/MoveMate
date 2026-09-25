import { Link } from "react-router-dom";

function AIBotLauncher() {
  return (
    <Link
      to="/ai-assistant"
      aria-label="Open MoveMate AI assistant"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-white/40 bg-white/20 px-4 py-3 shadow-[0_12px_40px_rgba(15,118,110,0.18)] backdrop-blur-xl backdrop-saturate-150 transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-teal-200/80 hover:bg-white/30"
    >
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 text-xl text-white shadow-[0_8px_24px_rgba(13,148,136,0.45)]">
        <span className="absolute inset-0 rounded-full border-2 border-white/70 animate-ping opacity-80" />
        <span className="absolute inset-1 rounded-full bg-white/10" />
        <span className="relative">🤖</span>
      </span>

      <span className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">Ask AI</span>
      </span>

      <span className="pointer-events-none absolute -top-12 right-0 whitespace-nowrap rounded-full border border-teal-100 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 opacity-0 shadow-lg shadow-slate-900/5 transition duration-200 group-hover:opacity-100">
        MoveMate AI
      </span>
    </Link>
  );
}

export default AIBotLauncher;
