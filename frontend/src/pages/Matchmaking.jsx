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
        return { accent: "#15402B", label: "Accepted" };
      case "declined":
        return { accent: "#C33F26", label: "Declined" };
      default:
        return { accent: "#E7A93D", label: "Pending" };
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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .mm-root * { box-sizing: border-box; }
        .mm-root { font-family: 'Sora', sans-serif; color: #14110D; }

        .mm-hero {
          position: relative;
          overflow: hidden;
          background: #15402B;
          padding: 64px 8% 54px;
        }
        .mm-hero-pattern {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px),
            repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px);
          pointer-events: none;
        }
        .mm-hero-inner { position: relative; max-width: 1220px; margin: 0 auto; color: #FBF6EA; }
        .mm-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #E7A93D;
          display: inline-block;
          margin-bottom: 18px;
        }
        .mm-hero-title {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(32px, 4.4vw, 50px);
          line-height: 1.1;
          margin: 0 0 14px;
        }
        .mm-hero-para {
          font-size: 17px;
          line-height: 1.7;
          color: #D9E5DC;
          max-width: 560px;
          margin: 0 0 30px;
        }
        .mm-badge-row { display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .mm-badge {
          font-size: 14px;
          color: #D9E5DC;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .mm-badge strong { font-family: 'Space Mono', monospace; color: #E7A93D; }

        .mm-body { padding: 60px 8% 90px; background: #FBF6EA; }
        .mm-body-inner { max-width: 820px; margin: 0 auto; }

        .mm-error {
          background: #FBE3DB;
          color: #C33F26;
          padding: 14px 20px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .mm-error-dot { width: 8px; height: 8px; border-radius: 50%; background: #C33F26; flex-shrink: 0; }

        .mm-empty, .mm-locked {
          background: #FFFFFF;
          padding: 60px 40px;
          border-radius: 14px;
          text-align: center;
          border: 1px solid rgba(20,17,13,0.08);
        }
        .mm-empty-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(231,169,61,0.16);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          font-size: 22px;
        }
        .mm-empty-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 21px;
          margin: 0 0 8px;
          color: #14110D;
        }
        .mm-empty-text { color: #55503F; margin: 0; font-size: 15px; }
        .mm-empty-link {
          display: inline-block;
          margin-top: 24px;
          background: #15402B;
          color: #FBF6EA;
          padding: 13px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        .mm-empty-link:hover { background: #0F3021; }

        .mm-card-list { display: flex; flex-direction: column; gap: 18px; }
        .mm-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 26px 28px;
          border: 1px solid rgba(20,17,13,0.08);
          border-top: 5px solid var(--accent, #E7A93D);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .mm-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(20,17,13,0.1); }

        .mm-card-top { display: flex; align-items: flex-start; gap: 16px; }
        .mm-avatar {
          width: 46px; height: 46px; border-radius: 10px;
          background: #15402B; color: #FBF6EA;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace;
          font-weight: 700; font-size: 14px;
          flex-shrink: 0;
        }
        .mm-name {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 19px;
          margin: 0 0 6px;
          color: #14110D;
        }
        .mm-sub { color: #8A8371; margin: 0; font-size: 14px; }
        .mm-sub strong { color: #14110D; }

        .mm-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12.5px;
          background: color-mix(in srgb, var(--accent, #E7A93D) 16%, white);
          color: var(--accent, #E7A93D);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mm-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #E7A93D); }

        .mm-actions {
          display: flex; gap: 12px;
          margin-top: 22px; padding-top: 20px;
          border-top: 1px solid rgba(20,17,13,0.06);
        }
        .mm-btn {
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 22px;
          border-radius: 8px;
          border: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .mm-btn:focus-visible { outline: 3px solid #E7A93D; outline-offset: 2px; }
        .mm-btn-accept { background: #15402B; color: #FBF6EA; }
        .mm-btn-accept:hover:not(:disabled) { background: #0F3021; }
        .mm-btn-decline { background: transparent; border: 1.5px solid #C33F26; color: #C33F26; }
        .mm-btn-decline:hover:not(:disabled) { background: rgba(195,63,38,0.08); }
        .mm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .mm-skeleton-card {
          display: flex; gap: 16px;
          background: #FFFFFF;
          border-radius: 14px;
          padding: 26px 28px;
          border: 1px solid rgba(20,17,13,0.08);
          animation: mm-pulse 1.3s ease-in-out infinite;
        }
        .mm-skeleton-avatar { width: 46px; height: 46px; border-radius: 10px; background: rgba(20,17,13,0.08); flex-shrink: 0; }
        .mm-skeleton-line { height: 12px; border-radius: 6px; background: rgba(20,17,13,0.08); margin-bottom: 10px; }
        @keyframes mm-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }

        @media (max-width: 860px) {
          .mm-hero { padding: 48px 6% 40px; }
        }
      `}</style>

      <div className="mm-root">
        <section className="mm-hero">
          <div className="mm-hero-pattern" />
          <div className="mm-hero-inner">
            <span className="mm-eyebrow">Investor Connections</span>
            <h1 className="mm-hero-title">Matchmaking</h1>
            <p className="mm-hero-para">
              Manage your investor and business matches in one place.
            </p>

            {user && matches.length > 0 && (
              <div className="mm-badge-row">
                <span className="mm-badge">
                  <strong>{matches.length}</strong> Total
                </span>
                <span className="mm-badge">
                  <strong>{pendingCount}</strong> Pending
                </span>
                <span className="mm-badge">
                  <strong>{acceptedCount}</strong> Accepted
                </span>
                <span className="mm-badge">
                  <strong>{declinedCount}</strong> Declined
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="mm-body">
          <div className="mm-body-inner">
            {!user ? (
              <div className="mm-locked">
                <div className="mm-empty-icon">🔒</div>
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
                    <div className="mm-empty-icon">🤝</div>
                    <h2 className="mm-empty-title">No matchmaking requests yet.</h2>
                    <p className="mm-empty-text">
                      New matches will appear here as soon as they're made.
                    </p>
                    <Link to="/browse" className="mm-empty-link">
                      Browse Businesses
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
                            <span className="mm-status">
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
