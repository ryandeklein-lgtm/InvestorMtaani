import { useNavigate } from "react-router-dom";

export default function Watchlist() {
  const navigate = useNavigate();

  const watchlist = [
    {
      id: 1,
      name: "Green Harvest Ltd",
      industry: "AgriTech",
      location: "Nakuru",
    },
    {
      id: 2,
      name: "MotoPay Africa",
      industry: "FinTech",
      location: "Nairobi",
    },
    {
      id: 3,
      name: "HealthLink",
      industry: "HealthTech",
      location: "Kisumu",
    },
    {
      id: 4,
      name: "EcoBuild Kenya",
      industry: "Clean Energy",
      location: "Mombasa",
    },
  ];

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.container}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            ← Back
          </button>

          <span style={styles.eyebrow}>SAVED BUSINESSES</span>

          <h1 style={styles.title}>⭐ My Watchlist</h1>

          <p style={styles.subtitle}>
            Businesses you are monitoring for potential investment.
          </p>

          <div style={styles.grid}>
            {watchlist.map((business) => (
              <div key={business.id} style={styles.card}>
                <span style={styles.industryBadge}>
                  {business.industry}
                </span>

                <h2 style={styles.businessName}>
                  {business.name}
                </h2>

                <p style={styles.location}>
                  📍 {business.location}
                </p>

                <button
                  onClick={() =>
                    navigate(`/business/${business.id}`)
                  }
                  style={styles.viewButton}
                >
                  View Business
                </button>
              </div>
            ))}
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
    padding: "40px 8% 80px",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backButton: {
    marginBottom: "20px",
    border: "none",
    background: "transparent",
    color: "#C33F26",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    padding: 0,
  },

  eyebrow: {
    display: "block",
    color: "#C33F26",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'Space Mono', monospace",
    textTransform: "uppercase",
    marginBottom: "12px",
  },

  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "36px",
    margin: "0 0 8px",
    color: "#14110D",
  },

  subtitle: {
    color: "#55503F",
    marginBottom: "35px",
    fontSize: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "25px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 5px 15px rgba(20,17,13,.06)",
  },

  industryBadge: {
    display: "inline-block",
    background: "rgba(231,169,61,0.18)",
    color: "#B9832A",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
    textTransform: "uppercase",
    marginBottom: "14px",
  },

  businessName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 8px",
    fontSize: "19px",
  },

  location: {
    color: "#55503F",
    margin: "0 0 18px",
  },

  viewButton: {
    width: "100%",
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
  },
};
