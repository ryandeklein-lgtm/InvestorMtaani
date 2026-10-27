import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuthContext();

  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expectedRole = selectedRole;
    if (!expectedRole) {
      setError("Choose Investor, Business or Admin to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(formData);

      if (!response || !response.user) {
        logout();
        setError("Login failed. User information was not returned.");
        return;
      }

      const loggedInRole = String(response.user.role || "").toLowerCase();
      if (loggedInRole !== expectedRole) {
        logout();
        setError(`This account is registered as ${loggedInRole || "another account type"}. Choose its matching sign-in option.`);
        return;
      }

      if (loggedInRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />

      <main className="im-login-page">
        <div className="im-grid-bg"></div>
        <div className="im-glow"></div>

        <section className="im-login-card">
          <span className="im-corner im-corner-tl"></span>
          <span className="im-corner im-corner-tr"></span>
          <span className="im-corner im-corner-bl"></span>
          <span className="im-corner im-corner-br"></span>

          <div className="im-login-status">
            <span className="im-dot"></span>
            INVESTOR MTAANI
          </div>

          <h1 className="im-login-title">Welcome back</h1>

          <p className="im-login-subtitle">Choose your account type, then sign in with your email and password.</p>

          <fieldset className="im-role-buttons" aria-required="true">
            <legend className="im-role-legend">Sign in as</legend>
            {[
              { role: "investor", label: "Investor", icon: "◇" },
              { role: "business", label: "Business", icon: "◈" },
              { role: "admin", label: "Admin", icon: "✦" },
            ].map(({ role, label, icon }) => (
              <label key={role} className={`im-role-btn${selectedRole === role ? " is-selected" : ""}`}>
                <input
                  className="im-role-input"
                  type="radio"
                  name="account-role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => { setSelectedRole(role); setError(""); }}
                />
                <span aria-hidden="true">{icon}</span> {label}
              </label>
            ))}
          </fieldset>

          {error && (
            <div className="im-error" role="alert">
              <span className="im-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="im-field">
              <label htmlFor="email" className="im-label">
                Email address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="im-input"
              />
            </div>

            <div className="im-field">
              <label htmlFor="password" className="im-label">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="im-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="im-submit-btn"
            >
              {loading ? (
                <>
                  <span className="im-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="im-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <p className="im-footer-text">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>

          <div className="im-footer-line">
            <span></span>
            <span>SECURE ACCESS</span>
            <span></span>
          </div>
        </section>
      </main>
    </>
  );
}

function GlobalStyles() {
  return (
    <style>
      {`
        * {
          box-sizing: border-box;
        }

        .im-login-page {
          --void: #060911;
          --panel: #0e1626;
          --panel-border: rgba(61, 214, 245, 0.16);
          --cyan: #3dd6f5;
          --text: #e7edf5;
          --muted: #7c8aa0;
          --danger: #f2545b;

          position: relative;
          min-height: 100vh;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(61, 214, 245, 0.05),
              transparent 45%
            ),
            var(--void);

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 40px 20px;

          color: var(--text);
          font-family: "Space Grotesk", sans-serif;
        }

        .im-grid-bg {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(61, 214, 245, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(61, 214, 245, 0.045) 1px,
              transparent 1px
            );

          background-size: 46px 46px;

          -webkit-mask-image:
            radial-gradient(
              circle at center,
              black,
              transparent 75%
            );

          mask-image:
            radial-gradient(
              circle at center,
              black,
              transparent 75%
            );

          pointer-events: none;
        }

        .im-glow {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 720px;
          height: 520px;

          transform: translate(-50%, -50%);

          background:
            radial-gradient(
              circle,
              rgba(61, 214, 245, 0.10),
              transparent 68%
            );

          pointer-events: none;
        }

        .im-login-card {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 460px;

          padding: 42px;

          background:
            linear-gradient(
              145deg,
              rgba(17, 28, 47, 0.98),
              rgba(8, 15, 28, 0.98)
            );

          border: 1px solid var(--panel-border);
          border-radius: 8px;

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(255, 255, 255, 0.025);

          backdrop-filter: blur(16px);
        }

        .im-corner {
          position: absolute;

          width: 16px;
          height: 16px;

          border-color: var(--cyan);

          opacity: 0.7;

          pointer-events: none;
        }

        .im-corner-tl {
          top: -1px;
          left: -1px;
          border-top: 2px solid;
          border-left: 2px solid;
        }

        .im-corner-tr {
          top: -1px;
          right: -1px;
          border-top: 2px solid;
          border-right: 2px solid;
        }

        .im-corner-bl {
          bottom: -1px;
          left: -1px;
          border-bottom: 2px solid;
          border-left: 2px solid;
        }

        .im-corner-br {
          bottom: -1px;
          right: -1px;
          border-bottom: 2px solid;
          border-right: 2px solid;
        }

        .im-login-status {
          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 18px;

          color: var(--muted);

          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
        }

        .im-dot {
          width: 6px;
          height: 6px;

          margin-right: 9px;

          border-radius: 50%;

          background: var(--cyan);

          box-shadow:
            0 0 8px rgba(61, 214, 245, 0.8);

          animation: im-pulse 2s infinite;
        }

        @keyframes im-pulse {
          0%,
          100% {
            box-shadow:
              0 0 0 0 rgba(61, 214, 245, 0.45);
          }

          50% {
            box-shadow:
              0 0 0 5px rgba(61, 214, 245, 0);
          }
        }

        .im-login-title {
          margin: 0;

          text-align: center;

          color: var(--text);

          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .im-login-subtitle {
          margin: 8px 0 30px;

          color: var(--muted);

          text-align: center;

          font-size: 14px;
        }

        .im-role-buttons {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin: -8px 0 22px;
          padding: 0;
          border: 0;
          min-width: 0;
        }

        .im-role-legend {
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 12px;
        }

        .im-role-btn {
          position: relative;
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--panel-border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--muted);
          cursor: pointer;
          font: 600 12px "Space Grotesk", sans-serif;
          white-space: nowrap;
          transition: border-color .18s ease, color .18s ease, background .18s ease;
        }

        .im-role-btn:hover,
        .im-role-btn:focus-within {
          border-color: rgba(61, 214, 245, .55);
          color: var(--text);
        }

        .im-role-btn:focus-within {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .im-role-input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          opacity: 0;
          cursor: pointer;
        }

        .im-role-btn.is-selected {
          border-color: var(--cyan);
          background: rgba(61, 214, 245, .1);
          color: var(--cyan);
          box-shadow: 0 0 20px rgba(61, 214, 245, .07);
        }

        .im-error {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;
          padding: 12px 14px;

          border: 1px solid rgba(242, 84, 91, 0.3);
          border-radius: 5px;

          background: rgba(242, 84, 91, 0.08);

          color: var(--danger);

          font-family: "JetBrains Mono", monospace;
          font-size: 11.5px;
          line-height: 1.5;
        }

        .im-error-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          flex: 0 0 auto;

          width: 18px;
          height: 18px;

          border: 1px solid rgba(242, 84, 91, 0.5);
          border-radius: 50%;

          font-size: 11px;
          font-weight: 700;
        }

        .im-field {
          margin-bottom: 18px;
        }

        .im-label {
          display: block;

          margin-bottom: 8px;

          color: var(--muted);

          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 600;
        }

        .im-input {
          display: block;

          width: 100%;

          padding: 14px 15px;

          border: 1px solid var(--panel-border);
          border-radius: 5px;

          background: rgba(7, 14, 26, 0.8);

          color: var(--text);

          outline: none;

          font-family: "Space Grotesk", sans-serif;
          font-size: 14px;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .im-input::placeholder {
          color: #536176;
        }

        .im-input:hover {
          border-color: rgba(61, 214, 245, 0.28);
        }

        .im-input:focus {
          border-color: var(--cyan);

          background: rgba(7, 14, 26, 0.95);

          box-shadow:
            0 0 0 3px rgba(61, 214, 245, 0.09),
            0 0 20px rgba(61, 214, 245, 0.04);
        }

        .im-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          width: 100%;

          min-height: 52px;

          margin-top: 6px;
          padding: 14px 18px;

          border: none;
          border-radius: 5px;

          background: var(--cyan);

          color: #041018;

          cursor: pointer;

          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          font-weight: 700;

          box-shadow:
            0 8px 25px rgba(61, 214, 245, 0.12);

          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            box-shadow 0.2s ease;
        }

        .im-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 12px 30px rgba(61, 214, 245, 0.18);
        }

        .im-submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .im-arrow {
          font-size: 18px;
          line-height: 1;
        }

        .im-spinner {
          width: 15px;
          height: 15px;

          border: 2px solid rgba(4, 16, 24, 0.25);
          border-top-color: #041018;

          border-radius: 50%;

          animation: im-spin 0.7s linear infinite;
        }

        @keyframes im-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .im-footer-text {
          margin: 24px 0 0;

          color: var(--muted);

          text-align: center;

          font-size: 13px;
        }

        .im-footer-text a {
          color: var(--cyan);

          font-weight: 600;
          text-decoration: none;
        }

        .im-footer-text a:hover {
          text-decoration: underline;
        }

        .im-footer-line {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-top: 26px;

          color: #455269;

          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 1.5px;
        }

        .im-footer-line span:first-child,
        .im-footer-line span:last-child {
          height: 1px;
          flex: 1;

          background: rgba(61, 214, 245, 0.08);
        }

        @media (max-width: 520px) {
          .im-login-page {
            padding: 24px 14px;
          }

          .im-login-card {
            padding: 30px 22px;
          }

          .im-login-title {
            font-size: 26px;
          }
        }
      `}
    </style>
  );
}

export default Login;
