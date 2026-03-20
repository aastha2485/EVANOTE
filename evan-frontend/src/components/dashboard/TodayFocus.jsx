function TodayFocus({ data, className }) {

  return (
    <div className={`card ${className}`}>

      <h3>🎯 Today Focus</h3>

      {data.length === 0 ? (
  <div>No urgent tasks today. Keep learning 🚀</div>
) : (
  data.map((item, i) => (
    <div key={i}>
      {item.icon} {item.text}
    </div>
  ))
)}

      <div>
        🔁 Repeat Tasks Ready: <strong>{data.repeat_ready}</strong>
      </div>

      <div>
        ⏳ Deadlines Soon: <strong>{data.deadline_soon}</strong>
      </div>

      <div>
        🧠 Topics Needing Explanation: <strong>{data.needs_explanation}</strong>
      </div>

    </div>
  );
}

export default TodayFocus;