import apiClient from "./apiClient";

/**
 * 📊 Fetch system-wide analytical metrics summaries and timeline chart data feeds
 * @returns {Promise<Object>} Processed dashboard payload mapping complete DB states
 */
export const fetchDashboardAnalytics = async () => {
  const response = await apiClient.get("/analytics/dashboard-summary");
  return response.data;
};