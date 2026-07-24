import { useAuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import NewsFeed from "../components/NewsFeed";

export default function Home() {
  const { user } = useAuthContext();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .im-home { font-family: 'Sora', sans-serif; background: #FBF6EA; min-height: 100vh; }

        .im-home-hero {
          position: relative;
          overflow: hidden;
          background: #15402B;
          padding: 70px 8% 60px;
        }
        .im-home-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px),
            repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px);
          pointer-events: none;
        }
        .im-home-eyebrow {
          position: relative;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #E7A93D;
          display: inline-block;
          margin-bottom: 16px;
        }
        .im-home-title {
          position: relative;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: clamp(30px, 4vw, 42px);
          color: #FBF6EA;
          margin: 0 0 12px;
        }
        .im-home-subtitle {
          position: relative;
          font-size: 17px;
          color: #D9E5DC;
          margin: 0;
        }

        .im-home-section {
          padding: 50px 8%;
          max-width: 1220px;
          margin: 0 auto;
        }
        .im-home-section h2 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 26px;
          color: #14110D;
          margin: 0 0 22px;
        }

        .im-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 22px;
        }

        .im-stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 26px 24px;
          border: 1px solid rgba(20,17,13,0.08);
          border-top: 4px solid #E7A93D;
        }
        .im-stat-card h3 {
          margin: 0;
          font-size: 15px;
          color: #55503F;
          font-weight: 600;
        }
        .im-stat-card .im-stat-number {
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          font-size: 32px;
          color: #C33F26;
          margin: 12px 0 6px;
        }
        .im-stat-card p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        .im-action-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 26px 24px;
          border: 1px solid rgba(20,17,13,0.08);
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .im-action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(20,17,13,0.1);
        }
        .im-action-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #14110D;
          font-family: 'Sora', sans-serif;
        }
        .im-action-card p {
          margin: 0;
          font-size: 14px;
          color: #55503F;
          line-height: 1.6;
        }

        .im-news-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 28px;
          border: 1px solid rgba(20,17,13,0.08);
        }
      `}</style>

      <div className="im-home">
        {/* Hero */}
        <section className="im-home-hero">
          <span className="im-home-eyebrow">Investor Mtaani</span>

          <h1 className="im-home-title">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </h1>

          <p className="im-home-subtitle">
            Connecting African Innovation with Global Capital.
          </p>
        </section>

        {/* Statistics */}
        <section className="im-home-section">
          <div className="im-grid">
            <div className="im-stat-card">
              <h3>🏢 Businesses</h3>
              <p className="im-stat-number">1</p>
              <p>Registered businesses</p>
            </div>

            <div className="im-stat-card">
              <h3>🤝 Matches</h3>
              <p className="im-stat-number">0</p>
              <p>Successful matchmaking</p>
            </div>

            <div className="im-stat-card">
              <h3>💰 Funding</h3>
              <p className="im-stat-number">KES 0</p>
              <p>Total investments</p>
            </div>

            <div className="im-stat-card">
              <h3>📈 Growth</h3>
              <p className="im-stat-number">75%</p>
              <p>Investment readiness</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="im-home-section">
          <h2>Quick Actions</h2>

          <div className="im-grid">
            <Link className="im-action-card" to="/browse">
              <h3>🔍 Browse Businesses</h3>
              <p>Explore investment opportunities.</p>
            </Link>

            <Link className="im-action-card" to="/matchmaking">
              <h3>🤝 Matchmake</h3>
              <p>Connect investors and businesses.</p>
            </Link>

            <Link className="im-action-card" to="/funding">
              <h3>💰 Funding</h3>
              <p>View funding requests.</p>
            </Link>

            <Link className="im-action-card" to="/notifications">
              <h3>🔔 Notifications</h3>
              <p>Stay updated with activity.</p>
            </Link>
          </div>
        </section>

        {/* News */}
        <section className="im-home-section">
          <h2>Market Pulse</h2>

          <div className="im-news-card">
            <NewsFeed />
          </div>
        </section>
      </div>
    </>
  );
}
