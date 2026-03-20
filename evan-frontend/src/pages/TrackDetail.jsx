import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSettings } from "../context/SettingsContext";
import {
  faArrowLeft,
  faPlus,
  faEllipsisVertical,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "../components/Breadcrumbs";

function TrackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [trackData, setTrackData] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDateInput, setShowDateInput] = useState(false);
  const [openTopicMenu, setOpenTopicMenu] = useState(null);
  const [renamingTopicId, setRenamingTopicId] = useState(null);
  const [renameTopicValue, setRenameTopicValue] = useState("");
  const [editingTopicDateId, setEditingTopicDateId] = useState(null);
  const [topicFilter, setTopicFilter] = useState("all");
  const [topicSort, setTopicSort] = useState("custom");
  const { settings } = useSettings();
  const [personalStats, setPersonalStats] = useState(null);

  const statusColors = {
    pending: "#444",
    in_progress: "#d97706",
    done: "#16a34a",
  };

  const dueStyles = {
    normal: { color: "#aaa" },
    warning: { color: "#facc15" },
    overdue: { color: "#ef4444" },
  };

  useEffect(() => {
    loadTrack();
    loadTopics();
  }, [id]);

  async function loadTrack() {
    const data = await apiRequest(`/tracks/${id}/`);
    setTrackData(data);

    if (data.type === "personal") {
      const stats = await apiRequest(`/tracks/${id}/personal-stats/`);
      setPersonalStats(stats);
    }
  }

  let processedTopics = [...topics];

  // FILTER
  if (topicFilter !== "all") {
    processedTopics = processedTopics.filter(
      t => t.status === topicFilter
    );
  }

  if (topicSort === "due") {
    processedTopics.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  if (topicSort === "status") {
    const order = {
      pending: 0,
      in_progress: 1,
      done: 2
    };
    processedTopics.sort(
      (a, b) => order[a.status] - order[b.status]
    );
  }

  async function loadTopics() {
    const data = await apiRequest(`/tracks/${id}/topics/`);
    const sorted = data.sort((a, b) => a.order - b.order);
    setTopics(sorted);
  }

  async function handleCreateTopic() {
    if (!newTopic.trim()) return;

    await apiRequest(`/tracks/${id}/topics/`, "POST", {
      title: newTopic,
    });

    setNewTopic("");
    loadTopics();
    loadTrack();
  }

  async function updateStatus(topicId, newStatus) {
    await apiRequest(`/topics/${topicId}/`, "PATCH", {
      status: newStatus,
    });

    loadTopics();
    loadTrack();
  }

  async function handleRenameTopic(topicId) {
    if (!renameTopicValue.trim()) return;

    await apiRequest(`/topics/${topicId}/`, "PATCH", {
      title: renameTopicValue,
    });

    setRenamingTopicId(null);
    setRenameTopicValue("");
    loadTopics();
  }

  async function handleDeleteTopic(topicId) {
    const confirmDelete = window.confirm("Delete this topic?");
    if (!confirmDelete) return;

    await apiRequest(`/topics/${topicId}/`, "DELETE");

    loadTopics();
    loadTrack();
  }

  async function handleSetTopicDueDate(topicId, newDate) {
    await apiRequest(`/topics/${topicId}/`, "PATCH", {
      due_date: newDate || null,
    });

    setEditingTopicDateId(null);
    loadTopics();
  }

  async function handleRenameTrack() {
    if (!renameValue.trim()) return;

    await apiRequest(`/tracks/${id}/`, "PATCH", {
      title: renameValue,
    });

    setRenaming(false);
    loadTrack();
  }

  async function handleDeleteTrack() {
    const confirmDelete = window.confirm("Delete this track?");
    if (!confirmDelete) return;

    await apiRequest(`/tracks/${id}/`, "DELETE");
    navigate("/tracks");
  }

  function getDueStatus(dateString) {
    if (!dateString) return "normal";

    if (!settings?.show_due_warnings) return "normal";

    const today = new Date();
    const due = new Date(dateString);
    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "overdue";
    if (diff <= 3) return "warning";
    return "normal";
  }

  useEffect(() => {
    function handleClickOutside() {
      setShowMenu(false);
      setOpenTopicMenu(null);
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  if (!trackData) return <div className="container">Loading...</div>;

  

  return (
    <div className="container" style={{ maxWidth: "900px" }}>

      <Breadcrumbs
  items={[
    { label: "Tracks", path: "/tracks" },
    { label: trackData.title }
  ]}
/>

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "30px",
          position: "relative",
        }}
      >
        <div>
          {renaming ? (
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameTrack();
              }}
              style={{
                fontSize: "28px",
                fontWeight: "600",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
              }}
            />
          ) : (
            <h2 style={{ margin: 0 }}>{trackData.title}</h2>
          )}

          <div style={{ fontSize: "13px", opacity: 0.7 }}>
            Type:{" "}
            {trackData.type?.charAt(0).toUpperCase() +
              trackData.type?.slice(1)}
          </div>

          {trackData.due_date && (
            <div
              style={{
                fontSize: "13px",
                marginTop: "4px",
                ...dueStyles[getDueStatus(trackData.due_date)],
              }}
            >
              Due: {trackData.due_date}
              {getDueStatus(trackData.due_date) === "warning" && " ⚠"}
              {getDueStatus(trackData.due_date) === "overdue" &&
                " — Overdue"}
            </div>
          )}

          {showDateInput && (
            <input
              type="date"
              autoFocus
              onBlur={() => setShowDateInput(false)}   // 🔥 auto close
              defaultValue={trackData.due_date || ""}
              onChange={async (e) => {
                const newDate = e.target.value || null;

                await apiRequest(`/tracks/${id}/`, "PATCH", {
                  due_date: newDate,
                });

                setTrackData({ ...trackData, due_date: newDate });
                setShowDateInput(false);
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
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {trackData.type === "personal" ? (
  personalStats && (
    <div style={{ textAlign: "right", fontSize: "14px" }}>
      <div>
        Today: <strong>{personalStats.today_completed}</strong>
      </div>
      <div>
        Week: <strong>{personalStats.week_completed}</strong>
      </div>
      <div>
        Active Days: <strong>{personalStats.active_days}</strong>
      </div>
      <div>
        Consistency: <strong>{personalStats.consistency}%</strong>
      </div>
    </div>
  )
) : (
  <span style={{ fontWeight: "bold", fontSize: "18px" }}>
    {trackData.progress_percentage}% (
    {topics.filter((t) => t.status === "done").length}/
    {topics.length})
  </span>
)}

          <FontAwesomeIcon
            icon={faEllipsisVertical}
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();   // 🔥 IMPORTANT
              setShowMenu(!showMenu);
            }}
          />
        </div>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              background: "var(--menu)",
              padding: "8px",
              borderRadius: "8px",
              zIndex: 1000,
            }}
          >
            <div
              style={{ padding: "6px 10px", cursor: "pointer" }}
              onClick={() => {
                setRenaming(true);
                setRenameValue(trackData.title);
                setShowMenu(false);
              }}
            >
              Rename Track
            </div>

            <div
              style={{ padding: "6px 10px", cursor: "pointer" }}
              onClick={() => {
                setShowDateInput(true);
                setShowMenu(false);
              }}
            >
              Set Due Date
            </div>

            <div
              style={{
                padding: "6px 10px",
                cursor: "pointer",
                color: "red",
              }}
              onClick={handleDeleteTrack}
            >
              Delete Track
            </div>
          </div>
        )}
      </div>

      {/* CREATE TOPIC */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          placeholder="New Topic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text)",
          }}
        />
        <button onClick={handleCreateTopic}>
          <FontAwesomeIcon icon={faPlus} /> Add
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {["all", "pending", "in_progress", "done"].map(status => (
          <button
            key={status}
            onClick={() => setTopicFilter(status)}
            style={{
              background:
                topicFilter === status
                  ? "var(--hover)"
                  : "var(--card)"
            }}
          >
            {status === "all"
              ? "All"
              : status.replace("_", " ")}
          </button>
        ))}

        <div style={{ marginLeft: "auto" }}>
          <select
            value={topicSort}
            onChange={(e) => setTopicSort(e.target.value)}
            style={{
              padding: "6px",
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "6px"
            }}
          >
            <option value="custom">Custom Order</option>
            <option value="due">Due Date</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* TOPIC LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {processedTopics.map((topic) => {
          const today = new Date();
          const nextActive = topic.next_active_date
            ? new Date(topic.next_active_date)
            : null;

          const isInactive =
            topic.repeat_type !== "none" &&
            topic.status === "done" &&
            nextActive &&
            today < nextActive;

          let daysRemaining = 0;

          if (isInactive) {
            daysRemaining = Math.ceil(
              (nextActive - today) / (1000 * 60 * 60 * 24)
            );
          }

          return (
            <div
              key={topic.id}
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: "var(--card)",
                border: `1px solid ${statusColors[topic.status]}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                opacity: isInactive ? 0.5 : 1,
                transition: "opacity 0.2s ease"
              }}
            >
              {renamingTopicId === topic.id ? (
                <input
                  value={renameTopicValue}
                  autoFocus
                  onChange={(e) => setRenameTopicValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameTopic(topic.id);
                  }}
                  onBlur={() => setRenamingTopicId(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text)",
                    fontSize: "15px"
                  }}
                />
              ) : (
                <span
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  {topic.title}

                  {topic.repeat_type !== "none" && (
                    <FontAwesomeIcon
                      icon={faRotate}
                      style={{ opacity: 0.5 }}
                    />
                  )}
                </span>


              )}

              {isInactive && (
                <div
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    color: "#facc15"
                  }}
                >
                  Next active in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                </div>
              )}

              {topic.due_date && (
                <div
                  style={{
                    fontSize: "12px",
                    ...dueStyles[getDueStatus(topic.due_date)],
                  }}
                >
                  Due: {topic.due_date}
                  {getDueStatus(topic.due_date) === "warning" && " ⚠"}
                  {getDueStatus(topic.due_date) === "overdue" && " — Overdue"}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <select
                  value={topic.status}
                  disabled={isInactive}
                  onChange={(e) =>
                    updateStatus(topic.id, e.target.value)
                  }
                  style={{
                    background: statusColors[topic.status],
                    color: "var(--text)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 6px"
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTopicMenu(
                      openTopicMenu === topic.id ? null : topic.id
                    );
                  }}
                />
              </div>

              {openTopicMenu === topic.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: "10px",
                    background: "var(--menu)",
                    padding: "8px",
                    borderRadius: "8px",
                    zIndex: 1000
                  }}
                >
                  <div
                    style={{ padding: "6px", cursor: "pointer" }}
                    onClick={() => {
                      setRenamingTopicId(topic.id);
                      setRenameTopicValue(topic.title);
                      setOpenTopicMenu(null);
                    }}
                  >
                    Rename
                  </div>

                  <div
                    style={{ padding: "6px", cursor: "pointer" }}
                    onClick={() => {
                      setEditingTopicDateId(topic.id);
                      setOpenTopicMenu(null);
                    }}
                  >
                    Set Due Date
                  </div>
                  {trackData.type === "personal" && (
                    <div style={{ padding: "6px" }}>
                      <div style={{ fontSize: "13px", marginBottom: "4px" }}>
                        Repeat
                      </div>

                      <select
                        value={topic.repeat_type || "none"}
                        onChange={async (e) => {
  const value = e.target.value;

  if (value === "weekly") {
    await apiRequest(`/topics/${topic.id}/`, "PATCH", {
      repeat_type: "weekly",
      weekly_target: topic.weekly_target || 1
    });
  } else {
    await apiRequest(`/topics/${topic.id}/`, "PATCH", {
      repeat_type: value,
      weekly_target: null
    });
  }

  loadTopics();
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
                        {/* Weekly temporarily disabled */}
                        <option value="interval">Interval</option>
                      </select>

                      {topic.repeat_type === "weekly" && (
  <input
    type="number"
    min="1"
    max="7"
    value={topic.weekly_target ?? ""}
    onChange={async (e) => {
      const raw = e.target.value;

      // Don't send if empty
      if (raw === "") {
        setTopics(prev =>
          prev.map(t =>
            t.id === topic.id ? { ...t, weekly_target: "" } : t
          )
        );
        return;
      }

      const value = parseInt(raw);

      // Only allow 1–7
      if (isNaN(value) || value < 1 || value > 7) return;

      // Update UI immediately
      setTopics(prev =>
        prev.map(t =>
          t.id === topic.id ? { ...t, weekly_target: value } : t
        )
      );

      // Send valid PATCH
      await apiRequest(`/topics/${topic.id}/`, "PATCH", {
        weekly_target: value,
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


                      {topic.repeat_type === "interval" && (
                        <input
                          type="number"
                          min="1"
                          placeholder="Days"
                          value={topic.repeat_interval_days || ""}
                          onChange={async (e) => {
                            await apiRequest(`/topics/${topic.id}/`, "PATCH", {
                              repeat_interval_days: parseInt(e.target.value),
                            });

                            loadTopics();
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
                  )}

                  <div
                    style={{ padding: "6px", cursor: "pointer", color: "red" }}
                    onClick={() => handleDeleteTopic(topic.id)}
                  >
                    Delete
                  </div>
                </div>
              )}

              {editingTopicDateId === topic.id && (
                <input
                  type="date"
                  autoFocus
                  defaultValue={topic.due_date || ""}
                  onBlur={() => setEditingTopicDateId(null)}
                  onChange={(e) =>
                    handleSetTopicDueDate(topic.id, e.target.value)
                  }
                  style={{
                    marginTop: "6px",
                    padding: "6px",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--text)"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrackDetail;