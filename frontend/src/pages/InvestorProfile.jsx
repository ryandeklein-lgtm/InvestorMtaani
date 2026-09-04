import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function InvestorProfile() {
  const navigate = useNavigate();

  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get investor profile — mirrors /businesses/me on the business side
        const investorResponse = await api.get("/investors/me");
        setInvestor(investorResponse.data.data);
      } catch (error) {
        // 404 just means the user hasn't created an investor profile yet
        if (error.response?.status !== 404) {
          console.error("Error fetching investor profile:", error);
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
          <h2 style={styles.statusHeading}>Loading investor profile...</h2>
        </div>
      </>
    );
  }

  if (!investor) {
    return (
      <>
        <FontImport />
        <div style={styles.statusPage}>
          <h2 style={styles.statusHeading}>No investor profile found</h2>

          <p style={styles.statusText}>
            Set up your investor profile so businesses can see what
            you look for and reach out with the right opportunities.
          </p>

          <button
            style={styles.setFundingButton}
            onClick={() => navigate("/investor/create")}
          >
            Create Investor Profile
          </button>
        </div>
      </>
    );
  }

  const sectors = investor.sectors_of_interest || [];
  const hasCriteria =
    investor.min_check_size || investor.max_check_size;

  return (
    <>
      <FontImport />
      <div style={styles.page}>
        <div style={styles.container}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>

          {/* Investor Header */}
          <section style={styles.hero}>
            <div>
              <span style={styles.industryBadge}>
                {investor.investor_type || "Investor"}
              </span>

              <h1 style={styles.investorName}>
                {investor.display_name || investor.full_name}
              </h1>

              <p style={styles.location}>
                📍 {investor.location || "Location not added"}
              </p>
            </div>

            <div style={styles.heroViews}>
              <span style={styles.viewsNumber}>
                {investor.profile_views || 0}
              </span>

              <span style={styles.viewsLabel}>Profile Views</span>
            </div>
          </section>

          <div style={styles.layout}>
            <main style={styles.mainContent}>
              {/* Investment Thesis */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>01</span>

                  <div>
                    <h2 style={styles.heading}>Investment Thesis</h2>
                    <p style={styles.subheading}>
                      What this investor looks for and why.
                    </p>
                  </div>
                </div>

                <p style={styles.description}>
                  {investor.thesis ||
                    "No investment thesis added yet."}
                </p>
              </section>

              {/* Investment Criteria */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>02</span>

                  <div>
                    <h2 style={styles.heading}>Investment Criteria</h2>
                    <p style={styles.subheading}>
                      The kind of businesses this investor backs.
                    </p>
                  </div>
                </div>

                <div style={styles.stats}>
                  <Stat
                    title="Check Size"
                    value={formatRange(
                      investor.min_check_size,
                      investor.max_check_size
                    )}
                  />

                  <Stat
                    title="Preferred Stage"
                    value={investor.preferred_stage || "Any stage"}
                  />

                  <Stat
                    title="Geographic Focus"
                    value={investor.geographic_focus || "Not specified"}
                  />

                  <Stat
                    title="Investments Made"
                    value={investor.investments_made || 0}
                  />
                </div>

                {sectors.length > 0 && (
                  <div style={styles.tagRow}>
                    {sectors.map((sector) => (
                      <span key={sector} style={styles.tag}>
                        {sector}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Investing Status */}
              <section style={styles.fundingCard}>
                <div style={styles.fundingTop}>
                  <div>
                    <span style={styles.fundingLabel}>
                      INVESTING STATUS
                    </span>

                    <h2 style={styles.fundingAmount}>
                      {investor.investing_status ||
                        "Status not set"}
                    </h2>

                    {!hasCriteria && (
                      <button
                        onClick={() => navigate("/investor/edit")}
                        style={styles.setFundingButton}
                      >
                        Set Investment Criteria
                      </button>
                    )}
                  </div>

                  <div style={styles.fundingIcon}>↗</div>
                </div>

                {investor.portfolio_highlights && (
                  <>
                    <div style={styles.divider}></div>

                    <h3 style={styles.useTitle}>
                      Portfolio Highlights
                    </h3>

                    <p style={styles.fundingReason}>
                      {investor.portfolio_highlights}
                    </p>
                  </>
                )}

                <button
                  onClick={() => navigate("/investor/edit")}
                  style={styles.manageFundingButton}
                >
                  Edit Investor Profile
                </button>
              </section>
            </main>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
              <section style={styles.sideCard}>
                <h3 style={styles.sideTitle}>Profile Completeness</h3>

                <div style={styles.scoreCircle}>
                  {investor.profile_completeness || 0}%
                </div>

                <p style={styles.sideText}>
                  A more complete profile gets matched with more
                  relevant businesses.
                </p>
              </section>

              <section style={styles.matchCard}>
                <span style={styles.matchEyebrow}>
                  BUSINESS CONNECTIONS
                </span>

                <h3 style={styles.matchTitle}>Manage your matches</h3>

                <p style={styles.matchText}>
                  Review businesses that want to connect with you.
                </p>

                <button
                  style={styles.matchButton}
                  onClick={() => navigate("/investor-matches")}
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
      <span style={styles.statTitle}>{title}</span>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  );
}

function formatMoney(amount) {
  if (!amount) {
    return "KES 0";
  }
  return `KES ${Number(amount).toLocaleString()}`;
}

function formatRange(min, max) {
  if (!min && !max) return "Not specified";
  if (min && max) return `${formatMoney(min)} – ${formatMoney(max)}`;
  if (min) return `From ${formatMoney(min)}`;
  return `Up to ${formatMoney(max)}`;
}

// Brand palette (matches Landing page / BusinessProfile)
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

  investorName: {
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
    gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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

  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "20px",
  },

  tag: {
    background: "#EFE2BE",
    color: "#15402B",
    padding: "7px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
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

export default InvestorProfile;
