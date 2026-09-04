import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BusinessDetails() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await api.get(`/businesses/${id}`);
        setBusiness(response.data.data);
      } catch (error) {
        console.error("Error fetching business:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const handleMatchmake = async () => {
    try {
      setMatchLoading(true);
      setMessage("");

      const response = await api.post(
        `/matchmaking/business/${id}`,
        {
          investment_amount: 0,
          investment_type: "Matchmaking",
          message:
            "I am interested in exploring a business partnership.",
          special_request: false,
        }
      );

      setMessage(
        response.data.message ||
          "Matchmake request sent successfully."
      );
    } catch (error) {
      console.error("Matchmaking error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to send matchmaking request."
      );
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FontImport />
        <div style={styles.page}>
          <h2 style={styles.loading}>Loading business...</h2>
        </div>
      </>
    );
  }

  if (!business) {
    return (
      <>
        <FontImport />
        <div style={styles.page}>
          <h2 style={styles.loading}>Business not found</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <BackButton />

        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>
              {business.business_name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 style={styles.title}>
                {business.business_name}
              </h1>

              <span style={styles.badge}>
                ✅ Verified Business
              </span>

              <p style={styles.info}>
                🏢 {business.industry}
              </p>

              <p style={styles.info}>
                📍 {business.location}
              </p>
            </div>
          </div>

          <div style={styles.metrics}>
            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>👀 Profile Views</h3>
              <h2 style={styles.metricValue}>{business.views || 0}</h2>
            </div>

            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>👥 Employees</h3>
              <h2 style={styles.metricValue}>{business.employees || 0}</h2>
            </div>

            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>📅 Founded</h3>
              <h2 style={styles.metricValue}>
                {business.year_established || "N/A"}
              </h2>
            </div>
          </div>

          <hr style={styles.divider} />

          <h2 style={styles.sectionTitle}>About Business</h2>

          <p style={styles.description}>
            {business.description || "No description available."}
          </p>

          <h2 style={styles.sectionTitle}>📊 Business Financials</h2>

          <div style={styles.metrics}>
            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>Annual Revenue</h3>
              <h2 style={styles.metricValue}>
                KES{" "}
                {Number(business.annual_revenue || 0).toLocaleString()}
              </h2>
            </div>

            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>Monthly Gross</h3>
              <h2 style={styles.metricValue}>
                KES{" "}
                {Number(business.monthly_gross || 0).toLocaleString()}
              </h2>
            </div>

            <div style={styles.metricCard}>
              <h3 style={styles.metricLabel}>Monthly Net</h3>
              <h2 style={styles.metricValue}>
                KES{" "}
                {Number(business.monthly_net || 0).toLocaleString()}
              </h2>
            </div>
          </div>

          <h2 style={styles.sectionTitle}>💰 Funding Request</h2>

          <div style={styles.fundingCard}>
            <h1 style={styles.fundingAmount}>
              KES{" "}
              {Number(business.amount_seeking || 0).toLocaleString()}
            </h1>

            <p style={styles.purposeLabel}>
              <strong>Purpose:</strong>
            </p>

            <p style={styles.purposeText}>
              {business.funding_reason || "Not specified"}
            </p>
          </div>

          <button
            onClick={handleMatchmake}
            disabled={matchLoading}
            style={styles.button}
          >
            {matchLoading
              ? "Sending..."
              : "🤝 Matchmake With Business"}
          </button>

          {message && (
            <p style={styles.message}>{message}</p>
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
    minHeight: "100vh",
    padding: "40px",
    background: "#FBF6EA",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#FFFFFF",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 10px 30px rgba(20,17,13,0.10)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "30px",
  },

  logo: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#15402B",
    color: "#E7A93D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: "bold",
    fontFamily: "'Fraunces', serif",
    flexShrink: 0,
  },

  title: {
    marginBottom: "10px",
    color: "#14110D",
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
  },

  badge: {
    display: "inline-block",
    background: "#EFE2BE",
    color: "#15402B",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
    fontSize: "13px",
  },

  info: {
    color: "#55503F",
    marginTop: "8px",
  },

  description: {
    color: "#443F32",
    lineHeight: "1.8",
    marginBottom: "30px",
  },

  sectionTitle: {
    color: "#14110D",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  divider: {
    border: "none",
    borderTop: "1px solid rgba(20,17,13,0.1)",
    margin: "30px 0",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "20px",
    margin: "30px 0",
  },

  metricCard: {
    background: "#FBF6EA",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
  },

  metricLabel: {
    color: "#55503F",
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 8px",
  },

  metricValue: {
    color: "#14110D",
    fontFamily: "'Space Mono', monospace",
    margin: 0,
    fontSize: "20px",
  },

  fundingCard: {
    background: "#EFE2BE",
    border: "1px solid rgba(21,64,43,0.18)",
    borderRadius: "14px",
    padding: "25px",
    margin: "20px 0 30px",
  },

  fundingAmount: {
    color: "#15402B",
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    margin: "0 0 12px",
  },

  purposeLabel: {
    color: "#14110D",
    margin: "0 0 6px",
  },

  purposeText: {
    color: "#443F32",
    lineHeight: "1.7",
    margin: 0,
  },

  button: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#E7A93D",
    color: "#14110D",
    fontSize: "17px",
    fontWeight: "bold",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    background: "#EFE2BE",
    color: "#15402B",
    textAlign: "center",
  },

  loading: {
    textAlign: "center",
    marginTop: "100px",
    fontSize: "28px",
    color: "#14110D",
    fontFamily: "'Fraunces', serif",
  },
};

export default BusinessDetails;
