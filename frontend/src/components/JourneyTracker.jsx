import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";

export default function JourneyTracker() {
  const { user } = useAuthContext();
  const [data, setData] = useState({ loading: true, profile: null, kyc: null, matches: null, profileMissing: false, failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const business = user?.role === "business";
    const profilePath = business ? "/businesses/me" : "/investors/me";
    const matchPath = business ? "/matchmaking/business" : "/matchmaking/investor";
    Promise.allSettled([api.get(profilePath), api.get("/kyc/me"), api.get(matchPath)]).then((results) => {
      if (!active) return;
      const [profileResult, kycResult, matchResult] = results;
      setData({
        loading: false,
        profile: profileResult.status === "fulfilled" ? profileResult.value.data?.data : null,
        profileMissing: profileResult.status === "rejected" && profileResult.reason?.response?.status === 404,
        kyc: kycResult.status === "fulfilled" ? kycResult.value.data?.data?.[0] || null : null,
        matches: matchResult.status === "fulfilled" ? matchResult.value.data?.data || [] : null,
        failed: results.some((result) => result.status === "rejected" && result.reason?.response?.status !== 404),
      });
    });
    return () => { active = false; };
  }, [user?.role, attempt]);

  if (user?.role !== "business" && user?.role !== "investor") return null;
  const profileHref = user.role === "business" ? "/business-profile" : "/investor-profile";
  const profileCreate = user.role === "business" ? "/business/create" : "/investor/create";
  const kycStatus = data.kyc?.status;
  const profileStatus = data.profile?.verification_status || data.profile?.status;
  const cards = [
    { title: user.role === "business" ? "Business profile" : "Investor profile", done: Boolean(data.profile) && !["needs_changes", "rejected"].includes(String(profileStatus || "").toLowerCase()), status: data.profile ? (profileStatus ? String(profileStatus).replaceAll("_", " ") : "Profile created") : "Not started", action: data.profile ? "View profile" : "Create profile", to: data.profile ? profileHref : profileCreate },
    { title: "Identity verification", done: kycStatus === "approved", status: kycStatus ? String(kycStatus).replaceAll("_", " ") : "Not started", action: kycStatus === "pending" ? "View review" : "Continue verification", to: "/kyc" },
    { title: user.role === "business" ? "Investor interest" : "Business matches", done: Array.isArray(data.matches) && data.matches.length > 0, status: data.matches === null ? "Status unavailable" : `${data.matches.length} ${data.matches.length === 1 ? "connection" : "connections"}`, action: "View introductions", to: "/matchmaking" },
  ];
  const setupCards = cards.slice(0, 2);
  const completedCount = setupCards.filter((card) => card.done).length;
  const progress = data.failed ? null : Math.round((completedCount / setupCards.length) * 100);
  const nextCard = data.failed ? null : setupCards.find((card) => !card.done && card.status !== "Status unavailable");

  return <section aria-labelledby="im-journey-title" style={{ margin: "0 auto", padding: "10px 8% 20px", maxWidth: 1220 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
      <div><h2 id="im-journey-title" style={{ margin: "0 0 4px", fontSize: 20 }}>Your progress</h2><p style={{ margin: 0, color: "#7c8aa0", fontSize: 13 }}>See what’s complete and pick up where you left off.</p></div>
      {data.failed && <button onClick={() => setAttempt((n) => n + 1)} type="button" style={{ minHeight: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #334155", background: "#0e1626", color: "#9ceee0", cursor: "pointer" }}>Refresh status</button>}
    </div>
    {data.loading ? <p role="status" style={{ color: "#94a3b8" }}>Loading your progress…</p> : <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: "8px 14px", margin: "16px 0 14px" }}>
        {progress !== null ? <div role="progressbar" aria-label="Getting started progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{ height: 7, overflow: "hidden", borderRadius: 99, background: "rgba(148,163,184,.16)" }}>
          <span style={{ display: "block", width: `${progress}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#49ddca,#8b7cf6)", boxShadow: "0 0 18px rgba(73,221,202,.32)", transition: "width .35s ease" }} />
        </div> : <p role="status" style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>Progress temporarily unavailable</p>}
        <strong style={{ color: "#bceee7", fontSize: 12 }}>{progress === null ? "—" : `${completedCount} of ${setupCards.length} setup steps`}</strong>
        <p style={{ gridColumn: "1 / -1", margin: 0, color: "#94a3b8", fontSize: 12 }}>{nextCard ? `Up next: ${nextCard.title}` : progress === 100 ? "Your core setup is complete. Explore your introductions whenever you’re ready." : progress === null ? "Refresh to try again." : "Your next step will appear here."}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
      {cards.map((card) => <article key={card.title} style={{ minWidth: 0, padding: 17, border: "1px solid rgba(61,214,245,.16)", borderRadius: 10, background: "#0e1626" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong>{card.title}</strong><span aria-label={card.done ? "Complete" : "In progress"} style={{ color: card.done ? "#35d07f" : "#f1c75b" }}>{card.done ? "✓" : "•"}</span></div>
        <p style={{ margin: "8px 0 13px", color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{data.failed && card.status === "Not started" ? "Could not load status" : card.status}</p>
        <Link to={card.to} style={{ display: "inline-flex", minHeight: 44, alignItems: "center", color: "#3dd6f5", fontWeight: 700, fontSize: 13 }}>{card.action} →</Link>
      </article>)}
      </div>
    </>}
  </section>;
}
