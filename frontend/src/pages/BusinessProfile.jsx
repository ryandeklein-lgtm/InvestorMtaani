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
          // 404 just means no funding request exists yet
          if (fundingError.response?.status !== 404) {
            console.error(
              "Error fetching funding request:",
              fundingError
            );
          }
        }
      } catch (error) {
        // 404 just means the user hasn't created a business profile yet
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
      <div style={styles.statusPage}>
        <div style={styles.loadingOrb}></div>

        <span style={styles.statusEyebrow}>
          BUSINESS PROFILE
        </span>

        <h2 style={styles.statusHeading}>
          Loading business profile...
        </h2>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={styles.statusPage}>
        <div style={styles.emptyIcon}>+</div>

        <span style={styles.statusEyebrow}>
          BUSINESS PROFILE
        </span>

        <h2 style={styles.statusHeading}>
          No business profile found
        </h2>

        <p style={styles.statusText}>
          Create your business profile to start connecting
          with investors.
        </p>

        <button
          style={styles.primaryButton}
          onClick={() => navigate("/business/create")}
        >
          Create Business Profile
          <span>↗</span>
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridBackground}></div>

      <div style={styles.container}>
        {/* Back */}
        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <span style={styles.backArrow}>←</span>
          BACK
        </button>

        {/* Business Header */}
        <section style={styles.hero}>
          <div style={styles.heroGlow}></div>

          <div style={styles.heroContent}>
            <div style={styles.industryRow}>
              <span style={styles.industryBadge}>
                {business.industry || "BUSINESS"}
              </span>

              <span style={styles.liveIndicator}>
                <span style={styles.liveDot}></span>
                PROFILE ACTIVE
              </span>
            </div>

            <h1 style={styles.businessName}>
              {business.business_name}
            </h1>

            <p style={styles.location}>
              <span style={styles.locationIcon}>⌖</span>
              {business.location || "Location not added"}
            </p>
          </div>

          <div style={styles.heroViews}>
            <span style={styles.viewsLabel}>
              PROFILE VIEWS
            </span>

            <span style={styles.viewsNumber}>
              {business.views || 0}
            </span>

            <span style={styles.viewsStatus}>
              INVESTOR VISIBILITY
            </span>
          </div>
        </section>

        <div style={styles.layout}>
          <main style={styles.mainContent}>
            {/* About */}
            <section style={styles.card}>
              <div style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>
                  01
                </span>

                <div>
                  <h2 style={styles.heading}>
                    About the Business
                  </h2>

                  <p style={styles.subheading}>
                    An overview of the company and what it does.
                  </p>
                </div>
              </div>

              <div style={styles.headingLine}></div>

              <p style={styles.description}>
                {business.description ||
                  "No business description added yet."}
              </p>
            </section>

            {/* Business Performance */}
            <section style={styles.card}>
              <div style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>
                  02
                </span>

                <div>
                  <h2 style={styles.heading}>
                    Business Performance
                  </h2>

                  <p style={styles.subheading}>
                    Key figures from the business.
                  </p>
                </div>
              </div>

              <div style={styles.headingLine}></div>

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
              <div style={styles.fundingGlow}></div>

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
                      style={styles.primaryButton}
                    >
                      Set Funding Amount
                      <span>↗</span>
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
                    <div style={styles.detailBox}>
                      <span style={styles.detailLabel}>
                        FUNDING TYPE
                      </span>

                      <strong style={styles.detailValue}>
                        {fundingRequest.funding_type}
                      </strong>
                    </div>

                    <div style={styles.detailBox}>
                      <span style={styles.detailLabel}>
                        TIMELINE
                      </span>

                      <strong style={styles.detailValue}>
                        {fundingRequest.funding_timeline ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div style={styles.detailBox}>
                      <span style={styles.detailLabel}>
                        STATUS
                      </span>

                      <strong style={styles.statusBadge}>
                        <span style={styles.statusDot}></span>
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
                    <span>→</span>
                  </button>
                </>
              )}
            </section>
          </main>

          {/* Sidebar */}
          <aside style={styles.sidebar}>
            {/* Investor Readiness */}
            <section style={styles.sideCard}>
              <div style={styles.cardTopLine}></div>

              <span style={styles.sideEyebrow}>
                READINESS INDEX
              </span>

              <h3 style={styles.sideTitle}>
                Investor Readiness
              </h3>

              <div style={styles.scoreWrapper}>
                <div style={styles.scoreCircle}>
                  <div style={styles.scoreInner}>
                    <span style={styles.scoreNumber}>
                      {business.investment_readiness_score || 0}
                    </span>

                    <span style={styles.scorePercent}>
                      %
                    </span>
                  </div>
                </div>
              </div>

              <p style={styles.sideText}>
                A snapshot of how prepared this business is
                for investment.
              </p>
            </section>

            {/* Matches */}
            <section style={styles.matchCard}>
              <div style={styles.matchGlow}></div>

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
                View Matchmaking Requests
                <span>→</span>
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statNumber}>+</span>

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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#060911",
    color: "#E7EDF5",
    padding: "36px 20px 80px",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  gridBackground: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.22,
    backgroundImage:
      "linear-gradient(rgba(61,214,245,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,245,0.055) 1px, transparent 1px)",
    backgroundSize: "55px 55px",
    zIndex: 0,
  },

  container: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "transparent",
    border: "none",
    color: "#7C8AA0",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontFamily: "'JetBrains Mono', monospace",
    padding: "10px 0",
    marginBottom: "22px",
    transition: "all .2s ease",
  },

  backArrow: {
    fontSize: "18px",
    color: "#3DD6F5",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0E1626 0%, #0B1424 55%, #111C2F 100%)",
    border: "1px solid rgba(61,214,245,0.24)",
    borderRadius: "18px",
    padding: "42px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "26px",
    boxShadow:
      "0 24px 70px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.025)",
  },

  heroGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    right: "-160px",
    top: "-250px",
    background:
      "radial-gradient(circle, rgba(61,214,245,.16), transparent 68%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
  },

  industryRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  industryBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "5px",
    background: "rgba(61,214,245,.08)",
    border: "1px solid rgba(61,214,245,.3)",
    color: "#6BE3FA",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1.3px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  liveIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#35D07F",
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1px",
  },

  liveDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#35D07F",
    boxShadow: "0 0 10px rgba(53,208,127,.8)",
  },

  businessName: {
    position: "relative",
    color: "#E7EDF5",
    fontSize: "clamp(32px, 5vw, 48px)",
    lineHeight: "1.05",
    margin: "18px 0 12px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "700",
    letterSpacing: "-1.5px",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#7C8AA0",
    fontSize: "14px",
    margin: 0,
  },

  locationIcon: {
    color: "#3DD6F5",
    fontSize: "18px",
  },

  heroViews: {
    position: "relative",
    zIndex: 1,
    minWidth: "175px",
    padding: "22px",
    borderRadius: "10px",
    background: "rgba(6,9,17,.55)",
    border: "1px solid rgba(61,214,245,.16)",
    textAlign: "center",
  },

  viewsLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.4px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  viewsNumber: {
    display: "block",
    color: "#6BE3FA",
    fontSize: "34px",
    fontWeight: "700",
    margin: "7px 0",
    fontFamily: "'JetBrains Mono', monospace",
    textShadow: "0 0 20px rgba(61,214,245,.35)",
  },

  viewsStatus: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "26px",
    alignItems: "start",
  },

  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    minWidth: 0,
  },

  card: {
    position: "relative",
    background:
      "linear-gradient(145deg, rgba(14,22,38,.98), rgba(9,17,31,.98))",
    border: "1px solid rgba(61,214,245,.13)",
    borderRadius: "14px",
    padding: "28px",
    boxShadow:
      "0 15px 45px rgba(0,0,0,.22)",
  },

  sectionHeading: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  sectionIcon: {
    flex: "0 0 auto",
    width: "38px",
    height: "38px",
    background: "rgba(61,214,245,.08)",
    border: "1px solid rgba(61,214,245,.28)",
    color: "#3DD6F5",
    borderRadius: "7px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
  },

  heading: {
    color: "#E7EDF5",
    margin: "0 0 4px",
    fontSize: "21px",
    fontWeight: "600",
    letterSpacing: "-.3px",
  },

  subheading: {
    color: "#58667A",
    fontSize: "12px",
    margin: 0,
  },

  headingLine: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(61,214,245,.2), transparent)",
    margin: "22px 0",
  },

  description: {
    color: "#AAB6C7",
    lineHeight: "1.85",
    fontSize: "14px",
    margin: 0,
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(175px, 1fr))",
    gap: "12px",
  },

  stat: {
    position: "relative",
    overflow: "hidden",
    background: "#09111F",
    border: "1px solid rgba(61,214,245,.1)",
    borderRadius: "9px",
    padding: "20px",
    transition: "all .2s ease",
  },

  statNumber: {
    position: "absolute",
    right: "12px",
    top: "8px",
    color: "rgba(61,214,245,.08)",
    fontSize: "38px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statTitle: {
    display: "block",
    color: "#58667A",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "9px",
    textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statValue: {
    display: "block",
    color: "#E7EDF5",
    fontSize: "17px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
  },

  fundingCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #111C2F 0%, #0D1728 100%)",
    border: "1px solid rgba(139,124,246,.28)",
    borderRadius: "14px",
    padding: "30px",
    boxShadow:
      "0 15px 55px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.025)",
  },

  fundingGlow: {
    position: "absolute",
    width: "350px",
    height: "350px",
    right: "-180px",
    top: "-220px",
    background:
      "radial-gradient(circle, rgba(139,124,246,.16), transparent 70%)",
    pointerEvents: "none",
  },

  fundingTop: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  fundingLabel: {
    color: "#A99EFF",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  fundingAmount: {
    color: "#E7EDF5",
    fontSize: "32px",
    margin: "8px 0 0",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
    letterSpacing: "-1px",
  },

  fundingIcon: {
    width: "50px",
    height: "50px",
    flex: "0 0 auto",
    borderRadius: "10px",
    background: "rgba(139,124,246,.1)",
    border: "1px solid rgba(139,124,246,.35)",
    color: "#A99EFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow:
      "0 0 25px rgba(139,124,246,.12)",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px",
    background: "#3DD6F5",
    color: "#061018",
    border: "1px solid #6BE3FA",
    borderRadius: "7px",
    padding: "12px 18px",
    fontWeight: "800",
    fontSize: "12px",
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: "pointer",
    boxShadow:
      "0 0 22px rgba(61,214,245,.14)",
    transition: "all .2s ease",
  },

  fundingDetails: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginTop: "28px",
  },

  detailBox: {
    background: "rgba(6,9,17,.45)",
    border: "1px solid rgba(139,124,246,.12)",
    borderRadius: "8px",
    padding: "15px",
  },

  detailLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "9px",
    letterSpacing: "1px",
    marginBottom: "7px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  detailValue: {
    color: "#C8D3E1",
    fontSize: "13px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#35D07F",
    textTransform: "uppercase",
    fontSize: "11px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#35D07F",
    boxShadow: "0 0 8px rgba(53,208,127,.7)",
  },

  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(139,124,246,.25), transparent)",
    margin: "25px 0",
  },

  useTitle: {
    color: "#E7EDF5",
    fontSize: "14px",
    margin: 0,
    fontWeight: "700",
  },

  impactTitle: {
    color: "#E7EDF5",
    fontSize: "14px",
    margin: "24px 0 0",
    fontWeight: "700",
  },

  fundingReason: {
    color: "#8997AA",
    lineHeight: "1.8",
    fontSize: "13px",
    margin: "10px 0 0",
  },

  manageFundingButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
    background: "transparent",
    color: "#A99EFF",
    border: "1px solid rgba(139,124,246,.4)",
    borderRadius: "7px",
    padding: "11px 16px",
    fontWeight: "700",
    fontSize: "11px",
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: "pointer",
    transition: "all .2s ease",
  },

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: 0,
  },

  sideCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #0E1626, #09111F)",
    border: "1px solid rgba(61,214,245,.13)",
    borderRadius: "14px",
    padding: "27px",
    textAlign: "center",
  },

  cardTopLine: {
    position: "absolute",
    top: 0,
    left: "12%",
    right: "12%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, #3DD6F5, transparent)",
    boxShadow: "0 0 12px rgba(61,214,245,.5)",
  },

  sideEyebrow: {
    color: "#58667A",
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1.4px",
  },

  sideTitle: {
    color: "#E7EDF5",
    margin: "9px 0 0",
    fontSize: "19px",
    fontWeight: "600",
  },

  scoreWrapper: {
    margin: "25px auto",
  },

  scoreCircle: {
    width: "130px",
    height: "130px",
    margin: "0 auto",
    borderRadius: "50%",
    padding: "8px",
    background:
      "conic-gradient(#3DD6F5 0deg, #8B7CF6 180deg, rgba(61,214,245,.08) 180deg)",
    boxShadow:
      "0 0 35px rgba(61,214,245,.12)",
  },

  scoreInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#09111F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    color: "#6BE3FA",
    fontSize: "27px",
    fontWeight: "700",
    fontFamily: "'JetBrains Mono', monospace",
  },

  scorePercent: {
    color: "#58667A",
    fontSize: "12px",
    marginTop: "9px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  sideText: {
    color: "#7C8AA0",
    lineHeight: "1.7",
    fontSize: "12px",
    margin: 0,
  },

  matchCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #111C2F, #0A1423)",
    border: "1px solid rgba(139,124,246,.3)",
    borderRadius: "14px",
    padding: "27px",
    boxShadow:
      "0 15px 45px rgba(0,0,0,.25)",
  },

  matchGlow: {
    position: "absolute",
    width: "260px",
    height: "260px",
    right: "-150px",
    top: "-140px",
    background:
      "radial-gradient(circle, rgba(139,124,246,.18), transparent 70%)",
    pointerEvents: "none",
  },

  matchEyebrow: {
    position: "relative",
    color: "#A99EFF",
    fontSize: "9px",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1.2px",
  },

  matchTitle: {
    position: "relative",
    color: "#E7EDF5",
    fontSize: "21px",
    margin: "12px 0 9px",
    fontWeight: "600",
    lineHeight: "1.2",
  },

  matchText: {
    position: "relative",
    color: "#7C8AA0",
    lineHeight: "1.7",
    fontSize: "12px",
    margin: 0,
  },

  matchButton: {
    position: "relative",
    width: "100%",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    background: "rgba(139,124,246,.1)",
    color: "#A99EFF",
    border: "1px solid rgba(139,124,246,.4)",
    borderRadius: "7px",
    padding: "13px 14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    fontFamily: "'Space Grotesk', sans-serif",
    transition: "all .2s ease",
  },

  statusPage: {
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#060911",
    color: "#E7EDF5",
    textAlign: "center",
    padding: "40px 20px",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  statusEyebrow: {
    color: "#3DD6F5",
    fontSize: "9px",
    letterSpacing: "1.6px",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "12px",
  },

  statusHeading: {
    color: "#E7EDF5",
    fontSize: "25px",
    fontWeight: "600",
    margin: "0",
  },

  statusText: {
    color: "#7C8AA0",
    maxWidth: "420px",
    margin: "12px 0 5px",
    lineHeight: "1.7",
    fontSize: "13px",
  },

  loadingOrb: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid rgba(61,214,245,.12)",
    borderTopColor: "#3DD6F5",
    boxShadow: "0 0 25px rgba(61,214,245,.2)",
    marginBottom: "25px",
    animation: "spin 1s linear infinite",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "10px",
    border: "1px solid rgba(61,214,245,.3)",
    background: "rgba(61,214,245,.06)",
    color: "#3DD6F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    marginBottom: "22px",
  },
};

export default BusinessProfile;