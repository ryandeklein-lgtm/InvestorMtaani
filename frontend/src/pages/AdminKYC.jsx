import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const page = { minHeight: "75vh", background: "#080d17", color: "#f8fafc", padding: "36px 20px 70px" };
const card = { background: "#0b1220", border: "1px solid #253247", borderRadius: 14, padding: 20 };
const input = { background: "#0f172a", color: "#f8fafc", border: "1px solid #334155", borderRadius: 8, padding: 10, font: "inherit" };
const statusName = (status) => ({ pending: "Pending review", needs_changes: "Changes requested", approved: "Approved", rejected: "Not approved" }[status] || String(status || "Unknown").replaceAll("_", " "));
const ageDays = (value) => Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
const dateLabel = (value) => value ? new Date(value).toLocaleString() : "Not available";

export default function AdminKYC() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("pending");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const query = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const { data } = await api.get(`/admin/kyc${query}`);
      setRows(data.data || []);
      try {
        const summaryResponse = await api.get("/admin/kyc/summary");
        setSummary(summaryResponse.data.data);
      } catch { setSummary(null); }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load KYC submissions.");
    } finally { setBusy(false); }
  }, [filter]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const open = async (id) => {
    setSelected(null);
    setNotes("");
    setError("");
    try {
      const { data } = await api.get(`/admin/kyc/${id}`);
      setSelected(data.data);
      setNotes(data.data.reviewNotes || "");
    } catch (err) { setError(err.response?.data?.message || "Could not open this submission."); }
  };

  const download = async (document) => {
    try {
      const { data } = await api.get(`/admin/kyc/${selected.id}/documents/${document.id}`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.original_name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch { setError("Could not download this document."); }
  };

  const decide = async (status) => {
    if (!selected) return;
    if (["needs_changes", "rejected"].includes(status) && !notes.trim()) {
      setError("Add a clear review note before requesting changes or rejecting this submission.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.patch(`/admin/kyc/${selected.id}/status`, { status, reviewNotes: notes });
      setNotice(`Review recorded: ${status.replaceAll("_", " ")}.`);
      setSelected({ ...selected, status, reviewNotes: notes });
      await load();
    } catch (err) { setError(err.response?.data?.message || "Could not record this review."); }
    finally { setBusy(false); }
  };

  const visibleRows = rows
    .filter((row) => `${row.applicant_name || ""} ${row.applicant_email || ""} ${row.entity_type || ""}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      if (a.status === "pending" && b.status === "pending") return new Date(a.created_at) - new Date(b.created_at);
      if (a.status === "pending") return -1;
      if (b.status === "pending") return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return <main style={page}>
    <style>{`@media(max-width:760px){.im-admin-kyc-layout{grid-template-columns:1fr!important}.im-admin-kyc-list{max-height:55vh;overflow:auto}.im-admin-kyc-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}}`}</style>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Link to="/admin" style={{ color: "#7dd3fc" }}>← Admin dashboard</Link>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Identity review</h1>
      <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Work through the oldest pending submissions first. Review access is logged. Include a specific, applicant friendly note whenever you request changes or decline an application.</p>
      {error && <p role="alert" style={{ color: "#fecaca", background: "#451a1a", padding: 12, borderRadius: 8 }}>{error}</p>}
      {notice && <p role="status" style={{ color: "#bbf7d0", background: "#052e24", padding: 12, borderRadius: 8 }}>{notice}</p>}
      {summary && <section className="im-admin-kyc-summary" aria-label="Review queue summary" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, marginTop: 20 }}>
        {[ ["Awaiting review", summary.pending, "pending"], ["Over 3 days", summary.overdue, "overdue"], ["Changes requested", summary.needs_changes, "needs_changes"], ["Approved", summary.approved, "approved"], ["Not approved", summary.rejected, "rejected"] ].map(([label, count, key]) => <button key={key} type="button" onClick={() => key !== "overdue" && setFilter(key)} style={{ ...card, padding: 14, textAlign: "left", cursor: key === "overdue" ? "default" : "pointer", borderColor: key === "overdue" && count > 0 ? "#854d0e" : card.border }}>
          <span style={{ display: "block", color: "#94a3b8", fontSize: 12 }}>{label}</span><strong style={{ display: "block", marginTop: 5, fontSize: 24, color: key === "overdue" && count > 0 ? "#fbbf24" : "#7dd3fc" }}>{count}</strong>
        </button>)}
      </section>}
      <div className="im-admin-kyc-layout" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.8fr) minmax(0, 1.5fr)", gap: 18, marginTop: 16 }}>
        <section className="im-admin-kyc-list" style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Submissions</h2>
            <select aria-label="Filter submissions" value={filter} onChange={(event) => setFilter(event.target.value)} style={input}>
              <option value="pending">Pending</option><option value="needs_changes">Changes requested</option><option value="approved">Approved</option><option value="rejected">Not approved</option><option value="all">All submissions</option>
            </select>
          </div>
          <label style={{ display: "block", marginTop: 12, color: "#94a3b8", fontSize: 12 }}>Find an applicant
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, or account type" style={{ ...input, display: "block", width: "100%", boxSizing: "border-box", marginTop: 6 }} />
          </label>
          {busy && <p role="status" style={{ color: "#94a3b8" }}>Updating…</p>}
          {!visibleRows.length && !busy && <p style={{ color: "#94a3b8" }}>{rows.length ? "No applicants match this search." : "No submissions in this view."}</p>}
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {visibleRows.map((row) => <button key={row.id} type="button" aria-pressed={selected?.id === row.id} onClick={() => open(row.id)} style={{ ...input, textAlign: "left", cursor: "pointer", padding: 14, borderColor: selected?.id === row.id ? "#49ddca" : row.status === "pending" && ageDays(row.created_at) >= 3 ? "#854d0e" : input.border, background: selected?.id === row.id ? "rgba(73,221,202,.09)" : input.background }}>
              <strong>{row.applicant_name || row.applicant_email}</strong><br />
              <span style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{row.entity_type} · {statusName(row.status)} · {row.documents?.length || 0} files</span><br />
              <span style={{ color: row.status === "pending" && ageDays(row.created_at) >= 3 ? "#fbbf24" : "#64748b", fontSize: 12 }}>{row.status === "pending" ? `Waiting ${ageDays(row.created_at)} days` : `Submitted ${dateLabel(row.created_at)}`}</span>
            </button>)}
          </div>
        </section>
        <section style={card}>
          {!selected ? <p style={{ color: "#94a3b8" }}>Select a submission to review its details and documents.</p> : <>
            <h2 style={{ marginTop: 0 }}>{selected.applicantName} <span style={{ color: "#94a3b8", fontSize: 14 }}>({selected.entityType})</span></h2>
            <div role="status" style={{ margin: "12px 0", padding: 14, borderRadius: 10, border: "1px solid #263449", background: "#0f172a" }}>
              <strong>{statusName(selected.status)}</strong>
              <p style={{ color: "#cbd5e1", lineHeight: 1.6, margin: "7px 0 0" }}>
                {selected.status === "pending" ? "Submitted and waiting for an administrator. Check the submitted answers and every required document before recording a decision." : selected.status === "needs_changes" ? "The applicant was asked to update their submission. The review note below explains what to correct." : selected.status === "approved" ? "Verification is complete. The applicant can continue with the platform." : "This submission was not approved. The review note should explain the reason to the applicant."}
              </p>
              <small style={{ display: "block", color: "#94a3b8", marginTop: 8 }}>Submitted {dateLabel(selected.createdAt)}</small>
            </div>
            <p style={{ color: "#94a3b8" }}>{selected.applicantEmail}</p>
            <h3>Submitted details</h3>
            <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {Object.entries(selected.answers || {}).filter(([key]) => key !== "declaration").map(([key, value]) => <div key={key} style={{ overflowWrap: "anywhere", padding: 10, borderRadius: 8, background: "#0f172a" }}><dt style={{ color: "#94a3b8", fontSize: 12 }}>{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd style={{ margin: "5px 0 0", whiteSpace: "pre-wrap" }}>{String(value)}</dd></div>)}
            </dl>
            <h3>Documents</h3>
            <div style={{ display: "grid", gap: 8 }}>{selected.documents?.map((doc) => <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 10, borderRadius: 8, background: "#0f172a" }}><span>{doc.document_type} · {doc.original_name}</span><button type="button" onClick={() => download(doc)} style={input}>Download</button></div>)}</div>
            {selected.status === "pending" && <>
              <label style={{ display: "block", marginTop: 20 }}>Review note <span style={{ color: "#fbbf24" }}>(required for changes or rejection)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={4} placeholder="State what is missing or incorrect and how the applicant can resolve it." style={{ ...input, display: "block", width: "100%", boxSizing: "border-box", marginTop: 7 }} /></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <button type="button" disabled={busy} onClick={() => decide("approved")} style={{ ...input, minHeight: 44, background: "#166534" }}>Approve</button>
                <button type="button" disabled={busy || !notes.trim()} onClick={() => decide("needs_changes")} style={{ ...input, minHeight: 44, background: "#854d0e", opacity: !notes.trim() ? .6 : 1 }}>Request changes</button>
                <button type="button" disabled={busy || !notes.trim()} onClick={() => decide("rejected")} style={{ ...input, minHeight: 44, background: "#991b1b", opacity: !notes.trim() ? .6 : 1 }}>Reject</button>
              </div>
            </>}
          </>}
        </section>
      </div>
    </div>
  </main>;
}
