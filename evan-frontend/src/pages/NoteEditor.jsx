import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "../icons";
import TiptapEditor from "../components/TiptapEditor";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const notebookIdFromURL = queryParams.get("notebook");
  const isNew = id === "new";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [noteId, setNoteId] = useState(isNew ? null : id);
  const [loaded, setLoaded] = useState(false);
  const [notebook, setNotebook] = useState(null);
  const [tag, setTag] = useState("");

  // Load note
  useEffect(() => {
    async function loadNote() {
      if (!isNew && id) {
        const data = await apiRequest(`/notes/${id}/`);
        setTitle(data.title || "");
        setContent(data.content || "");
        setNoteId(data.id);
        setTag(data.tag || "");

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


  useEffect(() => {
    async function loadNotebook() {
      if (!notebookIdFromURL) return;

      try {
        const data = await apiRequest(`/notebooks/${notebookIdFromURL}/`);
        setNotebook(data);
      } catch (err) {
        console.error("Notebook load failed", err);
      }
    }

    loadNotebook();
  }, [notebookIdFromURL]);


  async function handleExportPDF() {
    const currentId = noteId || id;

    if (!currentId || currentId === "new") {
      alert("Please save the note first before exporting.");
      return;
    }

    try {
      const blob = await apiRequest(
        `/export/note/${currentId}/pdf/`,
        "GET",
        null,
        true
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${title || "note"}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  }

  async function handleSave() {
    if (!title.trim() && !content.trim()) return;

    setSaving(true);

    try {
      if (!noteId) {
        const created = await apiRequest("/notes/", "POST", {
          title: title || "Untitled",
          content,
          tag,
          notebook: notebookIdFromURL || null,
        });

        setNoteId(created.id);
        navigate(`/notes/${created.id}?notebook=${notebookIdFromURL}`, { replace: true });
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
        <Breadcrumbs
          items={
            notebookIdFromURL && notebook
              ? [
                { label: "Notebooks", path: "/notebooks" },
                {
                  label: notebook.name,
                  path: `/notebooks/${notebook.id}`
                },
                {
                  label: title || "Untitled"
                }
              ]
              : [
                { label: "Notes", path: "/notes" },
                {
                  label: title || "Untitled"
                }
              ]
          }
        />
        <div style={{ display: "flex", gap: "10px" }}>


        </div>
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
              marginBottom: "6px",
            }}
          />

          {/* <select
  value={tag}
  onChange={(e) => {
    const newTag = e.target.value;
    setTag(newTag);

    if (noteId) {
      apiRequest(`/notes/${noteId}/`, "PATCH", {
        tag: newTag
      });
    }
  }}
>
  <option value="">No Tag</option>
  <option value="important">⭐ Important</option>
  <option value="attention">🔁 Needs Attention</option>
  <option value="reference">📌 Reference</option>
</select> */}

          {/* Tiptap Editor */}

         
  {noteId && (
    <button className="export-btn" onClick={handleExportPDF}>
      <FontAwesomeIcon icon={faDownload} />
      Export
    </button>
  )}



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