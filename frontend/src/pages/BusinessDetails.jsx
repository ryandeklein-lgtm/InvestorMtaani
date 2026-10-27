import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";
import { useAuthContext } from "../contexts/AuthContext";
import CommunityFeed from "../components/CommunityFeed";

function BusinessDetails() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const requestKey = `${user?.id || user?.email || "anonymous"}:${id}`;

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [requestLookup, setRequestLookup] = useState({ key: null, value: null });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const existingRequest = requestLookup.key === requestKey ? requestLookup.value : null;
  const requestLoading = user?.role === "investor" && requestLookup.key !== requestKey;

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await api.get("/businesses/" + id);

        if (response.data && response.data.data) {
          setBusiness(response.data.data);
        } else {
          setBusiness(response.data);
        }
      } catch (error) {
        console.error("Error fetching business:", error);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBusiness();
  }, [id]);

  useEffect(() => {
    if (user?.role !== "investor") return undefined;
    let active = true;
    api.get("/matchmaking/investor")
      .then(({ data }) => {
        if (active) setRequestLookup({ key: requestKey, value: (data.data || []).find((request) => String(request.business_id) === String(id)) || null });
      })
      .catch(() => {
        if (active) setRequestLookup({ key: requestKey, value: null });
      });
    return () => { active = false; };
  }, [id, user?.role, requestKey]);

  async function handleRequestIntroduction() {
    try {
      setMatchLoading(true);
      setMessage("");
      setMessageType("success");

      const response = await api.post(
        "/matchmaking/business/" + id,
        {}
      );

      setRequestLookup({ key: requestKey, value: response.data?.data || { status: "pending", business_id: id } });

      setMessage(
        response.data?.message ||
          "Introduction request sent successfully."
      );
      setMessageType("success");
    } catch (error) {
      console.error("Introduction request error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to send the introduction request. Please try again."
      );
      setMessageType("error");
    } finally {
      setMatchLoading(false);
    }
  }

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-KE", {
      maximumFractionDigits: 0,
    });
  };

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  const getStructure = () => {
    const structure = getValue(
      business?.funding_structure,
      business?.investment_type,
      business?.funding_type,
      business?.structure
    );

    if (!structure) {
      return "Not specified";
    }

    const value = String(structure).toLowerCase();

    if (value.includes("equity")) {
      return "Equity";
    }

    if (
      value.includes("debt") ||
      value.includes("loan") ||
      value.includes("credit")
    ) {
      return "Debt / Credit";
    }

    return structure;
  };

  const getOperatingHistory = () => {
    const year = Number(
      getValue(
        business?.year_established,
        business?.founded,
        business?.established
      )
    );

    if (!year || year > new Date().getFullYear()) {
      return "Not specified";
    }

    const years = new Date().getFullYear() - year;

    if (years <= 0) {
      return "Less than 1 year";
    }

    return `${years} year${years === 1 ? "" : "s"}`;
  };

  const businessName =
    business?.business_name ||
    business?.name ||
    "Unnamed Business";

  const firstLetter =
    businessName.charAt(0).toUpperCase();

  const industry =
    getValue(
      business?.industry,
      business?.sector
    ) || "Industry not specified";

  const location =
    business?.location || "Location not specified";

  const description =
    business?.description ||
    business?.about ||
    "No business description has been provided.";

  const employees =
    getValue(
      business?.employees,
      business?.employee_count
    ) || 0;

  const founded =
    getValue(
      business?.year_established,
      business?.founded,
      business?.established
    ) || "N/A";

  const views =
    getValue(business?.views, business?.profile_views) || 0;

  const annualRevenue = Number(
    getValue(
      business?.annual_revenue,
      business?.yearly_revenue,
      business?.turnover
    ) || 0
  );

  const monthlyGross = Number(
    business?.monthly_gross || 0
  );

  const monthlyNet = Number(
    business?.monthly_net || 0
  );

  const amountSeeking = Number(
    getValue(
      business?.amount_seeking,
      business?.amount_requested,
      business?.funding_amount,
      business?.capital_required
    ) || 0
  );

  const fundingReason =
    getValue(
      business?.funding_reason,
      business?.use_of_funds,
      business?.funding_purpose
    ) || "Use of funds has not been specified.";

  const growthPlan =
    getValue(
      business?.growth_plan,
      business?.growth_plans,
      business?.growth_strategy,
      business?.expected_impact
    ) ||
    "Growth plans will be discussed during the due diligence and introduction process.";

  const structure = getStructure();
  const operatingHistory = getOperatingHistory();

  const isVerified =
    business?.verified === true ||
    business?.is_verified === true ||
    business?.verification_status === "verified" ||
    business?.status === "verified" ||
    business?.status === "approved" ||
    Boolean(business?.last_verified_at || business?.verification_date || business?.verified_at);

  const verificationDate = getValue(
    business?.last_verified_at,
    business?.verification_date,
    business?.verified_at
  );

  const verificationLabel = useMemo(() => {
    if (!verificationDate) {
      return "Verification status available";
    }

    const date = new Date(verificationDate);

    if (Number.isNaN(date.getTime())) {
      return "Verification status available";
    }

    return `Verified ${date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`;
  }, [verificationDate]);

  if (loading) {
    return (
      <div className="business-details-page">
        <style>{businessDetailsStyles}</style>

        <div className="business-details-loading">
          <div className="loading-spinner"></div>
          <p>LOADING OPPORTUNITY...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-details-page">
        <style>{businessDetailsStyles}</style>

        <div className="business-details-container">
          <div className="business-details-back">
            <BackButton />
          </div>

          <div className="business-details-empty">
            <div className="empty-icon">!</div>

            <h1>Opportunity Not Found</h1>

            <p>
              We couldn't find the business opportunity
              you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-details-page">
      <style>{businessDetailsStyles}</style>

      <div className="business-details-container">

        <div className="business-details-back">
          <BackButton />
        </div>

        <main className="business-details-card">

          <div className="business-details-top-line"></div>

          {/* HEADER */}

          <section className="opportunity-header">

            <div className="opportunity-logo">
              {firstLetter}
            </div>

            <div className="opportunity-heading">

              <div className="opportunity-eyebrow">
                INVESTMENT OPPORTUNITY
              </div>

              <h1>{businessName}</h1>

              <div className="opportunity-badges">

                {isVerified && (
                  <span className="verified-badge">
                    <span>✓</span>
                    Verified within review scope
                  </span>
                )}

                <span className="opportunity-id">
                  ID: IM-{id}
                </span>

              </div>

              <div className="opportunity-meta">

                <span>
                  <strong>SECTOR</strong>
                  {industry}
                </span>

                <span>
                  <strong>LOCATION</strong>
                  {location}
                </span>

              </div>

            </div>
          </section>

          <section className="opportunity-summary" aria-label="Funding summary">
            <div><span>CAPITAL SEEKING</span><strong>{amountSeeking > 0 ? `KES ${formatCurrency(amountSeeking)}` : "Not disclosed"}</strong></div>
            <div><span>PROPOSED STRUCTURE</span><strong>{structure}</strong></div>
            <a href="#opportunity-introduction">Explore introduction options <span aria-hidden="true">↓</span></a>
          </section>

          {/* TRUST STRIP */}

          <section className="trust-strip">

            <div className="trust-item">
              <span className="trust-icon">✓</span>

              <div>
                <strong>VERIFIED WITHIN REVIEW SCOPE</strong>
                <small>{verificationLabel}</small>
                <small>Based on information submitted by the business; not an audit or investment recommendation.</small>
              </div>
            </div>

            <div className="trust-item">
              <span className="trust-icon violet-icon">
                ◇
              </span>

              <div>
                <strong>OPERATING HISTORY</strong>
                <small>{operatingHistory}</small>
              </div>
            </div>

            <div className="trust-item">
              <span className="trust-icon green-icon">
                ◎
              </span>

              <div>
                <strong>TURNOVER</strong>
                <small>
                  KES {formatCurrency(annualRevenue)}
                </small>
              </div>
            </div>

            <div className="trust-item">
              <span className="trust-icon gold-icon">
                ◷
              </span>

              <div>
                <strong>PROFILE VIEWS</strong>
                <small>{views}</small>
              </div>
            </div>

          </section>

          <div className="business-details-divider"></div>

          {/* OVERVIEW */}

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                01
              </span>

              <div>
                <p>BUSINESS OVERVIEW</p>
                <h2>About the Business</h2>
              </div>
            </div>

            <div className="business-description-box">
              <p>{description}</p>
            </div>

            <div className="overview-grid">

              <div className="overview-item">
                <span>INDUSTRY</span>
                <strong>{industry}</strong>
              </div>

              <div className="overview-item">
                <span>LOCATION</span>
                <strong>{location}</strong>
              </div>

              <div className="overview-item">
                <span>ESTABLISHED</span>
                <strong>{founded}</strong>
              </div>

              <div className="overview-item">
                <span>EMPLOYEES</span>
                <strong>{employees}</strong>
              </div>

            </div>

          </section>

          {/* FINANCIALS */}

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                02
              </span>

              <div>
                <p>FINANCIAL PERFORMANCE</p>
                <h2>Business Financials</h2>
              </div>
            </div>

            <div className="financial-grid">

              <div className="financial-card violet-financial">
                <span>ANNUAL TURNOVER</span>

                <strong>
                  KES {formatCurrency(annualRevenue)}
                </strong>

                <small>
                  Reported business revenue
                </small>
              </div>

              <div className="financial-card cyan-financial">
                <span>MONTHLY GROSS</span>

                <strong>
                  KES {formatCurrency(monthlyGross)}
                </strong>

                <small>
                  Monthly gross income
                </small>
              </div>

              <div className="financial-card green-financial">
                <span>MONTHLY NET</span>

                <strong>
                  KES {formatCurrency(monthlyNet)}
                </strong>

                <small>
                  Monthly net income
                </small>
              </div>

            </div>

            <div className="financial-note">
              <span>i</span>

              <p>
                Financial information is subject to
                verification and due diligence. Investors
                should independently assess the information
                before making any investment decision.
              </p>
            </div>

          </section>

          {/* CAPITAL */}

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                03
              </span>

              <div>
                <p>CAPITAL REQUIREMENT</p>
                <h2>Funding Opportunity</h2>
              </div>
            </div>

            <div className="funding-request">

              <div className="funding-glow"></div>

              <div className="funding-content">

                <div className="funding-main">

                  <span className="funding-label">
                    CAPITAL SEEKING
                  </span>

                  <h2>
                    KES {formatCurrency(amountSeeking)}
                  </h2>

                </div>

                <div className="funding-structure">

                  <span>STRUCTURE</span>

                  <strong>
                    {structure}
                  </strong>

                </div>

              </div>

              <div className="funding-purpose">

                <span>USE OF FUNDS</span>

                <p>{fundingReason}</p>

              </div>

            </div>

          </section>

          {/* GROWTH */}

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                04
              </span>

              <div>
                <p>GROWTH PLAN</p>
                <h2>What the Capital Supports</h2>
              </div>
            </div>

            <div className="growth-box">

              <div className="growth-icon">
                ↗
              </div>

              <div>
                <h3>Growth & Expansion</h3>

                <p>
                  {growthPlan}
                </p>
              </div>

            </div>

          </section>

          <section className="business-details-section opportunity-owner-tools" aria-label="Manage business updates">
            <CommunityFeed businessId={id} ownerOnly />
          </section>

          {/* STRUCTURE EXPLANATION */}

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                05
              </span>

              <div>
                <p>INVESTMENT STRUCTURE</p>
                <h2>How the Opportunity Works</h2>
              </div>
            </div>

            <div className="structure-grid">

              <div
                className={
                  structure.toLowerCase().includes("equity")
                    ? "structure-card active-structure"
                    : "structure-card"
                }
              >

                <div className="structure-icon">
                  ◇
                </div>

                <div>
                  <h3>Equity Investment</h3>

                  <p>
                    Capital may be provided in exchange
                    for an ownership interest, subject to
                    applicable legal and regulatory
                    requirements.
                  </p>
                </div>

              </div>

              <div
                className={
                  structure.toLowerCase().includes("debt")
                    ? "structure-card active-structure"
                    : "structure-card"
                }
              >

                <div className="structure-icon debt-icon">
                  ↗
                </div>

                <div>
                  <h3>Debt / Credit Financing</h3>

                  <p>
                    Capital may be structured as a loan
                    or other permitted debt instrument,
                    with terms agreed independently by
                    the parties.
                  </p>
                </div>

              </div>

            </div>

            <div className="structure-note">
              <span>STRUCTURE SHOWN FOR INFORMATION</span>
              <p>
                The final investment or financing terms,
                including valuation, repayment, security,
                ownership, rights and other conditions,
                are negotiated independently by the
                relevant parties.
              </p>
            </div>

          </section>

          {/* REQUEST INTRODUCTION */}

          <section id="opportunity-introduction" className="introduction-section">

            <div className="introduction-glow"></div>

            <div className="introduction-copy">

              <span className="introduction-label">
                CONTROLLED INTRODUCTION
              </span>

              <h2>
                Interested in exploring this opportunity?
              </h2>

              <p>
                Request a confidential introduction. If the business accepts, Investor Mtaani will coordinate the next step while both parties’ identities stay protected.
              </p>

              <div className="introduction-points">

                <span>
                  <b>✓</b>
                  Platform-recorded introduction
                </span>

                <span>
                  <b>✓</b>
                  Identity-protected process
                </span>

                <span>
                  <b>✓</b>
                  Due diligence before any transaction
                </span>

              </div>

            </div>

            {!user ? (
              <Link to="/login" className="introduction-button">
                SIGN IN TO REQUEST AN INTRODUCTION →
              </Link>
            ) : user.role !== "investor" ? (
              <p className="introduction-status">
                Introduction requests are available to investor accounts.
              </p>
            ) : requestLoading ? (
              <p className="introduction-status" role="status">Checking your existing request…</p>
            ) : existingRequest?.status === "accepted" ? (
              <p className="introduction-status">Your introduction was accepted. Investor Mtaani will coordinate the next step.</p>
            ) : existingRequest?.status === "pending" ? (
              <p className="introduction-status">Your request is waiting for the business to review it. <Link to="/matchmaking">View status</Link></p>
            ) : existingRequest?.status === "declined" ? (
              <p className="introduction-status">This business declined your request. <Link to="/matchmaking">View introductions</Link></p>
            ) : (
              <form className="introduction-form" onSubmit={(event) => { event.preventDefault(); handleRequestIntroduction(); }}>
                <p className="introduction-status">Send your introduction request with one tap. No contact details or private message are sent to the other party.</p>
                <div className="introduction-form-footer"><button type="submit" className="introduction-button" disabled={matchLoading}>{matchLoading ? "SENDING…" : "REQUEST INTRODUCTION →"}</button></div>
              </form>
            )}

          </section>

          {message && (
            <div
              className={
                messageType === "error"
                  ? "business-details-message error-message"
                  : "business-details-message"
              }
            >
              <span>
                {messageType === "error" ? "!" : "✓"}
              </span>

              {message}
            </div>
          )}

          {/* RISK DISCLOSURE */}

          <section className="risk-disclosure">

            <div className="risk-icon">
              !
            </div>

            <div>

              <span className="risk-label">
                IMPORTANT RISK DISCLOSURE
              </span>

              <p>
                Investor Mtaani facilitates discovery,
                verification and introductions between
                businesses and potential investors. The
                platform does not guarantee investment
                performance, repayment, profitability or
                future business success.
              </p>

              <p>
                Investment and financing opportunities
                carry risk, including possible loss of
                capital. Investors should conduct their
                own due diligence and seek independent
                professional advice where appropriate.
              </p>

              <small>
                Verification does not constitute an
                investment recommendation.
              </small>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

const businessDetailsStyles = `
  .business-details-page {
    min-height: 100vh;
    padding: 32px 24px 90px;
    background:
      linear-gradient(
        rgba(61, 214, 245, 0.025) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(61, 214, 245, 0.025) 1px,
        transparent 1px
      ),
      #060911;
    background-size: 44px 44px;
    color: #E7EDF5;
    font-family: "Space Grotesk", sans-serif;
  }

  .business-details-container {
    width: 100%;
    max-width: 1160px;
    margin: 0 auto;
  }

  .business-details-back {
    margin-bottom: 24px;
  }

  .business-details-card {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(139, 124, 246, 0.09),
        transparent 28%
      ),
      radial-gradient(
        circle at 0% 0%,
        rgba(61, 214, 245, 0.06),
        transparent 25%
      ),
      #0E1626;
    border: 1px solid rgba(61, 214, 245, 0.15);
    border-radius: 24px;
    padding: 46px;
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.45);
  }

  .business-details-top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      #3DD6F5,
      #8B7CF6,
      #35D07F,
      #3DD6F5
    );
  }

  /* HEADER */

  .opportunity-header {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .opportunity-logo {
    width: 100px;
    height: 100px;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24px;
    background:
      linear-gradient(
        145deg,
        rgba(61, 214, 245, 0.15),
        rgba(139, 124, 246, 0.14)
      ),
      #09111F;
    border: 1px solid rgba(61, 214, 245, 0.30);
    color: #6BE3FA;
    font-family: "Fraunces", serif;
    font-size: 44px;
    font-weight: 700;
    box-shadow:
      0 0 35px rgba(61, 214, 245, 0.08);
  }

  .opportunity-heading {
    flex: 1;
  }

  .opportunity-eyebrow {
    margin-bottom: 8px;
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
  }

  .opportunity-heading h1 {
    margin: 0 0 12px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 42px;
    line-height: 1.08;
    font-weight: 700;
  }

  .opportunity-badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    border: 1px solid rgba(53, 208, 127, 0.25);
    border-radius: 999px;
    background: rgba(53, 208, 127, 0.08);
    color: #35D07F;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .verified-badge span {
    font-size: 13px;
  }

  .opportunity-id {
    padding: 6px 10px;
    border: 1px solid rgba(124, 138, 160, 0.18);
    border-radius: 999px;
    background: rgba(124, 138, 160, 0.05);
    color: #7C8AA0;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
  }

  .opportunity-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
  }

  .opportunity-meta span {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #C8D3E1;
    font-size: 14px;
  }

  .opportunity-meta strong {
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  .opportunity-summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
    align-items: center;
    gap: 14px;
    margin-top: 26px;
    padding: 17px 20px;
    border: 1px solid rgba(73,221,202,.2);
    border-radius: 13px;
    background: linear-gradient(100deg, rgba(73,221,202,.07), rgba(139,124,246,.06) 70%, rgba(11,18,32,.7));
  }
  .opportunity-summary > div { display: grid; gap: 5px; min-width: 0; }
  .opportunity-summary > div > span { color:#8292a7; font:700 9px "JetBrains Mono",monospace; letter-spacing:.1em; }
  .opportunity-summary strong { color:#e7edf5; font-size:17px; overflow-wrap:anywhere; }
  .opportunity-summary a { display:inline-flex; min-height:44px; align-items:center; gap:8px; padding:0 13px; border:1px solid rgba(73,221,202,.32); border-radius:8px; background:rgba(73,221,202,.08); color:#9ceee0; font-size:11px; font-weight:700; text-decoration:none; }
  .opportunity-summary a:hover { background:rgba(73,221,202,.15); }
  #opportunity-introduction { scroll-margin-top: 90px; }

  /* TRUST */

  .trust-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 38px;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #09111F;
    border: 1px solid rgba(61, 214, 245, 0.09);
    border-radius: 14px;
  }

  .trust-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(53, 208, 127, 0.08);
    color: #35D07F;
    font-size: 16px;
  }

  .violet-icon {
    background: rgba(139, 124, 246, 0.08);
    color: #A99EFF;
  }

  .green-icon {
    background: rgba(61, 214, 245, 0.08);
    color: #3DD6F5;
  }

  .gold-icon {
    background: rgba(241, 199, 91, 0.08);
    color: #F1C75B;
  }

  .trust-item strong {
    display: block;
    margin-bottom: 4px;
    color: #C8D3E1;
    font-family: "JetBrains Mono", monospace;
    font-size: 8px;
    letter-spacing: 0.06em;
  }

  .trust-item small {
    display: block;
    color: #7C8AA0;
    font-size: 11px;
  }

  /* GENERAL */

  .business-details-divider {
    height: 1px;
    margin: 40px 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(61, 214, 245, 0.18),
      rgba(139, 124, 246, 0.18),
      transparent
    );
  }

  .business-details-section {
    margin-top: 44px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .section-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    border: 1px solid rgba(61, 214, 245, 0.20);
    border-radius: 9px;
    background: rgba(61, 214, 245, 0.05);
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
  }

  .section-heading p {
    margin: 0 0 3px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .section-heading h2 {
    margin: 0;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 26px;
  }

  /* OVERVIEW */

  .business-description-box {
    padding: 25px;
    background: #09111F;
    border: 1px solid rgba(61, 214, 245, 0.10);
    border-radius: 16px;
  }

  .business-description-box p {
    margin: 0;
    color: #C8D3E1;
    font-size: 15px;
    line-height: 1.85;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 14px;
  }

  .overview-item {
    padding: 18px;
    background: #09111F;
    border: 1px solid rgba(124, 138, 160, 0.10);
    border-radius: 14px;
  }

  .overview-item span {
    display: block;
    margin-bottom: 8px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .overview-item strong {
    color: #E7EDF5;
    font-size: 14px;
  }

  /* FINANCIALS */

  .financial-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .financial-card {
    position: relative;
    overflow: hidden;
    padding: 24px;
    background: #09111F;
    border: 1px solid rgba(139, 124, 246, 0.14);
    border-radius: 16px;
  }

  .financial-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #8B7CF6;
  }

  .cyan-financial::before {
    background: #3DD6F5;
  }

  .green-financial::before {
    background: #35D07F;
  }

  .financial-card span {
    display: block;
    margin-bottom: 12px;
    color: #7C8AA0;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .financial-card strong {
    display: block;
    margin-bottom: 9px;
    color: #E7EDF5;
    font-family: "JetBrains Mono", monospace;
    font-size: 20px;
  }

  .financial-card small {
    color: #58667A;
    font-size: 11px;
  }

  .financial-note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 14px;
    padding: 15px 17px;
    border: 1px solid rgba(241, 199, 91, 0.12);
    border-radius: 12px;
    background: rgba(241, 199, 91, 0.035);
  }

  .financial-note > span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    min-width: 19px;
    border: 1px solid rgba(241, 199, 91, 0.35);
    border-radius: 50%;
    color: #F1C75B;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
  }

  .financial-note p {
    margin: 0;
    color: #7C8AA0;
    font-size: 11px;
    line-height: 1.6;
  }

  /* FUNDING */

  .funding-request {
    position: relative;
    overflow: hidden;
    padding: 30px;
    background:
      linear-gradient(
        135deg,
        rgba(139, 124, 246, 0.12),
        rgba(61, 214, 245, 0.05)
      ),
      #09111F;
    border: 1px solid rgba(139, 124, 246, 0.24);
    border-radius: 18px;
  }

  .funding-glow {
    position: absolute;
    width: 190px;
    height: 190px;
    right: -70px;
    top: -70px;
    border-radius: 50%;
    background: rgba(139, 124, 246, 0.12);
    filter: blur(40px);
  }

  .funding-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
  }

  .funding-label {
    display: block;
    margin-bottom: 9px;
    color: #A99EFF;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .funding-main h2 {
    margin: 0;
    color: #E7EDF5;
    font-family: "JetBrains Mono", monospace;
    font-size: 34px;
  }

  .funding-structure {
    min-width: 170px;
    padding: 15px 18px;
    border: 1px solid rgba(139, 124, 246, 0.18);
    border-radius: 12px;
    background: rgba(139, 124, 246, 0.05);
  }

  .funding-structure span {
    display: block;
    margin-bottom: 5px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 8px;
    letter-spacing: 0.08em;
  }

  .funding-structure strong {
    color: #A99EFF;
    font-size: 14px;
  }

  .funding-purpose {
    position: relative;
    z-index: 1;
    margin-top: 25px;
    padding-top: 18px;
    border-top: 1px solid rgba(139, 124, 246, 0.15);
  }

  .funding-purpose span {
    display: block;
    margin-bottom: 7px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .funding-purpose p {
    margin: 0;
    color: #C8D3E1;
    line-height: 1.7;
    font-size: 14px;
  }

  /* GROWTH */

  .growth-box {
    display: flex;
    align-items: flex-start;
    gap: 17px;
    padding: 24px;
    border: 1px solid rgba(53, 208, 127, 0.14);
    border-radius: 16px;
    background:
      linear-gradient(
        135deg,
        rgba(53, 208, 127, 0.06),
        rgba(61, 214, 245, 0.025)
      ),
      #09111F;
  }

  .growth-icon {
    width: 43px;
    height: 43px;
    min-width: 43px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(53, 208, 127, 0.09);
    color: #35D07F;
    font-size: 20px;
  }

  .growth-box h3 {
    margin: 0 0 7px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 20px;
  }

  .growth-box p {
    margin: 0;
    color: #7C8AA0;
    font-size: 13px;
    line-height: 1.7;
  }

  /* STRUCTURE */

  .structure-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .structure-card {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 22px;
    background: #09111F;
    border: 1px solid rgba(124, 138, 160, 0.12);
    border-radius: 16px;
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .active-structure {
    border-color: rgba(61, 214, 245, 0.28);
    background:
      linear-gradient(
        135deg,
        rgba(61, 214, 245, 0.06),
        rgba(139, 124, 246, 0.035)
      ),
      #09111F;
  }

  .structure-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(139, 124, 246, 0.08);
    color: #A99EFF;
    font-size: 19px;
  }

  .debt-icon {
    background: rgba(61, 214, 245, 0.08);
    color: #3DD6F5;
  }

  .structure-card h3 {
    margin: 0 0 7px;
    color: #E7EDF5;
    font-size: 15px;
  }

  .structure-card p {
    margin: 0;
    color: #7C8AA0;
    font-size: 12px;
    line-height: 1.65;
  }

  .structure-note {
    margin-top: 13px;
    padding: 15px 17px;
    border: 1px solid rgba(124, 138, 160, 0.10);
    border-radius: 12px;
    background: rgba(124, 138, 160, 0.025);
  }

  .structure-note span {
    display: block;
    margin-bottom: 6px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .structure-note p {
    margin: 0;
    color: #7C8AA0;
    font-size: 11px;
    line-height: 1.6;
  }

  /* INTRODUCTION */

  .introduction-section {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    margin-top: 48px;
    padding: 30px;
    background:
      linear-gradient(
        135deg,
        rgba(61, 214, 245, 0.08),
        rgba(139, 124, 246, 0.08)
      ),
      #09111F;
    border: 1px solid rgba(61, 214, 245, 0.17);
    border-radius: 20px;
  }

  .introduction-glow {
    position: absolute;
    width: 230px;
    height: 230px;
    left: -100px;
    bottom: -130px;
    border-radius: 50%;
    background: rgba(61, 214, 245, 0.08);
    filter: blur(45px);
  }

  .introduction-copy {
    position: relative;
    z-index: 1;
    flex: 1;
  }

  .introduction-label {
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .introduction-copy h2 {
    margin: 7px 0 8px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 27px;
  }

  .introduction-copy > p {
    max-width: 620px;
    margin: 0;
    color: #7C8AA0;
    font-size: 13px;
    line-height: 1.65;
  }

  .introduction-points {
    display: flex;
    flex-wrap: wrap;
    gap: 13px;
    margin-top: 17px;
  }

  .introduction-points span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #9BA9BB;
    font-size: 10px;
  }

  .introduction-points b {
    color: #35D07F;
  }

  .introduction-button {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    padding: 16px 23px;
    border: 1px solid rgba(61, 214, 245, 0.35);
    border-radius: 11px;
    background: linear-gradient(
      135deg,
      #3DD6F5,
      #1BA7C7
    );
    color: #060911;
    font-family: "Space Grotesk", sans-serif;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow:
      0 0 24px rgba(61, 214, 245, 0.12);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .introduction-form { position: relative; z-index: 1; flex: 0 1 360px; min-width: 250px; }
  .introduction-form label { display:block; margin-bottom:7px; color:#dce7f2; font-size:12px; font-weight:700; }
  .introduction-form label span { color:#7c8aa0; font-weight:400; }
  .introduction-form textarea { display:block; width:100%; min-height:86px; padding:11px; border:1px solid rgba(148,163,184,.25); border-radius:9px; background:#080d17; color:#e7edf5; font:inherit; font-size:13px; resize:vertical; }
  .introduction-form textarea:focus-visible { outline:3px solid rgba(61,214,245,.4); outline-offset:2px; }
  .introduction-form-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:9px; color:#7c8aa0; font-size:10px; }
  .introduction-form-footer .introduction-button { padding:13px 16px; }
  .introduction-status a { color:#67e8f9; }

  .introduction-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 30px rgba(61, 214, 245, 0.20);
  }

  .introduction-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .introduction-status {
    max-width: 240px;
    color: #a9b6c8;
    font-size: 13px;
    line-height: 1.6;
  }

  .business-details-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 14px 18px;
    border: 1px solid rgba(53, 208, 127, 0.20);
    border-radius: 12px;
    background: rgba(53, 208, 127, 0.07);
    color: #35D07F;
    text-align: center;
    font-size: 12px;
  }

  .business-details-message span {
    font-weight: 800;
  }

  .error-message {
    border-color: rgba(255, 100, 124, 0.20);
    background: rgba(255, 100, 124, 0.07);
    color: #FF8093;
  }

  /* RISK */

  .risk-disclosure {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-top: 35px;
    padding: 20px;
    border: 1px solid rgba(241, 199, 91, 0.16);
    border-radius: 15px;
    background: rgba(241, 199, 91, 0.035);
  }

  .risk-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(241, 199, 91, 0.30);
    border-radius: 10px;
    color: #F1C75B;
    font-weight: 800;
  }

  .risk-label {
    display: block;
    margin-bottom: 8px;
    color: #F1C75B;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .risk-disclosure p {
    margin: 0 0 8px;
    color: #7C8AA0;
    font-size: 11px;
    line-height: 1.65;
  }

  .risk-disclosure small {
    color: #9BA9BB;
    font-size: 10px;
    font-weight: 700;
  }

  /* LOADING */

  .business-details-loading {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #3DD6F5;
  }

  .business-details-loading p {
    margin: 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .loading-spinner {
    width: 38px;
    height: 38px;
    border: 3px solid rgba(61, 214, 245, 0.12);
    border-top-color: #3DD6F5;
    border-right-color: #8B7CF6;
    border-radius: 50%;
    animation: businessDetailsSpin 0.8s linear infinite;
  }

  @keyframes businessDetailsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* EMPTY */

  .business-details-empty {
    max-width: 600px;
    margin: 100px auto;
    padding: 50px 30px;
    text-align: center;
    background: #0E1626;
    border: 1px solid rgba(61, 214, 245, 0.14);
    border-radius: 20px;
  }

  .empty-icon {
    width: 55px;
    height: 55px;
    margin: 0 auto 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 100, 124, 0.08);
    border: 1px solid rgba(255, 100, 124, 0.20);
    color: #FF647C;
    font-size: 24px;
    font-weight: 800;
  }

  .business-details-empty h1 {
    margin: 0 0 10px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
  }

  .business-details-empty p {
    margin: 0;
    color: #7C8AA0;
  }

  /* RESPONSIVE */

  @media (max-width: 900px) {
    .trust-strip {
      grid-template-columns: repeat(2, 1fr);
    }

    .overview-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .introduction-section {
      flex-direction: column;
      align-items: stretch;
    }

    .introduction-button {
      width: 100%;
    }

    .opportunity-summary { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .opportunity-summary a { grid-column:1 / -1; justify-content:center; }
  }

  @media (max-width: 800px) {
    .business-details-page {
      padding: 24px 15px 60px;
    }

    .business-details-card {
      padding: 28px 20px;
      border-radius: 18px;
    }

    .opportunity-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .opportunity-heading h1 {
      font-size: 32px;
    }

    .financial-grid,
    .structure-grid {
      grid-template-columns: 1fr;
    }

    .funding-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .funding-structure {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .trust-strip,
    .overview-grid {
      grid-template-columns: 1fr;
    }

    .opportunity-meta {
      flex-direction: column;
      gap: 12px;
    }

    .opportunity-summary { gap:11px; padding:14px; }
    .opportunity-summary strong { font-size:15px; }

    .opportunity-logo {
      width: 76px;
      height: 76px;
      min-width: 76px;
      font-size: 34px;
    }

    .opportunity-heading h1 {
      font-size: 28px;
    }

    .funding-main h2 {
      font-size: 27px;
    }

    .introduction-points {
      flex-direction: column;
      gap: 8px;
    }

    .risk-disclosure {
      flex-direction: column;
    }
  }
`;

export default BusinessDetails;
