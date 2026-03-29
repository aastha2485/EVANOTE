const API_BASE = "http://127.0.0.1:8000/api";

export async function apiRequest(
  endpoint,
  method = "GET",
  data = null,
  isBlob = false
) {
  const token = localStorage.getItem("access");

  const headers = {};

  // ✅ Only JSON if not FormData
  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body:
      data instanceof FormData
        ? data
        : data
        ? JSON.stringify(data)
        : null,
  });

  // 🔥 Handle auth
  if (res.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.reload();
  }

  // ✅ Handle blob FIRST (PDF export)
  if (isBlob) {
    if (!res.ok) {
      throw new Error("File download failed");
    }
    return await res.blob();
  }

  // ✅ Safe JSON parse
  let responseData = null;
  try {
    responseData = await res.json();
  } catch {
    responseData = null;
  }

  if (!res.ok) {
    console.error("API error:", res.status);
    console.error("Full error:", responseData);
    throw new Error(responseData?.detail || "API request failed");
  }

  return responseData;
}