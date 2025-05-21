"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    // 1) locally add the user's message
    const userMsg = { role: "user" as const, content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    try {
      // 2) call the API with the full conversation
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      console.log("API →", data);

      // 3) append the assistant’s reply
      if (data.content) {
        setMessages((m) => [
          ...m,
          { role: "assistant" as const, content: data.content },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant" as const, content: "🤖 (no reply from server)" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "assistant" as const, content: "⚠️ network error" },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <div
        style={{
          minHeight: 300,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 16,
                background: m.role === "user" ? "#e0f3ff" : "#f0f0f0",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex" }}>
        <input
          style={{ flex: 1, padding: 8, fontSize: 16 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about Dark Alpha Capital..."
        />
        <button
          style={{ marginLeft: 8, padding: "0 16px", fontSize: 16 }}
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
