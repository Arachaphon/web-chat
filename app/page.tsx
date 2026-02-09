"use client";

// เพิ่ม useEffect เข้ามาในบรรทัด import
import { useState, useEffect } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "สวัสดีครับ พิมพ์ข้อความเพื่อเริ่มแชทได้เลย" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // ใช้ useEffect จัดการ sessionId เพื่อป้องกัน Error #418
  useEffect(() => {
    const key = "session_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    setSessionId(id);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: "U-001",
          customer_name: "Somchai",
          message: text,
        }),
      });

      const data = await res.json();
      const reply = data?.content ?? "ขออภัย ระบบไม่สามารถตอบได้ในขณะนี้";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MVP Web Chat (Next.js → n8n → Gemini)</h1>

      <div className="border rounded p-4 h-[60vh] overflow-auto space-y-3 bg-white">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block max-w-[80%] rounded px-3 py-2 border ${
              m.role === "user" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="text-xs opacity-60 mb-1 font-semibold">
                {m.role === "user" ? "YOU" : "ASSISTANT"}
              </div>
              <div className="whitespace-pre-wrap text-black">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="พิมพ์ข้อความ..."
          disabled={busy}
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50 hover:bg-gray-800 transition-colors"
          onClick={send}
          disabled={busy}
        >
          {busy ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-2 flex justify-between">
        <span>Session: <span className="font-mono text-xs">{sessionId || "Loading..."}</span></span>
        {busy && <span className="animate-pulse">AI กำลังพิมพ์...</span>}
      </div>
    </main>
  );
}