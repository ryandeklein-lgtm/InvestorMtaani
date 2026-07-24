import api from "./api";

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  },


  // Login user
  login: async (credentials) => {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    if (response.data.token) {
      // Save JWT token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Save logged-in user details
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );
    }

    return response.data;
  },


  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },


  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },


  // Get current user
  getUser: () => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  },


  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;