import { useState } from "react";
import { apiRequest } from "../api/api";

function ExportSection() {
  const [open, setOpen] = useState(false);

  async function exportNotesPDF() {
    const blob = await apiRequest("/export/notes/pdf/", "GET", null, true);
    downloadBlob(blob, "evanote-notes.pdf");
  }

  async function exportJournalPDF() {
    const blob = await apiRequest("/export/journal/pdf/", "GET", null, true);
    downloadBlob(blob, "evanote-journal.pdf");
  }

  async function exportBackupJSON() {
    const data = await apiRequest("/export/backup/");
    downloadJSON(data, "evanote-backup.json");
  }

  async function exportAnalysisJSON() {
    const data = await apiRequest("/export/analysis/");
    downloadJSON(data, "evanote-analysis.json");
  }

  function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, filename);
  }

  return (
    <div className="export-wrapper">
      <button
        className="export-btn"
        onClick={() => setOpen(!open)}
      >
        Export ▾
      </button>

      {open && (
        <div className="export-menu">
          <div onClick={exportNotesPDF}>📄 Notes (PDF)</div>
          <div onClick={exportJournalPDF}>📓 Journal (PDF)</div>
          <div onClick={exportBackupJSON}>📦 Backup (JSON)</div>
          <div onClick={exportAnalysisJSON}>📊 Analysis (JSON)</div>
        </div>
      )}
    </div>
  );
}

export default ExportSection;