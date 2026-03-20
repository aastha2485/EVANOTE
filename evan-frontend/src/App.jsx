import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import { SettingsProvider } from "./context/SettingsContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notebooks from "./pages/Notebooks";
import NotebookDetail from "./pages/NotebookDetail";
import Notes from "./pages/Notes";
import NoteEditor from "./pages/NoteEditor";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import TopicDetail from "./pages/TopicDetail";
import FeynmanPractice from "./pages/FeynmanPractice";
import Search from "./pages/Search";
import Journal from "./pages/Journal";
import JournalDay from "./pages/JournalDay";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import { apiRequest } from "./api/api";
import { useSettings } from "./context/SettingsContext";


function AppWrapper() {
  

  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access")
  );

  const [notebooks, setNotebooks] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { settings, user, loading } = useSettings();
  


  // Load notebooks
  useEffect(() => {
    if (isLoggedIn) {
      apiRequest("/notebooks/").then(setNotebooks);
    }
  }, [isLoggedIn]);

  function handleLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
  }

  // Command palette shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const commands = [
    {
      label: "New Note",
      action: () => setSelectedNote({ title: "", content: "" }),
    },
    {
      label: "Go to Dashboard",
      action: () => navigate("/"),
    },
    {
      label: "Go to Notes",
      action: () => navigate("/notes"),
    },
    {
      label: "Go to Tracks",
      action: () => navigate("/tracks"),
    },
    {
      label: "Logout",
      action: handleLogout,
    },
  ];

  if (loading) {
  return (
    <div style={{ padding: "40px" }}>
      Loading...
    </div>
  );
}

  return (
    <>
    <div className={
      settings?.theme === "light"
        ? "light-theme"
        : "dark-theme"
    }>
      
      <Routes>
        {/* PUBLIC ROUTES */}
        {!isLoggedIn && (
          <>
            <Route
              path="/login"
              element={
                <Login
                  onLogin={() => {
                    setIsLoggedIn(true);
                    navigate("/");
                  }}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <Signup
                  onSignup={() => navigate("/login")}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* PROTECTED ROUTES */}
        {isLoggedIn && (
          <>
            <Route
              path="/*"
              element={
                <Layout
                  sidebar={
                    <Sidebar
                      notebooks={notebooks}
                      searchQuery={searchQuery}
                      onSearch={setSearchQuery}
                      onSelectNotes={() => navigate("/notes")}
                      onSelectNotebook={(nb) =>
                        navigate(`/notebooks/${nb.id}`)
                      }
                      onSelectTracks={() => navigate("/tracks")}
                      onLogout={handleLogout}
                    />
                  }
                >
                  {selectedNote ? (
                    <NoteEditor
                      note={selectedNote}
                      onBack={() => setSelectedNote(null)}
                    />
                  ) : (
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/search" element={<Search />} />
                      <Route
                        path="/notes"
                        element={
                          <Notes
                            searchQuery={searchQuery}
                            onSelectNote={setSelectedNote}
                          />
                        }
                      />
                      <Route path="/notes/new" element={<NoteEditor />} />
                      <Route path="/notes/:id" element={<NoteEditor />} />
                      <Route
                        path="/notebooks"
                        element={<Notebooks />}
                      />
                      <Route
                        path="/notebooks/:id"
                        element={<NotebookDetail />}
                      />
                      <Route path="/tracks" element={<Tracks />} />
                      <Route
                        path="/tracks/:id"
                        element={<TrackDetail />}
                      />
                      <Route
                        path="/topics/:id"
                        element={<TopicDetail />}
                      />
                      <Route
                        path="/topics/:id/feynman"
                        element={<FeynmanPractice />}
                      />

                      <Route path="/journal" element={<Journal />} />

                      <Route path="/journal/:date" element={<JournalDay />} />

                      <Route path="/profile" element={<Profile />} />

                      <Route path="/settings" element={<Settings />} />

                      <Route path="/dashboard" element={<Dashboard />} />

                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  )}
                </Layout>
              }
            />
          </>
        )}
      </Routes>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;