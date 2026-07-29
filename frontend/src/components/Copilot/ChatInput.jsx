import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setStreaming, setProgress } from "../../store/slices/chatSlice";
import { setFromBackend } from "../../store/slices/complaintSlice";
import { setComplaintId } from "../../store/slices/sessionSlice";
import { createChatStream } from "../../services/api";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const { complaintId } = useSelector((s) => s.session);
  const { isStreaming } = useSelector((s) => s.chat);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    dispatch(addMessage({ role: "user", content: text }));
    dispatch(setStreaming(true));
    dispatch(setProgress({ percent: 5, status: "Sending request..." }));

    const eventSource = createChatStream(text, complaintId);

    eventSource.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data);
      dispatch(setProgress({ percent: data.percent, status: data.status }));
      if (data.form || data.assessment) dispatch(setFromBackend({ form: data.form, assessment: data.assessment }));
    });

    eventSource.addEventListener("result", (event) => {
      const data = JSON.parse(event.data);
      if (data.form || data.assessment) dispatch(setFromBackend({ form: data.form, assessment: data.assessment }));
      if (data.complaint_id) dispatch(setComplaintId(data.complaint_id));
      if (data.reply) dispatch(addMessage({ role: "bot", content: data.reply }));
      eventSource.close();
      dispatch(setStreaming(false));
      dispatch(setProgress({ percent: 100, status: "Complete" }));
    });

    eventSource.onerror = () => {
      eventSource.close();
      dispatch(setStreaming(false));
      dispatch(setProgress({ percent: 0, status: "" }));
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 border-t pt-4">
      <input
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
      />
      <button
        className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        onClick={handleSubmit}
        disabled={isStreaming || !input.trim()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </div>
  );
}
