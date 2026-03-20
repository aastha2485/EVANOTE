function RecentNotes({ data, className }) {

  return (
    <div className={`card ${className}`}>

      <h3>📝 Recent Notes</h3>

      {data.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          No notes yet
        </div>
      )}

      {data.map(note => (
        <div key={note.id}>
          {note.title}
        </div>
      ))}

    </div>
  );
}

export default RecentNotes;