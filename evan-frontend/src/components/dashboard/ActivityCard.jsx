import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

function generateMockHeatmap() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const data = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
      .toLocaleDateString("en-CA");

    // Random but realistic pattern
    let count = 0;

    if (Math.random() > 0.4) {
      count = Math.floor(Math.random() * 6); // 0–5
    }

    data.push({ date, count });
  }

  return data;
}
function ActivityCard({ data , momentum }) {


    const mockData = {
    heatmap: generateMockHeatmap(),
    streak: 6,
    best_hour: "9 PM",
    best_day: "Tuesday",
    most_used: "Notes",
    avg_session: 18,
    last_active: "Today"
  };

  const finalData = data?.heatmap?.length ? data : mockData;
  const finalMomentum = momentum || 55;
   



    // 1. activityMap FIRST
    const activityMap = new Map(
        (finalData?.heatmap || []).map(d => [d.date, d.count])
    );

    // 2. calendarDays
    const calendarDays = [];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

    // 1. Leading empty cells
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // 2. Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(year, month, d)
            .toISOString()
            .slice(0, 10);

        calendarDays.push({
            date: dateStr,
            count: activityMap.get(dateStr) || 0
        });
    }

    // 3. Trailing empty cells (IMPORTANT FIX)
    while (calendarDays.length % 7 !== 0) {
        calendarDays.push(null);
    }

    const weeks = []

    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }


    const streak = finalData?.streak || 0;
    const best_hour = finalData?.best_hour || "--";
    const best_day = finalData?.best_day || "--";
    const mode = finalData?.mode || "General";
    const most_used = finalData?.most_used || "Getting Started";
    const avg = finalData?.avg_session || "--";
    const lastActive = finalData?.last_active || "Inactive";

    const getColor = (level) => {
  switch (level) {
    case 0: return "#1a1a1a";
    case 1: return "#163d2b";
    case 2: return "#1f7a4d";
    case 3: return "#22c55e";
    case 4: return "#4ade80";
    default: return "#1a1a1a";
  }
};

    const momentumLabel =
        momentum > 70 ? "In a strong rhythm" :
            momentum > 40 ? "Finding your pace" :
                "Starting Fresh";

    if (!calendarDays.length) {
        return (
            <div className="card activity-card">
                <h3> <FontAwesomeIcon icon={faFire} /> Activity</h3>
                <p>Start your streak today</p>
                <p>No activity yet — take your first step</p>
            </div>
        );
    }

    // ActivityCard.jsx

    function getLevel(count) {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    }

    return (
        <div className="card activity-card">

            <div className="activity-container">

                <div className="activity-heatmap-wrapper">

                    <div className="heatmap-header">
                        {new Date().toLocaleString("default", {
                            month: "long",
                            year: "numeric"
                        })}
                    </div>

                    <div className="activity-heatmap">

                        {/* Weekday labels (ONLY ONCE) */}
                        <div className="heatmap-weekdays">
                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                <div key={i}>{d}</div>
                            ))}
                        </div>

                        {/* Weeks */}
                        {weeks.map((week, wi) => (
                            <div key={wi} className="heatmap-row">
                                {week.map((day, di) => {
                                    if (!day) {
                                        return <div key={di} className="heatmap-cell empty" />;
                                    }

                                    const level = getLevel(day.count);

                                    return (
                                        <div
                                            key={di}
                                            className="heatmap-cell"
                                            title={`${day.date} — ${day.count} actions`}
                                            style={{ backgroundColor: getColor(level) }}
                                        />
                                    );
                                })}
                            </div>
                        ))}

                    </div>
                </div>

                {/* RIGHT → INSIGHTS */}
                <div className="activity-insights">

  {/* 🔥 HERO */}
  <div className="streak-line">
    🔥 {streak} Day Streak
  </div>

  {/* 2 COLUMN LAYOUT */}
  <div className="insight-cols">

    {/* LEFT */}
    <div className="insight-col">
      <div>
        <div className="label">You work best at</div>
        <div className="value">{best_hour}</div>
      </div>

      <div>
        <div className="label">Most active</div>
        <div className="value">{best_day}</div>
      </div>

      <div>
        <div className="label">⚡ Momentum</div>
        <div className="value subtle">{momentumLabel}</div>
      </div>
    </div>

    {/* RIGHT */}
    <div className="insight-col">
      <div>
        <div className="label">🧠 Mostly using</div>
        <div className="value">{most_used}</div>
      </div>

      <div>
        <div className="label">Avg session</div>
        <div className="value">{avg} min</div>
      </div>

      <div>
        <div className="label">Last active</div>
        <div className="value subtle">{lastActive}</div>
      </div>
    </div>

  </div>
</div>
            </div>

        </div>
    );
}
export default ActivityCard;