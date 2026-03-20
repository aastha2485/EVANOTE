import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Tracks({ onSelectTrack, onTrackCreated }) {
  const [tracks, setTracks] = useState([]);
  const [newTrack, setNewTrack] = useState("");
const [trackType, setTrackType] = useState("subject");
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("created");
  const [filterBy, setFilterBy] = useState("all");

  let processedTracks = [...tracks];

// FILTER
if (filterBy === "overdue") {
  processedTracks = processedTracks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });
}

if (filterBy === "due_soon") {
  processedTracks = processedTracks.filter(t => {
    if (!t.due_date) return false;
    const diff =
      (new Date(t.due_date) - new Date()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  });
}

if (filterBy === "completed") {
  processedTracks = processedTracks.filter(
    t => t.progress_percentage === 100
  );
}

// SORT
if (sortBy === "name") {
  processedTracks.sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

if (sortBy === "progress") {
  processedTracks.sort(
    (a, b) => b.progress_percentage - a.progress_percentage
  );
}

if (sortBy === "due") {
  processedTracks.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });
}

if (sortBy === "created") {
  processedTracks.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    const data = await apiRequest("/tracks/");
    setTracks(data);
  }

  async function handleCreateTrack() {
    if (!newTrack.trim()) return;

    await apiRequest("/tracks/", "POST", { 
      title: newTrack,
      type: trackType 
    });

    setNewTrack("");
    loadTracks();


  }

  return (
    <div className="container">
      <h2>Tracks</h2>

      <div style={{ marginBottom: "20px" }}>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "25px"
  }}
>

  <input
    value={newTrack}
    onChange={(e) => setNewTrack(e.target.value)}
    placeholder="Track title"
    style={{
      width: "340px",
      padding: "8px 10px",
      borderRadius: "6px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      color: "var(--text)"
    }}
  />

  <select
    value={trackType}
    onChange={(e) => setTrackType(e.target.value)}
    style={{
      padding: "8px 10px",
      borderRadius: "6px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      cursor: "pointer"
    }}
  >
    <option value="subject">Subject</option>
    <option value="project">Project</option>
    <option value="personal">Personal</option>
  </select>

  <button
    onClick={handleCreateTrack}
    style={{
      padding: "8px 14px"
    }}
  >
    Create Track
  </button>

</div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            style={{
              padding: "6px",
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "6px"
            }}
          >
            <option value="all">All</option>
            <option value="overdue">Overdue</option>
            <option value="due_soon">Due Soon</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "6px",
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "6px"
            }}
          >
            <option value="created">Created Date</option>
            <option value="name">Name (A–Z)</option>
            <option value="progress">Progress %</option>
            <option value="due">Due Date</option>
          </select>
        </div>


      <div className="notes-grid">
        {processedTracks.map((track) => (
          <div
            key={track.id}
            className="note-card"
            onClick={() => navigate(`/tracks/${track.id}`)}
            style={{ cursor: "pointer" }}
          >
            <h3>{track.title}</h3>

            <div
              style={{
                height: "6px",
                background: "var(--menu)",
                borderRadius: "4px",
                marginTop: "6px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${track.progress_percentage}%`,
                  background: "#16a34a",
                  height: "100%"
                }}
              />
            </div>

            <small style={{ opacity: 0.7 }}>
              {track.progress_percentage}%
            </small>
          </div>
        ))}

        
        

      </div>
    </div>
  );
}

export default Tracks;
