function StreakDisplay({ current, longest }) {

  return (
    <div style={{ marginTop: "15px" }}>

      <div>
        🔥 Current Streak: <strong>{current} days</strong>
      </div>

      <div>
        🏆 Longest Streak: <strong>{longest} days</strong>
      </div>

    </div>
  );
}

export default StreakDisplay;