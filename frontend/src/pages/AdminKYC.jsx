import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const page = { minHeight: "75vh", background: "#080d17", color: "#f8fafc", padding: "36px 20px 70px" };
const card = { background: "#0b1220", border: "1px solid #253247", borderRadius: 14, padding: 20 };
const input = { background: "#0f172a", color: "#f8fafc", border: "1px solid #334155", borderRadius: 8, padding: 10, font: "inherit" };

export default function AdminKYC() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const query = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const { data } = await api.get(`/admin/kyc${query}`);
      setRows(data.data || []);
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

  return <main style={page}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Link to="/admin" style={{ color: "#7dd3fc" }}>← Admin dashboard</Link>
      <h1 style={{ fontSize: 34, marginBottom: 6 }}>Identity review</h1>
      <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Review access is logged. Approve only after checking documents against your organization’s approved verification procedure.</p>
      {error && <p role="alert" style={{ color: "#fecaca", background: "#451a1a", padding: 12, borderRadius: 8 }}>{error}</p>}
      {notice && <p role="status" style={{ color: "#bbf7d0", background: "#052e24", padding: 12, borderRadius: 8 }}>{notice}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 0.8fr) minmax(0, 1.5fr)", gap: 18, marginTop: 20 }}>
        <section style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Submissions</h2>
            <select aria-label="Filter submissions" value={filter} onChange={(event) => setFilter(event.target.value)} style={input}>
              <option value="pending">Pending</option><option value="needs_changes">Needs changes</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option>
            </select>
          </div>
          {busy && <p role="status" style={{ color: "#94a3b8" }}>Updating…</p>}
          {!rows.length && !busy && <p style={{ color: "#94a3b8" }}>No submissions in this view.</p>}
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {rows.map((row) => <button key={row.id} type="button" onClick={() => open(row.id)} style={{ ...input, textAlign: "left", cursor: "pointer", padding: 14 }}>
              <strong>{row.applicant_name || row.applicant_email}</strong><br />
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.entity_type} · {row.status} · {row.documents?.length || 0} files</span>
            </button>)}
          </div>
        </section>
        <section style={card}>
          {!selected ? <p style={{ color: "#94a3b8" }}>Select a submission to review its details and documents.</p> : <>
            <h2 style={{ marginTop: 0 }}>{selected.applicantName} <span style={{ color: "#94a3b8", fontSize: 14 }}>({selected.entityType})</span></h2>
            <p style={{ color: "#94a3b8" }}>{selected.applicantEmail} · {selected.status}</p>
            <h3>Submitted details</h3>
            <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {Object.entries(selected.answers || {}).filter(([key]) => key !== "declaration").map(([key, value]) => <div key={key} style={{ overflowWrap: "anywhere", padding: 10, borderRadius: 8, background: "#0f172a" }}><dt style={{ color: "#94a3b8", fontSize: 12 }}>{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd style={{ margin: "5px 0 0", whiteSpace: "pre-wrap" }}>{String(value)}</dd></div>)}
            </dl>
            <h3>Documents</h3>
            <div style={{ display: "grid", gap: 8 }}>{selected.documents?.map((doc) => <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 10, borderRadius: 8, background: "#0f172a" }}><span>{doc.document_type} · {doc.original_name}</span><button type="button" onClick={() => download(doc)} style={input}>Download</button></div>)}</div>
            {selected.status === "pending" && <>
              <label style={{ display: "block", marginTop: 20 }}>Review notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} style={{ ...input, display: "block", width: "100%", boxSizing: "border-box", marginTop: 7 }} /></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <button disabled={busy} onClick={() => decide("approved")} style={{ ...input, background: "#166534" }}>Approve</button>
                <button disabled={busy} onClick={() => decide("needs_changes")} style={{ ...input, background: "#854d0e" }}>Request changes</button>
                <button disabled={busy} onClick={() => decide("rejected")} style={{ ...input, background: "#991b1b" }}>Reject</button>
              </div>
            </>}
          </>}
        </section>
      </div>
    </div>
  </main>;
}
