import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setUploading } from "../../store/slices/uploadSlice";

export default function UploadDropzone() {
  const dispatch = useDispatch();
  const { fileName } = useSelector((s) => s.upload);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB.");
      return;
    }
    dispatch(setFile({ file, name: file.name, type: file.type }));
    dispatch(setUploading(true));
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
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.png,.eml"
        className="hidden"
        onChange={handleChange}
      />
      {fileName ? (
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
