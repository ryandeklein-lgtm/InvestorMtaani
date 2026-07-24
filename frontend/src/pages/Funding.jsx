import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Funding() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const [form, setForm] = useState({
    amount_requested: "",
    funding_type: "",
    funding_reason: "",
    expected_impact: "",
    funding_timeline: "",
  });

  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundingRequests();
  }, [role]);

  const fetchFundingRequests = async () => {
    try {
      setLoading(true);

      // Businesses see their own requests
      if (role === "business") {
        const response = await api.get("/funding/me");
        setRequests(response.data.data || []);
        return;
      }

      // Investors and public visitors see open opportunities
      const response = await api.get("/funding");
      setRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching funding requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role !== "business") {
      alert("Only business accounts can request funding.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/funding", {
        ...form,
        amount_requested: Number(form.amount_requested),
      });

      alert("Funding request created successfully!");

      setForm({
        amount_requested: "",
        funding_type: "",
        funding_reason: "",
        expected_impact: "",
        funding_timeline: "",
      });

      await fetchFundingRequests();
    } catch (error) {
      console.error("Funding request error:", error);

      alert(
        error.response?.data?.message ||
          "Could not create funding request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // BUSINESS VIEW
  if (role === "business") {
    return (
      <>
        <FontImport />

        <div style={styles.page}>
          <div style={styles.container}>
            <div style={styles.header}>
              <span style={styles.eyebrow}>BUSINESS FUNDING</span>

              <h1 style={styles.title}>Request funding</h1>

              <p style={styles.subtitle}>
                Tell investors how much capital your business needs,
                why you need it, and what the investment will help
                you achieve.
              </p>
            </div>

            <div style={styles.layout}>
              <form onSubmit={handleSubmit} style={styles.formCard}>
                <h2 style={styles.cardTitle}>
                  Create Funding Request
                </h2>

                <label style={styles.label}>
                  Amount Requested

                  <div style={styles.moneyInput}>
                    <span style={styles.currency}>KES</span>

                    <input
                      name="amount_requested"
                      type="number"
                      min="1"
                      placeholder="2500000"
                      value={form.amount_requested}
                      onChange={handleChange}
                      style={styles.moneyField}
                      required
                    />
                  </div>
                </label>

                <label style={styles.label}>
                  Funding Type

                  <select
                    name="funding_type"
                    value={form.funding_type}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      Select funding type
                    </option>

                    <option value="Equity Investment">
                      Equity Investment
                    </option>

                    <option value="Debt / Loan">
                      Debt / Loan
                    </option>

                    <option value="Revenue Share">
                      Revenue Share
                    </option>

                    <option value="Strategic Partnership">
                      Strategic Partnership
                    </option>
                  </select>
                </label>

                <label style={styles.label}>
                  What will the funding be used for?

                  <textarea
                    name="funding_reason"
                    placeholder="Explain exactly how the capital will be used..."
                    value={form.funding_reason}
                    onChange={handleChange}
                    style={styles.textarea}
                    required
                  />
                </label>

                <label style={styles.label}>
                  Expected Impact

                  <textarea
                    name="expected_impact"
                    placeholder="Example: Increase production, hire employees and expand into new markets."
                    value={form.expected_impact}
                    onChange={handleChange}
                    style={styles.textarea}
                  />
                </label>

                <label style={styles.label}>
                  Funding Timeline

                  <select
                    name="funding_timeline"
                    value={form.funding_timeline}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="">
                      Select timeline
                    </option>

                    <option value="Immediately">
                      Immediately
                    </option>

                    <option value="Within 1 month">
                      Within 1 month
                    </option>

                    <option value="Within 3 months">
                      Within 3 months
                    </option>

                    <option value="Within 6 months">
                      Within 6 months
                    </option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  {submitting
                    ? "Submitting Request..."
                    : "Submit Funding Request"}
                </button>
              </form>

              <aside style={styles.sidebar}>
                <div style={styles.infoCard}>
                  <span style={styles.infoEyebrow}>
                    YOUR FUNDING STORY
                  </span>

                  <h2 style={styles.infoTitle}>
                    Make the ask clear.
                  </h2>

                  <p style={styles.infoText}>
                    Investors should quickly understand how much
                    you need, where the money will go, and what
                    growth the investment could unlock.
                  </p>
                </div>

                <div style={styles.requestsCard}>
                  <h3 style={styles.requestsTitle}>
                    Your Funding Requests
                  </h3>

                  {loading ? (
                    <p style={styles.muted}>Loading...</p>
                  ) : requests.length === 0 ? (
                    <p style={styles.muted}>
                      You have not created a funding request yet.
                    </p>
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.id}
                        style={styles.requestItem}
                      >
                        <strong style={styles.requestAmount}>
                          {formatMoney(
                            request.amount_requested
                          )}
                        </strong>

                        <span style={styles.requestType}>
                          {request.funding_type}
                        </span>

                        <span style={styles.status}>
                          {request.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </>
    );
  }

  // INVESTOR / PUBLIC VIEW
  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <span style={styles.eyebrow}>
              INVESTMENT OPPORTUNITIES
            </span>

            <h1 style={styles.title}>
              Businesses seeking funding
            </h1>

            <p style={styles.subtitle}>
              Discover businesses looking for capital,
              strategic partners and investors.
            </p>
          </div>

          {loading ? (
            <div style={styles.messageCard}>
              Loading funding opportunities...
            </div>
          ) : requests.length === 0 ? (
            <div style={styles.messageCard}>
              <h2 style={styles.messageTitle}>
                No open funding opportunities yet
              </h2>

              <p style={styles.muted}>
                New business funding requests will appear here.
              </p>
            </div>
          ) : (
            <div style={styles.opportunitiesGrid}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={styles.opportunityCard}
                >
                  <div style={styles.opportunityTop}>
                    <span style={styles.industryBadge}>
                      {request.industry || "Business"}
                    </span>

                    <span style={styles.openBadge}>
                      {request.status || "open"}
                    </span>
                  </div>

                  <h2 style={styles.businessName}>
                    {request.business_name}
                  </h2>

                  <p style={styles.location}>
                    📍 {request.location || "Location not set"}
                  </p>

                  <div style={styles.amountBox}>
                    <span style={styles.amountLabel}>
                      FUNDING REQUEST
                    </span>

                    <strong style={styles.bigAmount}>
                      {formatMoney(
                        request.amount_requested
                      )}
                    </strong>
                  </div>

                  <div style={styles.opportunityDetails}>
                    <div>
                      <span style={styles.detailLabel}>
                        Funding Type
                      </span>

                      <strong style={styles.detailValue}>
                        {request.funding_type}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.detailLabel}>
                        Timeline
                      </span>

                      <strong style={styles.detailValue}>
                        {request.funding_timeline ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <h3 style={styles.reasonTitle}>
                    Use of Funds
                  </h3>

                  <p style={styles.reason}>
                    {request.funding_reason}
                  </p>

                  {request.expected_impact && (
                    <>
                      <h3 style={styles.reasonTitle}>
                        Expected Impact
                      </h3>

                      <p style={styles.reason}>
                        {request.expected_impact}
                      </p>
                    </>
                  )}

                  {role === "investor" ? (
                    <button
                      style={styles.matchButton}
                      onClick={() =>
                        navigate(`/business/${request.business_id}`)
                      }
                    >
                      View Business
                    </button>
                  ) : (
                    <button
                      style={styles.matchButton}
                      onClick={() => navigate("/login")}
                    >
                      Login to Explore
                    </button>
                  )}
                </div>
              ))}
            </div>
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

      .im-funding-input:focus,
      .im-funding-textarea:focus {
        outline: none;
        border-color: #E7A93D !important;
        box-shadow: 0 0 0 4px rgba(231,169,61,.20);
      }
    `}</style>
  );
}

function formatMoney(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
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
    padding: "60px 20px 100px",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    maxWidth: "720px",
    marginBottom: "40px",
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
    color: "#14110D",
    fontSize: "42px",
    margin: "14px 0",
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
  },

  subtitle: {
    color: "#55503F",
    lineHeight: "1.7",
    fontSize: "16px",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "28px",
    alignItems: "start",
  },

  formCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  cardTitle: {
    color: "#14110D",
    margin: "0 0 5px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#443F32",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "left",
  },

  input: {
    padding: "14px",
    border: "1px solid rgba(20,17,13,0.15)",
    borderRadius: "10px",
    background: "#FFFFFF",
    color: "#14110D",
    fontSize: "15px",
    fontFamily: "'Sora', sans-serif",
  },

  textarea: {
    minHeight: "120px",
    padding: "14px",
    border: "1px solid rgba(20,17,13,0.15)",
    borderRadius: "10px",
    fontFamily: "'Sora', sans-serif",
    fontSize: "15px",
    resize: "vertical",
  },

  moneyInput: {
    display: "flex",
    border: "1px solid rgba(21,64,43,0.35)",
    borderRadius: "10px",
    overflow: "hidden",
  },

  currency: {
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    background: "#EFE2BE",
    color: "#15402B",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
  },

  moneyField: {
    flex: 1,
    padding: "16px",
    border: "none",
    outline: "none",
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
  },

  submitButton: {
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: "800",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  infoCard: {
    background: "#15402B",
    color: "#FBF6EA",
    borderRadius: "18px",
    padding: "28px",
    border: "1px solid rgba(231,169,61,0.25)",
  },

  infoEyebrow: {
    color: "#E7A93D",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    fontFamily: "'Space Mono', monospace",
  },

  infoTitle: {
    color: "#FBF6EA",
    margin: "14px 0",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  infoText: {
    color: "#D9E5DC",
    lineHeight: "1.7",
  },

  requestsCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "24px",
  },

  requestsTitle: {
    color: "#14110D",
    marginTop: 0,
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  requestItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "16px 0",
    borderBottom: "1px solid rgba(20,17,13,0.08)",
  },

  requestAmount: {
    color: "#14110D",
    fontSize: "18px",
    fontFamily: "'Space Mono', monospace",
  },

  requestType: {
    color: "#55503F",
    fontSize: "14px",
  },

  status: {
    color: "#15402B",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  muted: {
    color: "#55503F",
    lineHeight: "1.6",
  },

  opportunitiesGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },

  opportunityCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "left",
  },

  opportunityTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },

  industryBadge: {
    background: "rgba(231,169,61,0.18)",
    color: "#B9832A",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    fontFamily: "'Space Mono', monospace",
  },

  openBadge: {
    background: "#EFE2BE",
    color: "#15402B",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    fontFamily: "'Space Mono', monospace",
  },

  businessName: {
    color: "#14110D",
    margin: "22px 0 8px",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
  },

  location: {
    color: "#55503F",
  },

  amountBox: {
    background: "#EFE2BE",
    border: "1px solid rgba(21,64,43,0.18)",
    borderRadius: "14px",
    padding: "20px",
    margin: "24px 0",
  },

  amountLabel: {
    display: "block",
    color: "#15402B",
    fontSize: "11px",
    fontWeight: "800",
    marginBottom: "7px",
    fontFamily: "'Space Mono', monospace",
  },

  bigAmount: {
    color: "#14110D",
    fontSize: "25px",
    fontFamily: "'Fraunces', serif",
  },

  opportunityDetails: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
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

  reasonTitle: {
    color: "#14110D",
    fontSize: "15px",
    marginTop: "22px",
    fontFamily: "'Sora', sans-serif",
    fontWeight: "700",
  },

  reason: {
    color: "#55503F",
    lineHeight: "1.7",
  },

  matchButton: {
    width: "100%",
    marginTop: "24px",
    background: "#15402B",
    color: "#FBF6EA",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontWeight: "800",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  messageCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    borderRadius: "18px",
    padding: "50px",
    textAlign: "center",
    color: "#14110D",
  },

  messageTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    margin: "0 0 10px",
  },
};

export default Funding;
