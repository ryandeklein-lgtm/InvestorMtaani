import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const linkStyle = {
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "0.3s",
  };

  const getNavStyle = ({ isActive }) => ({
    ...linkStyle,
    color: isActive ? "#16a34a" : "#475569",
    backgroundColor: isActive ? "#dcfce7" : "transparent",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 40px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <h2
        style={{
          margin: 0,
          cursor: "pointer",
          color: "#16a34a",
          fontWeight: "700",
        }}
        onClick={() => navigate(isAuthenticated ? "/home" : "/")}
      >
        Investor Mtaani
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Public */}
        {!isAuthenticated && (
          <>
            <NavLink to="/browse" style={getNavStyle}>
              Browse Businesses
            </NavLink>

            <NavLink to="/login" style={getNavStyle}>
              Login
            </NavLink>

            <NavLink to="/register" style={getNavStyle}>
              Register
            </NavLink>
          </>
        )}

        {/* Logged In */}
        {isAuthenticated && (
          <>
            <NavLink to="/home" style={getNavStyle}>
              Home
            </NavLink>

            <NavLink to="/browse" style={getNavStyle}>
              Browse Businesses
            </NavLink>

            {/* Only business-role accounts see/reach their business profile */}
            {user?.role === "business" && (
              <NavLink to="/business-profile" style={getNavStyle}>
                My Business
              </NavLink>
            )}

            {/* Only investor-role accounts see/reach the investor dashboard */}
            {user?.role === "investor" && (
              <NavLink to="/investor-profile" style={getNavStyle}>
                Investor Dashboard
              </NavLink>
            )}

            <NavLink to="/matchmaking" style={getNavStyle}>
              Matchmaking
            </NavLink>

            <NavLink to="/funding" style={getNavStyle}>
              Funding
            </NavLink>

            <NavLink to="/notifications" style={getNavStyle}>
              Notifications
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}