import { Link } from "react-router-dom";

export default function Landing() {
  const sectors = [
    { name: "FinTech" },
    { name: "AgriTech" },
    { name: "HealthTech" },
    { name: "EdTech" },
    { name: "Clean Energy" },
    { name: "Artificial Intelligence" },
  ];

  const tickerItems = [
    { name: "Jua Kali Textiles", sector: "Manufacturing", amount: "KES 4.2M" },
    { name: "Shamba Analytics", sector: "AgriTech", amount: "KES 9.8M" },
    { name: "Chapaa Health", sector: "HealthTech", amount: "KES 6.5M" },
    { name: "Duka Direct", sector: "FinTech", amount: "KES 12.1M" },
    { name: "Solar Mtaani", sector: "Clean Energy", amount: "KES 18.4M" },
    { name: "Somo Labs", sector: "EdTech", amount: "KES 3.7M" },
    { name: "Boda Fresh Logistics", sector: "AgriTech", amount: "KES 7.3M" },
    { name: "Kazi Cloud", sector: "AI", amount: "KES 15.0M" },
  ];

  const badges = [
    "Verified profiles",
    "Investor matchmaking",
    "Financial transparency",
    "Pan-African reach",
    "Secure platform",
  ];

  const businessSteps = [
    {
      title: "Register your business",
      text: "Create a free profile with your business details, financials, and the sector you operate in.",
    },
    {
      title: "Set your funding ask",
      text: "State how much capital you're seeking, what it's for, and the impact it will have.",
    },
    {
      title: "Get discovered by investors",
      text: "Verified investors browse your profile and reach out through the platform's matchmaking tools.",
    },
  ];

  const investorSteps = [
    {
      title: "Create an investor account",
      text: "Sign up and tell us the sectors, deal sizes, and regions you're interested in.",
    },
    {
      title: "Browse verified businesses",
      text: "Explore funding-ready businesses across FinTech, AgriTech, HealthTech, AI, and more.",
    },
    {
      title: "Connect and invest",
      text: "Message business owners directly, review their numbers, and move forward on your terms.",
    },
  ];

  const Corners = () => (
    <>
      <span className="im-corner im-corner-tl" />
      <span className="im-corner im-corner-tr" />
      <span className="im-corner im-corner-bl" />
      <span className="im-corner im-corner-br" />
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .im-root * { box-sizing: border-box; }
        .im-root {
          --void: #060911;
          --void-alt: #080d17;
          --panel: #0e1626;
          --panel-alt: #0b1220;
          --panel-border: rgba(61, 214, 245, 0.16);
          --cyan: #3dd6f5;
          --violet: #8b7cf6;
          --text: #e7edf5;
          --muted: #7c8aa0;

          font-family: 'Space Grotesk', sans-serif;
          color: var(--text);
          background: var(--void);
        }

        .im-corner {
          position: absolute;
          width: 13px;
          height: 13px;
          border-color: var(--cyan);
          opacity: 0.5;
        }
        .im-corner-tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .im-corner-tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
        .im-corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
        .im-corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

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

        /* Hero */
        .im-hero {
          position: relative;
          overflow: hidden;
          padding: 90px 8% 70px;
        }
        .im-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(61, 214, 245, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61, 214, 245, 0.07) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(circle at 20% 20%, black, transparent 68%);
          mask-image: radial-gradient(circle at 20% 20%, black, transparent 68%);
          pointer-events: none;
        }
        .im-hero-glow {
          position: absolute;
          top: -240px;
          left: -120px;
          width: 800px;
          height: 520px;
          background: radial-gradient(circle, rgba(61, 214, 245, 0.16), transparent 70%);
          pointer-events: none;
        }
        .im-hero-container {
          position: relative;
          max-width: 1220px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 48px;
        }
        .im-hero-text { flex: 1 1 420px; min-width: 320px; }

        .im-status {
          display: inline-flex;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .im-hero-scan {
          position: relative;
          overflow: hidden;
        }
        .im-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--cyan), transparent 80%);
          animation: im-scan 1.8s ease-out 1 forwards;
        }
        @keyframes im-scan {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: 0.9; }
          100% { transform: translateY(170px); opacity: 0; }
        }

        .im-hero-title {
          font-weight: 700;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.12;
          margin: 0 0 22px;
        }
        .im-hero-para {
          font-size: 17.5px;
          line-height: 1.75;
          color: var(--muted);
          max-width: 540px;
          margin: 0 0 36px;
        }
        .im-hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }

        .im-btn {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          font-size: 14px;
          padding: 15px 28px;
          border-radius: 3px;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          border: 1px solid rgba(61, 214, 245, 0.4);
          background: transparent;
          color: var(--cyan);
          transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
        }
        .im-btn:hover { background: var(--cyan); color: #06111a; }
        .im-btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }
        .im-btn-solid { background: var(--cyan); color: #06111a; border-color: var(--cyan); }
        .im-btn-solid:hover { opacity: 0.88; background: var(--cyan); color: #06111a; }

        .im-badge-row { display: flex; flex-wrap: wrap; gap: 12px 26px; }
        .im-badge {
          font-size: 13.5px;
          color: var(--muted);
          display: inline-flex;
          align-items: center;
          gap: 9px;
        }
        .im-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: var(--violet);
          flex-shrink: 0;
        }

        /* Ticker */
        .im-ticker-board {
          flex: 1 1 340px;
          min-width: 300px;
          max-width: 420px;
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          overflow: hidden;
          align-self: center;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
        }
        .im-ticker-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          border-bottom: 1px solid var(--panel-border);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }
        .im-ticker-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--cyan);
          animation: im-ticker-pulse 1.4s ease-in-out infinite;
        }
        @keyframes im-ticker-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .im-ticker-track { height: 280px; overflow: hidden; position: relative; }
        .im-ticker-list {
          display: flex;
          flex-direction: column;
          animation: im-scroll 16s linear infinite;
        }
        .im-ticker-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid var(--panel-border);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
        }
        .im-ticker-name { flex: 1; color: var(--text); }
        .im-ticker-sector { color: var(--violet); }
        .im-ticker-amount { color: var(--cyan); }

        @keyframes im-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        /* About */
        .im-about { padding: 80px 8%; border-top: 1px solid var(--panel-border); }
        .im-about-inner { max-width: 720px; margin: 0 auto; text-align: center; }
        .im-about-title {
          font-weight: 600;
          font-size: clamp(26px, 3.6vw, 38px);
          margin: 0 0 20px;
        }
        .im-about-text {
          font-size: 16.5px;
          line-height: 1.85;
          color: var(--muted);
        }

        /* How it works */
        .im-how { padding: 20px 8% 84px; }
        .im-how-tracks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .im-track {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 32px 28px;
        }
        .im-track-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--panel-border);
        }
        .im-track-header h3 { font-size: 17px; margin: 0; }
        .im-track-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--cyan);
        }
        .im-track-investor .im-track-tag { color: var(--violet); }

        .im-step { display: flex; gap: 16px; margin-bottom: 22px; }
        .im-step:last-child { margin-bottom: 0; }
        .im-step-num {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 12.5px;
          color: var(--cyan);
          border: 1px solid var(--panel-border);
          width: 26px; height: 26px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .im-step-title { font-weight: 600; font-size: 14.5px; margin: 0 0 4px; }
        .im-step-text { font-size: 13.5px; line-height: 1.65; color: var(--muted); margin: 0; }

        /* Stats */
        .im-stats { padding: 72px 8%; background: var(--void-alt); border-top: 1px solid var(--panel-border); border-bottom: 1px solid var(--panel-border); }
        .im-section-title {
          font-weight: 600;
          text-align: center;
          font-size: clamp(26px, 3.4vw, 36px);
          margin: 0 0 12px;
        }
        .im-section-subtitle {
          text-align: center;
          color: var(--muted);
          margin: 0 0 46px;
          font-size: 15.5px;
        }
        .im-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .im-stat-card {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-radius: 4px;
          padding: 30px 22px;
          text-align: center;
        }
        .im-stat-number {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          font-size: 30px;
          color: var(--cyan);
          margin: 0 0 8px;
        }
        .im-stat-label { color: var(--muted); font-size: 13.5px; }

        /* Industries */
        .im-industries { padding: 80px 8%; }
        .im-sector-link { text-decoration: none; color: inherit; }
        .im-sector-card {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--panel-border);
          border-top: 2px solid var(--violet);
          border-radius: 4px;
          padding: 30px 22px;
          text-align: center;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .im-sector-card:hover {
          border-color: rgba(61, 214, 245, 0.5);
          box-shadow: 0 0 0 1px rgba(61, 214, 245, 0.2), 0 0 24px rgba(61, 214, 245, 0.12);
        }
        .im-sector-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; }
        .im-explore-text {
          color: var(--muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          margin: 0;
        }

        .im-view-all-wrap { text-align: center; margin-top: 44px; }

        /* CTA */
        .im-cta {
          position: relative;
          padding: 90px 8%;
          text-align: center;
          border-top: 1px solid var(--panel-border);
          overflow: hidden;
        }
        .im-cta-glow {
          position: absolute;
          bottom: -220px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 460px;
          background: radial-gradient(circle, rgba(139, 124, 246, 0.14), transparent 70%);
          pointer-events: none;
        }
        .im-cta-title {
          position: relative;
          font-weight: 600;
          font-size: clamp(28px, 3.8vw, 40px);
          margin: 0 0 18px;
        }
        .im-cta-text {
          position: relative;
          max-width: 620px;
          margin: 0 auto 32px;
          font-size: 16.5px;
          line-height: 1.75;
          color: var(--muted);
        }

        .im-footer {
          border-top: 1px solid var(--panel-border);
          color: var(--muted);
          text-align: center;
          padding: 28px;
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
        }

        @media (max-width: 860px) {
          .im-hero { padding: 64px 6% 50px; }
          .im-hero-container { flex-direction: column; }
          .im-ticker-board { max-width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .im-ticker-list { animation: none; }
          .im-ticker-dot { animation: none; }
          .im-scanline { animation: none; opacity: 0; }
        }
      `}</style>

      <div className="im-root">
        {/* Hero */}
        <section className="im-hero">
          <div className="im-hero-grid" />
          <div className="im-hero-glow" />

          <div className="im-hero-container">
            <div className="im-hero-text">
              <div className="im-status">
                <span className="im-dot" />
                mtaani exchange
              </div>

              <div className="im-hero-scan">
                <div className="im-scanline" />
                <h1 className="im-hero-title">
                  Invest in Africa's
                  <br />
                  next unicorn
                </h1>

                <p className="im-hero-para">
                  Investor Mtaani connects visionary African businesses with
                  investors looking for high-growth opportunities across
                  FinTech, HealthTech, AgriTech, AI, Clean Energy and more.
                </p>
              </div>

              <div className="im-hero-buttons">
                <Link to="/browse" className="im-btn im-btn-solid">
                  Browse businesses
                </Link>

                <Link to="/register" className="im-btn">
                  Register a business
                </Link>
              </div>

              <div className="im-badge-row">
                {badges.map((label) => (
                  <span className="im-badge" key={label}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="im-ticker-board" aria-label="Live funding requests">
              <div className="im-ticker-head">
                <span>live on the street</span>
                <span className="im-ticker-dot" />
              </div>

              <div className="im-ticker-track">
                <div className="im-ticker-list">
                  {[...tickerItems, ...tickerItems].map((item, i) => (
                    <div className="im-ticker-row" key={i}>
                      <span className="im-ticker-name">{item.name}</span>
                      <span className="im-ticker-sector">{item.sector}</span>
                      <span className="im-ticker-amount">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="im-about">
          <div className="im-about-inner">
            <h2 className="im-about-title">
              A marketplace built for African deal-making
            </h2>

            <p className="im-about-text">
              Investor Mtaani is a platform where growing African businesses
              and the investors who want to back them find each other
              directly. Businesses build a verified profile with real
              numbers, investors browse by sector and deal size, and
              matches happen in the open — no cold emails, no
              middlemen.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="im-how">
          <h2 className="im-section-title">How it works</h2>

          <p className="im-section-subtitle">
            Two sides, one platform. Here's what each path looks like.
          </p>

          <div className="im-how-tracks">
            <div className="im-track">
              <div className="im-track-header">
                <div>
                  <span className="im-track-tag">path 01</span>
                  <h3>For businesses</h3>
                </div>
              </div>

              {businessSteps.map((step, i) => (
                <div className="im-step" key={step.title}>
                  <span className="im-step-num">{i + 1}</span>
                  <div>
                    <p className="im-step-title">{step.title}</p>
                    <p className="im-step-text">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="im-track im-track-investor">
              <div className="im-track-header">
                <div>
                  <span className="im-track-tag">path 02</span>
                  <h3>For investors</h3>
                </div>
              </div>

              {investorSteps.map((step, i) => (
                <div className="im-step" key={step.title}>
                  <span className="im-step-num">{i + 1}</span>
                  <div>
                    <p className="im-step-title">{step.title}</p>
                    <p className="im-step-text">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="im-stats">
          <h2 className="im-section-title">Investor Mtaani by the numbers</h2>

          <div className="im-grid">
            {[
              ["500+", "Verified businesses"],
              ["120+", "Active investors"],
              ["KES 4.5B", "Capital raised"],
              ["15", "African countries"],
            ].map(([value, label]) => (
              <div key={label} className="im-stat-card">
                <Corners />
                <p className="im-stat-number">{value}</p>
                <p className="im-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="im-industries">
          <h2 className="im-section-title">Explore investment sectors</h2>

          <p className="im-section-subtitle">
            Choose a sector to discover businesses seeking investors.
          </p>

          <div className="im-grid">
            {sectors.map((sector) => (
              <Link
                key={sector.name}
                to={`/browse?industry=${encodeURIComponent(sector.name)}`}
                className="im-sector-link"
              >
                <div className="im-sector-card">
                  <Corners />
                  <h3>{sector.name}</h3>
                  <p className="im-explore-text">Explore businesses</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="im-view-all-wrap">
            <Link to="/browse" className="im-btn im-btn-solid">
              View all businesses
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="im-cta">
          <div className="im-cta-glow" />
          <h2 className="im-cta-title">Ready to build Africa's future?</h2>

          <p className="im-cta-text">
            Whether you're raising capital or searching for your next
            investment, Investor Mtaani is where great businesses and great
            investors matchmake.
          </p>

          <Link to="/register" className="im-btn im-btn-solid">
            Get started
          </Link>
        </section>

        <footer className="im-footer">
          © 2026 Investor Mtaani. Connecting African innovation with global
          capital.
        </footer>
      </div>
    </>
  );
}
