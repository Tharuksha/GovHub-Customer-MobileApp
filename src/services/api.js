import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://govhub-backend-6375764a4f5c.herokuapp.com/api"; // Replace with your actual API URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (email, password) =>
  api.post("/customers/login", { email, password });
export const register = (userData) => api.post("/customers", userData);
export const fetchDepartments = () => api.get("/departments");
export const createTicket = (ticketData) => api.post("/tickets", ticketData);
export const getTickets = (customerId) =>
  api.get(`/tickets?customerId=${customerId}`);
export const getTicket = (ticketId) => api.get(`/tickets/${ticketId}`);
export const updateTicket = (ticketId, ticketData) =>
  api.put(`/tickets/${ticketId}`, ticketData);
export const deleteTicket = (ticketId) => api.delete(`/tickets/${ticketId}`);

export default api;
