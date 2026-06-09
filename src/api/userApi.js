import apiClient from "./apiClient";

// 👥 1. Fetch All Registered Platform Users with Aggregated Metrics
export const fetchAllUsers = async () => {
  const response = await apiClient.get("/users");
  console.log(response)
  return response.data;
};

// 👤 2. Fetch Single User Profile Workspace Node by ID
export const fetchUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

// 🆕 3. Provision a New Investor Profile
export const provisionNewUser = async (userData) => {
  // userData structure: { name, email, phone }
  const response = await apiClient.post("/users", userData);
  console.log(response);
  return response.data;
};

// 🔒 4. Change Password (First Login or Standard Security Update)
export const updateUserPassword = async (passwordPayload) => {
  // passwordPayload structure: { currentPassword, newPassword }
  const response = await apiClient.put("/users/change-password", passwordPayload);
  return response.data;
};