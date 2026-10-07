import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CLOSED_STATUSES = ["completed", "closed", "funded", "successful"];
const LOST_STATUSES = ["rejected", "declined", "cancelled"];
const DEFAULT_STATUSES = ["pending", "approved", "rejected", "completed"];

const ASK_KEYS = [
  "funding_ask",
  "funding_needed",
  "ask_amount",
  "ask",
  "amount_requested",
  "funding_amount",
  "funding_goal",
  "amount",
  "funding_required",
];

const BUSINESS_NAME_KEYS = [
  "business_name",
  "businessName",
  "company_name",
  "name",
  "title",
];

const INVESTOR_NAME_KEYS = [
  "investor_name",
  "investorName",
  "firm_name",
  "name",
  "full_name",
];

const pick = (obj, keys, fallback = undefined) => {
  if (!obj) return fallback;

  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== ""
    ) {
      return obj[key];
    }
  }

  return fallback;
};

const toArray = (res) => {
  const d = res?.data;
  const v = d?.data ?? d;

  if (Array.isArray(v)) return v;

  if (v && typeof v === "object") {
    const found = Object.values(v).find(Array.isArray);
    if (found) return found;
  }

  return [];
};

const money = (n) =>
  "KES " +
  Number(n || 0).toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  });

const shortMoney = (n) => {
  const value = Number(n || 0);

  if (value >= 1e9) return (value / 1e9).toFixed(1) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(1) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(1) + "K";

  return String(Math.round(value));
};

const fmtDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d)) return "-";

  return d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const norm = (value) =>
  String(value || "pending").toLowerCase();

const statusHex = (status) => {
  if (CLOSED_STATUSES.includes(status)) return "#38ffb3";

  if (LOST_STATUSES.includes(status)) return "#ff5570";

  if (status === "pending") return "#ffbd4a";

  if (
    ["approved", "matched", "accepted"].includes(status)
  ) {
    return "#a78bfa";
  }

  return "#7c8da8";
};

const cut = (text, length = 20) =>
  String(text).length > length
    ? String(text).slice(0, length - 1) + "…"
    : String(text);

export default function AdminPage() {
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [investors, setInvestors] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    min: "",
    max: "",
    sort: "newest",
  });

  const load = useCallback(async () => {
    const calls = {
      profile: api.get("/admin/profile"),
      stats: api.get("/admin/stats"),
      matches: api.get("/admin/matchmaking"),
      businesses: api.get("/admin/businesses"),
      investors: api.get("/admin/investors"),
    };

    const keys = Object.keys(calls);

    const results = await Promise.allSettled(
      Object.values(calls)
    );

    const nextErrors = {};

    results.forEach((result, index) => {
      const key = keys[index];

      if (result.status === "rejected") {
        nextErrors[key] =
          result.reason?.response?.data?.message ||
          result.reason?.message ||
          "Request failed";

        return;
      }

      if (key === "stats") {
        setStats(
          result.value?.data?.data ??
            result.value?.data ??
            {}
        );
      }

      if (key === "profile") {
        setAdminProfile(result.value?.data?.data ?? null);
      }

      if (key === "matches") {
        setMatches(toArray(result.value));
      }

      if (key === "businesses") {
        setBusinesses(toArray(result.value));
      }

      if (key === "investors") {
        setInvestors(toArray(result.value));
      }
    });

    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect starts a data request; state changes happen after the requests settle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      2600
    );

    return () => clearTimeout(timer);
  }, [toast]);

  const businessById = useMemo(() => {
    const map = {};

    businesses.forEach((business) => {
      map[business.id] = business;
    });

    return map;
  }, [businesses]);

  const investorById = useMemo(() => {
    const map = {};

    investors.forEach((investor) => {
      map[investor.id] = investor;
    });

    return map;
  }, [investors]);

  const rows = useMemo(
    () =>
      matches.map((match) => {
        const business =
          match.business ||
          businessById[match.business_id];

        const investor =
          match.investor ||
          investorById[match.investor_id];

        const ask =
          Number(
            pick(match, ASK_KEYS) ??
              pick(business, ASK_KEYS, 0)
          ) || 0;

        const status = norm(match.status);

        return {
          raw: match,
          id: match.id,
          business:
            pick(match, [
              "business_name",
              "businessName",
            ]) ||
            pick(
              business,
              BUSINESS_NAME_KEYS,
              "Unknown business"
            ),
          investor:
            pick(match, [
              "investor_name",
              "investorName",
            ]) ||
            pick(
              investor,
              INVESTOR_NAME_KEYS,
              "Unknown investor"
            ),
          ask,
          commission: Number(
            pick(match, ["fee_amount", "platform_fee_amount", "commission_amount"], 0)
          ) || 0,
          feeStatus: String(
            pick(match, ["fee_status", "platform_fee_status"], "not recorded")
          ).toLowerCase(),
          status,
          date:
            match.created_at ||
            match.createdAt,
        };
      }),
    [matches, businessById, investorById]
  );

  const statusOptions = useMemo(() => {
    const set = new Set(DEFAULT_STATUSES);

    rows.forEach((row) => set.add(row.status));

    return [...set];
  }, [rows]);

  const statusUpdateOptions = (currentStatus) =>
    currentStatus === "accepted" ? ["accepted"] : ["pending", "declined"];

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    const min =
      filters.min === ""
        ? null
        : Number(filters.min);

    const max =
      filters.max === ""
        ? null
        : Number(filters.max);

    const list = rows.filter((row) => {
      if (
        filters.status !== "all" &&
        row.status !== filters.status
      ) {
        return false;
      }

      if (min !== null && row.ask < min) {
        return false;
      }

      if (max !== null && row.ask > max) {
        return false;
      }

      if (
        q &&
        !`${row.business} ${row.investor} ${row.id}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }

      return true;
    });

    const sorters = {
      newest: (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0),

      oldest: (a, b) =>
        new Date(a.date || 0) -
        new Date(b.date || 0),

      askHigh: (a, b) => b.ask - a.ask,

      askLow: (a, b) => a.ask - b.ask,
    };

    return [...list].sort(sorters[filters.sort]);
  }, [rows, filters]);

  const revenue = useMemo(() => {
    const active = rows.filter(
      (row) =>
        !LOST_STATUSES.includes(row.status)
    );

    const closed = rows.filter((row) =>
      CLOSED_STATUSES.includes(row.status)
    );

    const pipelineAsk = active.reduce(
      (sum, row) => sum + row.ask,
      0
    );

    return {
      pipelineAsk,
      projected: active
        .filter((row) => ["due", "pending", "unpaid"].includes(row.feeStatus))
        .reduce((sum, row) => sum + row.commission, 0),
      earned: rows
        .filter((row) => ["paid", "collected"].includes(row.feeStatus))
        .reduce((sum, row) => sum + row.commission, 0),
      closedCount: closed.length,
    };
  }, [rows]);

  const trend = useMemo(() => {
    const byMonth = {};

    rows.forEach((row) => {
      if (LOST_STATUSES.includes(row.status)) {
        return;
      }

      const date = row.date
        ? new Date(row.date)
        : null;

      const key =
        date && !isNaN(date)
          ? `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`
          : "undated";

      if (!byMonth[key]) {
        byMonth[key] = {
          projected: 0,
          earned: 0,
        };
      }

      if (["due", "pending", "unpaid"].includes(row.feeStatus)) {
        byMonth[key].projected += row.commission;
      }

      if (["paid", "collected"].includes(row.feeStatus)) {
        byMonth[key].earned += row.commission;
      }
    });

    return Object.keys(byMonth)
      .sort()
      .reduce((totals, key) => {
        const projected = totals.projected + byMonth[key].projected;
        const earned = totals.earned + byMonth[key].earned;
        if (key === "undated") {
          return { ...totals, projected, earned, points: [...totals.points, {
            label: "N/A",
            projected,
            earned,
          }] };
        }

        const [year, month] =
          key.split("-");

        return { ...totals, projected, earned, points: [...totals.points, {
          label: new Date(
            year,
            month - 1
          ).toLocaleDateString(
            "en-KE",
            { month: "short" }
          ),
          projected,
          earned,
        }] };
      }, { projected: 0, earned: 0, points: [] })
      .points.slice(-8);
  }, [rows]);

  const leaders = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            !LOST_STATUSES.includes(
              row.status
            ) &&
            !CLOSED_STATUSES.includes(
              row.status
            )
        )
        .sort((a, b) => b.ask - a.ask)
        .slice(0, 5),
    [rows]
  );

  const sectors = useMemo(() => {
    const map = {};

    businesses.forEach((business) => {
      const sector = pick(
        business,
        [
          "sector",
          "industry",
          "category",
        ],
        "Other"
      );

      map[sector] =
        (map[sector] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [businesses]);

  const recent = useMemo(
    () =>
      [...rows]
        .sort(
          (a, b) =>
            new Date(b.date || 0) -
            new Date(a.date || 0)
        )
        .slice(0, 6),
    [rows]
  );

  const selected =
    rows.find(
      (row) => row.id === selectedId
    ) || null;

  const earnedShown = useCountUp(
    revenue.earned
  );

  const projectedShown = useCountUp(
    revenue.projected
  );

  const filteredCommission =
    filtered.reduce(
      (sum, row) =>
        sum + row.commission,
      0
    );

  const filteredAsk =
    filtered.reduce(
      (sum, row) => sum + row.ask,
      0
    );

  const statusCounts = useMemo(() => {
    const counts = {};

    rows.forEach((row) => {
      counts[row.status] =
        (counts[row.status] || 0) + 1;
    });

    return counts;
  }, [rows]);

  const statNum = (keys) => {
    if (!stats) return "-";

    for (const key of keys) {
      if (stats[key] !== undefined) {
        return stats[key];
      }
    }

    const dynamic = Object.entries(
      stats
    ).find(([key]) =>
      keys.some((item) =>
        key.includes(item)
      )
    );

    return dynamic ? dynamic[1] : "-";
  };

  const setStatus = async (
    row,
    status
  ) => {
    if (status === row.status) return;

    setUpdatingId(row.id);

    try {
      await api.patch(
        `/admin/matchmaking/${row.id}/status`,
        { status }
      );

      setMatches((previous) =>
        previous.map((match) =>
          match.id === row.id
            ? { ...match, status }
            : match
        )
      );

      setToast(
        `Match #${row.id} marked ${status}`
      );
    } catch (error) {
      setToast(
        error.response?.data?.message ||
          "Could not update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const setFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      status: "all",
      min: "",
      max: "",
      sort: "newest",
    });
  };

  const filtersActive =
    filters.q ||
    filters.status !== "all" ||
    filters.min !== "" ||
    filters.max !== "" ||
    filters.sort !== "newest";

  const total = rows.length || 1;

  return (
    <>
      <Styles />

      <main className="ad-page">
        <div className="ad-grid" />

        <header className="ad-head">
          <div className="ad-brand-block">
            <div className="ad-brand-line">
              <span className="ad-brand-mark">
                IM
              </span>

              <span>
                INVESTOR MTAANI
              </span>

              <span className="ad-brand-separator">
                //
              </span>

              <span className="ad-control-text">
                CONTROL CENTER
              </span>
            </div>

            <p className="ad-kicker">
              <span className="ad-dot" />
              SYSTEM ONLINE
            </p>

            <h1 className="ad-title">
              Capital intelligence
              <span>.</span>
            </h1>

            <p className="ad-sub">
              Command center for the Investor Mtaani
              investment network, deal flow and
              platform performance.
            </p>
          </div>

          <div className="ad-head-actions">
            <a href="/admin/kyc" className="ad-btn ad-btn-ghost">Review identity submissions</a>
            <div className="ad-admin-badge">
              <span className="ad-live-ring" />
              <span>
                <small>{adminProfile?.display_name || adminProfile?.name || "PLATFORM ADMIN"}</small>
                ADMIN ENTITY
              </span>
            </div>

            <button
              className="ad-btn ad-btn-ghost"
              onClick={load}
              disabled={loading}
            >
              <span className="ad-btn-icon">
                ↻
              </span>

              {loading
                ? "Refreshing..."
                : "Refresh data"}
            </button>
          </div>
        </header>

        <div className="ad-command-strip">
          <span>
            <b>NETWORK</b> AFRICA
          </span>

          <span>
            <b>PLATFORM</b> INVESTOR MTAANI
          </span>

          <span>
            <b>PROPOSED FEE</b>{" "}
            5% · TERMS TBC
          </span>

          <span className="ad-command-live">
            ● LIVE MONITORING
          </span>
        </div>

        {Object.keys(errors).length > 0 && (
          <div
            className="ad-alert"
            role="alert"
          >
            <strong>
              DATA LINK WARNING
            </strong>

            <span>
              Some data failed to load:{" "}
              {Object.entries(errors)
                .map(
                  ([key, value]) =>
                    `${key} (${value})`
                )
                .join(", ")}
            </span>
          </div>
        )}

        <section className="ad-hero">
          <div className="ad-hero-main">
            <div className="ad-hero-orbit orbit-one" />
            <div className="ad-hero-orbit orbit-two" />

            <p className="ad-hero-label">
              RECORDED PLATFORM FEES
            </p>

            <p className="ad-hero-caption">
              MARKED AS PAID IN DEAL RECORDS
            </p>

            <p className="ad-hero-value">
              {money(earnedShown)}
            </p>

            <div className="ad-hero-meta">
              <span>
fee amount recorded
              </span>

              <span className="ad-meta-divider">
                /
              </span>

              <span>
                {revenue.closedCount} closed{" "}
                {revenue.closedCount === 1
                  ? "deal"
                  : "deals"}
              </span>
            </div>

            <p className="ad-hero-note">
Only fees explicitly recorded as paid are included.
            </p>
          </div>

          <div className="ad-hero-side">
            <div>
              <p className="ad-hero-label">
                OPEN PIPELINE
              </p>

              <p className="ad-hero-mid">
                {money(projectedShown)}
              </p>

              <p className="ad-hero-note">
                fees recorded as due
              </p>

              <div className="ad-pipeline-number">
                {money(revenue.pipelineAsk)}
                <span>
                  active asks
                </span>
              </div>
            </div>

            <div className="ad-rate">
              <span>TBC</span>
              <small>PROPOSED</small>
              <small>FEE TERMS</small>
            </div>
          </div>
        </section>

        <section className="ad-stats">
          <Stat
            label="TOTAL USERS"
            value={statNum([
              "total_users",
              "users",
            ])}
            accent="cyan"
            icon="◉"
          />

          <Stat
            label="BUSINESSES"
            value={statNum([
              "total_businesses",
              "businesses",
            ])}
            accent="violet"
            icon="▦"
          />

          <Stat
            label="INVESTORS"
            value={statNum([
              "total_investors",
              "investors",
            ])}
            accent="green"
            icon="♙"
          />

          <Stat
            label="MATCH REQUESTS"
            value={rows.length}
            accent="amber"
            icon="⇄"
          />
        </section>

        {rows.length > 0 && (
          <section className="ad-panel ad-pipeline-panel">
            <div className="ad-panel-head">
              <div>
                <span className="ad-section-code">
                  01 / DEAL FLOW
                </span>

                <h2>
                  Match pipeline
                </h2>
              </div>

              <span className="ad-muted">
                Select a stage to filter
              </span>
            </div>

            <div className="ad-bar">
              {Object.entries(
                statusCounts
              ).map(([status, count]) => (
                <button
                  key={status}
                  className={`ad-seg ad-st-${status}`}
                  style={{
                    flexGrow: count,
                  }}
                  onClick={() => {
                    setFilter(
                      "status",
                      status
                    );

                    setTab(
                      "matchmaking"
                    );
                  }}
                >
                  <span>
                    {status}
                  </span>

                  <b>{count}</b>
                </button>
              ))}
            </div>

            <div className="ad-pipeline-footer">
              <span>
                COMPLETION RATE
              </span>

              <strong>
                {Math.round(
                  ((statusCounts.completed ||
                    0) /
                    total) *
                    100
                )}
                %
              </strong>
            </div>
          </section>
        )}

        <nav
          className="ad-tabs"
          aria-label="Admin sections"
        >
          {[
            ["overview", "Overview"],
            [
              "matchmaking",
              `Matchmaking (${rows.length})`,
            ],
            [
              "businesses",
              `Businesses (${businesses.length})`,
            ],
            [
              "investors",
              `Investors (${investors.length})`,
            ],
          ].map(([key, label]) => (
            <button
              key={key}
              className={
                tab === key
                  ? "ad-tab ad-tab-on"
                  : "ad-tab"
              }
              onClick={() =>
                setTab(key)
              }
            >
              <span className="ad-tab-index">
                0{["overview", "matchmaking", "businesses", "investors"].indexOf(key) + 1}
              </span>

              {label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <>
            <section className="ad-bento">
              <div className="ad-panel ad-span2">
                <div className="ad-panel-head">
                  <div>
                    <span className="ad-section-code">
                      02 / REVENUE INTELLIGENCE
                    </span>

                    <h2>
                      Recorded fee history
                    </h2>
                  </div>

                  <span className="ad-legend">
                    <i className="ad-lg-a" />
                    Projected
                    <i className="ad-lg-b" />
                    Earned
                  </span>
                </div>

                <TrendChart
                  series={trend}
                />
              </div>

              <div className="ad-panel">
                <div className="ad-panel-head">
                  <div>
                    <span className="ad-section-code">
                      03 / STATUS MATRIX
                    </span>

                    <h2>
                      Where requests stand
                    </h2>
                  </div>
                </div>

                <Donut
                  counts={statusCounts}
                  total={rows.length}
                />
              </div>
            </section>

            <section className="ad-panel">
              <div className="ad-panel-head">
                <div>
                  <span className="ad-section-code">
                    04 / NETWORK MAP
                  </span>

                  <h2>
                    Deal flow network
                  </h2>
                </div>

                <span className="ad-muted">
                  Hover nodes to trace connections
                </span>
              </div>

              <Network
                rows={rows}
                onPick={setSelectedId}
              />
            </section>

            <section className="ad-bento3">
              <div className="ad-panel">
                <div className="ad-panel-head">
                  <div>
                    <span className="ad-section-code">
                      05 / OPPORTUNITIES
                    </span>

                    <h2>
                      Biggest open deals
                    </h2>
                  </div>
                </div>

                {leaders.length === 0 && (
                  <p className="ad-empty">
                    No open requests right now.
                  </p>
                )}

                {leaders.map((row) => (
                  <button
                    key={row.id}
                    className="ad-lead"
                    onClick={() =>
                      setSelectedId(row.id)
                    }
                  >
                    <span className="ad-lead-top">
                      <b>{row.business}</b>

                      <span className="ad-accent">
                        {money(
                          row.commission
                        )}
                      </span>
                    </span>

                    <span className="ad-lead-bar">
                      <i
                        style={{
                          width: `${
                            (row.ask /
                              (leaders[0].ask ||
                                1)) *
                            100
                          }%`,
                        }}
                      />
                    </span>

                    <span className="ad-muted ad-lead-sub">
                      {row.investor} · ask{" "}
                      {shortMoney(row.ask)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="ad-panel">
                <div className="ad-panel-head">
                  <div>
                    <span className="ad-section-code">
                      06 / MARKET MAP
                    </span>

                    <h2>
                      Business sectors
                    </h2>
                  </div>
                </div>

                {sectors.length === 0 && (
                  <p className="ad-empty">
                    No businesses yet.
                  </p>
                )}

                {sectors.map(
                  ([name, count]) => (
                    <div
                      key={name}
                      className="ad-sec"
                    >
                      <span>
                        {name}
                      </span>

                      <span className="ad-sec-bar">
                        <i
                          style={{
                            width: `${
                              (count /
                                sectors[0][1]) *
                              100
                            }%`,
                          }}
                        />
                      </span>

                      <b>{count}</b>
                    </div>
                  )
                )}
              </div>

              <div className="ad-panel">
                <div className="ad-panel-head">
                  <div>
                    <span className="ad-section-code">
                      07 / LIVE FEED
                    </span>

                    <h2>
                      Latest activity
                    </h2>
                  </div>
                </div>

                {recent.length === 0 && (
                  <p className="ad-empty">
                    Nothing yet.
                  </p>
                )}

                {recent.map((row) => (
                  <button
                    key={row.id}
                    className="ad-feed"
                    onClick={() =>
                      setSelectedId(row.id)
                    }
                  >
                    <i
                      style={{
                        background:
                          statusHex(
                            row.status
                          ),
                        boxShadow: `0 0 12px ${statusHex(
                          row.status
                        )}`,
                      }}
                    />

                    <span>
                      <b>
                        {row.business}
                      </b>{" "}
                      and{" "}
                      {row.investor}

                      <small className="ad-muted">
                        {row.status} ·{" "}
                        {fmtDate(row.date)}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "matchmaking" && (
          <section className="ad-panel">
            <div className="ad-panel-head">
              <div>
                <span className="ad-section-code">
                  08 / MATCH CONTROL
                </span>

                <h2>
                  Matchmaking requests
                </h2>
              </div>

              <span className="ad-muted">
                {filtered.length} active results
              </span>
            </div>

            <div className="ad-filters">
              <input
                className="ad-input ad-input-wide"
                placeholder="Search business, investor or ID"
                value={filters.q}
                onChange={(event) =>
                  setFilter(
                    "q",
                    event.target.value
                  )
                }
              />

              <select
                className="ad-input"
                value={filters.status}
                onChange={(event) =>
                  setFilter(
                    "status",
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All statuses
                </option>

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              <input
                className="ad-input ad-input-num"
                type="number"
                min="0"
                placeholder="Min ask"
                value={filters.min}
                onChange={(event) =>
                  setFilter(
                    "min",
                    event.target.value
                  )
                }
              />

              <input
                className="ad-input ad-input-num"
                type="number"
                min="0"
                placeholder="Max ask"
                value={filters.max}
                onChange={(event) =>
                  setFilter(
                    "max",
                    event.target.value
                  )
                }
              />

              <select
                className="ad-input"
                value={filters.sort}
                onChange={(event) =>
                  setFilter(
                    "sort",
                    event.target.value
                  )
                }
              >
                <option value="newest">
                  Newest first
                </option>

                <option value="oldest">
                  Oldest first
                </option>

                <option value="askHigh">
                  Highest ask
                </option>

                <option value="askLow">
                  Lowest ask
                </option>
              </select>

              {filtersActive && (
                <button
                  className="ad-btn ad-btn-small"
                  onClick={resetFilters}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="ad-summary">
              <span>
                <b>
                  {filtered.length}
                </b>{" "}
                of {rows.length} requests
              </span>

              <span>
                Total ask{" "}
                <b>
                  {money(filteredAsk)}
                </b>
              </span>

              <span>
                Recorded fees{" "}
                <b className="ad-accent">
                  {money(
                    filteredCommission
                  )}
                </b>
              </span>
            </div>

            <div className="ad-scroll">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Business</th>
                    <th>Investor</th>
                    <th className="ad-r">
                      Ask
                    </th>
                    <th className="ad-r">
                      Fee recorded
                    </th>
                    <th>Status</th>
                    <th>Requested</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="ad-row"
                      onClick={() =>
                        setSelectedId(
                          row.id
                        )
                      }
                    >
                      <td className="ad-muted">
                        #{row.id}
                      </td>

                      <td>
                        {row.business}
                      </td>

                      <td>
                        {row.investor}
                      </td>

                      <td className="ad-r">
                        {money(row.ask)}
                      </td>

                      <td className="ad-r ad-accent">
                        {money(
                          row.commission
                        )}
                      </td>

                      <td>
                        <select
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className={`ad-status ad-st-${row.status}`}
                          value={row.status}
                          disabled={
                            updatingId ===
                            row.id
                          }
                          onChange={(event) =>
                            setStatus(
                              row,
                              event.target.value
                            )
                          }
                        >
                          {statusUpdateOptions(row.status).map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="ad-muted">
                        {fmtDate(row.date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <p className="ad-empty">
                  {rows.length === 0
                    ? "No match requests yet."
                    : "No requests match these filters."}
                </p>
              )}
            </div>
          </section>
        )}

        {tab === "businesses" && (
          <section className="ad-panel">
            <div className="ad-panel-head">
              <div>
                <span className="ad-section-code">
                  09 / BUSINESS REGISTRY
                </span>

                <h2>
                  Registered businesses
                </h2>
              </div>

              <span className="ad-counter">
                {businesses.length}
              </span>
            </div>

            <div className="ad-scroll">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Business</th>
                    <th>Sector</th>
                    <th className="ad-r">
                      Ask
                    </th>
                    <th className="ad-r">
                      Fee terms
                    </th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {businesses.map(
                    (business) => {
                      const ask =
                        Number(
                          pick(
                            business,
                            ASK_KEYS,
                            0
                          )
                        ) || 0;

                      return (
                        <tr
                          key={business.id}
                        >
                          <td className="ad-muted">
                            #{business.id}
                          </td>

                          <td>
                            {pick(
                              business,
                              BUSINESS_NAME_KEYS,
                              "-"
                            )}
                          </td>

                          <td>
                            {pick(
                              business,
                              [
                                "sector",
                                "industry",
                                "category",
                              ],
                              "-"
                            )}
                          </td>

                          <td className="ad-r">
                            {money(ask)}
                          </td>

                          <td className="ad-r ad-accent">
                            TBC
                          </td>

                          <td className="ad-muted">
                            {fmtDate(
                              business.created_at ||
                                business.createdAt
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {businesses.length === 0 && (
                <p className="ad-empty">
                  No businesses registered yet.
                </p>
              )}
            </div>
          </section>
        )}

        {tab === "investors" && (
          <section className="ad-panel">
            <div className="ad-panel-head">
              <div>
                <span className="ad-section-code">
                  10 / INVESTOR REGISTRY
                </span>

                <h2>
                  Registered investors
                </h2>
              </div>

              <span className="ad-counter">
                {investors.length}
              </span>
            </div>

            <div className="ad-scroll">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Investor</th>
                    <th>Focus</th>
                    <th className="ad-r">
                      Ticket size
                    </th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {investors.map(
                    (investor) => {
                      const ticket =
                        pick(
                          investor,
                          [
                            "ticket_size",
                            "investment_range",
                            "max_investment",
                            "budget",
                            "investment_amount",
                          ]
                        );

                      return (
                        <tr
                          key={investor.id}
                        >
                          <td className="ad-muted">
                            #{investor.id}
                          </td>

                          <td>
                            {pick(
                              investor,
                              INVESTOR_NAME_KEYS,
                              "-"
                            )}
                          </td>

                          <td>
                            {pick(
                              investor,
                              [
                                "sector",
                                "focus",
                                "industry",
                                "investment_focus",
                                "preferred_sector",
                              ],
                              "-"
                            )}
                          </td>

                          <td className="ad-r">
                            {ticket !==
                              undefined &&
                            !isNaN(
                              Number(ticket)
                            )
                              ? money(ticket)
                              : ticket || "-"}
                          </td>

                          <td className="ad-muted">
                            {fmtDate(
                              investor.created_at ||
                                investor.createdAt
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {investors.length === 0 && (
                <p className="ad-empty">
                  No investors registered yet.
                </p>
              )}
            </div>
          </section>
        )}

        {selected && (
          <>
            <div
              className="ad-veil"
              onClick={() =>
                setSelectedId(null)
              }
            />

            <aside
              className="ad-drawer"
              role="dialog"
              aria-label="Match details"
            >
              <div className="ad-drawer-top">
                <div>
                  <span className="ad-section-code">
                    MATCH DETAILS
                  </span>

                  <p className="ad-d-id">
                    MATCH #{selected.id}
                  </p>
                </div>

                <button
                  className="ad-close"
                  onClick={() =>
                    setSelectedId(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="ad-d-status-line">
                <span
                  className="ad-live-dot"
                  style={{
                    background:
                      statusHex(
                        selected.status
                      ),
                    boxShadow: `0 0 12px ${statusHex(
                      selected.status
                    )}`,
                  }}
                />

                {selected.status}
              </div>

              <h2 className="ad-d-title">
                {selected.business}
              </h2>

              <p className="ad-muted">
                is seeking funding from{" "}
                <strong className="ad-white">
                  {selected.investor}
                </strong>
              </p>

              <div className="ad-ledger">
                <div>
                  <span>
                    Funding ask
                  </span>

                  <b>
                    {money(
                      selected.ask
                    )}
                  </b>
                </div>

                <div>
                  <span>Fee status</span>
                  <b>{selected.feeStatus || "not recorded"}</b>
                </div>

                <div className="ad-ledger-total">
                  <span>
                    Fee amount recorded
                  </span>

                  <b>
                    {money(
                      selected.commission
                    )}
                  </b>
                </div>
              </div>

              <p className="ad-d-label">
                MOVE MATCH TO
              </p>

              <div className="ad-d-status">
                {statusUpdateOptions(selected.status).map(
                  (status) => (
                    <button
                      key={status}
                      disabled={
                        updatingId ===
                        selected.id
                      }
                      className={
                        status ===
                        selected.status
                          ? `ad-chip ad-chip-on ad-st-${status}`
                          : `ad-chip ad-st-${status}`
                      }
                      onClick={() =>
                        setStatus(
                          selected,
                          status
                        )
                      }
                    >
                      {status}
                    </button>
                  )
                )}
              </div>

              <div className="ad-drawer-footer">
                <span>
                  REQUESTED
                </span>

                <strong>
                  {fmtDate(
                    selected.date
                  )}
                </strong>
              </div>
            </aside>
          </>
        )}

        {toast && (
          <div
            className="ad-toast"
            role="status"
          >
            <span className="ad-toast-dot" />
            {toast}
          </div>
        )}

        <footer className="ad-footer">
          <span>
            INVESTOR MTAANI
            <b> / </b>
            CAPITAL INTELLIGENCE
          </span>

          <span>
            SYSTEM 01 · ADMIN CONTROL
          </span>
        </footer>
      </main>
    </>
  );
}

function TrendChart({ series }) {
  const [hover, setHover] =
    useState(null);

  if (!series.length) {
    return (
      <p className="ad-empty">
        The growth curve appears once
        matches are created.
      </p>
    );
  }

  const W = 640;
  const H = 250;
  const L = 56;
  const R = 18;
  const T = 18;
  const B = 32;

  const max = Math.max(
    1,
    ...series.map(
      (item) => item.projected
    )
  );

  const x = (index) =>
    L +
    (series.length === 1
      ? (W - L - R) / 2
      : (index /
          (series.length - 1)) *
        (W - L - R));

  const y = (value) =>
    T +
    (1 - value / max) *
      (H - T - B);

  const line = (key) =>
    series
      .map(
        (item, index) =>
          `${index ? "L" : "M"}${x(
            index
          )},${y(item[key])}`
      )
      .join(" ");

  const area = (key) =>
    `${line(key)}
     L${x(series.length - 1)},${H - B}
     L${x(0)},${H - B} Z`;

  const current =
    hover !== null
      ? series[hover]
      : null;

  return (
    <svg
      className="ad-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Cumulative recorded fee amounts over time"
    >
      <defs>
        <linearGradient
          id="adA"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#9d7cff"
            stopOpacity=".45"
          />

          <stop
            offset="1"
            stopColor="#9d7cff"
            stopOpacity="0"
          />
        </linearGradient>

        <linearGradient
          id="adB"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#3dd6f5"
            stopOpacity=".55"
          />

          <stop
            offset="1"
            stopColor="#3dd6f5"
            stopOpacity="0"
          />
        </linearGradient>

        <filter id="adG">
          <feGaussianBlur
            stdDeviation="3"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map(
        (tick) => (
          <g key={tick}>
            <line
              x1={L}
              x2={W - R}
              y1={y(max * tick)}
              y2={y(max * tick)}
              stroke="rgba(61,214,245,.12)"
              strokeDasharray="3 5"
            />

            <text
              x={L - 8}
              y={y(max * tick) + 4}
              textAnchor="end"
              className="ad-ax"
            >
              {shortMoney(
                max * tick
              )}
            </text>
          </g>
        )
      )}

      <path
        d={area("projected")}
        fill="url(#adA)"
      />

      <path
        d={area("earned")}
        fill="url(#adB)"
      />

      <path
        d={line("projected")}
        fill="none"
        stroke="#9d7cff"
        strokeWidth="2.5"
        filter="url(#adG)"
      />

      <path
        d={line("earned")}
        fill="none"
        stroke="#3dd6f5"
        strokeWidth="2.5"
        filter="url(#adG)"
      />

      {series.map(
        (item, index) => (
          <g key={index}>
            <text
              x={x(index)}
              y={H - 10}
              textAnchor="middle"
              className="ad-ax"
            >
              {item.label}
            </text>

            <rect
              x={x(index) - 20}
              y={T}
              width="40"
              height={H - T - B}
              fill="transparent"
              onMouseEnter={() =>
                setHover(index)
              }
              onMouseLeave={() =>
                setHover(null)
              }
            />
          </g>
        )
      )}

      {current && (
        <g pointerEvents="none">
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={T}
            y2={H - B}
            stroke="rgba(255,255,255,.3)"
          />

          <circle
            cx={x(hover)}
            cy={y(current.projected)}
            r="5"
            fill="#9d7cff"
          />

          <circle
            cx={x(hover)}
            cy={y(current.earned)}
            r="5"
            fill="#3dd6f5"
          />

          <g
            transform={`translate(${Math.min(
              x(hover) + 12,
              W - 170
            )},${T + 4})`}
          >
            <rect
              width="158"
              height="56"
              rx="4"
              fill="#050a16"
              stroke="rgba(61,214,245,.5)"
            />

            <text
              x="10"
              y="21"
              className="ad-tt"
            >
              Projected{" "}
              {shortMoney(
                current.projected
              )}
            </text>

            <text
              x="10"
              y="43"
              className="ad-tt"
              fill="#3dd6f5"
            >
              Earned{" "}
              {shortMoney(
                current.earned
              )}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

function Donut({ counts, total }) {
  const entries =
    Object.entries(counts);

  if (!total) {
    return (
      <p className="ad-empty">
        No requests yet.
      </p>
    );
  }

  const radius = 62;
  const circumference =
    2 * Math.PI * radius;

  let offset = 0;

  const closed = entries
    .filter(([key]) =>
      CLOSED_STATUSES.includes(key)
    )
    .reduce(
      (sum, [, count]) =>
        sum + count,
      0
    );

  return (
    <div className="ad-donut">
      <svg
        viewBox="0 0 160 160"
        role="img"
        aria-label="Requests by status"
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(61,214,245,.08)"
          strokeWidth="16"
        />

        {entries.map(
          ([status, count]) => {
            const length =
              (count / total) *
              circumference;

            const element = (
              <circle
                key={status}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={statusHex(
                  status
                )}
                strokeWidth="16"
                strokeDasharray={`${Math.max(
                  length - 2,
                  0
                )} ${
                  circumference -
                  Math.max(
                    length - 2,
                    0
                  )
                }`}
                strokeDashoffset={
                  -offset
                }
                transform="rotate(-90 80 80)"
                style={{
                  filter: `drop-shadow(0 0 5px ${statusHex(
                    status
                  )})`,
                }}
              />
            );

            offset += length;

            return element;
          }
        )}

        <text
          x="80"
          y="78"
          textAnchor="middle"
          className="ad-dn"
        >
          {Math.round(
            (closed / total) *
              100
          )}
          %
        </text>

        <text
          x="80"
          y="98"
          textAnchor="middle"
          className="ad-ax"
        >
          CLOSED
        </text>
      </svg>

      <ul className="ad-dl">
        {entries.map(
          ([status, count]) => (
            <li key={status}>
              <i
                style={{
                  background:
                    statusHex(status),
                  boxShadow: `0 0 8px ${statusHex(
                    status
                  )}`,
                }}
              />

              {status}

              <b>{count}</b>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function Network({ rows, onPick }) {
  const [hot, setHot] =
    useState(null);

  const graph = useMemo(() => {
    const top = (key) => {
      const map = {};

      rows.forEach((row) => {
        map[row[key]] =
          (map[row[key]] || 0) +
          row.ask;
      });

      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name]) => name);
    };

    const businesses =
      top("business");

    const investors =
      top("investor");

    const edges = rows.filter(
      (row) =>
        businesses.includes(
          row.business
        ) &&
        investors.includes(
          row.investor
        )
    );

    return {
      businesses,
      investors,
      edges,
    };
  }, [rows]);

  if (!graph.edges.length) {
    return (
      <p className="ad-empty">
        Connections appear here as
        businesses and investors are
        matched.
      </p>
    );
  }

  const W = 760;

  const nodeCount = Math.max(
    graph.businesses.length,
    graph.investors.length
  );

  const H = Math.max(
    260,
    nodeCount * 46 + 40
  );

  const position = (
    index,
    length
  ) =>
    34 +
    (length <= 1
      ? (H - 68) / 2
      : (index * (H - 68)) /
        (length - 1));

  const LX = 210;
  const RX = W - 210;

  const maxAsk = Math.max(
    1,
    ...graph.edges.map(
      (edge) => edge.ask
    )
  );

  const activeEdge = (edge) =>
    !hot ||
    (hot.side === "business"
      ? edge.business === hot.name
      : edge.investor === hot.name);

  return (
    <div className="ad-scroll">
      <svg
        className="ad-svg ad-net"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Network of businesses and investors"
      >
        <defs>
          <filter id="adN">
            <feGaussianBlur
              stdDeviation="2.5"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {graph.edges.map(
          (edge) => {
            const y1 = position(
              graph.businesses.indexOf(
                edge.business
              ),
              graph.businesses.length
            );

            const y2 = position(
              graph.investors.indexOf(
                edge.investor
              ),
              graph.investors.length
            );

            return (
              <path
                key={edge.id}
                d={`M${LX},${y1} C${W / 2},${y1} ${
                  W / 2
                },${y2} ${RX},${y2}`}
                fill="none"
                stroke={statusHex(
                  edge.status
                )}
                strokeWidth={
                  1.2 +
                  (edge.ask /
                    maxAsk) *
                    4.5
                }
                opacity={
                  activeEdge(edge)
                    ? 0.85
                    : 0.08
                }
                className="ad-edge"
                onClick={() =>
                  onPick(edge.id)
                }
                filter={
                  activeEdge(edge) &&
                  hot
                    ? "url(#adN)"
                    : undefined
                }
              />
            );
          }
        )}

        <circle
          cx={W / 2}
          cy={H / 2}
          r="32"
          fill="#050a16"
          stroke="#ffbd4a"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />

        <circle
          cx={W / 2}
          cy={H / 2}
          r="24"
          fill="none"
          stroke="rgba(255,189,74,.2)"
        />

        <text
          x={W / 2}
          y={H / 2 + 6}
          textAnchor="middle"
          className="ad-hub"
        >
          TBC
        </text>

        {graph.businesses.map(
          (name, index) => (
            <g
              key={name}
              className="ad-node"
              onMouseEnter={() =>
                setHot({
                  side: "business",
                  name,
                })
              }
              onMouseLeave={() =>
                setHot(null)
              }
            >
              <circle
                cx={LX}
                cy={position(
                  index,
                  graph.businesses
                    .length
                )}
                r="7"
                fill="#3dd6f5"
                filter="url(#adN)"
              />

              <circle
                cx={LX}
                cy={position(
                  index,
                  graph.businesses
                    .length
                )}
                r="13"
                fill="none"
                stroke="rgba(61,214,245,.2)"
              />

              <text
                x={LX - 18}
                y={
                  position(
                    index,
                    graph.businesses
                      .length
                  ) + 4
                }
                textAnchor="end"
                className="ad-nl"
              >
                {cut(name)}
              </text>
            </g>
          )
        )}

        {graph.investors.map(
          (name, index) => (
            <g
              key={name}
              className="ad-node"
              onMouseEnter={() =>
                setHot({
                  side: "investor",
                  name,
                })
              }
              onMouseLeave={() =>
                setHot(null)
              }
            >
              <circle
                cx={RX}
                cy={position(
                  index,
                  graph.investors
                    .length
                )}
                r="7"
                fill="#a78bfa"
                filter="url(#adN)"
              />

              <circle
                cx={RX}
                cy={position(
                  index,
                  graph.investors
                    .length
                )}
                r="13"
                fill="none"
                stroke="rgba(167,139,250,.2)"
              />

              <text
                x={RX + 18}
                y={
                  position(
                    index,
                    graph.investors
                      .length
                  ) + 4
                }
                className="ad-nl"
              >
                {cut(name)}
              </text>
            </g>
          )
        )}

        <text
          x={LX}
          y="14"
          textAnchor="middle"
          className="ad-ax"
        >
          BUSINESS NETWORK
        </text>

        <text
          x={RX}
          y="14"
          textAnchor="middle"
          className="ad-ax"
        >
          INVESTOR NETWORK
        </text>
      </svg>
    </div>
  );
}

function useCountUp(
  target,
  duration = 1000
) {
  const [value, setValue] =
    useState(0);

  useEffect(() => {
    const end = Number(target) || 0;

    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      const frame = requestAnimationFrame(() => setValue(end));
      return () => cancelAnimationFrame(frame);
    }

    let animationFrame;
    let start;

    const tick = (time) => {
      start = start ?? time;

      const progress = Math.min(
        (time - start) /
          duration,
        1
      );

      setValue(
        end *
          (1 -
            Math.pow(
              1 - progress,
              3
            ))
      );

      if (progress < 1) {
        animationFrame =
          requestAnimationFrame(
            tick
          );
      }
    };

    animationFrame =
      requestAnimationFrame(tick);

    return () =>
      cancelAnimationFrame(
        animationFrame
      );
  }, [target, duration]);

  return value;
}

function Stat({
  label,
  value,
  accent,
  icon,
}) {
  const number = useCountUp(
    typeof value === "number"
      ? value
      : 0
  );

  return (
    <div
      className={`ad-stat ad-stat-${accent}`}
    >
      <div className="ad-stat-glow" />

      <div className="ad-stat-top">
        <span>
          {label}
        </span>

        <strong>
          {icon}
        </strong>
      </div>

      <p className="ad-stat-value">
        {typeof value === "number"
          ? Math.round(number).toLocaleString()
          : value}
      </p>

      <div className="ad-stat-line">
        <i />
      </div>

      <p className="ad-stat-label">
        PLATFORM METRIC
      </p>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

      @property --ad-angle {
        syntax: "<angle>";
        initial-value: 0deg;
        inherits: false;
      }

      :root {
        color-scheme: dark;
      }

      .ad-page {
        --void: #02050b;
        --void2: #050b16;
        --glass: rgba(10, 20, 38, .72);
        --glass2: rgba(8, 15, 29, .9);
        --line: rgba(61, 214, 245, .17);

        --cyan: #3dd6f5;
        --cyan-soft: #8eeeff;
        --violet: #a78bfa;
        --green: #38ffb3;
        --amber: #ffbd4a;
        --red: #ff5570;

        --text: #edf7ff;
        --muted: #7f93ad;

        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        padding: 32px clamp(16px, 4vw, 56px) 70px;

        background:
          radial-gradient(
            70% 50% at 90% -10%,
            rgba(167, 139, 250, .18),
            transparent 70%
          ),
          radial-gradient(
            65% 50% at 0% 10%,
            rgba(61, 214, 245, .12),
            transparent 70%
          ),
          radial-gradient(
            60% 45% at 50% 110%,
            rgba(56, 255, 179, .06),
            transparent 70%
          ),
          var(--void);

        color: var(--text);
        font-family:
          "Space Grotesk",
          system-ui,
          sans-serif;
      }

      .ad-page * {
        box-sizing: border-box;
      }

      .ad-page button,
      .ad-page input,
      .ad-page select {
        font-family: inherit;
      }

      .ad-page::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: .5;

        background:
          radial-gradient(
            circle at 50% 50%,
            transparent 0,
            rgba(61, 214, 245, .025) 45%,
            transparent 75%
          );
      }

      .ad-page::after {
        content: "";
        position: fixed;
        left: 0;
        right: 0;
        top: -100px;
        height: 100px;
        pointer-events: none;
        z-index: 20;

        background:
          linear-gradient(
            180deg,
            transparent,
            rgba(61, 214, 245, .08),
            transparent
          );

        animation: ad-scan 10s linear infinite;
      }

      @keyframes ad-scan {
        from {
          transform: translateY(-100px);
        }

        to {
          transform: translateY(110vh);
        }
      }

      .ad-grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: .65;

        background-image:
          linear-gradient(
            rgba(61, 214, 245, .045) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(61, 214, 245, .045) 1px,
            transparent 1px
          );

        background-size: 48px 48px;

        -webkit-mask-image:
          linear-gradient(
            black 0%,
            black 40%,
            transparent 90%
          );

        mask-image:
          linear-gradient(
            black 0%,
            black 40%,
            transparent 90%
          );
      }

      .ad-page > *:not(.ad-grid) {
        position: relative;
        z-index: 1;
      }

      .ad-page > .ad-toast {
        position: fixed;
      }

      /* HEADER */

      .ad-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 30px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .ad-brand-block {
        max-width: 850px;
      }

      .ad-brand-line {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;

        color: #a8bad0;

        font:
          600 11px
          "JetBrains Mono",
          monospace;

        letter-spacing: 2px;
      }

      .ad-brand-mark {
        display: grid;
        place-items: center;

        width: 31px;
        height: 31px;

        color: #02050b;

        font:
          800 11px
          "Space Grotesk",
          sans-serif;

        background:
          linear-gradient(
            135deg,
            var(--cyan),
            var(--violet)
          );

        box-shadow:
          0 0 20px
            rgba(61, 214, 245, .4);
      }

      .ad-brand-separator {
        color: #33445b;
      }

      .ad-control-text {
        color: var(--cyan);
      }

      .ad-kicker {
        display: flex;
        align-items: center;
        gap: 9px;

        margin: 0 0 10px;

        color: var(--green);

        font:
          600 11px
          "JetBrains Mono",
          monospace;

        letter-spacing: 2px;
      }

      .ad-dot,
      .ad-live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--green);

        box-shadow:
          0 0 10px var(--green),
          0 0 22px var(--green);

        animation: ad-pulse 2s infinite;
      }

      @keyframes ad-pulse {
        50% {
          opacity: .35;
        }
      }

      .ad-title {
        margin: 0;

        font-size:
          clamp(32px, 5vw, 58px);

        line-height: .98;

        letter-spacing: -2.5px;

        font-weight: 700;

        background:
          linear-gradient(
            105deg,
            #fff 15%,
            #d9f8ff 45%,
            var(--cyan) 68%,
            var(--violet)
          );

        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;

        filter:
          drop-shadow(
            0 0 25px
            rgba(61, 214, 245, .12)
          );
      }

      .ad-title span {
        color: var(--cyan);
      }

      .ad-sub {
        max-width: 66ch;
        margin: 13px 0 0;

        color: var(--muted);

        font-size: 14px;
        line-height: 1.7;
      }

      .ad-head-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ad-admin-badge {
        display: flex;
        align-items: center;
        gap: 11px;

        padding: 9px 13px;

        border:
          1px solid
          rgba(56, 255, 179, .2);

        background:
          rgba(56, 255, 179, .045);

        color: var(--green);

        font:
          600 11px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1px;
      }

      .ad-admin-badge span:last-child {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .ad-admin-badge small {
        color: var(--muted);
        font-size: 8px;
        letter-spacing: 1.5px;
      }

      .ad-live-ring {
        width: 9px;
        height: 9px;

        border: 1px solid var(--green);
        border-radius: 50%;

        box-shadow:
          0 0 0 4px
            rgba(56, 255, 179, .08),
          0 0 14px
            rgba(56, 255, 179, .7);
      }

      .ad-command-strip {
        display: flex;
        gap: 25px;
        flex-wrap: wrap;

        margin-bottom: 25px;
        padding: 10px 14px;

        border-top:
          1px solid
          rgba(61, 214, 245, .1);

        border-bottom:
          1px solid
          rgba(61, 214, 245, .1);

        color: #61758f;

        font:
          500 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.4px;
      }

      .ad-command-strip b {
        color: #a1b6ce;
      }

      .ad-command-live {
        margin-left: auto;
        color: var(--green);
        text-shadow:
          0 0 10px
          rgba(56, 255, 179, .45);
      }

      /* BUTTONS */

      .ad-btn {
        padding: 11px 18px;

        color: var(--cyan);

        background:
          rgba(61, 214, 245, .05);

        border:
          1px solid
          rgba(61, 214, 245, .5);

        font:
          600 11px
          "JetBrains Mono",
          monospace;

        letter-spacing: .4px;

        cursor: pointer;

        transition:
          .2s ease;

        clip-path:
          polygon(
            8px 0,
            100% 0,
            100% calc(100% - 8px),
            calc(100% - 8px) 100%,
            0 100%,
            0 8px
          );
      }

      .ad-btn:hover:not(:disabled) {
        color: white;

        background:
          rgba(61, 214, 245, .13);

        border-color: var(--cyan);

        box-shadow:
          0 0 25px
            rgba(61, 214, 245, .2);
      }

      .ad-btn:disabled {
        opacity: .5;
        cursor: wait;
      }

      .ad-btn-icon {
        margin-right: 7px;
        font-size: 15px;
      }

      .ad-btn-small {
        padding: 10px 14px;
      }

      .ad-btn:focus-visible,
      .ad-input:focus-visible,
      .ad-tab:focus-visible,
      .ad-seg:focus-visible,
      .ad-status:focus-visible {
        outline:
          2px solid
          var(--cyan);

        outline-offset: 3px;
      }

      /* ALERT */

      .ad-alert {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;

        margin-bottom: 22px;
        padding: 13px 17px;

        border-left:
          3px solid
          var(--red);

        border-top:
          1px solid
          rgba(255, 85, 112, .2);

        border-right:
          1px solid
          rgba(255, 85, 112, .2);

        border-bottom:
          1px solid
          rgba(255, 85, 112, .2);

        background:
          rgba(255, 85, 112, .06);

        color: #ff9baa;

        font-size: 13px;
      }

      .ad-alert strong {
        color: var(--red);

        font:
          700 10px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1px;
      }

      /* HERO */

      .ad-hero {
        display: grid;
        grid-template-columns: 1.45fr 1fr;
        gap: 1px;

        position: relative;

        margin-bottom: 16px;
        padding: 1px;

        overflow: hidden;

        background:
          conic-gradient(
            from var(--ad-angle),
            var(--cyan),
            var(--violet),
            var(--amber),
            var(--green),
            var(--cyan)
          );

        animation:
          ad-border-spin 9s linear infinite;

        box-shadow:
          0 0 80px
            rgba(61, 214, 245, .09);
      }

      @keyframes ad-border-spin {
        to {
          --ad-angle: 360deg;
        }
      }

      .ad-hero > div {
        position: relative;
        overflow: hidden;

        min-height: 265px;

        padding:
          clamp(25px, 4vw, 40px);

        background:
          linear-gradient(
            135deg,
            #0c1930,
            #050a15 70%
          );
      }

      .ad-hero-main {
        border-right:
          1px solid
          rgba(61, 214, 245, .08);
      }

      .ad-hero-main::before {
        content: "";
        position: absolute;
        width: 280px;
        height: 280px;

        right: -80px;
        top: -100px;

        border-radius: 50%;

        background:
          radial-gradient(
            circle,
            rgba(61, 214, 245, .16),
            transparent 68%
          );
      }

      .ad-hero-main::after {
        content: "";
        position: absolute;

        inset: 0;

        pointer-events: none;

        background:
          linear-gradient(
            90deg,
            transparent 49%,
            rgba(61, 214, 245, .035) 50%,
            transparent 51%
          );

        background-size: 34px 34px;

        opacity: .4;
      }

      .ad-hero-orbit {
        position: absolute;

        width: 190px;
        height: 190px;

        right: 40px;
        top: 40px;

        border:
          1px solid
          rgba(61, 214, 245, .09);

        border-radius: 50%;

        pointer-events: none;
      }

      .orbit-one {
        transform:
          rotateX(65deg)
          rotateZ(15deg);
      }

      .orbit-two {
        transform:
          rotateY(65deg)
          rotateZ(-25deg);

        border-color:
          rgba(167, 139, 250, .09);
      }

      .ad-hero-label {
        position: relative;
        z-index: 2;

        margin: 0 0 6px;

        color: var(--cyan);

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        letter-spacing: 2px;
      }

      .ad-hero-caption {
        position: relative;
        z-index: 2;

        margin: 0 0 13px;

        color: var(--muted);

        font:
          500 10px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.5px;
      }

      .ad-hero-value {
        position: relative;
        z-index: 2;

        margin: 0;

        font:
          700
          clamp(42px, 7vw, 76px) /
          1
          "Space Grotesk",
          sans-serif;

        letter-spacing: -3px;

        font-variant-numeric:
          tabular-nums;

        background:
          linear-gradient(
            100deg,
            white,
            var(--cyan) 58%,
            var(--violet)
          );

        -webkit-background-clip: text;
        background-clip: text;

        color: transparent;

        filter:
          drop-shadow(
            0 0 25px
            rgba(61, 214, 245, .35)
          );
      }

      .ad-hero-meta {
        position: relative;
        z-index: 2;

        display: flex;
        align-items: center;
        gap: 9px;

        margin-top: 17px;

        color: #b5c9df;

        font:
          500 11px
          "JetBrains Mono",
          monospace;
      }

      .ad-meta-divider {
        color: #3c5068;
      }

      .ad-hero-note {
        position: relative;
        z-index: 2;

        margin: 11px 0 0;

        color: var(--muted);

        font-size: 12px;
      }

      .ad-hero-note strong {
        color: white;
      }

      .ad-hero-side {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 20px;
      }

      .ad-hero-mid {
        margin: 0;

        color: var(--violet);

        font:
          700
          clamp(26px, 3.4vw, 39px) /
          1.1
          "Space Grotesk",
          sans-serif;

        letter-spacing: -1.5px;

        text-shadow:
          0 0 25px
          rgba(167, 139, 250, .4);
      }

      .ad-pipeline-number {
        display: flex;
        flex-direction: column;
        gap: 3px;

        margin-top: 35px;

        color: #c5d5e8;

        font:
          600 16px
          "JetBrains Mono",
          monospace;
      }

      .ad-pipeline-number span {
        color: var(--muted);
        font-size: 9px;
        letter-spacing: 1.5px;
      }

      .ad-rate {
        position: relative;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 116px;
        height: 116px;

        flex: 0 0 auto;

        color: var(--amber);

        border-radius: 50%;

        background:
          radial-gradient(
            circle,
            rgba(255, 189, 74, .13),
            transparent 68%
          );

        box-shadow:
          inset 0 0 35px
            rgba(255, 189, 74, .04);
      }

      .ad-rate::before {
        content: "";

        position: absolute;
        inset: 0;

        border:
          1px dashed
          var(--amber);

        border-radius: 50%;

        animation:
          ad-rot 16s linear infinite;
      }

      .ad-rate::after {
        content: "";

        position: absolute;
        inset: 9px;

        border:
          1px solid
          rgba(255, 189, 74, .25);

        border-radius: 50%;
      }

      @keyframes ad-rot {
        to {
          transform: rotate(360deg);
        }
      }

      .ad-rate span {
        font:
          700 30px
          "Space Grotesk",
          sans-serif;

        text-shadow:
          0 0 18px
          rgba(255, 189, 74, .7);
      }

      .ad-rate small {
        color: var(--muted);
        font-size: 8px;
        letter-spacing: 1.5px;
      }

      /* STATS */

      .ad-stats {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);

        gap: 12px;

        margin-bottom: 22px;
      }

      .ad-stat,
      .ad-panel {
        position: relative;

        background:
          linear-gradient(
            145deg,
            rgba(13, 25, 46, .82),
            rgba(5, 10, 20, .82)
          );

        border:
          1px solid
          var(--line);

        box-shadow:
          inset 0 1px 0
            rgba(255, 255, 255, .025),
          0 15px 50px
            rgba(0, 0, 0, .18);

        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
      }

      .ad-stat {
        min-height: 150px;

        padding: 19px 20px;

        overflow: hidden;

        transition:
          transform .25s ease,
          border-color .25s ease,
          box-shadow .25s ease;
      }

      .ad-stat:hover {
        transform:
          translateY(-4px);

        border-color:
          rgba(61, 214, 245, .4);

        box-shadow:
          0 20px 55px
            rgba(0, 0, 0, .3),
          0 0 30px
            rgba(61, 214, 245, .06);
      }

      .ad-stat::before,
      .ad-panel::before {
        content: "";

        position: absolute;

        width: 15px;
        height: 15px;

        left: -1px;
        top: -1px;

        border-left:
          2px solid
          var(--cyan);

        border-top:
          2px solid
          var(--cyan);

        pointer-events: none;
      }

      .ad-stat::after,
      .ad-panel::after {
        content: "";

        position: absolute;

        width: 15px;
        height: 15px;

        right: -1px;
        bottom: -1px;

        border-right:
          2px solid
          var(--cyan);

        border-bottom:
          2px solid
          var(--cyan);

        pointer-events: none;
      }

      .ad-stat-violet::before {
        border-color:
          var(--violet);
      }

      .ad-stat-violet::after {
        border-color:
          var(--violet);
      }

      .ad-stat-green::before {
        border-color:
          var(--green);
      }

      .ad-stat-green::after {
        border-color:
          var(--green);
      }

      .ad-stat-amber::before {
        border-color:
          var(--amber);
      }

      .ad-stat-amber::after {
        border-color:
          var(--amber);
      }

      .ad-stat-glow {
        position: absolute;

        width: 100px;
        height: 100px;

        right: -35px;
        top: -35px;

        border-radius: 50%;

        background:
          radial-gradient(
            circle,
            rgba(61, 214, 245, .13),
            transparent 70%
          );

        pointer-events: none;
      }

      .ad-stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;

        color: var(--muted);

        font:
          600 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.4px;
      }

      .ad-stat-top strong {
        color: var(--cyan);

        font-size: 17px;

        text-shadow:
          0 0 12px
          rgba(61, 214, 245, .65);
      }

      .ad-stat-violet .ad-stat-top strong {
        color: var(--violet);
      }

      .ad-stat-green .ad-stat-top strong {
        color: var(--green);
      }

      .ad-stat-amber .ad-stat-top strong {
        color: var(--amber);
      }

      .ad-stat-value {
        margin: 24px 0 12px;

        font:
          700 34px /
          1
          "Space Grotesk",
          sans-serif;

        letter-spacing: -1.5px;

        font-variant-numeric:
          tabular-nums;
      }

      .ad-stat-line {
        height: 2px;

        width: 100%;

        background:
          rgba(61, 214, 245, .08);

        overflow: hidden;
      }

      .ad-stat-line i {
        display: block;

        width: 38%;
        height: 100%;

        background:
          linear-gradient(
            90deg,
            var(--cyan),
            transparent
          );

        box-shadow:
          0 0 10px
          var(--cyan);
      }

      .ad-stat-violet .ad-stat-line i {
        background:
          linear-gradient(
            90deg,
            var(--violet),
            transparent
          );
      }

      .ad-stat-green .ad-stat-line i {
        background:
          linear-gradient(
            90deg,
            var(--green),
            transparent
          );
      }

      .ad-stat-amber .ad-stat-line i {
        background:
          linear-gradient(
            90deg,
            var(--amber),
            transparent
          );
      }

      .ad-stat-label {
        margin: 9px 0 0;

        color: #566a83;

        font:
          600 8px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.4px;
      }

      /* PANELS */

      .ad-panel {
        margin-bottom: 18px;
        padding: 22px;
      }

      .ad-panel-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        gap: 15px;

        margin-bottom: 18px;
      }

      .ad-panel-head h2 {
        margin: 4px 0 0;

        font-size: 18px;
        letter-spacing: -.4px;
      }

      .ad-section-code {
        color: #536982;

        font:
          600 8px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.5px;
      }

      .ad-muted {
        color: var(--muted);
      }

      .ad-accent {
        color: var(--cyan);

        text-shadow:
          0 0 14px
          rgba(61, 214, 245, .4);
      }

      .ad-white {
        color: white;
      }

      .ad-counter {
        display: grid;
        place-items: center;

        min-width: 34px;
        height: 27px;

        color: var(--cyan);

        border:
          1px solid
          rgba(61, 214, 245, .3);

        background:
          rgba(61, 214, 245, .05);

        font:
          600 10px
          "JetBrains Mono",
          monospace;
      }

      /* PIPELINE */

      .ad-bar {
        display: flex;
        gap: 5px;

        height: 46px;
      }

      .ad-seg {
        min-width: 78px;

        padding: 0 13px;

        display: flex;
        align-items: center;
        justify-content: center;

        gap: 8px;

        color: var(--text);

        border: 1px solid
          rgba(127, 146, 173, .3);

        background:
          rgba(127, 146, 173, .08);

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        cursor: pointer;

        clip-path:
          polygon(
            8px 0,
            100% 0,
            calc(100% - 8px) 100%,
            0 100%
          );

        transition:
          .2s ease;
      }

      .ad-seg:hover {
        filter: brightness(1.3);
        transform: translateY(-2px);
      }

      .ad-seg.ad-st-pending {
        color: var(--amber);

        background:
          rgba(255, 189, 74, .09);

        border-color:
          rgba(255, 189, 74, .35);
      }

      .ad-seg.ad-st-approved,
      .ad-seg.ad-st-matched,
      .ad-seg.ad-st-accepted {
        color: var(--violet);

        background:
          rgba(167, 139, 250, .1);

        border-color:
          rgba(167, 139, 250, .35);
      }

      .ad-seg.ad-st-completed,
      .ad-seg.ad-st-closed,
      .ad-seg.ad-st-funded,
      .ad-seg.ad-st-successful {
        color: var(--green);

        background:
          rgba(56, 255, 179, .08);

        border-color:
          rgba(56, 255, 179, .35);
      }

      .ad-seg.ad-st-rejected,
      .ad-seg.ad-st-declined,
      .ad-seg.ad-st-cancelled {
        color: var(--red);

        background:
          rgba(255, 85, 112, .08);

        border-color:
          rgba(255, 85, 112, .35);
      }

      .ad-pipeline-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-top: 13px;

        color: #536982;

        font:
          600 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.2px;
      }

      .ad-pipeline-footer strong {
        color: var(--green);

        font-size: 12px;

        text-shadow:
          0 0 12px
          rgba(56, 255, 179, .5);
      }

      /* TABS */

      .ad-tabs {
        display: flex;
        gap: 7px;

        margin:
          4px 0 18px;

        flex-wrap: wrap;
      }

      .ad-tab {
        display: flex;
        align-items: center;
        gap: 9px;

        padding: 10px 16px;

        color: #71859d;

        background:
          rgba(9, 17, 32, .6);

        border:
          1px solid
          rgba(61, 214, 245, .12);

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        cursor: pointer;

        transition:
          .2s ease;

        clip-path:
          polygon(
            8px 0,
            100% 0,
            100% calc(100% - 8px),
            calc(100% - 8px) 100%,
            0 100%,
            0 8px
          );
      }

      .ad-tab:hover {
        color: white;
        border-color:
          rgba(61, 214, 245, .35);
      }

      .ad-tab-on {
        color: var(--cyan);

        background:
          rgba(61, 214, 245, .08);

        border-color:
          rgba(61, 214, 245, .4);

        box-shadow:
          inset 0 -2px 0
            var(--cyan),
          0 0 25px
            rgba(61, 214, 245, .06);
      }

      .ad-tab-index {
        color: #3c536e;
      }

      .ad-tab-on .ad-tab-index {
        color: var(--cyan);
      }

      /* BENTO */

      .ad-bento {
        display: grid;

        grid-template-columns:
          2fr 1fr;

        gap: 15px;

        margin-bottom: 18px;
      }

      .ad-bento3 {
        display: grid;

        grid-template-columns:
          repeat(3, 1fr);

        gap: 15px;

        margin-bottom: 18px;
      }

      .ad-bento .ad-panel,
      .ad-bento3 .ad-panel {
        margin-bottom: 0;
      }

      .ad-legend {
        display: flex;
        align-items: center;
        gap: 7px;

        color: var(--muted);

        font-size: 11px;
      }

      .ad-legend i {
        width: 17px;
        height: 2px;

        margin-left: 7px;

        border-radius: 2px;
      }

      .ad-lg-a {
        background: var(--violet);
        box-shadow:
          0 0 9px var(--violet);
      }

      .ad-lg-b {
        background: var(--cyan);
        box-shadow:
          0 0 9px var(--cyan);
      }

      .ad-svg {
        display: block;

        width: 100%;
        height: auto;
      }

      .ad-ax {
        fill: #647990;

        font:
          10px
          "JetBrains Mono",
          monospace;
      }

      .ad-tt {
        fill: #c8b7ff;

        font:
          600 11px
          "JetBrains Mono",
          monospace;
      }

      /* DONUT */

      .ad-donut {
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 12px;
      }

      .ad-donut svg {
        width: 185px;
        height: 185px;
      }

      .ad-dn {
        fill: white;

        font:
          700 29px
          "Space Grotesk",
          sans-serif;
      }

      .ad-dl {
        width: 100%;

        display: grid;
        gap: 7px;

        margin: 0;
        padding: 0;

        list-style: none;

        font-size: 12px;
      }

      .ad-dl li {
        display: flex;
        align-items: center;
        gap: 9px;

        color: var(--muted);
      }

      .ad-dl i {
        width: 7px;
        height: 7px;

        border-radius: 50%;
      }

      .ad-dl b {
        margin-left: auto;
        color: white;
      }

      /* NETWORK */

      .ad-net {
        min-width: 640px;
      }

      .ad-nl {
        fill: #dcecff;

        font:
          500 12px
          "Space Grotesk",
          sans-serif;
      }

      .ad-node {
        cursor: pointer;
      }

      .ad-hub {
        fill: var(--amber);

        font:
          700 17px
          "Space Grotesk",
          sans-serif;

        text-shadow:
          0 0 15px
          rgba(255, 189, 74, .7);
      }

      .ad-edge {
        cursor: pointer;
        stroke-linecap: round;

        transition:
          opacity .25s,
          stroke-width .25s;
      }

      /* LISTS */

      .ad-lead,
      .ad-feed {
        display: block;

        width: 100%;

        padding: 12px 5px;

        text-align: left;

        color: var(--text);

        background: transparent;

        border: 0;
        border-bottom:
          1px solid
          rgba(61, 214, 245, .07);

        font: inherit;

        cursor: pointer;

        transition:
          .2s ease;
      }

      .ad-lead:hover,
      .ad-feed:hover {
        background:
          rgba(61, 214, 245, .045);

        padding-left: 10px;
      }

      .ad-lead-top {
        display: flex;
        justify-content: space-between;
        gap: 10px;

        font-size: 13px;
      }

      .ad-lead-bar,
      .ad-sec-bar {
        display: block;

        height: 4px;

        margin: 8px 0 6px;

        overflow: hidden;

        background:
          rgba(61, 214, 245, .08);

        border-radius: 3px;
      }

      .ad-lead-bar i,
      .ad-sec-bar i {
        display: block;

        height: 100%;

        background:
          linear-gradient(
            90deg,
            var(--cyan),
            var(--violet)
          );

        box-shadow:
          0 0 12px
          var(--cyan);
      }

      .ad-lead-sub {
        font-size: 11px;
      }

      .ad-sec {
        display: grid;

        grid-template-columns:
          minmax(80px, 1fr)
          2fr
          auto;

        align-items: center;

        gap: 12px;

        padding: 9px 0;

        font-size: 13px;
      }

      .ad-sec-bar {
        margin: 0;
      }

      .ad-feed {
        display: flex;
        align-items: flex-start;
        gap: 11px;

        font-size: 13px;
      }

      .ad-feed i {
        width: 7px;
        height: 7px;

        margin-top: 6px;

        border-radius: 50%;

        flex: 0 0 auto;
      }

      .ad-feed small {
        display: block;

        margin-top: 3px;

        font-size: 10px;
      }

      .ad-empty {
        padding: 35px 12px;

        text-align: center;

        color: var(--muted);

        font-size: 13px;
      }

      /* FILTERS */

      .ad-filters {
        display: flex;

        gap: 8px;

        flex-wrap: wrap;

        margin-bottom: 15px;
      }

      .ad-input {
        min-width: 0;

        padding: 10px 12px;

        color: var(--text);

        background:
          rgba(2, 7, 15, .75);

        border:
          1px solid
          rgba(61, 214, 245, .16);

        border-radius: 2px;

        font-size: 12px;

        transition:
          .2s ease;
      }

      .ad-input:hover {
        border-color:
          rgba(61, 214, 245, .35);
      }

      .ad-input:focus {
        outline: none;

        border-color:
          var(--cyan);

        box-shadow:
          0 0 0 3px
            rgba(61, 214, 245, .08),
          0 0 20px
            rgba(61, 214, 245, .08);
      }

      .ad-input-wide {
        flex: 1 1 250px;
      }

      .ad-input-num {
        width: 115px;
      }

      .ad-summary {
        display: flex;

        gap: 25px;

        flex-wrap: wrap;

        margin-bottom: 14px;
        padding: 11px 14px;

        border-left:
          2px solid
          var(--cyan);

        background:
          rgba(61, 214, 245, .035);

        color: var(--muted);

        font-size: 12px;
      }

      .ad-summary b {
        color: white;
      }

      .ad-summary b.ad-accent {
        color: var(--cyan);
      }

      /* TABLE */

      .ad-scroll {
        overflow-x: auto;
      }

      .ad-table {
        width: 100%;

        min-width: 780px;

        border-collapse: collapse;

        font-size: 12px;
      }

      .ad-table th {
        padding: 12px;

        color: #62809e;

        text-align: left;

        border-bottom:
          1px solid
          rgba(61, 214, 245, .15);

        font:
          600 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1px;

        white-space: nowrap;
      }

      .ad-table td {
        padding: 14px 12px;

        border-bottom:
          1px solid
          rgba(61, 214, 245, .055);

        vertical-align: middle;
      }

      .ad-table tbody tr {
        transition:
          background .15s,
          box-shadow .15s;
      }

      .ad-table tbody tr:hover {
        background:
          linear-gradient(
            90deg,
            rgba(61, 214, 245, .08),
            transparent
          );

        box-shadow:
          inset 3px 0 0
            var(--cyan);
      }

      .ad-r {
        text-align: right !important;

        font-variant-numeric:
          tabular-nums;
      }

      .ad-row {
        cursor: pointer;
      }

      /* STATUS */

      .ad-status {
        padding: 6px 11px;

        border:
          1px solid
          currentColor;

        border-radius: 999px;

        color: var(--muted);

        background:
          rgba(2, 7, 15, .9);

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        cursor: pointer;

        box-shadow:
          0 0 14px -5px
          currentColor;
      }

      .ad-st-pending {
        color: var(--amber);
      }

      .ad-st-approved,
      .ad-st-matched,
      .ad-st-accepted {
        color: var(--violet);
      }

      .ad-st-completed,
      .ad-st-closed,
      .ad-st-funded,
      .ad-st-successful {
        color: var(--green);
      }

      .ad-st-rejected,
      .ad-st-declined,
      .ad-st-cancelled {
        color: var(--red);
      }

      /* DRAWER */

      .ad-veil {
        position: fixed !important;
        inset: 0;

        z-index: 60;

        background:
          rgba(1, 4, 9, .76);

        backdrop-filter:
          blur(6px);
      }

      .ad-drawer {
        position: fixed !important;

        top: 0;
        right: 0;
        bottom: 0;

        z-index: 61;

        width:
          min(450px, 100%);

        padding: 28px;

        overflow-y: auto;

        background:
          linear-gradient(
            155deg,
            #0d1c35,
            #040913 75%
          );

        border-left:
          1px solid
          var(--cyan);

        box-shadow:
          -30px 0 100px
            rgba(61, 214, 245, .12);

        animation:
          ad-drawer-in .3s
          cubic-bezier(.2,.8,.2,1);
      }

      @keyframes ad-drawer-in {
        from {
          transform:
            translateX(50px);
          opacity: 0;
        }
      }

      .ad-drawer-top {
        display: flex;

        justify-content: space-between;
        align-items: flex-start;
      }

      .ad-close {
        width: 36px;
        height: 36px;

        color: var(--muted);

        background:
          rgba(255,255,255,.03);

        border:
          1px solid
          rgba(255,255,255,.1);

        font-size: 23px;

        cursor: pointer;

        transition: .2s ease;
      }

      .ad-close:hover {
        color: white;

        border-color:
          var(--cyan);

        background:
          rgba(61,214,245,.08);
      }

      .ad-d-id {
        margin: 7px 0 0;

        color: #68809c;

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.5px;
      }

      .ad-d-status-line {
        display: inline-flex;
        align-items: center;
        gap: 8px;

        margin-top: 30px;

        padding: 6px 10px;

        color: #b5c7da;

        border:
          1px solid
          rgba(255,255,255,.08);

        background:
          rgba(255,255,255,.025);

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        text-transform: uppercase;
      }

      .ad-live-dot {
        width: 6px;
        height: 6px;

        animation: none;
      }

      .ad-d-title {
        margin:
          15px 0 7px;

        font-size: 29px;

        line-height: 1.05;

        letter-spacing: -1px;
      }

      .ad-ledger {
        margin: 28px 0;

        border:
          1px solid
          rgba(61,214,245,.13);

        background:
          rgba(2,7,15,.55);
      }

      .ad-ledger div {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 14px 16px;

        color: var(--muted);

        border-bottom:
          1px solid
          rgba(61,214,245,.08);

        font-size: 12px;
      }

      .ad-ledger b {
        color: white;

        font-variant-numeric:
          tabular-nums;
      }

      .ad-ledger-total {
        border-bottom: 0 !important;

        background:
          rgba(61,214,245,.07);
      }

      .ad-ledger-total b {
        color: var(--cyan);

        font-size: 21px;

        text-shadow:
          0 0 18px
          rgba(61,214,245,.55);
      }

      .ad-d-label {
        margin: 0 0 10px;

        color: #61768e;

        font:
          600 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.4px;
      }

      .ad-d-status {
        display: flex;

        flex-wrap: wrap;

        gap: 7px;

        margin-bottom: 25px;
      }

      .ad-chip {
        padding: 8px 12px;

        border:
          1px solid
          currentColor;

        border-radius: 999px;

        background:
          transparent;

        font:
          600 10px
          "JetBrains Mono",
          monospace;

        cursor: pointer;

        opacity: .55;

        transition:
          .2s ease;
      }

      .ad-chip:hover:not(:disabled) {
        opacity: 1;
        transform:
          translateY(-1px);
      }

      .ad-chip-on {
        opacity: 1;

        background:
          rgba(255,255,255,.07);

        box-shadow:
          0 0 17px -3px
          currentColor;
      }

      .ad-drawer-footer {
        display: flex;
        justify-content: space-between;

        padding-top: 18px;

        border-top:
          1px solid
          rgba(61,214,245,.1);

        color: #526880;

        font:
          600 9px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1px;
      }

      .ad-drawer-footer strong {
        color: #a9bdd3;
      }

      /* TOAST */

      .ad-toast {
        right: 25px;
        bottom: 25px;

        z-index: 70;

        display: flex;
        align-items: center;
        gap: 10px;

        padding: 13px 18px;

        color: white;

        border:
          1px solid
          rgba(61,214,245,.5);

        background:
          rgba(4,10,21,.94);

        box-shadow:
          0 0 40px
            rgba(61,214,245,.2),
          0 15px 50px
            rgba(0,0,0,.5);

        font:
          500 11px
          "JetBrains Mono",
          monospace;

        animation:
          ad-toast-in .25s ease-out;
      }

      @keyframes ad-toast-in {
        from {
          transform:
            translateY(12px);
          opacity: 0;
        }
      }

      .ad-toast-dot {
        width: 6px;
        height: 6px;

        border-radius: 50%;

        background: var(--green);

        box-shadow:
          0 0 10px
          var(--green);
      }

      /* FOOTER */

      .ad-footer {
        display: flex;
        justify-content: space-between;

        gap: 15px;

        margin-top: 38px;
        padding-top: 17px;

        border-top:
          1px solid
          rgba(61,214,245,.08);

        color: #3e536c;

        font:
          600 8px
          "JetBrains Mono",
          monospace;

        letter-spacing: 1.3px;
      }

      .ad-footer b {
        color: #26384d;
      }

      /* RESPONSIVE */

      @media (max-width: 1050px) {
        .ad-bento {
          grid-template-columns: 1fr;
        }

        .ad-bento3 {
          grid-template-columns: 1fr 1fr;
        }

        .ad-bento3 .ad-panel:last-child {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 850px) {
        .ad-hero {
          grid-template-columns: 1fr;
        }

        .ad-hero-main {
          border-right: 0;
          border-bottom:
            1px solid
            rgba(61,214,245,.08);
        }

        .ad-stats {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .ad-head {
          align-items: flex-start;
        }
      }

      @media (max-width: 620px) {
        .ad-page {
          padding:
            22px 12px 50px;
        }

        .ad-brand-line {
          flex-wrap: wrap;
        }

        .ad-control-text {
          display: none;
        }

        .ad-head-actions {
          width: 100%;
        }

        .ad-admin-badge {
          flex: 1;
        }

        .ad-head-actions .ad-btn {
          white-space: nowrap;
        }

        .ad-command-strip {
          gap: 13px;
        }

        .ad-command-live {
          margin-left: 0;
        }

        .ad-stats {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ad-stat {
          min-height: 135px;
          padding: 16px;
        }

        .ad-stat-value {
          font-size: 27px;
        }

        .ad-hero-side {
          align-items: flex-start;
        }

        .ad-rate {
          width: 86px;
          height: 86px;
        }

        .ad-rate span {
          font-size: 24px;
        }

        .ad-panel {
          padding: 17px;
        }

        .ad-panel-head {
          align-items: flex-start;
          flex-direction: column;
        }

        .ad-bento3 {
          grid-template-columns: 1fr;
        }

        .ad-bento3 .ad-panel:last-child {
          grid-column: auto;
        }

        .ad-legend {
          margin-top: 3px;
        }

        .ad-footer {
          flex-direction: column;
        }
      }

      @media (max-width: 430px) {
        .ad-stats {
          grid-template-columns: 1fr;
        }

        .ad-hero-value {
          font-size: 43px;
        }

        .ad-hero-side {
          flex-direction: column;
        }

        .ad-rate {
          align-self: flex-end;
        }

        .ad-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .ad-tab {
          justify-content: center;
        }

        .ad-input-num {
          width: calc(50% - 5px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ad-page::after,
        .ad-dot,
        .ad-hero,
        .ad-rate::before {
          animation: none;
        }

        .ad-stat:hover,
        .ad-tab:hover,
        .ad-seg:hover {
          transform: none;
        }
      }
    `}</style>
  );
}
