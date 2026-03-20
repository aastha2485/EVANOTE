import { useEffect, useState } from "react";

function CommandPalette({ isOpen, onClose, commands }) {
    const [query, setQuery] = useState("");

    // ESC handler
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
        }
    }, [isOpen]);

    // 🚨 RETURN AFTER ALL HOOKS
    if (!isOpen) return null;

    const filtered = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={overlayStyle}>
            <div style={paletteStyle}>
                <input
                    autoFocus
                    placeholder="Type a command..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={inputStyle}
                />

                <div>
                    {filtered.map((cmd, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                cmd.action();
                                onClose();
                            }}
                            style={itemStyle}
                        >
                            {cmd.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "120px",
    zIndex: 9999,
};

const paletteStyle = {
    width: "520px",
    background: "var(--card)",
    borderRadius: "14px",
    border: "var(--border)",
    overflow: "hidden",
};

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "#151515",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontSize: "15px",
};

const itemStyle = {
    padding: "12px 16px",
    cursor: "pointer",
    borderTop: "var(--border)",
};

export default CommandPalette;
