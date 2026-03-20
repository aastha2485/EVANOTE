import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Breadcrumbs";

function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notebook, setNotebook] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotebook();
    loadNotes();
  }, [id]);

  async function loadNotebook() {
    const data = await apiRequest(`/notebooks/${id}/`);
    setNotebook(data);
  }

  async function loadNotes() {
    const data = await apiRequest(`/notebooks/${id}/notes/`);
    setNotes(data);
  }

  if (!notebook) return <div className="container">Loading...</div>;

  return (
    <div className="container">
     <Breadcrumbs
  items={[
    { label: "Notebooks", path: "/notebooks" },
    { label: notebook.name }
  ]}
/>

      <h2
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px"
  }}
>
  {notebook.name}

  <FontAwesomeIcon
    icon={faPlus}
    style={{ cursor: "pointer", fontSize: "16px" }}
    onClick={() => navigate(`/notes/new?notebook=${id}`)}
  />
</h2>

      <div className="notes-grid">
        {notes.map(note => (
          <div
            key={note.id}
            className="note-card"
            style={{
              background: "var(--card)",
              padding: "20px",
              borderRadius: "14px",
              border: "var(--border)",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <h3>{note.title || "Untitled"}</h3>
            <p style={{ opacity: 0.7 }}>
  {note.content
    ?.replace(/<[^>]+>/g, "")
    .slice(0, 120)}
</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotebookDetail;