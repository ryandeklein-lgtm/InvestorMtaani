import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuthContext } from "../contexts/AuthContext";
import useSecureDraft from "../hooks/useSecureDraft";

const ACCEPTED_FILES = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const BUSINESS_DOCUMENTS = [
  ["registration_certificate", "Certificate of registration", true],
  ["ownership_record", "CR12 / ownership record", true],
  ["director_id", "Director / beneficial owner ID", true],
  ["tax_document", "KRA / tax document", true],
  ["financial_statements", "Financial statements", true],
  ["business_plan", "Business plan / funding proposal", true],
  ["articles", "Articles / constitutional documents", false],
  ["business_licence", "Business licence / permit", false],
];
const INVESTOR_DOCUMENTS = [
  ["identity_document", "National ID / passport", true],
  ["proof_of_address", "Proof of address", true],
  ["source_of_funds", "Source of funds document", true],
  ["ownership_record", "Organization registration / ownership", false],
];

const formatDate = (value) => value ? new Date(value).toLocaleString() : null;
const statusHelp = (status) => ({
  pending: "We’ve received your information and documents. An administrator is reviewing them. You don’t need to submit again; we’ll notify you when there’s an update.",
  needs_changes: "Please read the reviewer’s note below, correct the listed details or documents, and submit the updated information for another review.",
  approved: "Your identity verification is complete. You can continue to your profile and explore the platform.",
  rejected: "This submission was not approved. Read the reviewer’s note below. Correct the issue and submit again if appropriate.",
}[status] || "Your verification status is available below.");

function Field({ label, value, onChange, required = true, type = "text", multiline = false }) {
  const shared = {
    width: "100%", boxSizing: "border-box", border: "1px solid #334155",
    borderRadius: 10, background: "#0f172a", color: "#f8fafc", padding: "12px 14px",
    font: "inherit", marginTop: 7,
  };
  return (
    <label style={{ display: "block", color: "#cbd5e1", fontSize: 14 }}>
      {label}{required && <span style={{ color: "#fb7185" }}> *</span>}
      {multiline ? (
        <textarea required={required} value={value} onChange={onChange} rows={3} style={shared} />
      ) : (
        <input required={required} type={type} value={value} onChange={onChange} style={shared} />
      )}
    </label>
  );
}

export default function KYCFlow() {
  const { user } = useAuthContext();
  const isBusiness = user?.role === "business";
  const documents = isBusiness ? BUSINESS_DOCUMENTS : INVESTOR_DOCUMENTS;
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({});
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [business, setBusiness] = useState({
    businessName: "", registrationNumber: "", businessType: "", kraPin: "",
    businessAddress: "", operatingAddress: "", county: "", directors: "",
    beneficialOwners: "", shareholding: "", useOfFunds: "", existingLoans: "",
    existingInvestors: "", litigation: "", insolvency: "",
  });
  const [investor, setInvestor] = useState({
    fullName: user?.name || "", investorType: "", country: "Kenya", address: "",
    occupation: "", sourceOfFunds: "",
  });
  const draft = useSecureDraft("/kyc/draft", {
    value: isBusiness ? business : investor,
    setValue: isBusiness ? setBusiness : setInvestor,
    enabled: !loadingStatus && !statusUnavailable && status?.status !== "pending" && status?.status !== "approved" && !submitting,
  });

  useEffect(() => {
    let active = true;
    api.get("/kyc/me")
      .then(({ data }) => {
        if (active) { setStatus(data.data?.[0] || null); setStatusUnavailable(false); }
      })
      .catch(() => {
        if (active) { setStatusUnavailable(true); setError("We couldn’t check your current verification status. Retry before continuing so we don’t create duplicate submissions."); }
      })
      .finally(() => { if (active) setLoadingStatus(false); });
    return () => { active = false; };
  }, [statusAttempt]);

  const uploadedCount = useMemo(() => Object.keys(files).length, [files]);
  const locked = status?.status === "pending" || status?.status === "approved";
  const requiredDetailKeys = isBusiness
    ? ["businessName", "registrationNumber", "businessType", "kraPin", "businessAddress", "operatingAddress", "county", "directors", "beneficialOwners", "shareholding", "useOfFunds"]
    : ["fullName", "investorType", "country", "address", "occupation", "sourceOfFunds"];
  const detailValues = isBusiness ? business : investor;
  const completedDetails = requiredDetailKeys.filter((key) => String(detailValues[key] || "").trim()).length;
  const requiredDocuments = documents.filter(([, , required]) => required);
  const uploadedRequiredDocuments = requiredDocuments.filter(([type]) => files[type]).length;
  const totalRequirements = requiredDetailKeys.length + requiredDocuments.length + 1;
  const completedRequirements = completedDetails + uploadedRequiredDocuments + Number(accepted);
  const progress = Math.round((completedRequirements / totalRequirements) * 100);

  const updateDetails = (setter, key) => (event) => {
    setter((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  const selectFile = (type, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`${file.name} is larger than 5 MB.`);
      event.target.value = "";
      return;
    }
    if (!new Set(["application/pdf", "image/jpeg", "image/png"]).has(file.type)) {
      setError("Choose a PDF, JPEG, or PNG document.");
      event.target.value = "";
      return;
    }
    setFiles((current) => {
      if (!current[type] && Object.keys(current).length >= 8) {
        setError("Upload up to eight documents per submission.");
        return current;
      }
      return { ...current, [type]: file };
    });
    setError("");
  };

  const removeFile = (type) => setFiles((current) => {
    const next = { ...current };
    delete next[type];
    return next;
  });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (locked) return setError("Your current KYC submission cannot be replaced while it is pending or approved.");
    if (!accepted) return setError("Accept the KYC declaration to continue.");
    if (!documents.filter(([, , required]) => required).every(([type]) => files[type])) {
      return setError("Upload each required document before submitting.");
    }
    if (window.location.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      return setError("KYC documents can only be submitted over a secure HTTPS connection.");
    }

    const answers = { ...(isBusiness ? business : investor), declaration: true };
    const selected = documents.filter(([type]) => files[type]);
    const body = new FormData();
    body.append("answers", JSON.stringify(answers));
    body.append("documentTypes", JSON.stringify(selected.map(([type]) => type)));
    selected.forEach(([type]) => body.append("documents", files[type]));

    setSubmitting(true);
    try {
      const { data } = await api.post("/kyc/submissions", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus(data.data);
      setFiles({});
      draft.clearDraft().catch(() => {});
      setMessage(data.message || "Your encrypted KYC submission is awaiting review.");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "KYC submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageStyle = { minHeight: "72vh", padding: "48px 20px 80px", background: "#080d17", color: "#f8fafc" };
  const cardStyle = { width: "100%", maxWidth: 900, margin: "0 auto", padding: 32, border: "1px solid #1e293b", borderRadius: 18, background: "#0b1220", boxSizing: "border-box" };

  return (
    <main style={pageStyle}>
      <section className="im-kyc-card" style={cardStyle}>
        <style>{`
          .im-kyc-file-trigger { position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1px solid #28485f; border-radius: 8px; background: #101d30; }
          .im-kyc-file-trigger:hover { border-color: #38bdf8; background: #14243a; }
          .im-kyc-file-trigger:focus-within { outline: 3px solid rgba(56,189,248,.35); outline-offset: 2px; }
          .im-kyc-file-trigger input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; clip-path: inset(50%); }
          @media (max-width: 600px) { .im-kyc-card { padding: 22px !important; } .im-kyc-title { font-size: 29px !important; } }
        `}</style>
        <p style={{ color: "#38bdf8", fontWeight: 800, letterSpacing: 1.5 }}>INVESTOR MTAANI / VERIFICATION</p>
        <h1 className="im-kyc-title" style={{ fontSize: 36, margin: "8px 0" }}>{isBusiness ? "Business verification & KYC" : "Investor verification & KYC"}</h1>
        <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
          Submit the required details and evidence for a manual review. Documents are encrypted before they are stored and are only available to authorized administrators.
        </p>

        {!loadingStatus && !statusUnavailable && !locked && <section aria-label="Verification completion" style={{ margin: "24px 0 30px", padding: 18, border: "1px solid #26394e", borderRadius: 12, background: "linear-gradient(120deg,rgba(14,165,233,.08),rgba(129,140,248,.06))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <strong style={{ color: "#e2e8f0" }}>{progress === 100 ? "Ready to submit" : `${progress}% complete`}</strong>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{completedRequirements} of {totalRequirements} required items</span>
          </div>
          <div
            role="progressbar"
            aria-label="Verification form completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            style={{ height: 7, marginTop: 12, overflow: "hidden", borderRadius: 99, background: "#1e293b" }}
          >
            <div style={{ width: `${progress}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#2dd4bf,#38bdf8,#a78bfa)", transition: "width .2s ease" }} />
          </div>
          <p style={{ margin: "9px 0 0", color: "#94a3b8", fontSize: 12 }}>Complete the required details, add each required document, then accept the declaration.</p>
        </section>}

        {loadingStatus && <p role="status">Loading verification status…</p>}
        {statusUnavailable && !loadingStatus && <button type="button" onClick={() => { setError(""); setLoadingStatus(true); setStatusAttempt((attempt) => attempt + 1); }} style={{ minHeight: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #334155", background: "#101d30", color: "#7dd3fc", cursor: "pointer" }}>Retry status check</button>}
        {status && (
          <div role="status" style={{ margin: "20px 0", padding: 18, borderRadius: 10, background: "#111c2f", border: "1px solid #334155" }}>
            <strong>Status: {status.status.replaceAll("_", " ").toUpperCase()}</strong>
            <p style={{ color: "#cbd5e1", lineHeight: 1.65, margin: "8px 0" }}>{statusHelp(status.status)}</p>
            {status.review_notes && <div style={{ marginTop: 12, padding: 13, borderLeft: "3px solid #f1c75b", borderRadius: 6, background: "#0b1220" }}><strong>Reviewer’s note</strong><p style={{ color: "#e2e8f0", whiteSpace: "pre-wrap", margin: "6px 0 0" }}>{status.review_notes}</p></div>}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, color: "#94a3b8", fontSize: 12 }}>
              {formatDate(status.created_at) && <span>Submitted {formatDate(status.created_at)}</span>}
              {formatDate(status.reviewed_at) && <span>Reviewed {formatDate(status.reviewed_at)}</span>}
            </div>
            {status.status === "approved" && <Link to={isBusiness ? "/business-profile" : "/investor-profile"} style={{ display: "inline-flex", minHeight: 44, alignItems: "center", marginTop: 10, color: "#7dd3fc", fontWeight: 700 }}>Continue to your profile →</Link>}
          </div>
        )}
        {!loadingStatus && !statusUnavailable && !locked && <p role="status" style={{ color: "#94a3b8", fontSize: 13 }}>
          {draft.status === "saving" ? "Saving your answers securely…" : draft.status === "saved" || draft.status === "restored" ? "Your answers are saved securely and can be continued later." : draft.status === "save-error" || draft.status === "unavailable" ? "Answers could not be saved. You can still submit this form, but keep this page open until you do." : "Your answers will be saved securely as you work."}
          {Object.keys(files).length > 0 && " Selected files stay on this device until submission; choose them again if you return later."}
        </p>}
        {!loadingStatus && !statusUnavailable && !locked && ["unavailable", "save-error"].includes(draft.status) && <button type="button" onClick={() => draft.status === "unavailable" ? draft.retryLoad() : draft.saveNow().catch(() => {})} style={{ minHeight: 44, margin: "-4px 0 12px", padding: "0 12px", border: "1px solid #334155", borderRadius: 8, background: "#101d30", color: "#7dd3fc", cursor: "pointer" }}>
          {draft.status === "unavailable" ? "Retry draft connection" : "Retry saving answers"}
        </button>}
        {error && <p role="alert" style={{ padding: 14, color: "#fecaca", background: "#451a1a", borderRadius: 8 }}>{error}</p>}
        {message && <p role="status" style={{ padding: 14, color: "#bbf7d0", background: "#052e24", borderRadius: 8 }}>{message}</p>}

        {!loadingStatus && !statusUnavailable && !locked && draft.status === "loading" && <p role="status">Checking for saved answers…</p>}
        {!loadingStatus && !statusUnavailable && !locked && draft.status !== "loading" && (
          <form onSubmit={submit}>
            <h2 style={{ marginTop: 30 }}>Your information</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
              {isBusiness ? <>
                <Field label="Registered business name" value={business.businessName} onChange={updateDetails(setBusiness, "businessName")} />
                <Field label="Registration number" value={business.registrationNumber} onChange={updateDetails(setBusiness, "registrationNumber")} />
                <Field label="Business type" value={business.businessType} onChange={updateDetails(setBusiness, "businessType")} />
                <Field label="KRA PIN" value={business.kraPin} onChange={updateDetails(setBusiness, "kraPin")} />
                <Field label="Registered address" value={business.businessAddress} onChange={updateDetails(setBusiness, "businessAddress")} />
                <Field label="Operating address" value={business.operatingAddress} onChange={updateDetails(setBusiness, "operatingAddress")} />
                <Field label="County" value={business.county} onChange={updateDetails(setBusiness, "county")} />
                <Field label="Directors" value={business.directors} onChange={updateDetails(setBusiness, "directors")} multiline />
                <Field label="Beneficial owners" value={business.beneficialOwners} onChange={updateDetails(setBusiness, "beneficialOwners")} multiline />
                <Field label="Shareholding structure" value={business.shareholding} onChange={updateDetails(setBusiness, "shareholding")} multiline />
                <Field label="Use of funds" value={business.useOfFunds} onChange={updateDetails(setBusiness, "useOfFunds")} multiline />
                <Field label="Existing loans / liabilities" value={business.existingLoans} onChange={updateDetails(setBusiness, "existingLoans")} required={false} multiline />
                <Field label="Existing investors" value={business.existingInvestors} onChange={updateDetails(setBusiness, "existingInvestors")} required={false} multiline />
                <Field label="Litigation / disputes" value={business.litigation} onChange={updateDetails(setBusiness, "litigation")} required={false} multiline />
                <Field label="Insolvency information" value={business.insolvency} onChange={updateDetails(setBusiness, "insolvency")} required={false} multiline />
              </> : <>
                <Field label="Full legal name" value={investor.fullName} onChange={updateDetails(setInvestor, "fullName")} />
                <Field label="Investor type" value={investor.investorType} onChange={updateDetails(setInvestor, "investorType")} />
                <Field label="Country of residence / registration" value={investor.country} onChange={updateDetails(setInvestor, "country")} />
                <Field label="Residential / registered address" value={investor.address} onChange={updateDetails(setInvestor, "address")} />
                <Field label="Occupation / business activity" value={investor.occupation} onChange={updateDetails(setInvestor, "occupation")} />
                <Field label="Source of funds" value={investor.sourceOfFunds} onChange={updateDetails(setInvestor, "sourceOfFunds")} multiline />
              </>}
            </div>

            <h2 style={{ marginTop: 34 }}>Documents</h2>
            <p style={{ color: "#94a3b8" }}>PDF, JPEG, or PNG; maximum 5 MB per file and 8 files per submission. Uploaded: {uploadedCount}/8. Add clear, current documents that match the name and organization in your application.</p>
            <div style={{ display: "grid", gap: 12 }}>
              {documents.map(([type, title, required]) => (
                <div key={type} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 14, background: "#0f172a", border: "1px solid #263449", borderRadius: 10 }}>
                  <div><strong>{title}{required && <span style={{ color: "#fb7185" }}> *</span>}</strong><div style={{ color: "#94a3b8", fontSize: 13 }}>{files[type]?.name || "No file selected"}</div></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label className="im-kyc-file-trigger" style={{ cursor: "pointer", color: "#7dd3fc" }}>
                      {files[type] ? "Change file" : "Choose file"}
                      <input type="file" aria-label={`${files[type] ? "Change" : "Choose"} ${title}`} accept={ACCEPTED_FILES} onChange={(event) => selectFile(type, event)} />
                    </label>
                    {files[type] && <button type="button" onClick={() => removeFile(type)} style={{ border: 0, background: "transparent", color: "#fda4af", cursor: "pointer" }}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "24px 0", color: "#cbd5e1", lineHeight: 1.6 }}>
              <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
              <span>I confirm that the information and documents provided are accurate and complete, and consent to their use for identity, eligibility, security, and verification review as described in the <Link to="/privacy" style={{ color: "#7dd3fc" }}>Privacy Policy</Link>.</span>
            </label>

            <button type="submit" disabled={submitting} style={{ border: 0, borderRadius: 10, padding: "14px 20px", background: submitting ? "#475569" : "#0ea5e9", color: "white", fontWeight: 800, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? "Encrypting and submitting…" : "Submit for verification review"}
            </button>
          </form>
        )}
        <p style={{ marginTop: 28, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
          Submitting KYC does not approve an investment or guarantee an outcome. Only authorized administrators can review these documents. Keep the originals and contact support if you believe your account was accessed improperly.
        </p>
      </section>
    </main>
  );
}
