import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setUploading, clearFile } from "../../store/slices/uploadSlice";
import { setFromBackend } from "../../store/slices/complaintSlice";
import { setComplaintId } from "../../store/slices/sessionSlice";
import { addMessage, setProgress } from "../../store/slices/chatSlice";
import { uploadFile } from "../../services/api";

export default function UploadDropzone() {
  const dispatch = useDispatch();
  const { fileName, isUploading } = useSelector((s) => s.upload);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }
    dispatch(setFile({ file, name: file.name, type: file.type }));
    dispatch(setUploading(true));
    dispatch(setProgress({ percent: 10, status: "Uploading file..." }));

    try {
      const res = await uploadFile(file);
      const data = res.data;
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
      dispatch(setProgress({ percent: 100, status: "File processed successfully" }));
    } catch (err) {
      dispatch(addMessage({ role: "bot", content: `Upload failed: ${err.message}` }));
    } finally {
      dispatch(setUploading(false));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.png,.eml"
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
      {isUploading ? (
        <p className="text-sm text-blue-600 font-medium">Uploading...</p>
      ) : fileName ? (
        <p className="text-sm text-blue-600 font-medium">{fileName}</p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PDF, DOCX, TXT, PNG (max 10MB)
          </p>
        </>
      )}
    </div>
  );
}
