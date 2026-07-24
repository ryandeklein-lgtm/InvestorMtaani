import { useNavigate } from "react-router-dom";

export default function Portfolio() {
  const navigate = useNavigate();

  const investments = [
    {
      id: 1,
      business: "MotoPay Africa",
      amount: "KES 8,500,000",
      status: "Active",
    },
    {
      id: 2,
      business: "Green Harvest Ltd",
      amount: "KES 12,000,000",
      status: "Active",
    },
    {
      id: 3,
      business: "HealthLink",
      amount: "KES 5,000,000",
      status: "Pending",
    },
  ];

  const statusStyle = (status) => {
    switch (status) {
      case "Active":
        return { background: "#EFE2BE", color: "#15402B" };
      case "Pending":
        return { background: "rgba(231,169,61,0.18)", color: "#B9832A" };
      default:
        return { background: "#FBE3DB", color: "#C33F26" };
    }
  };

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

          <span style={styles.eyebrow}>INVESTMENT SUMMARY</span>

          <h1 style={styles.title}>💼 My Portfolio</h1>

          <p style={styles.subtitle}>
            A summary of your current investments.
          </p>

          {investments.map((investment) => (
            <div key={investment.id} style={styles.card}>
              <h2 style={styles.businessName}>
                {investment.business}
              </h2>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Investment</span>
                <strong style={styles.detailValue}>
                  {investment.amount}
                </strong>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>
                <span
                  style={{
                    ...statusStyle(investment.status),
                    ...styles.statusBadge,
                  }}
                >
                  {investment.status}
                </span>
              </div>
            </div>
          ))}
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
    maxWidth: "820px",
    margin: "0 auto",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#C33F26",
    cursor: "pointer",
    marginBottom: "20px",
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
    marginBottom: "30px",
    fontSize: "16px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "20px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 5px 15px rgba(20,17,13,.06)",
  },

  businessName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 16px",
    fontSize: "20px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(20,17,13,0.06)",
  },

  detailLabel: {
    color: "#55503F",
    fontSize: "14px",
  },

  detailValue: {
    color: "#14110D",
    fontFamily: "'Space Mono', monospace",
    fontSize: "15px",
  },

  statusBadge: {
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },
};
