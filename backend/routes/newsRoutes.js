const express = require("express");
const router = express.Router();

const NEWS_FEEDS = [
  { name: "Business Daily Africa", url: "https://www.businessdailyafrica.com/bd/rss.xml" },
  { name: "TechCabal", url: "https://techcabal.com/feed/" },
  { name: "Disrupt Africa", url: "https://disruptafrica.com/feed/" },
  { name: "Business Day", url: "https://www.businessday.co.za/arc/outboundfeeds/rss/category/companies/" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
];

const CATEGORY_TERMS = {
  fintech: /fintech|financial technology|digital payments?|mobile money|digital lending|insurtech/i,
  agritech: /agritech|agri-tech|agriculture|agribusiness|farmers?|food systems?/i,
  healthtech: /healthtech|health tech|healthcare|digital health|telemedicine|medtech/i,
  edtech: /edtech|education technology|online learning|education|e-learning/i,
  "clean-energy": /clean energy|renewable energy|solar|wind power|battery storage|climate tech/i,
  ai: /artificial intelligence|\bAI\b|machine learning|generative AI|robotics/i,
};
const GENERAL_BUSINESS_TERMS = /startup|start-up|business|investment|investor|funding|venture capital|\bVC\b|fintech|agritech|healthtech|edtech|company|companies|market|economy|entrepreneur|small business|\bSME\b|acquisition|capital raise|Africa/i;

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'");
}

function readTag(xml, tag) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}\\s*>`, "i"));
  return match?.[1] || "";
}

function readAttribute(xml, tag, attribute) {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tagMatch = xml.match(new RegExp(`<${escapedTag}\\b([^>]*)>`, "i"));
  const attributeMatch = tagMatch?.[1].match(new RegExp(`${escapedAttribute}=["']([^"']+)["']`, "i"));
  return attributeMatch?.[1] || "";
}

function plainText(value = "", maxLength = 280) {
  const text = decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

function parseFeed(xml, sourceName) {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item\s*>/gi)];
  return items.map(([, item]) => {
    const image = readAttribute(item, "media:content", "url") || readAttribute(item, "media:thumbnail", "url") || readAttribute(item, "enclosure", "url");
    const url = plainText(readTag(item, "link"), 1000);
    const title = plainText(readTag(item, "title"), 240);
    const description = plainText(readTag(item, "description") || readTag(item, "content:encoded"));
    const publishedAt = plainText(readTag(item, "pubDate") || readTag(item, "dc:date"), 100);

    if (!title || !url || !/^https?:\/\//i.test(url)) return null;
    return {
      title,
      description,
      urlToImage: image && /^https?:\/\//i.test(image) ? decodeXml(image) : null,
      url,
      source: { name: sourceName },
      publishedAt: Number.isNaN(Date.parse(publishedAt)) ? null : new Date(publishedAt).toISOString(),
    };
  }).filter(Boolean);
}

function matchesCategory(article, category) {
  const content = `${article.title} ${article.description}`;
  const categoryPattern = CATEGORY_TERMS[category];
  return categoryPattern ? categoryPattern.test(content) : GENERAL_BUSINESS_TERMS.test(content);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "InvestorMtaaniNews/1.0" },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`${feed.name} returned ${response.status}`);
  return parseFeed(await response.text(), feed.name);
}

const FEED_CACHE_TTL_MS = 3 * 60 * 1000;
let feedCache = { fetchedAt: 0, articles: [], availableSources: 0 };
let feedRefreshPromise = null;

async function getFeedArticles() {
  if (Date.now() - feedCache.fetchedAt < FEED_CACHE_TTL_MS) return feedCache;
  if (feedRefreshPromise) return feedRefreshPromise;

  feedRefreshPromise = Promise.allSettled(NEWS_FEEDS.map(fetchFeed))
    .then((results) => {
      const articles = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
      const availableSources = results.filter((result) => result.status === "fulfilled").length;
      results.forEach((result, index) => {
        if (result.status === "rejected") console.warn(`News feed unavailable (${NEWS_FEEDS[index].name}):`, result.reason?.message || result.reason);
      });
      feedCache = { fetchedAt: Date.now(), articles, availableSources };
      return feedCache;
    })
    .finally(() => { feedRefreshPromise = null; });

  return feedRefreshPromise;
}

async function fetchNewsApi(category) {
  if (!process.env.NEWS_API_KEY) return [];

  const queryByCategory = {
    fintech: "Africa fintech startup",
    agritech: "Africa agritech agriculture startup",
    healthtech: "Africa healthtech healthcare startup",
    edtech: "Africa edtech education startup",
    "clean-energy": "Africa clean energy renewable startup",
    ai: "Africa artificial intelligence startup",
  };
  const query = queryByCategory[category] || "Africa AND (investment OR startup OR business)";
  const params = new URLSearchParams({
    q: query,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "30",
    apiKey: process.env.NEWS_API_KEY,
  });
  const response = await fetch(`https://newsapi.org/v2/everything?${params}`, { signal: AbortSignal.timeout(7000) });
  const data = await response.json();
  if (!response.ok || data.status !== "ok") throw new Error(data.message || "News API request failed");

  return (data.articles || []).filter((article) => article.title && article.url).map((article) => ({
    ...article,
    description: plainText(article.description || ""),
    source: { name: article.source?.name || "News API" },
  }));
}

router.get("/business-news", async (req, res) => {
  const category = String(req.query.category || "").toLowerCase();
  try {
    const [feedData, newsApiResult] = await Promise.all([
      getFeedArticles(),
      fetchNewsApi(category).catch((error) => {
        console.warn("Optional News API source unavailable:", error.message);
        return [];
      }),
    ]);
    if (!feedData.availableSources && !newsApiResult.length) {
      return res.status(503).json({ success: false, message: "News sources are temporarily unavailable." });
    }
    const feedArticles = feedData.articles;
    const combined = [...feedArticles, ...newsApiResult]
      .filter((article) => matchesCategory(article, category))
      .filter((article, index, all) => all.findIndex((candidate) => candidate.url === article.url) === index)
      .sort((left, right) => (Date.parse(right.publishedAt || "") || 0) - (Date.parse(left.publishedAt || "") || 0))
      .slice(0, 30);

    res.json({ success: true, totalResults: combined.length, articles: combined });
  } catch (error) {
    console.error("News aggregation error:", error);
    res.status(500).json({ success: false, message: "News sources are temporarily unavailable." });
  }
});

module.exports = router;
