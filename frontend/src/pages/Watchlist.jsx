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
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 8%",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          border: "none",
          background: "transparent",
          color: "#2563eb",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        ← Back
      </button>

      <h1 style={{ color: "#1e293b" }}>⭐ My Watchlist</h1>

      <p style={{ color: "#64748b", marginBottom: "35px" }}>
        Businesses you are monitoring for potential investment.
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {watchlist.map((business) => (
          <div
            key={business.id}
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "25px",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
            }}
          >
            <h2 style={{ margin: 0 }}>{business.name}</h2>

            <p style={{ color: "#64748b" }}>
              {business.industry}
            </p>

            <p style={{ color: "#64748b" }}>
              📍 {business.location}
            </p>

            <button
              onClick={() =>
                navigate(`/business/${business.id}`)
              }
              style={{
                marginTop: "15px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              View Business
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}