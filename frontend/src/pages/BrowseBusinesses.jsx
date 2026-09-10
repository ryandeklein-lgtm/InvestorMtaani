import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BrowseBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const selectedIndustry = searchParams.get("industry");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get("/businesses");

        console.log("Businesses API Response:", response.data);

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data.businesses)) {
          data = response.data.businesses;
        }

        setBusinesses(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = selectedIndustry
    ? businesses.filter(
        (business) =>
          business.industry &&
          business.industry.toLowerCase() === selectedIndustry.toLowerCase()
      )
    : businesses;

  if (loading) {
    return (
      <>
        <GlobalStyles />
        <div className="im-page">
          <div className="im-grid" />
          <div className="im-glow" />
          <div className="im-loading">
            <span className="im-dot" />
            Loading directory<span className="im-cursor">_</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />

      <div className="im-page">
        <div className="im-grid" />
        <div className="im-glow" />

        <div className="im-inner">
          <div className="im-topbar">
            <BackButton />
            <div className="im-status">
              <span className="im-dot" />
              {businesses.length} {businesses.length === 1 ? "business" : "businesses"} tracked
            </div>
          </div>

          <div className="im-hero">
            <div className="im-scanline" />
            <h1 className="im-title">
              {selectedIndustry ? `${selectedIndustry} businesses` : "Discover businesses"}
            </h1>
            <p className="im-subtitle">
              {selectedIndustry
                ? `Ventures raising capital in the ${selectedIndustry.toLowerCase()} sector.`
                : "Ventures across Kenya raising capital right now."}
            </p>
          </div>

          {selectedIndustry && (
            <div className="im-filter-row">
              <span className="im-chip">{selectedIndustry}</span>
              <Link to="/browse" className="im-clear">
                Clear filter
              </Link>
            </div>
          )}

          {filteredBusinesses.length === 0 ? (
            <div className="im-empty">
              <h2 className="im-empty-title">No records found</h2>
              <p className="im-empty-text">
                {selectedIndustry
                  ? `Nothing is listed under ${selectedIndustry} yet.`
                  : "No businesses are registered yet."}
              </p>
              <Link to="/browse" className="im-btn">
                Refresh
              </Link>
            </div>
          ) : (
            <div className="im-cards">
              {filteredBusinesses.map((business) => (
                <div key={business.id} className="im-card">
                  <span className="im-corner im-corner-tl" />
                  <span className="im-corner im-corner-tr" />
                  <span className="im-corner im-corner-bl" />
                  <span className="im-corner im-corner-br" />

                  <h2 className="im-card-title">
                    {business.business_name || "Unnamed business"}
                  </h2>
                  <p className="im-card-meta">{business.industry || "Uncategorized"}</p>
                  <p className="im-card-meta im-card-meta-muted">
                    {business.location || "Location unknown"}
                  </p>

                  <div className="im-stats">
                    <div className="im-stat">
                      <span className="im-stat-value">{business.employees || 0}</span>
                      <span className="im-stat-label">employees</span>
                    </div>
                    <div className="im-stat">
                      <span className="im-stat-value">
                        KES {Number(business.annual_revenue || 0).toLocaleString()}
                      </span>
                      <span className="im-stat-label">annual revenue</span>
                    </div>
                    <div className="im-stat">
                      <span className="im-stat-value">
                        {business.views || business.website_visitors || 0}
                      </span>
                      <span className="im-stat-label">views</span>
                    </div>
                  </div>

                  <Link to={`/business/${business.id}`} className="im-btn">
                    View business
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

      .im-page {
        --void: #060911;
        --panel: #0e1626;
        --panel-border: rgba(61, 214, 245, 0.16);
        --cyan: #3dd6f5;
        --violet: #8b7cf6;
        --text: #e7edf5;
        --muted: #7c8aa0;

        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: var(--void);
        color: var(--text);
        font-family: 'Space Grotesk', sans-serif;
        padding: 50px 40px 90px;
      }

      .im-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(61, 214, 245, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(61, 214, 245, 0.06) 1px, transparent 1px);
        background-size: 48px 48px;
        -webkit-mask-image: radial-gradient(circle at 50% 0%, black, transparent 75%);
        mask-image: radial-gradient(circle at 50% 0%, black, transparent 75%);
        pointer-events: none;
      }

      .im-glow {
        position: absolute;
        top: -220px;
        left: 50%;
        transform: translateX(-50%);
        width: 900px;
        height: 480px;
        background: radial-gradient(circle, rgba(61, 214, 245, 0.14), transparent 70%);
        pointer-events: none;
      }

      .im-inner {
        position: relative;
        max-width: 1180px;
        margin: 0 auto;
      }

      .im-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 34px;
      }

      .im-status {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--muted);
        display: flex;
        align-items: center;
      }

      .im-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--cyan);
        display: inline-block;
        margin-right: 9px;
        animation: im-pulse 2s infinite;
      }

      @keyframes im-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(61, 214, 245, 0.55); }
        50% { box-shadow: 0 0 0 5px rgba(61, 214, 245, 0); }
      }

      .im-hero {
        position: relative;
        max-width: 620px;
        overflow: hidden;
        padding-top: 4px;
        margin-bottom: 30px;
      }

      .im-scanline {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, var(--cyan), transparent 80%);
        animation: im-scan 1.6s ease-out 1 forwards;
      }

      @keyframes im-scan {
        0% { transform: translateY(0); opacity: 0; }
        12% { opacity: 0.9; }
        100% { transform: translateY(140px); opacity: 0; }
      }

      .im-title {
        font-weight: 700;
        font-size: clamp(28px, 4vw, 40px);
        line-height: 1.15;
        margin: 0 0 12px;
      }

      .im-subtitle {
        color: var(--muted);
        font-size: 15.5px;
        line-height: 1.6;
        margin: 0;
      }

      .im-filter-row {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
        margin-bottom: 36px;
      }

      .im-chip {
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--violet);
        background: rgba(139, 124, 246, 0.12);
        border: 1px solid rgba(139, 124, 246, 0.35);
        padding: 7px 14px;
        border-radius: 3px;
      }

      .im-clear {
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--muted);
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .im-clear:hover {
        color: var(--cyan);
      }

      .im-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 22px;
      }

      .im-card {
        position: relative;
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 4px;
        padding: 26px 24px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .im-card:hover {
        border-color: rgba(61, 214, 245, 0.5);
        box-shadow: 0 0 0 1px rgba(61, 214, 245, 0.2), 0 0 26px rgba(61, 214, 245, 0.12);
      }

      .im-corner {
        position: absolute;
        width: 13px;
        height: 13px;
        border-color: var(--cyan);
        opacity: 0.5;
      }

      .im-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
      .im-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
      .im-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
      .im-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

      .im-card-title {
        font-weight: 600;
        font-size: 19px;
        margin: 0 0 8px;
      }

      .im-card-meta {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--text);
        margin: 0 0 3px;
      }

      .im-card-meta-muted {
        color: var(--muted);
        margin-bottom: 18px;
      }

      .im-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        border-top: 1px solid var(--panel-border);
        border-bottom: 1px solid var(--panel-border);
        padding: 16px 0;
        margin-bottom: 20px;
      }

      .im-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .im-stat-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        font-weight: 600;
        color: var(--cyan);
        word-break: break-word;
      }

      .im-stat-label {
        font-size: 11.5px;
        color: var(--muted);
      }

      .im-btn {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--cyan);
        border: 1px solid rgba(61, 214, 245, 0.4);
        padding: 10px 18px;
        border-radius: 3px;
        text-decoration: none;
        transition: background 0.2s ease, color 0.2s ease;
      }

      .im-btn:hover {
        background: var(--cyan);
        color: #06111a;
      }

      .im-empty {
        max-width: 520px;
        margin: 40px auto;
        padding: 40px;
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 4px;
        text-align: center;
      }

      .im-empty-title {
        font-weight: 600;
        margin: 0 0 10px;
      }

      .im-empty-text {
        color: var(--muted);
        line-height: 1.7;
        margin: 0 0 22px;
      }

      .im-loading {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        color: var(--muted);
        font-size: 14px;
      }

      .im-cursor {
        color: var(--cyan);
        margin-left: 2px;
        animation: im-blink 1s step-end infinite;
      }

      @keyframes im-blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
    `}</style>
  );
}

export default BrowseBusinesses;
