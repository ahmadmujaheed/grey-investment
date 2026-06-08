import apiClient from "./apiClient";

// 1. Fetch All Active/Running Investment Packages
export const fetchAllInvestments = async () => {
  const response = await apiClient.get("/investments");
  return response.data;
};

// 2. Create a New Investment Package
export const createInvestment = async (formData) => {
  const response = await apiClient.post("/investments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 3. Allocate a User and Amount to a Pool
export const allocateInvestorToPool = async (investmentId, payload) => {
  const response = await apiClient.post(`/investments/${investmentId}/allocate-investor`, payload);
  return response.data;
};

// 4. End Investment & Share Profits
export const distributeInvestmentProfits = async (investmentId, totalProfitAmount) => {
  const response = await apiClient.post(`/investments/${investmentId}/distribute-yield`, {
    totalProfit: totalProfitAmount,
  });
  return response.data;
};

// 5. ARCHIVE Investment Package (Replaces Purge/Delete)
export const archiveInvestmentPackage = async (investmentId) => {
  // Uses PATCH to update status to 'archived'
  const response = await apiClient.patch(`/investments/${investmentId}/archive`);
  return response.data;
};

// 6. FETCH Archived Investment Packages
export const fetchArchivedInvestments = async () => {
  const response = await apiClient.get("/investments/archived");
  return response.data;
};

// 7. RESTORE Archived Investment to Active
export const restoreInvestmentPackage = async (investmentId) => {
  const response = await apiClient.patch(`/investments/${investmentId}/restore`);
  return response.data;
};

// 👥 8. Fetch All Registered Platform Users
export const fetchAllUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data;
};