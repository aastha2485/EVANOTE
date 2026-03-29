function ModeCard({ mode }) {
  return (
    <div className="card">
      <h3>🎭 Current Mode</h3>

      {!mode ? (
        <p>Your current mode will appear here</p>
      ) : (
        <>
          <div style={{ fontWeight: "bold" }}>
            {mode.title}
          </div>
          <div style={{ opacity: 0.6 }}>
            {mode.desc}
          </div>
        </>
      )}
    </div>
  );
}

export default ModeCard;