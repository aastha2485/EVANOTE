import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const defaultSettings = {
  show_due_warnings: true,
  insights_neglect: true,
  insights_journal: true,
  insights_minimal: false,
};

const [settings, setSettings] = useState(defaultSettings);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const [sidebarVersion, setSidebarVersion] = useState(0);

const refreshSidebar = () => {
  setSidebarVersion(prev => prev + 1);
};

  useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  

  async function loadAll() {
    try {
      const [settingsData, userData] = await Promise.all([
        apiRequest("/settings/"),
        apiRequest("/profile/")
      ]);

      setSettings({ ...defaultSettings, ...settingsData });
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Load failed:", err);
      setSettings(defaultSettings);
    } finally {
      setLoading(false); // ✅ important
    }
  }

  loadAll();
}, [token]);

  async function updateSetting(field, value) {
    const updated = await apiRequest("/settings/", "PATCH", {
      [field]: value,
    });

    setSettings(prev => ({
  ...prev,
  ...updated
}));
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, user, setUser, loading, sidebarVersion,
  refreshSidebar }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}