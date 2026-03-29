import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faHouse,
  faMagnifyingGlass,
  faNoteSticky,
  faFolder,
  faLayerGroup,
  faBook,
  faUser,
  faGear,
  faChevronDown,
  faPenToSquare
} from "@fortawesome/free-solid-svg-icons";
import { useSettings } from "../context/SettingsContext";
import evalogo from "../assets/evalogo.png";

function Sidebar({ onLogout }) {
// const { user } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [tracks, setTracks] = useState([]);
const [isOpen, setIsOpen] = useState(false);
// const [showTracks, setShowTracks] = useState(true);
// const [showNotebooks, setShowNotebooks] = useState(false);
const [showTracks, setShowTracks] = useState(location.pathname.includes("/tracks"));
const [showNotebooks, setShowNotebooks] = useState(location.pathname.includes("/notebooks"));
const [notebooks, setNotebooks] = useState([]);
  const { user, sidebarVersion } = useSettings();
const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
  setShowTracks(location.pathname.includes("/tracks"));
  setShowNotebooks(location.pathname.includes("/notebooks"));
}, [location.pathname]);

  useEffect(() => {
  let isMounted = true;

  async function loadData() {
    try {
      const [tracksData, notebooksData] = await Promise.all([
        apiRequest("/tracks/"),
        apiRequest("/notebooks/")
      ]);

      if (isMounted) {
        setTracks(tracksData || []);
        setNotebooks(notebooksData || []);
      }
    } catch (err) {
      console.error("Sidebar load error:", err);
    }
  }

  loadData();

  return () => {
    isMounted = false;
  };
}, [sidebarVersion]); // 🔥 THIS IS THE KEY



  return (
  <>
    {/* Mobile Toggle */}
    <button
      className="sidebar-toggle"
      onClick={() => setIsOpen(true)}
    >
      ☰
    </button>

    {/* Overlay */}
    {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

    <div className={`sidebar ${isOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
      
      {/* Logo */}
      <div className="sidebar-logo">
  <img src={evalogo} alt="Evanote Logo" className="logo-img" />
</div>

{/* <button
  className="collapse-btn"
  onClick={() => setCollapsed(!collapsed)}
>
  {collapsed ? "→" : "←"}
</button> */}

      {/* Profile */}
      <div className="sidebar-profile">
        <img
          src={
            user?.avatar
              ? user.avatar
              : `https://ui-avatars.com/api/?name=${user?.name || "U"}`
          }
          alt="profile"
        />
        <span className="username">{!collapsed && (user?.name || "User")}</span>
      </div>

      {/* Main */}
      <div className="sidebar-section">
        <button className={location.pathname === "/" ? "active-nav" : ""} 
        onClick={() => navigate("/")} title="Dashboard">
   <FontAwesomeIcon icon={faHouse} />
{!collapsed && <span>Dashboard</span>}
  </button>

  <button className={location.pathname === "/search" ? "active-nav" : ""} 
          onClick={() => navigate("/search")} title="Search">
    <FontAwesomeIcon icon={faMagnifyingGlass} /> {!collapsed && <span>Search</span>}
  </button>
      </div>

      <div className="sidebar-section">
        <button className={location.pathname === "/notes" ? "active-nav" : ""} 
                onClick={() => navigate("/notes")} title="Notes">
    <FontAwesomeIcon icon={faNoteSticky} /> {!collapsed && <span>Notes</span>}
  </button>

  <div className="nav-item">
  <div
    className="nav-main"
    
    onClick={() => navigate("/notebooks")} title="Notebooks"
  >
    <FontAwesomeIcon icon={faFolder} />{!collapsed && <span>Notebooks</span>}
  </div>

  <FontAwesomeIcon
    icon={faChevronDown}
    className={`arrow ${showNotebooks && !collapsed ? "rotate" : ""}`}
    onClick={(e) => {
      e.stopPropagation();
      setShowNotebooks(!showNotebooks);
    }}
  />
</div>

<div className={`sub-list ${showNotebooks && !collapsed ? "open" : ""}`}>
    {notebooks.map(nb => (
      <button
        key={nb.id}
        title={nb.name}
        className={
    location.pathname === `/notebooks/${nb.id}` ? "active-sub" : ""
  }
        onClick={() => navigate(`/notebooks/${nb.id}`)}
      >
        {nb.title || nb.name || "Untitled"}
      </button>
    ))}
  </div>

</div>
      

      {/* Tracks */}
      <div className="sidebar-section">

  <div className="nav-item">
    <div
      className="nav-main"
      onClick={() => navigate("/tracks")} title="Tracks"
    >
      <FontAwesomeIcon icon={faLayerGroup} />{!collapsed && <span>Tracks</span>}
    </div>

    <FontAwesomeIcon
      icon={faChevronDown}
      className={`arrow ${showTracks && !collapsed ? "rotate" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setShowTracks(!showTracks);
      }}
    />
  </div>

  <div className={`sub-list ${showTracks && !collapsed ? "open" : ""}`}>
      {tracks.map(track => (
        <button
          key={track.id}
          title={track.title}
          className={
    location.pathname === `/tracks/${track.id}` ? "active-sub" : ""
  }
          onClick={() => navigate(`/tracks/${track.id}`)}
        >
          {track.title}
        </button>
      ))}
    </div>
      
</div>

      {/* Bottom */}
      <div className="sidebar-bottom">
         <button 
         className={location.pathname === "/journal" ? "active-nav" : ""}
         onClick={() => navigate("/journal")} title="Journal">
    <FontAwesomeIcon icon={faBook} /> {!collapsed && <span>Journal</span>}
  </button>

  <button 
    className={location.pathname === "/profile" ? "active-nav" : ""}
    onClick={() => navigate("/profile")}  title="Profile"
  >
    <FontAwesomeIcon icon={faUser} /> {!collapsed && <span>Profile</span>}
  </button>

  <button 
    className={location.pathname === "/settings" ? "active-nav" : ""}
    onClick={() => navigate("/settings")} title="Settings"
  >
    <FontAwesomeIcon icon={faGear} /> {!collapsed && <span>Settings</span>}
  </button>


        <button className="logout-btn" onClick={onLogout} title="Logout">
          <FontAwesomeIcon icon={faRightFromBracket} /> {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  </>
);
}

export default Sidebar;