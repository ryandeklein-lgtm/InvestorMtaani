import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import InvestorMtaaniLogo from "./InvestorMtaaniLogo";
import InvestorMtaaniWordmark from "./InvestorMtaaniWordmark";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let active = true;
    const refreshCount = () => {
      api.get("/notifications/unread-count")
        .then(({ data }) => { if (active) setUnreadCount(Number(data?.data?.count) || 0); })
        .catch(() => { if (active) setUnreadCount(0); });
    };
    refreshCount();
    const interval = window.setInterval(refreshCount, 30000);
    window.addEventListener("investor-mtaani:notifications-changed", refreshCount);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("investor-mtaani:notifications-changed", refreshCount);
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    document.body.classList.toggle("im-has-mobile-quicknav", isAuthenticated);
    return () => document.body.classList.remove("im-has-mobile-quicknav");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => `im-nav-link${isActive ? " is-active" : ""}`;

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
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
            <NavLink to="/notifications" className={linkClass} onClick={closeMenu} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}>Notifications{unreadCount > 0 && <span className="im-notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}</NavLink>
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
      {isAuthenticated && <nav className="im-mobile-quicknav" aria-label="Quick navigation">
        <NavLink to="/home" className={linkClass} onClick={closeMenu}><span aria-hidden="true">⌂</span><small>Home</small></NavLink>
        <NavLink to="/browse" className={linkClass} onClick={closeMenu}><span aria-hidden="true">⌕</span><small>Browse</small></NavLink>
        {user?.role === "admin" ? <NavLink to="/admin" className={linkClass} onClick={closeMenu}><span aria-hidden="true">▦</span><small>Admin</small></NavLink> : user?.role === "business" ? <NavLink to="/matchmaking" className={linkClass} onClick={closeMenu}><span aria-hidden="true">◇</span><small>Matches</small></NavLink> : <NavLink to="/watchlist" className={linkClass} onClick={closeMenu}><span aria-hidden="true">♡</span><small>Saved</small></NavLink>}
        <NavLink to="/notifications" className={linkClass} onClick={closeMenu}><span aria-hidden="true">✉</span><small>Alerts</small></NavLink>
        <button type="button" className={`im-mobile-more${menuOpen ? " is-active" : ""}`} aria-label="More navigation options" aria-controls="im-primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span aria-hidden="true">☰</span><small>More</small></button>
      </nav>}
    </>
  );
}
