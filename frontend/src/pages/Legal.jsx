import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LEGAL_DOCS,
  SHOW_DRAFT_NOTICE,
  DRAFT_NOTICE,
} from "../data/legalContent";

// Renders any legal page from data/legalContent.js.
// Usage: <Legal doc="terms" /> (terms | privacy | risk | kyc | contact)
function Legal({ doc }) {
  const content = LEGAL_DOCS[doc];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [doc]);

  if (!content) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>Page not found</h1>
          <Link to="/" style={styles.link}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <span style={styles.eyebrow}>LEGAL</span>
        <h1 style={styles.title}>{content.title}</h1>

        {SHOW_DRAFT_NOTICE && (
          <div style={styles.draft}>{DRAFT_NOTICE}</div>
        )}

        {content.intro && <p style={styles.intro}>{content.intro}</p>}

        {content.sections.map((section, index) => (
          <section key={section.heading} style={styles.section}>
            <h2 style={styles.heading}>
              {content.sections.length > 5 && (
                <span style={styles.number}>{index + 1}.</span>
              )}
              {section.heading}
            </h2>

            {section.paragraphs?.map((text, i) => (
              <p key={i} style={styles.paragraph}>
                {text}
              </p>
            ))}

            {section.list && (
              <ul style={styles.list}>
                {section.list.map((item) => (
                  <li key={item} style={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {section.tbc && (
              <div style={styles.tbc}>
                <strong>To be confirmed: </strong>
                {section.tbc}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "70vh",
    background: "#f8fafc",
    padding: "60px 20px 80px",
  },
  container: {
    width: "100%",
    maxWidth: "820px",
    margin: "0 auto",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "40px 40px 24px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
    boxSizing: "border-box",
  },
  eyebrow: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },
  title: {
    color: "#0b1f3a",
    fontSize: "38px",
    margin: "12px 0 20px",
  },
  draft: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  intro: {
    color: "#64748b",
    fontSize: "17px",
    lineHeight: "1.7",
    marginBottom: "12px",
  },
  section: {
    borderTop: "1px solid #e2e8f0",
    padding: "22px 0",
  },
  heading: {
    color: "#0b1f3a",
    fontSize: "20px",
    margin: "0 0 12px",
  },
  number: {
    color: "#16a34a",
    marginRight: "10px",
  },
  paragraph: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.8",
    margin: "0 0 12px",
  },
  list: {
    margin: "0 0 12px",
    paddingLeft: "22px",
  },
  listItem: {
    color: "#334155",
    fontSize: "15px",
    lineHeight: "1.8",
    marginBottom: "4px",
  },
  tbc: {
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    color: "#64748b",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    lineHeight: "1.6",
  },
  link: {
    color: "#16a34a",
  },
};

export default Legal;