import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useSettings } from "../context/SettingsContext";
import Breadcrumbs from "../components/Breadcrumbs";

function TopicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDateInput, setShowDateInput] = useState(false);
  const { settings } = useSettings();

  async function handleRename() {
    if (!renameValue.trim()) return;

    await apiRequest(`/topics/${id}/`, "PATCH", {
      title: renameValue,
    });

    setRenaming(false);
    loadTopic();
  }

  async function handleDelete() {
    const confirmDelete = window.confirm("Delete this topic?");
    if (!confirmDelete) return;

    await apiRequest(`/topics/${id}/`, "DELETE");
    navigate(-1);
  }

  useEffect(() => {
    loadTopic();
    loadAttempts();
  }, [id]);

  async function loadTopic() {
    const data = await apiRequest(`/topics/${id}/`);
    setTopic(data);
  }

  async function loadAttempts() {
    const data = await apiRequest(`/topics/${id}/feynman/`);
    setAttempts(data);
  }

  async function handleCreateNote() {
    const created = await apiRequest("/notes/", "POST", {
      title: topic.title,
      content: "",
    });

    await apiRequest(`/notes/${created.id}/`, "PATCH", {
      topic: topic.id,
    });

    navigate(`/notes/${created.id}`);
  }

  async function handleManualComplete() {
    await apiRequest(`/topics/${id}/`, "PATCH", {
      status: "done",
    });

    loadTopic();
  }

  function getDueStatus(dateString) {
    if (!dateString) return "normal";

    const today = new Date();
    const due = new Date(dateString);
    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "overdue";
    if (diff <= 3) return "warning";
    return "normal";
  }

  const dueStyles = {
    normal: { color: "#aaa" },
    warning: { color: "#facc15" },
    overdue: { color: "#ef4444" }
  };

  if (!topic) {
    return <div className="container">Loading...</div>;
  }

  const status = getDueStatus(topic.due_date);

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
    <Breadcrumbs
  items={[
    { label: "Tracks", path: "/tracks" },
    {
      label: topic.track_title,
      path: `/tracks/${topic.track}`
    },
    { label: topic.title }
  ]}
/>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          position: "relative"
        }}
      >
        {renaming ? (
          <input
            value={renameValue}
            autoFocus
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            onBlur={() => setRenaming(false)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: "22px"
            }}
          />
        ) : (
          <h2>Topic: {topic.title}</h2>
        )}

        <FontAwesomeIcon
          icon={faEllipsisVertical}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        />

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "40px",
              right: "0",
              background: "var(--menu)",
              padding: "8px",
              borderRadius: "8px",
              zIndex: 1000
            }}
          >
            <div
              style={{ padding: "6px", cursor: "pointer" }}
              onClick={() => {
                setRenaming(true);
                setRenameValue(topic.title);
                setShowMenu(false);
              }}
            >
              Rename
            </div>

            <div
              style={{ padding: "6px", cursor: "pointer" }}
              onClick={() => {
                setShowDateInput(true);
                setShowMenu(false);
              }}
            >
              Set Due Date
            </div>

            <div style={{ padding: "6px" }}>
{topic.track_type === "personal" && (
  <>
    <div style={{ fontSize: "13px", marginBottom: "4px" }}>
      Repeat
    </div>

    <select
      value={topic.repeat_type || "none"}
      onChange={async (e) => {
        await apiRequest(`/topics/${id}/`, "PATCH", {
          repeat_type: e.target.value,
        });
        loadTopic();
      }}
      style={{
        width: "100%",
        padding: "6px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        color: "var(--text)"
      }}
    >
      <option value="none">None</option>
      <option value="daily">Daily</option>
      <option value="interval">Interval</option>
    </select>
  </>
)}

  {topic.repeat_type === "interval" && (
    <input
      type="number"
      min="1"
      placeholder="Days"
      value={topic.repeat_interval_days || ""}
      onChange={async (e) => {
        await apiRequest(`/topics/${id}/`, "PATCH", {
          repeat_interval_days: parseInt(e.target.value),
        });
      }}
      style={{
        marginTop: "6px",
        width: "100%",
        padding: "6px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        color: "var(--text)"
      }}
    />
  )}
</div>

            <div
              style={{ padding: "6px", cursor: "pointer", color: "red" }}
              onClick={handleDelete}
            >
              Delete
            </div>
          </div>
        )}
      </div>
      {/* Due Date */}
      {topic.due_date && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "14px",
            ...dueStyles[status]
          }}
        >
          Due: {topic.due_date}
          {status === "warning" && " ⚠"}
          {status === "overdue" && " — Overdue"}
        </div>
      )}

      <p style={{ marginTop: "10px" }}>
        Status: 
      

      
        <select
          value={topic.status}
          onChange={async (e) => {
            await apiRequest(`/topics/${id}/`, "PATCH", {
              status: e.target.value,
            });
            loadTopic();
          }}
          style={{
            padding: "6px 8px",
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            marginLeft: "8px",
          }}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      
      </p>
      {showDateInput && (
        <input
          type="date"
          autoFocus
          defaultValue={topic.due_date || ""}
          onBlur={() => setShowDateInput(false)}
          onChange={async (e) => {
            await apiRequest(`/topics/${id}/`, "PATCH", {
              due_date: e.target.value,
            });
            setShowDateInput(false);
            loadTopic();
          }}
          style={{
            marginTop: "8px",
            padding: "6px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text)"
          }}
        />
      )}

      {/* Actions */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        {topic.note_id ? (
          <button onClick={() => navigate(`/notes/${topic.note_id}`)}>
            View Notes
          </button>
        ) : (
          <button onClick={handleCreateNote}>
            New Note & Link
          </button>
        )}

        {topic.track_type === "subject" && (
          <button
            onClick={() => navigate(`/topics/${topic.id}/feynman`)}
          >
            Explain (Feynman)
          </button>
        )}
      </div>

      {topic.track_type === "subject" && (
  <>
    <hr style={{ margin: "30px 0" }} />



    <h3>Feynman Progress</h3>

{attempts.length === 0 ? (
  <p>No explanation yet.</p>
) : (
  <div
    style={{
      padding: "12px",
      borderRadius: "10px",
      background: "var(--card)",
      cursor: "pointer"
    }}
    onClick={() =>
      navigate(`/topics/${topic.id}/feynman`)
    }
  >
    <strong>
      {attempts[0].clarity_score >= 0.75
        ? "✔ Good Understanding"
        : "⚠ Partial Understanding"}
    </strong>

    <div
      style={{ marginTop: "8px", opacity: 0.7 }}
      dangerouslySetInnerHTML={{
        __html: attempts[0].content
      }}
    />
  </div>
)}
  </>
      )}

    </div>
  );
}

export default TopicDetail;