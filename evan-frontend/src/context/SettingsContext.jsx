import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

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

      setSettings(settingsData);
      setUser(userData);
    } catch (err) {
      console.error("Load failed:", err);
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

    setSettings(updated);
  }

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, user, setUser, loading }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}