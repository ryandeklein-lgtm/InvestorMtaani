import api from "./api";

const businessService = {

  // Get logged-in user's business
  getMyBusiness: async () => {
    const response = await api.get("/businesses/me");
    return response.data;
  },


  // Get all businesses
  getAllBusinesses: async () => {
    const response = await api.get("/businesses");
    return response.data;
  },


  // Get business by id
  getBusinessById: async (id) => {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  },


  // Create business
  createBusiness: async (businessData) => {
    const response = await api.post("/businesses", businessData);
    return response.data;
  },


  // Update business
  updateBusiness: async (id, businessData) => {
    const response = await api.put(
      `/businesses/${id}`,
      businessData
    );

    return response.data;
  },


  // Delete business
  deleteBusiness: async (id) => {
    const response = await api.delete(`/businesses/${id}`);
    return response.data;
  },

};

export default businessService;