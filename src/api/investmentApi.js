import apiClient from "./apiClient";

// 1. Fetch All Investment Packages
export const fetchAllInvestments = async () => {
  const response = await apiClient.get("/investments");
  return response.data;
};

// 2. Create a New Investment Package (Accepts FormData payload for Multer/Cloudinary)
export const createInvestment = async (formData) => {
  const response = await apiClient.post("/investments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 3. Allocate a User and Amount to a Pool
export const allocateInvestorToPool = async (investmentId, payload) => {
  // payload structure: { user: "USER_ID", amount: 500000 }
  const response = await apiClient.post(`/investments/${investmentId}/allocate-investor`, payload);
//   console.log(response)
  return response.data;
};

// 4. End Investment & Share Profits
export const distributeInvestmentProfits = async (investmentId, totalProfitAmount) => {
  // payload structure: { totalProfit: 150000 }
  const response = await apiClient.post(`/investments/${investmentId}/distribute-yield`, {
    totalProfit: totalProfitAmount,
  });
  console.log(response)
  return response.data;
};

// 5. Purge Investment Package from Catalog
export const deleteInvestmentPackage = async (investmentId) => {
  const response = await apiClient.delete(`/investments/${investmentId}`);
  return response.data;
};

// 👥 6. Fetch All Registered Platform Users
export const fetchAllUsers = async () => {
  // Note: Adjust the "/users" path string if your user catalog route uses a prefix like "/auth/users"
  const response = await apiClient.get("/users");
  return response.data;
};