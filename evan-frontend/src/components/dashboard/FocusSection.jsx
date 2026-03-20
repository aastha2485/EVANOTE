function FocusSection({ data }) {

  return (
    <div className="card">

      <h3>Focus & Urgency</h3>

      <div style={{ marginTop: "10px" }}>
        <strong>Upcoming Deadlines</strong>

        {data.upcoming.length === 0 && (
          <div style={{ opacity: 0.6 }}>None</div>
        )}

        {data.upcoming.map((item, i) => (
          <div key={i}>
            {item.title} – Due {item.due_date}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "15px" }}>
        <strong>Recently Practiced</strong>

        {data.recent_practice.length === 0 && (
          <div style={{ opacity: 0.6 }}>None</div>
        )}

        {data.recent_practice.map((item, i) => (
          <div key={i}>
            {item.topic} ({item.clarity.toFixed(2)})
          </div>
        ))}
      </div>

    </div>
  );
}

export default FocusSection;