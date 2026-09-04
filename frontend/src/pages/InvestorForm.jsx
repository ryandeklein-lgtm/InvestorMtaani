import { useState } from "react";
import investorService from "../services/investor";

function InvestorForm() {
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
  };

  const [investor, setInvestor] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setInvestor({
      ...investor,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      await investorService.createInvestor(payload);

      alert("Investor profile created successfully!");
      setInvestor(initialState);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Could not create investor profile"
      );
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
            Set your investment criteria so the right businesses can find
            and pitch you.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
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

          <section style={styles.fundingSection}>
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

          <section style={styles.section}>
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

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: submitting ? 0.7 : 1,
            }}
            disabled={submitting}
          >
            {submitting
              ? "Creating Profile..."
              : "Create Investor Profile"}
          </button>
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
