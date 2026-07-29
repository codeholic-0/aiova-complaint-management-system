import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setStreaming, setProgress } from "../../store/slices/chatSlice";
import { setFromBackend } from "../../store/slices/complaintSlice";
import { setComplaintId } from "../../store/slices/sessionSlice";
import { addUploadedFile, removeUploadedFile, setUploading } from "../../store/slices/uploadSlice";
import { createChatStream, uploadFile } from "../../services/api";

const COMMANDS = [
  { cmd: "/capa", desc: "Recommend corrective and preventive actions" },
  { cmd: "/completeness", desc: "Check which fields are still missing" },
  { cmd: "/diff", desc: "Show changes from last edit" },
  { cmd: "/duplicate", desc: "Check for potential duplicate complaints" },
  { cmd: "/riskclassify", desc: "ICH Q9 risk classification" },
  { cmd: "/rootcause", desc: "Perform root cause analysis" },
  { cmd: "/summary", desc: "Generate a complaint summary" },
  { cmd: "/undo", desc: "Undo last edit" },
];

export default function ChatInput() {
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [selIdx, setSelIdx] = useState(0);
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const { complaintId } = useSelector((s) => s.session);
  const { isStreaming } = useSelector((s) => s.chat);
  const { uploadedFiles, isUploading } = useSelector((s) => s.upload);

  const filter = input.startsWith("/") ? input.slice(1).toLowerCase() : "";
  const filtered = filter
    ? COMMANDS.filter((c) => c.cmd.includes(filter))
    : COMMANDS;

  const selectCommand = useCallback((cmd) => {
    setInput(cmd + " ");
    setShowCommands(false);
    setSelIdx(0);
    inputRef.current?.focus();
  }, []);

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

    eventSource.addEventListener("error", (event) => {
      try {
        const data = JSON.parse(event.data);
        dispatch(addMessage({ role: "bot", content: `Error: ${data.error}` }));
      } catch {
        // parse error means connection error, not app error
      }
      eventSource.close();
      dispatch(setStreaming(false));
      dispatch(setProgress({ percent: 0, status: "" }));
    });
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 10 * 1024 * 1024) {
      dispatch(addMessage({ role: "bot", content: "File too large. Max 10MB." }));
      return;
    }

    dispatch(addMessage({ role: "user", content: `📄 Uploaded: ${file.name}` }));
    dispatch(setUploading(true));
    dispatch(setProgress({ percent: 10, status: "Uploading file..." }));

    try {
      const res = await uploadFile(file);
      const data = res.data;
      dispatch(addUploadedFile({ name: file.name }));
      dispatch(setProgress({ percent: 50, status: "Extracting details..." }));
      if (data.form || data.assessment) {
        dispatch(setFromBackend({ form: data.form, assessment: data.assessment }));
      }
      if (data.complaint_id) {
        dispatch(setComplaintId(data.complaint_id));
      }
      if (data.reply) {
        dispatch(addMessage({ role: "bot", content: data.reply }));
      }
      dispatch(setProgress({ percent: 100, status: "File processed" }));
    } catch (err) {
      dispatch(addMessage({ role: "bot", content: `Upload failed: ${err.message}` }));
    } finally {
      dispatch(setUploading(false));
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setSelIdx(0);
    setShowCommands(val.startsWith("/"));
  };

  const handleKeyDown = (e) => {
    if (showCommands && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelIdx((i) => (i + 1 < filtered.length ? i + 1 : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        selectCommand(filtered[selIdx].cmd);
        return;
      }
      if (e.key === "Escape") {
        setShowCommands(false);
        setSelIdx(0);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (showCommands) setSelIdx(0);
  }, [input, showCommands]);

  return (
    <div className="mt-4 border-t pt-4 relative">
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {uploadedFiles.map((f) => (
            <span
              key={f.timestamp}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
            >
              📎 {f.name}
              <button
                className="hover:text-red-600 ml-0.5 leading-none"
                onClick={() => dispatch(removeUploadedFile(f.name))}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {showCommands && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
          {filtered.map((c, i) => (
            <button
              key={c.cmd}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 ${
                i === selIdx ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
              }`}
              onMouseDown={() => selectCommand(c.cmd)}
            >
              <span className="font-mono font-medium">{c.cmd}</span>
              <span className="text-gray-400 text-xs">{c.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.png,.eml"
          className="hidden"
          onChange={handleFilePick}
          disabled={isStreaming || isUploading}
        />
        <button
          className="text-gray-400 hover:text-blue-600 disabled:text-gray-200 transition-colors p-1.5"
          onClick={() => fileRef.current?.click()}
          disabled={isStreaming || isUploading}
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.25 5.75a2.828 2.828 0 0 0-4 0L5.575 14.42a4.243 4.243 0 0 0 6 6L20.25 11.75a6 6 0 1 0-8.5-8.5L3.07 11.93a.75.75 0 1 0 1.06 1.06l8.68-8.68a4.5 4.5 0 1 1 6.36 6.36l-8.67 8.67a5.743 5.743 0 0 1-8.12-8.12l8.67-8.68a.75.75 0 0 0-1.06-1.06L3.54 10.68a7.243 7.243 0 0 0 10.24 10.24l8.68-8.68a4.243 4.243 0 0 0-3.25-7.19c-1.12 0-2.2.45-3 1.25Z" />
          </svg>
        </button>
        <input
          ref={inputRef}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message... (type / for commands)"
          value={input}
          onChange={handleChange}
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
    </div>
  );
}
