import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import BackButton from "../components/BackButton";
import useSavedBusinesses from "../hooks/useSavedBusinesses";

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

const FOLLOWED_STORAGE_PREFIX = "investor-mtaani:followed-businesses:v1:";
const FOLLOWED_UPDATES_PREFIX = "investor-mtaani:followed-updates:v1:";
const FOLLOWED_UPDATES_SEEN_PREFIX = "investor-mtaani:followed-updates-seen:v1:";

function readFollowedIds(storageKey) {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function readStoredJson(storageKey, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
}

function BrowseBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityPostsLoaded, setCommunityPostsLoaded] = useState(false);
  const [investorSuggestions, setInvestorSuggestions] = useState([]);
  const [investorMatchStatus, setInvestorMatchStatus] = useState("idle");
  const [investorMatchMessage, setInvestorMatchMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState({ businessId: null, message: "" });
  const [shareOpenFor, setShareOpenFor] = useState(null);
  const [followFeedback, setFollowFeedback] = useState("");
  const [followPendingId, setFollowPendingId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewer] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const followStorageKey = `${FOLLOWED_STORAGE_PREFIX}${viewer?.id ?? viewer?.user_id ?? "guest"}`;
  const [followedIds, setFollowedIds] = useState(() => readFollowedIds(followStorageKey));
  const updatesStorageKey = `${FOLLOWED_UPDATES_PREFIX}${viewer?.id ?? viewer?.user_id ?? "guest"}`;
  const updatesSeenStorageKey = `${FOLLOWED_UPDATES_SEEN_PREFIX}${viewer?.id ?? viewer?.user_id ?? "guest"}`;
  const [followedUpdates, setFollowedUpdates] = useState(() => {
    const saved = readStoredJson(updatesStorageKey, []);
    return Array.isArray(saved) ? saved : [];
  });
  const [showFollowing, setShowFollowing] = useState(false);
  useEffect(() => {
    if (viewer?.role !== "investor") return undefined;
    let active = true;
    api.get("/businesses/following")
      .then(({ data }) => {
        if (!active) return;
        const ids = Array.isArray(data?.data) ? data.data.map(String) : [];
        setFollowedIds(ids);
        try { window.localStorage.setItem(followStorageKey, JSON.stringify(ids)); } catch { /* State remains available for this visit. */ }
      })
      .catch(() => {
        if (active) setFollowFeedback("Follow status could not be refreshed. Try again shortly.");
      });
    return () => { active = false; };
  }, [viewer?.role, followStorageKey]);
  useEffect(() => {
    const syncFromStorage = (event) => {
      if (event.key === followStorageKey) setFollowedIds(readFollowedIds(followStorageKey));
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [followStorageKey]);
  const followedIdSet = useMemo(() => new Set(followedIds), [followedIds]);
  const isFollowed = useCallback((businessId) => followedIdSet.has(String(businessId)), [followedIdSet]);
  const toggleFollowed = useCallback(async (businessId) => {
    if (viewer?.role !== "investor") {
      setFollowFeedback("Sign in with an investor account to follow businesses and receive activity notifications.");
      return;
    }
    const normalizedId = String(businessId);
    const wasFollowing = followedIdSet.has(normalizedId);
    setFollowFeedback("");
    setFollowPendingId(normalizedId);
    try {
      await (wasFollowing
        ? api.delete(`/businesses/${encodeURIComponent(normalizedId)}/follow`)
        : api.post(`/businesses/${encodeURIComponent(normalizedId)}/follow`));
      setFollowedIds((current) => {
        const next = wasFollowing
          ? current.filter((id) => id !== normalizedId)
          : [normalizedId, ...current];
        try { window.localStorage.setItem(followStorageKey, JSON.stringify(next)); } catch { /* Keep follow state available for this visit. */ }
        return next;
      });
      if (!wasFollowing) {
        window.dispatchEvent(new Event("investor-mtaani:notifications-changed"));
      }
    } catch (error) {
      setFollowFeedback(error.response?.data?.message || "We couldn’t update this follow. Please try again.");
    } finally {
      setFollowPendingId(null);
    }
  }, [followStorageKey, followedIdSet, viewer]);
  const selectedIndustry = searchParams.get("industry");
  const readFilters = (params) => ({
    search: params.get("q") || "",
    sector: SECTORS.includes(params.get("industry")) ? params.get("industry") : "All sectors",
    location: LOCATIONS.includes(params.get("location")) ? params.get("location") : "All locations",
    structure: STRUCTURES.includes(params.get("structure")) ? params.get("structure") : "All structures",
    stage: params.get("stage") || "All stages",
    fundingRange: FUNDING_RANGES.some(({ value }) => value === params.get("amount")) ? params.get("amount") : "all",
    verifiedOnly: params.get("verified") === "1",
  });
  const [initialFilters] = useState(() => readFilters(searchParams));
  const [search, setSearch] = useState(initialFilters.search);
  const [sector, setSector] = useState(initialFilters.sector);
  const [location, setLocation] = useState(initialFilters.location);
  const [structure, setStructure] = useState(initialFilters.structure);
  const [stage, setStage] = useState(initialFilters.stage);
  const [fundingRange, setFundingRange] = useState(initialFilters.fundingRange);
  const [verifiedOnly, setVerifiedOnly] = useState(initialFilters.verifiedOnly);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [comparisonMessage, setComparisonMessage] = useState("");
  const { toggleSaved, isSaved } = useSavedBusinesses();
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/businesses");

        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data?.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data?.businesses)) {
          data = response.data.businesses;
        }

        setBusinesses(data);
      } catch {
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
    let active = true;
    api.get("/community/posts")
      .then((response) => {
        if (active) {
          setCommunityPosts(Array.isArray(response.data?.data) ? response.data.data : []);
          setCommunityPostsLoaded(true);
        }
      })
      .catch(() => { if (active) { setCommunityPosts([]); setCommunityPostsLoaded(true); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!communityPostsLoaded) return;
    const seenByBusiness = readStoredJson(updatesSeenStorageKey, {});
    const updates = readStoredJson(updatesStorageKey, []);
    const nextUpdates = Array.isArray(updates) ? [...updates] : [];
    const followed = new Set(followedIds.map(String));
    const postsByBusiness = new Map();
    [...communityPosts]
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
      .forEach((post) => {
        const id = String(post.business_id ?? "");
        if (id && followed.has(id)) {
          if (!postsByBusiness.has(id)) postsByBusiness.set(id, []);
          postsByBusiness.get(id).push(post);
        }
      });

    const nextSeen = {};
    postsByBusiness.forEach((posts, businessId) => {
      const latest = posts[posts.length - 1];
      const lastSeenId = seenByBusiness[businessId];
      if (!lastSeenId) {
        nextSeen[businessId] = String(latest.id);
        return;
      }
      const previousIndex = posts.findIndex((post) => String(post.id) === String(lastSeenId));
      const freshPosts = previousIndex >= 0 ? posts.slice(previousIndex + 1) : [latest];
      freshPosts.forEach((post) => {
        if (nextUpdates.some((item) => String(item.postId) === String(post.id))) return;
        const business = businesses.find((item) => String(item.id) === businessId);
        nextUpdates.unshift({
          postId: String(post.id),
          businessId,
          businessName: business?.name || business?.business_name || post.business_name || "A business you follow",
          text: post.content || post.body || post.message || post.text || "Shared a new business update.",
          createdAt: post.created_at || null,
        });
      });
      nextSeen[businessId] = String(latest.id);
    });

    try {
      window.localStorage.setItem(updatesStorageKey, JSON.stringify(nextUpdates.slice(0, 30)));
      window.localStorage.setItem(updatesSeenStorageKey, JSON.stringify(nextSeen));
    } catch { /* Keep update notices available for this visit. */ }
    const timer = window.setTimeout(() => setFollowedUpdates(nextUpdates.slice(0, 30)), 0);
    return () => window.clearTimeout(timer);
  }, [businesses, communityPosts, communityPostsLoaded, followedIds, updatesSeenStorageKey, updatesStorageKey]);

  const dismissFollowedUpdate = useCallback((postId) => {
    setFollowedUpdates((current) => {
      const next = current.filter((update) => String(update.postId) !== String(postId));
      try { window.localStorage.setItem(updatesStorageKey, JSON.stringify(next)); } catch { /* Keep the current view responsive. */ }
      return next;
    });
  }, [updatesStorageKey]);

  const clearFollowedUpdates = useCallback(() => {
    setFollowedUpdates([]);
    try { window.localStorage.setItem(updatesStorageKey, "[]"); } catch { /* Keep the current view responsive. */ }
  }, [updatesStorageKey]);

  useEffect(() => {
    if (viewer?.role !== "investor" || !window.localStorage.getItem("token")) return undefined;
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setInvestorMatchStatus("loading");
    }, 0);
    api.get("/matchmaking/suggestions")
      .then((response) => {
        if (!active) return;
        setInvestorSuggestions(Array.isArray(response.data?.data) ? response.data.data : []);
        setInvestorMatchStatus("ready");
        setInvestorMatchMessage("");
      })
      .catch((matchError) => {
        if (!active) return;
        setInvestorSuggestions([]);
        setInvestorMatchStatus("unavailable");
        if (matchError.response?.status === 404) {
          setInvestorMatchMessage("Create an investor profile to see personalized profile-overlap notes.");
        } else if (matchError.response?.status === 403) {
          setInvestorMatchMessage("Personalized profile-overlap notes require an approved investor profile. You can continue browsing public opportunities.");
        } else {
          setInvestorMatchMessage("Personalized profile-overlap notes are temporarily unavailable.");
        }
      });
    return () => { active = false; window.clearTimeout(loadingTimer); };
  }, [viewer]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const values = { q: search.trim(), industry: sector === "All sectors" ? "" : sector, location: location === "All locations" ? "" : location, structure: structure === "All structures" ? "" : structure, stage: stage === "All stages" ? "" : stage, amount: fundingRange === "all" ? "" : fundingRange, verified: verifiedOnly ? "1" : "" };
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [search, sector, location, structure, stage, fundingRange, verifiedOnly, searchParams, setSearchParams]);

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
      const businessStage = String(business.business_stage || business.stage || "").trim();

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

      const matchesStage = stage === "All stages" || businessStage.toLowerCase() === stage.toLowerCase();

      const fundingAmount = getFundingAmount(business);

      const matchesFunding = matchesFundingRange(
        fundingAmount,
        fundingRange
      );

      const matchesVerification =
        !verifiedOnly || isVerified(business);
      const matchesFollowing = !showFollowing || isFollowed(business.id);

      return (
        matchesSearch &&
        matchesSector &&
        matchesLocation &&
        matchesStructure &&
        matchesStage &&
        matchesFunding &&
        matchesVerification &&
        matchesFollowing
      );
    });
  }, [
    businesses,
    search,
    sector,
    location,
    structure,
    stage,
    fundingRange,
    verifiedOnly,
    showFollowing,
    isFollowed,
    getFundingAmount,
  ]);

  const latestPostByBusiness = useMemo(() => {
    const latest = new Map();
    [...communityPosts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach((post) => {
        const id = String(post.business_id);
        if (!latest.has(id)) latest.set(id, post);
      });
    return latest;
  }, [communityPosts]);

  const investorSuggestionsByBusiness = useMemo(() => new Map(
    investorSuggestions.map((suggestion) => [String(suggestion.id), suggestion])
  ), [investorSuggestions]);

  const togglePostLike = async (post) => {
    const wasLiked = Boolean(post.viewer_liked);
    setCommunityPosts((current) => current.map((item) => item.id === post.id
      ? { ...item, viewer_liked: !wasLiked, likes_count: Math.max(0, item.likes_count + (wasLiked ? -1 : 1)) }
      : item));
    try {
      if (wasLiked) await api.delete(`/community/posts/${post.id}/likes`);
      else await api.post(`/community/posts/${post.id}/likes`);
    } catch (likeError) {
      setCommunityPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, viewer_liked: wasLiked, likes_count: Math.max(0, item.likes_count + (wasLiked ? 1 : -1)) }
        : item));
      setError(likeError.response?.data?.message || "Your reaction couldn’t be saved. Please try again.");
    }
  };

  const shareOpportunity = async (business) => {
    const url = `${window.location.origin}/business/${business.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: business.business_name, text: business.description || `Explore ${business.business_name} on Investor Mtaani.`, url });
        setShareStatus({ businessId: String(business.id), message: "Opportunity shared" });
      } else {
        setShareStatus({ businessId: String(business.id), message: "Choose a sharing option below." });
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") setShareStatus({ businessId: String(business.id), message: "Could not share this opportunity" });
    }
    window.setTimeout(() => setShareStatus({ businessId: null, message: "" }), 3000);
  };

  const copyOpportunityLink = async (business) => {
    const url = `${window.location.origin}/business/${business.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus({ businessId: String(business.id), message: "Opportunity link copied" });
    } catch {
      setShareStatus({ businessId: String(business.id), message: "Copy this opportunity’s link from your browser address bar" });
    }
    window.setTimeout(() => setShareStatus({ businessId: null, message: "" }), 3000);
  };

  const clearFilters = () => {
    setSearch("");
    setSector("All sectors");
    setLocation("All locations");
    setStructure("All structures");
    setStage("All stages");
    setFundingRange("all");
    setVerifiedOnly(false);
    setShowFollowing(false);
  };

  const toggleCompare = (business) => {
    const id = String(business.id);
    if (compareIds.includes(id)) {
      setCompareIds((current) => current.filter((item) => item !== id));
      setComparisonMessage("");
      return;
    }
    if (compareIds.length >= 3) {
      setComparisonMessage("Compare up to three opportunities at a time. Remove one to add another.");
      return;
    }
    setCompareIds((current) => [...current, id]);
    setComparisonMessage("");
  };

  const copySearchLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("Search link copied");
    } catch {
      setCopyMessage("Copy this page link from your browser address bar");
    }
    window.setTimeout(() => setCopyMessage(""), 2500);
  };

  const activeFilterCount = [
    sector !== "All sectors",
    location !== "All locations",
    structure !== "All structures",
    stage !== "All stages",
    fundingRange !== "all",
    verifiedOnly,
    showFollowing,
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
                aria-label="Search businesses, sectors, and locations"
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

              <button
                type="button"
                className="im-filter-toggle"
                aria-expanded={filtersOpen}
                aria-controls="im-business-filters"
                onClick={() => setFiltersOpen((open) => !open)}
              >
                {filtersOpen ? "Hide filters" : `Show filters${activeFilterCount ? ` · ${activeFilterCount}` : ""}`}
              </button>

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

            <div id="im-business-filters" className={`im-filters${filtersOpen ? "" : " is-collapsed"}`}>
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
                <span>Business stage</span>
                <select value={stage} onChange={(event) => setStage(event.target.value)}>
                  <option value="All stages">All stages</option>
                  {[...new Set(businesses.map((business) => String(business.business_stage || business.stage || "").trim()).filter(Boolean))]
                    .sort((a, b) => a.localeCompare(b))
                    .map((item) => <option key={item} value={item}>{item}</option>)}
                  {stage !== "All stages" && !businesses.some((business) => String(business.business_stage || business.stage || "").trim().toLowerCase() === stage.toLowerCase()) && <option value={stage}>{stage}</option>}
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
                aria-pressed={verifiedOnly}
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

          <section className="im-results-header" aria-live="polite" aria-atomic="true">
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

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {selectedIndustry && sector === selectedIndustry && <div className="im-url-filter">Sector:<strong>{selectedIndustry}</strong></div>}
              <button type="button" className="im-view-btn" disabled={compareIds.length < 2} onClick={() => document.getElementById("im-opportunity-comparison")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })}>
                Compare ({compareIds.length}/3)
              </button>
              <button type="button" className="im-view-btn" aria-label={showFollowing ? "Show all businesses" : "Show only businesses you follow"} aria-pressed={showFollowing} onClick={() => setShowFollowing((current) => !current)}>
                {showFollowing ? "Show all businesses" : `Following (${followedIds.length})`}
              </button>
              <button type="button" className="im-view-btn" onClick={copySearchLink}>Copy search link</button>
              {copyMessage && <span role="status" className="im-url-filter">{copyMessage}</span>}
            </div>
          </section>

          {followFeedback && <p role="alert" className="im-follow-feedback">{followFeedback}</p>}

          {followedUpdates.length > 0 && <section className="im-followed-updates" aria-labelledby="im-followed-updates-title">
            <div className="im-followed-updates-heading">
              <div>
                <span className="im-followed-updates-eyebrow">YOUR NETWORK</span>
                <h2 id="im-followed-updates-title">New updates from businesses you follow <span>{followedUpdates.length}</span></h2>
              </div>
              <button type="button" onClick={clearFollowedUpdates}>Clear all</button>
            </div>
            <div className="im-followed-updates-list">
              {followedUpdates.map((update) => <article className="im-followed-update" key={update.postId}>
                <div className="im-followed-update-copy">
                  <strong>{businesses.find((business) => String(business.id) === String(update.businessId))?.business_name || update.businessName}</strong>
                  <p>{update.text}</p>
                  {update.createdAt && <time dateTime={update.createdAt}>{new Date(update.createdAt).toLocaleDateString()}</time>}
                </div>
                <div className="im-followed-update-actions">
                  <Link to={`/business/${update.businessId}`}>View business <span aria-hidden="true">→</span></Link>
                  <button type="button" aria-label={`Dismiss update from ${businesses.find((business) => String(business.id) === String(update.businessId))?.business_name || update.businessName}`} onClick={() => dismissFollowedUpdate(update.postId)}>Dismiss</button>
                </div>
              </article>)}
            </div>
          </section>}

          {comparisonMessage && <p role="status" className="im-compare-notice">{comparisonMessage}</p>}
          {compareIds.length >= 2 && <ComparisonTable businesses={businesses.filter((business) => compareIds.includes(String(business.id)))} getFundingAmount={getFundingAmount} getRevenue={getRevenue} getStructure={getStructure} getBusinessAge={getBusinessAge} formatKES={formatKES} isVerified={isVerified} onRemove={toggleCompare} />}
          {viewer?.role === "investor" && investorMatchStatus === "ready" && <div className="im-profile-match-note" role="status">
            <span>PERSONALIZED DISCOVERY</span>
            <p>Opportunity notes compare your saved preferences with published business details. They are informational only, not investment recommendations.</p>
            <Link to="/investor-profile">Review your preferences <span aria-hidden="true">→</span></Link>
          </div>}
          {viewer?.role === "investor" && investorMatchMessage && <div className="im-profile-match-note" role="status">
            <span>PERSONALIZED DISCOVERY</span><p>{investorMatchMessage}</p>
            <Link to="/investor-profile">Investor profile <span aria-hidden="true">→</span></Link>
          </div>}

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
                {showFollowing && followedIds.length === 0
                  ? "You are not following any businesses yet. Follow a business to find its latest updates here."
                  : showFollowing
                    ? "No followed businesses match these filters. Clear filters or show all businesses to keep exploring."
                    : businesses.length === 0
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
                const latestPost = latestPostByBusiness.get(String(business.id));
                const investorSuggestion = investorSuggestionsByBusiness.get(String(business.id));
                const fundingAmount = getFundingAmount(business);
                const revenue = getRevenue(business);
                const businessAge = getBusinessAge(business);
                const businessStructure = getStructure(business);
                const businessStage = String(business.business_stage || business.stage || "").trim();
                const opportunityShareUrl = `${window.location.origin}/business/${business.id}`;
                const opportunityShareText = `Explore ${business.business_name || "this business"} on Investor Mtaani.`;
                const mediaSource = latestPost?.media_url
                  ? new URL(latestPost.media_url, api.defaults.baseURL || window.location.origin).toString()
                  : null;

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

                    <div className="im-opportunity-post">
                      <div className="im-opportunity-post-label">
                        <span aria-hidden="true">✳</span>{latestPost ? "LATEST BUSINESS UPDATE" : "BUSINESS STORY"}
                      </div>
                      <p className="im-opportunity-post-text">
                        {latestPost?.body || business.description || "Business information is available inside this opportunity profile."}
                      </p>
                      {mediaSource && (latestPost.media_mime?.startsWith("video/")
                        ? <video className="im-opportunity-post-media" src={mediaSource} controls playsInline preload="metadata" crossOrigin="anonymous" aria-label={`Video update from ${business.business_name}`} />
                        : <img className="im-opportunity-post-media" src={mediaSource} alt={`Latest update from ${business.business_name}`} loading="lazy" crossOrigin="anonymous" />)}
                      <div className="im-opportunity-post-actions">
                        {latestPost ? <button type="button" className={`im-opportunity-like${latestPost.viewer_liked ? " is-liked" : ""}`} aria-pressed={Boolean(latestPost.viewer_liked)} onClick={() => togglePostLike(latestPost)}>
                          <span aria-hidden="true">{latestPost.viewer_liked ? "♥" : "♡"}</span>{latestPost.likes_count || 0} likes
                        </button> : <span className="im-opportunity-post-note">No updates shared yet</span>}
                        <button type="button" className={`im-opportunity-follow${isFollowed(business.id) ? " is-following" : ""}`} aria-pressed={isFollowed(business.id)} disabled={followPendingId === String(business.id)} title="Follow this business to get its updates and activity notifications" aria-label={`${isFollowed(business.id) ? "Unfollow" : "Follow"} ${business.business_name || "business"}`} onClick={() => toggleFollowed(business.id)}>
                          <span aria-hidden="true">{isFollowed(business.id) ? "✓" : "+"}</span>{followPendingId === String(business.id) ? "Saving…" : isFollowed(business.id) ? "Following" : "Follow"}
                        </button>
                        {latestPost && <OpportunityDiscussion postId={latestPost.id} businessName={business.business_name || "This business"} />}
                        <div className="im-share-menu-wrap">
                          <button type="button" className="im-opportunity-share" aria-expanded={shareOpenFor === String(business.id)} aria-controls={`im-share-menu-${business.id}`} onClick={() => setShareOpenFor((current) => current === String(business.id) ? null : String(business.id))}>
                            <span aria-hidden="true">↗</span> Share opportunity
                          </button>
                          {shareOpenFor === String(business.id) && <div id={`im-share-menu-${business.id}`} className="im-share-menu" role="group" aria-label={`Share ${business.business_name || "business opportunity"}`}>
                            <span className="im-share-menu-title">SHARE THIS OPPORTUNITY</span>
                            <div className="im-share-options">
                              <button type="button" onClick={() => copyOpportunityLink(business)}>Copy link</button>
                              {typeof navigator.share === "function" && <button type="button" onClick={() => shareOpportunity(business)}>More apps…</button>}
                              <a href={`https://wa.me/?text=${encodeURIComponent(`${opportunityShareText} ${opportunityShareUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunityShareUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(opportunityShareText)}&url=${encodeURIComponent(opportunityShareUrl)}`} target="_blank" rel="noopener noreferrer">X</a>
                              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunityShareUrl)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                              <a href={`https://t.me/share/url?url=${encodeURIComponent(opportunityShareUrl)}&text=${encodeURIComponent(opportunityShareText)}`} target="_blank" rel="noopener noreferrer">Telegram</a>
                              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(opportunityShareUrl)}&title=${encodeURIComponent(opportunityShareText)}`} target="_blank" rel="noopener noreferrer">Reddit</a>
                              {mediaSource && !latestPost?.media_mime?.startsWith("video/") && <a href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(opportunityShareUrl)}&media=${encodeURIComponent(mediaSource)}&description=${encodeURIComponent(opportunityShareText)}`} target="_blank" rel="noopener noreferrer">Pinterest</a>}
                              <a href={`mailto:?subject=${encodeURIComponent(`Investor Mtaani opportunity: ${business.business_name || "Business"}`)}&body=${encodeURIComponent(`${opportunityShareText}\n${opportunityShareUrl}`)}`}>Email</a>
                              <a href={`sms:?body=${encodeURIComponent(`${opportunityShareText} ${opportunityShareUrl}`)}`}>Text message</a>
                            </div>
                            {shareStatus.businessId === String(business.id) && <span className="im-opportunity-share-status" role="status">{shareStatus.message}</span>}
                          </div>}
                        </div>
                      </div>
                    </div>

                    {investorSuggestion?.match_reasons?.length > 0 && <div className="im-profile-overlap">
                      <span><span aria-hidden="true">✳</span> WHY THIS MAY FIT YOUR INTERESTS</span>
                      <p>{investorSuggestion.match_reasons.join(" · ")}</p>
                    </div>}

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
                      {businessStage && <div className="im-opportunity im-opportunity-stage">
                        <span className="im-opportunity-label">BUSINESS STAGE</span>
                        <strong>{businessStage}</strong>
                      </div>}
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

                      <div className="im-card-actions">
                        <button type="button" className={`im-save-btn${isSaved(business.id) ? " is-saved" : ""}`} aria-pressed={isSaved(business.id)} onClick={() => toggleSaved(business)}>
                          <span aria-hidden="true">{isSaved(business.id) ? "★" : "☆"}</span>{isSaved(business.id) ? "Saved" : "Save"}
                        </button>
                        <button type="button" className={`im-compare-btn${compareIds.includes(String(business.id)) ? " is-selected" : ""}`} aria-pressed={compareIds.includes(String(business.id))} onClick={() => toggleCompare(business)}>
                          {compareIds.includes(String(business.id)) ? "Remove from compare" : "Compare"}
                        </button>
                        <Link to={`/business/${business.id}`} className="im-view-btn">View opportunity <span>→</span></Link>
                      </div>
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

const DEMO_DISCUSSION_PREFIX = "investor-mtaani:demo-discussion:v1:";

function containsPrivateDetails(value, protectedNames = []) {
  const text = String(value || "");
  const contactDetails = /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/|www\.|@[A-Za-z0-9_.]{3,}|(?:\+|00)\d{1,3}[\s().-]?(?:\d[\s().-]?){7,13}|(?<!\d)0\d{2,3}[\s().-]?\d{3}[\s().-]?\d{3,4}(?!\d)|(?<!\d)7\d{8}(?!\d)|(?<![\d,])\d{7,8}(?![\d,])|\b(?:0?[1-9]|[12]\d|3[01])[./-](?:0?[1-9]|1[0-2])[./-](?:19|20)\d{2}\b|\b(?:reach\s+me|contact\s+me|my\s+(?:name|number|email|address)\s+is|i\s+live\s+at)\b\s*[:#-]?\s*[^,;\n]{3,}|\b(?:national\s*(?:id|identity)(?:\s*(?:number|no\.?))?|id\s*(?:number|no\.?)|passport(?:\s*(?:number|no\.?))?|kra\s*pin|tax\s*pin|home\s+address|residential\s+address|postal\s+address|date\s+of\s+birth|dob)\b\s*[:#-]?\s*[^,;\n]{4,})/i;
  if (contactDetails.test(text)) return true;
  return protectedNames.filter((name) => typeof name === "string" && name.trim().length >= 4).some((name) => {
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "iu").test(text);
  });
}

function makeDemoComments(postId, businessName) {
  const questionSets = [
    [
      ["Demo investor · Nairobi", "What milestones will this funding help the business reach?", `We would use the funding to grow ${businessName}'s capacity and reach more customers.`],
      ["Demo investor · Kiambu", "Can you share more about your current customers?", null],
    ],
    [
      ["Demo investor · Mombasa", "How long has the business been operating?", `Thanks for asking. The team has shared its background on the opportunity profile.`],
      ["Demo investor · Nakuru", "What will be the first priority for the funds?", null],
    ],
    [
      ["Demo investor · Kisumu", "How does the team plan to grow over the next year?", `Our next step is to build on ${businessName}'s existing progress and serve more customers.`],
      ["Demo investor · Nairobi", "Which markets are you currently serving?", null],
    ],
  ];
  const key = String(postId).split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return questionSets[key % questionSets.length].map(([author, body, reply], index) => ({
    id: `sample-${postId}-${index + 1}`,
    author,
    body,
    replies: reply ? [{ id: `sample-reply-${postId}-${index + 1}`, author: businessName, body: reply }] : [],
  }));
}

function OpportunityDiscussion({ postId, businessName }) {
  const [comments, setComments] = useState(() => {
    try {
      const stored = window.localStorage.getItem(`${DEMO_DISCUSSION_PREFIX}${postId}`);
      return stored === null ? makeDemoComments(postId, businessName) : JSON.parse(stored);
    } catch { return makeDemoComments(postId, businessName); }
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [privacyError, setPrivacyError] = useState("");
  const [viewerName] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem("user") || "null")?.name || ""; } catch { return ""; }
  });

  const saveComments = (next) => {
    setComments(next);
    try { window.localStorage.setItem(`${DEMO_DISCUSSION_PREFIX}${postId}`, JSON.stringify(next)); } catch { /* Keep demo discussion available for this visit. */ }
  };

  const addComment = (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    if (containsPrivateDetails(body, [businessName, viewerName])) { setPrivacyError("Please remove names, contact details, IDs, addresses, or links. Investor Mtaani coordinates introductions privately."); return; }
    saveComments([...comments, { id: `${Date.now()}-${Math.random()}`, author: "Demo investor", body, replies: [] }]);
    setDraft("");
    setPrivacyError("");
  };

  const addReply = (event, commentId) => {
    event.preventDefault();
    const body = replyDraft.trim();
    if (!body) return;
    if (containsPrivateDetails(body, [businessName, viewerName])) { setPrivacyError("Please remove names, contact details, IDs, addresses, or links. Investor Mtaani coordinates introductions privately."); return; }
    saveComments(comments.map((comment) => comment.id === commentId
      ? { ...comment, replies: [...(comment.replies || []), { id: `${Date.now()}-${Math.random()}`, author: businessName, body }] }
      : comment));
    setReplyDraft("");
    setReplyTo(null);
    setPrivacyError("");
  };

  return <div className="im-discussion">
    <button type="button" className="im-discussion-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span aria-hidden="true">▤</span> {comments.length} comments {open ? "−" : "+"}
    </button>
    {open && <div className="im-discussion-panel">
      <div className="im-demo-notice">DEMO DISCUSSION · sample content saved only in this browser</div>
      {comments.length === 0 && <p className="im-discussion-empty">No demo questions yet. Add one below.</p>}
      {comments.map((comment) => <div className="im-comment" key={comment.id}>
        <strong>{comment.author}</strong><p>{comment.body}</p>
        {(comment.replies || []).map((reply) => <div className="im-business-reply" key={reply.id}><strong>{reply.author} · Business</strong><p>{reply.body}</p></div>)}
        <button type="button" className="im-reply-link" onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyDraft(""); }}>Reply as business</button>
        {replyTo === comment.id && <form className="im-reply-form" onSubmit={(event) => addReply(event, comment.id)}><input aria-label="Business reply" value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="Reply as the business…" maxLength={500} /><button type="submit" disabled={!replyDraft.trim()}>Reply</button></form>}
      </div>)}
      <form className="im-comment-form" onSubmit={addComment}><input aria-label="Write a demo comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask the business a question…" maxLength={500} /><button type="submit" disabled={!draft.trim()}>Comment</button></form>
      {privacyError && <p role="alert" className="im-discussion-footnote">{privacyError}</p>}
      <p className="im-discussion-footnote">Sample comments are for testing only. Posting here does not contact the business.</p>
    </div>}
  </div>;
}

function ComparisonTable({ businesses, getFundingAmount, getRevenue, getStructure, getBusinessAge, formatKES, isVerified, onRemove }) {
  const rows = [
    ["Sector", (business) => business.industry || "Not disclosed"],
    ["Location", (business) => business.location || "Not disclosed"],
    ["Funding sought", (business) => formatKES(getFundingAmount(business))],
    ["Structure", getStructure],
    ["Business stage", (business) => business.business_stage || business.stage || "Not disclosed"],
    ["Annual turnover", (business) => formatKES(getRevenue(business))],
    ["Operating history", (business) => { const age = getBusinessAge(business); return age === null ? "Not disclosed" : `${age} ${age === 1 ? "year" : "years"}`; }],
    ["Verification", (business) => isVerified(business) ? "Reviewed" : "Not verified"],
  ];

  return <section id="im-opportunity-comparison" className="im-compare-panel" aria-labelledby="im-compare-title">
    <div className="im-compare-heading"><div><span>SHORTLIST REVIEW</span><h2 id="im-compare-title">Compare opportunities</h2><p>Compare the published details side by side. Review each profile before making a decision.</p></div><div className="im-compare-remove-list">{businesses.map((business) => <button key={business.id} type="button" onClick={() => onRemove(business)} aria-label={`Remove ${business.business_name || "business"} from comparison`}>Remove {business.business_name || "business"} ×</button>)}</div></div>
    <div className="im-comparison-scroll" tabIndex={0} aria-label="Opportunity comparison table. Scroll horizontally to see all columns.">
      <table className="im-comparison-table">
        <thead><tr><th scope="col">Details</th>{businesses.map((business) => <th key={business.id} scope="col">{business.business_name || "Unnamed business"}</th>)}</tr></thead>
        <tbody>{rows.map(([label, valueFor]) => <tr key={label}><th scope="row">{label}</th>{businesses.map((business) => <td key={business.id}>{valueFor(business)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>;
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
          repeat(5, minmax(120px, 1fr))
          minmax(160px, 1.15fr);
        gap: 12px;
      }

      .im-filter-toggle { display: none; }

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

      .im-opportunity-post {
        margin: 0 0 18px;
        padding: 14px;
        border: 1px solid rgba(61, 214, 245, .14);
        border-radius: 10px;
        background: linear-gradient(145deg, rgba(6, 12, 22, .9), rgba(13, 22, 36, .88));
      }
      .im-opportunity-post-label { display:flex; align-items:center; gap:7px; color:#79dceb; font:700 9px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-opportunity-post-label span { color:#4bd3c0; font-size:14px; }
      .im-opportunity-post-text { margin:10px 0 12px; color:#d5deea; font-size:12px; line-height:1.65; white-space:pre-wrap; overflow-wrap:anywhere; }
      .im-opportunity-post-media { display:block; width:100%; max-height:260px; margin:0 0 10px; border:1px solid rgba(255,255,255,.08); border-radius:8px; background:#05080f; object-fit:cover; }
      .im-opportunity-post-actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding-top:8px; border-top:1px solid rgba(255,255,255,.08); }
      .im-opportunity-like, .im-opportunity-share { display:inline-flex; min-height:34px; align-items:center; gap:6px; padding:0 3px; border:0; background:transparent; color:#9aa8bb; cursor:pointer; font:600 10px 'JetBrains Mono',monospace; }
      .im-opportunity-like > span { color:#9aa8bb; font-size:16px; }
      .im-opportunity-like.is-liked, .im-opportunity-like.is-liked > span { color:#ff8395; }
      .im-opportunity-share { color:#88dfee; }
      .im-opportunity-follow { display:inline-flex; min-height:34px; align-items:center; gap:5px; padding:0 3px; border:0; background:transparent; color:#91a0b3; cursor:pointer; font:600 10px 'JetBrains Mono',monospace; }
      .im-opportunity-follow > span { color:#63d6c7; font-size:14px; }
      .im-opportunity-follow.is-following, .im-opportunity-follow.is-following > span { color:#85e4d6; }
      .im-share-menu-wrap { position:relative; z-index:3; }
      .im-share-menu { position:absolute; z-index:20; top:calc(100% + 7px); right:0; width:min(285px,calc(100vw - 56px)); padding:12px; border:1px solid rgba(121,220,235,.25); border-radius:9px; background:#101927; box-shadow:0 16px 34px rgba(0,0,0,.42); }
      .im-share-menu-title { display:block; margin-bottom:9px; color:#79dceb; font:700 8px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-share-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
      .im-share-options a, .im-share-options button { display:flex; min-height:36px; align-items:center; justify-content:center; padding:5px 8px; border:1px solid rgba(148,163,184,.17); border-radius:6px; background:rgba(148,163,184,.045); color:#c4d0de; cursor:pointer; font:600 10px 'JetBrains Mono',monospace; text-align:center; text-decoration:none; }
      .im-share-options a:hover, .im-share-options button:hover { border-color:rgba(73,221,202,.34); background:rgba(73,221,202,.08); color:#9ceee0; }
      .im-share-options a:focus-visible, .im-share-options button:focus-visible, .im-opportunity-follow:focus-visible { outline:2px solid var(--cyan); outline-offset:2px; }
      .im-opportunity-post-note, .im-opportunity-share-status { color:#7c8aa0; font-size:10px; }
      .im-opportunity-share-status { flex-basis:100%; }
      .im-discussion { position:relative; }
      .im-discussion-toggle { display:inline-flex; min-height:34px; align-items:center; gap:6px; padding:0 3px; border:0; background:transparent; color:#9aa8bb; cursor:pointer; font:600 10px 'JetBrains Mono',monospace; }
      .im-discussion-toggle:hover, .im-reply-link:hover { color:#88dfee; }
      .im-discussion-panel { position:absolute; z-index:5; top:calc(100% + 8px); left:0; width:min(340px, calc(100vw - 64px)); max-height:360px; overflow:auto; padding:12px; border:1px solid rgba(121,220,235,.23); border-radius:10px; background:#101927; box-shadow:0 16px 34px rgba(0,0,0,.38); }
      .im-demo-notice { margin-bottom:10px; color:#79dceb; font:700 8px 'JetBrains Mono',monospace; letter-spacing:.08em; }
      .im-discussion-empty, .im-discussion-footnote { color:#8593a7; font-size:10px; line-height:1.5; }
      .im-comment { padding:9px 0; border-top:1px solid rgba(255,255,255,.07); }
      .im-comment > strong, .im-business-reply > strong { color:#dbe5ef; font-size:10px; }
      .im-comment > p, .im-business-reply > p { margin:4px 0 6px; color:#b9c4d2; font-size:11px; line-height:1.45; overflow-wrap:anywhere; }
      .im-business-reply { margin:8px 0 4px 10px; padding:7px 9px; border-left:2px solid #36bfae; background:rgba(54,191,174,.06); }
      .im-business-reply > strong { color:#86e3d6; }
      .im-reply-link { border:0; padding:2px 0; background:transparent; color:#83cbd8; cursor:pointer; font-size:9px; }
      .im-comment-form, .im-reply-form { display:flex; gap:6px; margin-top:8px; }
      .im-comment-form input, .im-reply-form input { flex:1; min-width:0; height:34px; padding:0 9px; border:1px solid rgba(255,255,255,.12); border-radius:6px; background:#0a111b; color:#e5edf5; font-size:10px; }
      .im-comment-form button, .im-reply-form button { min-height:34px; padding:0 10px; border:1px solid rgba(73,221,202,.3); border-radius:6px; background:rgba(73,221,202,.1); color:#a6eee2; cursor:pointer; font-size:10px; font-weight:700; }
      .im-comment-form button:disabled, .im-reply-form button:disabled { opacity:.45; cursor:not-allowed; }
      .im-discussion-footnote { margin:9px 0 0; }
      .im-profile-overlap { margin:-6px 0 16px; padding:11px 13px; border-left:2px solid #8b7cf6; border-radius:0 7px 7px 0; background:rgba(139,124,246,.07); }
      .im-profile-overlap > span, .im-profile-match-note > span { color:#b9adff; font:700 8px 'JetBrains Mono',monospace; letter-spacing:.08em; }
      .im-profile-overlap > span span { color:#a89bff; }
      .im-profile-overlap p, .im-profile-match-note p { margin:5px 0 0; color:#bfc5d7; font-size:10px; line-height:1.5; }
      .im-profile-match-note { display:flex; align-items:center; flex-wrap:wrap; gap:4px 16px; margin:0 0 18px; padding:12px 14px; border:1px solid rgba(139,124,246,.17); border-radius:8px; background:rgba(139,124,246,.035); }
      .im-profile-match-note p { flex:1 1 360px; margin:0; }
      .im-profile-match-note a { color:#c3b9ff; font-size:10px; font-weight:700; text-decoration:none; }
      .im-profile-match-note a:hover { color:#fff; }
      .im-followed-updates { margin:0 0 18px; padding:15px; border:1px solid rgba(54,191,174,.24); border-radius:10px; background:linear-gradient(110deg,rgba(54,191,174,.075),rgba(139,124,246,.045)); }
      .im-followed-updates-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; }
      .im-followed-updates-eyebrow { color:#79d9cb; font:700 8px 'JetBrains Mono',monospace; letter-spacing:.1em; }
      .im-followed-updates h2 { margin:4px 0 0; color:#e7f3f1; font-size:14px; }
      .im-followed-updates h2 span { display:inline-grid; place-items:center; min-width:19px; height:19px; margin-left:5px; padding:0 5px; border-radius:99px; background:rgba(54,191,174,.18); color:#a8f1e5; font-size:10px; }
      .im-followed-updates-heading > button, .im-followed-update-actions > button { border:0; background:transparent; color:#94a2b4; cursor:pointer; font-size:10px; }
      .im-followed-updates-heading > button:hover, .im-followed-update-actions > button:hover { color:#fff; }
      .im-followed-update { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:11px 0; border-top:1px solid rgba(255,255,255,.07); }
      .im-followed-update-copy { min-width:0; }
      .im-followed-update-copy > strong { color:#dfe9ef; font-size:11px; }
      .im-followed-update-copy p { margin:4px 0; color:#aab6c5; font-size:11px; line-height:1.45; overflow-wrap:anywhere; }
      .im-followed-update-copy time { color:#76859a; font-size:9px; }
      .im-followed-update-actions { display:flex; flex-shrink:0; align-items:center; gap:12px; }
      .im-followed-update-actions > a { color:#83ded0; font-size:10px; font-weight:700; text-decoration:none; white-space:nowrap; }
      .im-followed-update-actions > a:hover { color:#fff; }
      @media (max-width:560px) { .im-followed-update { align-items:flex-start; flex-direction:column; gap:8px; } .im-followed-update-actions { width:100%; justify-content:space-between; } }

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
      .im-opportunity.im-opportunity-stage { grid-column: 1 / -1; border-right: 0; border-bottom: 0; padding-top: 10px; padding-bottom: 10px; }

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

      .im-card-actions { display: flex; flex: 1; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
      .im-save-btn, .im-compare-btn {
        display: inline-flex;
        min-height: 40px;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 11px;
        border: 1px solid rgba(148,163,184,.2);
        border-radius: 4px;
        background: rgba(148,163,184,.04);
        color: var(--muted-light);
        font: 600 10px 'JetBrains Mono', monospace;
        cursor: pointer;
      }
      .im-save-btn:hover, .im-save-btn.is-saved { border-color: rgba(241,199,91,.42); background: rgba(241,199,91,.08); color: var(--gold); }
      .im-compare-btn:hover, .im-compare-btn.is-selected { border-color: rgba(139,124,246,.45); background: rgba(139,124,246,.09); color: #b9adff; }
      .im-save-btn:focus-visible, .im-compare-btn:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
      .im-compare-notice { margin: -8px 0 16px; color: #f1c75b; font-size: 12px; }
      .im-compare-panel { margin: 0 0 22px; padding: 20px; border: 1px solid rgba(139,124,246,.28); border-radius: 10px; background: linear-gradient(145deg,rgba(18,25,47,.96),rgba(10,16,30,.97)); box-shadow: 0 18px 48px rgba(0,0,0,.22); scroll-margin-top: 90px; }
      .im-compare-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
      .im-compare-heading > div:first-child > span { color: #b9adff; font: 700 9px 'JetBrains Mono',monospace; letter-spacing: .13em; }
      .im-compare-heading h2 { margin: 5px 0; color: var(--text); font-size: 20px; }
      .im-compare-heading p { margin: 0; color: var(--muted); font-size: 12px; }
      .im-compare-remove-list { display:flex; flex-wrap:wrap; gap:6px; }
      .im-compare-remove-list button { min-height:36px; padding:0 9px; border:1px solid rgba(148,163,184,.2); border-radius:6px; background:transparent; color:#aeb9c9; font:500 10px 'JetBrains Mono',monospace; cursor:pointer; }
      .im-comparison-scroll { max-width:100%; overflow-x:auto; overscroll-behavior-inline:contain; -webkit-overflow-scrolling:touch; }
      .im-comparison-table { width:100%; min-width:560px; border-collapse:collapse; text-align:left; }
      .im-comparison-table th, .im-comparison-table td { padding:11px 13px; border:1px solid rgba(148,163,184,.13); color:#b9c6d5; font-size:12px; }
      .im-comparison-table thead th { color:#dce7f2; background:rgba(148,163,184,.06); }
      .im-comparison-table tbody th { width:155px; color:#8b7cf6; font-weight:700; }

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

      .im-view-btn:disabled { opacity: .45; cursor: not-allowed; }

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
        .im-filter-toggle {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid rgba(73,221,202,.28);
          border-radius: 9px;
          background: rgba(73,221,202,.08);
          color: #9cf1e4;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
        }

        .im-filters.is-collapsed { display: none; }
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

        .im-card-actions { width: 100%; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); }
        .im-card-actions .im-view-btn { grid-column: 1 / -1; }
        .im-compare-panel { padding: 15px; }

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
