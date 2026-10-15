import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import InvestorMtaaniLogo from "./InvestorMtaaniLogo";
import InvestorMtaaniWordmark from "./InvestorMtaaniWordmark";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => `im-nav-link${isActive ? " is-active" : ""}`;

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="im-navbar">
      <Link className="im-brand" to={isAuthenticated ? "/home" : "/"} onClick={closeMenu} aria-label="Investor Mtaani home">
        <InvestorMtaaniLogo className="im-brand-mark" size={40} />
        <InvestorMtaaniWordmark />
      </Link>

      <button
        className="im-menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="im-primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <nav id="im-primary-navigation" className={`im-nav-links${menuOpen ? " is-open" : ""}`} aria-label="Primary navigation">
        {isAuthenticated ? (
          <>
            <NavLink to="/home" className={linkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/browse" className={linkClass} onClick={closeMenu}>Browse businesses</NavLink>
            {user?.role === "business" && <NavLink to="/business-profile" className={linkClass} onClick={closeMenu}>Business profile</NavLink>}
            {user?.role === "investor" && <NavLink to="/investor-profile" className={linkClass} onClick={closeMenu}>Investor profile</NavLink>}
            {(user?.role === "business" || user?.role === "investor") && <NavLink to="/kyc" className={linkClass} onClick={closeMenu}>Verification</NavLink>}
            {user?.role === "admin" ? (
              <NavLink to="/admin" className={linkClass} onClick={closeMenu}>Admin</NavLink>
            ) : (
              <NavLink to="/matchmaking" className={linkClass} onClick={closeMenu}>Introductions</NavLink>
            )}
            <NavLink to="/notifications" className={linkClass} onClick={closeMenu}>Notifications</NavLink>
            <button className="im-nav-logout" type="button" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/browse" className={linkClass} onClick={closeMenu}>Browse businesses</NavLink>
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>Log in</NavLink>
            <NavLink to="/register" className="im-nav-register" onClick={closeMenu}>Create an account <span aria-hidden="true">→</span></NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
