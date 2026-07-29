import { useSelector } from "react-redux";

export default function ExtractionProgress() {
  const { progress, statusText } = useSelector((s) => s.chat);
  const { isUploading } = useSelector((s) => s.upload);

  if (!isUploading && progress === 0) return null;

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {statusText && (
        <p className="text-xs text-gray-500 mt-1">{statusText}</p>
      )}
    </div>
  );
}
