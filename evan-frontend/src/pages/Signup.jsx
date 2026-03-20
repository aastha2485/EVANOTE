import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

function Signup({ onSignup, onSwitchToLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSignup() {
        setError("");

        const res = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError("Signup failed");
            return;
        }

        alert("Signup successful! Please login.");
        onSignup();
    }

return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "var(--bg)",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "#151515",
        padding: "48px 32px",
        borderRadius: "16px",
        border: "var(--border)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
        <h1 style={{ marginBottom: "8px" }}>Join Evanote</h1>
        <p style={{ opacity: 0.7, marginBottom: "8px" }}>
          Your personal thinking space
        </p>

        <h2 style={{ marginBottom: "24px" }}>Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ 
            marginBottom: "16px",
            width: "85%",
            margin: "0 auto 16px auto",
        }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            marginBottom: "24px",
            width: "85%",
            margin: "0 auto 16px auto", 
        }}
        />

        <button onClick={handleSignup} className="auth-button">
  Sign Up
</button>

<div style={{ 
  display: "flex", 
  alignItems: "center", 
  margin: "20px 0",
  width: "85%",
  marginLeft: "auto",
  marginRight: "auto"
}}>
  <div style={{ flex: 1, height: "1px", background: "#333" }} />
  <span style={{ margin: "0 10px", fontSize: "12px", opacity: 0.6 }}>
    OR
  </span>
  <div style={{ flex: 1, height: "1px", background: "#333" }} />
</div>

<GoogleLogin
  text="continue_with"
  onSuccess={async (credentialResponse) => {
    const res = await apiRequest(
      "/google-login/",
      "POST",
      { token: credentialResponse.credential }
    );

    localStorage.setItem("access", res.access);
    localStorage.setItem("refresh", res.refresh);

    onSignup();
  }}
  onError={() => console.log("Google Signup Failed")}
/>

        <p style={{ opacity: 0.8 }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer", color: "#4da3ff" }}
          >
            Login
          </span>
        </p>
    </div>
  </div>
);

}

export default Signup;