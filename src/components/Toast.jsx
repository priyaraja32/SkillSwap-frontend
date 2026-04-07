import { useEffect } from "react";

export default function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-50 animate-slideIn">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
