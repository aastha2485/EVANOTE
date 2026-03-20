import { useState, useEffect } from "react";
import { apiRequest } from "../api/api";

function Feynman({ topic, onBack }) {
  const [content, setContent] = useState("");
  const [explanations, setExplanations] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await apiRequest(
      `/topics/${topic.id}/feynman/`
    );
    setExplanations(data);
  }

  async function handleSubmit() {
    await apiRequest(
      `/topics/${topic.id}/feynman/`,
      "POST",
      { content }
    );
    setContent("");
    load();
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>

      <h2>Feynman Mode — {topic.title}</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Explain this topic in your own words..."
        style={{ width: "100%", height: "150px" }}
      />

      <button onClick={handleSubmit}>
        Submit Explanation
      </button>

      <hr />

      {explanations.map((exp) => (
        <div key={exp.id}>
          <p>{exp.content}</p>
          <small>
            Clarity: {Math.round(exp.clarity_score * 100)}%
          </small>
        </div>
      ))}
    </div>
  );
}

export default Feynman;