import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const relativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function RecentActivity() {
  const [state, setState] = useState({ loading: true, items: [], failed: false });

  useEffect(() => {
    let active = true;
    api.get("/notifications")
      .then(({ data }) => {
        if (active) setState({ loading: false, items: (data.data || []).slice(0, 4), failed: false });
      })
      .catch(() => {
        if (active) setState({ loading: false, items: [], failed: true });
      });
    return () => { active = false; };
  }, []);

  const markRead = (item) => {
    if (!item.read) api.patch(`/notifications/${item.id}/read`)
      .then(() => window.dispatchEvent(new Event("investor-mtaani:notifications-changed")))
      .catch(() => {});
  };

  return <div style={{ display: "grid", gap: 8 }}>
    {state.loading ? <p role="status" style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Loading your latest updates…</p>
      : state.failed ? <p role="status" style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Activity is temporarily unavailable. <Link to="/notifications" style={{ color: "#75e6d5" }}>Open notifications</Link></p>
        : state.items.length ? state.items.map((item) => <Link key={item.id} to={item.action_url || "/notifications"} onClick={() => markRead(item)} style={{ display: "grid", gridTemplateColumns: "8px minmax(0,1fr) auto", alignItems: "center", gap: 11, padding: "12px 14px", border: "1px solid rgba(148,163,184,.13)", borderRadius: 10, background: item.read ? "rgba(14,22,38,.72)" : "rgba(73,221,202,.055)", color: "inherit", textDecoration: "none" }}>
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: item.read ? "#536175" : "#49ddca", boxShadow: item.read ? "none" : "0 0 12px rgba(73,221,202,.55)" }} />
          <span style={{ minWidth: 0 }}><strong style={{ display: "block", color: item.read ? "#b9c6d5" : "#e7edf5", fontSize: 13, lineHeight: 1.4 }}>{item.message}</strong></span>
          <time dateTime={item.created_at} style={{ color: "#718096", fontSize: 10, whiteSpace: "nowrap" }}>{relativeTime(item.created_at)}</time>
        </Link>)
          : <div style={{ padding: "18px 14px", border: "1px dashed rgba(148,163,184,.2)", borderRadius: 10 }}><p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: 13 }}>No recent activity yet. Your introduction and account updates will appear here.</p><Link to="/browse" style={{ color: "#75e6d5", fontSize: 12, fontWeight: 700 }}>Explore opportunities →</Link></div>}
    <Link to="/notifications" style={{ display: "inline-flex", minHeight: 44, alignItems: "center", color: "#75e6d5", fontSize: 12, fontWeight: 700 }}>View all notifications →</Link>
  </div>;
}
