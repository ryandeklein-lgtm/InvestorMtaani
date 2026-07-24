import { Link } from "react-router-dom";

export default function Landing() {
  const sectors = [
    { name: "FinTech", icon: "💳", accent: "#E7A93D" },
    { name: "AgriTech", icon: "🌱", accent: "#15402B" },
    { name: "HealthTech", icon: "❤️", accent: "#C33F26" },
    { name: "EdTech", icon: "🎓", accent: "#E7A93D" },
    { name: "Clean Energy", icon: "⚡", accent: "#15402B" },
    { name: "Artificial Intelligence", icon: "🤖", accent: "#C33F26" },
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
    { icon: "✅", label: "Verified Profiles" },
    { icon: "🤝", label: "Investor Matchmaking" },
    { icon: "📊", label: "Financial Transparency" },
    { icon: "🌍", label: "Pan-African Reach" },
    { icon: "🔒", label: "Secure Platform" },
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .im-root * { box-sizing: border-box; }
        .im-root { font-family: 'Sora', sans-serif; color: #14110D; }

        .im-hero {
          position: relative;
          overflow: hidden;
          background: #15402B;
          padding: 100px 8% 70px;
        }
        .im-hero-pattern {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px),
            repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px);
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
        .im-hero-text { flex: 1 1 420px; min-width: 320px; color: #FBF6EA; }
        .im-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #E7A93D;
          display: inline-block;
          margin-bottom: 22px;
        }
        .im-hero-title {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(38px, 5.2vw, 64px);
          line-height: 1.08;
          margin: 0 0 22px;
        }
        .im-hero-title em {
          font-style: italic;
          font-weight: 500;
          color: #E7A93D;
        }
        .im-hero-para {
          font-size: 19px;
          line-height: 1.75;
          color: #D9E5DC;
          max-width: 540px;
          margin: 0 0 36px;
        }
        .im-hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 40px; }
        .im-btn {
          font-family: 'Sora', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 15px 30px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .im-btn:hover { transform: translateY(-2px); }
        .im-btn:focus-visible { outline: 3px solid #E7A93D; outline-offset: 3px; }
        .im-btn-primary { background: #E7A93D; color: #14110D; }
        .im-btn-primary:hover { box-shadow: 0 8px 20px rgba(231,169,61,0.35); }
        .im-btn-secondary { border: 2px solid #FBF6EA; color: #FBF6EA; }
        .im-btn-secondary:hover { background: rgba(251,246,234,0.1); }

        .im-badge-row { display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .im-badge {
          font-size: 14px;
          color: #D9E5DC;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .im-ticker-board {
          flex: 1 1 340px;
          min-width: 300px;
          max-width: 420px;
          background: #14110D;
          border: 3px solid #E7A93D;
          border-radius: 14px;
          overflow: hidden;
          align-self: center;
          box-shadow: 0 20px 45px rgba(0,0,0,0.35);
        }
        .im-ticker-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: #C33F26;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          letter-spacing: 1.5px;
          color: #FBF6EA;
        }
        .im-ticker-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #E7A93D;
          animation: im-pulse 1.4s ease-in-out infinite;
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
          border-bottom: 1px solid rgba(251,246,234,0.08);
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: #FBF6EA;
        }
        .im-ticker-name { flex: 1; }
        .im-ticker-sector { color: #E7A93D; }
        .im-ticker-amount { color: #7FBF9E; }

        @keyframes im-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes im-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .im-about { padding: 84px 8% 40px; background: #FBF6EA; }
        .im-about-inner { max-width: 780px; margin: 0 auto; text-align: center; }
        .im-about-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #C33F26;
          display: block;
          margin-bottom: 16px;
        }
        .im-about-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: clamp(28px, 3.8vw, 42px);
          margin: 0 0 20px;
          color: #14110D;
        }
        .im-about-text {
          font-size: 18px;
          line-height: 1.8;
          color: #443F32;
        }

        .im-how { padding: 60px 8% 84px; background: #FBF6EA; }
        .im-how-tracks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 40px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .im-track { background: #FFFFFF; border-radius: 14px; padding: 36px 30px; border: 1px solid rgba(20,17,13,0.08); }
        .im-track-header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .im-track-icon {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          background: #15402B; color: #FBF6EA;
        }
        .im-track.im-track-investor .im-track-icon { background: #C33F26; }
        .im-track-header h3 { font-family: 'Sora', sans-serif; font-size: 19px; margin: 0; color: #14110D; }
        .im-step { display: flex; gap: 16px; margin-bottom: 24px; }
        .im-step:last-child { margin-bottom: 0; }
        .im-step-num {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          color: #E7A93D;
          background: #14110D;
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .im-step-title { font-weight: 600; font-size: 15px; margin: 0 0 4px; color: #14110D; }
        .im-step-text { font-size: 14px; line-height: 1.65; color: #55503F; margin: 0; }

        .im-stats { padding: 76px 8%; background: #EFE2BE; }
        .im-section-title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          text-align: center;
          font-size: clamp(28px, 3.6vw, 40px);
          margin: 0 0 14px;
          color: #14110D;
        }
        .im-section-subtitle {
          text-align: center;
          color: #55503F;
          margin: 0 0 50px;
          font-size: 17px;
        }
        .im-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 22px;
        }
        .im-stat-card {
          background: #FBF6EA;
          padding: 34px 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid rgba(20,17,13,0.08);
        }
        .im-stat-number {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 34px;
          color: #C33F26;
          margin: 0 0 8px;
        }
        .im-stat-label { color: #55503F; font-size: 14px; }

        .im-industries { padding: 84px 8%; background: #FBF6EA; }
        .im-sector-link { text-decoration: none; color: inherit; }
        .im-sector-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 30px 22px;
          text-align: center;
          border: 1px solid rgba(20,17,13,0.08);
          border-top: 5px solid var(--accent, #E7A93D);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .im-sector-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(20,17,13,0.1); }
        .im-sector-icon { font-size: 38px; margin-bottom: 14px; }
        .im-sector-card h3 { font-family: 'Sora', sans-serif; margin: 0 0 8px; font-size: 17px; }
        .im-explore-text { color: #C33F26; font-weight: 600; font-size: 13px; margin: 0; }

        .im-view-all-wrap { text-align: center; margin-top: 46px; }
        .im-view-all-btn {
          display: inline-block;
          background: #15402B;
          color: #FBF6EA;
          padding: 15px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
        .im-view-all-btn:hover { background: #0F3021; }
        .im-view-all-btn:focus-visible { outline: 3px solid #E7A93D; outline-offset: 3px; }

        .im-cta {
          background: #C33F26;
          color: #FBF6EA;
          padding: 90px 8%;
          text-align: center;
          border-top: 6px solid #E7A93D;
        }
        .im-cta-title {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 600;
          font-size: clamp(30px, 4vw, 44px);
          margin: 0 0 20px;
        }
        .im-cta-text {
          max-width: 640px;
          margin: 0 auto 34px;
          font-size: 18px;
          line-height: 1.75;
          color: #FBE3DB;
        }
        .im-cta-btn {
          background: #FBF6EA;
          color: #C33F26;
          padding: 16px 34px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          display: inline-block;
        }
        .im-cta-btn:hover { background: #E7A93D; color: #14110D; }
        .im-cta-btn:focus-visible { outline: 3px solid #14110D; outline-offset: 3px; }

        .im-footer {
          background: #14110D;
          color: #B9B2A0;
          text-align: center;
          padding: 30px;
          font-size: 14px;
          font-family: 'Space Mono', monospace;
        }

        @media (max-width: 860px) {
          .im-hero { padding: 70px 6% 50px; }
          .im-hero-container { flex-direction: column; }
          .im-ticker-board { max-width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .im-ticker-list { animation: none; }
          .im-ticker-dot { animation: none; }
        }
      `}</style>

      <div className="im-root">
        {/* Hero Section */}
        <section className="im-hero">
          <div className="im-hero-pattern" />

          <div className="im-hero-container">
            <div className="im-hero-text">
              <span className="im-eyebrow">Mtaani Exchange · Est. 2026</span>

              <h1 className="im-hero-title">
                Invest in Africa's
                <br />
                <em>Next Unicorn</em>
              </h1>

              <p className="im-hero-para">
                Investor Mtaani connects visionary African businesses with
                investors looking for high-growth opportunities across
                FinTech, HealthTech, AgriTech, AI, Clean Energy and more.
              </p>

              <div className="im-hero-buttons">
                <Link to="/browse" className="im-btn im-btn-primary">
                  Browse Businesses
                </Link>

                <Link to="/register" className="im-btn im-btn-secondary">
                  Register Business
                </Link>
              </div>

              <div className="im-badge-row">
                {badges.map((badge) => (
                  <span className="im-badge" key={badge.label}>
                    <span>{badge.icon}</span>
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="im-ticker-board" aria-label="Live funding requests">
              <div className="im-ticker-head">
                <span>LIVE ON THE STREET</span>
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
            <span className="im-about-eyebrow">What is Investor Mtaani</span>

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
          <h2 className="im-section-title">How It Works</h2>

          <p className="im-section-subtitle">
            Two sides, one platform. Here's what each path looks like.
          </p>

          <div className="im-how-tracks">
            <div className="im-track">
              <div className="im-track-header">
                <span className="im-track-icon">🏢</span>
                <h3>For Businesses</h3>
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
                <span className="im-track-icon">💼</span>
                <h3>For Investors</h3>
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
          <h2 className="im-section-title">Investor Mtaani by the Numbers</h2>

          <div className="im-grid">
            {[
              ["500+", "Verified Businesses"],
              ["120+", "Active Investors"],
              ["KES 4.5B", "Capital Raised"],
              ["15", "African Countries"],
            ].map(([value, label]) => (
              <div key={label} className="im-stat-card">
                <p className="im-stat-number">{value}</p>
                <p className="im-stat-label">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="im-industries">
          <h2 className="im-section-title">Explore Investment Sectors</h2>

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
                <div
                  className="im-sector-card"
                  style={{ "--accent": sector.accent }}
                >
                  <div className="im-sector-icon">{sector.icon}</div>
                  <h3>{sector.name}</h3>
                  <p className="im-explore-text">Explore businesses →</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="im-view-all-wrap">
            <Link to="/browse" className="im-view-all-btn">
              View All Businesses
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="im-cta">
          <h2 className="im-cta-title">Ready to build Africa's future?</h2>

          <p className="im-cta-text">
            Whether you're raising capital or searching for your next
            investment, Investor Mtaani is where great businesses and great
            investors matchmake.
          </p>

          <Link to="/register" className="im-cta-btn">
            Get Started Today
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
