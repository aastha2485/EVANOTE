import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "../icons";
import TiptapEditor from "../components/TiptapEditor";

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteId, setNoteId] = useState(isNew ? null : id);

  const [loaded, setLoaded] = useState(false);

  // Load note
  useEffect(() => {
    async function loadNote() {
      if (!isNew && id) {
        const data = await apiRequest(`/notes/${id}/`);
        setTitle(data.title || "");
        setContent(data.content || "");
        setNoteId(data.id);
      }
      setLoaded(true);
    }

    loadNote();
  }, [id, isNew]);

  // Autosave
  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content]);

  async function handleSave() {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);

    try {
      if (!noteId) {
        const created = await apiRequest("/notes/", "POST", {
          title: title || "Untitled",
          content,
        });

        setNoteId(created.id);
        navigate(`/notes/${created.id}`, { replace: true });
      } else {
        await apiRequest(`/notes/${noteId}/`, "PATCH", {
          title,
          content,
        });
      }
    } catch (err) {
      console.error("Save failed", err);
    }

    setSaving(false);
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: "50px",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div
          style={{
            maxWidth: "800px",
    margin: "0 auto",
    paddingTop: "0px",
          }}
        >
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            style={{
              fontSize: "42px",
              fontWeight: "600",
              width: "100%",
              border: "none",
              background: "transparent",
              outline: "none",
              marginBottom: "12px",
            }}
          />

          <button
  onClick={async () => {
    const blob = await apiRequest(`/notes/${noteId}/export/pdf/`, "GET", null, true);
    downloadFile(blob, "note.pdf");
  }}
>
  Export PDF
</button>

          {/* Tiptap Editor */}
          <TiptapEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>
      </div>

      {/* Save Indicator */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "30px",
          fontSize: "13px",
          opacity: 0.5,
        }}
      >
        {saving ? "Saving..." : "Saved"}
      </div>
    </div>
  );
}

export default NoteEditor;