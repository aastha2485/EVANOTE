import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useSettings } from "../context/SettingsContext";

import SmartFocusCard from "../components/dashboard/SmartFocusCard";
import DeadlinesCard from "../components/dashboard/DeadlinesCard";
import NeglectedCard from "../components/dashboard/NeglectedCard";
import ActivityCard from "../components/dashboard/ActivityCard";
import MindInsightCard from "../components/dashboard/MindInsightCard";

function Dashboard() {
  const [data, setData] = useState(null);
const { settings } = useSettings();
  const topics = data?.topics || [];
  const explanations = data?.explanations || [];
  const recentNotes = data?.recent_notes || [];
  const journal = data?.journal || [];


const showNeglected = settings?.insights_neglect ?? true; // Default to true if not set
  

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const res = await apiRequest("/dashboard-data/");
    setData(res);
  }

  // =========================
  // SMART FOCUS
  // =========================
  function getSmartFocus() {
    const items = [];
    const today = new Date();

    const getExplanation = (topicId) =>
      explanations.find(e => e.topic_id === topicId);

    const isRelevantTag = (t) => {
      // If no tag system yet → allow all
      if (!t.tag) return true;

      return t.tag === "important" || t.tag === "attention";
    };
    topics.forEach(t => {
      if (t.status === "done") return;
      if (!isRelevantTag(t)) return;

      if (t.due_date) {
        const due = new Date(t.due_date);

        if (due < today && t.status !== "done") {
          items.push({
            type: "overdue",
            text: `${t.title} (overdue)`,
            action: "Review",
            priority: 1
          });
        }

        if (due.toDateString() === today.toDateString() && t.status !== "done") {
          items.push({
            type: "due_today",
            text: `${t.title} (due today)`,
            action: "Continue",
            priority: 2
          });
        }
      }

      if (t.track_type === "subject") {
        const exp = getExplanation(t.id);
        if (!exp && t.status !== "done") {
          items.push({
            type: "missing_explanation",
            text: `Explain "${t.title}"`,
            action: "Explain",
            priority: 4
          });
        }
      }

      if (t.status === "in_progress") {
        items.push({
          type: "in_progress",
          text: `Continue "${t.title}"`,
          action: "Continue",
          priority: 5
        });
      }
    });

    explanations.forEach(e => {
      if (e.clarity_score < 0.6) {
        const topic = topics.find(t => t.id === e.topic_id);
        if (!topic || topic.status === "done") return;

        items.push({
          type: "low_clarity",
          text: `Retry "${topic.title}"`,
          action: "Improve",
          priority: 6
        });
      }
    });

    items.sort((a, b) => a.priority - b.priority);

    const selected = [];
    const usedTypes = new Set();

    for (let item of items) {
      if (selected.length >= 3) break;
      if (usedTypes.has(item.type)) continue;

      selected.push(item);
      usedTypes.add(item.type);
    }

    if (selected.length === 0) {
  if (recentNotes.length > 0) {
    return recentNotes.slice(0, 2).map(note => ({
      text: `Continue "${note.title}"`,
      action: "Open"
    }));
  }

  return [
    {
      text: "No urgent tasks — continue learning",
      action: "Resume"
    }
  ];
}

    const maxItems = settings?.insights_minimal ? 2 : 3;
    return selected.slice(0, maxItems);
  }

  // =========================
  // OTHER INSIGHTS
  // =========================

  function getDeadlines() {
    const today = new Date();

    return topics
      .filter(t => t.due_date && t.status !== "done")
      .map(t => {
        const diff = Math.ceil(
          (new Date(t.due_date) - today) / (1000 * 60 * 60 * 24)
        );
        return { title: t.title, daysLeft: diff };
      })
      .filter(t => t.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, settings?.insights_minimal ? 2 : 5);
  }

  function getNeglectedItems() {
    const today = new Date();
    const items = [];

    topics.forEach(t => {
      if (t.status === "done") return;

      if (!t.due_date && t.created_at) {
  const diff = Math.floor((today - new Date(t.created_at)) / 86400000);

  if (diff >= 3 && t.status !== "done") {
    items.push({ text: `${t.title} hasn’t been worked on` });
  }
}
    });

    return items.slice(0, 3);
  }

  function getLifeBalance() {
    const counts = { subject: 0, project: 0, personal: 0 };

    topics.forEach(t => {
      if (t.status === "done" || t.status === "in_progress") {
        counts[t.track_type]++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    return Object.keys(counts)
      .filter(k => counts[k] > 0)
      .map(k => ({
        type: k,
        percent: Math.round((counts[k] / total) * 100)
      }));
  }

  function getCurrentMode() {
    const balance = getLifeBalance();
    if (!balance) return null;

    const max = balance.reduce((a, b) => (a.percent > b.percent ? a : b));

    if (max.type === "subject") return { title: "📘 Academic Mode", desc: "Learning focus" };
    if (max.type === "project") return { title: "🚀 Builder Mode", desc: "Creation focus" };
    if (max.type === "personal") return { title: "🌱 Self Mode", desc: "Self growth focus" };

    return { title: "⚖️ Balanced Mode", desc: "Balanced work" };
  }

  function getMindInsight() {
    if (!settings?.insights_journal || journal.length < 3) return null;

    const filled = journal.filter(j => j.content?.length > 20).length;
    const ratio = filled / journal.length;

    if (ratio > 0.6) return { text: "You’re consistent with journaling" };
    if (ratio < 0.3) return { text: "You haven’t been journaling much lately" };

    return { text: "Your journaling is occasional" };
  }

  // =========================
  // DATA
  // =========================

  const smartFocusItems = getSmartFocus();
  const deadlines = getDeadlines();
  const neglected = getNeglectedItems();
  const mindInsight = getMindInsight();

  const visibleCards = settings?.insights_minimal
    ? ["smart", "deadlines", "mode"]
    : ["smart", "deadlines", "neglected", "mind"];

  // =========================
  // UI
  // =========================

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="dashboard-grid">

  {visibleCards.includes("smart") && (
    <SmartFocusCard items={smartFocusItems} />
  )}

  {visibleCards.includes("deadlines") && (
    <DeadlinesCard deadlines={deadlines} />
  )}

{visibleCards.includes("neglected") && showNeglected && (
  <NeglectedCard items={neglected} />
)}

 <ActivityCard data={data?.activity} momentum={data?.momentum}/>

  {visibleCards.includes("mind") && (
    <MindInsightCard insight={mindInsight} />
  )}

</div>
    </div>
  );
}

export default Dashboard;