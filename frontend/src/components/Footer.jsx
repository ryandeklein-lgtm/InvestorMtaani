import { Link } from "react-router-dom";
import InvestorMtaaniLogo from "./InvestorMtaaniLogo";
import InvestorMtaaniWordmark from "./InvestorMtaaniWordmark";

const LINKS = [
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/risk-disclosure", label: "Risk Disclosure" },
  { to: "/kyc-policy", label: "KYC Policy" },
  { to: "/contact", label: "Contact" },
];

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}><InvestorMtaaniLogo size={38} /> <InvestorMtaaniWordmark className="im-wordmark--footer" /></div>
        <div style={styles.tagline}>Where Business Meets Capital.</div>

        <div style={styles.disclosures}>
          <p style={styles.text}>
            Investor Mtaani is a platform for connecting businesses and
            potential investors. Information displayed on the platform is
            provided for informational purposes and is subject to the
            applicable verification and disclosure process.
          </p>

          <p style={styles.text}>
            Investment opportunities involve risk, including possible loss of
            capital. Past business performance does not guarantee future
            performance. Investor Mtaani does not guarantee returns or the
            success of any business opportunity.
          </p>

          <p style={styles.text}>
            Users should obtain independent legal, financial, tax and other
            professional advice where appropriate.
          </p>
        </div>

        <nav style={styles.links} aria-label="Legal">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} style={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={styles.copy}>
          © {new Date().getFullYear()} Investor Mtaani. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(180deg, #0a111d, #070b13)",
    color: "#cbd5e1",
    padding: "48px 20px 28px",
    borderTop: "1px solid rgba(73, 221, 202, .16)",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "800",
  },

  tagline: {
    color: "#69e6d1",
    fontSize: "14px",
    fontWeight: "700",
    margin: "4px 0 24px",
  },

  disclosures: {
    maxWidth: "820px",
  },

  text: {
    fontSize: "13px",
    lineHeight: "1.7",
    margin: "0 0 10px",
    color: "#94a3b8",
  },

  links: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 24px",
    margin: "24px 0",
    paddingTop: "20px",
    borderTop: "1px solid rgba(148, 163, 184, .16)",
  },

  link: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
  },

  copy: {
    fontSize: "12px",
    color: "#64748b",
  },
};

export default Footer;
