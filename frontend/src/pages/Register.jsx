import { Link, useNavigate } from "react-router-dom";

import "./Register.css";

import DynamicForm from "../components/auth/DynamicForm";
import TermsCheckbox from "../components/auth/TermsCheckbox";

import useRegisterForm from "../hooks/useRegisterForm";

import {
  businessFields,
  investorFields,
} from "../data/registerFields";

function Register() {
  const navigate = useNavigate();

  const {
    selectedRole,
    formData,
    loading,
    message,
    error,
    handleChange,
    changeRole,
    handleSubmit,
  } = useRegisterForm();

  const fields =
    selectedRole === "business"
      ? businessFields
      : investorFields;

  return (
      <div className="register-page">

        {/* =====================================================
            FUTURISTIC BACKGROUND
        ====================================================== */}

        <div className="register-orb register-orb-one" />
        <div className="register-orb register-orb-two" />
        <div className="register-grid" />

        {/* =====================================================
            LEFT EXPERIENCE PANEL
        ====================================================== */}

        <section className="register-visual">

          <div className="visual-content">

            {/* BRAND */}

            <div className="visual-brand">
              <div className="visual-logo">
                IM
              </div>

              <div>
                <div className="visual-brand-name">
                  INVESTOR MTAANI
                </div>

                <div className="visual-brand-sub">
                  CONNECT • FUND • GROW
                </div>
              </div>
            </div>

            {/* EYEBROW */}

            <div className="visual-eyebrow">
              <span />
              JOIN INVESTOR MTAANI
            </div>

            {/* HERO */}

            <h1 className="visual-title">
              Build the next
              <br />
              generation of
              <br />

              <span>
                African innovation.
              </span>
            </h1>

            <p className="visual-description">
              Whether you're building a business or looking
              for promising opportunities, Investor Mtaani
              connects ambitious businesses with visionary
              capital.
            </p>

            {/* AFRICA SIGNAL */}

            <div className="africa-signal">

              <div className="signal-ring signal-ring-one" />
              <div className="signal-ring signal-ring-two" />
              <div className="signal-ring signal-ring-three" />

              <div className="signal-core">
                <span>AFRICA</span>
              </div>

              <div className="signal-line signal-line-one" />
              <div className="signal-line signal-line-two" />
              <div className="signal-line signal-line-three" />

            </div>

            {/* BENEFITS */}

            <div className="visual-features">

              <div className="visual-feature">

                <div className="feature-icon">
                  ↗
                </div>

                <div>
                  <strong>
                    For Businesses
                  </strong>

                  <p>
                    Showcase your business and connect
                    with the right capital.
                  </p>
                </div>

              </div>

              <div className="visual-feature">

                <div className="feature-icon purple">
                  ◇
                </div>

                <div>
                  <strong>
                    For Investors
                  </strong>

                  <p>
                    Discover businesses and explore
                    investment opportunities.
                  </p>
                </div>

              </div>

              <div className="visual-feature">

                <div className="feature-icon green">
                  ✓
                </div>

                <div>
                  <strong>
                    Built for Growth
                  </strong>

                  <p>
                    Structured profiles, matchmaking and
                    secure onboarding.
                  </p>
                </div>

              </div>

            </div>

            {/* BOTTOM STAT BAR */}

            <div className="visual-stats">

              <div>
                <strong>01</strong>
                <span>Business</span>
              </div>

              <div className="stat-divider" />

              <div>
                <strong>02</strong>
                <span>Investor</span>
              </div>

              <div className="stat-divider" />

              <div>
                <strong>01</strong>
                <span>Network</span>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            REGISTER PANEL
        ====================================================== */}

        <section className="register-panel">

          <div className="register-card">

            {/* TOP STATUS */}

            <div className="panel-status">

              <div className="status-indicator">
                <span />
                SYSTEM ONLINE
              </div>

              <div className="status-location">
                KE / AFRICA
              </div>

            </div>

            {/* HEADER */}

            <div className="register-heading">

              <div className="register-eyebrow">
                <span />
                CREATE YOUR ACCOUNT
              </div>

              <h2>
                Register
              </h2>

              <p>
                Choose your role and start your journey
                with Investor Mtaani.
              </p>

            </div>

            {/* ROLE */}

            <div className="role-section">

              <div className="field-label">
                SELECT YOUR ROLE
              </div>

              <div className="role-buttons">

                {/* BUSINESS */}

                <button
                  type="button"
                  className={
                    selectedRole === "business"
                      ? "role-button selected"
                      : "role-button"
                  }
                  onClick={() =>
                    changeRole("business")
                  }
                >

                  <div className="role-icon">
                    ▦
                  </div>

                  <div className="role-text">
                    <strong>
                      Business / Founder
                    </strong>

                    <small>
                      I have a business and need
                      capital to grow.
                    </small>
                  </div>

                  {selectedRole === "business" && (
                    <span className="role-check">
                      ✓
                    </span>
                  )}

                </button>

                {/* INVESTOR */}

                <button
                  type="button"
                  className={
                    selectedRole === "investor"
                      ? "role-button selected investor-selected"
                      : "role-button"
                  }
                  onClick={() =>
                    changeRole("investor")
                  }
                >

                  <div className="role-icon investor-icon">
                    ◇
                  </div>

                  <div className="role-text">
                    <strong>
                      Investor
                    </strong>

                    <small>
                      I want to discover and invest
                      in promising businesses.
                    </small>
                  </div>

                  {selectedRole === "investor" && (
                    <span className="role-check investor-check">
                      ✓
                    </span>
                  )}

                </button>

              </div>

            </div>

            {/* FORM */}

            <div className="register-form">

              <div className="form-heading">

                <div>
                  <span className="form-step">
                    STEP 01
                  </span>

                  <h3>
                    {selectedRole === "business"
                      ? "Business details"
                      : "Investor details"}
                  </h3>
                </div>

                <span className="form-progress">
                  01 / 02
                </span>

              </div>

              {/* SUCCESS */}

              {message && (
                <div className="success-box">

                  <div className="success-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Account created successfully
                    </strong>

                    <p>
                      {selectedRole === "business"
                        ? "Complete KYC to continue."
                        : "Complete your investor profile to continue."}
                    </p>
                  </div>

                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="error-box">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* FORM */}

              {!message && (
                <form onSubmit={handleSubmit}>

                  <div className="form-fields">

                    <DynamicForm
                      fields={fields}
                      formData={formData}
                      handleChange={handleChange}
                    />

                  </div>

                  <TermsCheckbox
                    checked={formData.agree}
                    onChange={handleChange}
                  />

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >

                    <span className="button-icon">
                      +
                    </span>

                    <span>
                      {loading
                        ? "Creating account..."
                        : selectedRole === "business"
                        ? "Create Business Account"
                        : "Create Investor Account"}
                    </span>

                    <span className="button-arrow">
                      →
                    </span>

                  </button>

                </form>
              )}

              {/* BUSINESS SUCCESS */}

              {message &&
                selectedRole === "business" && (
                  <button
                    type="button"
                    className="submit-button"
                    onClick={() => navigate("/kyc")}
                  >
                    <span>
                      Continue to KYC
                    </span>

                    <span className="button-arrow">
                      →
                    </span>
                  </button>
                )}

              {/* INVESTOR SUCCESS */}

              {message &&
                selectedRole === "investor" && (
                  <Link
                    to="/investor-profile"
                    className="submit-button"
                  >
                    <span>
                      Continue to Profile
                    </span>

                    <span className="button-arrow">
                      →
                    </span>
                  </Link>
                )}

              {/* BUSINESS HINT */}

              {selectedRole === "business" &&
                !message && (
                  <p className="form-hint">
                    Your business will complete KYC and
                    verification before being published
                    to investors.
                  </p>
                )}

            </div>

            {/* LOGIN */}

            <div className="login-footer">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Login
              </Link>

            </div>

            {/* SECURITY */}

            <div className="security-footer">

              <div>
                <span className="security-dot" />
                SECURE REGISTRATION
              </div>

              <span>•</span>

              <div>
                ENCRYPTED
              </div>

              <span>•</span>

              <div>
                KENYA / AFRICA
              </div>

            </div>

          </div>

        </section>

      </div>
  );
}

export default Register;
