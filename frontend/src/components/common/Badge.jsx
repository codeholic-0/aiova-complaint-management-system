export default function Badge({ children, color = "blue" }) {
    const colors = {
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
        red: "bg-red-100 text-red-800",
        yellow: "bg-yellow-100 text-yellow-800",
    };
    return (
        <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[color]}`}
        >
            {children}
        </span>
    );
}
