import "./../../pages/Register.css";

function AuthLayout({ children }) {
  return (
    <div className="register-page">
      {/* LEFT PANEL */}
      <div className="register-left">
        <h1>Investor Mtaani</h1>

        <h2>Connecting African Innovation with Capital</h2>

        <p>
          Investor Mtaani is a platform where ambitious entrepreneurs
          meet visionary investors to build the next generation of
          African businesses.
        </p>

        <div className="feature-list">
          <div className="feature">💰 Raise Capital</div>

          <div className="feature">🤝 Match with Investors</div>

          <div className="feature">📈 Grow Your Business</div>

          <div className="feature">🌍 Connect Across Africa</div>
        </div>

        <div className="quote-box">
          "Every great company started as someone's dream.
          Investor Mtaani helps turn those dreams into funded businesses."
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="register-right">
        <div className="register-card">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;