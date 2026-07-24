import { useNavigate } from "react-router-dom";

function InvestorProfile() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: "👀",
      title: "Businesses Viewed",
      value: "42",
      accent: "#E7A93D",
    },
    {
      icon: "🤝",
      title: "Matchmaking Requests",
      value: "8",
      accent: "#15402B",
    },
    {
      icon: "💰",
      title: "Funding Opportunities",
      value: "156",
      accent: "#C33F26",
    },
    {
      icon: "⭐",
      title: "Saved Businesses",
      value: "24",
      accent: "#E7A93D",
    },
  ];

  const recentActivity = [
    "Viewed Green Harvest Ltd.",
    "Sent matchmaking request to MotoPay Africa.",
    "New Clean Energy funding opportunity available.",
    "African startup news updated today.",
  ];

  const watchlist = [
    "Green Harvest Ltd.",
    "MotoPay Africa",
    "HealthLink",
    "EcoBuild Kenya",
  ];

  const recommended = [
    {
      name: "SolarRise Energy",
      sector: "Clean Energy",
      location: "Nairobi",
    },
    {
      name: "AgriSmart Africa",
      sector: "Agritech",
      location: "Kisumu",
    },
    {
      name: "HealthLink",
      sector: "HealthTech",
      location: "Kigali",
    },
  ];

  const quickActions = [
    { label: "🔍 Browse Businesses", path: "/browse" },
    { label: "💰 Funding", path: "/funding" },
    { label: "🤝 Matchmaking", path: "/matchmaking" },
    { label: "⭐ Watchlist", path: "/watchlist" },
    { label: "💼 Portfolio", path: "/portfolio" },
    { label: "💬 Messages", path: "/messages" },
  ];

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.container}>
          {/* Hero */}
          <section style={styles.hero}>
            <div style={styles.heroPattern} />

            <div style={styles.heroInner}>
              <span style={styles.eyebrow}>Investor Dashboard</span>

              <h1 style={styles.heroTitle}>
                👋 Welcome Back, <em style={styles.heroEm}>Investor</em>
              </h1>

              <p style={styles.heroPara}>
                Discover promising African businesses, monitor
                opportunities, and build valuable investment
                partnerships through Investor Mtaani.
              </p>

              <div style={styles.heroButtons}>
                <button
                  style={styles.btnPrimary}
                  onClick={() => navigate("/browse")}
                >
                  Browse Businesses
                </button>

                <button
                  style={styles.btnSecondary}
                  onClick={() => navigate("/portfolio")}
                >
                  My Portfolio
                </button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section style={styles.statsGrid}>
            {stats.map((stat) => (
              <div
                key={stat.title}
                style={{
                  ...styles.statCard,
                  borderTop: `4px solid ${stat.accent}`,
                }}
              >
                <div style={styles.statIcon}>{stat.icon}</div>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statTitle}>{stat.title}</p>
              </div>
            ))}
          </section>

          <div style={styles.layout}>
            <main style={styles.mainContent}>
              {/* Recent Activity */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>01</span>

                  <div>
                    <h2 style={styles.heading}>Recent Activity</h2>
                    <p style={styles.subheading}>
                      Latest activity from your account.
                    </p>
                  </div>
                </div>

                <ul style={styles.list}>
                  {recentActivity.map((item, index) => (
                    <li key={index} style={styles.listItem}>
                      <span style={styles.listBullet}>✅</span> {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommended Businesses */}
              <section style={styles.card}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIcon}>02</span>

                  <div>
                    <h2 style={styles.heading}>
                      Recommended Businesses
                    </h2>
                    <p style={styles.subheading}>
                      Businesses you may be interested in.
                    </p>
                  </div>
                </div>

                <div style={styles.businessList}>
                  {recommended.map((business, index) => (
                    <div key={index} style={styles.businessItem}>
                      <h3 style={styles.businessName}>
                        {business.name}
                      </h3>

                      <p style={styles.businessMeta}>
                        {business.sector} • {business.location}
                      </p>

                      <button
                        style={styles.btnPrimarySmall}
                        onClick={() => navigate("/browse")}
                      >
                        View Business
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            {/* Sidebar */}
            <aside style={styles.sidebar}>
              <section style={styles.sideCard}>
                <div style={styles.sectionHeading}>
                  <span style={styles.sectionIconSmall}>★</span>

                  <div>
                    <h3 style={styles.sideTitle}>Watchlist</h3>
                    <p style={styles.subheading}>
                      Businesses you're following.
                    </p>
                  </div>
                </div>

                <ul style={styles.list}>
                  {watchlist.map((business, index) => (
                    <li key={index} style={styles.listItem}>
                      <span style={styles.listBullet}>⭐</span> {business}
                    </li>
                  ))}
                </ul>

                <button
                  style={styles.btnOutline}
                  onClick={() => navigate("/watchlist")}
                >
                  Open Watchlist
                </button>
              </section>

              <section style={styles.matchCard}>
                <span style={styles.matchEyebrow}>QUICK ACTIONS</span>

                <h3 style={styles.matchTitle}>
                  Navigate the platform
                </h3>

                <div style={styles.quickActions}>
                  {quickActions.map((action) => (
                    <button
                      key={action.path}
                      style={styles.quickActionButton}
                      onClick={() => navigate(action.path)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
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
    padding: "0 0 80px",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "0 20px",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background: "#15402B",
    borderRadius: "0 0 20px 20px",
    padding: "70px 40px",
    marginBottom: "36px",
    marginLeft: "-20px",
    marginRight: "-20px",
  },

  heroPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px), repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px)",
    pointerEvents: "none",
  },

  heroInner: {
    position: "relative",
    maxWidth: "720px",
    margin: "0 auto",
    textAlign: "center",
  },

  eyebrow: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "13px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#E7A93D",
    display: "inline-block",
    marginBottom: "18px",
  },

  heroTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "clamp(30px, 4.5vw, 46px)",
    lineHeight: "1.15",
    color: "#FBF6EA",
    margin: "0 0 18px",
  },

  heroEm: {
    fontStyle: "italic",
    fontWeight: "500",
    color: "#E7A93D",
  },

  heroPara: {
    fontSize: "17px",
    lineHeight: "1.75",
    color: "#D9E5DC",
    margin: "0 auto 32px",
    maxWidth: "560px",
  },

  heroButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  btnPrimary: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "600",
    fontSize: "15px",
    padding: "15px 30px",
    borderRadius: "8px",
    border: "none",
    background: "#E7A93D",
    color: "#14110D",
    cursor: "pointer",
  },

  btnSecondary: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "600",
    fontSize: "15px",
    padding: "15px 30px",
    borderRadius: "8px",
    border: "2px solid #FBF6EA",
    background: "transparent",
    color: "#FBF6EA",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "14px",
    padding: "26px 20px",
    textAlign: "center",
  },

  statIcon: {
    fontSize: "24px",
    marginBottom: "10px",
  },

  statValue: {
    fontFamily: "'Space Mono', monospace",
    fontWeight: "700",
    fontSize: "28px",
    color: "#14110D",
    margin: "0 0 6px",
  },

  statTitle: {
    color: "#55503F",
    fontSize: "13px",
    margin: 0,
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
    marginBottom: "20px",
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
    flexShrink: 0,
  },

  sectionIconSmall: {
    width: "34px",
    height: "34px",
    background: "#C33F26",
    color: "#FBF6EA",
    borderRadius: "9px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "800",
    flexShrink: 0,
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
    margin: 0,
  },

  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  listItem: {
    color: "#443F32",
    fontSize: "15px",
    lineHeight: "1.6",
    borderBottom: "1px solid rgba(20,17,13,0.06)",
    paddingBottom: "12px",
  },

  listBullet: {
    marginRight: "6px",
  },

  businessList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  businessItem: {
    background: "#FBF6EA",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "12px",
    padding: "20px",
  },

  businessName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 6px",
    fontSize: "18px",
  },

  businessMeta: {
    color: "#55503F",
    fontSize: "14px",
    margin: "0 0 14px",
  },

  btnPrimarySmall: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: "700",
    fontSize: "13px",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#E7A93D",
    color: "#14110D",
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
  },

  sideTitle: {
    color: "#14110D",
    margin: "0 0 4px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    fontSize: "17px",
  },

  btnOutline: {
    width: "100%",
    marginTop: "18px",
    background: "transparent",
    color: "#15402B",
    border: "1px solid #15402B",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
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
    fontSize: "20px",
    margin: "10px 0 20px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  quickActionButton: {
    width: "100%",
    textAlign: "left",
    background: "rgba(251,246,234,0.08)",
    color: "#FBF6EA",
    border: "1px solid rgba(251,246,234,0.15)",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: "600",
    fontFamily: "'Sora', sans-serif",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default InvestorProfile;
