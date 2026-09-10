import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Please choose Business or Investor.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);

      console.log("Login response:", response);

      if (!response || !response.user) {
        setError("Login failed. User information was not returned.");
        return;
      }

      if (response.user.role !== selectedRole) {
        setError(
          "This account is registered as " +
            response.user.role +
            ". Please choose the correct login option."
        );
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Successful login always goes to Home
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />

      <div className="im-login-page">
        <div className="im-grid-bg" />
        <div className="im-glow" />

        <div className="im-login-card">
          <span className="im-corner im-corner-tl" />
          <span className="im-corner im-corner-tr" />
          <span className="im-corner im-corner-bl" />
          <span className="im-corner im-corner-br" />

          <div className="im-login-status">
            <span className="im-dot" />
            investor mtaani
          </div>

          <h1 className="im-login-title">Welcome back</h1>
          <p className="im-login-subtitle">Choose how you want to sign in</p>

          {/* ROLE SELECTION */}
          <div className="im-role-buttons">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("business");
                setError("");
              }}
              className={`im-role-btn ${
                selectedRole === "business" ? "im-role-btn-business" : ""
              }`}
            >
              Business
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole("investor");
                setError("");
              }}
              className={`im-role-btn ${
                selectedRole === "investor" ? "im-role-btn-investor" : ""
              }`}
            >
              Investor
            </button>
          </div>

          {/* ERROR */}
          {error && <div className="im-error">{error}</div>}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit}>
            <label className="im-label">Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="im-input"
            />

            <label className="im-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="im-input"
            />

            <button type="submit" disabled={loading} className="im-submit-btn">
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* REGISTER LINK */}
          <p className="im-footer-text">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      .im-login-page {
        --void: #060911;
        --panel: #0e1626;
        --panel-alt: #0b1220;
        --panel-border: rgba(61, 214, 245, 0.16);
        --cyan: #3dd6f5;
        --violet: #8b7cf6;
        --text: #e7edf5;
        --muted: #7c8aa0;
        --danger: #f2545b;

        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: var(--void);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
        font-family: 'Space Grotesk', sans-serif;
      }

      .im-grid-bg {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(61, 214, 245, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(61, 214, 245, 0.06) 1px, transparent 1px);
        background-size: 46px 46px;
        -webkit-mask-image: radial-gradient(circle at 50% 40%, black, transparent 70%);
        mask-image: radial-gradient(circle at 50% 40%, black, transparent 70%);
        pointer-events: none;
      }

      .im-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 700px;
        height: 500px;
        background: radial-gradient(circle, rgba(61, 214, 245, 0.12), transparent 70%);
        pointer-events: none;
      }

      .im-login-card {
        position: relative;
        width: 100%;
        max-width: 440px;
        background: var(--panel);
        padding: 40px;
        border: 1px solid var(--panel-border);
        border-radius: 6px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        box-sizing: border-box;
        color: var(--text);
      }

      .im-corner {
        position: absolute;
        width: 14px;
        height: 14px;
        border-color: var(--cyan);
        opacity: 0.5;
      }
      .im-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
      .im-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
      .im-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
      .im-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

      .im-login-status {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: var(--muted);
        margin-bottom: 18px;
      }

      .im-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--cyan);
        display: inline-block;
        margin-right: 8px;
        animation: im-pulse 2s infinite;
      }
      @keyframes im-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(61, 214, 245, 0.55); }
        50% { box-shadow: 0 0 0 5px rgba(61, 214, 245, 0); }
      }

      .im-login-title {
        text-align: center;
        font-weight: 700;
        font-size: 28px;
        margin: 0 0 8px;
      }

      .im-login-subtitle {
        text-align: center;
        color: var(--muted);
        font-size: 14.5px;
        margin: 0 0 28px;
      }

      .im-role-buttons {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }

      .im-role-btn {
        flex: 1;
        min-height: 52px;
        padding: 12px 6px;
        border-radius: 3px;
        border: 1px solid var(--panel-border);
        background: var(--panel-alt);
        color: var(--text);
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 500;
        font-size: 13.5px;
        transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
      }

      .im-role-btn:hover {
        border-color: rgba(61, 214, 245, 0.4);
      }

      .im-role-btn-business {
        border-color: var(--cyan);
        background: rgba(61, 214, 245, 0.12);
        color: var(--cyan);
      }

      .im-role-btn-investor {
        border-color: var(--violet);
        background: rgba(139, 124, 246, 0.14);
        color: var(--violet);
      }

      .im-error {
        background: rgba(242, 84, 91, 0.1);
        border: 1px solid rgba(242, 84, 91, 0.35);
        color: var(--danger);
        padding: 12px 14px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        text-align: center;
      }

      .im-label {
        display: block;
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 7px;
      }

      .im-input {
        width: 100%;
        box-sizing: border-box;
        padding: 13px 14px;
        margin-bottom: 18px;
        border-radius: 3px;
        border: 1px solid var(--panel-border);
        background: var(--panel-alt);
        color: var(--text);
        font-family: 'Space Grotesk', sans-serif;
        font-size: 14.5px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .im-input::placeholder {
        color: var(--muted);
      }

      .im-input:focus {
        border-color: var(--cyan);
        box-shadow: 0 0 0 3px rgba(61, 214, 245, 0.16);
      }

      .im-submit-btn {
        width: 100%;
        padding: 15px;
        background: var(--cyan);
        color: #06111a;
        border: none;
        border-radius: 3px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        font-size: 14.5px;
        cursor: pointer;
        margin-top: 4px;
        transition: opacity 0.2s ease;
      }

      .im-submit-btn:hover {
        opacity: 0.88;
      }

      .im-submit-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .im-footer-text {
        text-align: center;
        margin: 24px 0 0;
        color: var(--muted);
        font-size: 13.5px;
      }

      .im-footer-text a {
        color: var(--cyan);
        font-weight: 600;
        text-decoration: none;
      }

      .im-footer-text a:hover {
        text-decoration: underline;
      }
    `}</style>
  );
}

export default Login;
