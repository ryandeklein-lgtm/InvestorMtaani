import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BusinessMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await api.get("/matchmaking/business");
      setMatches(response.data.data || []);
    } catch (error) {
      console.error("Error loading matchmaking requests:", error);
      setError(
        error.response?.data?.message || "Unable to load matchmaking requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fetchMatches, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMatches]);

  const handleStatus = async (matchId, status) => {
    setActionError("");
    setUpdatingId(matchId);
    try {
      await api.patch(`/matchmaking/${matchId}/status`, { status });
      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match.id === matchId ? { ...match, status } : match
        )
      );
    } catch (error) {
      console.error("Error updating matchmaking request:", error);
      setActionError(
        error.response?.data?.message || "Unable to update matchmaking request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = matches.filter((m) => m.status === "pending").length;
  const acceptedCount = matches.filter((m) => m.status === "accepted").length;
  const declinedCount = matches.filter((m) => m.status === "declined").length;

  return (
    <div className="bm-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .bm-root * { box-sizing: border-box; }
        .bm-root { font-family: 'Sora', sans-serif; color: #14110D; }

        .bm-hero {
          position: relative;
          overflow: hidden;
          background: #15402B;
          padding: 56px 8% 50px;
        }
        .bm-hero-pattern {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px),
            repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px);
          pointer-events: none;
        }
        .bm-hero-inner { position: relative; max-width: 1000px; margin: 0 auto; color: #FBF6EA; }
        .bm-back-wrap { margin-bottom: 22px; }
        .bm-back-wrap :is(button, a) {
          color: #FBF6EA !important;
        }
        .bm-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #E7A93D;
          display: inline-block;
          margin-bottom: 16px;
        }
        .bm-title {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.1;
          margin: 0 0 12px;
        }
        .bm-subtitle {
          font-size: 16px;
          line-height: 1.7;
          color: #D9E5DC;
          max-width: 560px;
          margin: 0 0 26px;
        }
        .bm-badge-row { display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .bm-badge {
          font-size: 14px;
          color: #D9E5DC;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .bm-badge strong { font-family: 'Space Mono', monospace; color: #E7A93D; }

        .bm-body { padding: 54px 8% 90px; background: #FBF6EA; }
        .bm-body-inner { max-width: 1000px; margin: 0 auto; }

        .bm-error {
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
        .bm-error-dot { width: 8px; height: 8px; border-radius: 50%; background: #C33F26; flex-shrink: 0; }

        .bm-empty {
          background: #FFFFFF;
          padding: 60px 40px;
          border-radius: 14px;
          text-align: center;
          border: 1px solid rgba(20,17,13,0.08);
        }
        .bm-empty-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(231,169,61,0.16);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          font-size: 22px;
        }
        .bm-empty-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 21px;
          margin: 0 0 8px;
          color: #14110D;
        }
        .bm-empty-text { color: #55503F; margin: 0; font-size: 15px; }

        .bm-grid { display: flex; flex-direction: column; gap: 20px; }

        .bm-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 30px 32px;
          border: 1px solid rgba(20,17,13,0.08);
          border-top: 5px solid var(--accent, #E7A93D);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .bm-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(20,17,13,0.1); }

        .bm-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
        .bm-investor-name {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 20px;
          margin: 0 0 6px;
          color: #14110D;
        }

        .bm-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.4px;
          background: color-mix(in srgb, var(--accent, #E7A93D) 16%, white);
          color: var(--accent, #E7A93D);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .bm-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent, #E7A93D); }

        .bm-divider { margin: 22px 0; border: none; border-top: 1px solid rgba(20,17,13,0.08); }

        .bm-detail-row { margin: 0 0 10px; font-size: 15px; color: #443F32; line-height: 1.6; }
        .bm-detail-row strong { color: #14110D; }
        .bm-amount { font-family: 'Space Mono', monospace; color: #15402B; font-weight: 700; }

        .bm-message {
          margin-top: 18px;
          padding: 18px 20px;
          background: #FBF6EA;
          border-radius: 10px;
          border: 1px solid rgba(20,17,13,0.06);
        }
        .bm-message-label {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #B9832A;
          display: block;
          margin-bottom: 8px;
        }
        .bm-message p { margin: 0; font-size: 14.5px; line-height: 1.65; color: #443F32; }

        .bm-date { margin-top: 18px; color: #8A8371; font-size: 13.5px; }

        .bm-actions {
          display: flex; gap: 12px;
          margin-top: 24px; padding-top: 22px;
          border-top: 1px solid rgba(20,17,13,0.06);
          flex-wrap: wrap;
        }
        .bm-btn {
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 11px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .bm-btn:focus-visible { outline: 3px solid #E7A93D; outline-offset: 2px; }
        .bm-btn-accept { background: #15402B; color: #FBF6EA; }
        .bm-btn-accept:hover { background: #0F3021; }
        .bm-btn-decline { background: transparent; border: 1.5px solid #C33F26; color: #C33F26; }
        .bm-btn-decline:hover { background: rgba(195,63,38,0.08); }

        .bm-loading {
          text-align: center;
          padding: 100px 20px;
          font-family: 'Fraunces', serif;
          color: #14110D;
          font-size: 20px;
        }

        .bm-root { min-height: 100vh; background: #070b13; color: #e7edf5; font-family: 'Space Grotesk', sans-serif; }
        .bm-hero { background: radial-gradient(ellipse at 80% 10%, rgba(73,221,202,.12), transparent 34%), linear-gradient(135deg,#0c1724,#09111d 68%,#101a2a); }
        .bm-hero-inner { color: #eef5fb; }
        .bm-eyebrow { color: #75e7d6; }
        .bm-subtitle, .bm-badge { color: #aebccd; }
        .bm-badge strong { color: #75e7d6; }
        .bm-body { background: radial-gradient(ellipse at 12% 0%,rgba(73,221,202,.04),transparent 32rem),#070b13; }
        .bm-card, .bm-empty { background: linear-gradient(145deg,rgba(17,29,46,.97),rgba(9,15,26,.98)); border: 1px solid rgba(148,163,184,.17); border-radius: 16px; box-shadow: 0 16px 44px rgba(0,0,0,.2); }
        .bm-card { border-top: 2px solid var(--accent,#49ddca); }
        .bm-card:hover { box-shadow: 0 20px 52px rgba(0,0,0,.3); }
        .bm-investor-name, .bm-empty-title, .bm-detail-row strong { color: #edf4fa; }
        .bm-detail-row { color: #b0bdcc; }
        .bm-amount { color: #7ce9d8; }
        .bm-status { background: color-mix(in srgb,var(--accent,#49ddca) 15%,#0b1422); color: var(--accent,#49ddca); border: 1px solid color-mix(in srgb,var(--accent,#49ddca) 28%,transparent); }
        .bm-divider { border-top-color: rgba(148,163,184,.14); }
        .bm-message { background: rgba(7,13,23,.72); border: 1px solid rgba(148,163,184,.14); }
        .bm-message-label { color: #79e8d8; }
        .bm-message p { color: #c5d1dd; }
        .bm-date { color: #8292a7; }
        .bm-actions { border-top-color: rgba(148,163,184,.14); }
        .bm-btn-accept { background: linear-gradient(110deg,#45e4d1,#63d7fb); color: #06131a; }
        .bm-btn-accept:hover { background: #8af1e1; }
        .bm-btn-decline { background: rgba(248,113,133,.08); border-color: rgba(248,113,133,.4); color: #fda4af; }
        .bm-btn-decline:hover { background: rgba(248,113,133,.15); }
        .bm-error { background: rgba(248,113,133,.09); border: 1px solid rgba(248,113,133,.25); color: #fecdd3; }
        .bm-error-dot { background: #fb7185; }
        .bm-empty-icon { background: rgba(73,221,202,.1); color: #8af1e1; }
        .bm-empty-title { font-family: 'Space Grotesk',sans-serif; }
        .bm-empty-text { color: #a9b8c9; }
        .bm-loading { color: #b3c2d2; font-family: 'Space Grotesk',sans-serif; }
        .bm-btn:disabled { opacity: .65; cursor: wait; }

        @media (max-width: 700px) {
          .bm-hero { padding: 44px 6% 40px; }
          .bm-card-header { flex-direction: column; }
        }
      `}</style>

      {loading ? (
        <>
          <section className="bm-hero">
            <div className="bm-hero-pattern" />
            <div className="bm-hero-inner">
              <div className="bm-back-wrap">
                <BackButton />
              </div>
              <span className="bm-eyebrow">Investor Connections</span>
              <h1 className="bm-title">Matchmaking Requests</h1>
            </div>
          </section>
          <div className="bm-loading">Loading matchmaking requests…</div>
        </>
      ) : (
        <>
          <section className="bm-hero">
            <div className="bm-hero-pattern" />
            <div className="bm-hero-inner">
              <div className="bm-back-wrap">
                <BackButton />
              </div>
              <span className="bm-eyebrow">Investor Connections</span>
              <h1 className="bm-title">Matchmaking Requests</h1>
              <p className="bm-subtitle">
                Review investors who want to connect with your business.
              </p>

              {matches.length > 0 && (
                <div className="bm-badge-row">
                  <span className="bm-badge">
                    <strong>{matches.length}</strong> Total
                  </span>
                  <span className="bm-badge">
                    <strong>{pendingCount}</strong> Pending
                  </span>
                  <span className="bm-badge">
                    <strong>{acceptedCount}</strong> Accepted
                  </span>
                  <span className="bm-badge">
                    <strong>{declinedCount}</strong> Declined
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="bm-body">
            <div className="bm-body-inner">
              {error ? (
                <div className="bm-error">
                  <span className="bm-error-dot" />
                  {error}
                </div>
              ) : null}

              {actionError && <div className="bm-error" role="alert"><span className="bm-error-dot" />{actionError}</div>}

              {!error && matches.length === 0 ? (
                <div className="bm-empty">
                  <div className="bm-empty-icon">🤝</div>
                  <h2 className="bm-empty-title">No matchmaking requests yet</h2>
                  <p className="bm-empty-text">
                    When an investor requests a match with your business, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="bm-grid">
                  {matches.map((match) => {
                    const accent =
                      match.status === "accepted"
                        ? "#45d9a2"
                        : match.status === "declined"
                        ? "#fb7185"
                        : "#f4c978";
                    const label = match.status
                      ? match.status.charAt(0).toUpperCase() + match.status.slice(1)
                      : "Pending";

                    return (
                      <div key={match.id} className="bm-card" style={{ "--accent": accent }}>
                        <div className="bm-card-header">
                          <div>
                            <h2 className="bm-investor-name">
                              {match.investor_name || "Investor"}
                            </h2>
                            <p className="bm-detail-row">
                              Contact details stay private while an introduction is being reviewed.
                            </p>
                          </div>
                          <span className="bm-status">
                            <span className="bm-status-dot" />
                            {label}
                          </span>
                        </div>

                        <hr className="bm-divider" />

                        <p className="bm-detail-row">
                          <strong>Business:</strong> {match.business_name}
                        </p>

                        {match.investment_amount && (
                          <p className="bm-detail-row">
                            <strong>Proposed Investment:</strong>{" "}
                            <span className="bm-amount">
                              KES {Number(match.investment_amount).toLocaleString()}
                            </span>
                          </p>
                        )}

                        {match.investment_type && (
                          <p className="bm-detail-row">
                            <strong>Investment Type:</strong> {match.investment_type}
                          </p>
                        )}

                        {match.message && (
                          <div className="bm-message">
                            <span className="bm-message-label">Investor Message</span>
                            <p>{match.message}</p>
                          </div>
                        )}

                        <p className="bm-date">
                          Requested: {new Date(match.created_at).toLocaleDateString()}
                        </p>

                        {match.status === "accepted" && (
                          <p className="bm-detail-row">
                            Introduction accepted. This records interest only; it does not
                            complete a transaction or provide direct contact details.
                          </p>
                        )}

                        {match.status === "pending" && (
                          <div className="bm-actions">
                            <button
                              className="bm-btn bm-btn-accept"
                              disabled={updatingId === match.id}
                              onClick={() => handleStatus(match.id, "accepted")}
                            >
                              {updatingId === match.id ? "Updating…" : "✓ Accept Introduction"}
                            </button>
                            <button
                              className="bm-btn bm-btn-decline"
                              disabled={updatingId === match.id}
                              onClick={() => handleStatus(match.id, "declined")}
                            >
                              ✕ Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default BusinessMatches;
