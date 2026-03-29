import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useSettings } from "../context/SettingsContext";
import ExportSection from "../components/ExportSection";

function Settings() {
  const { settings, updateSetting } = useSettings();

const [showPasswordForm, setShowPasswordForm] = useState(false);
const [passwordData, setPasswordData] = useState({
  old: "",
  new: "",
  confirm: "",
});
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

async function handleChangePassword() {
  setMessage("");

  if (passwordData.new !== passwordData.confirm) {
    setMessage("New passwords do not match");
    return;
  }

  if (passwordData.new.length < 8) {
    setMessage("Password must be at least 8 characters");
    return;
  }

  try {
    setLoading(true);

    await apiRequest("/change-password/", "POST", {
      old_password: passwordData.old,
      new_password: passwordData.new,
    });

    setMessage("✅ Password updated successfully");
    setPasswordData({ old: "", new: "", confirm: "" });
    setShowPasswordForm(false);
  } catch (err) {
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
}

  if (!settings) return <div className="container">Loading Settings...</div>;

  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      {/* Learning Preferences */}
      <section className="settings-section">
        <h3>Learning Preferences</h3>

        <div className="settings-row">
          <div>
            <label className="settings-label">
              Feynman Completion Threshold
            </label>
          </div>

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
            className="settings-input"
          />
        </div>

        <div className="settings-row">
          <span className="settings-label">Auto Mark Topic as Done</span>

          <input
            type="checkbox"
            checked={settings.auto_mark_done}
            onChange={(e) =>
              updateSetting("auto_mark_done", e.target.checked)
            }
          />
        </div>
      </section>

      <hr />

      {/* Insights */}
      <section className="settings-section">
        <h3>🧠 Insights Preferences</h3>

        <div className="settings-card">
          <div className="settings-row">
            <div>
              <div className="settings-label">
                Remind me about things I might be missing
              </div>
              <p className="settings-desc">
                Shows neglected topics and tracks
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings?.insights_neglect}
              onChange={(e) =>
                updateSetting("insights_neglect", e.target.checked)
              }
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">
                Use my journal to give deeper insights
              </div>
              <p className="settings-desc">
                Connects thoughts with productivity
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings?.insights_journal}
              onChange={(e) =>
                updateSetting("insights_journal", e.target.checked)
              }
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">
                Keep insights minimal
              </div>
              <p className="settings-desc">
                Shows fewer, simpler insights
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings?.insights_minimal}
              onChange={(e) =>
                updateSetting("insights_minimal", e.target.checked)
              }
            />
          </div>
        </div>
      </section>

      <hr />

      {/* Notifications */}
      <section className="settings-section">
        <h3>Notifications</h3>

        <div className="settings-row">
          <span className="settings-label">
            Show Due Date Warning Colors
          </span>

          <input
            type="checkbox"
            checked={settings.show_due_warnings}
            onChange={(e) =>
              updateSetting("show_due_warnings", e.target.checked)
            }
          />
        </div>
      </section>

      <hr />
<h3>Export</h3>
      <ExportSection />

      <hr />

      <section className="settings-section">
  <h3>Security</h3>

  <button
    className="secondary-btn"
    onClick={() => setShowPasswordForm(!showPasswordForm)}
  >
    Change Password
  </button>

  {showPasswordForm && (
    <div className="password-card">
      <input
        type="password"
        placeholder="Current Password"
        value={passwordData.old}
        onChange={(e) =>
          setPasswordData({ ...passwordData, old: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="New Password"
        value={passwordData.new}
        onChange={(e) =>
          setPasswordData({ ...passwordData, new: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={passwordData.confirm}
        onChange={(e) =>
          setPasswordData({ ...passwordData, confirm: e.target.value })
        }
      />

      <button onClick={handleChangePassword} disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && <p className="settings-desc">{message}</p>}
    </div>
  )}
</section>

      {/* Danger Zone */}
      <section className="settings-section">
        <h3 className="danger-title">Danger Zone</h3>

        <button
          className="danger-btn"
          onClick={async () => {
            const confirmDelete = window.confirm("Delete account?");
            if (!confirmDelete) return;

            await apiRequest("/profile/delete/", "DELETE");
            window.location.href = "/signup";
          }}
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}

export default Settings;