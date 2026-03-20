import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      apiRequest(`/search/?q=${query}`).then(setResults);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Close */}
        <button
          onClick={() => navigate(-1)}
          style={{ float: "right", background: "none", border: "none" }}
        >
          ✕
        </button>

        {/* Input */}
        <input
          autoFocus
          placeholder="Search notes, notebooks, tracks, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "var(--hover)",
            background: "var(--card)",
            color: "var(--text)",
            boxSizing: "border-box",  // 🔥 IMPORTANT
          }}
        />

        {!results ? (
          <p style={{ opacity: 0.6 }}>Start typing to search...</p>
        ) : (
          <>
            <Section
              title="Notes"
              items={results.notes}
              onClick={(id) => navigate(`/notes/${id}`)}
            />
            <Section
              title="Notebooks"
              items={results.notebooks}
              onClick={(id) => navigate(`/notebooks/${id}`)}
            />
            <Section
              title="Tracks"
              items={results.tracks}
              onClick={(id) => navigate(`/tracks/${id}`)}
            />
            <Section
              title="Topics"
              items={results.topics}
              onClick={(id) => navigate(`/topics/${id}`)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, onClick }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ opacity: 0.7 }}>{title}</h4>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onClick(item.id)}
          style={{
            padding: "8px 0",
            cursor: "pointer",
            borderBottom: "var(--border)",
          }}
        >
          {item.title || item.name}
        </div>
      ))}
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "var(--overlay)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  paddingTop: "120px",
  zIndex: 3000,
};

const modalStyle = {
  background: "var(--card)",
  width: "700px",
  padding: "30px",
  borderRadius: "14px",
  maxHeight: "70vh",
  overflowY: "auto",
};

export default Search;