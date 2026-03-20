function PersonalSummary({ data, className }) {
if (data.today_completed === 0 && data.active_days === 0) {
  return (
    <div className="card">
      <h3>✨ Personal Progress</h3>
      <div style={{ opacity: 0.7 }}>
        Complete your first task to start tracking progress.
      </div>
    </div>
  );
}
  return (
    <div className={`card ${className}`}>

      <h3>Personal Track Summary</h3>

      <div>
        Today Completed: <strong>{data.today_completed}</strong>
      </div>

      <div>
        Active Days: <strong>{data.active_days}/7</strong>
      </div>

      <div>
        Consistency: <strong>{data.consistency}%</strong>
      </div>

    </div>
  );
}

export default PersonalSummary;