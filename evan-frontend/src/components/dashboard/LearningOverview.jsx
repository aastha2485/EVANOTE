function LearningOverview({ data, className }) {

  const progress =
    data.total_topics > 0
      ? Math.round((data.completed_topics / data.total_topics) * 100)
      : 0;

  return (
    <div className={`card ${className}`}>

      <h3>📊 Learning Overview</h3>

      <div style={{ marginTop: "10px" }}>
        Total Tracks: <strong>{data.total_tracks}</strong>
      </div>

      <div>
        Total Topics: <strong>{data.total_topics}</strong>
      </div>

      <div>
        Completed: <strong>{data.completed_topics}</strong>
      </div>

      <div>
        In Progress: <strong>{data.in_progress}</strong>
      </div>

      <div>
        Avg Clarity: <strong>{data.avg_clarity}</strong>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "14px" }}>

        <div style={{ fontSize: "12px", opacity: 0.7 }}>
          Completion Progress
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.6 }}>
          {progress}%
        </div>

      </div>
      {/* Momentum Indicator */}

<div
  style={{
    marginTop: "10px",
    fontSize: "13px",
    opacity: 0.8
  }}
>

{data.momentum === "up" && (
  <div>Momentum: ↑ Picking up momentum</div>
)}

{data.momentum === "steady" && (
  <div>Momentum: → Steady learning pace</div>
)}

{data.momentum === "down" && (
  <div>Momentum: ↓ Lighter week</div>
)}

</div>

    </div>
  );
}

export default LearningOverview;