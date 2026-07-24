import { useEffect, useState } from "react";
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
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadNews(selectedCategory);
  }, [selectedCategory]);

  async function loadNews(category) {
    setLoading(true);

    try {
      const news = await getBusinessNews(category);
      setArticles(news);
    } catch (error) {
      console.error(error);
      setArticles([]);
    }

    setLoading(false);
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h2 style={styles.title}>Latest Business News</h2>

        <p style={styles.subtitle}>
          Stay updated with African startups, investment trends and business
          opportunities.
        </p>

        <div style={styles.categories}>
          {categories.map((category) => (
            <button
              key={category.label}
              onClick={() => setSelectedCategory(category.value)}
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

        {loading ? (
          <h3 style={{ textAlign: "center", marginTop: 40 }}>
            Loading news...
          </h3>
        ) : (
          <div style={styles.grid}>
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <NewsCard key={index} article={article} />
              ))
            ) : (
              <h3>No news available.</h3>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "25px",
  },
};