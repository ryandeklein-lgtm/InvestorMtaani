import { useAuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import NewsFeed from "../components/NewsFeed";

export default function Home() {
  const { user } = useAuthContext();
  const isBusiness = user?.role === "business";
  const isInvestor = user?.role === "investor";
  const nextSteps = isBusiness
    ? [
        { number: "01", title: "Verify your account", text: "Complete identity checks so your application can be reviewed.", to: "/kyc", action: "Continue verification" },
        { number: "02", title: "Build your business profile", text: "Share your business details, funding need and use of funds.", to: "/business-profile", action: "Open business profile" },
        { number: "03", title: "Explore funding options", text: "See the funding information and options available on the platform.", to: "/funding", action: "View funding" },
      ]
    : isInvestor
      ? [
          { number: "01", title: "Verify your account", text: "Complete identity checks before requesting introductions.", to: "/kyc", action: "Continue verification" },
          { number: "02", title: "Set your investor preferences", text: "Tell us which sectors, locations and structures interest you.", to: "/investor/create", action: "Set preferences" },
          { number: "03", title: "Discover businesses", text: "Explore opportunities and request an introduction when ready.", to: "/browse", action: "Browse businesses" },
        ]
      : [
          { number: "01", title: "Explore businesses", text: "Browse the opportunities currently available on the platform.", to: "/browse", action: "Browse businesses" },
          { number: "02", title: "See how matching works", text: "Learn how businesses and investors connect through the platform.", to: "/matchmaking", action: "Explore matchmaking" },
        ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .im-home {
          --void: #060911;
          --panel: #0e1626;
          --panel-border: rgba(61, 214, 245, 0.16);
          --cyan: #3dd6f5;
          --violet: #8b7cf6;
          --text: #e7edf5;
          --muted: #7c8aa0;

          font-family: 'Space Grotesk', sans-serif;
          background: var(--void);
          color: var(--text);
          min-height: 100vh;
        }

        .im-home-hero {
          position: relative;
          overflow: hidden;
          padding: 64px 8% 56px;
        }
        .im-home-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(61, 214, 245, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61, 214, 245, 0.06) 1px, transparent 1px);
          background-size: 44px 44px;
          -webkit-mask-image: radial-gradient(circle at 15% 0%, black, transparent 70%);
          mask-image: radial-gradient(circle at 15% 0%, black, transparent 70%);
          pointer-events: none;
        }
        .im-home-hero::after {
          content: '';
          position: absolute;
          top: -220px;
          left: -100px;
          width: 700px;
          height: 460px;
          background: radial-gradient(circle, rgba(61, 214, 245, 0.14), transparent 70%);
          pointer-events: none;
        }

        .im-home-status {
          position: relative;
          display: inline-flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 18px;
        }
        .im-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--cyan);
          display: inline-block;
          margin-right: 9px;
          animation: im-pulse 2s infinite;
        }
        @keyframes im-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(61, 214, 245, 0.55); }
          50% { box-shadow: 0 0 0 5px rgba(61, 214, 245, 0); }
        }

        .im-home-scan-wrap {
          position: relative;
          max-width: 640px;
          overflow: hidden;
        }
        .im-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--cyan), transparent 80%);
          animation: im-scan 1.6s ease-out 1 forwards;
        }
        @keyframes im-scan {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: 0.9; }
          100% { transform: translateY(120px); opacity: 0; }
        }

        .im-home-title {
          position: relative;
          font-weight: 700;
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.15;
          margin: 0 0 12px;
        }
        .im-home-subtitle {
          position: relative;
          font-size: 16px;
          color: var(--muted);
          margin: 0;
        }

        .im-home-section {
          padding: 46px 8%;
          max-width: 1220px;
          margin: 0 auto;
        }
        .im-home-section h2 {
          font-weight: 600;
          font-size: 22px;
          margin: 0 0 20px;
        }

        .im-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .im-panel {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 4px;
        }
        .im-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: var(--cyan);
          opacity: 0.5;
        }
        .im-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .im-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
        .im-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
        .im-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

        .im-stat-card {
          padding: 24px 22px;
        }
        .im-stat-card h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
        }
        .im-stat-card .im-stat-number {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 28px;
          color: var(--cyan);
          margin: 12px 0 6px;
        }
        .im-stat-card p:last-child {
          margin: 0;
          font-size: 12.5px;
          color: var(--muted);
        }

        .im-action-card {
          padding: 24px 22px;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .im-action-card:hover {
          border-color: rgba(61, 214, 245, 0.5);
          box-shadow: 0 0 0 1px rgba(61, 214, 245, 0.2), 0 0 24px rgba(61, 214, 245, 0.12);
        }
        .im-action-card h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }
        .im-action-card p {
          margin: 0;
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.6;
        }

        .im-next-step {
          min-height: 194px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border-radius: 12px;
        }
        .im-step-number {
          margin-bottom: 20px;
          color: var(--cyan);
          font: 600 11px 'JetBrains Mono', monospace;
          letter-spacing: .12em;
        }
        .im-step-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 18px;
          color: var(--cyan);
          font-size: 12px;
          font-weight: 700;
        }
        .im-home-section-title {
          margin: 0 0 7px;
          color: var(--text);
          font-size: 22px;
        }
        .im-home-section-description {
          margin: 0 0 20px;
          color: var(--muted);
          font-size: 13px;
        }

        .im-news-card {
          padding: 26px;
        }
      `}</style>

      <div className="im-home">
        {/* Hero */}
        <section className="im-home-hero">
          <div className="im-home-status">
            <span className="im-dot" />
            system online
          </div>

          <div className="im-home-scan-wrap">
            <div className="im-scanline" />
            <h1 className="im-home-title">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="im-home-subtitle">
              {isBusiness
                ? "Your workspace for verification, your business profile and funding applications."
                : isInvestor
                  ? "Your workspace for discovering businesses and managing introductions."
                  : "Your workspace for exploring the Investor Mtaani marketplace."}
            </p>
          </div>
        </section>

        {/* Role-based next steps */}
        <section className="im-home-section">
          <h2 className="im-home-section-title">Your next steps</h2>
          <p className="im-home-section-description">A simple path to get started. Choose a step to continue when you’re ready.</p>
          <div className="im-grid">
            {nextSteps.map((step) => (
              <Link key={step.number} className="im-panel im-action-card im-next-step" to={step.to}>
                <span className="im-corner im-corner-tl" />
                <span className="im-corner im-corner-tr" />
                <span className="im-corner im-corner-bl" />
                <span className="im-corner im-corner-br" />
                <span className="im-step-number">STEP {step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="im-step-link">{step.action}<span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </section>

        {/* News */}
        <section className="im-home-section">
          <h2>Market pulse</h2>

          <div className="im-panel im-news-card">
            <span className="im-corner im-corner-tl" />
            <span className="im-corner im-corner-tr" />
            <span className="im-corner im-corner-bl" />
            <span className="im-corner im-corner-br" />
            <NewsFeed />
          </div>
        </section>
      </div>
    </>
  );
}
