import apiClient from "./apiClient";

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password }
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
};

/**
 * Log in an existing user
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data; 
};

/**
 * Fetch the authenticated user's profile details using token context
 */
export const getUserProfile = async () => {
  const response = await apiClient.get("/auth/profile");
  return response.data;
};