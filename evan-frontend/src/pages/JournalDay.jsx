import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import TiptapEditor from "../components/TiptapEditor";

function JournalDay() {
  const { date } = useParams();

  const [data, setData] = useState(null);
  const [reflection, setReflection] = useState("");

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  useEffect(() => {
  if (!data) return;

  const timer = setTimeout(() => {
    saveReflection(reflection);
  }, 800);

  return () => clearTimeout(timer);
}, [reflection]);

  useEffect(() => {
    loadDay();
  }, [date]);

  async function loadDay() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const result = await apiRequest(
      `/journal/${date}/?tz=${timezone}`
    );

    setData(result);
    setReflection(result.content || "");
  }

  async function saveReflection(newText) {
    await apiRequest(`/journal/${date}/`, "PATCH", {
      content: newText
    });
  }

  

  if (!data) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div  style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)"
    }}>

      {/* Top */}
      <div style={{
  maxWidth: "900px",
  margin: "0 auto",
  padding: "20px 24px 10px"
}}>
        <h1 style={{ fontSize: "28px" }}>{formattedDate}</h1>
      </div>

      {/* Body */}
      <div style={{ flex: 1, }}>
        <div
          style={{
  maxWidth: "900px",        // slightly wider
  margin: "0 auto",
  padding: "0 24px",        // side breathing space
  paddingTop: "10px"
}}
        >
          {/* Completed Topics */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ opacity: 0.7 }}>Completed Topics</h3>

            {data.completed?.length === 0 ? (
              <p style={{ opacity: 0.5 }}>No completions</p>
            ) : (
              data.completed.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    background: "#1a1a1a",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    fontSize: "14px"
                  }}
                >
                  {t.title}
                </div>
              ))
            )}
          </div>
          <h3 style={{ opacity: 0.7 }}>Reflection</h3>


          <div
            style={{
              background: "var(--card)",
              border: "var(--border)",
              borderRadius: "12px",
              padding: "16px",
              marginTop: "10px"
            }}
          >
            <div style={{ marginTop: "10px" }}>
              <TiptapEditor
                content={reflection}
                onChange={(val) => {
                  setReflection(val);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalDay;