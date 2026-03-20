import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useSettings } from "../context/SettingsContext";


async function exportNotesPDF() {
  const blob = await apiRequest("/export/notes/pdf/", "GET", null, true);
  downloadFile(blob, "evanote-notes.pdf");
}

async function exportJournalPDF() {
  const blob = await apiRequest("/export/journal/pdf/", "GET", null, true);
  downloadFile(blob, "evanote-journal.pdf");
}

async function exportBackupJSON() {
  const blob = await apiRequest("/export/backup/", "GET", null, true);
  downloadFile(blob, "evanote-backup.json");
}

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

function Settings() {
    const { settings, updateSetting } = useSettings();

  


    

    async function handleExport() {
        const data = await apiRequest("/export/");
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "evanote_data.json";
        a.click();
    }

    if (!settings) return <div className="container">Loading Settings...</div>;

    return (
        <div
            className="container"
            style={{
                maxWidth: "700px",
                maxHeight: "80vh",
                overflowY: "auto",
                paddingRight: "10px"
            }}
        >
            <h2>Settings</h2>

            {/* Appearance */}
            <section>
                <h3>Appearance</h3>
                <div>
                    <label>
                        <input
                            type="radio"
                            checked={settings.theme === "dark"}
                            onChange={() => updateSetting("theme", "dark")}
                        />
                        Dark Mode
                    </label>

                    <label style={{ marginLeft: "20px" }}>
                        <input
                            type="radio"
                            checked={settings.theme === "light"}
                            onChange={() => updateSetting("theme", "light")}
                        />
                        Light Mode
                    </label>
                </div>
            </section>

            <hr />

            {/* Learning Preferences */}
            <section>
                <h3>Learning Preferences</h3>

                <div style={{ marginBottom: "15px" }}>
                    <label>
                        Feynman Completion Threshold:
                        <input
                            type="number"
                            min="0.6"
                            max="0.9"
                            step="0.05"
                            value={settings.feynman_threshold}
                            onChange={(e) =>
                                updateSetting(
                                    "feynman_threshold",
                                    parseFloat(e.target.value)
                                )
                            }
                            style={{ marginLeft: "10px", width: "70px" }}
                        />
                    </label>
                </div>

                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.auto_mark_done}
                            onChange={(e) =>
                                updateSetting("auto_mark_done", e.target.checked)
                            }
                        />
                        Auto Mark Topic as Done
                    </label>
                </div>
            </section>

            <hr />

            {/* Notifications */}
            <section>
                <h3>Notifications</h3>

                <label>
                    <input
                        type="checkbox"
                        checked={settings.show_due_warnings}
                        onChange={(e) =>
                            updateSetting("show_due_warnings", e.target.checked)
                        }
                    />
                    Show Due Date Warning Colors
                </label>
            </section>

            <hr />

            <ExportSection/>
            <hr/>

            {/* Data & Privacy */}
            <section>
  <h3>Data & Privacy</h3>

  <button
    onClick={() =>
      downloadFile(
        "/export/all/",
        `evanote-all-data-${new Date().toISOString().split("T")[0]}.json`
      )
    }
  >
    Export All Data (JSON)
  </button>

  <br /><br />

  <button
    onClick={() =>
      downloadFile(
        "/export/journal/",
        `evanote-journal-${new Date().toISOString().split("T")[0]}.json`
      )
    }
  >
    Export Journal (JSON)
  </button>
</section>

<hr style={{ margin: "30px 0" }} />

<h3 style={{ color: "#ef4444" }}>Danger Zone</h3>

<button
  style={{
    background: "#1a1a1a",
    border: "1px solid #ef4444",
    color: "#ef4444",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  }}
  onClick={async () => {
    const confirmDelete = window.confirm("Delete account?");
    if (!confirmDelete) return;

    await apiRequest("/profile/delete/", "DELETE");
    window.location.href = "/signup";
  }}
>
  Delete Account
</button>
        </div>
    );
}

export default Settings;