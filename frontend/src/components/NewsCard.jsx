
import { useState } from "react";

export default function NewsCard({ article }) {
  const publishedDate = article.publishedAt ? new Date(article.publishedAt) : null;
  const hasPublishedDate = publishedDate && !Number.isNaN(publishedDate.getTime());
  const likeKey = `investor-mtaani:news-like:${article.url}`;
  const [liked, setLiked] = useState(() => {
    try {
      return window.localStorage.getItem(likeKey) === "true";
    } catch {
      return false;
    }
  });
  const [shareMessage, setShareMessage] = useState("");

  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    try {
      window.localStorage.setItem(likeKey, String(nextLiked));
    } catch {
      // Keep the reaction interactive if browser storage is unavailable.
    }
  };

  const shareArticle = async () => {
    const shareData = {
      title: article.title,
      text: article.description || article.title,
      url: article.url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Article shared");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(article.url);
        setShareMessage("Article link copied");
      } else {
        setShareMessage("Open Read More to copy the article link");
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareMessage("Could not share this article");
    }
    window.setTimeout(() => setShareMessage(""), 3000);
  };

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
            {hasPublishedDate ? <time dateTime={publishedDate.toISOString()}>{publishedDate.toLocaleDateString()}</time> : "Date unavailable"}
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
        <div style={styles.actions}>
          <button type="button" onClick={toggleLike} aria-pressed={liked} style={{ ...styles.actionButton, ...(liked ? styles.actionLiked : {}) }}>
            <span aria-hidden="true">{liked ? "♥" : "♡"}</span> {liked ? "Liked" : "Like"}
          </button>
          <button type="button" onClick={shareArticle} style={styles.actionButton}>
            <span aria-hidden="true">↗</span> Share
          </button>
          {shareMessage && <span role="status" style={styles.shareStatus}>{shareMessage}</span>}
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

  actions: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    marginTop: 17,
    paddingTop: 13,
    borderTop: "1px solid #e2e8f0",
  },

  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: 0,
    padding: "6px 0",
    background: "transparent",
    color: "#475569",
    cursor: "pointer",
    font: "inherit",
    fontSize: 13,
    fontWeight: 700,
  },

  actionLiked: { color: "#e11d48" },
  shareStatus: { color: "#0f766e", fontSize: 12, marginLeft: "auto" },

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
