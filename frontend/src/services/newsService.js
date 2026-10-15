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
    throw error;
  }
};
