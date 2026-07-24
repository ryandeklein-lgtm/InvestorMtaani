import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function BusinessProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [fundingRequest, setFundingRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get business profile
        const businessResponse = await api.get("/businesses/me");
        setBusiness(businessResponse.data.data);

        // Get funding requests
        try {
          const fundingResponse = await api.get("/funding/me");

          const requests = fundingResponse.data.data || [];

          // Backend returns newest request first
          if (requests.length > 0) {
            setFundingRequest(requests[0]);
          }
        } catch (fundingError) {
          // 404 just means no funding request exists yet — not a real error
          if (fundingError.response?.status !== 404) {
            console.error(
              "Error fetching funding request:",
              fundingError
            );
          }
        }
      } catch (error) {
        // 404 just means the user hasn't created a business profile yet — not a real error
        if (error.response?.status !== 404) {
          console.error(
            "Error fetching business profile:",
            error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <>
        <FontImport />
        <div style={styles.statusPage}>
          <h2 style={styles.statusHeading}>Loading business profile...</h2>
        </div>
      </>
    );
  }

  if (!business) {
    return (
      <>
        <FontImport />
        <div style={styles.statusPage}>
          <h2 style={styles.statusHeading}>No business profile found</h2>

          <p style={styles.statusText}>
            Create your business profile to start connecting
            with investors.
          </p>

          <button
            style={styles.setFundingButton}
            onClick={() => navigate("/business/create")}
          >
            Create Business Profile
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />
      <div style={styles.page}>
        <div style={styles.container}>
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          {/* Business Header */}
          <section style={styles.hero}>
            <div>
              <span style={styles.industryBadge}>
                {business.industry || "Business"}
              </span>

              <h1 style={styles.businessName}>
                {business.business_name}
              </h1>

              <p style={styles.location}>
                📍 {business.location || "Location not added"}
              </p>
            </div>

            <div style={styles.heroViews}>
              <span style={styles.viewsNumber}>
                {business.views || 0}
              </span>

              <span style={styles.viewsLabel}>
                Profile Views
              </span>
            </div>
          </section>

          <div style={styles.layout}>
            <main style={styles.mainContent}>
              {/* About */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>01</span>

                  <div>
                    <h2 style={styles.heading}>
                      About the Business
                    </h2>

                    <p style={styles.subheading}>
                      An overview of the company and what it does.
                    </p>
                  </div>
                </div>

                <p style={styles.description}>
                  {business.description ||
                    "No business description added yet."}
                </p>
              </section>

              {/* Business Performance */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>02</span>

                  <div>
                    <h2 style={styles.heading}>
                      Business Performance
                    </h2>

                    <p style={styles.subheading}>
                      Key figures from the business.
                    </p>
                  </div>
                </div>

                <div style={styles.stats}>
                  <Stat
                    title="Annual Revenue"
                    value={formatMoney(
                      business.annual_revenue
                    )}
                  />

                  <Stat
                    title="Monthly Gross"
                    value={formatMoney(
                      business.monthly_gross
                    )}
                  />

                  <Stat
                    title="Monthly Net"
                    value={formatMoney(
                      business.monthly_net
                    )}
                  />

                  <Stat
                    title="Employees"
                    value={business.employees || 0}
                  />
                </div>
              </section>

              {/* Funding Request */}
              <section style={styles.fundingCard}>
                <div style={styles.fundingTop}>
                  <div>
                    <span style={styles.fundingLabel}>
                      FUNDING REQUEST
                    </span>

                    <h2 style={styles.fundingAmount}>
                      {fundingRequest
                        ? formatMoney(
                            fundingRequest.amount_requested
                          )
                        : "No active funding request"}
                    </h2>

                    {!fundingRequest && (
                      <button
                        onClick={() => navigate("/funding")}
                        style={styles.setFundingButton}
                      >
                        Set Funding Amount
                      </button>
                    )}
                  </div>

                  <div style={styles.fundingIcon}>
                    ↗
                  </div>
                </div>

                {fundingRequest && (
                  <>
                    <div style={styles.fundingDetails}>
                      <div>
                        <span style={styles.detailLabel}>
                          Funding Type
                        </span>

                        <strong style={styles.detailValue}>
                          {fundingRequest.funding_type}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.detailLabel}>
                          Timeline
                        </span>

                        <strong style={styles.detailValue}>
                          {fundingRequest.funding_timeline ||
                            "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span style={styles.detailLabel}>
                          Status
                        </span>

                        <strong style={styles.statusBadge}>
                          {fundingRequest.status}
                        </strong>
                      </div>
                    </div>

                    <div style={styles.divider}></div>

                    <h3 style={styles.useTitle}>
                      How the funding will be used
                    </h3>

                    <p style={styles.fundingReason}>
                      {fundingRequest.funding_reason}
                    </p>

                    {fundingRequest.expected_impact && (
                      <>
                        <h3 style={styles.impactTitle}>
                          Expected Impact
                        </h3>

                        <p style={styles.fundingReason}>
                          {fundingRequest.expected_impact}
                        </p>
                      </>
                    )}

                    <button
                      onClick={() => navigate("/funding")}
                      style={styles.manageFundingButton}
                    >
                      Manage Funding Requests
                    </button>
                  </>
                )}
              </section>
            </main>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
              <section style={styles.sideCard}>
                <h3 style={styles.sideTitle}>
                  Investor Readiness
                </h3>

                <div style={styles.scoreCircle}>
                  {business.investment_readiness_score || 0}%
                </div>

                <p style={styles.sideText}>
                  A snapshot of how prepared this business is
                  for investment.
                </p>
              </section>

              <section style={styles.matchCard}>
                <span style={styles.matchEyebrow}>
                  INVESTOR CONNECTIONS
                </span>

                <h3 style={styles.matchTitle}>
                  Manage your matches
                </h3>

                <p style={styles.matchText}>
                  Review investors who want to connect with
                  your business.
                </p>

                <button
                  style={styles.matchButton}
                  onClick={() =>
                    navigate("/business-matches")
                  }
                >
                  View Matchmaking Requests →
                </button>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    `}</style>
  );
}

function Stat({ title, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statTitle}>
        {title}
      </span>

      <strong style={styles.statValue}>
        {value}
      </strong>
    </div>
  );
}

function formatMoney(amount) {
  if (!amount) {
    return "KES 0";
  }

  return `KES ${Number(amount).toLocaleString()}`;
}

// Brand palette (matches Landing page)
// Deep green:  #15402B
// Gold/amber:  #E7A93D
// Rust/red:    #C33F26
// Cream bg:    #FBF6EA
// Tan bg:      #EFE2BE
// Near-black:  #14110D
// Body text:   #443F32 / #55503F

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF6EA",
    padding: "40px 20px 80px",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#55503F",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    fontFamily: "'Sora', sans-serif",
    padding: "10px 0",
    marginBottom: "20px",
  },

  hero: {
    background: "#15402B",
    color: "#FBF6EA",
    borderRadius: "20px",
    padding: "40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "28px",
    border: "1px solid rgba(231,169,61,0.25)",
  },

  industryBadge: {
    display: "inline-block",
    background: "rgba(231, 169, 61, 0.18)",
    color: "#E7A93D",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "'Space Mono', monospace",
  },

  businessName: {
    color: "#FBF6EA",
    fontSize: "42px",
    margin: "16px 0 10px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
  },

  location: {
    color: "#D9E5DC",
    fontSize: "16px",
  },

  heroViews: {
    minWidth: "130px",
    textAlign: "center",
    padding: "20px",
    borderRadius: "14px",
    background: "rgba(251,246,234,0.08)",
  },

  viewsNumber: {
    display: "block",
    fontSize: "30px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
    color: "#E7A93D",
  },

  viewsLabel: {
    color: "#D9E5DC",
    fontSize: "13px",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "28px",
    alignItems: "start",
  },

  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  card: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "30px",
  },

  sectionHeading: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  sectionIcon: {
    width: "38px",
    height: "38px",
    background: "#15402B",
    color: "#E7A93D",
    borderRadius: "9px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
  },

  heading: {
    color: "#14110D",
    margin: "0 0 4px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  subheading: {
    color: "#55503F",
    fontSize: "14px",
  },

  description: {
    color: "#443F32",
    lineHeight: "1.8",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },

  stat: {
    background: "#FBF6EA",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "12px",
    padding: "18px",
  },

  statTitle: {
    display: "block",
    color: "#55503F",
    fontSize: "13px",
    marginBottom: "8px",
  },

  statValue: {
    color: "#14110D",
    fontSize: "17px",
    fontFamily: "'Space Mono', monospace",
  },

  fundingCard: {
    background: "#EFE2BE",
    border: "1px solid rgba(21,64,43,0.18)",
    borderRadius: "18px",
    padding: "32px",
  },

  fundingTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  fundingLabel: {
    color: "#15402B",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.3px",
    fontFamily: "'Space Mono', monospace",
  },

  fundingAmount: {
    color: "#14110D",
    fontSize: "34px",
    margin: "8px 0 0",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  fundingIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#C33F26",
    color: "#FBF6EA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  setFundingButton: {
    marginTop: "18px",
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    borderRadius: "10px",
    padding: "13px 20px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  fundingDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
    marginTop: "28px",
  },

  detailLabel: {
    display: "block",
    color: "#55503F",
    fontSize: "12px",
    marginBottom: "6px",
  },

  detailValue: {
    color: "#14110D",
  },

  statusBadge: {
    color: "#15402B",
    textTransform: "uppercase",
  },

  divider: {
    height: "1px",
    background: "rgba(21,64,43,0.2)",
    margin: "25px 0",
  },

  useTitle: {
    color: "#14110D",
    fontSize: "16px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "700",
  },

  impactTitle: {
    color: "#14110D",
    fontSize: "16px",
    marginTop: "24px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "700",
  },

  fundingReason: {
    color: "#443F32",
    lineHeight: "1.8",
  },

  manageFundingButton: {
    marginTop: "24px",
    background: "transparent",
    color: "#15402D",
    border: "1px solid #15402B",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  sideCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "26px",
    textAlign: "center",
  },

  sideTitle: {
    color: "#14110D",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  scoreCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    border: "8px solid #EFE2BE",
    margin: "24px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#C33F26",
    fontSize: "25px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
  },

  sideText: {
    color: "#55503F",
    lineHeight: "1.6",
  },

  matchCard: {
    background: "#15402B",
    color: "#FBF6EA",
    borderRadius: "18px",
    padding: "26px",
    border: "1px solid rgba(231,169,61,0.25)",
  },

  matchEyebrow: {
    color: "#E7A93D",
    fontSize: "11px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "1px",
  },

  matchTitle: {
    color: "#FBF6EA",
    fontSize: "22px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  matchText: {
    color: "#D9E5DC",
    lineHeight: "1.6",
  },

  matchButton: {
    width: "100%",
    marginTop: "18px",
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
  },

  statusPage: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#FBF6EA",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
    textAlign: "center",
    padding: "0 20px",
  },

  statusHeading: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  statusText: {
    color: "#55503F",
    maxWidth: "420px",
    margin: "12px 0 24px",
    lineHeight: "1.7",
  },
};

export default BusinessProfile;

