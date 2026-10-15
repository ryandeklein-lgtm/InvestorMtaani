import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function BusinessProfile() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [fundingRequest, setFundingRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const businessResponse = await api.get("/businesses/me");
        setBusiness(businessResponse.data?.data || null);

        try {
          const fundingResponse = await api.get("/funding/me");
          const requests = fundingResponse.data?.data || [];

          if (Array.isArray(requests) && requests.length > 0) {
            setFundingRequest(requests[0]);
          }
        } catch (fundingError) {
          if (fundingError.response?.status !== 404) {
            console.error(
              "Error fetching funding request:",
              fundingError
            );
          }
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error(
            "Error fetching business profile:",
            error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const verificationStatus = useMemo(() => {
    const raw =
      business?.verification_status ||
      business?.verificationStatus ||
      business?.status ||
      "";

    const normalized = String(raw).toLowerCase();

    if (
      business?.verified === true ||
      business?.is_verified === true ||
      normalized === "verified"
    ) {
      return "VERIFIED";
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("review")
    ) {
      return "UNDER REVIEW";
    }

    if (
      normalized.includes("reject") ||
      normalized.includes("declin")
    ) {
      return "ACTION REQUIRED";
    }

    return "PROFILE IN PROGRESS";
  }, [business]);

  const isVerified = verificationStatus === "VERIFIED";

  const profileCompletion = useMemo(() => {
    if (!business) return 0;

    const checks = [
      business.business_name,
      business.industry,
      business.location,
      business.description,
      business.year_established ||
        business.founded ||
        business.established,
      business.employees,
      business.annual_revenue ||
        business.yearly_revenue ||
        business.turnover,
      business.amount_seeking ||
        business.amount_requested ||
        business.funding_amount,
      business.funding_reason ||
        business.use_of_funds ||
        business.funding_purpose,
    ];

    const completed = checks.filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    ).length;

    return Math.min(
      100,
      Math.round((completed / checks.length) * 100)
    );
  }, [business]);

  const readinessScore =
    Number(
      business?.investment_readiness_score ||
        business?.readiness_score ||
        0
    ) || 0;

  const fundingAmount =
    fundingRequest?.amount_requested ||
    business?.amount_seeking ||
    business?.amount_requested ||
    business?.funding_amount ||
    0;

  const fundingStructure =
    fundingRequest?.funding_type ||
    business?.funding_structure ||
    business?.investment_type ||
    business?.structure ||
    "Not specified";

  if (loading) {
    return (
      <div style={styles.statusPage}>
        <div style={styles.loadingOrb}></div>

        <span style={styles.statusEyebrow}>
          BUSINESS COMMAND CENTER
        </span>

        <h2 style={styles.statusHeading}>
          Loading your business profile...
        </h2>

        <p style={styles.statusText}>
          Preparing your capital-readiness dashboard.
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div style={styles.statusPage}>
        <div style={styles.emptyIcon}>+</div>

        <span style={styles.statusEyebrow}>
          BUSINESS COMMAND CENTER
        </span>

        <h2 style={styles.statusHeading}>
          Build your business profile
        </h2>

        <p style={styles.statusText}>
          Your business profile is the foundation for
          verification, investor discovery and potential
          introductions.
        </p>

        <button
          style={styles.primaryButton}
          onClick={() => navigate("/business/create")}
        >
          Create Business Profile
          <span>↗</span>
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.gridBackground}></div>

      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          <span style={styles.backArrow}>←</span>
          BACK
        </button>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section style={styles.hero}>
          <div style={styles.heroGlow}></div>

          <div style={styles.heroContent}>
            <div style={styles.heroTopRow}>
              <div style={styles.industryRow}>
                <span style={styles.industryBadge}>
                  {business.industry || "BUSINESS"}
                </span>

                <span
                  style={{
                    ...styles.verificationBadge,
                    ...(isVerified
                      ? styles.verificationVerified
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.verificationDot,
                      ...(isVerified
                        ? styles.verificationDotVerified
                        : {}),
                    }}
                  ></span>

                  {verificationStatus}
                </span>
              </div>

              <span style={styles.profileId}>
                BUSINESS PROFILE
              </span>
            </div>

            <h1 style={styles.businessName}>
              {business.business_name ||
                "Your Business"}
            </h1>

            <p style={styles.location}>
              <span style={styles.locationIcon}>⌖</span>
              {business.location ||
                "Location not added"}
            </p>

            <p style={styles.heroDescription}>
              {business.description ||
                "Complete your profile to present your business clearly to potential investors."}
            </p>
          </div>

          <div style={styles.heroMetrics}>
            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>
                PROFILE COMPLETION
              </span>

              <strong style={styles.metricNumber}>
                {profileCompletion}%
              </strong>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${profileCompletion}%`,
                  }}
                ></div>
              </div>
            </div>

            <div style={styles.metricBox}>
              <span style={styles.metricLabel}>
                INVESTOR VIEWS
              </span>

              <strong style={styles.metricNumber}>
                {business.views ||
                  business.profile_views ||
                  0}
              </strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            CAPITAL READINESS JOURNEY
        ====================================================== */}

        <section style={styles.journeyCard}>
          <div style={styles.journeyHeader}>
            <div>
              <span style={styles.sectionEyebrow}>
                CAPITAL READINESS
              </span>

              <h2 style={styles.journeyTitle}>
                Your Investor Mtaani Journey
              </h2>

              <p style={styles.journeySubtitle}>
                Complete each stage before your opportunity
                becomes visible to the right investors.
              </p>
            </div>

            <div style={styles.journeyStatus}>
              <span style={styles.journeyStatusLabel}>
                CURRENT STATUS
              </span>

              <strong>
                {isVerified
                  ? "READY FOR DISCOVERY"
                  : verificationStatus}
              </strong>
            </div>
          </div>

          <div style={styles.steps}>
            <JourneyStep
              number="01"
              title="Register"
              description="Create your business account"
              complete
            />

            <JourneyStep
              number="02"
              title="KYC"
              description="Submit identity and business documents"
              active={
                !business?.kyc_completed &&
                !isVerified
              }
              complete={
                business?.kyc_completed === true ||
                business?.kyc_status === "approved"
              }
            />

            <JourneyStep
              number="03"
              title="Verification"
              description="Investor Mtaani reviews your information"
              active={
                verificationStatus === "UNDER REVIEW"
              }
              complete={isVerified}
            />

            <JourneyStep
              number="04"
              title="Investment Profile"
              description="Define your funding requirement"
              active={Boolean(fundingRequest)}
              complete={Boolean(fundingRequest)}
            />

            <JourneyStep
              number="05"
              title="Approval"
              description="Profile approved for publication"
              active={isVerified}
              complete={
                business?.approval_status === "approved" ||
                business?.approved === true
              }
            />

            <JourneyStep
              number="06"
              title="Publish"
              description="Become discoverable to investors"
              active={isVerified}
              complete={
                business?.published === true ||
                business?.is_published === true
              }
            />
          </div>
        </section>

        <div style={styles.layout}>
          <main style={styles.mainContent}>
            {/* =================================================
                PROFILE
            ================================================== */}

            <section style={styles.card}>
              <div style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>
                  01
                </span>

                <div>
                  <span style={styles.sectionEyebrow}>
                    BUSINESS IDENTITY
                  </span>

                  <h2 style={styles.heading}>
                    About the Business
                  </h2>

                  <p style={styles.subheading}>
                    The information investors will use to
                    understand your company.
                  </p>
                </div>
              </div>

              <div style={styles.headingLine}></div>

              <p style={styles.description}>
                {business.description ||
                  "No business description has been added yet."}
              </p>

              <div style={styles.identityGrid}>
                <InfoItem
                  label="Industry"
                  value={
                    business.industry ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Location"
                  value={
                    business.location ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Established"
                  value={
                    business.year_established ||
                    business.founded ||
                    business.established ||
                    "Not specified"
                  }
                />

                <InfoItem
                  label="Employees"
                  value={
                    business.employees ||
                    business.employee_count ||
                    "Not specified"
                  }
                />
              </div>

              <button
                style={styles.secondaryButton}
                onClick={() =>
                  navigate("/business/create")
                }
              >
                Edit Business Profile
                <span>↗</span>
              </button>
            </section>

            {/* =================================================
                FINANCIAL PERFORMANCE
            ================================================== */}

            <section style={styles.card}>
              <div style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>
                  02
                </span>

                <div>
                  <span style={styles.sectionEyebrow}>
                    FINANCIAL PROFILE
                  </span>

                  <h2 style={styles.heading}>
                    Business Performance
                  </h2>

                  <p style={styles.subheading}>
                    Financial information supporting your
                    investment profile.
                  </p>
                </div>
              </div>

              <div style={styles.headingLine}></div>

              <div style={styles.stats}>
                <Stat
                  title="Annual Revenue"
                  value={formatMoney(
                    business.annual_revenue ||
                      business.yearly_revenue ||
                      business.turnover
                  )}
                />

                <Stat
                  title="Monthly Gross"
                  value={formatMoney(
                    business.monthly_gross
                  )}
                />

                <Stat
                  title="Monthly Net"
                  value={formatMoney(
                    business.monthly_net
                  )}
                />

                <Stat
                  title="Employees"
                  value={
                    business.employees ||
                    business.employee_count ||
                    0
                  }
                />
              </div>
            </section>

            {/* =================================================
                FUNDING PROFILE
            ================================================== */}

            <section style={styles.fundingCard}>
              <div style={styles.fundingGlow}></div>

              <div style={styles.sectionHeading}>
                <span
                  style={{
                    ...styles.sectionIcon,
                    background:
                      "rgba(139,124,246,.1)",
                    borderColor:
                      "rgba(139,124,246,.35)",
                    color: "#A99EFF",
                  }}
                >
                  03
                </span>

                <div>
                  <span style={styles.fundingLabel}>
                    INVESTMENT PROFILE
                  </span>

                  <h2 style={styles.fundingHeading}>
                    Capital Requirement
                  </h2>

                  <p style={styles.fundingSubheading}>
                    Tell investors what you need, why you
                    need it and how the capital supports
                    growth.
                  </p>
                </div>
              </div>

              <div style={styles.headingLinePurple}></div>

              <div style={styles.fundingMain}>
                <div>
                  <span style={styles.fundingAmountLabel}>
                    CAPITAL REQUIRED
                  </span>

                  <h2 style={styles.fundingAmount}>
                    {fundingAmount
                      ? formatMoney(fundingAmount)
                      : "Not specified"}
                  </h2>
                </div>

                <div style={styles.structureBox}>
                  <span style={styles.detailLabel}>
                    STRUCTURE
                  </span>

                  <strong style={styles.structureValue}>
                    {fundingStructure}
                  </strong>
                </div>
              </div>

              {fundingRequest ? (
                <>
                  <div style={styles.fundingDetails}>
                    <DetailBox
                      label="TIMELINE"
                      value={
                        fundingRequest.funding_timeline ||
                        "Not specified"
                      }
                    />

                    <DetailBox
                      label="STATUS"
                      value={
                        fundingRequest.status ||
                        "Submitted"
                      }
                      status
                    />
                  </div>

                  <div style={styles.divider}></div>

                  <h3 style={styles.useTitle}>
                    How the funding will be used
                  </h3>

                  <p style={styles.fundingReason}>
                    {fundingRequest.funding_reason ||
                      "No funding purpose has been added yet."}
                  </p>

                  {fundingRequest.expected_impact && (
                    <>
                      <h3 style={styles.impactTitle}>
                        Expected Impact
                      </h3>

                      <p style={styles.fundingReason}>
                        {
                          fundingRequest.expected_impact
                        }
                      </p>
                    </>
                  )}
                </>
              ) : (
                <div style={styles.fundingEmpty}>
                  <span style={styles.emptyFundingIcon}>
                    +
                  </span>

                  <div>
                    <strong>
                      No investment profile submitted
                    </strong>

                    <p>
                      Add your funding requirement and
                      intended use of funds to move your
                      profile toward investor readiness.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/funding")}
                style={styles.manageFundingButton}
              >
                {fundingRequest
                  ? "Manage Investment Profile"
                  : "Create Investment Profile"}

                <span>→</span>
              </button>
            </section>

            {/* =================================================
                STRUCTURES
            ================================================== */}

            <section style={styles.card}>
              <div style={styles.sectionHeading}>
                <span style={styles.sectionIcon}>
                  04
                </span>

                <div>
                  <span style={styles.sectionEyebrow}>
                    CAPITAL STRUCTURE
                  </span>

                  <h2 style={styles.heading}>
                    How You Can Raise Capital
                  </h2>

                  <p style={styles.subheading}>
                    Investor Mtaani supports structured
                    opportunities, subject to applicable
                    legal and regulatory requirements.
                  </p>
                </div>
              </div>

              <div style={styles.headingLine}></div>

              <div style={styles.structureGrid}>
                <StructureCard
                  icon="↗"
                  title="Debt / Credit Financing"
                  text="A financing arrangement where capital is provided with agreed repayment terms, return, security and default provisions."
                />

                <StructureCard
                  icon="◈"
                  title="Equity Investment"
                  text="Capital provided in exchange for an ownership interest, subject to valuation, ownership, governance, dilution and exit terms."
                />
              </div>

              <div style={styles.disclaimer}>
                <span style={styles.disclaimerIcon}>
                  !
                </span>

                <p>
                  The platform facilitates discovery,
                  verification and introductions. It does
                  not guarantee investment, repayment,
                  profitability or future business
                  performance. Parties should obtain
                  appropriate independent legal and
                  financial advice.
                </p>
              </div>
            </section>
          </main>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}

          <aside style={styles.sidebar}>
            {/* Readiness */}
            <section style={styles.sideCard}>
              <div style={styles.cardTopLine}></div>

              <span style={styles.sideEyebrow}>
                READINESS INDEX
              </span>

              <h3 style={styles.sideTitle}>
                Investor Readiness
              </h3>

              <div style={styles.scoreWrapper}>
                <div
                  style={{
                    ...styles.scoreCircle,
                    background: getScoreGradient(
                      readinessScore
                    ),
                  }}
                >
                  <div style={styles.scoreInner}>
                    <span style={styles.scoreNumber}>
                      {readinessScore}
                    </span>

                    <span style={styles.scorePercent}>
                      %
                    </span>
                  </div>
                </div>
              </div>

              <p style={styles.sideText}>
                This score reflects how prepared the
                available business information is for
                investor discovery.
              </p>

              <div style={styles.readinessList}>
                <ReadinessItem
                  label="Business profile"
                  complete={profileCompletion >= 70}
                />

                <ReadinessItem
                  label="Funding requirement"
                  complete={Boolean(fundingRequest)}
                />

                <ReadinessItem
                  label="Verification"
                  complete={isVerified}
                />
              </div>
            </section>

            {/* Verification */}
            <section style={styles.verificationCard}>
              <span style={styles.sideEyebrow}>
                TRUST & VERIFICATION
              </span>

              <h3 style={styles.verificationTitle}>
                {isVerified
                  ? "Business Verified"
                  : "Complete Verification"}
              </h3>

              <p style={styles.matchText}>
                {isVerified
                  ? "Your business has passed the current verification stage. Verification does not constitute an investment recommendation."
                  : "Verification helps investors understand which business information has been reviewed by Investor Mtaani."}
              </p>

              <button
                style={styles.verificationButton}
                onClick={() =>
                  navigate("/business/create")
                }
              >
                {isVerified
                  ? "Review Business Details"
                  : "Complete Business Information"}

                <span>→</span>
              </button>
            </section>

            {/* Matches */}
            <section style={styles.matchCard}>
              <div style={styles.matchGlow}></div>

              <span style={styles.matchEyebrow}>
                INVESTOR CONNECTIONS
              </span>

              <h3 style={styles.matchTitle}>
                Manage your matches
              </h3>

              <p style={styles.matchText}>
                Review investors who request an
                introduction to your business.
              </p>

              <button
                style={styles.matchButton}
                onClick={() =>
                  navigate("/business-matches")
                }
              >
                View Introduction Requests
                <span>→</span>
              </button>
            </section>

            {/* Visibility */}
            <section style={styles.visibilityCard}>
              <span style={styles.sideEyebrow}>
                PLATFORM VISIBILITY
              </span>

              <div style={styles.visibilityRow}>
                <span
                  style={{
                    ...styles.visibilityDot,
                    background:
                      business.published ||
                      business.is_published
                        ? "#35D07F"
                        : "#F1C75B",
                    boxShadow:
                      business.published ||
                      business.is_published
                        ? "0 0 10px rgba(53,208,127,.6)"
                        : "0 0 10px rgba(241,199,91,.45)",
                  }}
                ></span>

                <strong>
                  {business.published ||
                  business.is_published
                    ? "Published"
                    : "Not Yet Published"}
                </strong>
              </div>

              <p style={styles.visibilityText}>
                {business.published ||
                business.is_published
                  ? "Your opportunity can be presented to relevant investors."
                  : "Your profile is not yet publicly presented as an investment opportunity."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function JourneyStep({
  number,
  title,
  description,
  active,
  complete,
}) {
  return (
    <div
      style={{
        ...styles.journeyStep,
        ...(active ? styles.journeyStepActive : {}),
        ...(complete ? styles.journeyStepComplete : {}),
      }}
    >
      <div
        style={{
          ...styles.stepNumber,
          ...(complete
            ? styles.stepNumberComplete
            : {}),
          ...(active
            ? styles.stepNumberActive
            : {}),
        }}
      >
        {complete ? "✓" : number}
      </div>

      <div>
        <strong style={styles.stepTitle}>
          {title}
        </strong>

        <p style={styles.stepDescription}>
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statAccent}>+</span>

      <span style={styles.statTitle}>
        {title}
      </span>

      <strong style={styles.statValue}>
        {value}
      </strong>
    </div>
  );
}

function DetailBox({ label, value, status }) {
  return (
    <div style={styles.detailBox}>
      <span style={styles.detailLabel}>
        {label}
      </span>

      <strong
        style={
          status
            ? styles.statusBadge
            : styles.detailValue
        }
      >
        {status && (
          <span style={styles.statusDot}></span>
        )}

        {value}
      </strong>
    </div>
  );
}

function StructureCard({ icon, title, text }) {
  return (
    <div style={styles.structureCard}>
      <div style={styles.structureIcon}>
        {icon}
      </div>

      <h3 style={styles.structureTitle}>
        {title}
      </h3>

      <p style={styles.structureText}>
        {text}
      </p>
    </div>
  );
}

function ReadinessItem({ label, complete }) {
  return (
    <div style={styles.readinessItem}>
      <span
        style={{
          ...styles.readinessDot,
          ...(complete
            ? styles.readinessDotComplete
            : {}),
        }}
      >
        {complete ? "✓" : ""}
      </span>

      <span>{label}</span>
    </div>
  );
}

function formatMoney(amount) {
  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    Number.isNaN(Number(amount))
  ) {
    return "KES 0";
  }

  return `KES ${Number(amount).toLocaleString(
    "en-KE"
  )}`;
}

function getScoreGradient(score) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const degrees = safeScore * 3.6;

  return `conic-gradient(
    #3DD6F5 0deg,
    #8B7CF6 ${degrees}deg,
    rgba(61,214,245,.08) ${degrees}deg
  )`;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#060911",
    color: "#E7EDF5",
    padding: "36px 20px 80px",
    fontFamily: "'Space Grotesk', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  gridBackground: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.22,
    backgroundImage:
      "linear-gradient(rgba(61,214,245,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,245,0.055) 1px, transparent 1px)",
    backgroundSize: "55px 55px",
    zIndex: 0,
  },

  container: {
    width: "min(1180px, 100%)",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "transparent",
    border: "none",
    color: "#7C8AA0",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontFamily: "'JetBrains Mono', monospace",
    padding: "10px 0",
    marginBottom: "22px",
  },

  backArrow: {
    fontSize: "18px",
    color: "#3DD6F5",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0E1626 0%, #0B1424 55%, #111C2F 100%)",
    border: "1px solid rgba(61,214,245,.24)",
    borderRadius: "18px",
    padding: "38px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "30px",
    marginBottom: "22px",
    boxShadow:
      "0 24px 70px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.025)",
  },

  heroGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    right: "-200px",
    top: "-280px",
    background:
      "radial-gradient(circle, rgba(61,214,245,.15), transparent 68%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    minWidth: 0,
  },

  heroTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
  },

  industryRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  industryBadge: {
    padding: "7px 12px",
    borderRadius: "5px",
    background: "rgba(61,214,245,.08)",
    border: "1px solid rgba(61,214,245,.3)",
    color: "#6BE3FA",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1.3px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  verificationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 9px",
    borderRadius: "5px",
    background: "rgba(241,199,91,.06)",
    border: "1px solid rgba(241,199,91,.25)",
    color: "#F1C75B",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  verificationVerified: {
    color: "#35D07F",
    background: "rgba(53,208,127,.06)",
    borderColor: "rgba(53,208,127,.28)",
  },

  verificationDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#F1C75B",
  },

  verificationDotVerified: {
    background: "#35D07F",
    boxShadow: "0 0 8px rgba(53,208,127,.7)",
  },

  profileId: {
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1.4px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  businessName: {
    color: "#E7EDF5",
    fontSize: "clamp(32px, 5vw, 48px)",
    lineHeight: "1.05",
    margin: "18px 0 10px",
    fontWeight: "700",
    letterSpacing: "-1.5px",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#7C8AA0",
    fontSize: "14px",
    margin: 0,
  },

  locationIcon: {
    color: "#3DD6F5",
    fontSize: "18px",
  },

  heroDescription: {
    color: "#8997AA",
    fontSize: "13px",
    lineHeight: "1.7",
    maxWidth: "680px",
    margin: "18px 0 0",
  },

  heroMetrics: {
    position: "relative",
    zIndex: 1,
    width: "210px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  metricBox: {
    background: "rgba(6,9,17,.55)",
    border: "1px solid rgba(61,214,245,.14)",
    borderRadius: "9px",
    padding: "16px",
  },

  metricLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  metricNumber: {
    display: "block",
    color: "#6BE3FA",
    fontSize: "27px",
    margin: "7px 0 10px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  progressTrack: {
    width: "100%",
    height: "4px",
    borderRadius: "4px",
    background: "rgba(61,214,245,.08)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "4px",
    background:
      "linear-gradient(90deg, #3DD6F5, #8B7CF6)",
    boxShadow: "0 0 12px rgba(61,214,245,.45)",
    transition: "width .4s ease",
  },

  journeyCard: {
    background:
      "linear-gradient(145deg, #0E1626, #09111F)",
    border: "1px solid rgba(61,214,245,.13)",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "22px",
    boxShadow: "0 15px 45px rgba(0,0,0,.22)",
  },

  journeyHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "25px",
    alignItems: "flex-start",
  },

  sectionEyebrow: {
    display: "block",
    color: "#3DD6F5",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "6px",
  },

  journeyTitle: {
    color: "#E7EDF5",
    fontSize: "23px",
    margin: 0,
    fontWeight: "600",
  },

  journeySubtitle: {
    color: "#58667A",
    fontSize: "12px",
    margin: "7px 0 0",
    lineHeight: "1.6",
  },

  journeyStatus: {
    flex: "0 0 auto",
    padding: "12px 15px",
    borderRadius: "8px",
    background: "rgba(53,208,127,.05)",
    border: "1px solid rgba(53,208,127,.18)",
    textAlign: "right",
  },

  journeyStatusLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1px",
    marginBottom: "5px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  journeyStatusStrong: {},

  steps: {
    display: "grid",
    gridTemplateColumns:
      "repeat(6, minmax(0, 1fr))",
    gap: "8px",
    marginTop: "25px",
  },

  journeyStep: {
    position: "relative",
    minHeight: "125px",
    background: "#09111F",
    border: "1px solid rgba(255,255,255,.05)",
    borderRadius: "9px",
    padding: "15px",
  },

  journeyStepActive: {
    borderColor: "rgba(61,214,245,.3)",
    background: "rgba(61,214,245,.035)",
  },

  journeyStepComplete: {
    borderColor: "rgba(53,208,127,.25)",
    background: "rgba(53,208,127,.035)",
  },

  stepNumber: {
    width: "29px",
    height: "29px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#58667A",
    fontSize: "9px",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "12px",
  },

  stepNumberActive: {
    color: "#3DD6F5",
    borderColor: "rgba(61,214,245,.3)",
    background: "rgba(61,214,245,.07)",
  },

  stepNumberComplete: {
    color: "#35D07F",
    borderColor: "rgba(53,208,127,.3)",
    background: "rgba(53,208,127,.07)",
  },

  stepTitle: {
    display: "block",
    color: "#C8D3E1",
    fontSize: "12px",
    marginBottom: "5px",
  },

  stepDescription: {
    color: "#58667A",
    fontSize: "10px",
    lineHeight: "1.5",
    margin: 0,
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "22px",
    alignItems: "start",
  },

  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
    minWidth: 0,
  },

  card: {
    position: "relative",
    background:
      "linear-gradient(145deg, rgba(14,22,38,.98), rgba(9,17,31,.98))",
    border: "1px solid rgba(61,214,245,.13)",
    borderRadius: "14px",
    padding: "28px",
    boxShadow: "0 15px 45px rgba(0,0,0,.22)",
  },

  sectionHeading: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  sectionIcon: {
    flex: "0 0 auto",
    width: "38px",
    height: "38px",
    background: "rgba(61,214,245,.08)",
    border: "1px solid rgba(61,214,245,.28)",
    color: "#3DD6F5",
    borderRadius: "7px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
  },

  heading: {
    color: "#E7EDF5",
    margin: "0 0 4px",
    fontSize: "21px",
    fontWeight: "600",
  },

  subheading: {
    color: "#58667A",
    fontSize: "12px",
    margin: 0,
    lineHeight: "1.5",
  },

  headingLine: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(61,214,245,.2), transparent)",
    margin: "22px 0",
  },

  headingLinePurple: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(139,124,246,.28), transparent)",
    margin: "22px 0",
  },

  description: {
    color: "#AAB6C7",
    lineHeight: "1.85",
    fontSize: "14px",
    margin: 0,
  },

  identityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "22px",
  },

  infoItem: {
    background: "#09111F",
    border: "1px solid rgba(61,214,245,.08)",
    borderRadius: "8px",
    padding: "15px",
  },

  infoLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "7px",
  },

  infoValue: {
    color: "#C8D3E1",
    fontSize: "13px",
  },

  secondaryButton: {
    marginTop: "18px",
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    background: "rgba(61,214,245,.06)",
    color: "#6BE3FA",
    border: "1px solid rgba(61,214,245,.25)",
    borderRadius: "7px",
    padding: "11px 15px",
    fontWeight: "700",
    fontSize: "11px",
    cursor: "pointer",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
  },

  stat: {
    position: "relative",
    overflow: "hidden",
    background: "#09111F",
    border: "1px solid rgba(61,214,245,.1)",
    borderRadius: "9px",
    padding: "20px",
  },

  statAccent: {
    position: "absolute",
    right: "12px",
    top: "7px",
    color: "rgba(61,214,245,.08)",
    fontSize: "38px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statTitle: {
    display: "block",
    color: "#58667A",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
    marginBottom: "9px",
    textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statValue: {
    display: "block",
    color: "#E7EDF5",
    fontSize: "17px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  fundingCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #111C2F 0%, #0D1728 100%)",
    border: "1px solid rgba(139,124,246,.28)",
    borderRadius: "14px",
    padding: "30px",
    boxShadow: "0 15px 55px rgba(0,0,0,.25)",
  },

  fundingGlow: {
    position: "absolute",
    width: "350px",
    height: "350px",
    right: "-180px",
    top: "-220px",
    background:
      "radial-gradient(circle, rgba(139,124,246,.16), transparent 70%)",
    pointerEvents: "none",
  },

  fundingLabel: {
    display: "block",
    color: "#A99EFF",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "6px",
  },

  fundingHeading: {
    color: "#E7EDF5",
    fontSize: "21px",
    margin: 0,
    fontWeight: "600",
  },

  fundingSubheading: {
    color: "#58667A",
    fontSize: "12px",
    margin: "6px 0 0",
    lineHeight: "1.6",
  },

  fundingMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  fundingAmountLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1.2px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  fundingAmount: {
    color: "#E7EDF5",
    fontSize: "32px",
    margin: "7px 0 0",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "700",
  },

  structureBox: {
    minWidth: "145px",
    padding: "14px",
    background: "rgba(6,9,17,.45)",
    border: "1px solid rgba(139,124,246,.14)",
    borderRadius: "8px",
  },

  structureValue: {
    color: "#C8D3E1",
    fontSize: "12px",
  },

  fundingDetails: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginTop: "25px",
  },

  detailBox: {
    background: "rgba(6,9,17,.45)",
    border: "1px solid rgba(139,124,246,.12)",
    borderRadius: "8px",
    padding: "15px",
  },

  detailLabel: {
    display: "block",
    color: "#58667A",
    fontSize: "8px",
    letterSpacing: "1px",
    marginBottom: "7px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  detailValue: {
    color: "#C8D3E1",
    fontSize: "12px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#35D07F",
    textTransform: "uppercase",
    fontSize: "10px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#35D07F",
    boxShadow: "0 0 8px rgba(53,208,127,.7)",
  },

  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, rgba(139,124,246,.25), transparent)",
    margin: "25px 0",
  },

  useTitle: {
    color: "#E7EDF5",
    fontSize: "14px",
    margin: 0,
    fontWeight: "700",
  },

  impactTitle: {
    color: "#E7EDF5",
    fontSize: "14px",
    margin: "24px 0 0",
    fontWeight: "700",
  },

  fundingReason: {
    color: "#8997AA",
    lineHeight: "1.8",
    fontSize: "13px",
    margin: "10px 0 0",
  },

  fundingEmpty: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(139,124,246,.05)",
    border: "1px solid rgba(139,124,246,.13)",
    borderRadius: "9px",
    padding: "17px",
  },

  emptyFundingIcon: {
    width: "36px",
    height: "36px",
    flex: "0 0 auto",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#A99EFF",
    border: "1px solid rgba(139,124,246,.3)",
    background: "rgba(139,124,246,.08)",
    fontSize: "20px",
  },

  fundingEmptyStrong: {},

  fundingEmptyP: {},

  manageFundingButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "24px",
    background: "rgba(139,124,246,.1)",
    color: "#A99EFF",
    border: "1px solid rgba(139,124,246,.4)",
    borderRadius: "7px",
    padding: "12px 16px",
    fontWeight: "700",
    fontSize: "11px",
    cursor: "pointer",
  },

  structureGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  structureCard: {
    background: "#09111F",
    border: "1px solid rgba(61,214,245,.09)",
    borderRadius: "9px",
    padding: "20px",
  },

  structureIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(61,214,245,.07)",
    border: "1px solid rgba(61,214,245,.2)",
    color: "#3DD6F5",
    fontSize: "16px",
  },

  structureTitle: {
    color: "#E7EDF5",
    fontSize: "15px",
    margin: "14px 0 7px",
  },

  structureText: {
    color: "#7C8AA0",
    fontSize: "12px",
    lineHeight: "1.7",
    margin: 0,
  },

  disclaimer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginTop: "15px",
    padding: "13px",
    borderRadius: "8px",
    background: "rgba(241,199,91,.035)",
    border: "1px solid rgba(241,199,91,.12)",
  },

  disclaimerIcon: {
    color: "#F1C75B",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
  },

  disclaimerText: {},

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    minWidth: 0,
  },

  sideCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #0E1626, #09111F)",
    border: "1px solid rgba(61,214,245,.13)",
    borderRadius: "14px",
    padding: "27px",
    textAlign: "center",
  },

  cardTopLine: {
    position: "absolute",
    top: 0,
    left: "12%",
    right: "12%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, #3DD6F5, transparent)",
    boxShadow: "0 0 12px rgba(61,214,245,.5)",
  },

  sideEyebrow: {
    color: "#58667A",
    fontSize: "8px",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1.4px",
  },

  sideTitle: {
    color: "#E7EDF5",
    margin: "9px 0 0",
    fontSize: "19px",
    fontWeight: "600",
  },

  scoreWrapper: {
    margin: "25px auto",
  },

  scoreCircle: {
    width: "130px",
    height: "130px",
    margin: "0 auto",
    borderRadius: "50%",
    padding: "8px",
    boxShadow: "0 0 35px rgba(61,214,245,.12)",
  },

  scoreInner: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "#09111F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreNumber: {
    color: "#6BE3FA",
    fontSize: "27px",
    fontWeight: "700",
    fontFamily: "'JetBrains Mono', monospace",
  },

  scorePercent: {
    color: "#58667A",
    fontSize: "12px",
    marginTop: "9px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  sideText: {
    color: "#7C8AA0",
    lineHeight: "1.7",
    fontSize: "11px",
    margin: 0,
  },

  readinessList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "20px",
    textAlign: "left",
  },

  readinessItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#8997AA",
    fontSize: "11px",
  },

  readinessDot: {
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,.1)",
    color: "#58667A",
    fontSize: "9px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  readinessDotComplete: {
    color: "#35D07F",
    borderColor: "rgba(53,208,127,.3)",
    background: "rgba(53,208,127,.06)",
  },

  verificationCard: {
    background:
      "linear-gradient(145deg, #111C2F, #0A1423)",
    border: "1px solid rgba(61,214,245,.17)",
    borderRadius: "14px",
    padding: "25px",
  },

  verificationTitle: {
    color: "#E7EDF5",
    fontSize: "19px",
    margin: "10px 0 8px",
  },

  matchText: {
    color: "#7C8AA0",
    lineHeight: "1.7",
    fontSize: "12px",
    margin: 0,
  },

  verificationButton: {
    width: "100%",
    marginTop: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    background: "rgba(61,214,245,.07)",
    color: "#6BE3FA",
    border: "1px solid rgba(61,214,245,.25)",
    borderRadius: "7px",
    padding: "12px 13px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "10px",
  },

  matchCard: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(145deg, #111C2F, #0A1423)",
    border: "1px solid rgba(139,124,246,.3)",
    borderRadius: "14px",
    padding: "27px",
    boxShadow: "0 15px 45px rgba(0,0,0,.25)",
  },

  matchGlow: {
    position: "absolute",
    width: "260px",
    height: "260px",
    right: "-150px",
    top: "-140px",
    background:
      "radial-gradient(circle, rgba(139,124,246,.18), transparent 70%)",
    pointerEvents: "none",
  },

  matchEyebrow: {
    position: "relative",
    color: "#A99EFF",
    fontSize: "9px",
    fontWeight: "800",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "1.2px",
  },

  matchTitle: {
    position: "relative",
    color: "#E7EDF5",
    fontSize: "21px",
    margin: "12px 0 9px",
    fontWeight: "600",
    lineHeight: "1.2",
  },

  matchButton: {
    position: "relative",
    width: "100%",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    background: "rgba(139,124,246,.1)",
    color: "#A99EFF",
    border: "1px solid rgba(139,124,246,.4)",
    borderRadius: "7px",
    padding: "13px 14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
  },

  visibilityCard: {
    background: "#09111F",
    border: "1px solid rgba(61,214,245,.1)",
    borderRadius: "14px",
    padding: "22px",
  },

  visibilityRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "13px",
    color: "#C8D3E1",
    fontSize: "14px",
  },

  visibilityDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },

  visibilityText: {
    color: "#58667A",
    fontSize: "11px",
    lineHeight: "1.6",
    margin: "8px 0 0",
  },

  statusPage: {
    minHeight: "75vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#060911",
    color: "#E7EDF5",
    textAlign: "center",
    padding: "40px 20px",
    fontFamily: "'Space Grotesk', sans-serif",
  },

  statusEyebrow: {
    color: "#3DD6F5",
    fontSize: "9px",
    letterSpacing: "1.6px",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "12px",
  },

  statusHeading: {
    color: "#E7EDF5",
    fontSize: "25px",
    fontWeight: "600",
    margin: 0,
  },

  statusText: {
    color: "#7C8AA0",
    maxWidth: "420px",
    margin: "12px 0 5px",
    lineHeight: "1.7",
    fontSize: "13px",
  },

  loadingOrb: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid rgba(61,214,245,.12)",
    borderTopColor: "#3DD6F5",
    boxShadow: "0 0 25px rgba(61,214,245,.2)",
    marginBottom: "25px",
    animation: "spin 1s linear infinite",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "10px",
    border: "1px solid rgba(61,214,245,.3)",
    background: "rgba(61,214,245,.06)",
    color: "#3DD6F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    marginBottom: "22px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px",
    background: "#3DD6F5",
    color: "#061018",
    border: "1px solid #6BE3FA",
    borderRadius: "7px",
    padding: "12px 18px",
    fontWeight: "800",
    fontSize: "12px",
    fontFamily: "'Space Grotesk', sans-serif",
    cursor: "pointer",
    boxShadow: "0 0 22px rgba(61,214,245,.14)",
  },
};

export default BusinessProfile;