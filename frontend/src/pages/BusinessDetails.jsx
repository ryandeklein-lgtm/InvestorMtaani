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
      <h2 style={styles.loading}>
        Loading business...
      </h2>
    );
  }

  if (!business) {
    return (
      <h2 style={styles.loading}>
        Business not found
      </h2>
    );
  }

  return (
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
            <h3>👀 Profile Views</h3>
            <h2>{business.views || 0}</h2>
          </div>

          <div style={styles.metricCard}>
            <h3>👥 Employees</h3>
            <h2>{business.employees || 0}</h2>
          </div>

          <div style={styles.metricCard}>
            <h3>📅 Founded</h3>
            <h2>{business.year_established || "N/A"}</h2>
          </div>
        </div>

        <hr />

        <h2>About Business</h2>

        <p style={styles.description}>
          {business.description || "No description available."}
        </p>

        <h2>📊 Business Financials</h2>

        <div style={styles.metrics}>
          <div style={styles.metricCard}>
            <h3>Annual Revenue</h3>
            <h2>
              KES {Number(business.annual_revenue || 0).toLocaleString()}
            </h2>
          </div>

          <div style={styles.metricCard}>
            <h3>Monthly Gross</h3>
            <h2>
              KES {Number(business.monthly_gross || 0).toLocaleString()}
            </h2>
          </div>

          <div style={styles.metricCard}>
            <h3>Monthly Net</h3>
            <h2>
              KES {Number(business.monthly_net || 0).toLocaleString()}
            </h2>
          </div>
        </div>

        <h2>💰 Funding Request</h2>

        <div style={styles.fundingCard}>
          <h1 style={{ color: "#16a34a" }}>
            KES {Number(business.amount_seeking || 0).toLocaleString()}
          </h1>

          <p>
            <strong>Purpose:</strong>
          </p>

          <p>
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
          <p style={styles.message}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f8fafc",
  },

  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
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
    background: "#16a34a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    fontWeight: "bold",
  },

  title: {
    marginBottom: "10px",
    color: "#0f172a",
  },

  badge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },

  info: {
    color: "#64748b",
    marginTop: "8px",
  },

  description: {
    color: "#475569",
    lineHeight: "1.8",
    marginBottom: "30px",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "20px",
    margin: "30px 0",
  },

  metricCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "center",
  },

  fundingCard: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "14px",
    padding: "25px",
    margin: "20px 0 30px",
  },

  button: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#16a34a",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    background: "#dcfce7",
    color: "#166534",
    textAlign: "center",
  },

  loading: {
    textAlign: "center",
    marginTop: "100px",
    fontSize: "28px",
    color: "#0f172a",
  },
};

export default BusinessDetails;