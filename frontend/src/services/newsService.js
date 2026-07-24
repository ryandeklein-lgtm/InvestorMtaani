import api from "./api";

export const getBusinessNews = async (category = "") => {
  try {
    const url = category
      ? `/news/business-news?category=${encodeURIComponent(category)}`
      : "/news/business-news";

    const response = await api.get(url);

    return response.data.articles || [];
  } catch (error) {
    console.error("Failed to fetch news:", error);

    // Fallback news for development/demo
    return [
      {
        title: "Kenyan FinTech startups continue attracting investors",
        description:
          "African fintech companies continue to lead venture capital funding across the continent, with Kenya remaining one of the strongest startup ecosystems.",
        urlToImage:
          "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200",
        url: "#",
        source: {
          name: "Investor Mtaani",
        },
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Clean Energy businesses expand across East Africa",
        description:
          "Renewable energy startups are scaling rapidly as investors seek sustainable opportunities in East Africa.",
        urlToImage:
          "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200",
        url: "#",
        source: {
          name: "Investor Mtaani",
        },
        publishedAt: new Date().toISOString(),
      },
      {
        title: "AI innovation creates new investment opportunities",
        description:
          "Artificial Intelligence startups are attracting increased attention from investors looking for scalable technology ventures.",
        urlToImage:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
        url: "#",
        source: {
          name: "Investor Mtaani",
        },
        publishedAt: new Date().toISOString(),
      },
    ];
  }
};