import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "../icons";
import { useSettings } from "../context/SettingsContext";

function Sidebar({ onLogout }) {
const { user } = useSettings();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);

  

  useEffect(() => {
    async function loadTracks() {
      const data = await apiRequest("/tracks/");
      setTracks(data);
    }

    loadTracks();
  }, []);



  return (
    <div
      style={{
        width: "200px",
        borderRight: "1px solid #222",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden"
      }}
    >

      {/* Logo */}
      <h3 style={{ marginBottom: "20px" }}>Evanote</h3>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "10px",
    background: "#111"
  }}
>
  <img
    src={
  user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=111&color=fff`
}
    alt="profile"
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />

  <div style={{ fontSize: "14px", fontWeight: "500" }}>
    {user?.name || "User"}
  </div>
</div>

      {/* Search */}
      <button
        onClick={() => navigate("/search")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          opacity: 0.8
        }}
      >
        🔍 Search
      </button>

      {/* Navigation */}
      <button onClick={() => navigate("/")}>🏠 Dashboard</button>

      <button onClick={() => navigate("/notes")}>
        📝 Notes
      </button>

      <button onClick={() => navigate("/notebooks")}>
        📂 Notebooks
      </button>

      <button onClick={() => navigate("/tracks")}>
        📚 Tracks
      </button>

      <hr style={{ margin: "15px 0" }} />

      {/* Track List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "10px"
        }}
      >
        {tracks.map(track => (
          <button
            key={track.id}
            onClick={() => navigate(`/tracks/${track.id}`)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              marginBottom: "6px"
            }}
          >
            📘 {track.title}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}

      <button onClick={() => navigate("/journal")}>
        📓 Journal
      </button>

      <hr style={{ margin: "15px 0" }} />

      <button onClick={() => navigate("/profile")}>
        👤 Profile
      </button>

      <button onClick={() => navigate("/settings")}>
        ⚙ Settings
      </button>

      <button onClick={onLogout}>
        <FontAwesomeIcon icon={faRightFromBracket} /> Logout
      </button>

    </div>
  );
}

export default Sidebar;