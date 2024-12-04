// src/services/apiService.ts
import axios from "axios";

const baseURL = "http://localhost:8000";

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Required for cookie-based JWT
});

export const signUp = async (data: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/users/signup", data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post("/users/login", data);
  return response.data;
};

export const logout = async () => {
  const response = await api.get("/users/logout");
  return response.data;
};

export default api;
