import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Funding() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const [form, setForm] = useState({
    amount_requested: "",
    funding_type: "",
    funding_reason: "",
    expected_impact: "",
    funding_timeline: "",
  });

  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundingRequests();
  }, [role]);

  const fetchFundingRequests = async () => {
    try {
      setLoading(true);

      // Businesses see their own requests
      if (role === "business") {
        const response = await api.get("/funding/me");
        setRequests(response.data.data || []);
        return;
      }

      // Investors and public visitors see open opportunities
      const response = await api.get("/funding");
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching funding requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role !== "business") {
      alert("Only business accounts can request funding.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/funding", {
        ...form,
        amount_requested: Number(form.amount_requested),
      });

      alert("Funding request created successfully!");

      setForm({
        amount_requested: "",
        funding_type: "",
        funding_reason: "",
        expected_impact: "",
        funding_timeline: "",
      });

      await fetchFundingRequests();
    } catch (error) {
      console.error("Funding request error:", error);

      alert(
        error.response?.data?.message ||
          "Could not create funding request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const Corners = () => (
    <>
      <span className="im-corner im-corner-tl" />
      <span className="im-corner im-corner-tr" />
      <span className="im-corner im-corner-bl" />
      <span className="im-corner im-corner-br" />
    </>
  );

  // BUSINESS VIEW
  if (role === "business") {
    return (
      <>
        <GlobalStyles />

        <div className="im-fund-page">
          <div className="im-grid-bg" />
          <div className="im-glow" />

          <div className="im-fund-inner">
            <div className="im-fund-header">
              <div className="im-status">
                <span className="im-dot" />
                business funding
              </div>

              <div className="im-scan-wrap">
                <div className="im-scanline" />
                <h1 className="im-fund-title">Request funding</h1>
                <p className="im-fund-subtitle">
                  Tell investors how much capital your business needs,
                  why you need it, and what the investment will help
                  you achieve.
                </p>
              </div>
            </div>

            <div className="im-fund-layout">
              <form onSubmit={handleSubmit} className="im-panel im-form-card">
                <Corners />

                <h2 className="im-card-title">Create funding request</h2>

                <label className="im-label">
                  Amount requested
                  <div className="im-money-input">
                    <span className="im-currency">KES</span>
                    <input
                      name="amount_requested"
                      type="number"
                      min="1"
                      placeholder="2500000"
                      value={form.amount_requested}
                      onChange={handleChange}
                      className="im-money-field"
                      required
                    />
                  </div>
                </label>

                <label className="im-label">
                  Funding type
                  <select
                    name="funding_type"
                    value={form.funding_type}
                    onChange={handleChange}
                    className="im-select"
                    required
                  >
                    <option value="">Select funding type</option>
                    <option value="Equity Investment">Equity Investment</option>
                    <option value="Debt / Loan">Debt / Loan</option>
                    <option value="Revenue Share">Revenue Share</option>
                    <option value="Strategic Partnership">
                      Strategic Partnership
                    </option>
                  </select>
                </label>

                <label className="im-label">
                  What will the funding be used for?
                  <textarea
                    name="funding_reason"
                    placeholder="Explain exactly how the capital will be used..."
                    value={form.funding_reason}
                    onChange={handleChange}
                    className="im-textarea"
                    required
                  />
                </label>

                <label className="im-label">
                  Expected impact
                  <textarea
                    name="expected_impact"
                    placeholder="Example: Increase production, hire employees and expand into new markets."
                    value={form.expected_impact}
                    onChange={handleChange}
                    className="im-textarea"
                  />
                </label>

                <label className="im-label">
                  Funding timeline
                  <select
                    name="funding_timeline"
                    value={form.funding_timeline}
                    onChange={handleChange}
                    className="im-select"
                  >
                    <option value="">Select timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="Within 3 months">Within 3 months</option>
                    <option value="Within 6 months">Within 6 months</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="im-submit-btn"
                >
                  {submitting ? "Submitting request…" : "Submit funding request"}
                </button>
              </form>

              <aside className="im-sidebar">
                <div className="im-info-card">
                  <span className="im-info-tag">funding story</span>
                  <h2 className="im-info-title">Make the ask clear.</h2>
                  <p className="im-info-text">
                    Investors should quickly understand how much
                    you need, where the money will go, and what
                    growth the investment could unlock.
                  </p>
                </div>

                <div className="im-panel im-requests-card">
                  <Corners />
                  <h3 className="im-requests-title">Your funding requests</h3>

                  {loading ? (
                    <p className="im-muted">Loading…</p>
                  ) : requests.length === 0 ? (
                    <p className="im-muted">
                      You have not created a funding request yet.
                    </p>
                  ) : (
                    requests.map((request) => (
                      <div key={request.id} className="im-request-item">
                        <strong className="im-request-amount">
                          {formatMoney(request.amount_requested)}
                        </strong>
                        <span className="im-request-type">
                          {request.funding_type}
                        </span>
                        <span className="im-request-status">
                          {request.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </>
    );
  }

  // INVESTOR / PUBLIC VIEW
  return (
    <>
      <GlobalStyles />

      <div className="im-fund-page">
        <div className="im-grid-bg" />
        <div className="im-glow" />

        <div className="im-fund-inner">
          <div className="im-fund-header">
            <div className="im-status">
              <span className="im-dot" />
              investment opportunities
            </div>

            <div className="im-scan-wrap">
              <div className="im-scanline" />
              <h1 className="im-fund-title">Businesses seeking funding</h1>
              <p className="im-fund-subtitle">
                Discover businesses looking for capital,
                strategic partners and investors.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="im-panel im-message-card">
              <Corners />
              <span className="im-dot" />
              Loading opportunities<span className="im-cursor">_</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="im-panel im-message-card">
              <Corners />
              <h2 className="im-message-title">No open funding opportunities yet</h2>
              <p className="im-muted">
                New business funding requests will appear here.
              </p>
            </div>
          ) : (
            <div className="im-opportunities-grid">
              {requests.map((request) => (
                <div key={request.id} className="im-panel im-opportunity-card">
                  <Corners />

                  <div className="im-opportunity-top">
                    <span className="im-chip im-chip-violet">
                      {request.industry || "Business"}
                    </span>
                    <span className="im-chip im-chip-cyan">
                      {request.status || "open"}
                    </span>
                  </div>

                  <h2 className="im-business-name">{request.business_name}</h2>
                  <p className="im-location">
                    {request.location || "Location not set"}
                  </p>

                  <div className="im-amount-box">
                    <span className="im-amount-label">funding request</span>
                    <strong className="im-big-amount">
                      {formatMoney(request.amount_requested)}
                    </strong>
                  </div>

                  <div className="im-opportunity-details">
                    <div className="im-stat">
                      <span className="im-stat-value">{request.funding_type}</span>
                      <span className="im-stat-label">funding type</span>
                    </div>
                    <div className="im-stat">
                      <span className="im-stat-value">
                        {request.funding_timeline || "Not specified"}
                      </span>
                      <span className="im-stat-label">timeline</span>
                    </div>
                  </div>

                  <h3 className="im-reason-title">Use of funds</h3>
                  <p className="im-reason">{request.funding_reason}</p>

                  {request.expected_impact && (
                    <>
                      <h3 className="im-reason-title">Expected impact</h3>
                      <p className="im-reason">{request.expected_impact}</p>
                    </>
                  )}

                  {role === "investor" ? (
                    <button
                      className="im-btn im-btn-block"
                      onClick={() => navigate(`/business/${request.business_id}`)}
                    >
                      View business
                    </button>
                  ) : (
                    <button
                      className="im-btn im-btn-block"
                      onClick={() => navigate("/login")}
                    >
                      Login to explore
                    </button>
                  )}
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

      .im-fund-page {
        --void: #060911;
        --panel: #0e1626;
        --panel-alt: #0b1220;
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
        padding: 56px 24px 100px;
      }

      .im-grid-bg {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(61, 214, 245, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(61, 214, 245, 0.06) 1px, transparent 1px);
        background-size: 46px 46px;
        -webkit-mask-image: radial-gradient(circle at 50% 0%, black, transparent 72%);
        mask-image: radial-gradient(circle at 50% 0%, black, transparent 72%);
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

      .im-fund-inner {
        position: relative;
        max-width: 1100px;
        margin: 0 auto;
      }

      .im-fund-header {
        max-width: 700px;
        margin-bottom: 40px;
      }

      .im-status {
        display: inline-flex;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--muted);
        margin-bottom: 16px;
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

      .im-scan-wrap {
        position: relative;
        overflow: hidden;
      }
      .im-scanline {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(90deg, var(--cyan), transparent 80%);
        animation: im-scan 1.6s ease-out 1 forwards;
      }
      @keyframes im-scan {
        0% { transform: translateY(0); opacity: 0; }
        12% { opacity: 0.9; }
        100% { transform: translateY(130px); opacity: 0; }
      }

      .im-fund-title {
        font-weight: 700;
        font-size: clamp(28px, 4vw, 38px);
        line-height: 1.15;
        margin: 0 0 12px;
      }

      .im-fund-subtitle {
        color: var(--muted);
        font-size: 15.5px;
        line-height: 1.7;
        margin: 0;
      }

      .im-fund-layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
        gap: 26px;
        align-items: start;
      }

      .im-panel {
        position: relative;
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: 4px;
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

      .im-form-card {
        padding: 30px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .im-card-title {
        margin: 0 0 4px;
        font-weight: 600;
        font-size: 19px;
      }

      .im-label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        color: var(--muted);
        text-align: left;
      }

      .im-input,
      .im-select,
      .im-textarea {
        padding: 13px 14px;
        border: 1px solid var(--panel-border);
        border-radius: 3px;
        background: var(--panel-alt);
        color: var(--text);
        font-size: 14.5px;
        font-family: 'Space Grotesk', sans-serif;
      }

      .im-select {
        padding: 13px 14px;
      }

      .im-textarea {
        min-height: 110px;
        resize: vertical;
      }

      .im-select:focus,
      .im-textarea:focus {
        outline: none;
        border-color: var(--cyan);
        box-shadow: 0 0 0 3px rgba(61, 214, 245, 0.18);
      }

      .im-money-input {
        display: flex;
        border: 1px solid var(--panel-border);
        border-radius: 3px;
        overflow: hidden;
        background: var(--panel-alt);
      }

      .im-currency {
        display: flex;
        align-items: center;
        padding: 0 16px;
        background: rgba(61, 214, 245, 0.1);
        color: var(--cyan);
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
      }

      .im-money-field {
        flex: 1;
        padding: 15px;
        border: none;
        outline: none;
        background: transparent;
        font-size: 17px;
        font-weight: 600;
        color: var(--text);
        font-family: 'JetBrains Mono', monospace;
      }

      .im-money-field:focus {
        box-shadow: none;
      }

      .im-money-input:has(.im-money-field:focus) {
        border-color: var(--cyan);
        box-shadow: 0 0 0 3px rgba(61, 214, 245, 0.18);
      }

      .im-submit-btn {
        background: var(--cyan);
        color: #06111a;
        border: none;
        border-radius: 3px;
        padding: 15px;
        font-size: 14.5px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: opacity 0.2s ease;
      }

      .im-submit-btn:hover {
        opacity: 0.88;
      }

      .im-submit-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .im-sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .im-info-card {
        background: rgba(139, 124, 246, 0.08);
        border: 1px solid rgba(139, 124, 246, 0.3);
        border-radius: 4px;
        padding: 26px;
      }

      .im-info-tag {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: var(--violet);
      }

      .im-info-title {
        margin: 14px 0;
        font-weight: 600;
        font-size: 18px;
      }

      .im-info-text {
        color: var(--muted);
        line-height: 1.7;
        font-size: 14px;
        margin: 0;
      }

      .im-requests-card {
        padding: 24px;
      }

      .im-requests-title {
        margin: 0 0 6px;
        font-weight: 600;
        font-size: 16px;
      }

      .im-request-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 16px 0;
        border-bottom: 1px solid var(--panel-border);
      }
      .im-request-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .im-request-amount {
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px;
        color: var(--cyan);
        font-weight: 600;
      }

      .im-request-type {
        color: var(--muted);
        font-size: 13.5px;
      }

      .im-request-status {
        font-family: 'JetBrains Mono', monospace;
        color: var(--text);
        font-size: 11.5px;
      }

      .im-muted {
        color: var(--muted);
        line-height: 1.6;
        margin: 0;
      }

      .im-opportunities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 22px;
      }

      .im-opportunity-card {
        padding: 28px;
      }

      .im-opportunity-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .im-chip {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
        padding: 6px 12px;
        border-radius: 3px;
      }
      .im-chip-violet {
        color: var(--violet);
        background: rgba(139, 124, 246, 0.12);
        border: 1px solid rgba(139, 124, 246, 0.35);
      }
      .im-chip-cyan {
        color: var(--cyan);
        background: rgba(61, 214, 245, 0.1);
        border: 1px solid rgba(61, 214, 245, 0.3);
      }

      .im-business-name {
        margin: 20px 0 6px;
        font-weight: 600;
        font-size: 19px;
      }

      .im-location {
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 12.5px;
        margin: 0;
      }

      .im-amount-box {
        background: var(--panel-alt);
        border: 1px solid var(--panel-border);
        border-radius: 4px;
        padding: 18px;
        margin: 22px 0;
      }

      .im-amount-label {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: var(--muted);
        margin-bottom: 8px;
      }

      .im-big-amount {
        font-family: 'JetBrains Mono', monospace;
        font-size: 23px;
        color: var(--cyan);
      }

      .im-opportunity-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        border-top: 1px solid var(--panel-border);
        border-bottom: 1px solid var(--panel-border);
        padding: 16px 0;
        margin-bottom: 22px;
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
        color: var(--text);
      }
      .im-stat-label {
        font-size: 11.5px;
        color: var(--muted);
      }

      .im-reason-title {
        font-size: 14px;
        font-weight: 600;
        margin: 20px 0 8px;
      }

      .im-reason {
        color: var(--muted);
        line-height: 1.7;
        font-size: 14px;
        margin: 0;
      }

      .im-btn {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        color: var(--cyan);
        background: transparent;
        border: 1px solid rgba(61, 214, 245, 0.4);
        padding: 13px 18px;
        border-radius: 3px;
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .im-btn:hover {
        background: var(--cyan);
        color: #06111a;
      }
      .im-btn-block {
        width: 100%;
        margin-top: 22px;
      }

      .im-message-card {
        padding: 50px;
        text-align: center;
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
      }

      .im-message-title {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 600;
        margin: 0 0 10px;
        color: var(--text);
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

      @media (max-width: 860px) {
        .im-fund-layout {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

function formatMoney(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
}

export default Funding;
