import { Link } from "react-router-dom";
import useSavedBusinesses from "../hooks/useSavedBusinesses";

function formatKES(value) {
  const amount = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return "Not disclosed";
  return `KES ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function Watchlist() {
  const { savedBusinesses, removeSaved } = useSavedBusinesses();

  return <main className="im-watchlist-page">
    <style>{`
      .im-watchlist-page { min-height:75vh; padding:38px clamp(16px,4vw,52px) 100px; color:#e7edf5; background:radial-gradient(ellipse at 12% 0%,rgba(73,221,202,.08),transparent 38rem),#080d17; }
      .im-watchlist-shell { max-width:1160px; margin:0 auto; }
      .im-watchlist-eyebrow { color:#49ddca; font:700 10px 'JetBrains Mono',monospace; letter-spacing:.14em; }
      .im-watchlist-head { display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:18px; margin:16px 0 24px; }
      .im-watchlist-head h1 { margin:0 0 8px; font-size:clamp(28px,5vw,42px); }
      .im-watchlist-head p { max-width:620px; margin:0; color:#94a3b8; line-height:1.6; }
      .im-watchlist-count { min-width:92px; padding:14px 17px; border:1px solid rgba(73,221,202,.2); border-radius:12px; background:rgba(73,221,202,.06); color:#9cf1e4; text-align:center; font:700 22px 'JetBrains Mono',monospace; }
      .im-watchlist-count small { display:block; margin-top:3px; color:#8292a7; font:600 9px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-watchlist-note { margin:0 0 18px; color:#8292a7; font-size:12px; }
      .im-watchlist-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:16px; }
      .im-watchlist-card { display:flex; min-width:0; flex-direction:column; padding:20px; border:1px solid rgba(148,163,184,.15); border-radius:15px; background:linear-gradient(145deg,rgba(17,28,47,.96),rgba(10,18,31,.98)); box-shadow:0 14px 38px rgba(0,0,0,.22); }
      .im-watchlist-card-top { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .im-watchlist-sector { color:#f1c75b; font:700 9px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-watchlist-card h2 { margin:14px 0 6px; font-size:19px; overflow-wrap:anywhere; }
      .im-watchlist-location { color:#94a3b8; font-size:12px; }
      .im-watchlist-description { flex:1; margin:14px 0; color:#aeb9c9; font-size:13px; line-height:1.6; }
      .im-watchlist-funding { padding:12px 0; border-top:1px solid rgba(148,163,184,.12); color:#8292a7; font:600 9px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-watchlist-funding strong { display:block; margin-top:6px; color:#75e6d5; font:700 16px 'Space Grotesk',sans-serif; letter-spacing:0; }
      .im-watchlist-actions { display:flex; gap:9px; margin-top:12px; }
      .im-watchlist-actions a,.im-watchlist-actions button,.im-watchlist-primary { display:inline-flex; min-height:44px; align-items:center; justify-content:center; padding:0 13px; border:1px solid rgba(73,221,202,.28); border-radius:8px; background:rgba(73,221,202,.08); color:#9cf1e4; font:700 11px 'JetBrains Mono',monospace; text-decoration:none; cursor:pointer; }
      .im-watchlist-actions a { flex:1; }
      .im-watchlist-actions button { border-color:rgba(148,163,184,.2); background:transparent; color:#aeb9c9; }
      .im-watchlist-empty { padding:34px 20px; border:1px dashed rgba(148,163,184,.25); border-radius:16px; text-align:center; }
      .im-watchlist-empty h2 { margin:0 0 8px; }
      .im-watchlist-empty p { max-width:520px; margin:0 auto 18px; color:#94a3b8; line-height:1.6; }
      @media(max-width:520px) { .im-watchlist-page { padding-top:26px; } .im-watchlist-count { min-width:78px; padding:10px 12px; } .im-watchlist-actions { flex-direction:column; } }
    `}</style>
    <div className="im-watchlist-shell">
      <span className="im-watchlist-eyebrow">INVESTOR WORKSPACE / SHORTLIST</span>
      <header className="im-watchlist-head">
        <div><h1>Saved opportunities</h1><p>Keep interesting businesses together while you explore the marketplace. Compare up to three from the Browse page.</p></div>
        <div className="im-watchlist-count" aria-label={`${savedBusinesses.length} saved opportunities`}>{savedBusinesses.length}<small>SAVED</small></div>
      </header>
      <p className="im-watchlist-note">Your shortlist is saved in this browser and is not shared across devices.</p>
      {savedBusinesses.length === 0 ? <section className="im-watchlist-empty"><h2>Your shortlist is ready</h2><p>Save a business from the marketplace and it will appear here so you can return to it later.</p><Link className="im-watchlist-primary" to="/browse">Explore businesses →</Link></section>
        : <div className="im-watchlist-grid">{savedBusinesses.map((business) => <article className="im-watchlist-card" key={business.id}>
          <div className="im-watchlist-card-top"><span className="im-watchlist-sector">{business.industry || "BUSINESS"}</span><span aria-hidden="true" style={{ color:"#f1c75b" }}>★</span></div>
          <h2>{business.business_name || "Unnamed business"}</h2>
          <span className="im-watchlist-location">⌖ {business.location || "Location not disclosed"}</span>
          <p className="im-watchlist-description">{business.description || "Open this opportunity to review its published business details."}</p>
          <div className="im-watchlist-funding">FUNDING SOUGHT<strong>{formatKES(business.amount_seeking)}</strong></div>
          <div className="im-watchlist-actions"><Link to={`/business/${business.id}`}>View opportunity →</Link><button type="button" onClick={() => removeSaved(business.id)} aria-label={`Remove ${business.business_name || "business"} from saved opportunities`}>Remove</button></div>
        </article>)}</div>}
    </div>
  </main>;
}
