import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/api";

function Journal() {
  const navigate = useNavigate();
  const today = new Date();
const todayDate = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [calendarData, setCalendarData] = useState({});

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  async function loadCalendar() {
    try {
      const data = await apiRequest(
        `/journal/calendar/?month=${month + 1}&year=${year}`
      );
      setCalendarData(data);
    } catch (err) {
      console.error("Calendar error:", err);
    }
  }

  function changeMonth(offset) {
    setCurrentDate(new Date(year, month + offset, 1));
  }

  function getDaysInMonth() {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDay() {
    return new Date(year, month, 1).getDay();
  }

  function renderDot(day) {
    const data = calendarData[day];
    if (!data) return null;

    if (data.good > 0)
      return <div style={dot("#22c55e")} />;
    if (data.completed > 0)
      return <div style={dot("#3b82f6")} />;
    if (data.partial > 0)
      return <div style={dot("#facc15")} />;
  }

  function dot(color) {
    return {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: color,
      margin: "3px auto 0"
    };
  }

  const days = [];
  const firstDay = getFirstDay();
  const totalDays = getDaysInMonth();

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= totalDays; day++) {
    days.push(
      <div
        key={day}
        onClick={() =>
          navigate(`/journal/${year}-${String(
            month + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
        }
        style={{
  padding: "10px",
  cursor: "pointer",
  borderRadius: "50%",
  textAlign: "center",
  width: "36px",
  height: "36px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  

  background:
    todayDate.getDate() === day &&
    todayDate.getMonth() === month &&
    todayDate.getFullYear() === year
      ? "#3b82f6"
      : "transparent",

  color:
    todayDate.getDate() === day &&
    todayDate.getMonth() === month &&
    todayDate.getFullYear() === year
      ? "white"
      : "inherit",

  fontWeight:
    todayDate.getDate() === day &&
    todayDate.getMonth() === month
      ? "600"
      : "normal"
}}
      >
        {day}
        {renderDot(day)}
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h2>Journal</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20
        }}
      >
        <button onClick={() => changeMonth(-1)}>◀</button>
        <strong>
          {currentDate.toLocaleString("default", {
            month: "long"
          })}{" "}
          {year}
        </strong>
        <button onClick={() => changeMonth(1)}>▶</button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (d) => (
            <div
              key={d}
              style={{
                fontWeight: "bold",
                textAlign: "center"
              }}
            >
              {d}
            </div>
          )
        )}
        {days}
      </div>
    </div>
  );
}

export default Journal;