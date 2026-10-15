import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";

const SECTORS = [
  "All sectors",
  "FinTech",
  "AgriTech",
  "HealthTech",
  "EdTech",
  "Clean Energy",
  "AI",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Logistics",
  "Other",
];

const STRUCTURES = ["All structures", "Debt", "Equity"];

const LOCATIONS = [
  "All locations",
  "Nairobi",
  "Kiambu",
  "Machakos",
  "Kajiado",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Uasin Gishu",
  "Other",
];

const FUNDING_RANGES = [
  { label: "Any amount", value: "all" },
  { label: "Under KES 1M", value: "under-1m" },
  { label: "KES 1M – 5M", value: "1m-5m" },
  { label: "KES 5M – 10M", value: "5m-10m" },
  { label: "Over KES 10M", value: "over-10m" },
];

function BrowseBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIndustry = searchParams.get("industry");

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState(selectedIndustry || "All sectors");
  const [location, setLocation] = useState("All locations");
  const [structure, setStructure] = useState("All structures");
  const [fundingRange, setFundingRange] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/businesses");

        console.log("Businesses API Response:", response.data);

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data?.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data?.businesses)) {
          data = response.data.businesses;
        }

        setBusinesses(data);
      } catch (err) {
        console.error("Error loading businesses:", err);
        setBusinesses([]);
        setError(
          "We could not load the current opportunities. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedIndustry) {
      // Sync a new URL filter into the editable filter control.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSector(selectedIndustry);
    }
  }, [selectedIndustry]);

  const getNumber = useCallback((value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    if (typeof value === "number") {
      return value;
    }

    return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  }, []);

  const formatKES = (value) => {
    const amount = getNumber(value);

    if (!amount) {
      return "Not disclosed";
    }

    if (amount >= 1000000000) {
      return `KES ${(amount / 1000000000).toFixed(1)}B`;
    }

    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
    }

    if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    }

    return `KES ${amount.toLocaleString()}`;
  };

  const getFundingAmount = useCallback((business) => {
    return getNumber(
      business.amount_seeking ??
        business.amount_requested ??
        business.funding_amount ??
        business.investment_amount
    );
  }, [getNumber]);

  const getRevenue = (business) => {
    return getNumber(
      business.annual_revenue ??
        business.yearly_revenue ??
        business.annual_turnover ??
        business.turnover
    );
  };

  const getStructure = (business) => {
    const value =
      business.investment_type ??
      business.funding_type ??
      business.investment_structure ??
      business.funding_structure ??
      "";

    const normalized = String(value).toLowerCase();

    if (normalized.includes("equity")) {
      return "Equity";
    }

    if (
      normalized.includes("debt") ||
      normalized.includes("loan") ||
      normalized.includes("credit")
    ) {
      return "Debt";
    }

    return "Not specified";
  };

  const isVerified = (business) => {
    const value =
      business.verified ??
      business.is_verified ??
      business.verification_status ??
      business.status;

    if (typeof value === "boolean") {
      return value;
    }

    const normalized = String(value || "").toLowerCase();

    return (
      normalized === "verified" ||
      normalized === "approved" ||
      normalized === "active" ||
      Boolean(business.verified_at || business.last_verified_at || business.verification_date)
    );
  };

  const getBusinessAge = (business) => {
    const year = getNumber(
      business.year_established ?? business.established_year
    );

    if (!year || year < 1900) {
      return null;
    }

    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    return age >= 0 ? age : null;
  };

  const matchesFundingRange = (amount, range) => {
    switch (range) {
      case "under-1m":
        return amount > 0 && amount < 1000000;

      case "1m-5m":
        return amount >= 1000000 && amount <= 5000000;

      case "5m-10m":
        return amount > 5000000 && amount <= 10000000;

      case "over-10m":
        return amount > 10000000;

      default:
        return true;
    }
  };

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const name = String(business.business_name || "").toLowerCase();
      const industry = String(business.industry || "").toLowerCase();
      const locationValue = String(business.location || "").toLowerCase();
      const description = String(business.description || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        industry.includes(query) ||
        locationValue.includes(query) ||
        description.includes(query);

      const matchesSector =
        sector === "All sectors" ||
        industry === String(sector).toLowerCase();

      const matchesLocation =
        location === "All locations" ||
        locationValue.includes(location.toLowerCase());

      const businessStructure = getStructure(business);

      const matchesStructure =
        structure === "All structures" ||
        businessStructure === structure;

      const fundingAmount = getFundingAmount(business);

      const matchesFunding = matchesFundingRange(
        fundingAmount,
        fundingRange
      );

      const matchesVerification =
        !verifiedOnly || isVerified(business);

      return (
        matchesSearch &&
        matchesSector &&
        matchesLocation &&
        matchesStructure &&
        matchesFunding &&
        matchesVerification
      );
    });
  }, [
    businesses,
    search,
    sector,
    location,
    structure,
    fundingRange,
    verifiedOnly,
    getFundingAmount,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSector("All sectors");
    setLocation("All locations");
    setStructure("All structures");
    setFundingRange("all");
    setVerifiedOnly(false);
    if (searchParams.has("industry")) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("industry");
        return next;
      }, { replace: true });
    }
  };

  const activeFilterCount = [
    sector !== "All sectors",
    location !== "All locations",
    structure !== "All structures",
    fundingRange !== "all",
    verifiedOnly,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <>
        <GlobalStyles />

        <div className="im-page">
          <div className="im-grid" />
          <div className="im-glow" />

          <div className="im-loading">
            <span className="im-dot" />
            Loading investment opportunities
            <span className="im-cursor">_</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />

      <div className="im-page">
        <div className="im-grid" />
        <div className="im-glow" />

        <div className="im-inner">
          <div className="im-topbar">
            <BackButton />

            <div className="im-status">
              <span className="im-dot" />
              MARKETPLACE ONLINE
            </div>
          </div>

          <section className="im-hero">
            <div className="im-eyebrow">
              INVESTOR MTAANI / OPPORTUNITIES
            </div>

            <div className="im-scanline" />

            <h1 className="im-title">
              Discover businesses
              <span> seeking capital.</span>
            </h1>

            <p className="im-subtitle">
              Explore established businesses across Kenya, review their
              funding requirements and business information, then decide
              which opportunities you want to explore further.
            </p>

            <div className="im-trust-note">
              <span className="im-trust-icon">✓</span>
              Verification supports informed discovery. It is not an
              investment recommendation.
            </div>
          </section>

          <section className="im-search-panel">
            <div className="im-search-wrap">
              <span className="im-search-icon">⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search businesses, sectors, locations..."
                className="im-search"
              />

              {search && (
                <button
                  type="button"
                  className="im-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </section>

          <section className="im-filter-panel">
            <div className="im-filter-header">
              <div>
                <span className="im-filter-label">FILTER OPPORTUNITIES</span>

                {activeFilterCount > 0 && (
                  <span className="im-filter-count">
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              {(activeFilterCount > 0 || search) && (
                <button
                  type="button"
                  className="im-reset"
                  onClick={clearFilters}
                >
                  Reset filters
                </button>
              )}
            </div>

            <div className="im-filters">
              <label className="im-field">
                <span>Sector</span>

                <select
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                >
                  {SECTORS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="im-field">
                <span>Location</span>

                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  {LOCATIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="im-field">
                <span>Structure</span>

                <select
                  value={structure}
                  onChange={(event) => setStructure(event.target.value)}
                >
                  {STRUCTURES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="im-field">
                <span>Funding requirement</span>

                <select
                  value={fundingRange}
                  onChange={(event) =>
                    setFundingRange(event.target.value)
                  }
                >
                  {FUNDING_RANGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className={`im-verified-toggle ${
                  verifiedOnly ? "active" : ""
                }`}
                onClick={() => setVerifiedOnly((value) => !value)}
              >
                <span className="im-check">
                  {verifiedOnly ? "✓" : ""}
                </span>

                <span>
                  <strong>Verified only</strong>
                  <small>Show reviewed businesses</small>
                </span>
              </button>
            </div>
          </section>

          <section className="im-results-header">
            <div>
              <span className="im-results-number">
                {filteredBusinesses.length}
              </span>

              <span className="im-results-label">
                {filteredBusinesses.length === 1
                  ? " opportunity"
                  : " opportunities"}{" "}
                available
              </span>
            </div>

            {selectedIndustry && sector === selectedIndustry && (
              <div className="im-url-filter">
                Sector:
                <strong>{selectedIndustry}</strong>
              </div>
            )}
          </section>

          {error ? (
            <div className="im-message">
              <div className="im-message-icon">!</div>

              <h2>Marketplace unavailable</h2>

              <p>{error}</p>

              <button
                type="button"
                className="im-primary-btn"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="im-message">
              <div className="im-message-icon">⌕</div>

              <h2>No matching opportunities</h2>

              <p>
                {businesses.length === 0
                  ? "There are no published business opportunities available yet."
                  : "Try adjusting your search or filters to see more businesses."}
              </p>

              {businesses.length > 0 && (
                <button
                  type="button"
                  className="im-primary-btn"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="im-cards">
              {filteredBusinesses.map((business) => {
                const verified = isVerified(business);
                const fundingAmount = getFundingAmount(business);
                const revenue = getRevenue(business);
                const businessAge = getBusinessAge(business);
                const businessStructure = getStructure(business);

                return (
                  <article
                    key={business.id}
                    className="im-card"
                  >
                    <span className="im-corner im-corner-tl" />
                    <span className="im-corner im-corner-tr" />
                    <span className="im-corner im-corner-bl" />
                    <span className="im-corner im-corner-br" />

                    <div className="im-card-top">
                      <div className="im-sector">
                        {business.industry || "Business"}
                      </div>

                      {verified && (
                        <div className="im-verified">
                          <span>✓</span>
                          VERIFIED
                        </div>
                      )}
                    </div>

                    <h2 className="im-card-title">
                      {business.business_name ||
                        "Unnamed business"}
                    </h2>

                    <div className="im-location">
                      <span>⌖</span>
                      {business.location ||
                        "Location not disclosed"}
                    </div>

                    <p className="im-description">
                      {business.description ||
                        "Business information is available inside this opportunity profile."}
                    </p>

                    <div className="im-opportunity-grid">
                      <div className="im-opportunity">
                        <span className="im-opportunity-label">
                          SEEKING
                        </span>

                        <strong>
                          {fundingAmount
                            ? formatKES(fundingAmount)
                            : "Not disclosed"}
                        </strong>
                      </div>

                      <div className="im-opportunity">
                        <span className="im-opportunity-label">
                          STRUCTURE
                        </span>

                        <strong>{businessStructure}</strong>
                      </div>

                      <div className="im-opportunity">
                        <span className="im-opportunity-label">
                          TURNOVER
                        </span>

                        <strong>
                          {revenue
                            ? formatKES(revenue)
                            : "Not disclosed"}
                        </strong>
                      </div>

                      <div className="im-opportunity">
                        <span className="im-opportunity-label">
                          OPERATING HISTORY
                        </span>

                        <strong>
                          {businessAge !== null
                            ? `${businessAge} ${
                                businessAge === 1
                                  ? "year"
                                  : "years"
                              }`
                            : "Not disclosed"}
                        </strong>
                      </div>
                    </div>

                    <div className="im-use">
                      <span>USE OF FUNDS</span>

                      <p>
                        {business.funding_reason ||
                          business.use_of_funds ||
                          business.funding_purpose ||
                          "Funding purpose available in the opportunity profile."}
                      </p>
                    </div>

                    <div className="im-card-footer">
                      <div className="im-card-code">
                        OPPORTUNITY
                        <strong>
                          #
                          {String(
                            business.id ?? "000"
                          ).padStart(4, "0")}
                        </strong>
                      </div>

                      <Link
                        to={`/business/${business.id}`}
                        className="im-view-btn"
                      >
                        View opportunity
                        <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="im-disclosure">
            <span>INVESTOR MTAANI / INFORMATION NOTICE</span>

            <p>
              Information shown on this marketplace is provided for
              opportunity discovery and is subject to verification.
              Investments carry risk, including possible loss of
              capital. Investor Mtaani does not guarantee investment
              performance, repayment, profitability or future
              success. Investors should conduct their own due
              diligence and obtain independent professional advice
              where appropriate.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .im-page {
        --void: #060911;
        --panel: #0e1626;
        --panel-2: #111c2f;
        --panel-border: rgba(61, 214, 245, 0.16);
        --panel-border-strong: rgba(61, 214, 245, 0.32);
        --cyan: #3dd6f5;
        --violet: #8b7cf6;
        --green: #35d07f;
        --gold: #f1c75b;
        --text: #e7edf5;
        --muted: #7c8aa0;
        --muted-light: #aeb9c9;

        position: relative;
        min-height: 100vh;
        overflow: hidden;
        background: var(--void);
        color: var(--text);
        font-family: 'Space Grotesk', sans-serif;
        padding: 42px 32px 80px;
      }

      .im-page *,
      .im-page *::before,
      .im-page *::after {
        box-sizing: border-box;
      }

      .im-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(61, 214, 245, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(61, 214, 245, 0.045) 1px, transparent 1px);
        background-size: 48px 48px;
        -webkit-mask-image: radial-gradient(
          circle at 50% 0%,
          black,
          transparent 78%
        );
        mask-image: radial-gradient(
          circle at 50% 0%,
          black,
          transparent 78%
        );
        pointer-events: none;
      }

      .im-glow {
        position: absolute;
        top: -260px;
        left: 50%;
        transform: translateX(-50%);
        width: 1000px;
        height: 600px;
        background: radial-gradient(
          circle,
          rgba(61, 214, 245, 0.12),
          transparent 68%
        );
        pointer-events: none;
      }

      .im-inner {
        position: relative;
        max-width: 1220px;
        margin: 0 auto;
      }

      .im-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 48px;
      }

      .im-status {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.08em;
        color: var(--muted);
        display: flex;
        align-items: center;
      }

      .im-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--green);
        display: inline-block;
        margin-right: 9px;
        box-shadow: 0 0 12px rgba(53, 208, 127, 0.6);
        animation: im-pulse 2s infinite;
      }

      @keyframes im-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 0 rgba(53, 208, 127, 0.4);
        }

        50% {
          box-shadow: 0 0 0 5px rgba(53, 208, 127, 0);
        }
      }

      .im-hero {
        position: relative;
        max-width: 820px;
        overflow: hidden;
        padding-top: 4px;
        margin-bottom: 34px;
      }

      .im-eyebrow {
        font-family: 'JetBrains Mono', monospace;
        color: var(--cyan);
        font-size: 10px;
        letter-spacing: 0.18em;
        margin-bottom: 18px;
      }

      .im-scanline {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(
          90deg,
          var(--cyan),
          rgba(61, 214, 245, 0.15),
          transparent
        );
        animation: im-scan 1.6s ease-out 1 forwards;
      }

      @keyframes im-scan {
        0% {
          transform: translateY(0);
          opacity: 0;
        }

        12% {
          opacity: 0.9;
        }

        100% {
          transform: translateY(180px);
          opacity: 0;
        }
      }

      .im-title {
        font-weight: 700;
        font-size: clamp(36px, 6vw, 64px);
        line-height: 0.98;
        letter-spacing: -0.045em;
        margin: 0 0 20px;
      }

      .im-title span {
        color: var(--cyan);
      }

      .im-subtitle {
        max-width: 730px;
        color: var(--muted-light);
        font-size: 16px;
        line-height: 1.7;
        margin: 0 0 20px;
      }

      .im-trust-note {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-family: 'JetBrains Mono', monospace;
        color: var(--muted);
        font-size: 10px;
        line-height: 1.5;
        letter-spacing: 0.02em;
      }

      .im-trust-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 17px;
        height: 17px;
        border: 1px solid rgba(53, 208, 127, 0.4);
        color: var(--green);
        font-size: 10px;
        border-radius: 50%;
      }

      .im-search-panel,
      .im-filter-panel {
        background: rgba(14, 22, 38, 0.78);
        border: 1px solid var(--panel-border);
        border-radius: 5px;
        backdrop-filter: blur(10px);
      }

      .im-search-panel {
        padding: 12px;
        margin-bottom: 12px;
      }

      .im-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .im-search-icon {
        position: absolute;
        left: 18px;
        color: var(--cyan);
        font-size: 22px;
        line-height: 1;
        pointer-events: none;
      }

      .im-search {
        width: 100%;
        height: 56px;
        padding: 0 52px;
        background: #09111e;
        border: 1px solid rgba(61, 214, 245, 0.12);
        color: var(--text);
        border-radius: 3px;
        outline: none;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 15px;
        transition: border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .im-search::placeholder {
        color: #536175;
      }

      .im-search:focus {
        border-color: rgba(61, 214, 245, 0.45);
        box-shadow: 0 0 0 3px rgba(61, 214, 245, 0.06);
      }

      .im-search-clear {
        position: absolute;
        right: 16px;
        border: 0;
        background: transparent;
        color: var(--muted);
        font-size: 22px;
        cursor: pointer;
      }

      .im-search-clear:hover {
        color: var(--cyan);
      }

      .im-filter-panel {
        padding: 20px;
        margin-bottom: 36px;
      }

      .im-filter-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 17px;
      }

      .im-filter-header > div {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .im-filter-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.14em;
        color: var(--muted);
      }

      .im-filter-count {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        color: var(--violet);
        border: 1px solid rgba(139, 124, 246, 0.3);
        background: rgba(139, 124, 246, 0.08);
        padding: 4px 7px;
        border-radius: 2px;
      }

      .im-reset {
        border: 0;
        background: transparent;
        color: var(--cyan);
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        cursor: pointer;
        padding: 4px;
      }

      .im-reset:hover {
        text-decoration: underline;
      }

      .im-filters {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(150px, 1fr))
          minmax(180px, 1.15fr);
        gap: 12px;
      }

      .im-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .im-field > span {
        font-family: 'JetBrains Mono', monospace;
        color: var(--muted);
        font-size: 9px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .im-field select {
        width: 100%;
        height: 44px;
        border: 1px solid rgba(61, 214, 245, 0.13);
        border-radius: 3px;
        background: #09111e;
        color: var(--text);
        padding: 0 12px;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }

      .im-field select:focus {
        border-color: rgba(61, 214, 245, 0.4);
      }

      .im-field option {
        background: #0e1626;
        color: var(--text);
      }

      .im-verified-toggle {
        min-height: 44px;
        margin-top: 16px;
        border: 1px solid rgba(53, 208, 127, 0.17);
        border-radius: 3px;
        background: rgba(53, 208, 127, 0.035);
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 10px;
        text-align: left;
        padding: 8px 11px;
        cursor: pointer;
        transition: border-color 0.2s ease,
          background 0.2s ease;
      }

      .im-verified-toggle:hover,
      .im-verified-toggle.active {
        border-color: rgba(53, 208, 127, 0.42);
        background: rgba(53, 208, 127, 0.08);
      }

      .im-check {
        width: 20px;
        height: 20px;
        border: 1px solid rgba(53, 208, 127, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--green);
        font-size: 12px;
      }

      .im-verified-toggle strong,
      .im-verified-toggle small {
        display: block;
      }

      .im-verified-toggle strong {
        font-size: 11px;
        font-weight: 600;
      }

      .im-verified-toggle small {
        color: var(--muted);
        font-size: 9px;
        margin-top: 2px;
      }

      .im-results-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }

      .im-results-number {
        font-family: 'JetBrains Mono', monospace;
        font-size: 22px;
        font-weight: 700;
        color: var(--cyan);
      }

      .im-results-label {
        color: var(--muted);
        font-size: 13px;
        margin-left: 8px;
      }

      .im-url-filter {
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
      }

      .im-url-filter strong {
        color: var(--violet);
        margin-left: 5px;
      }

      .im-cards {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }

      .im-card {
        position: relative;
        min-width: 0;
        background: linear-gradient(
          145deg,
          rgba(17, 28, 47, 0.98),
          rgba(14, 22, 38, 0.98)
        );
        border: 1px solid var(--panel-border);
        border-radius: 4px;
        padding: 24px;
        transition:
          border-color 0.25s ease,
          box-shadow 0.25s ease,
          transform 0.25s ease;
      }

      .im-card:hover {
        border-color: rgba(61, 214, 245, 0.46);
        box-shadow:
          0 0 0 1px rgba(61, 214, 245, 0.1),
          0 18px 45px rgba(0, 0, 0, 0.28),
          0 0 28px rgba(61, 214, 245, 0.07);
        transform: translateY(-2px);
      }

      .im-corner {
        position: absolute;
        width: 12px;
        height: 12px;
        border-color: var(--cyan);
        opacity: 0.5;
      }

      .im-corner-tl {
        top: -1px;
        left: -1px;
        border-top: 2px solid;
        border-left: 2px solid;
      }

      .im-corner-tr {
        top: -1px;
        right: -1px;
        border-top: 2px solid;
        border-right: 2px solid;
      }

      .im-corner-bl {
        bottom: -1px;
        left: -1px;
        border-bottom: 2px solid;
        border-left: 2px solid;
      }

      .im-corner-br {
        bottom: -1px;
        right: -1px;
        border-bottom: 2px solid;
        border-right: 2px solid;
      }

      .im-card-top {
        min-height: 27px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }

      .im-sector {
        font-family: 'JetBrains Mono', monospace;
        color: var(--violet);
        font-size: 9px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        background: rgba(139, 124, 246, 0.09);
        border: 1px solid rgba(139, 124, 246, 0.2);
        padding: 5px 8px;
        border-radius: 2px;
      }

      .im-verified {
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--green);
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        letter-spacing: 0.08em;
        white-space: nowrap;
      }

      .im-verified span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 15px;
        height: 15px;
        border: 1px solid rgba(53, 208, 127, 0.45);
        border-radius: 50%;
        font-size: 9px;
      }

      .im-card-title {
        font-weight: 600;
        font-size: 22px;
        line-height: 1.15;
        margin: 0 0 8px;
        letter-spacing: -0.02em;
      }

      .im-location {
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        margin-bottom: 16px;
      }

      .im-location span {
        color: var(--cyan);
      }

      .im-description {
        color: var(--muted-light);
        font-size: 12.5px;
        line-height: 1.65;
        margin: 0 0 18px;
        min-height: 41px;
      }

      .im-opportunity-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        border-top: 1px solid var(--panel-border);
        border-bottom: 1px solid var(--panel-border);
        margin-bottom: 16px;
      }

      .im-opportunity {
        min-width: 0;
        padding: 13px 12px;
        border-bottom: 1px solid rgba(61, 214, 245, 0.07);
      }

      .im-opportunity:nth-child(odd) {
        border-right: 1px solid rgba(61, 214, 245, 0.07);
      }

      .im-opportunity:nth-child(3),
      .im-opportunity:nth-child(4) {
        border-bottom: 0;
      }

      .im-opportunity-label {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        color: var(--muted);
        font-size: 8px;
        letter-spacing: 0.1em;
        margin-bottom: 5px;
      }

      .im-opportunity strong {
        display: block;
        color: var(--text);
        font-size: 12px;
        font-weight: 600;
        overflow-wrap: anywhere;
      }

      .im-opportunity:first-child strong {
        color: var(--cyan);
      }

      .im-use {
        padding: 13px 14px;
        background: rgba(6, 9, 17, 0.45);
        border-left: 2px solid rgba(241, 199, 91, 0.45);
        margin-bottom: 18px;
      }

      .im-use > span {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        color: var(--gold);
        font-size: 8px;
        letter-spacing: 0.1em;
        margin-bottom: 6px;
      }

      .im-use p {
        color: var(--muted-light);
        font-size: 11px;
        line-height: 1.5;
        margin: 0;
      }

      .im-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
      }

      .im-card-code {
        color: #536175;
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        letter-spacing: 0.08em;
        line-height: 1.5;
      }

      .im-card-code strong {
        display: block;
        color: #718097;
        font-size: 9px;
        font-weight: 500;
      }

      .im-view-btn,
      .im-primary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 40px;
        padding: 0 15px;
        border: 1px solid rgba(61, 214, 245, 0.38);
        border-radius: 3px;
        background: rgba(61, 214, 245, 0.05);
        color: var(--cyan);
        text-decoration: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        cursor: pointer;
        transition:
          background 0.2s ease,
          color 0.2s ease,
          border-color 0.2s ease;
      }

      .im-view-btn:hover,
      .im-primary-btn:hover {
        background: var(--cyan);
        border-color: var(--cyan);
        color: #06111a;
      }

      .im-view-btn span {
        font-size: 15px;
        transition: transform 0.2s ease;
      }

      .im-view-btn:hover span {
        transform: translateX(3px);
      }

      .im-message {
        max-width: 600px;
        margin: 30px auto 60px;
        padding: 45px 35px;
        background: rgba(14, 22, 38, 0.85);
        border: 1px solid var(--panel-border);
        border-radius: 4px;
        text-align: center;
      }

      .im-message-icon {
        width: 44px;
        height: 44px;
        margin: 0 auto 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(61, 214, 245, 0.3);
        color: var(--cyan);
        font-family: 'JetBrains Mono', monospace;
        border-radius: 50%;
      }

      .im-message h2 {
        font-size: 21px;
        margin: 0 0 10px;
      }

      .im-message p {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
        margin: 0 auto 22px;
        max-width: 460px;
      }

      .im-disclosure {
        margin-top: 46px;
        padding-top: 22px;
        border-top: 1px solid rgba(61, 214, 245, 0.09);
      }

      .im-disclosure > span {
        display: block;
        color: #536175;
        font-family: 'JetBrains Mono', monospace;
        font-size: 8px;
        letter-spacing: 0.12em;
        margin-bottom: 9px;
      }

      .im-disclosure p {
        max-width: 900px;
        color: #59677b;
        font-size: 10px;
        line-height: 1.7;
        margin: 0;
      }

      .im-loading {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'JetBrains Mono', monospace;
        color: var(--muted);
        font-size: 13px;
      }

      .im-cursor {
        color: var(--cyan);
        margin-left: 3px;
        animation: im-blink 1s step-end infinite;
      }

      @keyframes im-blink {
        0%,
        49% {
          opacity: 1;
        }

        50%,
        100% {
          opacity: 0;
        }
      }

      @media (max-width: 1050px) {
        .im-filters {
          grid-template-columns: repeat(2, 1fr);
        }

        .im-verified-toggle {
          margin-top: 16px;
        }
      }

      @media (max-width: 780px) {
        .im-page {
          padding: 28px 18px 60px;
        }

        .im-topbar {
          margin-bottom: 38px;
        }

        .im-title {
          font-size: clamp(35px, 11vw, 54px);
        }

        .im-cards {
          grid-template-columns: 1fr;
        }

        .im-results-header {
          align-items: flex-start;
          flex-direction: column;
          gap: 8px;
        }
      }

      @media (max-width: 560px) {
        .im-filters {
          grid-template-columns: 1fr;
        }

        .im-filter-panel {
          padding: 15px;
        }

        .im-filter-header {
          align-items: flex-start;
        }

        .im-filter-header > div {
          flex-wrap: wrap;
        }

        .im-search {
          height: 52px;
          font-size: 13px;
        }

        .im-card {
          padding: 20px 17px;
        }

        .im-card-top {
          align-items: flex-start;
        }

        .im-verified {
          font-size: 7px;
        }

        .im-opportunity-grid {
          grid-template-columns: 1fr 1fr;
        }

        .im-card-footer {
          align-items: flex-start;
          flex-direction: column;
        }

        .im-view-btn {
          width: 100%;
        }

        .im-message {
          padding: 35px 22px;
        }
      }
    `}</style>
  );
}

export default BrowseBusinesses;
