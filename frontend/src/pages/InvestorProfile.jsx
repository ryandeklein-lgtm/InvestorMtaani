import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

const COLORS = {
  bg: "#060911",
  panel: "#0E1626",
  panel2: "#111C2F",
  panel3: "#14233A",
  cyan: "#3DD6F5",
  cyanBright: "#6BE3FA",
  violet: "#8B7CF6",
  violetBright: "#A99EFF",
  green: "#35D07F",
  gold: "#F1C75B",
  red: "#FF647C",
  text: "#E7EDF5",
  light: "#C8D3E1",
  muted: "#7C8AA0",
  dim: "#58667A",
  border: "rgba(61, 214, 245, 0.18)",
};

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(number);
}

function getInitials(name) {
  if (!name) return "IM";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function ProfileStat({ label, value, accent }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "18px 20px",
        minHeight: 90,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: COLORS.muted,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 9,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: accent || COLORS.text,
          lineHeight: 1.25,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: "14px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span
        style={{
          color: COLORS.muted,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: COLORS.text,
          fontSize: 14,
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {value || "Not specified"}
      </span>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div style={{ marginBottom: 22 }}>
      {eyebrow && (
        <div
          style={{
            color: COLORS.cyan,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      )}

      <h2
        style={{
          margin: 0,
          color: COLORS.text,
          fontSize: 22,
          fontWeight: 750,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            margin: "7px 0 0",
            color: COLORS.muted,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function Pill({ children, color }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 11px",
        borderRadius: 999,
        background: color
          ? color.replace(")", ", 0.10)").replace("rgb(", "rgba(")
          : "rgba(61,214,245,0.08)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: color || COLORS.light,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export default function InvestorProfile() {
  const navigate = useNavigate();

  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadInvestor() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/investors/me");

        if (mounted) {
          setInvestor(response.data);
        }
      } catch (err) {
        console.error("Failed to load investor profile:", err);

        if (mounted) {
          if (err && err.response && err.response.status === 404) {
            setError("NO_PROFILE");
          } else {
            setError("Unable to load your investor profile.");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInvestor();

    return () => {
      mounted = false;
    };
  }, []);

  const profileCompleteness = useMemo(() => {
    if (!investor) return 0;

    const fields = [
      investor.name,
      investor.location,
      investor.investor_type,
      investor.investment_thesis,
      investor.investment_criteria,
      investor.check_size,
      investor.preferred_stage,
      investor.geographic_focus,
      investor.sectors,
      investor.portfolio_highlights,
    ];

    const completed = fields.filter((field) => {
      if (Array.isArray(field)) {
        return field.length > 0;
      }

      return field !== null && field !== undefined && String(field).trim() !== "";
    }).length;

    return Math.round((completed / fields.length) * 100);
  }, [investor]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              margin: "0 auto 18px",
              borderRadius: "50%",
              border: "3px solid rgba(61,214,245,0.15)",
              borderTopColor: COLORS.cyan,
              animation: "investorProfileSpin 1s linear infinite",
            }}
          />

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: COLORS.cyan,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Loading investor profile...
          </div>
        </div>

        <style>
          {`
            @keyframes investorProfileSpin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (error === "NO_PROFILE") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily: "'Space Grotesk', sans-serif",
          padding: "32px 20px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <BackButton />

          <div
            style={{
              marginTop: 40,
              padding: 50,
              borderRadius: 24,
              background:
                "linear-gradient(145deg, rgba(17,28,47,0.98), rgba(9,17,31,0.98))",
              border: "1px solid rgba(61,214,245,0.16)",
              textAlign: "center",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,
                margin: "0 auto 22px",
                borderRadius: "22px",
                display: "grid",
                placeItems: "center",
                background: "rgba(61,214,245,0.08)",
                border: "1px solid rgba(61,214,245,0.18)",
                color: COLORS.cyan,
                fontSize: 30,
              }}
            >
              +
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 30,
                color: COLORS.text,
              }}
            >
              Complete your investor profile
            </h1>

            <p
              style={{
                maxWidth: 580,
                margin: "14px auto 28px",
                color: COLORS.muted,
                lineHeight: 1.7,
              }}
            >
              Create your investor profile so businesses can understand your
              investment focus and find relevant matchmaking opportunities.
            </p>

            <button
              onClick={() => navigate("/investor/create")}
              style={{
                border: 0,
                cursor: "pointer",
                padding: "13px 22px",
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #3DD6F5, #8B7CF6)",
                color: "#06101A",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 12px 30px rgba(61,214,245,0.18)",
              }}
            >
              Create Investor Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          color: COLORS.text,
          display: "grid",
          placeItems: "center",
          padding: 30,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 34,
            textAlign: "center",
            background: COLORS.panel,
            border: "1px solid rgba(255,100,124,0.2)",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              color: COLORS.red,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 12,
            }}
          >
            PROFILE ERROR
          </div>

          <h2 style={{ margin: 0, color: COLORS.text }}>
            {error || "Investor profile unavailable"}
          </h2>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 22,
              padding: "11px 18px",
              borderRadius: 10,
              border: "1px solid rgba(61,214,245,0.25)",
              background: "rgba(61,214,245,0.08)",
              color: COLORS.cyan,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const name =
    investor.name ||
    investor.investor_name ||
    investor.full_name ||
    "Investor";

  const investorType =
    investor.investor_type ||
    investor.type ||
    "Private Investor";

  const location = investor.location || "Location not specified";

  const profileViews =
    investor.profile_views !== undefined
      ? investor.profile_views
      : investor.views !== undefined
      ? investor.views
      : 0;

  const investmentThesis =
    investor.investment_thesis ||
    investor.thesis ||
    "No investment thesis has been added yet.";

  const investmentCriteria =
    investor.investment_criteria ||
    investor.criteria ||
    "No investment criteria have been added yet.";

  const checkSize =
    investor.check_size ||
    investor.investment_range ||
    investor.minimum_investment ||
    investor.max_investment ||
    "";

  const preferredStage =
    investor.preferred_stage ||
    investor.stage ||
    investor.investment_stage ||
    "";

  const geographicFocus =
    investor.geographic_focus ||
    investor.geography ||
    investor.preferred_location ||
    "";

  const investmentsMade =
    investor.investments_made !== undefined
      ? investor.investments_made
      : investor.number_of_investments !== undefined
      ? investor.number_of_investments
      : 0;

  const portfolioHighlights =
    investor.portfolio_highlights ||
    investor.portfolio ||
    investor.portfolio_description ||
    "";

  const investingStatus =
    investor.investing_status ||
    investor.status ||
    "Active";

  let sectors = investor.sectors || investor.preferred_sectors || [];

  if (typeof sectors === "string") {
    sectors = sectors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(sectors)) {
    sectors = [];
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Space Grotesk', sans-serif",
        paddingBottom: 70,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(rgba(61,214,245,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,245,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 80%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -220,
          right: -180,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(61,214,245,0.08)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 500,
          left: -250,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(139,124,246,0.07)",
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "28px 20px 0",
        }}
      >
        <BackButton />

        <section
          style={{
            marginTop: 25,
            borderRadius: 26,
            padding: "34px",
            background:
              "linear-gradient(145deg, rgba(17,28,47,0.98), rgba(9,17,31,0.98))",
            border: "1px solid rgba(61,214,245,0.17)",
            boxShadow:
              "0 30px 100px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.03)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #3DD6F5, #8B7CF6, transparent)",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 30,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 22,
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 92,
                  height: 92,
                  flexShrink: 0,
                  borderRadius: 24,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(61,214,245,0.17), rgba(139,124,246,0.17))",
                  border: "1px solid rgba(61,214,245,0.25)",
                  color: COLORS.cyanBright,
                  fontSize: 28,
                  fontWeight: 800,
                  boxShadow:
                    "0 0 35px rgba(61,214,245,0.09)",
                }}
              >
                {getInitials(name)}
              </div>

              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 9,
                    color: COLORS.cyan,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: COLORS.green,
                      boxShadow: "0 0 12px rgba(53,208,127,0.7)",
                    }}
                  />
                  Investor Profile
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(30px, 5vw, 46px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.04em",
                    color: COLORS.text,
                  }}
                >
                  {name}
                </h1>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <Pill color={COLORS.cyan}>{investorType}</Pill>

                  <Pill>{location}</Pill>

                  <Pill color={COLORS.green}>
                    {investingStatus}
                  </Pill>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate("/investor/edit")}
                style={{
                  border: "1px solid rgba(61,214,245,0.25)",
                  background: "rgba(61,214,245,0.07)",
                  color: COLORS.cyanBright,
                  borderRadius: 11,
                  padding: "11px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Edit Profile
              </button>

              <button
                onClick={() => navigate("/investor-matches")}
                style={{
                  border: 0,
                  background:
                    "linear-gradient(135deg, #3DD6F5, #8B7CF6)",
                  color: "#06101A",
                  borderRadius: 11,
                  padding: "11px 17px",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 13,
                  boxShadow: "0 10px 28px rgba(61,214,245,0.16)",
                }}
              >
                View Matches
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 34,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <ProfileStat
              label="Profile Views"
              value={profileViews}
              accent={COLORS.cyan}
            />

            <ProfileStat
              label="Investments Made"
              value={investmentsMade}
              accent={COLORS.violetBright}
            />

            <ProfileStat
              label="Investment Size"
              value={checkSize ? formatMoney(checkSize) : "Flexible"}
              accent={COLORS.gold}
            />

            <ProfileStat
              label="Profile Strength"
              value={profileCompleteness + "%"}
              accent={COLORS.green}
            />
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, 0.8fr)",
            gap: 20,
            marginTop: 20,
          }}
        >
          <main style={{ display: "grid", gap: 20 }}>
            <section
              style={{
                background: COLORS.panel,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 28,
              }}
            >
              <SectionTitle
                eyebrow="01 / Thesis"
                title="Investment Thesis"
                description="What drives your investment decisions."
              />

              <div
                style={{
                  borderRadius: 16,
                  padding: 22,
                  background:
                    "linear-gradient(135deg, rgba(61,214,245,0.055), rgba(139,124,246,0.055))",
                  border: "1px solid rgba(61,214,245,0.12)",
                  color: COLORS.light,
                  lineHeight: 1.85,
                  fontSize: 15,
                }}
              >
                {investmentThesis}
              </div>
            </section>

            <section
              style={{
                background: COLORS.panel,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 28,
              }}
            >
              <SectionTitle
                eyebrow="02 / Criteria"
                title="Investment Criteria"
                description="The opportunities you are looking for."
              />

              <div
                style={{
                  color: COLORS.light,
                  lineHeight: 1.85,
                  fontSize: 15,
                }}
              >
                {investmentCriteria}
              </div>
            </section>

            <section
              style={{
                background: COLORS.panel,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 28,
              }}
            >
              <SectionTitle
                eyebrow="03 / Focus"
                title="Investment Focus"
                description="Your preferred investment parameters."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <InfoRow
                  label="Check Size"
                  value={
                    checkSize
                      ? formatMoney(checkSize)
                      : "Not specified"
                  }
                />

                <InfoRow
                  label="Preferred Stage"
                  value={preferredStage}
                />

                <InfoRow
                  label="Geographic Focus"
                  value={geographicFocus}
                />

                <InfoRow
                  label="Investor Type"
                  value={investorType}
                />
              </div>

              <div style={{ marginTop: 25 }}>
                <div
                  style={{
                    color: COLORS.muted,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 12,
                  }}
                >
                  Preferred Sectors
                </div>

                {sectors.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 9,
                    }}
                  >
                    {sectors.map((sector, index) => (
                      <Pill
                        key={String(sector) + String(index)}
                        color={
                          index % 2 === 0
                            ? COLORS.cyan
                            : COLORS.violetBright
                        }
                      >
                        {sector}
                      </Pill>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      color: COLORS.dim,
                      fontSize: 14,
                    }}
                  >
                    No preferred sectors specified.
                  </div>
                )}
              </div>
            </section>

            <section
              style={{
                background: COLORS.panel,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 28,
              }}
            >
              <SectionTitle
                eyebrow="04 / Portfolio"
                title="Portfolio Highlights"
                description="Experience and notable investments."
              />

              <div
                style={{
                  minHeight: 100,
                  color: COLORS.light,
                  fontSize: 15,
                  lineHeight: 1.85,
                }}
              >
                {portfolioHighlights ||
                  "No portfolio highlights have been added yet."}
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 15,
                  padding: "15px 17px",
                  borderRadius: 14,
                  background: "rgba(53,208,127,0.055)",
                  border: "1px solid rgba(53,208,127,0.13)",
                }}
              >
                <div>
                  <div
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Investments made
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      color: COLORS.green,
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {investmentsMade}
                  </div>
                </div>

                <div
                  style={{
                    color: COLORS.green,
                    fontSize: 26,
                  }}
                >
                  ↗
                </div>
              </div>
            </section>
          </main>

          <aside style={{ display: "grid", gap: 20, alignContent: "start" }}>
            <section
              style={{
                background:
                  "linear-gradient(145deg, rgba(17,28,47,0.98), rgba(14,22,38,0.98))",
                border: "1px solid rgba(139,124,246,0.18)",
                borderRadius: 22,
                padding: 25,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -70,
                  right: -70,
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "rgba(139,124,246,0.09)",
                  filter: "blur(35px)",
                }}
              />

              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  style={{
                    color: COLORS.violetBright,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Profile Completeness
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "18px 0 24px",
                  }}
                >
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background:
                        "conic-gradient(#8B7CF6 " +
                        profileCompleteness +
                        "%, rgba(255,255,255,0.06) 0)",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                      boxShadow:
                        "0 0 40px rgba(139,124,246,0.12)",
                    }}
                  >
                    <div
                      style={{
                        width: 124,
                        height: 124,
                        borderRadius: "50%",
                        background: COLORS.panel,
                        display: "grid",
                        placeItems: "center",
                        border:
                          "1px solid rgba(139,124,246,0.14)",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 31,
                            fontWeight: 800,
                            color: COLORS.text,
                          }}
                        >
                          {profileCompleteness}%
                        </div>

                        <div
                          style={{
                            color: COLORS.muted,
                            fontSize: 10,
                            fontFamily:
                              "'JetBrains Mono', monospace",
                            textTransform: "uppercase",
                          }}
                        >
                          Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: COLORS.muted,
                    fontSize: 13,
                    lineHeight: 1.7,
                    textAlign: "center",
                  }}
                >
                  Keep your profile complete to improve the quality
                  of your matchmaking opportunities.
                </p>

                <button
                  onClick={() => navigate("/investor/edit")}
                  style={{
                    width: "100%",
                    marginTop: 20,
                    padding: "12px 15px",
                    borderRadius: 11,
                    border: "1px solid rgba(139,124,246,0.25)",
                    background: "rgba(139,124,246,0.08)",
                    color: COLORS.violetBright,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Improve Profile
                </button>
              </div>
            </section>

            <section
              style={{
                background: COLORS.panel,
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 22,
                padding: 25,
              }}
            >
              <SectionTitle
                eyebrow="Quick Actions"
                title="Investor Hub"
              />

              <div
                style={{
                  display: "grid",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => navigate("/investor-matches")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px 16px",
                    borderRadius: 13,
                    border: "1px solid rgba(61,214,245,0.13)",
                    background: "rgba(61,214,245,0.045)",
                    color: COLORS.text,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: COLORS.cyan }}>01</span>
                  <span style={{ marginLeft: 12 }}>
                    View Business Matches
                  </span>
                </button>

                <button
                  onClick={() => navigate("/portfolio")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px 16px",
                    borderRadius: 13,
                    border: "1px solid rgba(139,124,246,0.13)",
                    background: "rgba(139,124,246,0.045)",
                    color: COLORS.text,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: COLORS.violetBright }}>02</span>
                  <span style={{ marginLeft: 12 }}>
                    View Portfolio
                  </span>
                </button>

                <button
                  onClick={() => navigate("/watchlist")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px 16px",
                    borderRadius: 13,
                    border: "1px solid rgba(241,199,91,0.13)",
                    background: "rgba(241,199,91,0.045)",
                    color: COLORS.text,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: COLORS.gold }}>03</span>
                  <span style={{ marginLeft: 12 }}>
                    Open Watchlist
                  </span>
                </button>

                <button
                  onClick={() => navigate("/messages")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "15px 16px",
                    borderRadius: 13,
                    border: "1px solid rgba(53,208,127,0.13)",
                    background: "rgba(53,208,127,0.045)",
                    color: COLORS.text,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: COLORS.green }}>04</span>
                  <span style={{ marginLeft: 12 }}>
                    Open Messages
                  </span>
                </button>
              </div>
            </section>

            <section
              style={{
                padding: 24,
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, rgba(61,214,245,0.08), rgba(139,124,246,0.08))",
                border:
                  "1px solid rgba(61,214,245,0.13)",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: COLORS.cyan,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Investor Mtaani
              </div>

              <h3
                style={{
                  margin: 0,
                  color: COLORS.text,
                  fontSize: 19,
                }}
              >
                Find the right businesses.
              </h3>

              <p
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: "10px 0 18px",
                }}
              >
                Explore businesses that match your investment
                thesis and start meaningful matchmaking conversations.
              </p>

              <button
                onClick={() => navigate("/browse-businesses")}
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 11,
                  padding: "12px 15px",
                  background: COLORS.text,
                  color: COLORS.bg,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Browse Businesses
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}