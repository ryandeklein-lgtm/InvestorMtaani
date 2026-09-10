import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Matchmaking() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  useEffect(() => {
    if (user) {
      fetchMatches();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMatches = async () => {
    setError(null);
    try {
      const endpoint =
        user.role === "business" ? "/matchmaking/business" : "/matchmaking/investor";
      const response = await api.get(endpoint);
      setMatches(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Could not load matchmaking requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError(null);
    try {
      await api.patch(`/matchmaking/${id}/status`, { status });
      await fetchMatches();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          `Could not ${status === "accepted" ? "accept" : "decline"} this request.`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const statusMeta = (status) => {
    switch (status) {
      case "accepted":
        return { accent: "#4ade80", label: "Accepted" };
      case "declined":
        return { accent: "#f2545b", label: "Declined" };
      default:
        return { accent: "#3dd6f5", label: "Pending" };
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const pendingCount = matches.filter((m) => m.status === "pending").length;
  const acceptedCount = matches.filter((m) => m.status === "accepted").length;
  const declinedCount = matches.filter((m) => m.status === "declined").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .mm-root * { box-sizing: border-box; }
        .mm-root {
          --void: #060911;
          --void-alt: #080d17;
          --panel: #0e1626;
          --panel-alt: #0b1220;
          --panel-border: rgba(61, 214, 245, 0.16);
          --cyan: #3dd6f5;
          --violet: #8b7cf6;
          --text: #e7edf5;
          --muted: #7c8aa0;
          --success: #4ade80;
          --danger: #f2545b;

          font-family: 'Space Grotesk', sans-serif;
          color: var(--text);
          background: var(--void);
        }

        .mm-corner {
          position: absolute;
          width: 13px;
          height: 13px;
          border-color: var(--cyan);
          opacity: 0.5;
        }
        .mm-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .mm-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
        .mm-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
        .mm-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

        .mm-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          display: inline-block;
          margin-right: 9px;
          animation: mm-dot-pulse 2s infinite;
        }
        @keyframes mm-dot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(61, 214, 245, 0.55); }
          50% { box-shadow: 0 0 0 5px rgba(61, 214, 245, 0); }
        }

        .mm-hero {
          position: relative;
          overflow: hidden;
          padding: 60px 8% 50px;
        }
        .mm-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(61, 214, 245, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61, 214, 245, 0.06) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(circle at 15% 0%, black, transparent 70%);
          mask-image: radial-gradient(circle at 15% 0%, black, transparent 70%);
          pointer-events: none;
        }
        .mm-hero-glow {
          position: absolute;
          top: -220px;
          left: -100px;
          width: 760px;
          height: 480px;
          background: radial-gradient(circle, rgba(61, 214, 245, 0.14), transparent 70%);
          pointer-events: none;
        }
        .mm-hero-inner { position: relative; max-width: 1220px; margin: 0 auto; }

        .mm-status {
          display: inline-flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 18px;
        }

        .mm-hero-scan { position: relative; overflow: hidden; max-width: 620px; }
        .mm-scanline {
          position: absolute;
          left: 0; right: 0; top: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--cyan), transparent 80%);
          animation: mm-scan 1.6s ease-out 1 forwards;
        }
        @keyframes mm-scan {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: 0.9; }
          100% { transform: translateY(130px); opacity: 0; }
        }

        .mm-hero-title {
          font-weight: 700;
          font-size: clamp(30px, 4.2vw, 44px);
          line-height: 1.1;
          margin: 0 0 14px;
        }
        .mm-hero-para {
          font-size: 15.5px;
          line-height: 1.7;
          color: var(--muted);
          max-width: 560px;
          margin: 0 0 28px;
        }

        .mm-badge-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .mm-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
          background: var(--panel);
          border: 1px solid var(--panel-border);
          padding: 8px 14px;
          border-radius: 3px;
        }
        .mm-badge strong { color: var(--cyan); }

        .mm-body { padding: 56px 8% 90px; }
        .mm-body-inner { max-width: 820px; margin: 0 auto; }

        .mm-error {
          background: rgba(242, 84, 91, 0.1);
          border: 1px solid rgba(242, 84, 91, 0.35);
          color: var(--danger);
          padding: 14px 18px;
          border-radius: 4px;
          margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mm-error-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--danger); flex-shrink: 0; }

        .mm-empty, .mm-locked {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          padding: 56px 40px;
          border-radius: 4px;
          text-align: center;
        }
        .mm-empty-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11.5px;
          color: var(--violet);
          display: block;
          margin-bottom: 14px;
        }
        .mm-empty-title {
          font-weight: 600;
          font-size: 19px;
          margin: 0 0 8px;
          color: var(--text);
        }
        .mm-empty-text { color: var(--muted); margin: 0; font-size: 14px; }
        .mm-empty-link {
          display: inline-block;
          margin-top: 22px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: var(--cyan);
          border: 1px solid rgba(61, 214, 245, 0.4);
          padding: 12px 24px;
          border-radius: 3px;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .mm-empty-link:hover { background: var(--cyan); color: #06111a; }

        .mm-card-list { display: flex; flex-direction: column; gap: 16px; }
        .mm-card {
          position: relative;
          background: var(--panel);
          border-radius: 4px;
          padding: 24px 26px;
          border: 1px solid var(--panel-border);
          border-top: 2px solid var(--accent, #3dd6f5);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .mm-card:hover { box-shadow: 0 0 24px rgba(61, 214, 245, 0.08); }

        .mm-card-top { display: flex; align-items: flex-start; gap: 16px; }
        .mm-avatar {
          width: 42px; height: 42px; border-radius: 3px;
          background: var(--panel-alt);
          border: 1px solid var(--panel-border);
          color: var(--cyan);
          display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600; font-size: 13px;
          flex-shrink: 0;
        }
        .mm-name {
          font-weight: 600;
          font-size: 18px;
          margin: 0 0 6px;
          color: var(--text);
        }
        .mm-sub { color: var(--muted); margin: 0; font-size: 13.5px; }
        .mm-sub strong { color: var(--text); font-weight: 500; }

        .mm-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 13px;
          border-radius: 3px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 12px;
          background: color-mix(in srgb, var(--accent, #3dd6f5) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent, #3dd6f5) 40%, transparent);
          color: var(--accent, #3dd6f5);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mm-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #3dd6f5); }

        .mm-actions {
          display: flex; gap: 12px;
          margin-top: 20px; padding-top: 18px;
          border-top: 1px solid var(--panel-border);
        }
        .mm-btn {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .mm-btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
        .mm-btn-accept { background: var(--success); color: #06210f; }
        .mm-btn-accept:hover:not(:disabled) { opacity: 0.88; }
        .mm-btn-decline { background: transparent; border: 1px solid rgba(242, 84, 91, 0.45); color: var(--danger); }
        .mm-btn-decline:hover:not(:disabled) { background: rgba(242, 84, 91, 0.08); }
        .mm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .mm-skeleton-card {
          display: flex; gap: 16px;
          background: var(--panel);
          border-radius: 4px;
          padding: 24px 26px;
          border: 1px solid var(--panel-border);
          animation: mm-pulse 1.3s ease-in-out infinite;
        }
        .mm-skeleton-avatar { width: 42px; height: 42px; border-radius: 3px; background: var(--panel-alt); flex-shrink: 0; }
        .mm-skeleton-line { height: 11px; border-radius: 2px; background: var(--panel-alt); margin-bottom: 10px; }
        @keyframes mm-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

        @media (max-width: 860px) {
          .mm-hero { padding: 46px 6% 36px; }
        }
      `}</style>

      <div className="mm-root">
        <section className="mm-hero">
          <div className="mm-hero-grid" />
          <div className="mm-hero-glow" />
          <div className="mm-hero-inner">
            <div className="mm-status">
              <span className="mm-dot" />
              investor connections
            </div>

            <div className="mm-hero-scan">
              <div className="mm-scanline" />
              <h1 className="mm-hero-title">Matchmaking</h1>
              <p className="mm-hero-para">
                Manage your investor and business matches in one place.
              </p>
            </div>

            {user && matches.length > 0 && (
              <div className="mm-badge-row">
                <span className="mm-badge">
                  <strong>{matches.length}</strong> total
                </span>
                <span className="mm-badge">
                  <strong>{pendingCount}</strong> pending
                </span>
                <span className="mm-badge">
                  <strong>{acceptedCount}</strong> accepted
                </span>
                <span className="mm-badge">
                  <strong>{declinedCount}</strong> declined
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="mm-body">
          <div className="mm-body-inner">
            {!user ? (
              <div className="mm-locked">
                <span className="mm-corner mm-corner-tl" />
                <span className="mm-corner mm-corner-tr" />
                <span className="mm-corner mm-corner-bl" />
                <span className="mm-corner mm-corner-br" />
                <span className="mm-empty-tag">access restricted</span>
                <h2 className="mm-empty-title">Please log in to view your matches.</h2>
                <p className="mm-empty-text">
                  Your matchmaking activity lives behind your account.
                </p>
              </div>
            ) : loading ? (
              <div className="mm-card-list">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="mm-skeleton-card" style={{ animationDelay: `${i * 0.12}s` }}>
                    <div className="mm-skeleton-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="mm-skeleton-line" style={{ width: "40%" }} />
                      <div className="mm-skeleton-line" style={{ width: "60%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {error ? (
                  <div className="mm-error">
                    <span className="mm-error-dot" />
                    {error}
                  </div>
                ) : null}

                {matches.length === 0 ? (
                  <div className="mm-empty">
                    <span className="mm-corner mm-corner-tl" />
                    <span className="mm-corner mm-corner-tr" />
                    <span className="mm-corner mm-corner-bl" />
                    <span className="mm-corner mm-corner-br" />
                    <span className="mm-empty-tag">no records</span>
                    <h2 className="mm-empty-title">No matchmaking requests yet.</h2>
                    <p className="mm-empty-text">
                      New matches will appear here as soon as they're made.
                    </p>
                    <Link to="/browse" className="mm-empty-link">
                      Browse businesses
                    </Link>
                  </div>
                ) : (
                  <div className="mm-card-list">
                    {matches.map((match) => {
                      const meta = statusMeta(match.status);
                      const name = match.business_name || match.startup_name || "Business";
                      return (
                        <div
                          key={match.id}
                          className="mm-card"
                          style={{ "--accent": meta.accent }}
                        >
                          <div className="mm-card-top">
                            <div className="mm-avatar">{initials(name)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h2 className="mm-name">{name}</h2>
                              <p className="mm-sub">
                                Investor: <strong>{match.investor_name || "Investor"}</strong>
                              </p>
                            </div>
                            <span className="mm-status-chip">
                              <span className="mm-status-dot" />
                              {meta.label}
                            </span>
                          </div>

                          {user.role === "business" && match.status === "pending" ? (
                            <div className="mm-actions">
                              <button
                                className="mm-btn mm-btn-accept"
                                onClick={() => updateStatus(match.id, "accepted")}
                                disabled={updatingId === match.id}
                              >
                                {updatingId === match.id ? "Updating…" : "Accept"}
                              </button>
                              <button
                                className="mm-btn mm-btn-decline"
                                onClick={() => updateStatus(match.id, "declined")}
                                disabled={updatingId === match.id}
                              >
                                {updatingId === match.id ? "Updating…" : "Decline"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
