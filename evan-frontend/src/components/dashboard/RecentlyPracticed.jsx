function RecentlyPracticed({ data, className }) {

  return (
    <div className={`card ${className}`}>

      <h3>🧠 Recently Practiced</h3>

      {data.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          No recent explanations
        </div>
      )}

      {data.map((item, i) => {

        const label =
          item.clarity_score >= 0.75
            ? "Good"
            : "Partial";

        return (
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
              {label}
            </span>
          </div>
        );
      })}

    </div>
  );
}

export default RecentlyPracticed;