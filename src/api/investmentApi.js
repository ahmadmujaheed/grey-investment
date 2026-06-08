import apiClient from "./apiClient";

// 1. Fetch All Active/Running Investment Packages (Paginated)
export const fetchAllInvestments = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/investments?page=${page}&limit=${limit}`);
  return response.data; 
  // Returns: { data: [...], currentPage, totalPages }
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

// 5. ARCHIVE Investment Package
export const archiveInvestmentPackage = async (investmentId) => {
  const response = await apiClient.patch(`/investments/${investmentId}/archive`);
  return response.data;
};

// 6. FETCH Archived Investment Packages (Paginated)
export const fetchArchivedInvestments = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/investments/archived?page=${page}&limit=${limit}`);
  return response.data;
};

// 7. RESTORE Archived Investment to Active
export const restoreInvestmentPackage = async (investmentId) => {
  const response = await apiClient.patch(`/investments/${investmentId}/restore`);
  return response.data;
};

// 8. Fetch All Registered Platform Users (Paginated & Excludes Admin)
// Ensure your backend controller filters out the admin role as discussed
export const fetchAllUsers = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
  return response.data;
};