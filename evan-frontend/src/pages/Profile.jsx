import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useSettings } from "../context/SettingsContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faBold, faItalic } from "@fortawesome/free-solid-svg-icons";
import TiptapEditor from "../components/TiptapEditor";

function Profile() {
  const { user, setUser } = useSettings();

  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");

  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const data = await apiRequest("/profile/");
    setProfile(data);
    setName(data.name || "");
    setBio(data.bio ?? "");
    setUser(data);
  }

  async function saveName() {
    if (!name.trim()) return;

    const updated = await apiRequest("/profile/", "PATCH", { name });
    setProfile(updated);
    setUser(updated);
    setEditingName(false);
  }

  async function saveBio() {
  try {
    const updated = await apiRequest("/profile/", "PATCH", {
      bio: bio,
    });

    console.log("UPDATED PROFILE:", updated); // 🔥 DEBUG

    setProfile(updated);
    setUser(updated);
    setEditingBio(false);
  } catch (err) {
    console.error("Bio save failed", err);
  }
}

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("http://127.0.0.1:8000/api/profile/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: formData,
    });

    const data = await res.json();

    setProfile((prev) => ({ ...prev, avatar: data.avatar }));
    setUser(data);
  }

  if (!profile) return <div>Loading...</div>;

  const formattedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      {/* ✅ Heading */}
      <h2 style={{ marginBottom: "20px" }}>Profile</h2>

      {/* Avatar */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ cursor: "pointer" }}>
          <img
            src={
              preview ||
              profile.avatar ||
              `https://ui-avatars.com/api/?name=${profile.name}&background=111&color=fff`
            }
            alt="avatar"
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #333",
            }}
          />
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </label>
      </div>

      {/* Username */}
      <div style={{ marginBottom: "12px" }}>
        {editingName ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            style={{
              fontSize: "28px",
              fontWeight: "600",
              textAlign: "center",
              border: "none",
              outline: "none",
              borderBottom: "2px solid #555",
              background: "transparent",
              color: "var(--text)",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {profile.name}

            <FontAwesomeIcon
              icon={faPen}
              style={{ cursor: "pointer", opacity: 0.6, fontSize: "12px" }} // ✅ smaller
              onClick={() => setEditingName(true)}
            />
          </div>
        )}
      </div>

      {/* Member Since */}
      <div style={{ marginBottom: "20px", opacity: 0.6 }}>
        Member since: {formattedDate}
      </div>

      {/* Bio */}
      <div style={{ marginTop: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <h3 style={{ margin: 0 }}>Bio</h3>

          <FontAwesomeIcon
            icon={faPen}
            style={{ cursor: "pointer", opacity: 0.6, fontSize: "12px" }}
            onClick={() => setEditingBio(true)}
          />
        </div>

        <div
  style={{
    marginTop: "10px",
    background: "#1a1a1a",
    borderRadius: "12px",
    padding: "14px",
  }}
  onClick={() => setEditingBio(true)}
>
  <div
    dangerouslySetInnerHTML={{
      __html: bio || "<p>Add a short bio...</p>",
    }}
  />
</div>
      </div>

      {/* ✅ Bio Modal (CENTERED PROPERLY) */}
     {editingBio && (
  <div
    id="bio-overlay"
    onClick={(e) => {
      if (e.target.id === "bio-overlay") {
        saveBio();
      }
    }}
    style={{
      position: "fixed",
      left: "200px",
      right: 0,
      top: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(0,0,0,0.6)",
      zIndex: 1000,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "600px",
        background: "#111",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <TiptapEditor
        content={bio}
        onChange={(val) => setBio(val)}
      />

      <div style={{ marginTop: "10px", textAlign: "right" }}>
        <button onClick={saveBio}>Save</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Profile;