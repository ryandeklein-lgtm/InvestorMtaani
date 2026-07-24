import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BrowseBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const selectedIndustry = searchParams.get("industry");

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get("/businesses");

        console.log("Businesses API Response:", response.data);

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data.businesses)) {
          data = response.data.businesses;
        }

        setBusinesses(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = selectedIndustry
    ? businesses.filter(
        (business) =>
          business.industry &&
          business.industry.toLowerCase() ===
            selectedIndustry.toLowerCase()
      )
    : businesses;

  if (loading) {
    return (
      <>
        <FontImport />
        <div style={styles.page}>
          <h2 style={styles.center}>Loading businesses...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.heroPattern} />

        <div style={styles.inner}>
          <BackButton />

          <span style={styles.eyebrow}>Investor Mtaani</span>

          <h1 style={styles.title}>
            {selectedIndustry
              ? `${selectedIndustry} Businesses`
              : "Discover Businesses"}
          </h1>

          <p style={styles.subtitle}>
            {selectedIndustry
              ? `Explore businesses in the ${selectedIndustry} sector.`
              : "Explore businesses looking for investment opportunities."}
          </p>

          {selectedIndustry && (
            <div style={styles.filterContainer}>
              <span style={styles.filterBadge}>
                {selectedIndustry}
              </span>

              <Link to="/browse" style={styles.clearFilter}>
                View All Businesses
              </Link>
            </div>
          )}

          {filteredBusinesses.length === 0 ? (
            <div style={styles.empty}>
              <h2 style={styles.emptyTitle}>No businesses found</h2>

              <p style={styles.emptyText}>
                {selectedIndustry
                  ? `There are currently no businesses listed under ${selectedIndustry}.`
                  : "There are currently no registered businesses."}
              </p>

              <Link to="/browse" style={styles.button}>
                Refresh
              </Link>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredBusinesses.map((business) => (
                <div key={business.id} style={styles.card}>
                  <h2 style={styles.cardTitle}>
                    {business.business_name || "Unnamed Business"}
                  </h2>

                  <p style={styles.cardLine}>
                    🏢 {business.industry || "N/A"}
                  </p>

                  <p style={styles.cardLine}>
                    📍 {business.location || "N/A"}
                  </p>

                  <p style={styles.cardLine}>
                    👥 {business.employees || 0} employees
                  </p>

                  <p style={styles.cardLine}>
                    💰 Annual Revenue
                    <br />
                    KES{" "}
                    {Number(
                      business.annual_revenue || 0
                    ).toLocaleString()}
                  </p>

                  <p style={styles.cardLine}>
                    👁️{" "}
                    {business.views || business.website_visitors || 0}{" "}
                    views
                  </p>

                  <Link
                    to={`/business/${business.id}`}
                    style={styles.button}
                  >
                    View Business
                  </Link>
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
    position: "relative",
    minHeight: "100vh",
    padding: "50px 40px 80px",
    background: "#15402B",
    overflow: "hidden",
    fontFamily: "'Sora', sans-serif",
  },

  heroPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px), repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px)",
    pointerEvents: "none",
  },

  inner: {
    position: "relative",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  eyebrow: {
    display: "block",
    textAlign: "center",
    fontFamily: "'Space Mono', monospace",
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#E7A93D",
    marginTop: "10px",
  },

  title: {
    color: "#FBF6EA",
    textAlign: "center",
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "clamp(30px, 4.5vw, 44px)",
    margin: "14px 0 12px",
  },

  subtitle: {
    color: "#D9E5DC",
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "16px",
  },

  filterContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },

  filterBadge: {
    background: "rgba(231,169,61,0.18)",
    color: "#E7A93D",
    padding: "10px 20px",
    borderRadius: "999px",
    fontWeight: "700",
    fontFamily: "'Space Mono', monospace",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  clearFilter: {
    color: "#FBF6EA",
    textDecoration: "underline",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "25px",
  },

  card: {
    background: "#FFFFFF",
    padding: "25px",
    borderRadius: "18px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 10px 25px rgba(20,17,13,.12)",
    color: "#443F32",
  },

  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 10px",
    fontSize: "20px",
  },

  cardLine: {
    margin: "0 0 8px",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  button: {
    display: "inline-block",
    marginTop: "15px",
    padding: "12px 20px",
    borderRadius: "10px",
    background: "#E7A93D",
    color: "#14110D",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    textDecoration: "none",
  },

  empty: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "40px",
    background: "#FFFFFF",
    borderRadius: "20px",
    textAlign: "center",
  },

  emptyTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 10px",
  },

  emptyText: {
    color: "#55503F",
    lineHeight: "1.7",
  },

  center: {
    textAlign: "center",
    marginTop: "100px",
    color: "#FBF6EA",
    fontFamily: "'Fraunces', serif",
  },
};

export default BrowseBusinesses;
