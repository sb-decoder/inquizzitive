import { useEffect, useRef, useState } from "react";

export default function AIChatMentor() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus?.();
  }, [open]);

  const send = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    const userMsg = { role: "user", text: question };
    setMessages((m) => [...m, userMsg]);

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/chatResponse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "AI error");

      if (data.type === "questions") {
        // Try to parse JSON array of questions
        try {
          const parsed = JSON.parse(data.reply);
          // Add as a special message containing questions
          setMessages((m) => [...m, { role: "ai", type: "questions", questions: parsed }]);
        } catch (err) {
          // Fallback to plain text
          setMessages((m) => [...m, { role: "ai", text: data.reply }]);
        }
      } else {
        setMessages((m) => [...m, { role: "ai", text: data.reply }]);
      }
      setQuestion("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to get AI reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-mentor">
      {/* Floating toggle button */}
      <div className="fixed right-6 bottom-6 z-50 flex items-end">
        <div className="relative">
          <button
            aria-label={open ? "Close AI Mentor" : "Open AI Mentor"}
            onClick={() => setOpen((s) => !s)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-rose-500 shadow-xl flex items-center justify-center text-white text-2xl"
            title="AI Quiz Mentor"
          >
            {/* Chat SVG icon for a more professional look */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M2 6.5C2 4.57 3.57 3 5.5 3h13C20.43 3 22 4.57 22 6.5v5c0 1.93-1.57 3.5-3.5 3.5H8.7L4 20.5V15c-1.1 0-2-.9-2-2v-6.5z" />
            </svg>
          </button>

          {/* Panel */}
          {open && (
            <div className="mt-3 w-[420px] max-w-[95vw]">
              <div className="glass-card p-5 rounded-xl shadow-2xl bg-slate-900/70 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-500 to-rose-500 text-white shadow"> 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M2 6.5C2 4.57 3.57 3 5.5 3h13C20.43 3 22 4.57 22 6.5v5c0 1.93-1.57 3.5-3.5 3.5H8.7L4 20.5V15c-1.1 0-2-.9-2-2v-6.5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white text-lg font-semibold">AI Quiz Mentor</h4>
                        <div className="text-sm text-gray-300">Ask for explanations or request suggested questions</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white text-lg px-2 py-1">✕</button>
                  </div>
                </div>

                <div className="mb-3">
                  <input
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask: Why is the answer not the World Bank? Or: suggest 10 questions"
                    className="w-full px-4 py-3 rounded-lg bg-white/6 text-white placeholder-gray-300 text-base outline-none"
                  />
                </div>

                <div className="flex gap-3 mb-4">
                  <button onClick={send} disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-rose-500 text-white font-medium shadow">
                    {loading ? "Thinking..." : "Ask Mentor"}
                  </button>
                  <button onClick={() => { setMessages([]); setQuestion(""); }} className="px-4 py-2 rounded-lg bg-white/6 text-white">Clear</button>
                </div>

                {error && <div className="mb-2 text-sm text-red-300">{error}</div>}

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {messages.map((m, i) => {
                    if (m.type === "questions") {
                      return (
                        <div key={i} className="p-3 rounded-md bg-white/5">
                          <div className="text-xs text-gray-300 mb-2">Mentor – Suggested Questions</div>
                          <div className="text-base text-white space-y-3">
                            {m.questions.slice(0, 10).map((q, idx) => (
                              <div key={idx} className="p-3 rounded-md bg-white/6">
                                <div className="font-semibold text-white">{idx + 1}. {q.question}</div>
                                <ul className="list-disc list-inside text-sm text-gray-200 mt-2">
                                  {q.options?.map((opt, oi) => (
                                    <li key={oi}>{opt}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className={`p-3 rounded-md ${m.role === "user" ? "bg-white/6" : "bg-white/8"}`}>
                        <div className="text-sm text-gray-300 mb-1">{m.role === "user" ? "You" : "Mentor"}</div>
                        <div className="text-base text-white">{m.text}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
