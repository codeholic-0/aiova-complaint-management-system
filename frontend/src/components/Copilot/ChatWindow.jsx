import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatWindow() {
  const { messages } = useSelector((s) => s.chat);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg min-h-[300px] max-h-[400px]">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-800"
            }`}
          >
            {msg.role === "user" ? (
              msg.content
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  strong: ({ children }) => <span className="font-semibold">{children}</span>,
                  p: ({ children }) => <span>{children}</span>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
