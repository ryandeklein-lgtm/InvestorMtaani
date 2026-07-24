import { useState } from "react";
import businessService from "../services/business";

function BusinessForm() {
  const initialState = {
    business_name: "",
    industry: "",
    location: "",
    description: "",
    year_established: "",
    employees: "",
    annual_revenue: "",
    monthly_gross: "",
    monthly_net: "",
    amount_seeking: "",
    funding_reason: "",
  };

  const [business, setBusiness] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setBusiness({
      ...business,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await businessService.createBusiness(business);

      alert("Business profile created successfully!");
      setBusiness(initialState);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Could not create business profile"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.eyebrow}>BUSINESS PROFILE</span>
          <h1 style={styles.title}>Tell investors about your business</h1>
          <p style={styles.subtitle}>
            Create a clear business profile and explain what funding you
            are looking for.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.step}>01</span>

              <div>
                <h2 style={styles.sectionTitle}>Business Information</h2>
                <p style={styles.sectionDescription}>
                  Give investors a quick overview of your business.
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              <Field
                label="Business Name"
                name="business_name"
                placeholder="e.g. Savanna Fresh"
                value={business.business_name}
                onChange={handleChange}
                required
              />

              <Field
                label="Industry"
                name="industry"
                placeholder="e.g. Agriculture"
                value={business.industry}
                onChange={handleChange}
                required
              />

              <Field
                label="Location"
                name="location"
                placeholder="e.g. Nairobi, Kenya"
                value={business.location}
                onChange={handleChange}
                required
              />

              <Field
                label="Year Established"
                name="year_established"
                type="number"
                placeholder="e.g. 2022"
                value={business.year_established}
                onChange={handleChange}
              />

              <Field
                label="Number of Employees"
                name="employees"
                type="number"
                placeholder="e.g. 12"
                value={business.employees}
                onChange={handleChange}
              />
            </div>

            <label style={styles.label}>
              Business Description
              <textarea
                name="description"
                placeholder="What does your business do? What problem do you solve?"
                value={business.description}
                onChange={handleChange}
                style={styles.textarea}
                required
              />
            </label>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.step}>02</span>

              <div>
                <h2 style={styles.sectionTitle}>Financial Overview</h2>
                <p style={styles.sectionDescription}>
                  Help investors understand the financial position of your
                  business.
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              <Field
                label="Annual Revenue (KES)"
                name="annual_revenue"
                type="number"
                placeholder="e.g. 5000000"
                value={business.annual_revenue}
                onChange={handleChange}
              />

              <Field
                label="Monthly Gross Revenue (KES)"
                name="monthly_gross"
                type="number"
                placeholder="e.g. 500000"
                value={business.monthly_gross}
                onChange={handleChange}
              />

              <Field
                label="Monthly Net Profit (KES)"
                name="monthly_net"
                type="number"
                placeholder="e.g. 150000"
                value={business.monthly_net}
                onChange={handleChange}
              />
            </div>
          </section>

          <section style={styles.fundingSection}>
            <div style={styles.sectionHeader}>
              <span style={styles.fundingStep}>03</span>

              <div>
                <h2 style={styles.sectionTitle}>Funding Request</h2>
                <p style={styles.sectionDescription}>
                  Be specific about how much you need and how the investment
                  will help your business grow.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              Amount Seeking (KES)
              <div style={styles.moneyInput}>
                <span style={styles.currency}>KES</span>

                <input
                  name="amount_seeking"
                  type="number"
                  min="0"
                  placeholder="2,500,000"
                  value={business.amount_seeking}
                  onChange={handleChange}
                  style={styles.moneyField}
                  required
                />
              </div>
            </label>

            <label style={styles.label}>
              What will the funding be used for?
              <textarea
                name="funding_reason"
                placeholder="Example: We are seeking funding to purchase new equipment, expand production capacity and hire five additional employees..."
                value={business.funding_reason}
                onChange={handleChange}
                style={styles.fundingTextarea}
                required
              />

              <span style={styles.helperText}>
                Explain clearly how the investment will be used and what it
                will help your business achieve.
              </span>
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
              : "Create Business Profile"}
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

  moneyInput: {
    display: "flex",
    background: "#ffffff",
    border: "1px solid #86efac",
    borderRadius: "10px",
    overflow: "hidden",
  },

  currency: {
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: "800",
  },

  moneyField: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "16px",
    fontSize: "18px",
    fontWeight: "700",
    color: "#0b1f3a",
  },

  fundingTextarea: {
    minHeight: "160px",
    padding: "16px",
    border: "1px solid #86efac",
    borderRadius: "10px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    background: "#ffffff",
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

export default BusinessForm;