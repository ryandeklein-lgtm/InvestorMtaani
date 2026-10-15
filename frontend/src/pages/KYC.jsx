import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

// KRA PINs are a letter, nine digits and a letter (e.g. P051234567Z)
const KRA_PIN_PATTERN = /^[AP]\d{9}[A-Z]$/i;
const LEGACY_DRAFT_KEY = "investor_mtaani_business_kyc";

function hasLegacyDraft() {
  try {
    return localStorage.getItem(LEGACY_DRAFT_KEY) !== null;
  } catch {
    return false;
  }
}

const initialForm = {
  businessName: "",
  registrationNumber: "",
  businessType: "",
  kraPin: "",
  businessAddress: "",
  operatingAddress: "",
  county: "",
  directors: "",
  beneficialOwners: "",
  shareholding: "",
  certificateOfRegistration: "",
  cr12: "",
  articles: "",
  directorIds: "",
  kraDocument: "",
  businessLicence: "",
  financialStatements: "",
  managementAccounts: "",
  bankStatements: "",
  mpesaStatements: "",
  taxReturns: "",
  businessPlan: "",
  useOfFunds: "",
  existingLoans: "",
  existingInvestors: "",
  litigation: "",
  insolvency: "",
  declaration: false,
};

const documentFields = [
  {
    key: "certificateOfRegistration",
    title: "Certificate of Incorporation / Registration",
    description: "Official registration document for the business.",
    required: true,
  },
  {
    key: "cr12",
    title: "CR12 / Company Search",
    description: "Current ownership and directorship record where applicable.",
    required: true,
  },
  {
    key: "articles",
    title: "Articles / Constitutional Documents",
    description:
      "Memorandum and Articles of Association or equivalent, where applicable.",
    required: false,
  },
  {
    key: "directorIds",
    title: "Director / Beneficial Owner IDs",
    description: "Identification documents for relevant directors and owners.",
    required: true,
  },
  {
    key: "kraDocument",
    title: "KRA / Tax Documentation",
    description: "KRA PIN certificate or relevant tax documentation.",
    required: true,
  },
  {
    key: "businessLicence",
    title: "Business Licence / Permit",
    description: "Current licence or sector-specific approval where applicable.",
    required: false,
  },
  {
    key: "financialStatements",
    title: "Financial Statements",
    description: "2 to 3 years of financial statements where available.",
    required: true,
  },
  {
    key: "managementAccounts",
    title: "Recent Management Accounts",
    description: "Recent internal financial performance records.",
    required: false,
  },
  {
    key: "bankStatements",
    title: "Bank Statements",
    description: "Recent business bank statements for commercial verification.",
    required: false,
  },
  {
    key: "mpesaStatements",
    title: "M-Pesa / Payment Records",
    description:
      "Relevant payment records where they form part of business revenue.",
    required: false,
  },
  {
    key: "taxReturns",
    title: "Tax Returns",
    description: "Relevant filed tax returns where available.",
    required: false,
  },
  {
    key: "businessPlan",
    title: "Business Plan / Funding Proposal",
    description: "Your growth plan and the capital you are seeking.",
    required: true,
  },
  {
    key: "useOfFunds",
    title: "Use-of-Funds Statement",
    description: "A detailed breakdown of how the capital will be used.",
    required: true,
  },
];

function SectionHeader({ number, title, description }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionNumber}>{number}</div>

      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionDescription}>{description}</p>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const id = useId();

  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>

      <input
        id={id}
        className="kyc-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const id = useId();

  return (
    <div style={styles.fullField}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {required && <span style={styles.required}> *</span>}
      </label>

      <textarea
        id={id}
        className="kyc-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        style={styles.textarea}
      />
    </div>
  );
}

export default function KYC() {
  const { user } = useAuthContext();
  const [form, setForm] = useState(initialForm);
  const [hasOldDraft, setHasOldDraft] = useState(hasLegacyDraft);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const completion = useMemo(() => {
    const fields = [
      form.businessName,
      form.registrationNumber,
      form.businessType,
      form.kraPin,
      form.businessAddress,
      form.operatingAddress,
      form.county,
      form.directors,
      form.beneficialOwners,
      form.shareholding,
      form.certificateOfRegistration,
      form.cr12,
      form.directorIds,
      form.kraDocument,
      form.financialStatements,
      form.businessPlan,
      form.useOfFunds,
      form.declaration,
    ];

    const complete = fields.filter((field) => {
      if (typeof field === "boolean") {
        return field;
      }

      return String(field || "").trim() !== "";
    }).length;

    return Math.round((complete / fields.length) * 100);
  }, [form]);

  // This page remains a prototype until secure KYC storage and review APIs exist.
  const status = submitted
    ? "DRAFT COMPLETE"
    : completion === 100
    ? "READY TO COMPLETE"
    : completion > 0
    ? "IN PROGRESS"
    : "NOT STARTED";

  const removeOldDraft = () => {
    try {
      localStorage.removeItem(LEGACY_DRAFT_KEY);
      setHasOldDraft(false);
      setMessage("The earlier browser-saved KYC draft was removed.");
    } catch {
      setError("Could not remove the earlier browser-saved draft.");
    }
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleDocument = (field, event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateField(field, file.name);

    setMessage(`${file.name} selected locally. The file has not been uploaded.`);
  };

  const saveProgress = () => {
    setMessage(
      "This prototype cannot save KYC data securely yet. Your entries will be lost when you leave this page."
    );
  };

  const submitKYC = (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const requiredFields = [
      ["Business name", form.businessName],
      ["Registration number", form.registrationNumber],
      ["Business type", form.businessType],
      ["KRA PIN", form.kraPin],
      ["Registered address", form.businessAddress],
      ["Operating address", form.operatingAddress],
      ["County", form.county],
      ["Directors", form.directors],
      ["Beneficial owners", form.beneficialOwners],
      ["Shareholding structure", form.shareholding],
    ];

    const missingField = requiredFields.find(
      ([, value]) => !String(value || "").trim()
    );

    if (missingField) {
      setError(`Please complete ${missingField[0]}.`);
      return;
    }

    if (!KRA_PIN_PATTERN.test(form.kraPin.trim())) {
      setError(
        "KRA PIN format looks incorrect. It should be a letter, nine digits and a letter, for example P051234567Z."
      );
      return;
    }

    const missingDocument = documentFields.find(
      (document) =>
        document.required && !String(form[document.key] || "").trim()
    );

    if (missingDocument) {
      setError(`Please provide ${missingDocument.title}.`);
      return;
    }

    if (!form.declaration) {
      setError("Please accept the declaration before submitting.");
      return;
    }

    setSubmitted(true);

    setMessage(
      "This is a local draft only. It has not been uploaded or submitted for review."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const editKYC = () => {
    setSubmitted(false);
    setMessage("You can now edit your KYC information.");
  };

  if (user?.role === "investor") {
    return (
      <div style={styles.page}>
        <main style={styles.container}>
          <header style={styles.header}>
            <div>
              <div style={styles.eyebrow}>INVESTOR MTAANI / VERIFICATION</div>
              <h1 style={styles.title}>Investor verification & KYC</h1>
              <p style={styles.subtitle}>
                These are the details that may be requested before investor features are approved.
              </p>
            </div>
          </header>
          <section style={styles.card}>
            <SectionHeader
              number="01"
              title="Information to prepare"
              description="Requirements depend on your investor type and applicable law."
            />
            <ul style={styles.kycChecklist}>
              <li>Full name or legal entity name and investor type</li>
              <li>National ID or passport for individuals; registration and ownership details for organizations</li>
              <li>Email, mobile number, and residential or registered address</li>
              <li>Occupation or business activity and source-of-funds information</li>
              <li>Investment sectors, preferred structure (debt, equity, or both), and typical investment size</li>
              <li>Any declarations or screening information required for the service and by law</li>
            </ul>
          </section>
          <section style={styles.card}>
            <SectionHeader
              number="02"
              title="Investor acknowledgement"
              description="Review this before requesting access to an opportunity."
            />
            <p style={styles.reviewText}>
              I understand that investments carry risk, including the possible loss of invested capital. I understand that Investor Mtaani does not guarantee investment returns, repayment, profitability, or future business performance. I am responsible for my own investment decision and may seek independent professional advice.
            </p>
            <p style={styles.notice}>
              Secure identity-document upload and investor KYC submission are not connected yet. Do not enter ID numbers, source-of-funds details, or upload documents on this page. See the <Link to="/privacy" style={styles.link}>Privacy Policy</Link> for the draft data-handling information.
            </p>
            <Link to="/investor/create" style={styles.verificationButton}>
              Continue to investor profile
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        .kyc-input:focus-visible {
          outline: 2px solid #3DD6F5;
          outline-offset: 1px;
          border-color: #3DD6F5;
        }
      `}</style>

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <main style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>INVESTOR MTAANI / VERIFICATION</div>

            <h1 style={styles.title}>
              Business Verification
              <span style={styles.cyan}> & KYC</span>
            </h1>

            <p style={styles.subtitle}>
              Complete your business verification before your opportunity is
              presented to investors.
            </p>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>KYC STATUS</div>

            <div
              style={{
                ...styles.statusValue,
                color:
                  status === "DRAFT SAVED"
                    ? "#F1C75B"
                    : status === "READY TO COMPLETE"
                    ? "#35D07F"
                    : "#3DD6F5",
              }}
            >
              {status}
            </div>
          </div>
        </header>

        <div style={styles.notice} role="note">
          Secure business KYC submission and document upload are not available yet. This prototype does not send or securely save the information entered here. Do not enter real ID numbers, KRA PINs, ownership details, or select sensitive documents. You can review the requirements, but wait for the secure verification process before submitting real information.
          <div style={{ marginTop: 8 }}>
            Read the <Link to="/privacy" style={styles.link}>Privacy Policy</Link> for the current draft data-handling information.
          </div>
        </div>

        {hasOldDraft && (
          <div style={styles.notice}>
            An earlier version of this page may have saved KYC entries in this browser. The old draft is no longer used. You can remove that local copy here.
            <button type="button" onClick={removeOldDraft} style={styles.clearDraftButton}>
              Remove old local draft
            </button>
          </div>
        )}

        {message && (
          <div style={styles.success}>
            <span>✓ </span>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.error} role="alert">
            <span>! </span>
            {error}
          </div>
        )}

        <section style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <div>
              <div style={styles.progressLabel}>VERIFICATION PROGRESS</div>

              <div style={styles.progressPercent}>{completion}%</div>
            </div>

            <div style={styles.progressHint}>
              Complete all required information
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${completion}%`,
              }}
            />
          </div>
        </section>

        {submitted ? (
          <section style={styles.reviewCard}>
            <div style={styles.reviewIcon}>✓</div>

            <div>
              <div style={styles.eyebrow}>LOCAL SESSION REVIEW</div>

              <h2 style={styles.reviewTitle}>Your KYC draft is complete for this session.</h2>

              <p style={styles.reviewText}>
                Your entries are held temporarily in this page and will be lost
                when you leave. They have not been uploaded or submitted for
                review. Verification does not constitute an investment
                recommendation or guarantee.
              </p>

              <button
                type="button"
                onClick={editKYC}
                style={styles.secondaryButton}
              >
                Edit KYC Information
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={submitKYC}>
            <section style={styles.card}>
              <SectionHeader
                number="01"
                title="Business Identity"
                description="Tell us exactly who the business is and where it operates."
              />

              <div style={styles.grid}>
                <InputField
                  label="Registered Business Name"
                  required
                  value={form.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                  placeholder="e.g. Mwangaza Foods Ltd"
                />

                <InputField
                  label="Registration Number"
                  required
                  value={form.registrationNumber}
                  onChange={(event) =>
                    updateField("registrationNumber", event.target.value)
                  }
                  placeholder="Business registration number"
                />

                <InputField
                  label="Business Type / Sector"
                  required
                  value={form.businessType}
                  onChange={(event) =>
                    updateField("businessType", event.target.value)
                  }
                  placeholder="e.g. Limited Company / Agribusiness"
                />

                <InputField
                  label="KRA PIN"
                  required
                  value={form.kraPin}
                  onChange={(event) =>
                    updateField("kraPin", event.target.value)
                  }
                  placeholder="e.g. P051234567Z"
                />

                <InputField
                  label="County"
                  required
                  value={form.county}
                  onChange={(event) =>
                    updateField("county", event.target.value)
                  }
                  placeholder="e.g. Kajiado"
                />

                <InputField
                  label="Registered Address"
                  required
                  value={form.businessAddress}
                  onChange={(event) =>
                    updateField("businessAddress", event.target.value)
                  }
                  placeholder="Address on your registration documents"
                />

                <InputField
                  label="Operating Address"
                  required
                  value={form.operatingAddress}
                  onChange={(event) =>
                    updateField("operatingAddress", event.target.value)
                  }
                  placeholder="Write 'Same as registered' if identical"
                />
              </div>
            </section>

            <section style={styles.card}>
              <SectionHeader
                number="02"
                title="Ownership & Control"
                description="Provide directors, beneficial owners and the ownership structure."
              />

              <div style={styles.grid}>
                <TextAreaField
                  label="Directors"
                  required
                  value={form.directors}
                  onChange={(event) =>
                    updateField("directors", event.target.value)
                  }
                  placeholder="List directors and their roles."
                />

                <TextAreaField
                  label="Beneficial Owners"
                  required
                  value={form.beneficialOwners}
                  onChange={(event) =>
                    updateField("beneficialOwners", event.target.value)
                  }
                  placeholder="List individuals who ultimately own or control the business."
                />

                <TextAreaField
                  label="Shareholding Structure"
                  required
                  value={form.shareholding}
                  onChange={(event) =>
                    updateField("shareholding", event.target.value)
                  }
                  placeholder="Example: Jane Doe 60%, John Doe 40%"
                />
              </div>
            </section>

            <section style={styles.card}>
              <SectionHeader
                number="03"
                title="Verification Documents"
                description="Select the documents that support your business information."
              />

              <div style={styles.documents}>
                {documentFields.map((document) => (
                  <div key={document.key} style={styles.document}>
                    <div style={styles.documentIcon}>
                      {form[document.key] ? "✓" : "↑"}
                    </div>

                    <div style={styles.documentContent}>
                      <div style={styles.documentTitle}>{document.title}</div>

                      <div style={styles.documentDescription}>
                        {document.description}
                      </div>

                      <label style={styles.uploadButton}>
                        {form[document.key]
                          ? "Change Document"
                          : "Select Document"}

                        <input
                          type="file"
                          onChange={(event) =>
                            handleDocument(document.key, event)
                          }
                          style={{ display: "none" }}
                        />
                      </label>

                      {document.required && (
                        <span style={styles.requiredBadge}>REQUIRED</span>
                      )}

                      {form[document.key] && (
                        <div style={styles.fileName}>
                          ✓ {form[document.key]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.notice}>
                <strong>Document handling:</strong> This initial frontend
                version records selected document names locally. Secure
                server-side document storage will be connected when the backend
                KYC system is implemented.
              </div>
            </section>

            <section style={styles.card}>
              <SectionHeader
                number="04"
                title="Financial & Commercial Information"
                description="Provide information that helps establish the commercial position of the business."
              />

              <div style={styles.grid}>
                <TextAreaField
                  label="Existing Loans / Liabilities"
                  value={form.existingLoans}
                  onChange={(event) =>
                    updateField("existingLoans", event.target.value)
                  }
                  placeholder="Describe material loans, liabilities or financing arrangements. Write 'None' if applicable."
                />

                <TextAreaField
                  label="Existing Investors"
                  value={form.existingInvestors}
                  onChange={(event) =>
                    updateField("existingInvestors", event.target.value)
                  }
                  placeholder="List current investors or financing arrangements. Write 'None' if applicable."
                />
              </div>
            </section>

            <section style={styles.card}>
              <SectionHeader
                number="05"
                title="Compliance & Declarations"
                description="Declare material legal, regulatory and financial matters."
              />

              <div style={styles.grid}>
                <TextAreaField
                  label="Litigation / Disputes"
                  value={form.litigation}
                  onChange={(event) =>
                    updateField("litigation", event.target.value)
                  }
                  placeholder="Describe material current or threatened litigation or disputes. Write 'None' if applicable."
                />

                <TextAreaField
                  label="Insolvency / Bankruptcy"
                  value={form.insolvency}
                  onChange={(event) =>
                    updateField("insolvency", event.target.value)
                  }
                  placeholder="Describe insolvency, liquidation or similar proceedings. Write 'None' if applicable."
                />
              </div>

              <p style={styles.privacyNote}>
                We collect this information to verify your business and meet
                KYC and anti-money-laundering obligations. See our{" "}
                <Link to="/privacy" style={styles.link}>
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/kyc-policy" style={styles.link}>
                  KYC Policy
                </Link>
                .
              </p>

              <label style={styles.declaration}>
                <input
                  type="checkbox"
                  checked={form.declaration}
                  onChange={(event) =>
                    updateField("declaration", event.target.checked)
                  }
                  style={styles.checkbox}
                />

                <span>
                  I confirm that the information and documents provided to
                  Investor Mtaani are accurate, complete and not misleading. I
                  confirm that all material liabilities, owners, beneficial
                  owners and relevant disputes have been disclosed. I
                  understand that false or misleading information may result in
                  rejection, suspension, removal and/or legal action.
                </span>
              </label>
            </section>

            <section style={styles.finalCard}>
              <div>
                <div style={styles.eyebrow}>06 / FINAL STEP</div>

                <h2 style={styles.finalTitle}>Ready to complete your draft?</h2>

                <p style={styles.finalText}>
                  Review your entries in this session. They will not be saved
                  after you leave this page, and online submission for review
                  is not available yet.
                </p>
              </div>

              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={saveProgress}
                  style={styles.secondaryButton}
                >
                  Check progress
                </button>

                <button type="submit" style={styles.primaryButton}>
                  Complete KYC Draft →
                </button>
              </div>
            </section>
          </form>
        )}

        <div style={styles.disclaimer}>
          <strong>Important:</strong> Completing KYC does not mean that a
          business has been approved for investment. Verification does not
          constitute an investment recommendation or guarantee. Investment
          decisions remain independent.
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#060911",
    color: "#F5F7FA",
    padding: "44px 20px 90px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
  },

  glowOne: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(61,214,245,0.055)",
    filter: "blur(100px)",
    top: "-200px",
    left: "-150px",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(139,124,246,0.055)",
    filter: "blur(100px)",
    right: "-180px",
    bottom: "-200px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#3DD6F5",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(32px, 5vw, 56px)",
    lineHeight: 1,
    letterSpacing: "-0.045em",
    fontWeight: 800,
  },

  cyan: {
    color: "#3DD6F5",
  },

  subtitle: {
    maxWidth: "650px",
    color: "#8491A5",
    fontSize: "14px",
    lineHeight: 1.7,
    marginTop: "16px",
  },

  statusCard: {
    minWidth: "185px",
    background: "#0E1626",
    border: "1px solid rgba(61,214,245,0.18)",
    borderRadius: "14px",
    padding: "18px",
  },

  statusLabel: {
    color: "#657389",
    fontSize: "9px",
    letterSpacing: "0.15em",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: "7px",
  },

  statusValue: {
    fontSize: "13px",
    fontWeight: 800,
  },

  success: {
    padding: "14px 16px",
    background: "rgba(53,208,127,0.08)",
    border: "1px solid rgba(53,208,127,0.25)",
    borderRadius: "11px",
    color: "#7CE5AE",
    marginBottom: "18px",
    fontSize: "13px",
  },

  error: {
    padding: "14px 16px",
    background: "rgba(255,80,80,0.08)",
    border: "1px solid rgba(255,80,80,0.25)",
    borderRadius: "11px",
    color: "#FF9A9A",
    marginBottom: "18px",
    fontSize: "13px",
  },

  progressCard: {
    background: "#0E1626",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "20px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "13px",
  },

  progressLabel: {
    color: "#657389",
    fontSize: "9px",
    letterSpacing: "0.15em",
    fontFamily: "'JetBrains Mono', monospace",
  },

  progressPercent: {
    color: "#3DD6F5",
    fontSize: "24px",
    fontWeight: 800,
    marginTop: "3px",
  },

  progressHint: {
    color: "#657389",
    fontSize: "11px",
  },

  progressTrack: {
    height: "6px",
    background: "#182235",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #3DD6F5, #8B7CF6)",
    borderRadius: "999px",
    transition: "width 0.25s ease",
  },

  card: {
    background: "#0E1626",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "17px",
    padding: "28px",
    marginBottom: "18px",
  },

  sectionHeader: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    marginBottom: "26px",
  },

  sectionNumber: {
    width: "40px",
    height: "40px",
    minWidth: "40px",
    display: "grid",
    placeItems: "center",
    background: "rgba(61,214,245,0.07)",
    border: "1px solid rgba(61,214,245,0.18)",
    borderRadius: "10px",
    color: "#3DD6F5",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: 800,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "21px",
    letterSpacing: "-0.02em",
  },

  sectionDescription: {
    margin: "6px 0 0",
    color: "#68768B",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    minWidth: 0,
  },

  fullField: {
    gridColumn: "1 / -1",
  },

  label: {
    display: "block",
    color: "#B7C1CF",
    fontSize: "11px",
    fontWeight: 700,
    marginBottom: "8px",
  },

  required: {
    color: "#3DD6F5",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "9px",
    border: "1px solid #25324A",
    background: "#111C2F",
    color: "#F5F7FA",
    fontSize: "13px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "9px",
    border: "1px solid #25324A",
    background: "#111C2F",
    color: "#F5F7FA",
    fontSize: "13px",
    lineHeight: 1.6,
    resize: "vertical",
  },

  documents: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "15px",
  },

  document: {
    display: "flex",
    gap: "13px",
    background: "#111C2F",
    border: "1px solid #25324A",
    borderRadius: "13px",
    padding: "17px",
  },

  documentIcon: {
    width: "35px",
    height: "35px",
    minWidth: "35px",
    display: "grid",
    placeItems: "center",
    background: "rgba(139,124,246,0.09)",
    border: "1px solid rgba(139,124,246,0.18)",
    borderRadius: "9px",
    color: "#8B7CF6",
    fontWeight: 800,
  },

  documentContent: {
    minWidth: 0,
  },

  documentTitle: {
    color: "#E1E7EF",
    fontSize: "12px",
    fontWeight: 800,
  },

  documentDescription: {
    color: "#68768B",
    fontSize: "10px",
    lineHeight: 1.5,
    marginTop: "4px",
    marginBottom: "12px",
  },

  uploadButton: {
    display: "inline-block",
    padding: "8px 11px",
    border: "1px solid rgba(61,214,245,0.25)",
    borderRadius: "7px",
    background: "rgba(61,214,245,0.05)",
    color: "#5DD9F2",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  requiredBadge: {
    marginLeft: "7px",
    color: "#F1C75B",
    fontSize: "8px",
    fontFamily: "'JetBrains Mono', monospace",
  },

  fileName: {
    marginTop: "9px",
    color: "#6DDC9A",
    fontSize: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  notice: {
    marginTop: "18px",
    padding: "13px",
    background: "rgba(241,199,91,0.04)",
    border: "1px solid rgba(241,199,91,0.13)",
    borderRadius: "9px",
    color: "#8F886F",
    fontSize: "10px",
    lineHeight: 1.6,
  },

  privacyNote: {
    margin: "22px 0 0",
    color: "#68768B",
    fontSize: "11px",
    lineHeight: 1.7,
  },

  link: {
    color: "#5DD9F2",
  },

  declaration: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    marginTop: "14px",
    padding: "17px",
    background: "#111C2F",
    border: "1px solid #25324A",
    borderRadius: "11px",
    color: "#909CAE",
    fontSize: "11px",
    lineHeight: 1.7,
    cursor: "pointer",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    minWidth: "16px",
    marginTop: "2px",
    accentColor: "#3DD6F5",
  },

  finalCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    background:
      "linear-gradient(135deg, rgba(61,214,245,0.07), rgba(139,124,246,0.07))",
    border: "1px solid rgba(61,214,245,0.16)",
    borderRadius: "17px",
    padding: "28px",
  },

  finalTitle: {
    margin: 0,
    fontSize: "23px",
  },

  finalText: {
    color: "#69768A",
    fontSize: "12px",
    marginTop: "7px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  primaryButton: {
    border: "none",
    borderRadius: "9px",
    background: "#3DD6F5",
    color: "#041018",
    padding: "13px 17px",
    fontWeight: 800,
    fontSize: "11px",
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #33425D",
    borderRadius: "9px",
    background: "#111C2F",
    color: "#D4DCE7",
    padding: "13px 17px",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },

  reviewCard: {
    display: "flex",
    gap: "20px",
    background: "#0E1626",
    border: "1px solid rgba(241,199,91,0.2)",
    borderRadius: "17px",
    padding: "30px",
  },

  reviewIcon: {
    width: "50px",
    height: "50px",
    minWidth: "50px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "rgba(241,199,91,0.08)",
    border: "1px solid rgba(241,199,91,0.25)",
    color: "#F1C75B",
    fontSize: "21px",
    fontWeight: 800,
  },

  reviewTitle: {
    margin: 0,
    fontSize: "26px",
  },

  reviewText: {
    color: "#78869A",
    fontSize: "13px",
    lineHeight: 1.7,
    maxWidth: "700px",
    margin: "10px 0 20px",
  },

  clearDraftButton: {
    display: "block",
    marginTop: "10px",
    border: "1px solid #64748b",
    borderRadius: "7px",
    background: "transparent",
    color: "#e2e8f0",
    padding: "8px 11px",
    fontSize: "11px",
    cursor: "pointer",
  },

  verificationButton: {
    display: "inline-block",
    marginTop: "8px",
    padding: "12px 16px",
    borderRadius: "9px",
    background: "#3DD6F5",
    color: "#041018",
    fontSize: "12px",
    fontWeight: 800,
    textDecoration: "none",
  },

  kycChecklist: {
    margin: "0",
    paddingLeft: "24px",
    color: "#B7C1CF",
    fontSize: "13px",
    lineHeight: 1.8,
  },

  disclaimer: {
    textAlign: "center",
    maxWidth: "850px",
    margin: "25px auto 0",
    color: "#566276",
    fontSize: "10px",
    lineHeight: 1.7,
  },
};
