"use client";

import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* history */}
      <div className="space-y-2 mb-4">
        {messages.map((m, i) => {
          // use streamed parts when present
          const text = m.parts
            ? m.parts
                .map(p => ("text" in p ? p.text : ""))
                .join("")
            : m.content;

          return (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "text-right font-medium"
                  : "text-left"
              }
            >
              {text}
            </div>
          );
        })}
      </div>

      {/* input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about Dark Alpha Capital…"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Send
        </button>
      </form>
    </div>
  );
}
