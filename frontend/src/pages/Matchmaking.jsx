import { useEffect, useState } from "react";
import api from "../services/api";

function Matchmaking() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      let response;

      if (user.role === "business") {
        response = await api.get("/matchmaking/business");
      } else {
        response = await api.get("/matchmaking/investor");
      }

      setMatches(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/matchmaking/${id}/status`, {
        status,
      });

      fetchMatches();
    } catch (error) {
      console.error(error);
    }
  };

  const badgeStyle = (status) => {
    switch (status) {
      case "accepted":
        return {
          background: "#EFE2BE",
          color: "#15402B",
        };

      case "declined":
        return {
          background: "#FBE3DB",
          color: "#C33F26",
        };

      default:
        return {
          background: "rgba(231,169,61,0.18)",
          color: "#B9832A",
        };
    }
  };

  if (loading) {
    return (
      <>
        <FontImport />
        <div style={styles.page}>
          <h2 style={styles.loadingText}>
            Loading matchmaking requests...
          </h2>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.container}>
          <span style={styles.eyebrow}>INVESTOR CONNECTIONS</span>

          <h1 style={styles.title}>🤝 Matchmaking</h1>

          <p style={styles.subtitle}>
            Manage your investor and business matches.
          </p>

          {matches.length === 0 ? (
            <div style={styles.emptyCard}>
              <h2 style={styles.emptyTitle}>
                No matchmaking requests yet.
              </h2>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} style={styles.card}>
                <h2 style={styles.businessName}>
                  {match.business_name ||
                    match.startup_name ||
                    "Business"}
                </h2>

                <p style={styles.investorLine}>
                  Investor:{" "}
                  <strong style={styles.investorName}>
                    {match.investor_name || "Investor"}
                  </strong>
                </p>

                <p style={styles.statusLine}>
                  Status:{" "}
                  <span
                    style={{
                      ...badgeStyle(match.status),
                      ...styles.statusBadge,
                    }}
                  >
                    {match.status}
                  </span>
                </p>

                {user.role === "business" &&
                  match.status === "pending" && (
                    <div style={styles.actionRow}>
                      <button
                        onClick={() =>
                          updateStatus(match.id, "accepted")
                        }
                        style={styles.acceptButton}
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(match.id, "declined")
                        }
                        style={styles.declineButton}
                      >
                        Decline
                      </button>
                    </div>
                  )}
              </div>
            ))
          )}
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
    padding: "50px 40px 80px",
    background: "#FBF6EA",
    minHeight: "100vh",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "820px",
    margin: "0 auto",
  },

  eyebrow: {
    color: "#C33F26",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'Space Mono', monospace",
    textTransform: "uppercase",
  },

  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "38px",
    margin: "14px 0 8px",
    color: "#14110D",
  },

  subtitle: {
    color: "#55503F",
    marginBottom: "30px",
    fontSize: "16px",
  },

  loadingText: {
    fontFamily: "'Fraunces', serif",
    color: "#14110D",
    padding: "40px",
  },

  emptyCard: {
    background: "#FFFFFF",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    border: "1px solid rgba(20,17,13,0.08)",
  },

  emptyTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: 0,
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "20px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 6px 18px rgba(20,17,13,.06)",
  },

  businessName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 12px",
    fontSize: "20px",
  },

  investorLine: {
    color: "#55503F",
    margin: "0 0 10px",
  },

  investorName: {
    color: "#14110D",
  },

  statusLine: {
    color: "#55503F",
    margin: 0,
  },

  statusBadge: {
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    textTransform: "capitalize",
  },

  actionRow: {
    display: "flex",
    gap: "15px",
    marginTop: "22px",
  },

  acceptButton: {
    background: "#15402B",
    color: "#FBF6EA",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  declineButton: {
    background: "transparent",
    color: "#C33F26",
    border: "1px solid #C33F26",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },
};

export default Matchmaking;
