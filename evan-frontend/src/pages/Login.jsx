import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

function Login({ onLogin, onSwitchToSignup }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    async function handleLogin() {
        console.log("Login clicked");


        const res = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.detail || "Login failed");
            return;
        }

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        onLogin();
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
                    padding: "48px 32px",
                    background: "#151515",
                    border: "var(--border)",
                    borderRadius: "16px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >


                <h1 style={{ marginBottom: "8px" }}>Evanote</h1>
                <p style={{ opacity: 0.7, marginBottom: "8px" }}>Think. Write. Remember.</p>
                <h2 style={{ marginBottom: "24px" }}>Login</h2>
                <div
                    style={{
                        position: "relative",
                        width: "59%",
                        marginBottom: "16px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: "85%",
                            height: "32px",
                            padding: "6px 36px 6px 10px",
                            fontSize: "14px",
                            //   boxSizing: "border-box",
                        }}
                    />
                </div>


                <div
                    style={{
                        position: "relative",
                        width: "59%",
                        margin: "0 auto 20px auto",
                    }}
                >
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "85%",
                            height: "32px",
                            padding: "6px 36px 6px 10px",
                            fontSize: "14px",
                        }}
                    />

                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "14px",
                            opacity: 0.7,
                            userSelect: "none",
                        }}
                    >
                        {showPassword ? "🙈" : "👁"}
                    </span>
                </div>

                <button onClick={handleLogin} className="auth-button">
                    Login
                </button>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "20px 0",
                    width: "85%"
                }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--hover)" }} />
                    <span style={{ margin: "0 10px", fontSize: "12px", opacity: 0.6 }}>
                        OR
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--hover)" }} />
                </div>

                <GoogleLogin
                    theme="filled_black"
                    size="large"
                    text="continue_with"
                    onSuccess={async (credentialResponse) => {
                        const res = await apiRequest(
                            "/google-login/",
                            "POST",
                            { token: credentialResponse.credential }
                        );

                        localStorage.setItem("access", res.access);
                        localStorage.setItem("refresh", res.refresh);

                        onLogin();
                    }}
                    onError={() => console.log("Google Login Failed")}
                />
                <p style={{ opacity: 0.8 }}>
                    New here?{" "}
                    <span
                        onClick={() => navigate("/signup")}
                        style={{ cursor: "pointer", color: "#4da3ff" }}
                    >
                        Sign up
                    </span>
                </p>

                {error && <p style={{ color: "red" }}>{error}</p>}

            </div>

        </div>
    );
}

export default Login;