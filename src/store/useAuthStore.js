import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set, get) => ({
  // Base config parameters
  // baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
   baseUrl: import.meta.env.VITE_API_BASE_URL || "https://grey-investment-server.onrender.com/api",
  
  // Auth state variables - Now pulling safely from sessionStorage
  token: sessionStorage.getItem("auth_token") || null,
  user: sessionStorage.getItem("auth_user") ? JSON.parse(sessionStorage.getItem("auth_user")) : null,
  isAuthenticated: !!sessionStorage.getItem("auth_token"),
  loading: false,


  /**
   * Fetches the current user from the server to sync state
   */
checkAuth: async () => {
  set({ loading: true });
  try {
    const res = await axios.get(`${get().baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    const user = res.data.user;
    sessionStorage.setItem("auth_user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
    return user;
  } catch (error) {
    console.error("Auth check failed:", error);
    get().logout();
    throw error;
  } finally {
    set({ loading: false });
  }
},

  /**
   * Complete login session by storing tokens and profile context in sessionStorage
   */
  setAuthSession: (token, user) => {
    if (!token) {
      console.error("setAuthSession received an undefined or null token!");
    }
    
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_user", JSON.stringify(user));
    
    set({
      token,
      user,
      isAuthenticated: !!token,
    });
  },

  /**
   * Update the cached user state properties cleanly in memory and sessionStorage
   */
  updateUserContext: (updatedUserFields) => {
    const currentSessionUser = get().user;
    const freshUserData = { ...currentSessionUser, ...updatedUserFields };
    
    sessionStorage.setItem("auth_user", JSON.stringify(freshUserData));
    set({ user: freshUserData });
  },

  /**
   * Clear the entire auth session and wipe sessionStorage details on logout
   */
  logout: () => {
    console.trace("Logout called from:");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
