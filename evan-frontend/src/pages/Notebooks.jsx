import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

function Notebooks() {
  const navigate = useNavigate();

  const [notebooks, setNotebooks] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  function loadNotebooks() {
    apiRequest("/notebooks/").then((data) => {
      setNotebooks(Array.isArray(data) ? data : []);
    });
  }

  useEffect(() => {
    loadNotebooks();
  }, []);

  async function handleCreateNotebook() {
    if (!newName.trim()) return;

    await apiRequest("/notebooks/", "POST", {
      name: newName,
    });

    setNewName("");
    setCreating(false);
    loadNotebooks();
  }

  async function handleRename(id) {
    if (!renameValue.trim()) return;

    await apiRequest(`/notebooks/${id}/`, "PATCH", {
      name: renameValue,
    });

    setRenamingId(null);
    loadNotebooks();
  }

  async function handleDelete(id) {
    await apiRequest(`/notebooks/${id}/`, "DELETE");
    loadNotebooks();
  }

  useEffect(() => {
    function handleClickOutside() {
      setOpenMenu(null);
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="container">
      {/* HEADER */}
      <h2
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "25px"
  }}
>
  Notebooks

  <FontAwesomeIcon
    icon={faPlus}
    style={{ cursor: "pointer", fontSize: "16px" }}
    onClick={() => setCreating(true)}
  />
</h2>

      {/* CREATE INPUT */}
      {creating && (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateNotebook();
          }}
          placeholder="Notebook name..."
          style={{
            marginBottom: "20px",
            padding: "10px",
            borderRadius: "8px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            width: "100%",
          }}
        />
      )}

      {/* NOTEBOOK LIST */}
      {notebooks.map((nb) => (
        <div
          key={nb.id}
          style={{
            background: "var(--card)",
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* MENU */}
            <div style={{ position: "relative" }}>
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                style={{ opacity: 0.6, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === nb.id ? null : nb.id);
                }}
              />

              {openMenu === nb.id && (
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "24px",
                    background: "var(--menu)",
                    borderRadius: "8px",
                    padding: "6px 0",
                    minWidth: "120px",
                    zIndex: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                    onClick={() => {
                      setRenamingId(nb.id);
                      setRenameValue(nb.name);
                      setOpenMenu(null);
                    }}
                  >
                    Rename
                  </div>

                  <div
                    style={{
                      padding: "6px 12px",
                      cursor: "pointer",
                      color: "#ff5555",
                    }}
                    onClick={() => handleDelete(nb.id)}
                  >
                    Delete
                  </div>
                </div>
              )}
            </div>

            {/* NOTEBOOK NAME */}
            {renamingId === nb.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(nb.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text)",
                  fontSize: "16px",
                }}
              />
            ) : (
              <span
                style={{ fontSize: "16px", cursor: "pointer" }}
                onClick={() => navigate(`/notebooks/${nb.id}`)}
              >
                {nb.name}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notebooks;