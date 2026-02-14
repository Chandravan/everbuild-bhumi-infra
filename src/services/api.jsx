import axios from "axios";

// Base URL for your backend API - Update this with your actual backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add auth token here if you implement authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response && error.response.status === 401) {
      // Agar token expire ho gaya ya galat hai, toh logout karwa do
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    if (!error.response) {
      console.error("Network problem. Check if your backend is running.");
    }

    return Promise.reject(error);
  },
);

// Truck API
export const truckAPI = {
  getAll: () => api.get("/trucks"),
  getById: (id) => api.get(`/trucks/${id}`),
  create: (data) => api.post("/trucks/create", data),
  update: (id, data) => api.put(`/trucks/${id}`, data),
  delete: (id) => api.delete(`/trucks/${id}`),
};

// Driver API
export const driverAPI = {
  getAll: () => api.get("/drivers"),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post("/drivers/create", data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

// Trip API
export const tripAPI = {
  getAll: () => api.get("/trips"),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post("/trips/create", data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  //getStats: () => api.get("/trips/stats"),
  totalProfit: () => api.get("/trips/total-profit"),
  totalByPartner: () => api.get("/trips/total-by-partner"),
  totalDue: () => api.get("/trips/total-due"),
};

export const locationAPI = {
  getAll: () => api.get("/location"),
};

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
};

export const dueAPI = {
  totalDue: () => api.get("/trips/total-due"),
  getDuePayments: () => api.get("/due/due-payments"),
  markAsPaid: (id) => api.put(`/due/mark-paid/${id}`),
};

export default api;
