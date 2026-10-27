import { Link } from "react-router-dom";
import InvestorMtaaniLogo from "../components/InvestorMtaaniLogo";
import "./Landing.css";

const businessUses = [
  "Opening a new branch",
  "Buying equipment or machinery",
  "Expanding production or distribution",
  "Working capital",
  "Launching products or entering new markets",
  "Acquiring assets or scaling a proven business",
];

const businessSteps = [
  ["01", "Register", "Create an account and provide basic business and ownership details."],
  ["02", "Verify", "Complete identity and business checks and provide the documents requested for review."],
  ["03", "Build your profile", "Explain your business, funding need, use of funds and proposed structure."],
  ["04", "Review and publish", "If approved, your opportunity can be presented to eligible investors for review."],
];

const investorSteps = [
  ["01", "Create an account", "Tell us whether you are investing as an individual or on behalf of an organization."],
  ["02", "Complete verification", "Provide the identity and eligibility information requested for your account."],
  ["03", "Discover opportunities", "Explore available businesses by sector, location, funding need and proposed structure."],
  ["04", "Request an introduction", "If an opportunity interests you, request an introduction and review information made available to you."],
];

function ActionLink({ to = "/register", children, secondary = false }) {
  return (
    <Link className={`im-landing-action${secondary ? " is-secondary" : ""}`} to={to} style={secondary ? styles.secondaryButton : styles.button}>
      {children}
    </Link>
  );
}

function StepList({ title, steps }) {
  return (
    <div style={styles.journeyCard}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <div style={styles.steps}>
        {steps.map(([number, label, description]) => (
          <div key={number} style={styles.step}>
            <span style={styles.stepNumber}>{number}</span>
            <div>
              <h4 style={styles.stepTitle}>{label}</h4>
              <p style={styles.body}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="im-landing-page" style={styles.page}>
      <section className="im-landing-hero" style={styles.hero}>
        <div className="im-hero-layout" style={styles.heroInner}>
          <div className="im-hero-copy">
            <p style={styles.eyebrow}><span className="im-live-dot" /> INVESTOR MTAANI · KENYA</p>
            <h1 style={styles.heroTitle}>Where Business Meets <span>Capital.</span></h1>
            <p style={styles.heroLead}>
              Investor Mtaani connects established businesses seeking capital with
              investors looking for opportunities, making it easier to discover,
              verify and explore businesses powering Kenya and Africa.
            </p>
            <p style={styles.supporting}>Real Businesses. Local Capital. Bigger Possibilities.</p>
            <div style={styles.actions}>
              <ActionLink to="/register?role=business">I need capital <span aria-hidden="true">↗</span></ActionLink>
              <ActionLink to="/register?role=investor" secondary>I want to invest <span aria-hidden="true">↗</span></ActionLink>
            </div>
            <p style={styles.heroNote}>
              Investor Mtaani facilitates discovery and introductions. It does not
              guarantee funding, returns or business performance.
            </p>
          </div>
          <div className="im-network-card" aria-label="Investor Mtaani connection flow: discover, verify, introduce">
            <div className="im-network-topline"><span>CAPITAL NETWORK</span><span className="im-network-status"><i /> ACTIVE</span></div>
            <div className="im-network-visual" aria-hidden="true">
              <div className="im-orbit im-orbit-one" /><div className="im-orbit im-orbit-two" />
              <svg className="im-network-lines" viewBox="0 0 440 300" fill="none">
                <path d="M220 150 91 82M220 150l129-68M220 150 92 223M220 150l128 73" />
                <path className="im-signal-line" d="M91 82 349 82M92 223l256 0" />
              </svg>
              <div className="im-network-core"><InvestorMtaaniLogo className="im-network-logo" size={48} /><span>INVESTOR<br />MTAANI</span></div>
              <div className="im-network-node im-node-business"><span>BUSINESS</span><b>Growth capital</b></div>
              <div className="im-network-node im-node-investor"><span>INVESTOR</span><b>Opportunity</b></div>
              <div className="im-network-node im-node-verify"><span>01</span><b>Discover</b></div>
              <div className="im-network-node im-node-intro"><span>02</span><b>Connect</b></div>
            </div>
            <div className="im-network-footer"><span>DISCOVER</span><i /><span>VERIFY</span><i /><span>INTRODUCE</span></div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>THE CHALLENGE</p>
          <h2 style={styles.title}>Good businesses shouldn’t be limited by who they know.</h2>
          <p style={styles.body}>
            Across Kenya and Africa, businesses serve customers, create jobs and
            build markets. But when they need capital to expand, their options
            can be limited. Banks may require collateral, friends and family may
            not have enough capital, and business owners may not know investors
            who understand their sector.
          </p>
          <p style={styles.body}>
            Investor Mtaani is designed to make those connections easier through
            structured business profiles and a more deliberate introduction process.
          </p>
        </div>
      </section>

      <section style={styles.tintedSection}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>THE MARKETPLACE</p>
          <h2 style={styles.title}>A structured way to explore business capital.</h2>
          <div style={styles.twoColumns}>
            <article style={styles.infoCard}>
              <h3 style={styles.cardTitle}>For businesses</h3>
              <p style={styles.body}>
                Create a profile describing what your business does, how it
                performs, how much capital it seeks, how funds may be used and
                the structure it is proposing.
              </p>
              <p style={styles.body}>
                Businesses with annual turnover of KSh 2 million or more can
                apply. This is an application criterion, not a statement of a
                statutory investment threshold.
              </p>
            </article>
            <article style={styles.infoCard}>
              <h3 style={styles.cardTitle}>For investors</h3>
              <p style={styles.body}>
                Describe the sectors, locations, investment sizes and structures
                you are interested in. Discover available opportunities and
                request an introduction when you want to learn more.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>WHY MTAANI</p>
          <h2 style={styles.title}>Business happens everywhere.</h2>
          <p style={styles.body}>
            It happens in shops, farms, factories, restaurants, workshops,
            warehouses and offices across our towns and cities. Investor Mtaani
            is built to help established businesses bring their funding needs
            into view.
          </p>
          <h3 style={styles.cardTitle}>What businesses may seek capital for</h3>
          <ul style={styles.list}>
            {businessUses.map((item) => <li key={item} style={styles.listItem}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section style={styles.tintedSection}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>POSSIBLE STRUCTURES</p>
          <h2 style={styles.title}>Debt or equity, subject to the right approvals and agreements.</h2>
          <div style={styles.twoColumns}>
            <article style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Debt or credit financing</h3>
              <p style={styles.body}>
                A business may seek financing structured as a loan or another
                permitted debt instrument. Any terms, such as amount, repayment,
                interest, security and default provisions, must be set out in
                the relevant agreement.
              </p>
            </article>
            <article style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Equity investment</h3>
              <p style={styles.body}>
                A business may seek capital in exchange for an agreed ownership
                interest, subject to applicable legal and regulatory
                requirements. The transaction documents should define valuation,
                ownership, investor rights, governance, dilution and exit terms.
              </p>
            </article>
          </div>
          <p style={styles.smallNote}>
            Availability of any structure depends on applicable law, eligibility
            and the definitive documents for that opportunity.
          </p>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>HOW IT WORKS</p>
          <h2 style={styles.title}>A clear path from profile to introduction.</h2>
          <div style={styles.twoColumns}>
            <StepList title="For businesses" steps={businessSteps} />
            <StepList title="For investors" steps={investorSteps} />
          </div>
        </div>
      </section>

      <section style={styles.roleSection}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>OUR ROLE</p>
          <h2 style={styles.title}>We help make relevant introductions.</h2>
          <p style={styles.body}>
            Investor Mtaani facilitates discovery, verification within its
            stated scope, matching and introductions. Verification is not an
            investment recommendation, endorsement or guarantee. We do not
            guarantee that a business will raise capital, that an investor will
            receive a return, or that an opportunity will succeed.
          </p>
          <p style={styles.body}>
            Investors make their own decisions. Before proceeding, the parties
            should conduct appropriate due diligence, use definitive transaction
            documents and seek independent legal, financial, tax or other
            professional advice where appropriate.
          </p>
        </div>
      </section>

      <section style={styles.finalSection}>
        <div style={styles.content}>
          <p style={styles.eyebrow}>TAKE THE NEXT STEP</p>
          <h2 style={styles.finalTitle}>Your next investor could be closer than you think.</h2>
          <p style={styles.finalLead}>
            Have a business with annual turnover of KSh 2 million or more and
            need capital to grow? Apply to list your business. Looking for
            opportunities beyond traditional investments? Create an investor profile.
          </p>
          <div style={styles.actions}>
            <ActionLink to="/register?role=business">List your business</ActionLink>
            <ActionLink to="/register?role=investor" secondary>Create your investor profile</ActionLink>
          </div>
          <p style={styles.smallNote}>
            Applying does not guarantee approval or access to investment.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: { color: "#e8eef7", background: "#070b13", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" },
  hero: { position: "relative", background: "radial-gradient(ellipse at 76% 44%, rgba(34,211,238,.11), transparent 33%), radial-gradient(ellipse at 18% 10%, rgba(52,211,153,.07), transparent 32%), linear-gradient(180deg,#070b13,#090f1a)", padding: "76px 24px 82px", borderBottom: "1px solid rgba(148,163,184,.12)" },
  heroInner: { width: "100%", maxWidth: "1120px", margin: "0 auto" },
  content: { width: "100%", maxWidth: "1040px", margin: "0 auto" },
  section: { padding: "76px 24px", background: "#080d17" },
  tintedSection: { padding: "76px 24px", background: "#0d1523", borderTop: "1px solid #1d2a3d", borderBottom: "1px solid #1d2a3d" },
  roleSection: { padding: "76px 24px", background: "#0b1320" },
  finalSection: { padding: "76px 24px 88px", background: "linear-gradient(135deg, #101d2d, #0b1320)" },
  eyebrow: { margin: "0 0 14px", color: "#3dd6f5", fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" },
  heroTitle: { maxWidth: "800px", margin: 0, color: "#fff", fontSize: "clamp(42px, 7vw, 76px)", lineHeight: 1.02, letterSpacing: "-0.05em" },
  title: { maxWidth: "800px", margin: "0 0 18px", color: "#fff", fontSize: "clamp(30px, 4.5vw, 48px)", lineHeight: 1.12, letterSpacing: "-0.035em" },
  heroLead: { maxWidth: "760px", margin: "22px 0 0", color: "#a9b6c8", fontSize: "18px", lineHeight: 1.75 },
  supporting: { margin: "15px 0 0", color: "#87e6fa", fontSize: "15px", fontWeight: 700 },
  finalTitle: { maxWidth: "760px", margin: "0 0 15px", color: "#fff", fontSize: "clamp(32px, 5vw, 54px)", lineHeight: 1.08, letterSpacing: "-0.04em", textTransform: "uppercase" },
  finalLead: { maxWidth: "780px", color: "#a9b6c8", fontSize: "16px", lineHeight: 1.75 },
  body: { margin: "0 0 14px", color: "#a9b6c8", fontSize: "15px", lineHeight: 1.8 },
  smallNote: { margin: "16px 0 0", color: "#718096", fontSize: "12px", lineHeight: 1.7 },
  heroNote: { maxWidth: "700px", margin: "20px 0 0", color: "#718096", fontSize: "12px", lineHeight: 1.7 },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" },
  button: { display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "12px", minHeight: "48px", padding: "0 21px", borderRadius: "9px", background: "linear-gradient(110deg,#45e4d1,#63d7fb)", color: "#06131a", fontWeight: 800, fontSize: "13px", textDecoration: "none", boxShadow: "0 8px 28px rgba(69,228,209,.16)" },
  secondaryButton: { display: "inline-flex", justifyContent: "center", alignItems: "center", gap: "12px", minHeight: "48px", padding: "0 19px", borderRadius: "9px", border: "1px solid rgba(148,163,184,.28)", background: "rgba(15,23,42,.45)", color: "#e8eef7", fontWeight: 700, fontSize: "13px", textDecoration: "none" },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "18px", marginTop: "26px" },
  infoCard: { padding: "24px", border: "1px solid rgba(148,163,184,.16)", borderRadius: "14px", background: "linear-gradient(145deg,rgba(17,28,43,.92),rgba(11,18,30,.92))", boxShadow: "0 16px 48px rgba(0,0,0,.16)" },
  journeyCard: { padding: "24px", border: "1px solid rgba(148,163,184,.16)", borderRadius: "14px", background: "linear-gradient(145deg,rgba(14,24,39,.92),rgba(9,15,26,.92))" },
  cardTitle: { margin: "0 0 14px", color: "#f4f7fb", fontSize: "19px", lineHeight: 1.3 },
  list: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 270px), 1fr))", gap: "10px 24px", paddingLeft: "21px", margin: "20px 0 0" },
  listItem: { paddingLeft: "4px", color: "#bdc8d7", fontSize: "14px", lineHeight: 1.65 },
  steps: { display: "grid", gap: "18px" },
  step: { display: "grid", gridTemplateColumns: "38px 1fr", gap: "13px", alignItems: "start" },
  stepNumber: { display: "grid", placeItems: "center", width: "34px", height: "34px", borderRadius: "9px", background: "rgba(61,214,245,.08)", color: "#3dd6f5", fontSize: "11px", fontWeight: 800 },
  stepTitle: { margin: "0 0 5px", color: "#e8eef7", fontSize: "14px" },
};
