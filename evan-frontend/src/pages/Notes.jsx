

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

function Notes({ searchQuery }) {
  const navigate = useNavigate();
  const { id } = useParams(); // notebook id if coming from /notebooks/:id

  const [notes, setNotes] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [openNotebookMenu, setOpenNotebookMenu] = useState(null);
  const [topics, setTopics] = useState([]);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showTopicMenu, setShowTopicMenu] = useState(null);


  function stripHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  } 
  
  function loadNotes() {
    let endpoint = "/notes/";

    if (id) {
      endpoint = `/notes/?notebook=${id}`;
    } else if (searchQuery) {
      endpoint = `/notes/?search=${encodeURIComponent(searchQuery)}`;
    }

    apiRequest(endpoint).then((data) => {
      setNotes(Array.isArray(data) ? data : []);
    });
  }

  function loadNotebooks() {
    apiRequest("/notebooks/").then((data) => {
      setNotebooks(Array.isArray(data) ? data : []);
    });
  }

  function loadTopics() {
    apiRequest("/topics/").then((data) => {
      setTopics(Array.isArray(data) ? data : []);
    });
  }

  useEffect(() => {
    loadNotes();
    loadNotebooks();
    loadTopics();
  }, [searchQuery, id]);

  async function handleMoveNote(noteId, notebookId) {
    await apiRequest(`/notes/${noteId}/`, "PATCH", {
      notebook: notebookId || null,
    });
    loadNotes();
  }

  async function handleLink(noteId, topicId) {
    await apiRequest(`/notes/${noteId}/`, "PATCH", {
      topic: topicId || null,
    });
    loadNotes();
  }

  return (
    <div className="container">
      {/* Header */}
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {id ? "Notebook Notes" : "Notes"}

        <FontAwesomeIcon
          icon={faPlus}
          style={{ cursor: "pointer", fontSize: "16px" }}
          onClick={() => navigate("/notes/new")}
        />
      </h2>

      <div className="notes-grid">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{
              background: "var(--card)",
              padding: "20px",
              borderRadius: "14px",
              border: "var(--border)",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            {/* 3-dot */}
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                opacity: 0.6,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(
                  openMenuId === note.id ? null : note.id
                );
              }}
            />

            {/* Dropdown */}
            {openMenuId === note.id && (
              <div
                style={{
                  position: "absolute",
                  top: "30px",
                  right: "12px",
                  background: "var(--menu)",
                  borderRadius: "8px",
                  zIndex: 1000,
                  minWidth: "200px",
                  padding: "6px 0",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Link Topic */}
                <div
                  style={{ padding: "6px 12px", cursor: "pointer" }}
                  onClick={() =>
                    setShowTopicMenu(
                      showTopicMenu === note.id
                        ? null
                        : note.id
                    )
                  }
                >
                  Link to Topic ▸
                </div>

                {showTopicMenu === note.id && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        style={{
                          padding: "6px 12px",
                          cursor: "pointer",
                          background:
                            note.topic === topic.id
                              ? "#333"
                              : "transparent",
                        }}
                        onClick={() => {
                          handleLink(note.id, topic.id);
                          setOpenMenuId(null);
                          setShowTopicMenu(null);
                        }}
                      >
                        {topic.title}
                      </div>
                    ))}
                  </div>
                )}

                {note.topic && (
                  <div
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "#ff5555",
                    }}
                    onClick={() => {
                      handleLink(note.id, null);
                      setOpenMenuId(null);
                    }}
                  >
                    Unlink Topic
                  </div>
                )}

                <div
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    color: "#ff5555",
                  }}
                  onClick={async () => {
                    await apiRequest(
                      `/notes/${note.id}/`,
                      "DELETE"
                    );
                    loadNotes();
                    setOpenMenuId(null);
                  }}
                >
                  Delete
                </div>
              </div>
            )}

            <h3>{note.title || "Untitled"}</h3>
            <p style={{ opacity: 0.7 }}>
              {stripHTML(note.content).slice(0, 120)}
            </p>

            {/* Notebook Selector */}
            <div style={{ marginTop: "12px", position: "relative" }}>
  {/* Trigger */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      setOpenNotebookMenu(
        openNotebookMenu === note.id ? null : note.id
      );
    }}
    style={{
      padding: "6px 10px",
      fontSize: "13px",
      borderRadius: "6px",
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      cursor: "pointer",
      display: "inline-block",
    }}
  >
    📂{" "}
    {
      notebooks.find((nb) => nb.id === note.notebook)?.name ||
      "Inbox"
    }
  </div>

  {/* Dropdown */}
  {openNotebookMenu === note.id && (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "34px",
        left: "0",
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "10px",
        minWidth: "180px",
        zIndex: 1000,
        padding: "6px 0",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Inbox */}
      <div
        onClick={() => {
          handleMoveNote(note.id, null);
          setOpenNotebookMenu(null);
        }}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.target.style.background = "#2a2a2a")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "transparent")
        }
      >
        📥 Inbox
      </div>

      {/* Notebooks */}
      {notebooks.map((nb) => (
        <div
          key={nb.id}
          onClick={() => {
            handleMoveNote(note.id, nb.id);
            setOpenNotebookMenu(null);
          }}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            background:
              note.notebook === nb.id ? "#2a2a2a" : "transparent",
          }}
          onMouseEnter={(e) =>
            (e.target.style.background = "#2a2a2a")
          }
          onMouseLeave={(e) =>
            (e.target.style.background =
              note.notebook === nb.id
                ? "#2a2a2a"
                : "transparent")
          }
        >
          📂 {nb.name}
        </div>
      ))}
    </div>
  )}
</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;