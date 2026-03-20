function Heatmap({ dates, month, year }) {

  const activeDays = new Set(dates);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const daysInMonth = lastDay.getDate();

  const startWeekday = firstDay.getDay(); // Sunday = 0

  const cells = [];

  // Empty cells before month start
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {

    const dateStr =
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const active = activeDays.has(dateStr);

    cells.push({
      day,
      active
    });
  }

  return (
    <div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "6px",
          marginTop: "10px"
        }}
      >

        {cells.map((cell, index) => {

          if (!cell) {
            return <div key={index}></div>;
          }

          return (
            <div
              key={index}
              title={cell.day}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "4px",
                background: cell.active ? "#22c55e" : "#222"
              }}
            />
          );

        })}

      </div>

    </div>
  );
}

export default Heatmap;