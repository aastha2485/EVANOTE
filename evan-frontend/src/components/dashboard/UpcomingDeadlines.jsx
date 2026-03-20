function UpcomingDeadlines({ data, className }) {

  return (
    <div className={`card ${className}`}>

      <h3>⏰ Upcoming Deadlines</h3>

      {data.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          No upcoming deadlines
        </div>
      )}

      {data.map((item, i) => (
        <div
          key={i}
          style={{
            marginTop: "6px",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <span>{item.title}</span>

          <span style={{ opacity: 0.7 }}>
            {item.due_date}
          </span>
        </div>
      ))}

    </div>
  );
}

export default UpcomingDeadlines;