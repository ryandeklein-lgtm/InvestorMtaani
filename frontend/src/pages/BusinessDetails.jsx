import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

function BusinessDetails() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await api.get("/businesses/" + id);

        if (response.data && response.data.data) {
          setBusiness(response.data.data);
        } else {
          setBusiness(response.data);
        }
      } catch (error) {
        console.error("Error fetching business:", error);
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBusiness();
  }, [id]);

  async function handleMatchmake() {
    try {
      setMatchLoading(true);
      setMessage("");

      const response = await api.post(
        "/matchmaking/business/" + id,
        {
          investment_amount: 0,
          investment_type: "Matchmaking",
          message:
            "I am interested in exploring a business partnership.",
          special_request: false,
        }
      );

      setMessage(
        response.data.message ||
          "Matchmaking request sent successfully."
      );
    } catch (error) {
      console.error("Matchmaking error:", error);

      setMessage(
        error.response &&
        error.response.data &&
        error.response.data.message
          ? error.response.data.message
          : "Unable to send matchmaking request."
      );
    } finally {
      setMatchLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="business-details-page">
        <style>{businessDetailsStyles}</style>

        <div className="business-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading business...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-details-page">
        <style>{businessDetailsStyles}</style>

        <div className="business-details-container">
          <BackButton />

          <div className="business-details-empty">
            <div className="empty-icon">!</div>

            <h1>Business Not Found</h1>

            <p>
              We couldn't find the business you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const businessName =
    business.business_name || "Unnamed Business";

  const firstLetter =
    businessName.charAt(0).toUpperCase();

  const industry =
    business.industry || "Industry not specified";

  const location =
    business.location || "Location not specified";

  const description =
    business.description ||
    "No description available.";

  const views = business.views || 0;

  const employees = business.employees || 0;

  const founded =
    business.year_established || "N/A";

  const annualRevenue = Number(
    business.annual_revenue || 0
  ).toLocaleString();

  const monthlyGross = Number(
    business.monthly_gross || 0
  ).toLocaleString();

  const monthlyNet = Number(
    business.monthly_net || 0
  ).toLocaleString();

  const amountSeeking = Number(
    business.amount_seeking || 0
  ).toLocaleString();

  const fundingReason =
    business.funding_reason || "Not specified";

  return (
    <div className="business-details-page">
      <style>{businessDetailsStyles}</style>

      <div className="business-details-container">

        <div className="business-details-back">
          <BackButton />
        </div>

        <main className="business-details-card">

          <div className="business-details-top-line"></div>

          <section className="business-details-header">

            <div className="business-details-logo">
              {firstLetter}
            </div>

            <div className="business-details-heading">

              <div className="business-details-eyebrow">
                BUSINESS PROFILE
              </div>

              <h1>{businessName}</h1>

              <div className="business-details-verified">
                <span>✓</span>
                Verified Business
              </div>

              <div className="business-details-meta">

                <span>
                  <strong>INDUSTRY</strong>
                  {industry}
                </span>

                <span>
                  <strong>LOCATION</strong>
                  {location}
                </span>

              </div>
            </div>
          </section>

          <section className="business-details-stats">

            <div className="business-stat cyan">
              <span className="business-stat-icon">
                ◉
              </span>

              <div>
                <p>PROFILE VIEWS</p>
                <h3>{views}</h3>
              </div>
            </div>

            <div className="business-stat violet">
              <span className="business-stat-icon">
                ◇
              </span>

              <div>
                <p>EMPLOYEES</p>
                <h3>{employees}</h3>
              </div>
            </div>

            <div className="business-stat green">
              <span className="business-stat-icon">
                ◷
              </span>

              <div>
                <p>FOUNDED</p>
                <h3>{founded}</h3>
              </div>
            </div>

          </section>

          <div className="business-details-divider"></div>

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                01
              </span>

              <div>
                <p>BUSINESS OVERVIEW</p>
                <h2>About Business</h2>
              </div>
            </div>

            <div className="business-description-box">
              <p>{description}</p>
            </div>

          </section>

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                02
              </span>

              <div>
                <p>FINANCIAL DATA</p>
                <h2>Business Financials</h2>
              </div>
            </div>

            <div className="financial-grid">

              <div className="financial-card">
                <span>ANNUAL REVENUE</span>

                <strong>
                  KES {annualRevenue}
                </strong>
              </div>

              <div className="financial-card">
                <span>MONTHLY GROSS</span>

                <strong>
                  KES {monthlyGross}
                </strong>
              </div>

              <div className="financial-card">
                <span>MONTHLY NET</span>

                <strong>
                  KES {monthlyNet}
                </strong>
              </div>

            </div>

          </section>

          <section className="business-details-section">

            <div className="section-heading">
              <span className="section-number">
                03
              </span>

              <div>
                <p>CAPITAL REQUIREMENT</p>
                <h2>Funding Request</h2>
              </div>
            </div>

            <div className="funding-request">

              <div className="funding-glow"></div>

              <div className="funding-content">

                <span className="funding-label">
                  AMOUNT SEEKING
                </span>

                <h2>
                  KES {amountSeeking}
                </h2>

                <div className="funding-purpose">

                  <span>PURPOSE</span>

                  <p>
                    {fundingReason}
                  </p>

                </div>

              </div>

            </div>

          </section>

          <section className="matchmaking-section">

            <div className="matchmaking-copy">

              <span>
                INVESTOR MATCHMAKING
              </span>

              <h2>
                Interested in this business?
              </h2>

              <p>
                Send a matchmaking request and
                start exploring a potential
                investment relationship.
              </p>

            </div>

            <button
              type="button"
              className="matchmaking-button"
              onClick={handleMatchmake}
              disabled={matchLoading}
            >
              {matchLoading
                ? "SENDING REQUEST..."
                : "MATCHMAKE WITH BUSINESS →"}
            </button>

          </section>

          {message && (
            <div className="business-details-message">
              <span>✓</span>
              {message}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

const businessDetailsStyles = `
  .business-details-page {
    min-height: 100vh;
    padding: 32px 24px 80px;
    background:
      linear-gradient(
        rgba(61, 214, 245, 0.025) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(61, 214, 245, 0.025) 1px,
        transparent 1px
      ),
      #060911;
    background-size: 44px 44px;
    color: #E7EDF5;
    font-family: "Space Grotesk", sans-serif;
  }

  .business-details-container {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
  }

  .business-details-back {
    margin-bottom: 24px;
  }

  .business-details-card {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 100% 0%,
        rgba(139, 124, 246, 0.08),
        transparent 28%
      ),
      radial-gradient(
        circle at 0% 0%,
        rgba(61, 214, 245, 0.06),
        transparent 25%
      ),
      #0E1626;
    border: 1px solid rgba(61, 214, 245, 0.15);
    border-radius: 24px;
    padding: 44px;
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.45);
  }

  .business-details-top-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      #3DD6F5,
      #8B7CF6,
      #3DD6F5
    );
  }

  .business-details-header {
    display: flex;
    align-items: center;
    gap: 26px;
  }

  .business-details-logo {
    width: 96px;
    height: 96px;
    min-width: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 22px;
    background:
      linear-gradient(
        145deg,
        rgba(61, 214, 245, 0.15),
        rgba(139, 124, 246, 0.14)
      ),
      #09111F;
    border: 1px solid rgba(61, 214, 245, 0.30);
    color: #6BE3FA;
    font-family: "Fraunces", serif;
    font-size: 42px;
    font-weight: 700;
    box-shadow:
      0 0 35px rgba(61, 214, 245, 0.08);
  }

  .business-details-heading {
    flex: 1;
  }

  .business-details-eyebrow {
    margin-bottom: 8px;
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
  }

  .business-details-heading h1 {
    margin: 0 0 12px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 40px;
    line-height: 1.1;
    font-weight: 700;
  }

  .business-details-verified {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 11px;
    margin-bottom: 16px;
    border: 1px solid rgba(53, 208, 127, 0.25);
    border-radius: 999px;
    background: rgba(53, 208, 127, 0.08);
    color: #35D07F;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .business-details-verified span {
    font-size: 13px;
  }

  .business-details-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 26px;
  }

  .business-details-meta span {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #C8D3E1;
    font-size: 14px;
  }

  .business-details-meta strong {
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  .business-details-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 38px;
  }

  .business-stat {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: #09111F;
    border: 1px solid rgba(61, 214, 245, 0.10);
    border-radius: 16px;
  }

  .business-stat-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: rgba(61, 214, 245, 0.08);
    color: #3DD6F5;
    font-size: 20px;
  }

  .business-stat.violet .business-stat-icon {
    background: rgba(139, 124, 246, 0.08);
    color: #A99EFF;
  }

  .business-stat.green .business-stat-icon {
    background: rgba(53, 208, 127, 0.08);
    color: #35D07F;
  }

  .business-stat p {
    margin: 0 0 5px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .business-stat h3 {
    margin: 0;
    color: #E7EDF5;
    font-family: "JetBrains Mono", monospace;
    font-size: 20px;
  }

  .business-details-divider {
    height: 1px;
    margin: 38px 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(61, 214, 245, 0.18),
      rgba(139, 124, 246, 0.18),
      transparent
    );
  }

  .business-details-section {
    margin-top: 40px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .section-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(61, 214, 245, 0.20);
    border-radius: 9px;
    background: rgba(61, 214, 245, 0.05);
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
  }

  .section-heading p {
    margin: 0 0 3px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .section-heading h2 {
    margin: 0;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 25px;
  }

  .business-description-box {
    padding: 24px;
    background: #09111F;
    border: 1px solid rgba(61, 214, 245, 0.10);
    border-radius: 16px;
  }

  .business-description-box p {
    margin: 0;
    color: #C8D3E1;
    font-size: 15px;
    line-height: 1.85;
  }

  .financial-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .financial-card {
    position: relative;
    overflow: hidden;
    padding: 24px;
    background: #09111F;
    border: 1px solid rgba(139, 124, 246, 0.14);
    border-radius: 16px;
  }

  .financial-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: #8B7CF6;
  }

  .financial-card:nth-child(2)::before {
    background: #3DD6F5;
  }

  .financial-card:nth-child(3)::before {
    background: #35D07F;
  }

  .financial-card span {
    display: block;
    margin-bottom: 12px;
    color: #7C8AA0;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .financial-card strong {
    color: #E7EDF5;
    font-family: "JetBrains Mono", monospace;
    font-size: 19px;
  }

  .funding-request {
    position: relative;
    overflow: hidden;
    padding: 32px;
    background:
      linear-gradient(
        135deg,
        rgba(139, 124, 246, 0.12),
        rgba(61, 214, 245, 0.05)
      ),
      #09111F;
    border: 1px solid rgba(139, 124, 246, 0.24);
    border-radius: 18px;
  }

  .funding-glow {
    position: absolute;
    width: 180px;
    height: 180px;
    right: -70px;
    top: -70px;
    border-radius: 50%;
    background: rgba(139, 124, 246, 0.12);
    filter: blur(40px);
  }

  .funding-content {
    position: relative;
    z-index: 1;
  }

  .funding-label {
    display: block;
    margin-bottom: 9px;
    color: #A99EFF;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .funding-content h2 {
    margin: 0 0 24px;
    color: #E7EDF5;
    font-family: "JetBrains Mono", monospace;
    font-size: 32px;
  }

  .funding-purpose {
    padding-top: 18px;
    border-top: 1px solid rgba(139, 124, 246, 0.15);
  }

  .funding-purpose span {
    display: block;
    margin-bottom: 7px;
    color: #58667A;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .funding-purpose p {
    margin: 0;
    color: #C8D3E1;
    line-height: 1.7;
    font-size: 14px;
  }

  .matchmaking-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    margin-top: 42px;
    padding: 28px;
    background:
      linear-gradient(
        135deg,
        rgba(61, 214, 245, 0.07),
        rgba(139, 124, 246, 0.07)
      ),
      #09111F;
    border: 1px solid rgba(61, 214, 245, 0.15);
    border-radius: 18px;
  }

  .matchmaking-copy {
    flex: 1;
  }

  .matchmaking-copy > span {
    color: #3DD6F5;
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.10em;
  }

  .matchmaking-copy h2 {
    margin: 7px 0 6px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
    font-size: 24px;
  }

  .matchmaking-copy p {
    max-width: 560px;
    margin: 0;
    color: #7C8AA0;
    font-size: 13px;
    line-height: 1.6;
  }

  .matchmaking-button {
    flex-shrink: 0;
    padding: 15px 22px;
    border: 1px solid rgba(61, 214, 245, 0.35);
    border-radius: 11px;
    background: linear-gradient(
      135deg,
      #3DD6F5,
      #1BA7C7
    );
    color: #060911;
    font-family: "Space Grotesk", sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
    box-shadow:
      0 0 24px rgba(61, 214, 245, 0.12);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .matchmaking-button:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 30px rgba(61, 214, 245, 0.20);
  }

  .matchmaking-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .business-details-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 18px;
    padding: 14px 18px;
    border: 1px solid rgba(53, 208, 127, 0.20);
    border-radius: 12px;
    background: rgba(53, 208, 127, 0.07);
    color: #35D07F;
    text-align: center;
    font-size: 13px;
  }

  .business-details-message span {
    font-weight: 800;
  }

  .business-details-loading {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #3DD6F5;
  }

  .business-details-loading p {
    margin: 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 13px;
  }

  .loading-spinner {
    width: 38px;
    height: 38px;
    border: 3px solid rgba(61, 214, 245, 0.12);
    border-top-color: #3DD6F5;
    border-right-color: #8B7CF6;
    border-radius: 50%;
    animation: businessDetailsSpin 0.8s linear infinite;
  }

  @keyframes businessDetailsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .business-details-empty {
    max-width: 600px;
    margin: 100px auto;
    padding: 50px 30px;
    text-align: center;
    background: #0E1626;
    border: 1px solid rgba(61, 214, 245, 0.14);
    border-radius: 20px;
  }

  .empty-icon {
    width: 55px;
    height: 55px;
    margin: 0 auto 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 100, 124, 0.08);
    border: 1px solid rgba(255, 100, 124, 0.20);
    color: #FF647C;
    font-size: 24px;
    font-weight: 800;
  }

  .business-details-empty h1 {
    margin: 0 0 10px;
    color: #E7EDF5;
    font-family: "Fraunces", serif;
  }

  .business-details-empty p {
    margin: 0;
    color: #7C8AA0;
  }

  @media (max-width: 800px) {
    .business-details-page {
      padding: 24px 15px 60px;
    }

    .business-details-card {
      padding: 28px 20px;
      border-radius: 18px;
    }

    .business-details-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .business-details-heading h1 {
      font-size: 32px;
    }

    .business-details-stats,
    .financial-grid {
      grid-template-columns: 1fr;
    }

    .matchmaking-section {
      flex-direction: column;
      align-items: stretch;
    }

    .matchmaking-button {
      width: 100%;
    }
  }

  @media (max-width: 500px) {
    .business-details-meta {
      flex-direction: column;
      gap: 12px;
    }

    .business-details-logo {
      width: 76px;
      height: 76px;
      min-width: 76px;
      font-size: 34px;
    }

    .business-details-heading h1 {
      font-size: 28px;
    }

    .funding-content h2 {
      font-size: 25px;
    }
  }
`;

export default BusinessDetails;