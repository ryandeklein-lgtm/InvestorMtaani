import { useState } from "react";
import { useNavigate } from "react-router-dom";
import investorService from "../services/investor";
import useSecureDraft from "../hooks/useSecureDraft";
import FormProgress from "../components/FormProgress";

function InvestorForm() {
  const navigate = useNavigate();
  const initialState = {
    display_name: "",
    investor_type: "",
    location: "",
    thesis: "",
    min_check_size: "",
    max_check_size: "",
    preferred_stage: "",
    sectors_of_interest: "",
    geographic_focus: "",
    investing_status: "",
    portfolio_highlights: "",
    preferred_structure: "",
    risk_acknowledged: false,
  };

  const [investor, setInvestor] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const draft = useSecureDraft("/drafts/investor", { value: investor, setValue: setInvestor, enabled: !submitting });
  const requiredValues = [investor.display_name, investor.investor_type, investor.location, investor.thesis, investor.preferred_structure, investor.risk_acknowledged];
  const completedRequired = requiredValues.filter((value) => typeof value === "boolean" ? value : String(value || "").trim()).length;

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setInvestor((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!investor.risk_acknowledged) {
      setSubmitError("Please confirm the investor acknowledgement to continue.");
      return;
    }

    try {
      setSubmitting(true);

      // Convert comma-separated sectors into an array for the backend
      const payload = {
        ...investor,
        sectors_of_interest: investor.sectors_of_interest
          ? investor.sectors_of_interest
              .split(",")
              .map((sector) => sector.trim())
              .filter(Boolean)
          : [],
      };

      // Keep the draft in the form's editable shape (comma-separated sectors).
      await draft.saveNow(investor).catch(() => {});
      await investorService.createInvestor(payload);
      await draft.clearDraft().catch(() => {});
      navigate("/investor-profile", { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "We couldn’t create the investor profile. Check the required fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>INVESTOR PROFILE</span>
          <h1 style={styles.title}>Tell businesses what you look for</h1>
          <p style={styles.subtitle}>
            Set your investment criteria so Investor Mtaani can introduce
            you to relevant, verified businesses.
          </p>
          <FormProgress completed={completedRequired} total={requiredValues.length} sections={[{ id: "investor-info", label: "About you" }, { id: "investor-criteria", label: "Criteria" }, { id: "investor-track-record", label: "Track record" }]} />
          <p role="status" aria-live="polite" style={{ color: "#476174", marginTop: 12, fontSize: 13 }}>
            {draft.status === "loading" && "Checking for your saved draft…"}
            {draft.status === "restored" && "Your saved draft has been restored. Changes save securely as you work."}
            {draft.status === "empty" && "Your progress saves securely as you work, so you can return later."}
            {draft.status === "saving" && "Saving your draft…"}
            {draft.status === "saved" && `Draft saved${draft.updatedAt ? ` at ${new Date(draft.updatedAt).toLocaleTimeString()}` : ""}.`}
            {draft.status === "save-error" && "We couldn’t save your draft. Your work is still on this page; check your connection and retry."}
            {draft.status === "unavailable" && "Secure draft saving is unavailable. Your work will not be saved if you leave this page."}
          </p>
          {(draft.status === "unavailable" || draft.status === "save-error") && (
            <button type="button" onClick={() => draft.status === "unavailable" ? draft.retryLoad() : draft.saveNow().catch(() => {})} style={{ marginTop: 8, color: "#166534", background: "transparent", textDecoration: "underline" }}>
              {draft.status === "unavailable" ? "Retry draft connection" : "Retry saving"}
            </button>
          )}
          {submitError && <p role="alert" style={{ marginTop: 12, padding: 12, borderRadius: 8, color: "#991b1b", background: "#fee2e2" }}>{submitError}</p>}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset disabled={draft.status === "loading"} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <section id="investor-info" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.step}>01</span>

              <div>
                <h2 style={styles.sectionTitle}>Investor Information</h2>
                <p style={styles.sectionDescription}>
                  Give businesses a quick overview of who you are.
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              <Field
                label="Display Name"
                name="display_name"
                placeholder="e.g. Ryan de Klein"
                value={investor.display_name}
                onChange={handleChange}
                required
              />

              <SelectField
                label="Investor Type"
                name="investor_type"
                value={investor.investor_type}
                onChange={handleChange}
                options={[
                  "Angel Investor",
                  "Syndicate",
                  "Venture Capital Fund",
                  "Institution",
                ]}
                required
              />

              <Field
                label="Location"
                name="location"
                placeholder="e.g. Nairobi, Kenya"
                value={investor.location}
                onChange={handleChange}
                required
              />

              <SelectField
                label="Investing Status"
                name="investing_status"
                value={investor.investing_status}
                onChange={handleChange}
                options={[
                  "Actively investing",
                  "Selective",
                  "Not currently deploying",
                ]}
              />
            </div>

            <label style={styles.label}>
              Investment Thesis
              <textarea
                name="thesis"
                placeholder="What do you look for in a business? What draws you to an opportunity?"
                value={investor.thesis}
                onChange={handleChange}
                style={styles.textarea}
                required
              />
            </label>
          </section>

          <section id="investor-criteria" style={styles.fundingSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.fundingStep}>02</span>

              <div>
                <h2 style={styles.sectionTitle}>Investment Criteria</h2>
                <p style={styles.sectionDescription}>
                  Help businesses understand if they're a fit before they
                  reach out.
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              <Field
                label="Minimum Check Size (KES)"
                name="min_check_size"
                type="number"
                placeholder="e.g. 500000"
                value={investor.min_check_size}
                onChange={handleChange}
              />

              <Field
                label="Maximum Check Size (KES)"
                name="max_check_size"
                type="number"
                placeholder="e.g. 5000000"
                value={investor.max_check_size}
                onChange={handleChange}
              />

              <Field
                label="Preferred Stage"
                name="preferred_stage"
                placeholder="e.g. Revenue-generating"
                value={investor.preferred_stage}
                onChange={handleChange}
              />

              <Field
                label="Geographic Focus"
                name="geographic_focus"
                placeholder="e.g. East Africa"
                value={investor.geographic_focus}
                onChange={handleChange}
              />

              <SelectField
                label="Preferred Investment Structure"
                name="preferred_structure"
                value={investor.preferred_structure}
                onChange={handleChange}
                options={["Debt", "Equity", "Both"]}
                required
              />
            </div>

            <label style={styles.label}>
              Sectors of Interest
              <input
                name="sectors_of_interest"
                type="text"
                placeholder="e.g. Agritech, HealthTech, Clean Energy"
                value={investor.sectors_of_interest}
                onChange={handleChange}
                style={styles.input}
              />

              <span style={styles.helperText}>
                Separate multiple sectors with commas.
              </span>
            </label>
          </section>

          <section id="investor-track-record" style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.step}>03</span>

              <div>
                <h2 style={styles.sectionTitle}>Track Record</h2>
                <p style={styles.sectionDescription}>
                  Optional, but it builds credibility with businesses
                  reviewing your profile.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              Portfolio Highlights
              <textarea
                name="portfolio_highlights"
                placeholder="Example: Backed 6 early-stage agritech companies across Kenya and Uganda since 2021..."
                value={investor.portfolio_highlights}
                onChange={handleChange}
                style={styles.textarea}
              />
            </label>
          </section>

          <section style={styles.ackBox}>
            <label style={styles.ackLabel}>
              <input
                type="checkbox"
                name="risk_acknowledged"
                checked={investor.risk_acknowledged}
                onChange={handleChange}
                style={styles.checkbox}
              />

              <span>
                I understand that investments carry risk, including the
                possible loss of invested capital. I understand that Investor
                Mtaani does not guarantee investment returns, repayment,
                profitability or future business performance. I am
                responsible for making my own investment decision and may
                seek independent professional advice.
              </span>
            </label>
          </section>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: submitting || !investor.risk_acknowledged ? 0.7 : 1,
            }}
            disabled={submitting || !investor.risk_acknowledged}
          >
            {submitting
              ? "Creating Profile..."
              : "Create Investor Profile"}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <label style={styles.label}>
      {label}

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={styles.input}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <label style={styles.label}>
      {label}

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={styles.input}
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "60px 20px 100px",
  },

  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "40px",
  },

  eyebrow: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  title: {
    color: "#0b1f3a",
    fontSize: "42px",
    margin: "12px 0",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "17px",
    maxWidth: "600px",
    lineHeight: "1.7",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
  },

  fundingSection: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "16px",
    padding: "32px",
  },

  sectionHeader: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },

  step: {
    background: "#0b1f3a",
    color: "#ffffff",
    minWidth: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  fundingStep: {
    background: "#16a34a",
    color: "#ffffff",
    minWidth: "42px",
    height: "42px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "#0b1f3a",
    fontSize: "22px",
  },

  sectionDescription: {
    color: "#64748b",
    lineHeight: "1.6",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "left",
  },

  input: {
    padding: "14px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
    color: "#0f172a",
  },

  textarea: {
    minHeight: "130px",
    padding: "14px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },

  helperText: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "400",
    lineHeight: "1.5",
  },

  ackBox: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px 32px",
  },

  ackLabel: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.7",
    cursor: "pointer",
  },

  checkbox: {
    marginTop: "5px",
    width: "18px",
    height: "18px",
    accentColor: "#16a34a",
    flexShrink: 0,
  },

  submitButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "17px 28px",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    alignSelf: "flex-start",
    boxShadow: "0 8px 20px rgba(22, 163, 74, 0.2)",
  },
};

export default InvestorForm;
