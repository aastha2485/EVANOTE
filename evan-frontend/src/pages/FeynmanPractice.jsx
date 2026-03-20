import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import TiptapEditor from "../components/TiptapEditor";

function FeynmanPractice() {
  const { id } = useParams();

  const [topic, setTopic] = useState(null);
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadTopic();
    loadExistingAttempt();
  }, [id]);

  async function loadTopic() {
    const data = await apiRequest(`/topics/${id}/`);
    setTopic(data);
  }

  async function loadExistingAttempt() {
    const data = await apiRequest(`/topics/${id}/feynman/`);

    if (data && data.length > 0) {
      const latest = data[0]; // 🔥 newest

      setContent(latest.content);
      setResult(latest);
    }
  }

  async function handleSubmit() {
    const response = await apiRequest(
      `/topics/${id}/feynman/`,
      "POST",
      { content }
    );

    setResult(response);
    setContent(response.content);
  }

  if (!topic) return <div className="container">Loading...</div>;

  return (
    <div className="container">

      <h2>Explain: {topic.title}</h2>

      <p>
        Explain this topic as if teaching a 12-year-old.
      </p>

      <TiptapEditor
        key={result?.id || "new"}
        content={content}
        onChange={setContent}
      />

      <button onClick={handleSubmit} style={{ marginTop: "15px" }}>
        {result ? "Re-submit" : "Submit Explanation"}
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>
            Result:{" "}
            {result.clarity_score >= 0.75
              ? "✔ Good"
              : "⚠ Partial"}
          </h3>

        </div>
      )}
    </div>
  );
}

export default FeynmanPractice;