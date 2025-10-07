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
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex items-center justify-center text-white text-xl"
            title="AI Mentor"
          >
            💬
          </button>

          {/* Panel */}
          {open && (
            <div className="mt-2 w-[360px] max-w-[90vw]">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold">AI Quiz Mentor</h4>
                  <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white">✕</button>
                </div>

                <div className="mb-2">
                  <input
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask: Why is the answer not the World Bank?"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-gray-300"
                  />
                </div>

                <div className="flex gap-2 mb-3">
                  <button onClick={send} disabled={loading} className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {loading ? "Thinking..." : "Ask"}
                  </button>
                  <button onClick={() => { setMessages([]); setQuestion(""); }} className="px-3 py-2 rounded-lg bg-white/10 text-white">Clear</button>
                </div>

                {error && <div className="mb-2 text-sm text-red-300">{error}</div>}

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {messages.map((m, i) => {
                    if (m.type === "questions") {
                      return (
                        <div key={i} className="p-2 rounded-md bg-white/10">
                          <div className="text-xs text-gray-300 mb-1">Mentor – Suggested Questions</div>
                          <div className="text-sm text-white space-y-2">
                            {m.questions.slice(0, 10).map((q, idx) => (
                              <div key={idx} className="p-2 rounded-md bg-white/5">
                                <div className="font-medium">{idx + 1}. {q.question}</div>
                                <ul className="list-disc list-inside text-sm text-gray-200 mt-1">
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
                      <div key={i} className={`p-2 rounded-md ${m.role === "user" ? "bg-white/5" : "bg-white/10"}`}>
                        <div className="text-xs text-gray-300 mb-1">{m.role === "user" ? "You" : "Mentor"}</div>
                        <div className="text-sm text-white">{m.text}</div>
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
