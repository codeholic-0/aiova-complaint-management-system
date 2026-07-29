export default function Field({
    label,
    value,
    type = "text",
    placeholder = "Awaiting AI extraction...",
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
            </label>
            {type === "textarea" ? (
                <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 resize-none"
                    rows={3}
                    value={value || ""}
                    placeholder={placeholder}
                    disabled
                />
            ) : (
                <input
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
                    type={type}
                    value={value || ""}
                    placeholder={placeholder}
                    disabled
                />
            )}
        </div>
    );
}
