import React from "react";

export default function NewsCard({ article }) {
  return (
    <div style={styles.card}>
      <img
        src={
          article.urlToImage ||
          "https://via.placeholder.com/600x300?text=Investor+Mtaani"
        }
        alt={article.title}
        style={styles.image}
      />

      <div style={styles.content}>
        <span style={styles.source}>
          {article.source?.name || "Investor Mtaani"}
        </span>

        <h3 style={styles.title}>
          {article.title}
        </h3>

        <p style={styles.description}>
          {article.description}
        </p>

        <div style={styles.footer}>
          <small style={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </small>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.button}
          >
            Read More →
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    transition: "0.25s",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },

  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },

  source: {
    color: "#16a34a",
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "10px",
  },

  title: {
    fontSize: "22px",
    color: "#0f172a",
    marginBottom: "12px",
    lineHeight: "1.4",
  },

  description: {
    color: "#64748b",
    lineHeight: "1.7",
    flexGrow: 1,
  },

  footer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    color: "#94a3b8",
  },

  button: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },
};