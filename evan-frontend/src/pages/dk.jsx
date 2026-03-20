import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function Tracks({ onSelectTrack }) {
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("subject");

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTracks() {
    const data = await apiRequest("/tracks/");
    setTracks(data);
  }

  async function handleCreate() {
    if (!title.trim()) return;

    await apiRequest("/tracks/", "POST", {
      title,
      type,
    });

    setTitle("");
    loadTracks();
  }

  return (
    <div className="container">
      <h2>Tracks</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="subject">Subject</option>
          <option value="project">Project</option>
          <option value="custom">Custom Goal</option>
        </select>

        <button onClick={handleCreate}>Create Track</button>
      </div>

      <div className="notes-grid">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="note-card"
            onClick={() => onSelectTrack(track)}
            style={{ cursor: "pointer" }}
          >
            <h3>{track.title}</h3>
            <p style={{ opacity: 0.6 }}>{track.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tracks;
