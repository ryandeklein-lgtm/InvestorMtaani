import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread | matches | system

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setMarkingId(id);
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleOpen = async (n) => {
    if (!n.read) await markAsRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  // --- presentation helpers -------------------------------------------

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const dayBucket = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This week";
    return "Earlier";
  };

  const typeMeta = (type) => {
    switch (type) {
      case "match_request":
        return {
          icon: "🤝",
          accent: "#E7A93D",
          category: "matches",
          label: "New match request",
        };
      case "match_accepted":
        return {
          icon: "✓",
          accent: "#15402B",
          category: "matches",
          label: "Match accepted",
        };
      case "match_declined":
        return {
          icon: "✕",
          accent: "#C33F26",
          category: "matches",
          label: "Match declined",
        };
      case "profile_view":
        return {
          icon: "👁",
          accent: "#E7A93D",
          category: "matches",
          label: "Profile activity",
        };
      case "verification":
        return {
          icon: "🛡",
          accent: "#15402B",
          category: "system",
          label: "Verification update",
        };
      default:
        return {
          icon: "🔔",
          accent: "#8A8371",
          category: "system",
          label: "Platform update",
        };
    }
  };

  // --- derived data ----------------------------------------------------

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") return !n.read;
      if (filter === "matches") return typeMeta(n.type).category === "matches";
      if (filter === "system") return typeMeta(n.type).category === "system";
      return true;
    });
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const groups = { Today: [], Yesterday: [], "This week": [], Earlier: [] };
    filtered.forEach((n) => {
      groups[dayBucket(n.created_at)].push(n);
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filtered]);

  const filters = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount ? ` (${unreadCount})` : ""}` },
    { key: "matches", label: "Matches" },
    { key: "system", label: "System" },
  ];

  return (
    <div className="nf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .nf-root * { box-sizing: border-box; }
        .nf-root { font-family: 'Sora', sans-serif; color: #14110D; }

        .nf-hero {
          position: relative;
          overflow: hidden;
          background: #15402B;
          padding: 56px 8% 44px;
        }
        .nf-hero-pattern {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px),
            repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px);
          pointer-events: none;
        }
        .nf-hero-inner { position: relative; max-width: 820px; margin: 0 auto; color: #FBF6EA; }
        .nf-back-wrap { margin-bottom: 22px; }
        .nf-back-wrap :is(button, a) { color: #FBF6EA !important; }

        .nf-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #E7A93D;
          display: inline-block;
          margin-bottom: 16px;
        }
        .nf-title-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
        }
        .nf-title {
          font-family: 'Fraunces', serif; font-weight: 700;
          font-size: clamp(30px, 4vw, 44px); line-height: 1.1; margin: 0;
        }
        .nf-mark-all {
          font-family: 'Sora', sans-serif; font-weight: 600; font-size: 14px;
          background: transparent; border: 1.5px solid #FBF6EA; color: #FBF6EA;
          padding: 10px 20px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s ease;
        }
        .nf-mark-all:hover { background: rgba(251,246,234,0.1); }
        .nf-subtitle { font-size: 16px; line-height: 1.7; color: #D9E5DC; margin: 14px 0 26px; }

        .nf-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .nf-tab {
          font-family: 'Sora', sans-serif; font-weight: 600; font-size: 13.5px;
          background: rgba(251,246,234,0.08); border: 1px solid rgba(251,246,234,0.2);
          color: #D9E5DC; padding: 8px 16px; border-radius: 999px; cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .nf-tab:hover { background: rgba(251,246,234,0.14); }
        .nf-tab.nf-tab-active {
          background: #E7A93D; border-color: #E7A93D; color: #14110D;
        }

        .nf-body { padding: 50px 8% 90px; background: #FBF6EA; }
        .nf-body-inner { max-width: 820px; margin: 0 auto; }

        .nf-error {
          background: #FBE3DB; color: #C33F26; padding: 14px 20px;
          border-radius: 10px; margin-bottom: 24px; font-weight: 600;
          display: flex; align-items: center; gap: 10px;
        }
        .nf-error-dot { width: 8px; height: 8px; border-radius: 50%; background: #C33F26; flex-shrink: 0; }

        .nf-empty {
          background: #FFFFFF; padding: 60px 40px; border-radius: 14px;
          text-align: center; border: 1px solid rgba(20,17,13,0.08);
        }
        .nf-empty-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(231,169,61,0.16);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px; font-size: 22px;
        }
        .nf-empty-title {
          font-family: 'Fraunces', serif; font-weight: 600; font-size: 21px;
          margin: 0 0 8px; color: #14110D;
        }
        .nf-empty-text { color: #55503F; margin: 0; font-size: 15px; }

        .nf-group { margin-bottom: 34px; }
        .nf-group:last-child { margin-bottom: 0; }
        .nf-group-label {
          font-family: 'Space Mono', monospace; font-size: 12px;
          letter-spacing: 1.5px; text-transform: uppercase; color: #B9832A;
          margin: 0 0 14px;
        }

        .nf-list { display: flex; flex-direction: column; gap: 12px; }
        .nf-item {
          display: flex; align-items: flex-start; gap: 16px;
          background: #FFFFFF; border-radius: 12px; padding: 20px 22px;
          border: 1px solid rgba(20,17,13,0.08);
          border-left: 4px solid var(--accent, #E7A93D);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .nf-item:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(20,17,13,0.08); }
        .nf-item.nf-unread { background: #FFFEFB; }

        .nf-avatar {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--accent, #E7A93D) 16%, white);
          color: var(--accent, #E7A93D);
          font-size: 17px; font-weight: 700;
          font-family: 'Space Mono', monospace;
        }
        .nf-content { flex: 1; min-width: 0; }
        .nf-category {
          font-family: 'Space Mono', monospace; font-size: 11px;
          letter-spacing: 0.6px; text-transform: uppercase;
          color: var(--accent, #E7A93D); margin: 0 0 4px; font-weight: 700;
        }
        .nf-message { margin: 0 0 6px; font-size: 15px; line-height: 1.6; color: #14110D; }
        .nf-item.nf-unread .nf-message { font-weight: 600; }
        .nf-meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .nf-time {
          font-family: 'Space Mono', monospace; font-size: 12px;
          color: #8A8371; letter-spacing: 0.3px;
        }
        .nf-sender {
          font-size: 13px; color: #55503F;
        }
        .nf-sender strong { color: #14110D; }
        .nf-cta {
          font-size: 13px; font-weight: 700; color: var(--accent, #15402B);
        }

        .nf-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .nf-dot { width: 8px; height: 8px; border-radius: 50%; background: #C33F26; }
        .nf-mark-btn {
          font-family: 'Sora', sans-serif; font-size: 12.5px; font-weight: 600;
          background: transparent; border: none; color: #15402B;
          cursor: pointer; padding: 0; text-decoration: underline;
          text-underline-offset: 3px; white-space: nowrap;
        }
        .nf-mark-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .nf-loading {
          text-align: center; padding: 100px 20px;
          font-family: 'Fraunces', serif; color: #14110D; font-size: 20px;
        }

        @media (max-width: 700px) {
          .nf-hero { padding: 44px 6% 36px; }
          .nf-item { flex-wrap: wrap; }
          .nf-side { flex-direction: row; align-items: center; margin-left: 58px; }
        }
      `}</style>

      <section className="nf-hero">
        <div className="nf-hero-pattern" />
        <div className="nf-hero-inner">
          <div className="nf-back-wrap">
            <BackButton />
          </div>
          <span className="nf-eyebrow">Stay in the loop</span>
          <div className="nf-title-row">
            <h1 className="nf-title">Notifications</h1>
            {unreadCount > 0 && (
              <button className="nf-mark-all" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          <p className="nf-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
              : "You're all caught up."}
          </p>

          <div className="nf-tabs">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`nf-tab${filter === f.key ? " nf-tab-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="nf-body">
        <div className="nf-body-inner">
          {loading ? (
            <div className="nf-loading">Loading notifications…</div>
          ) : (
            <>
              {error ? (
                <div className="nf-error">
                  <span className="nf-error-dot" />
                  {error}
                </div>
              ) : null}

              {!error && filtered.length === 0 ? (
                <div className="nf-empty">
                  <div className="nf-empty-icon">🔔</div>
                  <h2 className="nf-empty-title">
                    {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
                  </h2>
                  <p className="nf-empty-text">
                    Matchmaking updates and account activity will show up here.
                  </p>
                </div>
              ) : (
                grouped.map(([label, items]) => (
                  <div key={label} className="nf-group">
                    <p className="nf-group-label">{label}</p>
                    <div className="nf-list">
                      {items.map((n) => {
                        const meta = typeMeta(n.type);
                        return (
                          <div
                            key={n.id}
                            className={`nf-item${!n.read ? " nf-unread" : ""}`}
                            style={{ "--accent": meta.accent }}
                            onClick={() => handleOpen(n)}
                          >
                            <div className="nf-avatar">{meta.icon}</div>
                            <div className="nf-content">
                              <p className="nf-category">{meta.label}</p>
                              <p className="nf-message">{n.message}</p>
                              <div className="nf-meta-row">
                                <span className="nf-time">{timeAgo(n.created_at)}</span>
                                {n.sender_name && (
                                  <span className="nf-sender">
                                    from <strong>{n.sender_name}</strong>
                                  </span>
                                )}
                                {n.action_url && (
                                  <span className="nf-cta">View details →</span>
                                )}
                              </div>
                            </div>
                            <div className="nf-side">
                              {!n.read && <span className="nf-dot" aria-label="Unread" />}
                              {!n.read && (
                                <button
                                  className="nf-mark-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.id);
                                  }}
                                  disabled={markingId === n.id}
                                >
                                  {markingId === n.id ? "…" : "Mark read"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Notifications;
