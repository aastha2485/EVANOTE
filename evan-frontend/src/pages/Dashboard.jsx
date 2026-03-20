import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

import LearningOverview from "../components/dashboard/LearningOverview";
import ActivitySection from "../components/dashboard/ActivitySection";
import FocusSection from "../components/dashboard/FocusSection";
import PersonalSummary from "../components/dashboard/PersonalSummary";
import TodayFocus from "../components/dashboard/TodayFocus";
import RecentNotes from "../components/dashboard/RecentNotes";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import RecentlyPracticed from "../components/dashboard/RecentlyPracticed";
import { useSettings } from "../context/SettingsContext";

function Dashboard() {
const { user } = useSettings();
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const res = await apiRequest("/dashboard/");
    setData(res);
  }

  if (!data) {
    return <div className="container">Loading dashboard...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: "900px" }}>

      <h2 style={{ marginBottom: "30px" }}>Dashboard</h2>

      <div className="dashboard-grid"
  
>
  {user && (
  <div
    style={{
      background: "var(--card)",
      padding: "14px",
      borderRadius: "10px",
      border: "var(--border)",
      marginBottom: "20px",
      fontSize: "15px"
    }}
  >
    <div
      dangerouslySetInnerHTML={{
        __html: user.bio || "<i>Add your bio...</i>",
      }}
    />
  </div>
)}

  <TodayFocus
  className="today-focus"
  data={data.today_focus}
/>

<LearningOverview
  className="learning-overview"
  data={data.learning_overview}
/>

{data.personal_summary && (
  <PersonalSummary
    className="personal-summary"
    data={data.personal_summary}
  />
)}

<ActivitySection
  className="activity-card"
  data={data.activity}
/>

<RecentlyPracticed
  className="recently-practiced"
  data={data.focus.recent_practice}
/>

<UpcomingDeadlines
  className="upcoming-deadlines"
  data={data.focus.upcoming}
/>

<RecentNotes
  className="recent-notes"
  data={data.recent_notes}
/>
</div>
    </div>
  );
}

export default Dashboard;