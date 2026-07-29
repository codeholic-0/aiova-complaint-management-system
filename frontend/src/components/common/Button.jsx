export default function Button({
    children,
    variant = "primary",
    onClick,
    type = "button",
    disabled = false,
}) {
    const base = "px-6 py-2 rounded font-medium text-sm transition-colors";
    const styles = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300",
        secondary:
            "bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
        <button
            type={type}
            className={`${base} ${styles[variant]}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
