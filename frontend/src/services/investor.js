import api from "./api";

const createInvestor = async (investor) => {
  const response = await api.post("/investors", investor);
  return response.data;
};

const investorService = {
  createInvestor,
};

export default investorService;