import { useCallback, useEffect, useState } from "react";
import { getBusinessNews } from "../services/newsService";
import NewsCard from "./NewsCard";

const categories = [
  { label: "All", value: "" },
  { label: "FinTech", value: "fintech" },
  { label: "AgriTech", value: "agritech" },
  { label: "HealthTech", value: "healthtech" },
  { label: "EdTech", value: "edtech" },
  { label: "Clean Energy", value: "clean-energy" },
  { label: "AI", value: "ai" },
];

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState("");

  const loadNews = useCallback(async (category) => {
    try {
      const news = await getBusinessNews(category);
      setArticles(news);
      setError("");
    } catch (error) {
      console.error(error);
      setArticles([]);
      setError("We couldn’t load the news right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const sources = [...new Set(articles.map((article) => article.source?.name).filter(Boolean))].sort();
  const visibleArticles = selectedSource
    ? articles.filter((article) => article.source?.name === selectedSource)
    : articles;

  useEffect(() => {
    const timer = window.setTimeout(() => loadNews(selectedCategory), 0);
    return () => window.clearTimeout(timer);
  }, [loadNews, selectedCategory]);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Latest Business News</h2>

        <p style={styles.subtitle}>
          Follow African business news, like the stories that matter and share
          useful reads with your network.
        </p>

        <div style={styles.categories}>
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => {
                if (selectedCategory !== category.value) setLoading(true);
                setSelectedSource("");
                setSelectedCategory(category.value);
              }}
              style={{
                ...styles.categoryButton,
                background:
                  selectedCategory === category.value
                    ? "#16a34a"
                    : "#ffffff",
                color:
                  selectedCategory === category.value
                    ? "#ffffff"
                    : "#0f172a",
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        {!loading && sources.length > 1 && (
          <div role="group" style={styles.sourceFilters} aria-label="Filter news by publisher">
            <span style={styles.sourceLabel}>PUBLISHER</span>
            <button type="button" onClick={() => setSelectedSource("")} aria-pressed={!selectedSource} style={{ ...styles.sourceButton, ...(selectedSource ? {} : styles.sourceButtonActive) }}>
              All sources
            </button>
            {sources.map((source) => (
              <button key={source} type="button" onClick={() => setSelectedSource(source)} aria-pressed={selectedSource === source} style={{ ...styles.sourceButton, ...(selectedSource === source ? styles.sourceButtonActive : {}) }}>
                {source}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <h3 role="status" style={{ textAlign: "center", marginTop: 40 }}>
            Loading news...
          </h3>
        ) : (
          <div style={styles.grid}>
            {visibleArticles.length > 0 ? (
              visibleArticles.map((article) => (
                <NewsCard key={article.url} article={article} />
              ))
            ) : (
              <div role={error ? "alert" : "status"} style={styles.emptyState}>
                <h3>{error ? "News is temporarily unavailable" : selectedSource ? `No ${selectedSource} articles in this category` : "No news available"}</h3>
                <p>{error || "Try another category or check back soon for more updates."}</p>
                {error && <button type="button" onClick={() => { setLoading(true); loadNews(selectedCategory); }} style={styles.retryButton}>Try again</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "80px 8%",
    background: "#f8fafc",
  },

  container: {
    maxWidth: "1300px",
    margin: "0 auto",
  },

  title: {
    fontSize: "38px",
    textAlign: "center",
    marginBottom: "15px",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "35px",
    fontSize: "18px",
  },

  categories: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "40px",
  },

  sourceFilters: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    margin: "-18px 0 34px",
  },
  sourceLabel: { color: "#64748b", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", marginRight: 4 },
  sourceButton: { border: "1px solid #cbd5e1", borderRadius: 999, padding: "7px 12px", background: "#fff", color: "#334155", cursor: "pointer", fontSize: 12, fontWeight: 650 },
  sourceButtonActive: { borderColor: "#0f766e", background: "#0f766e", color: "#fff" },
  emptyState: { gridColumn: "1 / -1", textAlign: "center", padding: "26px 16px", color: "#334155" },
  retryButton: { border: 0, borderRadius: 8, padding: "10px 16px", background: "#0f766e", color: "#fff", cursor: "pointer", fontWeight: 700 },

  categoryButton: {
    border: "1px solid #16a34a",
    padding: "10px 18px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "25px",
  },
};
