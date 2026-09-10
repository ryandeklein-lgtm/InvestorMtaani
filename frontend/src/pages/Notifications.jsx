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
  const [filter, setFilter] = useState("all");

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
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setMarkingId(id);

    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error(
        "Error marking notification as read:",
        err
      );
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error(
        "Error marking all notifications as read:",
        err
      );
    }
  };

  const handleOpen = async (n) => {
    if (!n.read) {
      await markAsRead(n.id);
    }

    if (n.action_url) {
      navigate(n.action_url);
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs =
      Date.now() - new Date(dateStr).getTime();

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

    const startOfDay = (d) =>
      new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate()
      );

    const diffDays = Math.round(
      (startOfDay(now) - startOfDay(date)) / 86400000
    );

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return "This week";

    return "Earlier";
  };

  const typeMeta = (type) => {
    switch (type) {
      case "match_request":
        return {
          icon: "↗",
          accent: "#3DD6F5",
          category: "matches",
          label: "New match request",
        };

      case "match_accepted":
        return {
          icon: "✓",
          accent: "#35D07F",
          category: "matches",
          label: "Match accepted",
        };

      case "match_declined":
        return {
          icon: "×",
          accent: "#FF647C",
          category: "matches",
          label: "Match declined",
        };

      case "profile_view":
        return {
          icon: "◉",
          accent: "#8B7CF6",
          category: "matches",
          label: "Profile activity",
        };

      case "verification":
        return {
          icon: "✓",
          accent: "#35D07F",
          category: "system",
          label: "Verification update",
        };

      default:
        return {
          icon: "!",
          accent: "#7C8AA0",
          category: "system",
          label: "Platform update",
        };
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "unread") {
        return !n.read;
      }

      if (filter === "matches") {
        return (
          typeMeta(n.type).category === "matches"
        );
      }

      if (filter === "system") {
        return (
          typeMeta(n.type).category === "system"
        );
      }

      return true;
    });
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "This week": [],
      Earlier: [],
    };

    filtered.forEach((n) => {
      groups[dayBucket(n.created_at)].push(n);
    });

    return Object.entries(groups).filter(
      ([, items]) => items.length > 0
    );
  }, [filtered]);

  const filters = [
    {
      key: "all",
      label: "All",
    },
    {
      key: "unread",
      label: `Unread${unreadCount ? ` (${unreadCount})` : ""}`,
    },
    {
      key: "matches",
      label: "Matches",
    },
    {
      key: "system",
      label: "System",
    },
  ];

  return (
    <div className="notifications-page">
      <style>{`
        .notifications-page {
          min-height: 100vh;
          background: #060911;
          color: #E7EDF5;
          font-family: "Space Grotesk", sans-serif;
          position: relative;
          overflow: hidden;
        }

        .notifications-page *,
        .notifications-page *::before,
        .notifications-page *::after {
          box-sizing: border-box;
        }

        .notifications-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.22;
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
          background-size: 55px 55px;
        }

        .notifications-hero {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 82% 10%,
              rgba(139, 124, 246, 0.14),
              transparent 30%
            ),
            radial-gradient(
              circle at 12% 80%,
              rgba(61, 214, 245, 0.08),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #0E1626,
              #09111F 60%,
              #111C2F
            );
          border-bottom: 1px solid rgba(61, 214, 245, 0.14);
          padding: 38px 6% 34px;
        }

        .notifications-hero::after {
          content: "";
          position: absolute;
          left: 6%;
          right: 6%;
          bottom: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(61, 214, 245, 0.6),
              rgba(139, 124, 246, 0.6),
              transparent
            );
          box-shadow:
            0 0 18px rgba(61, 214, 245, 0.3);
        }

        .notifications-hero-pattern {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.25;
          background-image:
            linear-gradient(
              135deg,
              transparent 48%,
              rgba(61, 214, 245, 0.035) 49%,
              rgba(61, 214, 245, 0.035) 50%,
              transparent 51%
            );
          background-size: 35px 35px;
        }

        .notifications-hero-inner {
          position: relative;
          z-index: 1;
          width: min(1000px, 100%);
          margin: 0 auto;
        }

        .notifications-back {
          margin-bottom: 25px;
        }

        .notifications-back :is(button, a) {
          color: #7C8AA0 !important;
        }

        .notifications-back :is(button, a):hover {
          color: #3DD6F5 !important;
        }

        .notifications-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #3DD6F5;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.7px;
          text-transform: uppercase;
          margin-bottom: 13px;
        }

        .notifications-eyebrow::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #3DD6F5;
          box-shadow:
            0 0 10px rgba(61, 214, 245, 0.8);
        }

        .notifications-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .notifications-title {
          color: #E7EDF5;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1;
          letter-spacing: -1.5px;
          font-weight: 700;
          margin: 0;
        }

        .notifications-mark-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(61, 214, 245, 0.07);
          border: 1px solid rgba(61, 214, 245, 0.35);
          color: #6BE3FA;
          padding: 11px 17px;
          border-radius: 7px;
          cursor: pointer;
          font-family: "Space Grotesk", sans-serif;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .notifications-mark-all:hover {
          background: rgba(61, 214, 245, 0.13);
          border-color: #3DD6F5;
          box-shadow:
            0 0 22px rgba(61, 214, 245, 0.1);
        }

        .notifications-subtitle {
          color: #7C8AA0;
          font-size: 13px;
          line-height: 1.7;
          margin: 13px 0 23px;
        }

        .notifications-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .notifications-tab {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(124, 138, 160, 0.2);
          color: #7C8AA0;
          padding: 9px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notifications-tab:hover {
          color: #C8D3E1;
          border-color: rgba(61, 214, 245, 0.3);
        }

        .notifications-tab-active {
          background: rgba(61, 214, 245, 0.1);
          border-color: rgba(61, 214, 245, 0.5);
          color: #6BE3FA;
          box-shadow:
            inset 0 0 15px rgba(61, 214, 245, 0.04);
        }

        .notifications-body {
          position: relative;
          z-index: 1;
          padding: 42px 6% 90px;
        }

        .notifications-body-inner {
          width: min(1000px, 100%);
          margin: 0 auto;
        }

        .notifications-error {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 100, 124, 0.06);
          border: 1px solid rgba(255, 100, 124, 0.25);
          color: #FF8DA0;
          padding: 14px 17px;
          border-radius: 8px;
          margin-bottom: 25px;
          font-size: 12px;
        }

        .notifications-error-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #FF647C;
          box-shadow:
            0 0 9px rgba(255, 100, 124, 0.6);
        }

        .notifications-empty {
          position: relative;
          background:
            linear-gradient(
              145deg,
              rgba(14, 22, 38, 0.98),
              rgba(9, 17, 31, 0.98)
            );
          border: 1px solid rgba(61, 214, 245, 0.13);
          padding: 65px 40px;
          border-radius: 14px;
          text-align: center;
          box-shadow:
            0 18px 50px rgba(0, 0, 0, 0.2);
        }

        .notifications-empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 12px;
          background: rgba(61, 214, 245, 0.06);
          border: 1px solid rgba(61, 214, 245, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #3DD6F5;
          font-size: 20px;
          font-family: "JetBrains Mono", monospace;
          box-shadow:
            0 0 25px rgba(61, 214, 245, 0.08);
        }

        .notifications-empty-title {
          color: #E7EDF5;
          font-size: 21px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .notifications-empty-text {
          color: #58667A;
          margin: 0;
          font-size: 12px;
        }

        .notifications-group {
          margin-bottom: 34px;
        }

        .notifications-group:last-child {
          margin-bottom: 0;
        }

        .notifications-group-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #58667A;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 0 0 12px;
        }

        .notifications-group-label::after {
          content: "";
          height: 1px;
          flex: 1;
          background:
            linear-gradient(
              90deg,
              rgba(61, 214, 245, 0.15),
              transparent
            );
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .notifications-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          background:
            linear-gradient(
              145deg,
              rgba(14, 22, 38, 0.98),
              rgba(9, 17, 31, 0.98)
            );
          border: 1px solid rgba(124, 138, 160, 0.1);
          border-left: 2px solid var(--accent, #3DD6F5);
          border-radius: 10px;
          padding: 17px 18px;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .notifications-item:hover {
          transform: translateY(-2px);
          border-color: rgba(61, 214, 245, 0.22);
          border-left-color: var(--accent, #3DD6F5);
          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.22);
          background:
            linear-gradient(
              145deg,
              rgba(17, 28, 47, 0.98),
              rgba(10, 19, 34, 0.98)
            );
        }

        .notifications-item-unread {
          background:
            linear-gradient(
              145deg,
              rgba(17, 28, 47, 0.98),
              rgba(10, 20, 35, 0.98)
            );
        }

        .notifications-item-unread::after {
          content: "";
          position: absolute;
          left: 0;
          top: 15px;
          bottom: 15px;
          width: 1px;
          background: var(--accent, #3DD6F5);
          box-shadow:
            0 0 10px var(--accent, #3DD6F5);
        }

        .notifications-avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: color-mix(
            in srgb,
            var(--accent, #3DD6F5) 9%,
            #09111F
          );
          border: 1px solid color-mix(
            in srgb,
            var(--accent, #3DD6F5) 30%,
            transparent
          );
          color: var(--accent, #3DD6F5);
          font-size: 16px;
          font-weight: 700;
          font-family: "JetBrains Mono", monospace;
          box-shadow:
            inset 0 0 15px
              color-mix(
                in srgb,
                var(--accent, #3DD6F5) 5%,
                transparent
              );
        }

        .notifications-content {
          flex: 1;
          min-width: 0;
        }

        .notifications-category {
          color: var(--accent, #3DD6F5);
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin: 0 0 5px;
          font-weight: 700;
        }

        .notifications-message {
          margin: 0 0 7px;
          font-size: 13px;
          line-height: 1.6;
          color: #AAB6C7;
        }

        .notifications-item-unread
          .notifications-message {
          color: #E7EDF5;
          font-weight: 600;
        }

        .notifications-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .notifications-time {
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          color: #58667A;
          letter-spacing: 0.3px;
        }

        .notifications-sender {
          font-size: 11px;
          color: #58667A;
        }

        .notifications-sender strong {
          color: #8997AA;
        }

        .notifications-cta {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent, #3DD6F5);
        }

        .notifications-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }

        .notifications-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3DD6F5;
          box-shadow:
            0 0 10px rgba(61, 214, 245, 0.8);
        }

        .notifications-mark-btn {
          font-family: "Space Grotesk", sans-serif;
          font-size: 10px;
          font-weight: 600;
          background: transparent;
          border: none;
          color: #7C8AA0;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          white-space: nowrap;
        }

        .notifications-mark-btn:hover {
          color: #3DD6F5;
        }

        .notifications-mark-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notifications-loading {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #58667A;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .notifications-loading::before {
          content: "";
          width: 22px;
          height: 22px;
          margin-right: 13px;
          border-radius: 50%;
          border: 2px solid rgba(61, 214, 245, 0.12);
          border-top-color: #3DD6F5;
          animation: notificationSpin 0.8s linear infinite;
        }

        @keyframes notificationSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .notifications-hero {
            padding: 32px 5% 30px;
          }

          .notifications-body {
            padding: 32px 5% 70px;
          }

          .notifications-title-row {
            align-items: flex-start;
          }

          .notifications-mark-all {
            width: 100%;
          }

          .notifications-item {
            flex-wrap: wrap;
          }

          .notifications-side {
            flex-direction: row;
            align-items: center;
            margin-left: 57px;
            width: calc(100% - 57px);
          }

          .notifications-empty {
            padding: 50px 25px;
          }
        }

        @media (max-width: 480px) {
          .notifications-title {
            font-size: 34px;
          }

          .notifications-item {
            padding: 15px;
            gap: 12px;
          }

          .notifications-avatar {
            width: 38px;
            height: 38px;
          }

          .notifications-message {
            font-size: 12px;
          }
        }
      `}</style>

      <section className="notifications-hero">
        <div className="notifications-hero-pattern" />

        <div className="notifications-hero-inner">
          <div className="notifications-back">
            <BackButton />
          </div>

          <span className="notifications-eyebrow">
            Stay in the loop
          </span>

          <div className="notifications-title-row">
            <h1 className="notifications-title">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <button
                className="notifications-mark-all"
                onClick={markAllAsRead}
              >
                ✓ Mark all as read
              </button>
            )}
          </div>

          <p className="notifications-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }.`
              : "You're all caught up."}
          </p>

          <div className="notifications-tabs">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`notifications-tab${
                  filter === f.key
                    ? " notifications-tab-active"
                    : ""
                }`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="notifications-body">
        <div className="notifications-body-inner">
          {loading ? (
            <div className="notifications-loading">
              Loading notifications...
            </div>
          ) : (
            <>
              {error ? (
                <div className="notifications-error">
                  <span className="notifications-error-dot" />
                  {error}
                </div>
              ) : null}

              {!error && filtered.length === 0 ? (
                <div className="notifications-empty">
                  <div className="notifications-empty-icon">
                    🔔
                  </div>

                  <h2 className="notifications-empty-title">
                    {filter === "all"
                      ? "No notifications yet"
                      : `No ${filter} notifications`}
                  </h2>

                  <p className="notifications-empty-text">
                    Matchmaking updates and account activity
                    will show up here.
                  </p>
                </div>
              ) : (
                grouped.map(([label, items]) => (
                  <div
                    key={label}
                    className="notifications-group"
                  >
                    <p className="notifications-group-label">
                      {label}
                    </p>

                    <div className="notifications-list">
                      {items.map((n) => {
                        const meta = typeMeta(n.type);

                        return (
                          <div
                            key={n.id}
                            className={`notifications-item${
                              !n.read
                                ? " notifications-item-unread"
                                : ""
                            }`}
                            style={{
                              "--accent": meta.accent,
                            }}
                            onClick={() =>
                              handleOpen(n)
                            }
                          >
                            <div className="notifications-avatar">
                              {meta.icon}
                            </div>

                            <div className="notifications-content">
                              <p className="notifications-category">
                                {meta.label}
                              </p>

                              <p className="notifications-message">
                                {n.message}
                              </p>

                              <div className="notifications-meta">
                                <span className="notifications-time">
                                  {timeAgo(n.created_at)}
                                </span>

                                {n.sender_name && (
                                  <span className="notifications-sender">
                                    from{" "}
                                    <strong>
                                      {n.sender_name}
                                    </strong>
                                  </span>
                                )}

                                {n.action_url && (
                                  <span className="notifications-cta">
                                    View details →
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="notifications-side">
                              {!n.read && (
                                <span
                                  className="notifications-unread-dot"
                                  aria-label="Unread"
                                />
                              )}

                              {!n.read && (
                                <button
                                  className="notifications-mark-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.id);
                                  }}
                                  disabled={
                                    markingId === n.id
                                  }
                                >
                                  {markingId === n.id
                                    ? "..."
                                    : "Mark read"}
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