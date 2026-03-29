function LifeBalanceCard({ data }) {
  return (
    <div className="card">
      <h3>📊 Life Balance</h3>

      {!data ? (
        <p>Your activity balance will show here</p>
      ) : (
        <>
          {data.map((item, i) => (
            <div key={i}>
              {item.type === "subject" && "📘"}
              {item.type === "project" && "🚀"}
              {item.type === "personal" && "🌱"} {item.percent}%
            </div>
          ))}

          <div style={{ marginTop: "10px", opacity: 0.6 }}>
            {data.length === 1
              ? "You’re focused on one area right now"
              : "Your focus is spread across areas"}
          </div>
        </>
      )}
    </div>
  );
}

export default LifeBalanceCard;