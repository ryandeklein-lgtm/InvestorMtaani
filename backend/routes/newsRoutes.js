const express = require("express");
const router = express.Router();

router.get("/business-news", async (req, res) => {
  try {
    const category = req.query.category || "";

    let query = "Africa AND (investment OR startup OR business)";

    switch (category.toLowerCase()) {
      case "fintech":
        query = "Africa fintech startups";
        break;

      case "agritech":
        query = "Africa agritech startups";
        break;

      case "healthtech":
        query = "Africa healthtech startups";
        break;

      case "edtech":
        query = "Africa edtech startups";
        break;

      case "ai":
        query = "Africa artificial intelligence startups";
        break;

      case "clean-energy":
        query = "Africa clean energy startups";
        break;

      default:
        query = "Africa AND (investment OR startup OR business)";
    }

    const url =
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}` +
      `&language=en` +
      `&sortBy=publishedAt` +
      `&pageSize=12` +
      `&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "ok") {
      return res.status(500).json({
        success: false,
        message: data.message || "Failed to fetch news",
      });
    }

    const articles = data.articles.filter(
      (article) =>
        article.title &&
        article.description &&
        article.urlToImage &&
        article.url
    );

    res.json({
      success: true,
      totalResults: articles.length,
      articles,
    });

  } catch (error) {
    console.error("News fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;